import { Component } from '@angular/core';
import { Map, latLng, tileLayer, Layer, marker, geoJson } from 'leaflet';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { ToastController } from '@ionic/angular';
import { CallNumber } from '@ionic-native/call-number/ngx';

declare var arica;

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  constructor(
    private geolocation: Geolocation,
    public toastController: ToastController,
    private callNumber: CallNumber) {}

  fono: any = "+56 9 8428 8328";
  cuadrante: any = "3";
  person: any = "Cpt. Rodrigo Salzar Ortega";
  comisaria: any = "1° Camisaría Arica";
  map: Map;

  buttonClick(number: String){
    console.log('Calling '+number);
    this.callNumber.callNumber("976984541", true)
      .then(res => console.log('Launched dialer!', res))
      .catch(err => console.log('Error launching dialer', err));
  }

  ionViewDidEnter(){
    console.log(arica);
    let mapboxAccessToken = 'pk.eyJ1Ijoic3VwZXJzYngwMCIsImEiOiJjaWpsZ3FsN3QwMDIydGhtNTh4aGhubG5xIn0.i2J0k0mBZhIi7W-bsPTJiQ';

    this.map = new Map('map').setView([-18.5, -70], 8);

    tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=' + mapboxAccessToken, {
        id: 'mapbox.light'
    }).addTo(this.map);

    let geojson = geoJson(arica, {
      style: this.style,
    }).addTo(this.map);

    this.geolocation.getCurrentPosition().then((resp) => {
     console.log(resp.coords.latitude);
     console.log(resp.coords.longitude);
     this.presentToast("lat: "+resp.coords.latitude+" lon: "+resp.coords.longitude);
    }).catch((error) => {
      console.log('Error getting location', error);
    });


  }

  style(feature) {
    console.log();
    return {
      fillColor: '#cfc',
      weight: 0.8,
      opacity: 0.5,
      color: 'darkgreen',
      dashArray: '0',
      fillOpacity: 0
    };
  }

  async presentToast(msg) {
    const toast = await this.toastController.create({
      message: msg,
      duration: 2000
    });
    toast.present();
  }
}
