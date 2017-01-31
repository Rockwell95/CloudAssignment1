
import { Component } from '@angular/core';

import { NavController } from 'ionic-angular';
import {DataService} from "../../providers/data-service";
import {PlaceInfoPage} from "../place-info/place-info";

@Component({
  selector: 'page-about',
  templateUrl: 'poi.html'
})
export class POIPage {

  pois: any;
  poiKeys: Array<string>;

  constructor(public navCtrl: NavController, private _data: DataService) {
    _data.db.ref('places').on('value', (data) => {
      // Retrieve places of interest
      this.pois = data.val();

      // Retrieve keys for places of interest (Firebase uses object with members rather than an array)
      this.poiKeys = Object.keys(this.pois);
    })
  }

  // Opens page with more info on selected bookmark.
  private moreInfo(key: string){
    this.navCtrl.push(PlaceInfoPage, {key: key, data: this.pois[key]});
  }

}
