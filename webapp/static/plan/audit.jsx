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
import FlatButton from 'material-ui/FlatButton';
import Toggle from 'material-ui/Toggle';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import Checkbox from 'material-ui/Checkbox';
import {RadioButton, RadioButtonGroup} from 'material-ui/RadioButton';

import ActionDone from 'material-ui/svg-icons/action/done';
import ActionCheckCircle from 'material-ui/svg-icons/action/check-circle';
import IconButton from 'material-ui/IconButton';



class Audit extends React.Component{
    constructor(props){
        super(props) ;
        this.state = {
            loading: false,
            sending : false,
            rows: []
        }
    }

    componentDidMount(){
        this.getData() 
    }
    getData(){
     axios({
          url: '/plan/api/get_plan_list.json' ,
          transformRequest:[ function(data, headers) {
              let _data =  []
              for(let k in data){
                  _data.push(k+'='+ data[k])
              }
              return  _data.join('&')
          }
          ],
          data: {status: [1, 2, 4, 5].join(',')},
          method: 'post',
          responseType:'json',
      }).then( (resp) =>{
          if(resp.status == 200){
              let {has_more, rows } = resp.data ;
              this.setState({has_more, rows})
            }else{
              this.setState({ errMsg: '请求出错!'})
          }
          if(!this.unmount){
            this.setState({sending: false})
          }
      })
 
    }


    commit(plan_id,status){
      axios({
          url: '/plan/api/audit.json' ,
          transformRequest:[ function(data, headers) {
              let _data =  []
              for(let k in data){ _data.push(k+'='+ data[k]) }
              return  _data.join('&')
          } ],
          data: {status, plan_id },
          method: 'post',
          responseType:'json',
      }).then( (resp) =>{
          if(resp.status == 200){
              let {rows} = this.state;
              let r = rows.filter((r)=>(r.plan_id==plan_id))[0];
              r.status = status;
              this.setState({rows})
          }else{
              this.setState({ errMsg: '请求出错!'})
          }
          if(!this.unmount){
            this.setState({sending: false})
          }
      })
    }

    render(){
        let {loading, sending, rows  } = this.state;
        let headers = [ 'ID', '门店名称','状态', '促销时间', '渠道', '区分', '促销人数', '促销人员' ];
        return (
         loading ? <CircularProgress size={40} thickness={3} />:
          <div style={{padding: 10}}>
          <Table fixedHeader={false} displaySelectAll={false}>
          <TableHeader displaySelectAll={false} adjustForCheckbox={false}> 
          <TableRow>
            { headers.map((h,idx)=>{
                return (
                    <TableHeaderColumn key={idx}
                        style ={{textAlign: 'center'}}
                    >{h}</TableHeaderColumn>
                )
              }) 
            }
          </TableRow>
          </TableHeader>
            <TableBody displayRowCheckbox={false} stripedRows={false} 
                        style ={{textAlign: 'center'}}
          showRowHover={true} >
              { rows.map((r, idx)=>{
                  let status = { 1:'待审核',
                      2: '审核通过',
                      4: '审核不通过',
                      5: '已取消',
                  }
                  let statusText = status[r.status];
                return(
              <TableRow key ={idx} style={{fontSize:12}}>
                  <TableRowColumn style ={{textAlign: 'center'}} >
                      <div>
                      {r.status !=2 && <FlatButton
                          primary={true}
                          label='通过'
                          onClick={(e)=>{this.commit(r.plan_id, 2)}}
                          style={{fontSize:10, width:60 ,
                              minWidth:30,
                              margin:'0 10px 0 0', padding: 0 }}
                      />
                      }
                    {r.status ==2 && <FlatButton
                          label='取消'
                          onClick={(e)=>{this.commit(r.plan_id, 4)}}
                          style={{fontSize:10, width:60 ,
                              minWidth:30,
                              margin:'0 10px 0 0', padding: 0 }} />
                      }
                      {r.plan_id}
                  </div>
                  </TableRowColumn>
                  <TableRowColumn style ={{textAlign: 'center'}} > {r.pos_id}{r.pos_name}</TableRowColumn>
                  <TableRowColumn style ={{textAlign: 'center'}} > {statusText}</TableRowColumn>
                  <TableRowColumn style ={{textAlign: 'center'}} > {r.sales_date}</TableRowColumn>
                  <TableRowColumn style ={{textAlign: 'center'}} > {r.channel_name}</TableRowColumn>
                  <TableRowColumn style ={{textAlign: 'center'}} > {r.sales_depart_name}</TableRowColumn>
                  <TableRowColumn style ={{textAlign: 'center'}} > {r.saler_cnt}</TableRowColumn>
                  <TableRowColumn style ={{textAlign: 'center'}} >
                    { r.salers.map((s, i)=>{
                        return (<div key={i}> 
                            {s.mobile +'  '+s.saler_name}
                            </div>)
                    })
                    }
                
                </TableRowColumn>
              </TableRow>
                )})
              }
            </TableBody>
          </Table>
          </div>
        )    
    }
}

exports.Audit = Audit 
