import React, {Component} from 'react';

export default class ShowMap extends Component {
    constructor(props) {
        super(props);
        this.state={
            lng:this.props.lng,
            lat:this.props.lat
        }
    }

    componentDidMount() {
        this.initMap();
    }

    initMap(){
        let {lng,lat}=this.state;
        const el=ReactDOM.findDOMNode(this);
        if (!el){return;}
        const divMap=el.querySelector('.map');
        const GuangZhou={
            lat:23.136683927297444,
            lng:113.35663921777336};
        var center=GuangZhou;
        if (lng&&lat){
            center.lng=lng
            center.lat=lat
        }
        var zoom=12;
        var map=L.map(divMap,{
            center:[center.lat,center.lng],
            zoom:zoom,
            attributionControl:false
        });
        var tilePrefix='/g25_static_tiles';
        if(/\:\/\/(localhost|vm)/i.test(location.href)){
	    tilePrefix = '//132.96.38.20' + tilePrefix;}
        else if(/10\.117\.\d+\.\d+/.test(location.href)){
            tilePrefix='//132.96.38.20'+tilePrefix;
        }else{
            tilePrefix='//gm.gz.gd.unicom.local'+tilePrefix
        }
        const baseLayerUrls = [tilePrefix + '/tianditu/{z}/{x}/{y}/w.png',
                               tilePrefix + '/tianditu_labels/{z}/{x}/{y}/w.png'];
        	    baseLayerUrls.forEach((url) => {let layer = L.tileLayer(url, {}).addTo(map);});
	    this.map = map;
	    	    var marker = L.marker([center.lat, center.lng], {
	        draggable: false}).addTo(map);
	    this.marker = marker;
	    map.on('zoomstart', () => { marker.setOpacity(0); });
	    map.on('zoomend', () => { marker.setOpacity(1); });
    }

  render() {
      return(<div className='full-page-content'>
                <div className='map'></div>
          </div>
      )
  }
}