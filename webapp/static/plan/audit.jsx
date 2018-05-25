import { Table, TableBody, TableHeader, TableHeaderColumn, 
  TableRow, TableRowColumn,TableFooter
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
import MultipleDatePicker from 'react-multiple-datepicker'
import Select from 'rc-select'
import Pagination from 'rc-pagination';
import Dialog from 'material-ui/Dialog'
import ShowMap from'../libs/showmap'

class Audit extends React.Component{
    constructor(props){
        super(props) ;
        this.state = {
            fixedHeader: true,
            fixedFooter: true,
            stripedRows: false,
            showRowHover: true,
            selectable: true,
            multiSelectable: true,
            enableSelectAll: true,
            deselectOnClickaway: false,
            showCheckboxes: true,
            selectedRows:[],
            status_id:'',
            loading: false,
            sending : false,
            errMsg:'',
            rowsTotal:0,
            rows:[],
            pageSize:20,
            pageCurrent:1,
            dates:[],
            sales_dates:'',
            pos_type:'',
            is_charge:'',
            sales_depart_id:'',
            queryPos:'',
            status:null,
            lng:null,
            lat:null,
            address:null,
            showmap:false,
            salers:[],
            showsalers:false,
        }
    }

    componentDidMount(){
        this.getData();
    }

    getData(){
        let { sales_dates, pos_type, is_charge,sales_depart_id,status_id,queryPos,pageCurrent,pageSize}=this.state;
        this.setState({loading:true});
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
          data: {
              status_id:status_id,
              pageCurrent:pageCurrent,
              pageSize:pageSize,
              sales_dates:sales_dates,
              pos_type:pos_type,
              is_charge:is_charge,
              sales_depart_id:sales_depart_id,
              queryPos:queryPos,
          },
          method: 'post',
          responseType:'json',
      }).then( (resp) =>{
          if(resp.status == 200){
              let {count,rows } = resp.data ;
              this.setState({rows:rows,rowsTotal:count})
            }else{
              this.setState({ errMsg: '请求出错!'})
          }
          if(!this.unmount){
            this.setState({loading: false})
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

    onShowSizeChange=(current,pageSize)=>{
            this.state.pageCurrent=current;
            this.state.pageSize=pageSize;
            this.getData()
    };

    onPageChange=(page)=>{
        this.state.pageCurrent=page;
        this.getData()
    };

    onAudit(){
        let {selectedRows,rows,status}=this.state;
        let status_id=status.status_id;//审核通过
        let selectedPlan=[];
        if(selectedRows instanceof Array){
            for(let i=0;i<selectedRows.length;i++){
                let r=rows[selectedRows[i]];
                for(let j=0;j<status.auditstatus.length;j++){
                    if(r.status==status.auditstatus[j]){
                        selectedPlan.push(r.plan_id)
                    }
                }
            }
        } else if(selectedRows == 'all'){
            for(let i=0;i<rows.length;i++){
                let r =rows[i]
                for(let j=0;j<status.auditstatus.length;j++){
                    if(r.status==status.auditstatus[j]){
                        selectedPlan.push(r.plan_id)
                    }
                }
            }
        }

        if(selectedPlan.length==0||selectedRows=='none'){
            let errMsg='未选择任何行，或已选择行的状态不允许审核通过';
            this.setState({errMsg});
        }else{
            this.setState({loading:true});
            axios({
                url: '/plan/api/plan_audit.json',
                transformRequest: [function (data, headers) {
                    let _data = []
                    for (let k in data) {
                        _data.push(k + '=' + data[k])
                    }
                    return _data.join('&')
                }],
                data: {selectedPlan:selectedPlan,status:status_id},
                method: 'post',
                responseType: 'json',
            }).then((resp => {
                if (resp.status == 200) {
                    this.setState({errMsg:resp.data.msg});
                    this.getData();
                } else {
                    let errMsg = '审核请求失败';
                    this.setState({errMsg})
                }
                this.setState({loading:true})
            }))
        }
    }

    render(){
        let {loading, sending, rows,errMsg} = this.state;
        let {pageSize,rowsTotal,pageCurrent}=this.state;
        let {dates,sales_depart_id,pos_type,is_charge,queryPos,status_id}=this.state;
        let user_info=(((window.NS||{}).userInfo||{}).user_info||{});
        let sales_departs = user_info.charge_departs_info.concat();
        for(let i=0;i<sales_departs.length;i++){
            if(sales_departs[i].parent_id==0){
                sales_departs.splice(i,1);
                i--;}
        }
        let status=[{status_id:1,status_label:'待审核'},
            {status_id:2,status_label:'审核通过',auditstatus:[1,4]},
            {status_id:4,status_label:'审核不通过',auditstatus:[1,2]}];

        return (
            <div>
            <Paper style={{padding:'5px 20px', margin:'5px 0px'}} zDepth={2}>
                <div>筛选条件：</div>
                <div style={{display:'inline-block' ,  verticalAlign:'middle', }}>
                    <label style={{fontSize:12, color:'rgba(0, 0, 0, 0.3)'}}>排产日期</label>
                    <MultipleDatePicker style={{display:'inline-block'}} minDate={new Date()} onSubmit={(dates)=>{this.setState({dates});
                    let sales_dates = dates.map((d)=>{let mm = d.getMonth()+1;
                    mm = mm>9 ? mm: '0' + mm;
                    let dd = d.getDate() ;
                    dd = dd >9 ? dd: '0' + dd;
                    return ''.concat(d.getFullYear(),'').concat(mm, "").concat(dd,"")})
                        this.setState({sales_dates:sales_dates})
                    }}/>
                    <label style={{fontSize:12,
                    color:'rgba(0, 0, 0, 0.3)'}}>区分</label>
                    <SelectField value={sales_depart_id}
                                 onChange = {(e,i,sales_depart_id)=>{this.setState({sales_depart_id})}}
                                 labelStyle={{fontSize:12, lineHeight:4, textAlign:'center'}}
                                 style ={{display:'inline-block' , lineHeight: 24,
                                     verticalAlign:'middle', width:150, height:40,}} >
                        <MenuItem  value={''} primaryText={'请选择'} />
                        {
                            sales_departs.map((d, i)=>(
                                <MenuItem key ={'f-'+i} value={d.sales_depart_id}
                                          primaryText={d.sales_depart_name} />
                            ))
                        }
                    </SelectField>
                    <label style={{fontSize:12,
                    color:'rgba(0, 0, 0, 0.3)'}}>类型</label>
                    <SelectField value={pos_type}
                                 onChange={(e,idx,pos_type)=>(this.setState({pos_type}))}
                                 labelStyle={{fontSize:12, lineHeight:4, textAlign:'center'}}
                                 style ={{display:'inline-block' , lineHeight: 24,
                                     verticalAlign:'middle', width:150, height:40,}}
                                 >
                        <MenuItem  value={''} primaryText={'请选择'} />
                        {
                            ['固定促销点','营业厅','楼宇'].map((t, idx)=>(<MenuItem key ={idx} value={t} primaryText={t} />))
                        }
                    </SelectField>
                    <label style={{fontSize:12,
                    color:'rgba(0, 0, 0, 0.3)'}}>租金</label>
                    <SelectField value={is_charge}
                                 onChange={(e,idx,is_charge)=>(this.setState({is_charge}))}
                                 labelStyle={{fontSize:12, lineHeight:4, textAlign:'center'}}
                                 style ={{display:'inline-block' , lineHeight: 24,
                                     verticalAlign:'middle', width:150, height:40,}}
                                 >
                        <MenuItem  value={''} primaryText={'请选择'} />
                        {
                            ['有租金','无租金'].map((t, idx)=>(<MenuItem key ={idx} value={t} primaryText={t} />))
                        }
                    </SelectField>
                    <label style={{fontSize:12,
                        color:'rgba(0, 0, 0, 0.3)'}}>审核状态</label>
                    <SelectField value={status_id}
                                 onChange={(e,idx,status_id)=>(this.setState({status_id}))}
                                 labelStyle={{fontSize:12, lineHeight:4, textAlign:'center'}}
                                 style ={{display:'inline-block' , lineHeight: 24,
                                     verticalAlign:'middle', width:150, height:40,}}
                                 >
                        <MenuItem  value={''} primaryText={'请选择'} />
                        {
                            [{status:'待审核',id:1},{status:'审核通过',id:2},{status:'审核不通过',id:4},{status:'通过后取消',id:5}].map(
                                (t, idx)=>(<MenuItem key ={idx} value={t.id} primaryText={t.status} />))
                        }
                    </SelectField>

                    <TextField hintText="门店名称"
                               value = {queryPos}
                               onChange = {(e,queryPos)=>{this.setState({queryPos})}}
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
                    <RaisedButton label="审核通过" primary={true}
                                  onClick = {(e)=>{this.state.status=status[1];this.onAudit()}}
                                  disabled ={loading}
                                  style ={{ height:30,
                                      width: 50 ,
                                      marginLeft: 20
                                  }} />
                    <RaisedButton label="审核不通过" primary={true}
                                  onClick = {(e)=>{this.state.status=status[2];this.onAudit()}}
                                  disabled ={loading}
                                  style ={{ height:30,
                                      width:110,
                                      marginLeft:20
                                  }} />
                </div>
            </Paper>
        {loading ? <CircularProgress size={40} thickness={3} />:
            <div style={{padding: 10}}>
                <Table fixedHeader={this.state.fixedHeader}
                       fixedFooter={this.state.fixedFooter}
                       selectable={this.state.selectable}
                       multiSelectable={this.state.multiSelectable}
                       onRowSelection={(selectedRows)=>{this.state.selectedRows=selectedRows}}>
                    <TableHeader displaySelectAll={this.state.showCheckboxes}
                                 adjustForCheckbox={this.state.showCheckboxes}
                                 enableSelectAll={this.state.enableSelectAll}>
                        <TableRow>
                            <TableHeaderColumn style ={{textAlign: 'center',width:'12%'}} >创建时间</TableHeaderColumn>
                            <TableHeaderColumn style ={{textAlign: 'center',width:'7%'}} > 状态</TableHeaderColumn>
                            <TableHeaderColumn style ={{textAlign: 'center',width:'7%'}} > 区分</TableHeaderColumn>
                            <TableHeaderColumn style ={{textAlign: 'center',width:'11%'}} > 排产人</TableHeaderColumn>
                            <TableHeaderColumn style ={{textAlign: 'center',width:'30%'}} > 门店名称(点击查看地图)</TableHeaderColumn>
                            <TableHeaderColumn style ={{textAlign: 'center',width:'7%'}} > 促销时间</TableHeaderColumn>
                            <TableHeaderColumn style ={{textAlign: 'center',width:'4%'}} > 应到人数</TableHeaderColumn>
                            <TableHeaderColumn style ={{textAlign: 'center',width:'11%'}} > 促销人员</TableHeaderColumn>
                        </TableRow>
                    </TableHeader>
                    <TableBody displayRowCheckbox={this.state.showCheckboxes}
                               deselectOnClickaway={this.state.deselectOnClickaway}
                               showRowHover={this.state.showRowHover}
                               stripedRows={this.state.stripedRows} >
                        { rows.map((r, idx)=>{let status = { 1:'待审核', 2: '审核通过', 4: '审核不通过', 5: '已取消',};
                        let statusText = status[r.status];
                        return(
                            <TableRow key ={idx} style={{fontSize:12}}>
                                <TableRowColumn style ={{textAlign: 'center',width:'12%'}} >{r.create_time}</TableRowColumn>
                                <TableRowColumn style ={{textAlign: 'center',width:'7%'}} > {statusText}</TableRowColumn>
                                <TableRowColumn style ={{textAlign: 'center',width:'7%'}} > {r.sales_depart_name}</TableRowColumn>
                                <TableRowColumn style ={{textAlign: 'center',width:'11%'}} > {r.create_user}{r.create_mobile}</TableRowColumn>
                                <TableRowColumn style ={{textAlign: 'center',width:'30%'}} >
                                    {(r.lng && r.lat) ?
                                        <FlatButton label={r.pos_name} onClick={() => {
                                            this.state.lng = r.lng;
                                            this.state.lat = r.lat;
                                            this.state.address = r.pos_address;
                                            this.setState({showmap: true})
                                        }}/>
                                        :<div>{r.pos_name}</div>
                                    }
                                </TableRowColumn>
                                <TableRowColumn style ={{textAlign: 'center',width:'7%'}} > {r.sales_date}</TableRowColumn>
                                <TableRowColumn style ={{textAlign: 'center',width:'4%'}} > {r.saler_cnt}</TableRowColumn>
                                <TableRowColumn style ={{textAlign: 'center',width:'11%'}} >
                                    <FlatButton label='点击查看' onClick={()=>{
                                        this.state.salers=r.salers;
                                        this.setState({showsalers:true})
                                    }}/>
                                    </TableRowColumn>
                            </TableRow>
                        )})
                        }
                        </TableBody>
                    <TableFooter>
                        <Pagination style={{float:'right'}}
                            selectComponentClass={Select}
                            showSizeChanger
                            onShowSizeChange={this.onShowSizeChange}
                            onChange={this.onPageChange}
                            current={pageCurrent}
                            pageSize={pageSize}
                            defaultCurrent={1}
                            total={rowsTotal}
                            showTotal={(total)=>`总共${total}条记录`}
                        />
                    </TableFooter>
                </Table>
            </div>
        }
        <Dialog title={"地图展示:"+this.state.address}
                        contentStyle={{width:'100%', height:'100%', maxWidth:'none'}}
                        actions={[<FlatButton label="关闭"
                                                   primary={true}
                                                   onClick={(e)=>{this.setState({showmap:false})}}
                                        />]}
                        open={this.state.showmap}
                        style={{width:'50%',height:'50%',marginLeft:'25%',marginRight:'25%'}}
                        onRequestClose={(e)=>{this.setState({showmap:false})}}
                >
                    <div style={{width:900,height:750}}>
                        <ShowMap lng={this.state.lng}
                             lat={this.state.lat}/>
                    </div>
                </Dialog>
                <Dialog title={"促销人员列表"}
                        contentStyle={{width:'100%', height:'100%', maxWidth:'none'}}
                        actions={[<FlatButton label="关闭"
                                                   primary={true}
                                                   onClick={(e)=>{this.setState({showsalers:false})}}
                                        />]}
                        open={this.state.showsalers}
                        style={{width:'50%',height:'50%',marginLeft:'25%',marginRight:'25%'}}
                        onRequestClose={(e)=>{this.setState({showsalers:false})}}
                        autoScrollBodyContent={true}
                >
                    { this.state.salers.map((s, i)=>{
                        return (<div key={i}>
                            {s.mobile +'  '+s.saler_name}
                            </div>)
                    })
                    }
                </Dialog>
        <Snackbar open={!!errMsg}
                  message={errMsg}
                  style ={{textAlign: 'center'}}
                  autoHideDuration={3000}
                  onRequestClose={(e)=>{this.setState({errMsg:''})}}/>
            </div>
        )    
    }
}

exports.Audit = Audit;
