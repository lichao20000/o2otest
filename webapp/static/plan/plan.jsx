import Toggle from 'material-ui/Toggle'; import RaisedButton from 'material-ui/RaisedButton';

import Divider from 'material-ui/Divider';
import Select from 'react-select'
import  AsyncSelect from 'react-select/lib/Async'
import MultipleDatePicker from 'react-multiple-datepicker'
import Dialog from 'material-ui/Dialog';

import Snackbar from 'material-ui/Snackbar';
import CircularProgress from 'material-ui/CircularProgress';
import TextField from 'material-ui/TextField';
import { Table, TableBody, TableHeader, TableHeaderColumn, 
  TableRow, TableRowColumn,
} from 'material-ui/Table';
import FlatButton from 'material-ui/FlatButton';
import FontIcon from 'material-ui/FontIcon';
import ActionCheckCircle from 'material-ui/svg-icons/action/check-circle';
import ActionDone from 'material-ui/svg-icons/action/done';
import AlertError from 'material-ui/svg-icons/alert/error';



class Plan extends React.Component{
  constructor(props){
    super(props);
    let user_info = (((window.NS||{}).userInfo||{}).user_info||{});
    this.state = {
      loading: false ,
      sending: false,
      rows:[],
      user_info,
      imported: false,
      percentCompleted: 0,
      showCheckedDialog: false,
      read:false,
      posText:'',
      salerText: '',
      days:'',
      errMsg:'',
      dates:[],
    }
  }
  
  onChoose(e){
    let file = e.target.files[0];
    this.setState({file: file, fileName:file.name, sending: true})
    let dataForm = new FormData();
    dataForm.append('file', file);
    let config = {
      onUploadProgress:(e)=>{
        let percentCompleted = Math.round( (e.loaded * 100) /e.total );
        this.setState({percentCompleted})
      },
      headers: { 'Content-Type': 'multipart/form-data' } 
    };
    axios.post('/upload/read_excel', dataForm, config)
      .then((resp)=>{
        let read = resp.data.result;
        let rows = []
        if(read){
          rows = resp.data.rows;
          if(rows.length){
            rows.splice(0,1)
          }
        }
        let percentCompleted = 0;
        this.setState({read, rows, percentCompleted, sending: false})
      }
      ).catch((err)=>{
        let percentCompleted = 0;
        let errMsg = '上传失败';
        this.setState({percentCompleted, errMsg, sending: false}) 
      })
  }

  getPos(query, callback){
    let args = {query,deleted:0};
    axios({
      url: '/pos/api/get_pos_list.json' ,
      transformRequest:[ function(data, headers) {
        let _data =  []
        for(let k in data){
          _data.push(k+'='+ (data[k]==null?'':data[k]))
        }
        return  _data.join('&')
      }],
      data: args,
      method: 'post',
      responseType:'json',
    }).then( (resp) =>{
      if(resp.status == 200){
        if(resp.data instanceof Array){
          let options = resp.data.map((d)=>{
            d.label = 'ID '+d.pos_id +':'+ d.pos_name;
            d.value = d.pos_id
            return d
          })
          callback(options)
        }else{
          callback([])
          this.setState({ errMsg: '请求数据出错'})
        }
      }else{
        this.setState({ errMsg: '请求出错!'})
      }
      this.setState({loading: false})
    })
  }

  getSaler(q, callback){
    let args = {q,deleted:0};
    axios({
      url: '/saler/api/get_saler_list.json' ,
      transformRequest:[ function(data, headers) {
        let _data =  []
        for(let k in data){
          _data.push(k+'='+ (data[k]==null?'':data[k]))
        }
        return  _data.join('&')
      }],
      data: args,
      method: 'post',
      responseType:'json',
    }).then( (resp) =>{
      if(resp.status == 200){
          let options = resp.data.salers.map((d)=>{
            d.label = d.mobile+':'+ d.saler_name;
            d.value = d.mobile
            return d
          })
          callback(options)
      }else{
        this.setState({ errMsg: '请求出错!'})
      }
      this.setState({loading: false})
    })
  }
  
  onChoosePos(pos){
    if(!pos.pos_id){
      return
    }
    let {posText} = this.state;
    posText =  `${pos.pos_id} ${pos.pos_name} `  +'\n' + posText
    this.setState({posText})
  }

  onChooseSaler(saler){
    let {salerText } = this.state;
    if(!saler.mobile){
      return
    }
    salerText=`${saler.mobile} ${saler.saler_name} `+'\n'+salerText
    this.setState({salerText})
  }

