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


class NewPosition extends React.Component{
    constructor(props){
        super(props); 
        let userInfo =  (((window.NS||{}).userInfo||{}).user_info||{});
        this.state = {
          loading: false,
          sending: false,
          sales_depart_id:null,
          errDepart:'',
          pos_type:null,
          errType:'',
          pos_name:'',
          errName:'',
          pos_unit:'',
          slaes_id:'',
          pos_address:'',
          pos_code: ''  ,

          pos_man: '',
          errMan: '',
          pos_man_mobile: '',
          errMobile: '',
          errMsg:'',
        }
    }

    componentDidMount(){

    }
   
    checkName(val){
      if(!!!val){
        this.setState({errName:'名称不能为空'})
      }
      axios({
          url: '/pos/api/get_pos_list.json' ,
          transformRequest:[ function(data, headers) {
              let _data =  []
              for(let k in data){
                  _data.push(k+'='+ data[k])
              }
              return  _data.join('&')
          }
          ],
          data:{pos_name: val},
          method: 'post',
          responseType:'json',
      }).then( (resp) =>{
        if(resp.status == 200){
          if(resp.data instanceof Array && resp.data.length>0){
            this.setState({errName:'名称已存在'})
          }else{
            this.setState({errName:''})
          }
        }else{
          this.setState({ errMsg: '校验名称请求出错!'})
        }
      })
    }

    componentWillUnmout(){
      this.unmoumt = true;
    }

    addNew(history){
      this.setState({sending: true})
      let { sales_depart_id, pos_type, pos_unit, sales_id, pos_man_mobile,
        pos_name, pos_address, pos_man, errName, errType, errDepart,errMan, errMobile,
        errMsg,} =this.state;
      if(sales_depart_id==null || pos_type==''|| pos_name==''|| pos_man=='' || pos_man_mobile==''){
        let errName = pos_name==''?'名称不能为空':'';
        let errDepart  = sales_depart_id==null ?'区分信息不能为空':'';
        let errType = pos_type==null ?'类型信息不能为空':'';
        let errMan = pos_man==''?'负责任姓名不能为空':'';
        let errMobile = pos_man_mobile=='' ? '负责任电话不能为空':'';
        this.setState({errName, errType, errDepart,sending:false, errMan, errMobile})
        return 
      }
      let args = {
        sales_depart_id, pos_type, pos_unit,
        sales_id, pos_name, pos_address, pos_man,  pos_man_mobile,
      }
      axios({
        url: '/pos/api/add_pos.json' ,
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
            history.push('/pos/manager')
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
    let {loading, sending, checkOk, errName, errType, errDepart,errMan ,errMobile,
          sales_depart_id, pos_type, pos_unit, sales_id,pos_man_mobile, pos_code,
          pos_name, pos_address, pos_man, errMsg, changeItems} =this.state;
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
        underlineShow={false}  
        disabled = { sending }
        floatingLabelText="单元"
        value = {pos_unit}
        onChange = {(e, pos_unit)=>(this.setState({pos_unit}))}
        floatingLabelFixed={true} />
      <Divider />
      <SelectField
          floatingLabelText="类型"
          floatingLabelFixed={true}
          errorText={errType}
          value = {pos_type}
          disabled = {sending }
          onChange = {(e,idx, pos_type)=>{
            let errType='';
            if(pos_type==null){
              errType='类型信息不能为空'
            }
            this.setState({ pos_type, errType})}}>
            <MenuItem  value={null} primaryText='请选择' />
          {
            ['美宜佳', '7 11', '固定点'].map((t, idx)=>(
            <MenuItem key ={idx} value={t} primaryText={t} />
            ))
          }
        </SelectField>
        <TextField
        style ={{width:'100%'}}
        floatingLabelText="促销点ID"
        disabled = { sending }
        underlineShow={false}  
        value = {sales_id}
        onChange = {(e, sales_id)=>(this.setState({sales_id}))}
        floatingLabelFixed={true} />
      <Divider />
      <TextField
        style ={{width:'100%'}}
        floatingLabelText="门店名称"
        errorText={errName}
        underlineShow={false}  
        disabled = { sending }
        value = {pos_name}
        onChange = {(e, pos_name)=>{
          this.checkName(pos_name);
          this.setState({pos_name})}}
        floatingLabelFixed={true} />
      <Divider />
      <TextField
        underlineShow={false}  
        style ={{width:'100%'}}
        disabled = { sending }
        floatingLabelText="门店地址"
        value = {pos_address}
        onChange = {(e, pos_address)=>(this.setState({pos_address}))}
        floatingLabelFixed={true} />
      <Divider />
      <TextField
        underlineShow={false}  
        style ={{width:'100%'}}
        disabled = { sending }
        floatingLabelText="代码点"
        value = {pos_code}
        onChange = {(e,pos_code)=>(this.setState({pos_code}))}
        floatingLabelFixed={true} />
      <Divider />
 
       <TextField
        underlineShow={false}  
        disabled = { sending }
        style ={{width:'100%'}}
        errorText={errMan}
        floatingLabelText="负责人姓名"
        value = {pos_man}
        onChange = {(e, pos_man)=>{
            let errMan ='';
            errMan = pos_man==''? '负责人姓名不能为空':''
            this.setState({ pos_man, errMan})
        }}
        floatingLabelFixed={true} />
       <Divider />

       <TextField
        underlineShow={false}  
        disabled = { sending }
        style ={{width:'100%'}}
        floatingLabelText="负责人手机号"
        errorText={errMobile}
        value = {pos_man_mobile}
        onChange = {(e, pos_man_mobile)=>{
            let errMobile ='';
            errMobile = pos_man_mobile.length != 11|| !pos_man_mobile.match(/^\d+$/) ?'请提供正确的手机号码.':''
            this.setState({pos_man_mobile, errMobile})
        }}
        floatingLabelFixed={true} />
 
      <Divider />
     {loading||sending?
       < CircularProgress size={40} thickness={3} />:
      <div>
      <Route render={({ history}) => (
        <RaisedButton label="添加" primary={true} 
          disabled={!!errName || !!errDepart || !!errType || !!errMan|| !!errMobile}
          onClick = {()=>(this.addNew(history))}
          style={style} />
       )} />
       <Link to='/pos/manager'>
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

exports.NewPosition= NewPosition;




