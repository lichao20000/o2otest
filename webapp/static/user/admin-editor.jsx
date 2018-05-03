
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
        }
    }

    componentDidMount() {
        this.getData();
        console.log(this.state.user)
    }


    getData() {
        this.setState({loading: true});
        let {user_id} = this.state
        let args={user_id}
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
                    this.setState({user: resp.data.user, privs:resp.data.privs})
                } else{
                    this.setState({errMsg:resp.data.msg})
                }
            } else {
                this.setState({errMsg: '请求出错!'})
            }
            this.setState({loading: false})
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

    render() {
        let {user,privs,errMsg,loading} = this.state;
        let style = { margin: 12, float:'right'};
        return (<div style={{padding: 20}}>
            <TextField style ={{width:'100%'}}
                       disabled = {true}
                       underlineShow={false}
                       floatingLabelText="手机号"
                       value= {user['mobile']}
                       floatingLabelFixed={true}
                       onChange={this.fuck}/>
            <Divider />
            <TextField style ={{width:'100%'}}
                       disabled = {true}
                       underlineShow={false}
                       floatingLabelText="渠道"
                       value= {user['channel_name']}
                       floatingLabelFixed={true}
                       onChange={this.fuck}/>
            <Divider />
            <TextField style ={{width:'100%'}}
                       disabled = {true}
                       underlineShow={false}
                       floatingLabelText="区分"
                       value= {user['sales_depart_name']}
                       floatingLabelFixed={true}
                       onChange={this.fuck}/>
            <Divider />
            <TextField style ={{width:'100%'}}
                       disabled = {true}
                       underlineShow={false}
                       floatingLabelText="姓名"
                       value= {user['user_name']}
                       floatingLabelFixed={true}
                       onChange={this.fuck}/>
            <Divider/>
            {privs.map((p,i)=>(<Toggle label={p.label}
                                       defaultToggled={p.state}
                                       onToggle={(e,v)=>{this.onChange(p.priv,e,v)}}
                                       key={'p-'+i}
                                       style={{width:'30%'}}/>))}


            {loading? < CircularProgress size={40} thickness={3} />:
                <div>
                <Route render={({ history}) => (
                    <RaisedButton label="保存更改" primary={true}
                                  onClick = {()=>(this.setData(history))}
                                  style={style} />
                )} />
                <Link to='/admin/manager'>
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

exports.AdminEditor = AdminEditor;


