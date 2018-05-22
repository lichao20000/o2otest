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


const style={
    label:{
        fontSize:16,
        color:'rgba(0, 0, 0, 0.3)',
        display:'inline-block'
    },
    paper:{height:'100%',
        width:'100%',
        display:'inline-block',
        textAlign:'center'},
    button:{
        margin: 12, float:'right'
    },
    textfield:{
        width:'15%',
        display:'inline-block'
    },
    selectfield:{
        display:'inline-block',
        verticalAlign:'middle',
    },
    toggle:{
        display:'inline-block',
        width:'20%',
    }
};

function isEmptyObject(obj){
    for(var key in obj){
        return false
    }
    return true
}

class SalerEditor extends React.Component{
    constructor(props){
        super(props);
        this.state = {
            loading: false,
            sending: false,
            mobile : props.match.params.mobile,
            saler:{},
            errMsg:'',
            changeItems:{},
            channels:[],
            channel_id:null,
            departs:[],
            sales_depart_id:null,
            saler_name:null,
            unit:null,
            toggled:true,
        }
    }
    componentDidMount(){
        this.getChannelsDeparts();
        this.getData()
    }

    componentWillUnmout(){
        this.unmount = true;
    }

    setData(history){
        this.setState({sending: true})
        let {mobile, changeItems } = this.state;
        changeItems['mobile']=mobile
        axios({
            url: '/saler/api/update_saler.json' ,
            transformRequest:[ function(data, headers) {
                let _data =  []
                for(let k in data){
                    _data.push(k+'='+ data[k])
                }
                return  _data.join('&')}],
            data:changeItems,
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
                this.setState({ errMsg: '请求出错!'})}
            if(!this.unmount){
                this.setState({sending: false})}
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
                return  _data.join('&')}
                ],
            data: {'mobile':this.state.mobile, },
            method: 'post',
            responseType:'json',
        }).then( (resp) =>{
            if(resp.status == 200){
                if(resp.data.salers instanceof Array){
                    this.setState({
                        saler: resp.data.salers[0]||{},
                        channel_id:resp.data.salers[0].channel_id,
                        sales_depart_id:resp.data.salers[0].sales_depart_id,
                        saler_name:resp.data.salers[0].saler_name,
                        unit:resp.data.salers[0].unit})
                    if(resp.data.salers[0].deleted==0){
                        this.setState({toggled:true})
                    }else if(resp.data.salers[0].deleted==1){
                        this.setState({toggled:false})
                    }
                }else{
                    this.setState({ errMsg: '请求数据出错'})}
            }else{
                this.setState({ errMsg: '请求出错!'})}
            this.setState({loading: false})
        })
    }

    getChannelsDeparts(){
        let privs=(((window.NS||{}).userInfo||{}).user_info||{}).privs||[];
        this.setState({loading:true});
        if(privs.some((p)=>(p=='PRIV_ADMIN_SUPER'))){
            axios({
                url:'/user/api/get_channels_departs.json',
                transformRequest:[ function(data, headers) {
                let _data =  []
                for(let k in data){
                    _data.push(k+'='+ data[k])
                }
                return  _data.join('&')}
                ],
                data: {},
                method: 'post',
                responseType:'json',
            }).then((resp)=>{
                if(resp.status==200){
                    this.setState({
                        channels:resp.data.channels,
                        departs:resp.data.departs
                    })
                }else{
                    this.setState({
                        errMsg:'请求渠道和区分数据失败'
                    })
                }
            this.setState({loading:false})
            })
        }
    }


    renderInfo(){
        let {saler,changeItems,channels,departs,channel_id,sales_depart_id,saler_name,unit,toggled}=this.state;
        let privs=(((window.NS||{}).userInfo||{}).user_info||{}).privs||[];
        let charge_departs_info=(((window.NS||{}).userInfo||{}).user_info||{}).charge_departs_info||[];
        return(
            <div style={{display:'inline_block'}}>
                <label style={style.label}>手机号</label>
                <TextField disabled={true}
                           underlineShow={true}
                           value={saler['mobile']}
                           style={style.textfield}
                />
                {privs.some((p)=>(p=='PRIV_ADMIN_SUPER'))?
                [
                    <label style={style.label}>渠道</label>,
                    <SelectField value={channel_id}
                                 onChange={(e,v,channel_id)=>{
                                     if(channel_id!=saler['channel_id']){
                                         changeItems['channel_id']=channel_id
                                     }else{
                                         delete changeItems['channel_id']
                                     }
                                     this.setState({channel_id})
                                 }}
                                 style={style.selectfield}>
                        {
                            channels.map((c,idx)=>(
                                <MenuItem key={'c-'+idx} value={c.channel_id} primaryText={c.channel_name}/>
                            ))
                        }
                    </SelectField>,
                    <label style={style.label}>区分</label>,
                    <SelectField value={sales_depart_id}
                                 onChange={(e,v,sales_depart_id)=>{
                                     if(sales_depart_id!=saler['sales_depart_id']){
                                         changeItems['sales_depart_id']=sales_depart_id
                                     }else{
                                         delete changeItems['sales_depart_id']
                                     }
                                     this.setState({sales_depart_id})
                                 }}
                                 style={style.selectfield}
                    >
                        {
                            departs.filter((d)=>(d.channel_id==channel_id)).map((d,idx)=>(
                                <MenuItem key={'d-'+idx} value={d.sales_depart_id} primaryText={d.sales_depart_name}/>
                            ))
                        }
                    </SelectField>
                ]:
                [
                    <label style={style.label}>渠道</label>,
                    <TextField disabled={true}
                               underlineShow={true}
                               value={saler['channel_name']}
                               style={style.textfield}
                    />,
                    <label style={style.label}>区分</label>,
                    <SelectField value={sales_depart_id}
                                 onChange={(e,v,sales_depart_id)=>{
                                     if(sales_depart_id!=saler['sales_depart_id']){
                                         changeItems['sales_depart_id']=sales_depart_id
                                     }else{
                                         delete changeItems['sales_depart_id']
                                     }
                                     this.setState({sales_depart_id})
                                 }}
                                 style={style.selectfield}
                    >
                        {
                            charge_departs_info.map((d,idx)=>(
                                <MenuItem key={'d-'+idx} value={d.sales_depart_id} primaryText={d.sales_depart_name}/>
                            ))
                        }
                    </SelectField>
                ]}
                <label style={style.label}>姓名</label>
                <TextField underlineShow={true}
                           value={saler_name}
                           onChange={(e,saler_name)=>{if(saler_name!=saler['saler_name']){
                               changeItems['saler_name']=saler_name
                           }else{
                               delete changeItems['saler_name']
                           }
                           this.setState({saler_name})
                           }}
                           style={style.textfield}
                />
                <label style={style.label}>单元</label>
                <TextField underlineShow={true}
                           value={unit}
                           onChange={(e,unit)=>{if(unit!=saler['unit']){
                               changeItems['unit']=unit
                           }else{
                               delete changeItems['unit']
                           }
                           this.setState({unit})
                           }}
                           style={style.textfield}
                />
                <label style={style.label}>创建人ID</label>
                <TextField disabled={true}
                           underlineShow={true}
                           value={saler['create_user_id']}
                           style={style.textfield}
                />
                <label style={style.label}>失效/生效</label>
                <Toggle defaultToggled={toggled}
                        onToggle={(e,v)=>{
                            if(v){
                                if(saler['deleted']==1){
                                    changeItems['deleted']=0
                                }else{
                                    delete changeItems['deleted']
                                }
                            }else{
                                if(saler['deleted']==0){
                                    changeItems['deleted']=1
                                }else{
                                    delete changeItems['deleted']
                                }
                            }
                            this.setState({toggled:v})
                        }}
                        toggled={toggled}
                        style={style.toggle}
                />
                <label style={style.label}>发展人编码</label>
                <TextField disabled={true}
                           underlineShow={true}
                           value={saler['develop_id']}
                />
            </div>
        );
    }

    render(){
        let {loading, sending, mobile, saler, errMsg, changeItems} =this.state;
        let style = { margin: 12, float:'right'};
        let sales_departs = (((window.NS||{}).userInfo||{}).user_info||{}).charge_departs_info||[];
        return(
            <div>
            <Paper>
                <h4>基本信息</h4>
                {this.renderInfo()}
            </Paper>
            <Paper>
                <h4>打点类型</h4>
            </Paper>
                {loading||sending?
                    < CircularProgress size={40} thickness={3} />:
                    <div>
                        <Route render={({ history}) => (
                            <RaisedButton label="保存更改" primary={true}
                                          disabled={isEmptyObject(changeItems)}
                                          onClick = {()=>(this.setData(history))}
                                          style={style} />
                        )}/>
                        <RaisedButton label="显示更改" primary={true}
                                      onClick={(e)=>{console.log(changeItems)}}/>
                        <Link to='/saler/manager'>
                            <RaisedButton label="取消" style={style}  />
                        </Link>
                    </div>
                }
                <Snackbar open={!!errMsg}
                          message={errMsg}
                          autoHideDuration={3000}
                          onRequestClose={(e)=>{this.setState({errMsg:''})}}/>
            </div>
        )
    }
}

exports.SalerEditor = SalerEditor;


