
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
    },
    toggle:{
        display:'inline-block',
        width:'20%',
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
            changeItems:{},
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
        if (privs.some((p)=>(p=='PRIV_ADMIN_SUPER'))) {
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
        let {user_id}=this.state;
        let args={user_id};
        axios({
            url: '/user/api/get_user_tag.json',
            transformRequest: [function (data) {
                let _data = []
                for (let k in data) {
                    _data.push(k + '=' + data[k])
                }
                return _data.join('&')
            }],
            data: args,
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
        let {changeItems,user_id}=this.state;
        changeItems['user_id']=user_id
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
            data:changeItems,
            method: 'post',
            responseType: 'json',
        }).then((resp) => {
            if (resp.status == 200) {
                if(resp.data.result){
                    history.push('/admin/manager')
                }else{
                    this.setState({errMsg:resp.data.msg})
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
        let user_info=((window.NS || {}).userInfo || {}).user_info || {};
        let privs=user_info.privs||[];
        let channel_name=user_info.channel_name||'';
        let charge_departs_info=user_info.charge_departs_info||[];
        let {user,changeItems,channel_id,channels,sales_depart_id,departs,user_name}=this.state;
        return (
                <div>
                    <label style={style.label}>手机</label>
                    <TextField disabled = {true}
                           underlineShow={true}
                           value= {user['mobile']}
                           style={style.textfiled}/>
                    {
                        privs.some((p)=>(p=="PRIV_ADMIN_SUPER"))?
                        [<label key={'l-1'} style={style.label}>渠道</label>,
                        <SelectField value={channel_id}
                                     key={'s-1'}
                                     onChange={(e,key,channel_id)=>{
                                         if(channel_id!=user['channel_id']){
                                             changeItems['channel_id']=channel_id}
                                         else{
                                             delete changeItems['channel_id']
                                         }
                                         this.setState({channel_id});}}
                                     style={style.selectfield}
                        >
                        {
                            channels.map((c,idx)=>(
                                <MenuItem key={'c-'+idx} value={c.channel_id} primaryText={c.channel_name}/>
                            ))
                        }
                        </SelectField>,
                        <label key={'l-2'} style={style.label}>区分</label>,
                        <SelectField value={sales_depart_id}
                                     key={'s-2'}
                                     onChange={(e,key,sales_depart_id)=>{
                                         if (sales_depart_id !=user['sales_depart_id']){
                                         changeItems['sales_depart_id']=sales_depart_id}
                                         else{
                                             delete changeItems['sales_depart_id']
                                         }
                                         this.setState({sales_depart_id:sales_depart_id})}}
                                     style={style.selectfield}
                        >
                        {
                            departs.filter((d)=>(d['channel_id']==channel_id
                            )).map((d,idx)=>(
                                <MenuItem key={'d-'+idx} value={d.sales_depart_id} primaryText={d.sales_depart_name}/>
                            ))
                        }
                        </SelectField>,
                        ]
                        :[<label style={style.label}>渠道</label>,
                        <TextField underlineShow={true}
                                   disabled = {true}
                                   value={channel_name}
                                   style={style.textfiled}
                        />,
                        <label style={style.label}>区分</label>,
                        <SelectField value={sales_depart_id}
                                     onChange={(e,key,sales_depart_id)=>{
                                         if(sales_depart_id!=user['sales_depart_id']){
                                         changeItems['sales_depart_id']=sales_depart_id}
                                         else{
                                             delete changeItems['sales_depart_id']
                                         }
                                         this.setState({sales_depart_id:sales_depart_id})}}
                                     style={style.selectfield}
                        >
                        {
                            charge_departs_info.map((d,idx)=>(
                                <MenuItem key={'d-'+idx} value={d.sales_depart_id} primaryText={d.sales_depart_name}/>
                            ))
                        }
                        </SelectField>,
                        ]
                    }
                    <label key={'l-3'} style={style.label}>姓名</label>
                    <TextField underlineShow={true}
                               value= {user_name}
                               onChange={(e,user_name)=>{
                                   if(user_name!=user['user_name']){
                                       changeItems['user_name']=user_name;
                                   }else{
                                       delete changeItems['user_name']
                                   }
                                   this.setState({user_name})}}/>
                </div>
        )
    }


    render() {
        let {user,privs,errMsg,loading,changeItems} = this.state;
        let {tags}=this.state;
        return (
            <div style={{padding: 20}}>
                <Paper style={{height:'100%', width:'100%', display:'inline-block', textAlign:'center'}}>
                    <h4>基本信息</h4>
                    {this.renderInfo()}
                </Paper>
                <Divider/>
                <Paper style={style.paper}>
                    <h4>权限管理</h4>
                    {
                        privs.map((p,i)=>(<Toggle label={p.label}
                                                  defaultToggled={p.state}
                                                  onToggle={(e,v)=>{if(v==p.state){delete changeItems[p['priv']]}
                                                  else{changeItems[p['priv']]=v}}}
                                                  key={'p-'+i}
                                                  style={style.toggle}/>))
                    }
                </Paper>
                <Divider/>
                <Paper style={style.paper}>
                    <h4>类型管理</h4>
                    {
                        tags.map((t, i) => (<Toggle label={t.tag_label}
                                                    defaultToggled={t.status}
                                                    onToggle={(e, v)=>{if(v==t.status){delete changeItems[t['tag_id']]}
                                                        else{changeItems[t['tag_id']]=v}}}
                                                    key={'t-' + i}
                                                    style={style.toggle}/>
                        ))
                    }
                </Paper>
            {loading? < CircularProgress size={40} thickness={3} />:
                <div>
                <Route render={({ history}) => (
                    <RaisedButton label="保存更改" primary={true}
                                  onClick = {()=>(this.setData(history))}
                                  style={style.button}
                    />
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


