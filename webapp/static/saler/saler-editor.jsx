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


class SalerEditor extends React.Component{
  constructor(props){
    super(props); 
    this.state = {
      loading: false,
      sending: false,
      mobile : props.match.params.mobile,
      saler:{},
      errMsg:'',
      changeItems: [],
    }
  }
  
  componentDidMount(){
    this.getData()
  }
  
  componentWillUnmout(){
    this.unmount = true;
  }

  setData(history){
   this.setState({sending: true})
    let {saler, changeItems } = this.state;
    let {mobile} = saler;
    let args = {mobile}
    changeItems.forEach((k)=>{args[k]=saler[k]})
    axios({
          url: '/saler/api/update_saler.json' ,
          transformRequest:[ function(data, headers) {
              let _data =  []
              for(let k in data){
                  _data.push(k+'='+ data[k])
              }
              return  _data.join('&')
          }
          ],
          data:args,
          method: 'post',
          responseType:'json',
      }).then( (resp) =>{
          if(resp.status == 200){
               if(resp.data.result){
                  history.push('/saler/manager')
               }else{
                  this.setState({ errMsg: resp.data.msg})
               }
          }else{
              this.setState({ errMsg: '请求出错!'})
          }
          if(!this.unmount){
            this.setState({sending: false})
          }
      })
  }


  getData(){
    this.setState({loading: true})
    axios({
          url: '/saler/api/get_saler_list.json' ,
          transformRequest:[ function(data, headers) {
              let _data =  []
              for(let k in data){
                  _data.push(k+'='+ data[k])
              }
              return  _data.join('&')
          }
          ],
          data: {'mobile':this.state.mobile, },
          method: 'post',
          responseType:'json',
      }).then( (resp) =>{
          if(resp.status == 200){
               if(resp.data.salers instanceof Array){
                   this.setState({saler: resp.data.salers[0]||{}})
               }else{
                  this.setState({ errMsg: '请求数据出错'})
               }
          }else{
              this.setState({ errMsg: '请求出错!'})
          }
          this.setState({loading: false})
      })
  }

  onChange(key,e , val){
    let {saler, changeItems}  = this.state;
    saler[key] = val;
    if(changeItems.indexOf(key) == -1){
      changeItems.push(key)
    }
    this.setState({saler ,changeItems});
  }


  render(){
    let {loading, sending, mobile, saler, errMsg, changeItems} =this.state;
    let style = { margin: 12, float:'right'};
    let sales_departs = (((window.NS||{}).userInfo||{})
                          .user_info||{}).charge_departs_info||[];
    return( 
    <div style={{padding: 20}}> 
      <TextField
        style ={{width:'100%'}}
        disabled = {true}
        underlineShow={false}  
        floatingLabelText="手机号"
        value= {saler['mobile']}
        floatingLabelFixed={true} 
        onChange={this.fuck}/>
      <Divider />
      <TextField
        style ={{width:'100%'}}
        disabled = {true}
        underlineShow={false}  
        floatingLabelText="渠道"
        value= {saler['channel_name']}
        onChange={this.fuck}
        floatingLabelFixed={true} />
      <Divider />
      <SelectField
          floatingLabelText="区分"
          value = {saler['sales_depart_id']}
          onChange = {(e,idx,v)=>(this.onChange('sales_depart_id',e,v))}>
          {
            sales_departs.map((d, i)=>(
               <MenuItem key ={'f-'+i} value={d.sales_depart_id} 
                primaryText={d.sales_depart_name} />
            ))
          }
        </SelectField>
       <TextField
        style ={{width:'100%'}}
        floatingLabelText="姓名"
        disabled = { sending }
        underlineShow={false}  
        value = {saler['saler_name']}
        onChange = {this.onChange.bind(this,'saler_name')}
        floatingLabelFixed={true} />
      <Divider />
      
    <TextField
        style ={{width:'100%'}}
        underlineShow={false}  
        disabled = { sending }
        floatingLabelText="单元"
        value = {saler['unit']||''}
        onChange = {this.onChange.bind(this,'unit')}
        floatingLabelFixed={true} />
      <Divider />
      <TextField
        underlineShow={false}  
        disabled = { true}
        style ={{width:'100%'}}
        floatingLabelText="创建人ID"
        value = {saler['create_user_id']||''}
        onChange = {this.onChange.bind(this,'pos_man')}
        floatingLabelFixed={true} />
      <Divider />
      <div>
        <label style={{fontSize:12,color:'rgba(0, 0, 0, 0.3)'}}>生效 </label>
        <Toggle style ={{display:'inline-block'}}
          onToggle = {(e,v)=>{this.onChange('deleted',e, v?0:1)}}
          toggled = {!saler['deleted'] } />
      </div>
      <Divider />
      {loading||sending?
       < CircularProgress size={40} thickness={3} />:
      <div>

      <Route render={({ history}) => (
        <RaisedButton label="保存更改" primary={true} 
          disabled={!changeItems.length}
          onClick = {()=>(this.setData(history))}
          style={style} />
       )} />
       <Link to='/saler/manager'>
        <RaisedButton label="取消" style={style}  />
        </Link>
      </div>
        }
      <Snackbar 
        open={!!errMsg}
        message={errMsg}
        autoHideDuration={3000}
        onRequestClose={(e)=>{this.setState({errMsg:''})}}
        />
      </div>)
  }
}

exports.SalerEditor = SalerEditor;


