import {Injectable} from "@angular/core";
import "rxjs/add/operator/map";
import firebase from "firebase";

/*
 Generated class for the DataService provider.

 See https://angular.io/docs/ts/latest/guide/dependency-injection.html
 for more info on providers and Angular 2 DI.
 */
@Injectable()
export class DataService {

  public db: any;
  public placesOfInterest: any;

  constructor() {
  }

  init() {

    const firebaseConfig = {
      apiKey: "AIzaSyDS2eZNqNvJPt5Apx1tg_MKg92UjAqrV6I",
      authDomain: "sofe4870assign1.firebaseapp.com",
      databaseURL: "https://sofe4870assign1.firebaseio.com",
      storageBucket: "sofe4870assign1.appspot.com",
      messagingSenderId: "75785429058"
    };

    firebase.initializeApp(firebaseConfig);

    firebase.auth().signInWithEmailAndPassword("dominick.mancini@uoit.net", "test123").catch((error) => {
      // Handle Errors here.
      let errorMessage = error.message;
      console.error("ERR:", errorMessage);
      // ...
    });

    this.db = firebase.database();

    this.db.ref('places').on('value', (data) => {
      console.log(data.val());
    }, (error) => {
      console.warn(error);
    })
  }

}
