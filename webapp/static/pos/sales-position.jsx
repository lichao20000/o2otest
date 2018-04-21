import { Table, TableBody, TableHeader, TableHeaderColumn, 
  TableRow, TableRowColumn,
} from 'material-ui/Table';
import { HashRouter as Router, Route, Link } from 'react-router-dom'

import Snackbar from 'material-ui/Snackbar';
import CircularProgress from 'material-ui/CircularProgress';
import TextField from 'material-ui/TextField';
import Divider from 'material-ui/Divider';
import RaisedButton from 'material-ui/RaisedButton';
import Toggle from 'material-ui/Toggle';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';


class SalesPosition extends React.Component{
    constructor(props){
        super(props); 
        this.state = {
          loading: false,
          sending: false,
          query: '',
          rows: [],
          errMsg:'',
        }
    }

    componentDidMount(){
      this.getData()
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
          //data: {'msg_code':msg_code, },
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
      let {loading, sending, rows } = this.state;
      let headers = ['系统ID','类型', '促销点ID', '门店名称', '门店地址', 
        //'渠道',
        //<TableRowColumn>{r.channel_name}</TableRowColumn>
        '区分', '单元', '责任人','代码点', '坐标' ]
      return (
        <div>
        { loading ? <CircularProgress size={40} thickness={3} />:
          <div>
          <div>
          </div>
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
    let headers = ['系统ID','类型', '促销点ID', '门店名称', '门店地址', 
        //'渠道', //<TableRowColumn>{r.channel_name}</TableRowColumn>
        '区分', '单元', '责任人','代码点', '坐标' ]
    let style = { margin: 12, float:'right'};
    let sales_departs = (((window.NS||{}).userInfo||{})
                          .user_info||{}).charge_departs_info||[];
    console.info(sales_departs)
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
