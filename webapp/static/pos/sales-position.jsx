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




class SalesPosition extends React.Component{
    constructor(props){
        super(props); 
        this.state = {
          loading: false,
          sending: false,
          query: '',
          sales_depart_id:null,
          pos_type: null,
          deleted: 0,
          rows: [],
          errMsg:'',
        }
    }

    componentDidMount(){
      this.getData()
    }

    getData(){
      this.setState({loading: true})
      let {sales_depart_id, pos_type, query, deleted, undeleted} = this.state;
      query = query==''?null: query;
      let args = {sales_depart_id, pos_type, query, deleted};
      axios({
          url: '/pos/api/get_pos_list.json' ,
          transformRequest:[ function(data, headers) {
              let _data =  []
              for(let k in data){
                  _data.push(k+'='+ (data[k]==null?'':data[k]))
              }
              return  _data.join('&')
          }
          ],
          data: args,
          method: 'post',
          responseType:'json',
      }).then( (resp) =>{
          if(resp.status == 200){
               if(resp.data instanceof Array){
                   this.setState({rows: resp.data})
               }else{
                  this.setState({ errMsg: '请求数据出错'})
               }
          }else{
              this.setState({ errMsg: '请求出错!'})
          }
          this.setState({loading: false})
      })
    }

    render(){
      let {loading, sending, rows,
        query, deleted, undeleted, sales_depart_id,pos_type,
      } = this.state;
      let headers = ['系统ID','类型', '促销点ID', '门店名称', '门店地址', 
        //'渠道',
        //<TableRowColumn>{r.channel_name}</TableRowColumn>
        '区分', '单元', '责任人','代码点', '坐标' ]
      let sales_departs = (((window.NS||{}).userInfo||{})
                          .user_info||{}).charge_departs_info||[];
      return (
        <div>
          <Paper style={{padding:'5px 20px', margin:'5px 0px'}} zDepth={2}>
            <div> 筛选条件： </div>
            <div style={{display:'inline-block' ,  verticalAlign:'middle', }}>
            <RadioButtonGroup 
              name="deleted" 
              style = {{display:'inline-block' ,width:280}}
              valueSelected = {deleted}
              onChange = {(e, deleted)=>{this.setState({deleted})}}
              >
              <RadioButton
                value={0}
                label="生效"
                labelStyle ={{fontSize:12,color:'rgba(0, 0, 0, 0.3)'}}
                style = {{display:'inline-block' ,width:90}}
                labelPosition = 'left'
              />
              <RadioButton
                value={1}
                label="失效"
                labelStyle ={{fontSize:12,color:'rgba(0, 0, 0, 0.3)'}}
                style = {{display:'inline-block' ,width:90}}
                labelPosition = 'left'
              />
              <RadioButton
                value={-1}
                label="全部"
                labelStyle ={{fontSize:12,color:'rgba(0, 0, 0, 0.3)'}}
                style = {{display:'inline-block' ,width:90}}
                labelPosition = 'left'
              />
            </RadioButtonGroup>

            </div>
            <div style={{display:'inline-block', marginRight:20}}>
              <label style={{fontSize:12,
                    color:'rgba(0, 0, 0, 0.3)'}}>区分</label>
              <SelectField
                value={sales_depart_id}
                onChange = {(e,i,sales_depart_id)=>{
                      this.setState({sales_depart_id})}}
                labelStyle={{fontSize:12, lineHeight:4, textAlign:'center'}}
                style ={{display:'inline-block' ,
                    lineHeight: 24,
                    verticalAlign:'middle',
                    width:150,
                    height:40,}} >
                <MenuItem  value={null} primaryText={'请选择'} />
                {
                  sales_departs.map((d, i)=>(
                     <MenuItem key ={'f-'+i} value={d.sales_depart_id} 
                      primaryText={d.sales_depart_name} />
                  ))
                }
              </SelectField>
            </div>
            <div style={{display:'inline-block', marginRight:20}}>
            <label style={{fontSize:12,
                    color:'rgba(0, 0, 0, 0.3)'}}>类型</label>
            <SelectField
                value={pos_type}
                onChange = {(e,i,pos_type)=>{this.setState({pos_type})}}
                labelStyle={{fontSize:12, lineHeight:4, textAlign:'center'}}
                style ={{display:'inline-block' ,
                    lineHeight: 24,
                    verticalAlign:'middle',
                    width:150,
                    height:40,}} >
                <MenuItem  value={null} primaryText={'请选择'} />
                {
                  ['美宜佳', '7 11', '固定点'].map((t, idx)=>(
                    <MenuItem key ={idx} value={t} primaryText={t} />
                  ))
                }
            </SelectField>
            </div>
           <TextField hintText="门店名称/地址"
              value = {query}
              onChange = {(e,query)=>{this.setState({query})}}
              style ={{display:'inline-block' ,
                    fontSize: 14,
                    verticalAlign:'middle',
                    width:150,
                    height:40,}} />
            <RaisedButton label="查找" primary={true}
              onClick = {this.getData.bind(this)}
              disabled ={loading}
              style ={{ height:30,
                  width: 50 ,
                  marginLeft: 20
              }} />
            <Link to='/pos/new'>
            <RaisedButton label="添加" primary={true}
              backgroundColor="#a4c639"
              onClick = {this.getData.bind(this)}
              disabled ={loading}
              style ={{ height:30,
                  width: 50 ,
                  marginLeft: 20
              }} />
            </Link>


     
          </Paper>
        { loading ? <CircularProgress size={40} thickness={3} />:
          <div>
          <Table fixedHeader={false} displaySelectAll={false}>
          <TableHeader displaySelectAll={false} adjustForCheckbox={false}> 
          <TableRow>
            { headers.map((h,idx)=>{
                return (
                <TableHeaderColumn key={idx} tooltip={h}>{h}</TableHeaderColumn>
                )
              }) 
            }
          </TableRow>
          </TableHeader>
            <TableBody displayRowCheckbox={false} stripedRows={false} 
          showRowHover={true} >
              { rows.map((r, idx)=>{
                return(
              <TableRow key ={idx} style={{fontSize:12}}>
                <TableRowColumn> 
                  <Link to={'/pos/manager/'+r.pos_id}> {r.pos_id} </Link>
                </TableRowColumn>
                <TableRowColumn tootips='wthf..'>{r.pos_type}</TableRowColumn>
                <TableRowColumn>{r.sales_id}</TableRowColumn>
                <TableRowColumn>{r.pos_name}</TableRowColumn>
                <TableRowColumn>{r.pos_address}</TableRowColumn>
                <TableRowColumn>{r.sales_depart_name}</TableRowColumn>
                <TableRowColumn>{r.pos_unit}</TableRowColumn>
                <TableRowColumn>{r.create_user_id}</TableRowColumn>
                <TableRowColumn>{r.pos_code}</TableRowColumn>
                <TableRowColumn>{r.geo_data}</TableRowColumn>
              </TableRow>
                )})
              }
            </TableBody>
          </Table>
          </div>
        }
        </div>
         )
    }
}


