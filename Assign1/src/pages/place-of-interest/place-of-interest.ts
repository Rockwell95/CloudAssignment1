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

  dismiss(data) {
    this.viewCtrl.dismiss(data);
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad PlaceOfInterestPage');
  }

  tick(){
    let offset = new Date().getTimezoneOffset() * 60000;
    this.placeOfInterest.time = new Date(Date.now() - offset).toISOString();
  };

}
