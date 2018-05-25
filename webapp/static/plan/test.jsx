import React, {Component} from 'react';
import {
  Table,
  TableBody,
  TableFooter,
  TableHeader,
  TableHeaderColumn,
  TableRow,
  TableRowColumn,
} from 'material-ui/Table';
import TextField from 'material-ui/TextField';
import Paper  from 'material-ui/paper';
import RaisedButton from 'material-ui/RaisedButton';
import CircularProgress from 'material-ui/CircularProgress';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import Select from "rc-select";
import Pagination from 'rc-pagination';


export default class TableExampleComplex extends Component {
    constructor(props) {
        super(props)
    }

    componentDidMount() {
        this.initMap();
    }

    initMap(){
        const el=ReactDOM.findDOMNode(this);
        if (!el){return;}
        const divMap=el.querySelector('.map');
        const GuangZhou={
            lat:23.136683927297444,
            lng:113.35663921777336};
        var center=GuangZhou;
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
      return( <div className='full-page-content'>
                <div className='map'></div>
            </div>
      )
  }
}