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



class MyPlan extends React.Component{
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
          url: '/plan/api/get_my_plans.json' ,
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
              this.setState({ rows:resp.data.rows[0]})
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
        let headers = [ 'ID', '状态', '促销时间', '促销人数', '促销人员' ];
        console.log(rows);
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
                  <TableRowColumn style ={{textAlign: 'center'}} > {r.plan_id} </TableRowColumn>
                  <TableRowColumn style ={{textAlign: 'center'}} > {statusText}</TableRowColumn>
                  <TableRowColumn style ={{textAlign: 'center'}} > {r.sales_date}</TableRowColumn>
                  <TableRowColumn style ={{textAlign: 'center'}} > {r.saler_cnt}</TableRowColumn>
                  <TableRowColumn style ={{textAlign: 'center'}} >
                    { r.salers.map((s, i)=>{
                        return (<div key={i}> {s.mobile +'  '+s.saler_name} </div>)
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

exports.MyPlan = MyPlan;
