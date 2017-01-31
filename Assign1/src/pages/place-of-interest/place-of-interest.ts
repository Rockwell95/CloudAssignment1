import { Component } from '@angular/core';
import {NavController, NavParams, ViewController} from 'ionic-angular';

@Component({
  selector: 'page-place-of-interest',
  templateUrl: 'place-of-interest.html'
})
export class PlaceOfInterestPage {
  map: any;
  placeOfInterest: any;
  clock: number;

  // Initialize this page.
  constructor(public navCtrl: NavController, public navParams: NavParams, private viewCtrl: ViewController) {
    this.map = navParams.get('map');
    this.placeOfInterest = {
      levelOfInterest: 0,
      coords: this.map.getCenter().toString(),
      time: "1969-12-31T19:00:00-05:00"
    };

    this.clock = new Date().getTime();

    console.log("Time: ", this.clock);


    setInterval(() => {
      this.tick();
    }, 1000)
  }

  // Closes create dialogue, and returns dialogue data to the call that initialized the dialogue
  dismiss(data) {
    this.viewCtrl.dismiss(data);
  }

  // Stub to indicate successful load.
  ionViewDidLoad() {
    console.log('ionViewDidLoad PlaceOfInterestPage');
  }

  // Increments time listed on "Create Place of Interest" window.
  tick(){
    let offset = new Date().getTimezoneOffset() * 60000;
    this.placeOfInterest.time = new Date(Date.now() - offset).toISOString();
  };

}
