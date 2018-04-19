


import Paper from 'material-ui/paper';
import darkBaseTheme from 'material-ui/styles/baseThemes/darkBaseTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import Divider from 'material-ui/Divider';
import {Tabs, Tab} from 'material-ui/Tabs';
import Snackbar from 'material-ui/Snackbar';

//import { InputLabel, InputAdornment } from 'material-ui/Input';






class Login extends React.Component{

    constructor(props){
        super(props);
        this.state ={
            usernameErr: false,
            pwdErr: false,
            username:'',
            password:'',
            btnAble: true,
            msg: '',
        }
    }

    componentDidMount() {

    }

    login(e){
        let {username, password}  = this.state
        if(''==username ){
            this.setState({usernameErr: true})
            return 
        }
        if(''==password){
            this.setState({pwdErr: true})
            return 
        }
        axios({
            url: '/admin/login.json' ,
            transformRequest:[ function(data, headers) {
                let _data =  []
                for(let k in data){
                    _data.push(k+'='+ data[k])
                }
                return  _data.join('&')
            }
            ],
            data: {'username': username,
                'password': password, },
            method: 'post',
            responseType:'json',
        }).then( (resp) =>{
            if(resp.status == 200){

                if(!resp.data.result){
                    this.setState({msg: resp.data.msg})
                }else{
                    window.location = '/admin'
                }
            }else{
                this.setState({msg: '请求出错!'})
            }
        })

    }


    oauth2(e){
        this.setState({btnAble: false })
        if(!window.redirect_uri || !window.client_id || !window.response_type || !window.auth2_uri){
            this.setState({msg: '获取oath2登入地址失败，请刷新重试！' }) 
        }else{

            let scheme = window.location.protocol;
            let rt = window.response_type;
            let cid = window.client_id;
            let ruri = window.redirect_uri
            let uri = `${window.auth2_uri}?response_type=${rt}&client_id=${cid}&redirect_uri=${scheme}${ruri}`
            window.location = uri;
        }
    }


    render(){
        let {usernameErr, pwdErr, username, password, msg} = this.state;
        let {btnAble} = this.state;

        return (
            <div>
                <MuiThemeProvider >
                    <Paper className='login-paper text-center' zDepth={1}>
                        <div>
                            <img src='/static/images/O2O-128x128.png'/>
                        </div>
                        <Tabs > 
                            <Tab label='OAuth2认证'>
                                <div className ='tab auth2 text-center'>
                                    <RaisedButton label="登入" primary={true}
                                        disabled ={!btnAble}
                                        onClick={(event) => this.oauth2(event)}/>
                                </div>
                            </Tab>
                            <Tab label='短信认证'>
                                <div className='text-center tab' >
                                    <TextField
                                        style={{width: 126, display:'inline-block' }}
                                        hintText="集团邮箱"
                                        floatingLabelText="集团邮箱"
                                        value={username}
                                        onChange = {(event,newValue) => this.setState({username:newValue, usernameErr: newValue==''})}
                                        / >
                                        <span className='suffix'>@chinaunicom.cn</span>

                                    <br/>
                                    <TextField
                                        hintText="手机号"
                                        floatingLabelText="手机号"
                                        value={password}
                                        onChange = {(event,newValue) => this.setState({password:newValue, pwdErr: newValue==''})}
                                    />
                                    <br/>
                                    <RaisedButton label="获取验证码" primary={true}  
                                        disabled ={!btnAble}
                                        onClick={(event) => this.auth2(event)}/>
                                </div>

                            </Tab>

                        </Tabs> 

                        <Snackbar 
                        open={!!msg}
                        message={msg}
                        autoHideDuration={3000}
                        onRequestClose={(e)=>{this.setState({msg:''})}}
                        />
                        <small className='copy-right'>&copy; 2018 广州联通信息化服务中心 </small>
                    </Paper>
                </MuiThemeProvider>

            </div> 
        )

    }
}





ReactDOM.render(<Login/>, document.getElementById('divLogin'))