  renderForm(){
    let {tabid, imported, fileName, sending, salerText, days,
        loading, posText ,errDays }= this.state
    return (<div>
      <h4 style={{fontSize:14, color:'#333'}}> 促销时间</h4>
      <div className='multi-date'>
      <MultipleDatePicker
        onSubmit={dates=>this.setState({dates})}
        minDate={new Date()}/>
      </div>
      <h4 style={{fontSize:14, color:'#333'}}> 促销点</h4>
      <AsyncSelect
        value ={null}
        placeholder='输入 名称/位置 搜索'
        onChange={this.onChoosePos.bind(this)}
        loadOptions={this.getPos.bind(this)}
         />
      <textarea style={{minWidth:'100%',
          minHeight: 100, marginBottom:10}}
          placeholder='促销点的系统ID(可以在上方搜索),区分范围内的促销点多条换行隔开'
          value = {posText}
          onChange = {e=>this.setState({posText:e.target.value})}
      />
      <Divider />
      <h4 style={{fontSize:14, color:'#333'}}> 促销人员</h4>
      <AsyncSelect
        value={null}
        placeholder='输入 姓名/电话 搜索'
        onChange={this.onChooseSaler.bind(this)}
        loadOptions={this.getSaler.bind(this)}
         />
      <textarea style={{minWidth:'100%',
        minHeight: 100}}
        placeholder='促销人员的手机号(11位)多条换行隔开'
        value={salerText}
        onChange = {e=>this.setState({salerText:e.target.value})}
      />
      <Divider />
      <h4 style={{fontSize:14, color:'#333'}}> 促销天数</h4>
      <TextField hintText="促销天数"
              value = {days}
              errorText = {errDays}
              onChange = {(e, days)=>{
                let errDays = ''
                if(!days.match(/^\d+$/)){
                  errDays = '请填写正确的数字'
                }
                this.setState({days, errDays})
              }}
              style ={{display:'inline-block' ,
                    fontSize: 14,
                    verticalAlign:'middle',
                    width:150,
                    height:40,}} />
        
     </div>) 
  }

  renderImport(){
    let {tabid, imported, fileName, sending, loading }= this.state
    return (
    <div> 
      <input ref='fileExcel' type='file' id='file' 
    onChange={this.onChoose.bind(this)}
    style={{display:'none'}}/>
      {sending?  [ <CircularProgress
        mode="determinate"
        size={20}
        thickness = {2} 
        style ={{dsplay:'inline-block'}} 
        value={percentCompleted} key = 'c' />,
        <div key='l' 
        style={{fontSize:12, 
            color:'#888',
            display:'inline-block', 
            width:60, textAlign:'center'}}>
        {percentCompleted}%</div>]:
        <RaisedButton  primary={true} label='选择文件'
        disabled = {sending || loading}
        onClick={(e)=>{this.refs['fileExcel'].click(e)}} /> 
      }
      <label style={{fontSize:14, color:'#333'}}> 
      {fileName} </label>

      </div>  )
  }

  onCancel(){
    this.setState({showCheckedDialog:false,
          checked: false,
          read: false, 
          checkResult:'',
          rows: []
    }) 
  }

  onNext(){
  }

  renderRows(){
    let { rows, imported} = this.state;
    let headers = ['序号','促销点ID', '促销时间', '促销人员手机号']
    return (
      <div style={{    overflow: 'hidden', }}>
        <Table fixedHeader={true} 
              displaySelectAll={false} 
              height={'500px'}>
          <TableHeader displaySelectAll={false} 
                    adjustForCheckbox={false}> 
          <TableRow>
            { headers.map((h,idx)=>{
                return (
                <TableHeaderColumn key={idx}>{h}</TableHeaderColumn>
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
                <TableRowColumn>
                  {r.status==1&& <ActionCheckCircle color='#ccc' style={iconStyle}/> }
                  {r.status==2&& <CircularProgress thickness={2} style={iconStyle} size={18}/>}
                  {r.status==3&& <ActionCheckCircle color='#0d0' style={iconStyle}/> }
                  {r.status==4&&  <AlertError color='red' style={iconStyle}/> }
                  {r.idx+1}
                </TableRowColumn>
                <TableRowColumn >
                    <label style={{'color':'red', fontSize:10}}>{r.msg}</label> 
                </TableRowColumn>
                <TableRowColumn>{r['pos_id']}</TableRowColumn>
                <TableRowColumn>{r['mobiles']}</TableRowColumn>
                <TableRowColumn>{r['days']}</TableRowColumn>
              </TableRow>
                )})
              }
            </TableBody>
          </Table>
          </div> 
    )
  }


