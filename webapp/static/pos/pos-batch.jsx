import { Table, TableBody, TableHeader, TableHeaderColumn, 
  TableRow, TableRowColumn,
} from 'material-ui/Table';
import { HashRouter as Router, Route, Link } from 'react-router-dom'

import Paper  from 'material-ui/paper';
import Snackbar from 'material-ui/Snackbar';
import CircularProgress from 'material-ui/CircularProgress';
import TextField from 'material-ui/TextField';
import Divider from 'material-ui/Divider';
import RaisedButton from 'material-ui/RaisedButton';
import Toggle from 'material-ui/Toggle';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import Checkbox from 'material-ui/Checkbox';
import {RadioButton, RadioButtonGroup} from 'material-ui/RadioButton';
import IconButton from 'material-ui/IconButton';
let AL = HardwareKeyboardArrowLeft;
let AR = HardwareKeyboardArrowRight;







class PosImport extends React.Component{
    constructor(props){
        super(props); 
        let user_info = (((window.NS||{}).userInfo||{}).user_info||{});
        this.state = {
            sales_depart_id : user_info['sales_depart_id'],

        }
    }

    onChange(){
    
    }

    render(){
        let user_info = (((window.NS||{}).userInfo||{}).user_info||{});
        let sales_departs = user_info.charge_departs_info;
        return (
            <div style={{padding:'30px 20px' }}>
                <TextField
                    style ={{width:'100%'}}
                    disabled = {true}
                    underlineShow={false}  
                    floatingLabelText="渠道"
                    value= {user_info['channel_name']}
                    onChange={this.fuck}
                    floatingLabelFixed={true} />
                <Divider />

                <SelectField
                    floatingLabelText="区分"
                    value = {user_info['sales_depart_id']}
                    onChange = {(e,idx,v)=>(this.onChange('sales_depart_id',e,v))}>
                    {
                        sales_departs.map((d, i)=>(
                            <MenuItem key ={'f-'+i} value={d.sales_depart_id} 
                                primaryText={d.sales_depart_name} />
                        ))
                    }
                </SelectField>
                 
                <IconButton style={{top:64, left:-25, padding:0, zIndex:4}}><AR/></IconButton> 
            </div>
        )

    }
}

exports.PosImport = PosImport

