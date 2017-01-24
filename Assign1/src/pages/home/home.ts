///<reference path="../../../typings/globals/google.maps/index.d.ts"/>

import {Component, ViewChild, ElementRef} from '@angular/core';

import {NavController, ModalController} from 'ionic-angular';

import {Geolocation} from 'ionic-native';
import {PlaceOfInterestPage} from "../place-of-interest/place-of-interest";
import {DataService} from "../../providers/data-service";

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  @ViewChild('map') mapElement: ElementRef;

  incidentArray: Array<any>;
  arrayOfDBKeys: Array<string>;
  map: any;
  markerCount: number;

  constructor(public navCtrl: NavController, private modalCtrl: ModalController, private _data: DataService) {
    // TODO: Retrieve objects from Database
    this.markerCount = 0;

    let options = {timeout: 10000, enableHighAccuracy: true};

    Geolocation.getCurrentPosition(options).then((position) => {

      console.log("Got current position: ", position);

      let latLng = new google.maps.LatLng(position.coords.latitude, position.coords.longitude);

      let mapOptions = {
        center: latLng,
        zoom: 15,
        mapTypeId: google.maps.MapTypeId.ROADMAP
      };

      this.map = new google.maps.Map(this.mapElement.nativeElement, mapOptions);


      //Wait until the map is loaded
      google.maps.event.addListenerOnce(this.map, 'idle', () => {
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
      });

      //addStations();
    }, (error) => {
      console.log(error);
    });
  }

  private loadPlaces() {
    this._data.db.ref("places").on('value', (data) => {
      this.incidentArray = data.val();
      console.log(this.incidentArray);
      this.arrayOfDBKeys = Object.keys(this.incidentArray);

      for(let key of this.arrayOfDBKeys){
        let offset: number = new Date().getTimezoneOffset() * 60000;
        let formatDate: Date = new Date(Date.parse(this.incidentArray[key].time) + offset);
        let markup = "<b>What's here?</b> " + this.incidentArray[key].title + "<br>" + "<b>Date Added:</b> " + formatDate + "<br>" + "<b>Interest Level:</b> " + this.incidentArray[key].level + "<br>" + "<b>Comments:</b> " + this.incidentArray[key].comments + "<br>";
        this.addMarkerToMap(this.incidentArray[key].latitude, this.incidentArray[key].longitude, markup);
      }

      console.log(data.val());
    });
  }

  reportEvent(){
    let placeOfInterestModal = this.modalCtrl.create(PlaceOfInterestPage, {map: this.map});

    placeOfInterestModal.onDidDismiss(data => {
      console.log(data);

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

    });

    placeOfInterestModal.present();
  }

  addMarkerToMap(lat, long, htmlMarkupForInfoWindow) {
    let infowindow = new google.maps.InfoWindow();
    let myLatLng = new google.maps.LatLng(lat, long);
    let marker = new google.maps.Marker({
      position: myLatLng,
      map: this.map,
      animation: google.maps.Animation.DROP,
      icon: '../../assets/icon/star.png'
    });

    //Gives each marker an Id for the onClick
    this.markerCount++;

    //Creates the event listener for clicking the marker
    // and places the marker on the map
    google.maps.event.addListener(marker, 'click', ((marker, markerCount) => {
      return () => {
        infowindow.setContent(htmlMarkupForInfoWindow);
        infowindow.open(this.map, marker);
      }
    })(marker, this.markerCount));
    //Pans map to the new location of the marker
    this.map.panTo(myLatLng); //- See more at: https://www.sundoginteractive.com/blog/working-with-dynamic-markers-in-google-maps-js-api#sthash.EhLN75wB.dpuf
  }
}
