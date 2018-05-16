import React from 'react'
import SelectField from 'material-ui/SelectField'
import MenuItem from 'material-ui/MenuItem'
import Paper from 'material-ui/Paper'
import CircularProgress from 'material-ui/CircularProgress'
import { Table, TableBody, TableHeader, TableHeaderColumn, TableRow, TableRowColumn,} from 'material-ui/Table';
import TextField from 'material-ui/TextField'
import RaisedButton from 'material-ui/RaisedButton'
import {Link} from'react-router-dom'


class AdminManager extends React.Component{
    constructor(props){
        super(props);
        let user_info = (((window.NS||{}).userInfo||{}).user_info||{});
        this.state={
            loading:false,
            query:'',
            channel_id:user_info.channel_id,
            sales_depart_id:null,
            channel_name:user_info.channel_name,
            sales_depart_name:user_info.sales_depart_name,
            rows:[],
            errMsg:'',
        }
    }

    componentDidMount(){
        this.getUser();
    }

    getUser(){
        this.setState({loading:true});
        let {channel_id,sales_depart_id,query}=this.state;
        let args={channel_id,sales_depart_id,query};
        axios({
            url:'/user/api/get_users.json',
            transformRequest:[ function(data) {
                let _data =  [];
                for(let k in data){
                    _data.push(k+'='+ (data[k]==null?'':data[k]))
                }
                return  _data.join('&')}
                ],
            data:args,
            method:'post',
            responseType:'json',
        }).then((resp)=>{
            if(resp.status==200){
                this.setState({
                    rows:resp.data.users
                })
            }else{
                this.setState({errMsg:'查询请求出错！'})
            }
            this.setState({loading:false})
            }
        )
    }


    render(){
        let {channel_id,channel_name,sales_depart_id,query,loading,rows} = this.state;
        let user_info=((window.NS||{}).userInfo||{}).user_info||{};
        let sales_departs=user_info.charge_departs
        let privs=user_info.privs;
        let headers=['手机号','姓名','渠道','区分','修改'];
        return <div>
            <Paper style={{padding:'5px 20px', margin:'5px 0px'}} zDepth={2}>
                <div>筛选条件： </div>
                <div style={{display:'inline-block', marginRight:20}}>
                    <label style={{fontSize:12,
                        color:'rgba(0, 0, 0, 0.3)'}}>渠道</label>
                    <SelectField disabled={true}
                                 value={channel_id}
                                 labelStyle={{fontSize:12, lineHeight:4, textAlign:'center'}}
                                 style ={{display:'inline-block' ,
                                     lineHeight: 24,
                                     verticalAlign:'middle',
                                     width:150,
                                     height:40,}}>
                        <MenuItem value={channel_id} primaryText={channel_name}/>
                    </SelectField>
                    <label style={{fontSize:12,
                        color:'rgba(0, 0, 0, 0.3)'}}>区分</label>
                    <SelectField value={sales_depart_id} onChange={(e,i,sales_depart_id)=>{this.setState({sales_depart_id})}}
                                 labelStyle={{fontSize:12, lineHeight:4, textAlign:'center'}}
                                 style ={{display:'inline-block' ,
                                     lineHeight: 24,
                                     verticalAlign:'middle',
                                     width:150,
                                     height:40,}}>
                        <MenuItem value={null} primaryText={'请选择'}/>
                        {sales_departs.map((d,i)=>(
                            <MenuItem key={'f-' + i} value={d.sales_depart_id}
                                      primaryText={d.sales_depart_name}/>))}
                    </SelectField>
                </div>
                <TextField hintText="姓名/手机号"
                           value = {query}
                           onChange = {(e,query)=>{this.setState({query})}}
                           style ={{display:'inline-block',
                               fontSize: 14,
                               verticalAlign:'middle',
                               width:150,
                               height:40,}} />
                <RaisedButton label="查找" primary={true}
                          onClick = {this.getUser.bind(this)}
                          disabled ={loading}
                          style ={{ height:30,
                              width: 50 ,
                              marginLeft: 20
                          }} />
                {privs.map((p)=>{
                    if(p=='PRIV_ADMIN_SUPER'){
                        return (
                            <Link to='/pos/type'>
                            <RaisedButton label="管理促销点类型" primary={true}
                                          disabled={loading}
                                          style={{height:30,width:50,marginLeft:20}}/>
                            </Link>
                        )
                }})
                }
            </Paper>
            { loading? <CircularProgress size={40} thickness={3}/>:
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
                                        <TableRowColumn>{r.mobile}</TableRowColumn>
                                        <TableRowColumn>{r.user_name}</TableRowColumn>
                                        <TableRowColumn>{r.channel_name}</TableRowColumn>
                                        <TableRowColumn>{r.sales_depart_name}</TableRowColumn>
                                        <TableRowColumn>
                                            <Link to={'/admin/manager/'+r.user_id}>修改</Link>
                                        </TableRowColumn>
                                    </TableRow>
                                )})
                            }
                            </TableBody>
                    </Table>
                </div>
            }
        </div>
    }
}

exports.AdminManager=AdminManager;