exports.SalesPosition = SalesPosition

class SalesPositionManager extends React.Component{
  constructor(props){
    super(props); 
    this.state = {
      loading: false,
      sending: false,
      pos_id: props.match.params.pos_id,
      pos_info:{},
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
    let {pos_info, changeItems } = this.state;
    let {pos_id} = pos_info;
    let args = {pos_id}
    changeItems.forEach((k)=>{args[k]=pos_info[k]})
    axios({
          url: '/pos/api/update_pos.json' ,
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
          url: '/pos/api/get_pos_list.json' ,
          transformRequest:[ function(data, headers) {
              let _data =  []
              for(let k in data){
                  _data.push(k+'='+ data[k])
              }
              return  _data.join('&')
          }
          ],
          data: {'pos_id':this.state.pos_id, },
          method: 'post',
          responseType:'json',
      }).then( (resp) =>{
          if(resp.status == 200){
               if(resp.data instanceof Array){
                   this.setState({pos_info: resp.data[0]})
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
    let {pos_info, changeItems}  = this.state;
    pos_info[key] = val;
    if(changeItems.indexOf(key) == -1){
      changeItems.push(key)
    }
    this.setState({pos_info, changeItems});
  }


  render(){
    let {loading, sending, pos_id, pos_info, errMsg, changeItems} =this.state;
    let style = { margin: 12, float:'right'};
    let sales_departs = (((window.NS||{}).userInfo||{})
                          .user_info||{}).charge_departs_info||[];
    return( 
    <div style={{padding: 20}}> 
      <TextField
        style ={{width:'100%'}}
        disabled = {true}
        underlineShow={false}  
        floatingLabelText="系统ID"
        value= {pos_info['pos_id']}
        floatingLabelFixed={true} 
        onChange={this.fuck}/>
      <Divider />
      <TextField
        style ={{width:'100%'}}
        disabled = {true}
        underlineShow={false}  
        floatingLabelText="渠道"
        value= {pos_info['channel_name']}
        onChange={this.fuck}
        floatingLabelFixed={true} />
      <Divider />
      <SelectField
          floatingLabelText="区分"
          value = {pos_info['sales_depart_id']}
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
        underlineShow={false}  
        disabled = { sending }
        floatingLabelText="单元"
        value = {pos_info['pos_unit']||''}
        onChange = {this.onChange.bind(this,'pos_unit')}
        floatingLabelFixed={true} />
      <Divider />
      <SelectField
          floatingLabelText="类型"
          value = {pos_info['pos_type']}
          onChange = {(e,idx,v)=>(this.onChange('pos_type',e,v))}>
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
        value = {pos_info['sales_id']}
        onChange = {this.onChange.bind(this,'pos_id')}
        floatingLabelFixed={true} />
      <Divider />
      <TextField
        style ={{width:'100%'}}
        floatingLabelText="门店名称"
        underlineShow={false}  
        disabled = { sending }
        value = {pos_info['pos_name']}
        onChange = {this.onChange.bind(this,'pos_name')}
        floatingLabelFixed={true} />
      <Divider />
      <TextField
        underlineShow={false}  
        style ={{width:'100%'}}
        disabled = { sending }
        floatingLabelText="门店地址"
        value = {pos_info['pos_address']}
        onChange = {this.onChange.bind(this,'pos_address')}
        floatingLabelFixed={true} />
      <Divider />
       <TextField
        underlineShow={false}  
        disabled = { sending }
        style ={{width:'100%'}}
        floatingLabelText="负责人"
        value = {pos_info['pos_man']||''}
        onChange = {this.onChange.bind(this,'pos_man')}
        floatingLabelFixed={true} />
      <Divider />
      <div>
        <label style={{fontSize:12,color:'rgba(0, 0, 0, 0.3)'}}>生效 </label>
        <Toggle style ={{display:'inline-block'}}
          onToggle = {(e,v)=>{this.onChange('deleted',e, v?0:1)}}
          toggled = {!pos_info['deleted'] } />
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

exports.SalesPositionManager = SalesPositionManager ;



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
          pos_man: '',
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
      let { sales_depart_id, pos_type, pos_unit, sales_id,
        pos_name, pos_address, pos_man, errName, errType, errDepart,
        errMsg,} =this.state;
      if(sales_depart_id==null || pos_type==''|| pos_name==''){
        let errName = pos_name==''?'名称不能为空':'';
        let errDepart  = sales_depart_id==null ?'区分信息不能为空':'';
        let errType = pos_type==null ?'类型信息不能为空':'';
        this.setState({errName, errType, errDepart,sending:false})
        return 
      }
      let args = {
        sales_depart_id, pos_type, pos_unit,
        sales_id, pos_name, pos_address, pos_name, 
      }
      console.info('wtf..')
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
    let {loading, sending, checkOk, errName, errType, errDepart,
          sales_depart_id, pos_type, pos_unit, sales_id,
          pos_name, pos_address, pos_man, 
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
        disabled = { sending }
        style ={{width:'100%'}}
        floatingLabelText="负责人"
        value = {pos_man}
        onChange = {(e, pos_man)=>(this.setState({ pos_man }))}
        floatingLabelFixed={true} />
      <Divider />
     {loading||sending?
       < CircularProgress size={40} thickness={3} />:
      <div>
      <Route render={({ history}) => (
        <RaisedButton label="添加" primary={true} 
          disabled={!!errName || !!errDepart || !!errType}
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




