import RaisedButton from 'material-ui/RaisedButton';
import TextField from 'material-ui/TextField';
import Divider from 'material-ui/Divider';

import Snackbar from 'material-ui/Snackbar';
import CircularProgress from 'material-ui/CircularProgress';
import Subheader from 'material-ui/Subheader';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';

import FlatButton from 'material-ui/FlatButton';
import Dialog from 'material-ui/Dialog';






class AdminSwitch  extends React.Component{
   constructor(props){
        super(props);
        let user_info = (((window.NS||{}).userInfo||{}).user_info||{});
        this.state = {
            loading: false ,
            channels: [],
            channel_id: user_info.channel_id,
            departs:[],
            sales_depart_id: user_info.sales_depart_id,
            open: false,
            sending: false,
            errMsg: '',
            user_info,
        }
    }

    getChannels(){
        this.setState({loading: true})
        axios({
            url: '/user/api/get_channels.json' ,
            transformRequest:[ function(data, headers) {
                let _data =  []
                for(let k in data){
                    _data.push(k+'='+ data[k])
                }
                return  _data.join('&')
            }
            ],
            data: {'top':true, },
            method: 'post',
            responseType:'json',
        }).then( (resp) =>{
            if(resp.status == 200){
                 if(resp.data instanceof Array){
                     let {channel_id, sales_depart_id } = this.state;
                     let channels = resp.data
                     let departs  = [];
                     channels.map((ch, idx) =>{
                         if(ch.channel_id == channel_id){
                             departs = ch.departs
                         }
                     })
                     this.setState({channels, departs})
                 }else{
                    this.setState({ errMsg: '请求数据出错'})
                 }
            }else{
                this.setState({ errMsg: '请求出错!'})
            }
            this.setState({loading: false})
        })
    
    }

    componentDidMount(){
        this.getChannels()
    }

    onChannelChange(e, idx, val){
        console.info(idx, val)
        if(val==null){
            this.setState({channel_id: val,
                sales_depart_id: null,
                departs: [] ,
            })
        } else{
            let {channels} = this.state;
            let selectedChannel = channels[idx-1];
            this.setState({channel_id: val,
                departs: selectedChannel.departs, 
                sales_depart_id: null,
            });
        }
    }

    confirm(){
        let {channel_id, sales_depart_id} = this.state;
        this.setState({sending: true, open:false})
        axios({
            url: '/user/api/admin_set_info.json' ,
            transformRequest:[ function(data, headers) {
                let _data =  []
                for(let k in data){
                    _data.push(k+'='+ data[k])
                }
                return  _data.join('&')
            }
            ],
            data: {channel_id, sales_depart_id },
            method: 'post',
            responseType:'json',
        }).then( (resp) =>{
            if(resp.status == 200){
                 if(resp.data.result){
                     window.location = '/';
                 }else{
                    this.setState({ errMsg: resp.data.msg, sending: false})
                 }
            }else{
                this.setState({ errMsg: '请求出错!', sending: false})
            }
        })
    
    }
 
    render(){
        let {loading, channels, departs, channel_id, errMsg,
                sending, open, sales_depart_id} = this.state;
        return (
            <div style ={{padding: 20 }}> 
                     <h3> 设置渠道和区分信息</h3>
                        {
                            loading ? <CircularProgress size={40} thickness={3} />:
                               [ <div key='qd' >
                                    <SelectField floatingLabelText="渠道" 
                                        disabled={sending}
                                        floatingLabelFixed={true}
                                        className='inline'
                                        value = {channel_id}
                                        onChange= {this.onChannelChange.bind(this) } >
                                        <MenuItem value={null} primaryText="" />
                                        { channels.map((ch, idx)=>{
                                        return ( <MenuItem value={ch.channel_id } key = {idx}
                                                primaryText={ch.channel_name}/>)        
                                        })
                                        }
                                    </SelectField>
                                </div>,
                                <div key= 'qf'>
                                    <SelectField floatingLabelText="区分" 
                                        floatingLabelFixed={true}
                                        disabled={sending}
                                        className='inline'
                                        value = {sales_depart_id}
                                        onChange= {(e, idx, v)=>{this.setState({sales_depart_id: v})} } >
                                        <MenuItem value={null} primaryText="" />
                                        { departs.map((dep, idx)=>{
                                        return ( <MenuItem value={dep.sales_depart_id} key = {idx}
                                                primaryText={dep.sales_depart_name}/>)        
                                        })
                                        }
                                    </SelectField>
                                </div>,
                                   <RaisedButton label='确定'
                                       disabled={sending}
                                       key = 'btn'
                                       disabled = {!channel_id || !sales_depart_id||sending}
                                       onClick= {(e)=>{this.setState({open: true})}}
                                       primary={true}
                                   />,
                                   <Dialog key='dia'
                                      title="请确认"
                                      modal={true}
                                      open={ open}
                                      actions={[ <FlatButton
                                                label="取消"
                                                primary={true}
                                                onClick={()=>{this.setState({open:false})}}
                                              />,
                                              <FlatButton
                                                label="确认"
                                                primary={true}
                                                onClick={this.confirm.bind(this)}
                                              />, ]}
                                      onRequestClose={()=>{this.setState({open: true})}}
                                  > 设置后将不能修改! 此设置将影响可查看的数据范围. </Dialog>,
                                    <Snackbar 
                                        key='msg'
                                        open={!!errMsg}
                                        message={errMsg}
                                        autoHideDuration={3000}
                                        onRequestClose={(e)=>{this.setState({errMsg:''})}}
                                        />
                               ]
                        }

            </div> 
        ) 
    }


}


exports.AdminSwitch = AdminSwitch;
