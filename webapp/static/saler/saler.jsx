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


class SalerList extends React.Component{
    constructor(props){
        super(props); 
        this.state = {
          loading: false,
          sending: false,
          query: '',
          sales_depart_id:null,
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
      let {sales_depart_id, query, deleted,} = this.state;
      let q = query==''?null: query;
      let args = {sales_depart_id, q, deleted};
      axios({
          url: '/saler/api/get_saler_list.json' ,
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
            this.setState({ rows:resp.data.salers, has_more: resp.data.has_more})
          }else{
              this.setState({ errMsg: '请求出错!'})
          }
          this.setState({loading: false})
      })
    }

    render(){
      let {loading, sending, rows,
          query, deleted, sales_depart_id, } = this.state;
      let user_info = (((window.NS||{}).userInfo||{}).user_info||{});
      let headers = ['手机号','姓名', '渠道', '区分','单元','状态','创建人ID']
      let sales_departs = user_info.charge_departs_info.concat();
      for(let i=0;i<sales_departs.length;i++){
            if(sales_departs[i].parent_id==0){
                sales_departs.splice(i,1)
            }
      }
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
            <TextField hintText="姓名/手机号"
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
            <Link to='/saler/new'>
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
                <TableHeaderColumn key={idx} >{h}</TableHeaderColumn>
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
                  <Link to={'/saler/manager/'+r.mobile}> {r.mobile} </Link>
                </TableRowColumn>
                <TableRowColumn>{r.saler_name}</TableRowColumn>
                <TableRowColumn>{r.channel_name}</TableRowColumn>
                <TableRowColumn>{r.sales_depart_name}</TableRowColumn>
                <TableRowColumn>{r.unit}</TableRowColumn>
                <TableRowColumn>{r.deleted}</TableRowColumn>
                <TableRowColumn>{r.create_user_id}</TableRowColumn>
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


exports.SalerList = SalerList




