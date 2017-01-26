import {NgModule, ErrorHandler} from "@angular/core";
import {IonicApp, IonicModule, IonicErrorHandler} from "ionic-angular";
import {MyApp} from "./app.component";
import {ContactPage} from "../pages/contact/contact";
import {HomePage} from "../pages/home/home";
import {TabsPage} from "../pages/tabs/tabs";
import {PlaceOfInterestPage} from "../pages/place-of-interest/place-of-interest";
import {DataService} from "../providers/data-service";
import {POIPage} from "../pages/poi/poi";
import {PlaceInfoPage} from "../pages/place-info/place-info";
import {PoiEditorPage} from "../pages/poi-editor/poi-editor";

@NgModule({
  declarations: [
    MyApp,
    POIPage,
    ContactPage,
    HomePage,
    TabsPage,
    PlaceOfInterestPage,
    PlaceInfoPage,
    PoiEditorPage
  ],
  imports: [
    IonicModule.forRoot(MyApp)
  ],
  bootstrap: [IonicApp],
  entryComponents: [
    MyApp,
    POIPage,
    ContactPage,
    HomePage,
    TabsPage,
    PlaceOfInterestPage,
    PlaceInfoPage,
    PoiEditorPage
  ],
  providers: [
    {provide: ErrorHandler, useClass: IonicErrorHandler},
    DataService
  ]
})
export class AppModule {
}
