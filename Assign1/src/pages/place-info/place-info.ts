///<reference path="../../../typings/globals/google.maps/index.d.ts"/>
import { Component } from '@angular/core';
import {NavController, NavParams, ModalController, AlertController} from 'ionic-angular';
import GeocoderStatus = google.maps.GeocoderStatus;
import {DataService} from "../../providers/data-service";
import {PoiEditorPage} from "../poi-editor/poi-editor";

@Component({
  selector: 'page-place-info',
  templateUrl: 'place-info.html'
})
export class PlaceInfoPage {

  place: any;
  address: string;
  coords: string;
  parsedTime: Date;
  disabled: boolean;
  mapsUrl: string;
  key: string;

  constructor(public navCtrl: NavController, public navParams: NavParams, private _data: DataService, private modalCtrl: ModalController, private alertCtrl: AlertController) {
    this.place = navParams.data.data;
    this.key = navParams.data.key;
    this.address = "Calculating...";
    this.coords = "( " + this.place.latitude + ", " + this.place.longitude + " )";
    this.parsedTime = new Date(Date.parse(this.place.time));
    this.disabled = true;
    this.mapsUrl = "https://www.google.com/maps/place/" + this.place.latitude + "," + this.place.longitude;

    let geocoder = new google.maps.Geocoder;

    this.reverseGeocode(this.place, geocoder);
  }

  private reverseGeocode(place: any, geocoder: google.maps.Geocoder) {
    let latLng = {lat: parseFloat(place.latitude), lng: parseFloat(place.longitude)};

    geocoder.geocode({'location':latLng}, (results, status) => {
      if (status === GeocoderStatus.OK) {
        if (results[1]) {
          this.address = results[1].formatted_address;
        } else {
          this.address = "N/A"
        }
      } else {
        this.address = "Geocoder Error. Please check your internet connection"
      }
    });
  }

  private editDetails(){
    let ref = this._data.db.ref('places');
    ref.orderByKey().equalTo(this.key).on("child_added", (data) => {
      console.log(data.val());

      let placeOfInterestModal = this.modalCtrl.create(PoiEditorPage, {place: this.place});

      placeOfInterestModal.onDidDismiss(data => {
        console.log(data);

        if (data !== null) {
          let formattedDate: Date = new Date(Date.parse(data.time));
          let latLng = data.coords.split(',');
          let lat = latLng[0].substr(1);
          let long = latLng[1].substr(0, latLng[1].length - 1);

          let poiEntry = {
            title: data.title ? data.title : "N/A",
            time: data.time,
            level: data.level,
            comments: data.comments ? data.comments : "",
            latitude: lat,
            longitude: long,
            date: formattedDate
          };

          let updates = {};
          updates['/places/' + this.key] = poiEntry;

          // Saves places of interest to Database
          this._data.db.ref().update(updates).then(() => {
            console.log("Successfully updated!")
          }).catch((error) => {
            console.warn("Cannot update:", error);
          });
          this.navCtrl.pop();
        }

      });

      placeOfInterestModal.present();
    })
  }

  private deletThis(){
    let confirm = this.alertCtrl.create({
      title: 'Confirm Delete',
      message: 'Are you sure you want to delete "' + this.place.title + '"? This cannot be undone.',
      buttons: [
        {
          text: 'Cancel',
          handler: () => {
            console.log('Delete Cancelled');
          }
        },
        {
          text: 'Confirm',
          handler: () => {
            console.log('Deleting...');
            let ref = this._data.db.ref('places');
            ref.child(this.key).remove().then(() => {
              console.log('Deleted');
            }).catch((error) => {
              console.warn("Removal failed:", error.message)
            });

            this.navCtrl.pop();
          }
        }
      ]
    });
    confirm.present();
  }
}
