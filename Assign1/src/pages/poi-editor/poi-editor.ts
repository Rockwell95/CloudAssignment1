import { Component } from '@angular/core';
import {NavController, NavParams, ViewController} from 'ionic-angular';

@Component({
  selector: 'poi-editor',
  templateUrl: 'poi-editor.html'
})
export class PoiEditorPage {
  placeOfInterest: any;

  constructor(public navCtrl: NavController, public navParams: NavParams, private viewCtrl: ViewController) {
    this.placeOfInterest = navParams.get('place');
    this.placeOfInterest.coords = "( " + this.placeOfInterest.latitude + ", " + this.placeOfInterest.longitude + " )";
  }

  dismiss(data) {
    this.viewCtrl.dismiss(data);
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad PlaceOfInterestPage');
  }

}
