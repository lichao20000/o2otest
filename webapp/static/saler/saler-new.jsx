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



class NewSaler extends React.Component{
    constructor(props){
        super(props); 
        let userInfo =  (((window.NS||{}).userInfo||{}).user_info||{});
        this.state = {
          loading: false,
          sending: false,

          mobile: '',
          errMobile: '',

          sales_depart_id:null,
          errDepart:'',

          saler_name:'',
          errName:'',

          unit:'',

          errMsg:'',
        }
    }

    componentDidMount(){

    }
   
    checkMobile(val){
      if(!!!val){
        this.setState({errName:'请填写正确的手机号'})
      }
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
          data:{mobile: val},
          method: 'post',
          responseType:'json',
      }).then( (resp) =>{
        if(resp.status == 200){
          if(resp.data.salers instanceof Array && resp.data.salers.length>0){
            this.setState({errName:'手机号已存在'})
          }else{
            this.setState({errName:''})
          }
        }else{
          this.setState({ errMsg: '校验手机号请求出错!'})
        }
      })
    }

    componentWillUnmout(){
      this.unmoumt = true;
    }

    addNew(history){
      this.setState({sending: true})
      let { sales_depart_id, saler_name, unit , mobile, 
           errMobile, errName, errDepart, errMsg,} =this.state;
      if(sales_depart_id==null || saler_name==''|| mobile==''){
        let errName = saler_name ==''?'姓名不能为空':'';
        let errDepart  = sales_depart_id==null ?'区分信息不能为空':'';
        let errMobile = mobile==''?'类型信息不能为空':'';
        this.setState({errName,errDepart,errMobile,sending:false})
        return 
      }
      let args = {
        sales_depart_id, mobile, unit,
        saler_name, }
      axios({
        url: '/saler/api/add_saler.json' ,
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
          this.setState({ errMsg: '请求出错!',})
        }
        if(!this.unmount){
          this.setState({sending: false})
        }
      })
    }


    render(){
    let {loading, sending, checkOk, errName, errDepart,errMobile,
          sales_depart_id, mobile, unit, saler_name,
          errMsg, changeItems} =this.state;
    let style = { margin: 12, float:'right'};
    let userInfo =  (((window.NS||{}).userInfo||{}).user_info||{});
    let sales_departs = userInfo.charge_departs_info||[];
    return( 
    <div style={{padding: 20}}> 
     <TextField
        style ={{width:'100%'}}
        disabled = {true}
        underlineShow={false}  
        floatingLabelText="渠道"
        value= { userInfo.channel_name}
        onChange={this.fuck}
        floatingLabelFixed={true} />
      <Divider />
      <SelectField
          errorText={errDepart}
          floatingLabelText="区分"
          value = {sales_depart_id}
          floatingLabelFixed={true}
          disabled = {sending }
          onChange = {(e,idx,sales_depart_id)=>{
            let errDepart='';
            if(sales_depart_id==null){
              errDepart='区分信息不能为空'
            }
            this.setState({ sales_depart_id, errDepart})}}>
            <MenuItem  value={null} primaryText='请选择' />
          {
            sales_departs.map((d, i)=>(
               <MenuItem key ={'f-'+i} value={d.sales_depart_id} 
                primaryText={d.sales_depart_name} />
            ))
          }
        </SelectField>
      <TextField
        style ={{width:'100%'}}
        floatingLabelText="手机号"
        errorText={errMobile}
        underlineShow={false}  
        disabled = { sending }
        value = {mobile}
        onChange = {(e,mobile)=>{
          this.checkMobile(mobile);
          this.setState({mobile})}}
        floatingLabelFixed={true} />
      <Divider />
      
    <TextField
        style ={{width:'100%'}}
        underlineShow={false}  
        disabled = { sending }
        floatingLabelText="单元"
        value = {unit}
        onChange = {(e, unit)=>(this.setState({unit}))}
        floatingLabelFixed={true} />
      <Divider />
       <TextField
        style ={{width:'100%'}}
        floatingLabelText="姓名"
        disabled = { sending }
        errorText={errName}
        underlineShow={false}  
        value = {saler_name}
        onChange = {(e, saler_name)=>{
          let errName = '';
          if (saler_name==''){
            errName = '姓名不能为空';
          }
          this.setState({saler_name, errName})}}
        floatingLabelFixed={true} />
      <Divider />
      {
     loading||sending?
       < CircularProgress size={40} thickness={3} />:
      <div>
      <Route render={({ history}) => (
        <RaisedButton label="添加" primary={true} 
          disabled={!!errName || !!errDepart || !!errMobile}
          onClick = {()=>(this.addNew(history))}
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

exports.NewSaler = NewSaler;




