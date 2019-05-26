import { Component } from '@angular/core';
import { Map, latLng, tileLayer, Layer, marker, geoJson, leaflet, icon, iconShadow} from 'leaflet';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import L from 'leaflet';
import { analyzeAndValidateNgModules } from '@angular/compiler';

//import icon from 'leaflet/dist/images/marker-icon.png';
//import iconShadow from 'leaflet/dist/images/marker-shadow.png';




declare var arica;

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  fono: any = "+56 9 8428 8328";
  cuadrante: any = "3";
  person: any = "Cpt. Rodrigo Salzar Ortega";
  comisaria: any = "1° Camisaría Arica";
  map: Map;
  lat: any;
  lng: any;
  id: any;

  constructor(private geolocation: Geolocation) {
    this.geolocation.getCurrentPosition().then((resp) => {
      this.lat = resp.coords.latitude;
      this.lng = resp.coords.longitude;
      this.getCuadrante(this.lat, this.lng);
  
      
     }).catch((error) => {
       console.log('Error getting location', error);
     });
  }

  buttonClick(number: String){
    console.log('Calling '+number);
  }

  ionViewDidEnter(){
    
    let mapboxAccessToken = 'pk.eyJ1Ijoic3VwZXJzYngwMCIsImEiOiJjaWpsZ3FsN3QwMDIydGhtNTh4aGhubG5xIn0.i2J0k0mBZhIi7W-bsPTJiQ';

    this.map = new Map('map').setView([-18.5, -70], 12);
    this.drawPolygon(this.id);
    //L.marker([this.lat, this.lng]).addTo(this.map);
    
    tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=' + mapboxAccessToken, {
        id: 'mapbox.light'
    }).addTo(this.map);

    let geojson = geoJson(arica, {
      style: this.style,
    }).addTo(this.map);

  }

  style(feature) {
    return {
      fillColor: '#cfc',
      weight: 0.8,
      opacity: 0.5,
      color: 'darkgreen',
      dashArray: '0',
      fillOpacity: 0
    };
  }

  getCuadrante(lat, lng){
    arica.features.forEach(element => {
      if(this.pointInPolygon(element.geometry.coordinates[0][0].length, element.geometry.coordinates[0][0] ,lat, lng)){
        this.fono = element.properties.num_cuadrante;
        this.comisaria = element.properties.unidad;
        this. id = element.properties.id;
      }
    });
  }

  pointInPolygon(nvert, coords, refLat, refLng){
    let i, j, c=false;
    for(i=0, j=nvert-1; i<nvert; j=i++){
      if (((coords[i][1] > refLat) != (coords[j][1] > refLat)) && (refLng < (coords[j][0] - coords[i][0]) * (refLat - coords[i][1]) / (coords[j][1] - coords[i][1]) + coords[i][0])){
        c = !c;
      }
        
    }
    return c;
  }

  drawPolygon(id){
    arica.features.forEach(element => {
      let matrix = [];

      if(element.properties.id == id){
        console.log(element.geometry.coordinates[0][0][80]);
        this.map.setView(element.geometry.coordinates[0][0][80], 12);
        element.geometry.coordinates.forEach(element => {
          matrix.push(element);
        });

        //L.polygon([matrix]).addTo(this.map);



        
      }
    });
  }

}
