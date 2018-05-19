
import { Route, Link } from 'react-router-dom'

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
import Paper from 'material-ui/Paper'


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
    textfiled:{
        width:'15%',
        display:'inline-block'
    },
    selectfield:{
        display:'inline-block',
        verticalAlign:'middle',
    }
};



class AdminEditor extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            loading: false,
            sending: false,
            user_id: props.match.params.user_id,
            user: {},
            privs:[],
            errMsg: '',
            changeItems: [],
            channels:[],
            channel_id:null,
            departs:[],
            sales_depart_id:null,
            user_name:null,
            tags:[],
        }
    }

    componentDidMount() {
        this.getInfo();
        this.getPriv();
        this.getTag();
    }

    getPriv() {
        this.setState({loading: true});
        let {user_id} = this.state;
        let args={user_id};
        axios({
            url: '/user/api/get_user_privs.json',
            transformRequest: [function (data, headers) {
                let _data = []
                for (let k in data) {
                    _data.push(k + '=' + data[k])
                }
                return _data.join('&')
            }
            ],
            data: args,
            method: 'post',
            responseType: 'json',
        }).then((resp) => {
            if (resp.status == 200) {
                if(resp.data.result){
                    this.setState({user: resp.data.user,
                        privs:resp.data.privs,
                        channel_id:resp.data.user['channel_id'],
                        sales_depart_id:resp.data.user['sales_depart_id'],
                        user_name:resp.data.user['user_name']})
                } else{
                    this.setState({errMsg:resp.data.msg})
                }
            } else {
                this.setState({errMsg: '请求出错!'})
            }
            this.setState({loading: false})
        })
    }

    getInfo(){
        let privs = (((window.NS || {}).userInfo || {}).user_info || {}).privs || [];
        function checkPrivs(p){
            return p=='PRIV_ADMIN_SUPER'
        }
        if(privs.some(checkPrivs)) {
            axios({
                url: '/user/api/get_user_info.json',
                transformRequest: [function (data, headers) {
                    let _data = []
                    for (let k in data) {
                        _data.push(k + '=' + data[k])
                    }
                    return _data.join('&')
                }],
                data: {},
                method: 'post',
                responseType: 'json',
            }).then((resp) => {
                    if (resp.status == 200) {
                        this.setState({channels: resp.data.channels, departs: resp.data.departs})
                    } else {
                        this.setState({errMsg: '获取渠道、区分数据失败'})
                    }
                }
            );
        }
    }

    getTag(){
        axios({
            url: '/user/api/get_user_tag.json',
            transformRequest: [function (data, headers) {
                let _data = []
                for (let k in data) {
                    _data.push(k + '=' + data[k])
                }
                return _data.join('&')
            }],
            data: {},
            method: 'post',
            responseType: 'json',
        }).then((resp)=>{
            if(resp.status==200){
                if(resp.data.result){this.setState({tags:resp.data.tags})}
                else{
                    this.setState({errMsg:resp.data.msg})
                }
            }else{
                this.setState({
                    errMsg:'请求类型数据失败'
                })
            }
        })
    }

    setData(history){
        this.setState({loading:true});
        let {privs,user_id} = this.state;
        let req=[];
        let reqstate=[];
        for (let p of privs){
            req.push(p['priv']);
            if (p['state']===true){
                reqstate.push(1)
            }else{
                reqstate.push(0)
            }
        }
        let args={req,reqstate,user_id};
        axios({
            url: '/user/api/set_user_privs.json',
            transformRequest: [function (data, headers) {
                let _data = [];
                for (let k in data) {
                    _data.push(k + '=' + data[k])
                }
                return _data.join('&')
            }
            ],
            data:args,
            method: 'post',
            responseType: 'json',
        }).then((resp) => {
            if (resp.status == 200) {
                if(resp.data.result){
                    history.push('/admin/manager')
                }else{
                    this.setState({errMsg:resp.data.errMsg})
                }
            }else{
                this.setState({errMsg: '请求出错!'})
            }
            this.setState({loading: false})
        })
    }

    onChange(key,e,v){
        let {privs}=this.state;
        for(let p of privs){
            if(p['priv']===key){
                p['state']=v
            }
        }
        this.setState({privs:privs});
    }

    onTagChange(e,v,tag_id){
        let {tags}=this.state;
        tags.filter((t)=>(t['tag_id']==tag_id))

    }

    renderInfo(){
        let privs = (((window.NS || {}).userInfo || {}).user_info || {}).privs || [];
        function checkPrivs(p) {
            return p == 'PRIV_ADMIN_SUPER'
        }
        let {user,changeItems,channel_id,channels,sales_depart_id,departs,user_name}=this.state;
        if(privs.some(checkPrivs)){
            return (
                    <div>
                        <label style={style.label}>手机</label>
                        <TextField disabled = {true}
                               underlineShow={true}
                               value= {user['mobile']}
                               floatingLabelFixed={true}
                               style={style.textfiled}/>
                        <label style={style.label}>渠道</label>
                        <SelectField floatingLabelFixed={"渠道"}
                                     value={channel_id}
                                     onChange={(e,key,channel_id)=>{changeItems['channel']=channel_id;
                                     this.setState({channel_id});
                                     }}
                                     style={style.selectfield}
                        >
                        {
                            channels.map((c,idx)=>(
                                <MenuItem key={'c-'+idx} value={c.channel_id} primaryText={c.channel_name}/>
                            ))
                        }
                        </SelectField>
                        <label style={style.label}>区分</label>
                        <SelectField floatingLabelFixed={"区分"}
                                     value={sales_depart_id}
                                     onChange={(e,key,sales_depart_id)=>{changeItems['sales_depart_id']=sales_depart_id;
                                     this.setState({sales_depart_id:sales_depart_id})}}
                                     style={style.selectfield}
                        >
                        {
                            departs.filter(function departFilter(currentValue){
                                return currentValue['channel_id']==channel_id
                            }).map((d,idx)=>(
                                <MenuItem key={'d-'+idx} value={d.sales_depart_id} primaryText={d.sales_depart_name}/>
                            ))
                        }
                        </SelectField>
                        <label style={style.label}>姓名</label>
                        <TextField underlineShow={true}
                                   value= {user_name}
                                   onChange={(e,user_name)=>{changeItems['user_name']=user_name;
                                   this.setState({user_name})}}/>
                    </div>
            )
        }else{
            return(
                <div>
                    <TextField disabled = {true}
                               underlineShow={true}
                               floatingLabelText="手机"
                               value= {user['mobile']}
                               floatingLabelFixed={true}
                               style={style.textfiled}/>
                    <TextField disabled = {true}
                               underlineShow={true}
                               floatingLabelText="渠道"
                               value= {user['channel_name']}
                               floatingLabelFixed={true}
                               style={style.textfiled}/>
                    <TextField disabled = {true}
                               underlineShow={true}
                               floatingLabelText="区分"
                               value= {user['sales_depart_name']}
                               floatingLabelFixed={true}
                               style={style.textfiled}/>
                    <TextField disabled = {true}
                               underlineShow={true}
                               floatingLabelText="姓名"
                               value= {user['user_name']}
                               floatingLabelFixed={true}
                               style={style.textfiled}/>
                </div>
            )
        }
    }


    render() {
        let {user,privs,errMsg,loading} = this.state;
        let {tags}=this.state
        return (
            <div style={{padding: 20}}>
                <Paper style={{height:'100%', width:'100%', display:'inline-block', textAlign:'center'}}>
                    <h4>基本信息</h4>
                    {this.renderInfo()}
                </Paper>
                <Paper style={style.paper}>
                    <h4>权限信息</h4>
                    {
                        privs.map((p,i)=>(<Toggle label={p.label}
                                               defaultToggled={p.state}
                                               onToggle={(e,v)=>{this.onChange(p.priv,e,v)}}
                                               key={'p-'+i}
                                               style={{marginLeft:'25%',width:'25%'}}/>))
                    }
                </Paper>
                <Paper style={style.paper}>
                    <h4>类型管理</h4>
                    {
                        tags.map((t,i)=>(<Toggle label={t.tag_label}
                                    defaultToggled={t.status}
                                    onToggle={(e,v)=>this.onTagChange(e,v,t.tag_id)}
                                    key={'t-'+i}
                                    style={{marginLeft:'25%',width:'25%'}}/>
                        ))
                    }
                </Paper>
            {loading? < CircularProgress size={40} thickness={3} />:
                <div>
                <Route render={({ history}) => (
                    <RaisedButton label="保存更改" primary={true}
                                  onClick = {()=>(this.setData(history))}
                                  style={style.button} />
                )} />
                <Link to='/admin/manager'>
                    <RaisedButton label="取消" style={style.button}  />
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

exports.AdminEditor = AdminEditor;


