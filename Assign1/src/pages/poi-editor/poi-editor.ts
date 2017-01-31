import { Component } from '@angular/core';
import {NavController, NavParams, ViewController} from 'ionic-angular';

@Component({
  selector: 'poi-editor',
  templateUrl: 'poi-editor.html'
})
export class PoiEditorPage {
  placeOfInterest: any;

  // Initialize bookmark editor page.
  constructor(public navCtrl: NavController, public navParams: NavParams, private viewCtrl: ViewController) {
    this.placeOfInterest = navParams.get('place');
    this.placeOfInterest.coords = "( " + this.placeOfInterest.latitude + ", " + this.placeOfInterest.longitude + " )";
  }

  // Closes dialogue and returns contents to caller
  dismiss(data) {
    this.viewCtrl.dismiss(data);
  }

  // Stub to indicate successful page load.
  ionViewDidLoad() {
    console.log('ionViewDidLoad PlaceOfInterestPage');
  }

}
