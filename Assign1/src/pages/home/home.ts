///<reference path="../../../typings/globals/google.maps/index.d.ts"/>
///<reference path="../../../typings/globals/jquery/index.d.ts"/>
import {Component, ViewChild, ElementRef, DoCheck} from "@angular/core";
import {NavController, ModalController} from "ionic-angular";
import {Geolocation} from "ionic-native";
import {PlaceOfInterestPage} from "../place-of-interest/place-of-interest";
import {DataService} from "../../providers/data-service";
import {map} from "rxjs/operator/map";

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage implements DoCheck {

  // Sets a watcher on a radio button to change the filter type on Places Autocomplete
  ngDoCheck(): void {
    let searchParams = [];
    if (this.searchType !== "") {
      searchParams = [this.searchType];
    }

    if (this.autocomplete) {
      this.autocomplete.setTypes(searchParams);
    }
  }

  @ViewChild('map') mapElement: ElementRef;

  placesArray: Array<any>;
  arrayOfDBKeys: Array<string>;
  map: any;
  markerCount: number;
  autocomplete: any;
  markers: Array<google.maps.Marker>;

  //Search Bar Variables
  queryLocation: string;
  searchType: string;
  strictBounds: boolean;
  hideSearch: boolean;
  searchButtonString: string;
  additionsEnabled: boolean;

  // Initialize page.
  constructor(public navCtrl: NavController, private modalCtrl: ModalController, private _data: DataService) {
    this.markerCount = 0;

    this.searchType = "";
    this.hideSearch = true;
    this.searchButtonString = "Search";
    this.markers = [];
    this.additionsEnabled = false;

    let options = {timeout: 10000, enableHighAccuracy: true};

    // Initialize map
    Geolocation.getCurrentPosition(options).then((position) => {

      console.log("Got current position: ", position);

      // Allows users to being adding points of interest once the map is loaded.
      this.additionsEnabled = true;

      let latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

      let mapOptions = {
        center: latLng,
        zoom: 15,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      };

      this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);


      //Wait until the map is loaded
      google.maps.event.addListenerOnce(this.map, 'idle', () => {

        // Retrieve from the database.
        this.loadPlaces();

        let marker = new google.maps.Marker({
          map: this.map,
          animation: google.maps.Animation.DROP,
          position: latLng
        });

        let crosshairShape = {coords: [0, 0, 0, 0], type: 'rect'};


        // Move map around to centre threat
        let crosshairMarker = new google.maps.Marker({
          position: this.map.getCenter(),
          map: this.map,
          icon: 'https://www.daftlogic.com/images/cross-hairs.gif',
          shape: crosshairShape
        });

        crosshairMarker.bindTo('position', this.map, 'center');

        let infoWindow = new google.maps.InfoWindow({
          content: "Your location"
        });

        google.maps.event.addListener(marker, 'click', () => {
          infoWindow.open(this.map, marker);
        });

        this.autocompleteSetup();
      });

      //addStations();
    }, (error) => {
      console.log(error);
    });
  }

  // Retrieves already saved bookmarks from Firebase
  private loadPlaces() {
    this._data.db.ref("places").on('value', (data) => {
      this.placesArray = data.val();
      // console.log(this.placesArray);
      this.arrayOfDBKeys = Object.keys(this.placesArray);

      for (let key of this.arrayOfDBKeys) {
        let offset: number = new Date().getTimezoneOffset() * 60000;
        let formatDate: Date = new Date(Date.parse(this.placesArray[key].time) + offset);
        let markup = "<b>What's here?</b> " + this.placesArray[key].title + "<br>" + "<b>Date Added:</b> " + formatDate + "<br>" + "<b>Interest Level:</b> " + this.placesArray[key].level + "<br>" + "<b>Comments:</b> " + this.placesArray[key].comments + "<br>";
        this.addMarkerToMap(this.placesArray[key].latitude, this.placesArray[key].longitude, markup);
      }

    });
  }

  // Opens new bookmark window to add a marker, and when finished, saves it to Firebase.
  createBookmark() {
    let placeOfInterestModal = this.modalCtrl.create(PlaceOfInterestPage, {map: this.map});

    placeOfInterestModal.onDidDismiss(data => {
      console.log(data);

      if (data !== null) {
        let offset: number = new Date().getTimezoneOffset() * 60000;
        let formattedDate: Date = new Date(Date.parse(data.time) + offset);
        let incidentString = "<b>What's here?</b> " + data.title + "<br>" + "<b>Date Added:</b> " + formattedDate + "<br>" + "<b>Interest Level:</b> " + data.levelOfInterest + "<br>" + "<b>Comments:</b> " + data.comments + "<br>";
        let latLng = data.coords.split(',');
        let lat = latLng[0].substr(1);
        let long = latLng[1].substr(0, latLng[1].length - 1);
        this.addMarkerToMap(lat, long, incidentString);

        let poiEntry = {
          title: data.title ? data.title : "N/A",
          time: data.time,
          level: data.levelOfInterest,
          comments: data.comments ? data.comments : "",
          latitude: lat,
          longitude: long,
          date: formattedDate
        };

        // Saves places of interest to Database
        this._data.db.ref('places').push(poiEntry);
      }

    });

    placeOfInterestModal.present();
  }

  // Creates and adds a new marker and info window to the map (when a bookmark is created)
  addMarkerToMap(lat, long, htmlMarkupForInfoWindow) {
    let infowindow = new google.maps.InfoWindow();
    let myLatLng = new google.maps.LatLng(lat, long);
    let marker = new google.maps.Marker({
      position: myLatLng,
      map: this.map,
      animation: google.maps.Animation.DROP,
      icon: 'https://firebasestorage.googleapis.com/v0/b/sofe4870assign1.appspot.com/o/star.png?alt=media&token=34d17d9d-b7a9-4b2c-a634-c6aa03d6fe57'
    });

    //Gives each marker an Id for the onClick
    this.markers.push(marker);
    this.markerCount++;

    //Creates the event listener for clicking the marker
    // and places the marker on the map
    google.maps.event.addListener(marker, 'click', ((marker, markerCount) => {
      return () => {
        infowindow.setContent(htmlMarkupForInfoWindow);
        infowindow.open(this.map, marker);
      }
    })(marker, this.markerCount));
  }

  // Toggles the autocomplete search bar.
  toggleSearch() {
    this.hideSearch = !this.hideSearch;
  }

  // Initialize the autocomplete search bar.
  autocompleteSetup() {
    let card = document.getElementById("header");
    let input = <HTMLInputElement>document.getElementById("input").children[0];

    // console.log(input);

    //Prebuilt form for the autocomplete results info window.
    let infoWindowMarkup: string =
      ('<div id="infowindow-content">' +
      '<img src="" width="16" height="16" id="place-icon"> ' +
      '<span id="place-name"  class="title"></span><br> ' +
      '<span id="place-address"></span> ' +
      '</div>');

    let parser = new DOMParser();
    let markedup = parser.parseFromString(infoWindowMarkup, 'text/html');

    //this.map.controls[google.maps.ControlPosition.TOP_RIGHT].push(card);

    let autocomplete = new google.maps.places.Autocomplete(input);

    // Bind the map's bounds (viewport) property to the autocomplete object,
    // so that the autocomplete requests use the current map bounds for the
    // bounds option in the request.
    autocomplete.bindTo('bounds', this.map);

    // Constructs infoWindow at search result.
    let infowindow = new google.maps.InfoWindow();
    let infowindowContent: HTMLElement = markedup.getElementById('infowindow-content');
    infowindow.setContent(infowindowContent);
    let marker = new google.maps.Marker({
      position: this.map.getCenter(),
      map: this.map,
      anchorPoint: new google.maps.Point(0, -29)
    });


    autocomplete.addListener('place_changed', () => {
      infowindow.close();
      marker.setVisible(false);
      let place = autocomplete.getPlace();
      if (!place.geometry) {
        // User entered the name of a Place that was not suggested and
        // pressed the Enter key, or the Place Details request failed.
        window.alert("No details available for input: '" + place.name + "'");
        return;
      }

      // console.log(this.map);

      // If the place has a geometry, then present it on a map.
      if (place.geometry.viewport) {
        this.map.fitBounds(place.geometry.viewport);
      } else {
        this.map.setCenter(place.geometry.location);
        this.map.setZoom(17);  // Why 17? Because it looks good.
      }
      marker.setPosition(place.geometry.location);
      marker.setVisible(true);

      let address = '';
      if (place.address_components) {
        address = [
          (place.address_components[0] && place.address_components[0].short_name || ''),
          (place.address_components[1] && place.address_components[1].short_name || ''),
          (place.address_components[2] && place.address_components[2].short_name || '')
        ].join(' ');
      }

      infowindowContent.children['place-icon'].src = place.icon;
      infowindowContent.children['place-name'].textContent = place.name;
      infowindowContent.children['place-address'].textContent = address;
      infowindow.open(this.map, marker);
    });

    this.autocomplete = autocomplete;

    // Sets whether to use strict search bounds or not.
    (<any>autocomplete).setOptions({strictBounds: this.strictBounds});
  }

  // Executes immediately after this view is entered.
  ionViewDidEnter() {
    console.log('ionViewDidLoad HomePage');
    if(this.map){
      this.deleteMarkers();
      this.loadPlaces();

    }
  }

  // Sets all markers on map
  setMapOnAll(map) {
    for (let i = 0; i < this.markers.length; i++) {
      this.markers[i].setMap(map);
    }
  }

  // Removes the markers from the map, but keeps them in the array.
  clearMarkers() {
    this.setMapOnAll(null);
  }

// Deletes all markers in the array by removing references to them.
  deleteMarkers() {
    this.clearMarkers();
    this.markers = [];
  }

  // opens link to Google Static Maps Image
  saveMap(){
    let staticMap = document.createElement("img");
    let staticMapUrl = "https://maps.googleapis.com/maps/api/staticmap?";
    let staticUrlAppend = "center=" + this.map.getCenter().lat() + "," + this.map.getCenter().lng();
    for(let marker of this.markers){
      staticUrlAppend += "&markers=color:blue%7C" + marker.getPosition().lat() + "," + marker.getPosition().lng();
    }

    staticUrlAppend += "&zoom=" + (this.map.getZoom() - 1) + "&size=640x300&scale=2&key=AIzaSyBo4xOAhH65gf7eC1NPSB3E9XkobRUx7TQ";

    let imageLink = staticMapUrl + staticUrlAppend;
    window.open(imageLink, "_blank");
  }
}
