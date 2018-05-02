
import Paper from 'material-ui/paper';
import darkBaseTheme from 'material-ui/styles/baseThemes/darkBaseTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme from 'material-ui/styles/getMuiTheme';
import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import Divider from 'material-ui/Divider';
import {Tabs, Tab} from 'material-ui/Tabs';
import Snackbar from 'material-ui/Snackbar';
import CircularProgress from 'material-ui/CircularProgress';

//import { InputLabel, InputAdornment } from 'material-ui/Input';


class Login extends React.Component{

    constructor(props){
        super(props);
        this.state ={
            usernameErr:true,
            pwdErr: true,
            username:'',
            password:'', //  here is phone num
            btnAble: true,
            msg: '',
            loading: false, 
            loading2: false,
            gotCode: false,// got code 
        }
    }

    componentDidMount() {

    }

    checkMsgCode(e){
      this.setState({loading2:true})
      let {msg_code} = this.state;
      axios({
            url: '/u/login_validate.json' ,
            transformRequest:[ function(data, headers) {
                let _data =  []
                for(let k in data){
                    _data.push(k+'='+ data[k])
                }
                return  _data.join('&')
            }
            ],
            data: {'msg_code':msg_code, },
            method: 'post',
            responseType:'json',
        }).then( (resp) =>{
            if(resp.status == 200){
                 if(resp.data.result){
                    window.location = '/'
                 }else{
                  this.setState({ 
                    loading2: false,
                    msg: resp.data.msg
                  })
                 }
            }else{
                this.setState({msg: '请求出错!'})
            }
        })


    }

    getMsgCode(e){
        let {username, password}  = this.state
        if(''==username ){
            this.setState({usernameErr: true})
            return 
        }
        if(''==password){
            this.setState({pwdErr: true})
            return 
        }
        this.setState({loading: true})
        axios({
            url: '/u/msg_code.json' ,
            transformRequest:[ function(data, headers) {
                let _data =  []
                for(let k in data){
                    _data.push(k+'='+ data[k])
                }
                return  _data.join('&')
            }
            ],
            data: {'uni_email': username,
                    'phone': password, },
            method: 'post',
            responseType:'json',
        }).then( (resp) =>{
            if(resp.status == 200){
                  this.setState({ 
                    gotCode: !!resp.data.result,
                    loading: false,
                    msg: resp.data.msg
                  })
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
        let {gotCode,loading,loading2, usernameErr, pwdErr, username, password, msg} = this.state;
        let {btnAble, msg_code} = this.state;

        return (
            <div>
                <MuiThemeProvider >
                    <Paper className='login-paper text-center' zDepth={1}>
                        <div>
                            <img src='/static/images/O2O-128x128.png'/>
                        </div>
                        <Tabs > 
                            <Tab label='OAuth2认证' disabled={loading||gotCode}>
                                <div className ='tab auth2 text-center'>
                                    <RaisedButton label="登入" primary={true}
                                        disabled ={!btnAble}
                                        onClick={(event) => this.oauth2(event)}/>
                                </div>
                            </Tab>
                            {!!window.NS.debug && 
                            <Tab label='短信认证' disabled={loading||gotCode}>
                                <div className='text-center tab' >
                                    <TextField
                                        disabled={loading || gotCode}
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
                                        disabled={loading || gotCode}
                                        floatingLabelText="手机号"
                                        value={password}
                                        onChange = {(event,newValue) => this.setState({password:newValue, pwdErr: newValue==''})}
                                    />
                                    <br/>
                                    { loading ?
                                      <CircularProgress size={40} thickness={3} />:
                                      !gotCode&&
                                      <RaisedButton label="获取验证码" primary={true}  
                                        disabled ={usernameErr ||pwdErr }
                                        onClick={this.getMsgCode.bind(this)}/>
                                    }
                                    {
                                      gotCode&&
                                      <div>
                                        <TextField
                                          hintText="验证码"
                                          disabled = {loading2}
                                          style={{width: 80, display:'inline-block' ,marginRight: 10 }}
                                          value={msg_code}
                                          onChange = {(event,newValue) => this.setState({msg_code:newValue, msgCodeErr: newValue==''})} />
                                        <RaisedButton label="验证"  primary={true}  
                                          disabled = {loading2}
                                          style={{width: 80, display:'inline-block' }}
                                          onClick={this.checkMsgCode.bind(this)}/>
                                      </div>
                                    }


                                </div>

                            </Tab>
                            }

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