  getRows(){
    let {posText,days ,salerText, dates, imported,
      } = this.state;
    if(!imported){
      if(!days || !days.match(/^\d+$/)){
        this.setState({errDays:'请填写正确的数字'})
        return false
      }
      let pos_ids = posText.split('\n').map((p)=>{
        let match = p.match(/^\d+/);
        return  match ? match[0]: 0
      }).filter(i=>i)
      let saler_mobiles = salerText.split('\n').map((p)=>{
        let match = p.match(/^\d+/);
        return  match ? match[0]: 0 
      }).filter((i)=>(i && i.length==11 && !!i.match(/^\d+$/)))
      let yymmdds = dates.map((d)=>{
        let mm = d.getMonth()+1
        mm = mm>9 ? mm: '0' + mm
        return ''.concat(d.getFullYear(),'')
                 .concat(mm, "")
                 .concat(d.getDate(),"")
      })
      // 去重
      let _pos_ids = []
      pos_ids.map((i)=>{
        if(_pos_ids.indexOf(i)==-1){
          _pos_ids.push(i)
        }
      })
      let _saler_mobiles = []
      saler_mobiles.map((i)=>{
        if(_saler_mobiles.indexOf(i)==-1){
          _saler_mobiles.push(i)
        }
      })
      saler_mobiles = _saler_mobiles
      pos_ids = _pos_ids
      if(!pos_ids.length || !saler_mobiles.length || !yymmdds){
        let errMsg=!saler_mobiles.length ? '请正确填写促销人员手机号':''
        errMsg=!yymmdds.length ? '请选择促销日期':errMsg
        errMsg=!pos_ids.length ? '请正确填写促销点ID':errMsg
        console.info(errMsg)
        this.setState({errMsg}) 
        return false
      }
      let rows = []
      console.info(pos_ids, yymmdds, days)
      for(let i =0 ; i<pos_ids.length; i++){
        for(let j=0; j<yymmdds.length; j++) {
          let pos_id = pos_ids[i]
          let status = 1
          rows.append({ pos_id, saler_mobiles, days, status})
        }
      }
      console.info(rows)
      this.setState({rows})
      return true
    }else{

    
    }
  }

  renderCheckDialog(){
    let {sending,checked, read} = this.state;
    return (
      <Dialog
      title="即将要导入的数据"
      actions={sending?
        [<div  style ={{height:38 , paddingRight:80}}>
          <CircularProgress thickness={2} size={18} />
          <label style={{fontSize:14, color:'#ff5722'}}>
            数据{checked?'导入':'检查'}中...</label>
          <div style ={{width:80, textAligin: 'center'}}> </div>

          </div>
        ]
        : [ 
          checked?<label> {checkResult}</label>:null,
          <FlatButton
          label="取消"
          primary={true}
          onClick={this.onCancel.bind(this)}
          />,
          <FlatButton
          label="下一步"
          primary={true}
          onClick={this.onNext.bind(this)}
          />, ]}
      modal={true}
      contentStyle={{width:'100%', height:'100%', maxWidth:'none'}}
      open={true}
      >
      {this.renderRows() }
      </Dialog>
    ) 
  }

  render(){
    let  {tabid, imported, fileName, sending, loading ,
          showCheckedDialog, errMsg,
          }= this.state
    return (
      <div style ={{padding: 10}}>
        <h3>促销排产 </h3>
        <Toggle label='Excel导入' toggled={imported} 
          style={{width:150}}
          disabled = {sending || loading}
          onToggle ={(e, imported)=>{this.setState({imported})}} />
      { imported ? this.renderImport() : this.renderForm() }
      {showCheckedDialog && this.renderCheckDialog()}
        <div>
          <RaisedButton  primary={true} label='下一步'
            onClick={e=>this.setState({
              showCheckedDialog:true && this.getRows() })}
            style ={{float:'right'}}
            />
        </div>
      <Snackbar 
        open={!!errMsg}
        message={errMsg}
        style ={{textAlign: 'center'}}
        autoHideDuration={3000}
        onRequestClose={(e)=>{this.setState({errMsg:''})}}
        />
      </div>
    ) 
  }

}

exports.Plan = Plan;
