import { Component } from '@angular/core';
import { Map, latLng, tileLayer, Layer, marker, geoJson, leaflet, icon, iconShadow } from 'leaflet';
import { Geolocation } from '@ionic-native/geolocation/ngx';
import { ToastController } from '@ionic/angular';
import { CallNumber } from '@ionic-native/call-number/ngx';
import L from 'leaflet';

declare var arica;

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  fono: any = "+56 9";
  showFono: any = "+56 9";
  desc_cuadrante: any = "Desconocido";
  person: any = "Sin identificación";
  comisaria: any = "Ninguna comisaría asociada";
  map: Map;
  lat: any;
  lng: any;
  id: any;
  cuadrante: any;
  polygon: any;

  constructor(private geolocation: Geolocation,
  public toastController: ToastController,
  private callNumber: CallNumber) {

  }

  buttonClick(number: String){
    console.log('Calling '+number);
    this.callNumber.callNumber(this.fono, true)
      .then(res => console.log('Launched dialer!', res))
      .catch(err => console.log('Error launching dialer', err));
  }

  ionViewDidEnter(){

    let mapboxAccessToken = 'pk.eyJ1Ijoic3VwZXJzYngwMCIsImEiOiJjaWpsZ3FsN3QwMDIydGhtNTh4aGhubG5xIn0.i2J0k0mBZhIi7W-bsPTJiQ';

    this.map = new Map('map').setView([-18.5, -70], 12);
    //L.marker([this.lat, this.lng]).addTo(this.map);

    tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=' + mapboxAccessToken, {
        id: 'mapbox.light'
    }).addTo(this.map);

    let geojson = geoJson(arica, {
      style: this.style,
    }).addTo(this.map);

    geojson.on('click',(feature:any)=>{
      let prop = feature.sourceTarget.feature.properties;
      this.setData(prop);
      arica.features.forEach(element => {
        let matrix = [];
        if(element.properties.id == prop.id){
          /* Se invierten lat y lng */
          element.geometry.coordinates.forEach(element => {
            element.forEach(element => {
              element.forEach(element => {
                let aux;
                aux = element[0];
                element[0] = element[1];
                element[1] = aux;
                matrix.push(element);
              });
            });
          });
          this.map.setView([feature.latlng.lat, feature.latlng.lng], 13);
        }
      });
    });

    this.geolocation.getCurrentPosition().then((resp) => {
      this.lat = resp.coords.latitude;
      this.lng = resp.coords.longitude;
      console.log(this.lat, this.lng);
      this.cuadrante = this.getCuadrante(this.lat, this.lng)
      this.setData(this.cuadrante);

      this.drawPolygon(this.id);

     }).catch((error) => {
       console.log('Error getting location', error);
     });
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

  async presentToast(msg) {
    const toast = await this.toastController.create({
      message: msg,
      duration: 2000
    });
    toast.present();
  }

  /*
  @Function: getCuadrante
    La función obtiene el cuadrante asociado a la posición actual del usuario

  @Params:
    lat: Latitud actual del usuario
    lng: Longitud actual del usuario

  @Return: Object
    La función retorna el objto cuadrante asociado a la posición actual del usuario
  */
  getCuadrante(lat, lng){
    let cuadrante: any;
    arica.features.forEach(element => {
      if(this.pointInPolygon(element.geometry.coordinates[0][0].length, element.geometry.coordinates[0][0] ,lat, lng)){
        cuadrante = element.properties;
      }
    });
    return cuadrante;
  }
  /*
  @Function: setData
    La función llena los datos correspondiente a la descripción del cuadrante, número de telefono y la comisaría

  @Params:
    cuadrante: Objeto que tiene todas las carácteristicas de un cuadrante
  */
  setData(cuadrante){
    console.log(cuadrante.cua_descri);
    this.desc_cuadrante = cuadrante.cua_descri;
    this.fono = cuadrante.num_cuadrante;
    if(this.fono){
      this.showFono = this.prettyPhone(this.fono);
    } else {
      this.showFono = "No hay número asociado";
    }
    this.comisaria = cuadrante.unidad;
    this.id = cuadrante.id
  }
  /*
  @Function: pointInPolygon
    La función busca si los puntos de referencia están dentro de un polígono

  @Params:
    nvert: número de vértices
    coords: latitud y longitud del cuadrante
    refLat: Latitud de posición actual
    refLng: Longitud de posición actual

  @Return: Boolean
    La función retorna verdadero o falso dependiendo si el punto se encuentra
    dentro del polígono
  */
  pointInPolygon(nvert, coords, refLat, refLng){
    let i, j, c=false;
    for(i=0, j=nvert-1; i<nvert; j=i++){
      if (((coords[i][1] > refLat) != (coords[j][1] > refLat)) && (refLng < (coords[j][0] - coords[i][0]) * (refLat - coords[i][1]) / (coords[j][1] - coords[i][1]) + coords[i][0])){
        c = !c;
      }
    }
    return c;
  }
  /*
  @Function: drawPolygon
    La función dibuja un polígono en el mapa correspondiente al cuadrante actual del usuario dado el id del cuadrante

  @Params:
    id: Corresponde a la identificación del cuadrante correspondiente a la posición del usuario
  */
  drawPolygon(id){
    arica.features.forEach(element => {
      let matrix = [];
      if(element.properties.id == id){
        /* Se invierten lat y lng */
        element.geometry.coordinates.forEach(element => {
          element.forEach(element => {
            element.forEach(element => {
              let aux;
              aux = element[0];
              element[0] = element[1];
              element[1] = aux;
              matrix.push(element);
            });
          });
        });
        this.polygon = L.polygon(matrix);
        this.polygon.addTo(this.map);
        this.polygon.bindTooltip(element.properties.cua_descri, {permanent: true, direction:"center"}).openTooltip();
        this.map.setView([this.lat, this.lng], 13);
      }
    });
  }

  prettyPhone(fono: String){
    var input = fono.toString();
    return '+56 '+ input.substr(0,1)+' '+input.substr(1,4)+' '+input.substr(5,4);
  }
}
