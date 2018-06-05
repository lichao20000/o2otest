import Toggle from 'material-ui/Toggle';
import RaisedButton from 'material-ui/RaisedButton';

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
import Slider,{Range} from 'rc-slider'


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
      saler_cnt:'',
      errMsg:'',
      dates:[],
      slidervalue:[0,24],
      hours:[],
      texthours:'',
    }
  }

  componentDidMount(){
    this.initSalers();
  }

  initSalers() {
      this.setState({loading: true});
      let args = {q:'',deleted:0};
      axios({
          url: '/saler/api/get_saler_list.json',
          transformRequest: [function (data, headers) {
              let _data = []
              for (let k in data) {
                  _data.push(k + '=' + (data[k] == null ? '' : data[k]))
              }
              return _data.join('&')
          }],
          data:args,
          method: 'post',
          responseType: 'json',
      }).then((resp)=>{
        if (resp.status==200){
          if(resp.data.salers instanceof Array){
            let text='';
            let salers=resp.data.salers;
            for(let s=0;s<salers.length;s++){
                text=salers[s].mobile+''+salers[s].saler_name+''+'\n'+text
            }
            this.setState({salerText:text})
          }else{
            let errMsg='请求促销人员数据失败';
              this.setState({errMsg})
          }this.setState({loading:false})
        }
      })
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
        let _rows = []
        if(read){
          _rows = resp.data.rows;
          if(_rows.length){
            _rows.splice(0,1)
          }
        }
        let rows = _rows.map((r, idx)=>{
          let mobiles = r[3].split(/\D/).filter((d)=>{
            console.info(d)
            return d.match(/^\d+/) && d.length==11
          })
          return {
            pos_id: r[2] ,
            sales_date: r[0],
            saler_cnt: r[4],
            saler_mobiles: mobiles,
              sale_hour:r[1]
          } 
        })
        let percentCompleted = 0;
        this.setState({read, rows, percentCompleted, sending: false,
          showCheckedDialog:true
        })
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
        if(resp.data.rows instanceof Array){
          let options = resp.data.rows.map((d)=>{
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

  onSliderChange=(value)=>{
    this.setState({slidervalue:value});
  };

  sortNumber=(a,b)=>{return a-b};

  onAddTime(e){
    e.preventDefault();
    let {slidervalue,hours}=this.state;
    let length=slidervalue[1]-slidervalue[0];
      for(let i=0;i<length;i++){
        let match=false;
        for(let h=0;h<hours.length;h++){
          if(hours[h]==(slidervalue[0]+i)){
            match=true;
            break
          }}
          if(match==false){hours.push(slidervalue[0]+i)}
      }
      this.setState({texthours:hours.sort(this.sortNumber).toString()})
  };

  onTextArea(e){
    this.setState({texthours:e.target.value});
    let va=e.target.value.split(',');
    if (va.length>25){
      let errMsg='输入促销时间异常，请清空后重新添加';
      this.setState({errMsg})
    }
    else{
      let hours=[];
    for(let i=0;i<va.length;i++){
      if(va[i]!=''){
          if (0<=parseInt(va[i])<=24){
              hours.push(parseInt(va[i]))
          }else{
            let errMsg='输入促销时间异常，请清空后重新添加';
            this.setState({errMsg})
          }
          if (isNaN(parseInt(va[i]))){
            let errMsg='输入促销时间异常，请清空后重新添加';
            this.setState({errMsg})
          }
      }
      this.setState({hours:hours})
    }}
  }

  renderForm(){
    let {tabid, imported, fileName, sending, salerText,saler_cnt,
        loading, posText ,errsaler_cnt,hours,texthours }= this.state;
    let slider={defaultvalue:[0,24],min:0,max:24,step:1};
    let marks={};
    for(let i=0;i<25;i++){
      marks[i]=i.toString()
    }
    return (<div>
      <h4 style={{fontSize:14, color:'#333'}}> 促销日期</h4>
      <div className='multi-date'>
      <MultipleDatePicker
        onSubmit={dates=>this.setState({dates})}
        minDate={new Date()}/>
          <Divider />
      </div>
        <div style={{fontSize:14}}>
            <h4 style={{fontSize:14, color:'#333'}}> 促销时间</h4>
          <Range dot
                 defaultValue={slider.defaultvalue}
                 min={slider.min}
                 max={slider.max}
                 onAfterChange={this.onSliderChange}
                 marks={marks}/>
            <RaisedButton style={{marginTop:20}}
                          label='添加时间'
                          primary={true}
                          onClick={this.onAddTime.bind(this)}/>
          <textarea style={{minWidth:'100%',
              minHeight: 100, marginBottom:10}}
                    value={texthours}
                    placeholder='请在此填写促销的具体小时逗号隔开，例如：9,10,11,15,16,17'
                    onChange={this.onTextArea.bind(this)}/>
        </div>
      <Divider />
      <div style={{fontSize:14}}>
          <h4 style={{fontSize:14, color:'#333'}}> 促销点</h4>
          <a style ={{fontSize: 12}} href='/pos/api/get_file'>我的促销点</a>
      </div>
      <AsyncSelect
        value ={null}
        placeholder='请输入 名称/位置 进行搜索'
        styles={{control:styles=>({...styles, backgroundColor:'#fff',fontSize:10, borderRadius:0 })}}
        noResultsText='搜索无结果'
        onChange={this.onChoosePos.bind(this)}
        loadOptions={this.getPos.bind(this)}
         />
      <textarea style={{minWidth:'100%',
          minHeight: 100, marginBottom:10}}
          placeholder='请输入促销点的系统ID(pos_id)(可以在上方搜索),区分范围内的促销点多条换行隔开,例如:1000 XX营业厅'
          value = {posText}
          onChange = {e=>this.setState({posText:e.target.value})}
      />
      <Divider />
      <div style={{fontSize:14}}>
          <h4 style={{fontSize:14, color:'#333'}}> 促销人员</h4>
          <a  style={{fontSize:12}} href='/saler/api/get_file'>我的促销人员</a>
      </div>
      <AsyncSelect
        value={null}
        placeholder='请输入 姓名/电话 搜索'
        styles={{control:styles=>({...styles, backgroundColor:'#fff',fontSize:10, borderRadius:0 })}}
        onChange={this.onChooseSaler.bind(this)}
        loadOptions={this.getSaler.bind(this)}
         />
      <textarea style={{minWidth:'100%',
        minHeight: 100}}
        placeholder='请输入促销人员的手机号(11位)多条换行隔开,例如:18620000000 张三'
        value={salerText}
        onChange = {e=>this.setState({salerText:e.target.value})}
      />
      <Divider />
      <h4 style={{fontSize:14, color:'#333'}}> 应到人数</h4>
      <TextField hintText="请输入应到人数"
              value = {saler_cnt}
              errorText = {errsaler_cnt}
              onChange = {(e,saler_cnt)=>{
                let errsaler_cnt = ''
                if(!saler_cnt.match(/^\d+$/)){
                  errsaler_cnt = '请填写正确的数字'
                }
                this.setState({saler_cnt, errsaler_cnt})
              }}
              style ={{display:'inline-block' ,
                    fontSize: 14,
                    verticalAlign:'middle',
                    width:150,
                    height:40,}} />
    <div>
    <RaisedButton  primary={true} label='下一步'
        onClick={e=>this.setState({
            showCheckedDialog:true && this.getRows() })}
            style ={{float:'right'}}
        />
    </div>
     </div>) 
  }

  renderImport(){
    let {tabid, imported, fileName, sending, loading,
      percentCompleted, }= this.state
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
      <label style={{fontSize:14, color:'#333'}}> {fileName} </label>
      <div>
        <label style={{fontSize:14, color:'#880'}}>导入说明 </label>
        <div style={{fontSize:14, color:'#f00'}}>
        请按照以下图片显示要求提供导入的
            <a href="/static/files/import-plan-sample.xlsx" download>样例表格</a>
            (系统只读第一个sheet,第一行为表头)
          <a href='/static/images/import-plan-tips.png'
            target='_blank' >点我看大图</a>
        </div>
        <div className='import-plan-tips'> </div>
      </div>

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


  renderRows(){
    let { rows, imported, checked} = this.state;
    let headers = ['序号','','促销点系统ID',
          '促销日期','促销时间点','促销人员手机号','促销人数'];
    let iconStyle ={verticalAlign:'middle', marginRight:'5'};
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
            let _t = r.pos_id ;
            let style = {}
            if(checked && !!r.pos){
              _t = _t  + ' ' +r.pos.pos_name
            }else if(checked){
              style = {'color': 'red'}
            }
            return(
              <TableRow key ={idx} style={{fontSize:12}} key={idx}>
                <TableRowColumn>
                  {r.status==1&& <ActionCheckCircle color='#ccc' style={iconStyle}/> }
                  {r.status==2&& <CircularProgress thickness={2} style={iconStyle} size={18}/>}
                  {r.status==3&& <ActionCheckCircle color='#0d0' style={iconStyle}/> }
                  {r.status==4&&  <AlertError color='red' style={iconStyle}/> }
                  {idx+1}
                </TableRowColumn>
                <TableRowColumn >
                    <label style={{'color':'red', fontSize:10}}>{r.msg}</label> 
                </TableRowColumn>
                <TableRowColumn><div style={style}>{_t}</div></TableRowColumn>
                <TableRowColumn>{r['sales_date']}</TableRowColumn>
                  <TableRowColumn>{r['sale_hour']}</TableRowColumn>
                <TableRowColumn>
                  { r['saler_mobiles'].map((m,i)=>{
                    let salers = r.salers||[];
                    let _mobiles = salers.map(s=>s.mobile)
                    let t = m
                    let style = {}
                    if(checked && _mobiles.indexOf(m)>-1){
                      m = m + ' ' + 
                        salers.filter(s=>s.mobile==m)[0].saler_name
                    }else if(checked){
                      style = {'color': 'red'}
                    }
                    return (<div style = {style } key={i}>{m} </div>)
                  })
                  }
                  </TableRowColumn>
                <TableRowColumn>{r.saler_cnt}</TableRowColumn>
              </TableRow>
                )})
              }
            </TableBody>
          </Table>
          </div> 
    )
  }


  getRows(){
    let {posText,saler_cnt,salerText, dates, imported, read,texthours } = this.state;
    if(!imported){
      if(!saler_cnt|| !saler_cnt.match(/^\d+$/)){
        this.setState({errsaler_cnt:'请填写正确的数字'})
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
      let sales_dates = dates.map((d)=>{
        let mm = d.getMonth()+1
        mm = mm>9 ? mm: '0' + mm
         let dd = d.getDate() ;
        dd = dd >9 ? dd: '0' + dd;
        return ''.concat(d.getFullYear(),'')
                 .concat(mm, "")
                 .concat(dd,"")
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
      if(!pos_ids.length || !saler_mobiles.length || !sales_dates){
        let errMsg=!saler_mobiles.length ? '请正确填写促销人员手机号':''
        errMsg=!sales_dates.length ? '请选择促销日期':errMsg
        errMsg=!pos_ids.length ? '请正确填写促销点ID':errMsg
        this.setState({errMsg}) 
        return false
      }
      let rows = []
      for(let i =0 ; i<pos_ids.length; i++){
        for(let j=0; j<sales_dates.length; j++) {
          let pos_id = pos_ids[i]
          let status = 1
          let sales_date = sales_dates[j]
            let sale_hour=texthours
          rows.push({ pos_id, saler_mobiles,saler_cnt, status, sales_date,sale_hour})
        }
      }
      this.setState({rows})
      return true
    }else{
        if(!read)  {
            let errMsg='请选择要导入的文件'
            this.setState({errMsg})
        }
    }
  }

  checkData(){
    let {rows} = this.state;
    
  }

  componentWillUnmout(){
    this.unmount = true
  }

  onNext(){
    let {sending, rows, checked, read, imported} = this.state; 
    if(checked){
      this.onCommit();
    }else{
      this.onCheck()
    }
  }

  onCommit(){
    this.setState({sending: true})
    axios({
      url: '/plan/api/add_plans.json' ,
      transformRequest:[ function(data, headers) { let _data =  []
        for(let k in data){ _data.push(k+'='+ data[k]) }
        return  _data.join('&')
      } ],
      data: {rows: JSON.stringify(this.state.rows)},
      method: 'post',
      responseType:'json',
    }).then( (resp) =>{
      if(resp.status == 200){
        if(resp.data.result){
          this.setState({errMsg: `成功导入${resp.data.cnt}条数据`})
          this.onCancel();
        }else{
          this.setState({errMsg: resp.data.msg})
        }
      }else{
        this.setState({ errMsg: '请求出错!'})
      }
      if(!this.unmount){ this.setState({sending: false}) }
    })
   
  }

  onCheck(){
    let {sending, rows, checked, read} = this.state; 
    this.setState({sending: true})
    axios({
      url: '/plan/api/check_import.json' ,
      transformRequest:[ function(data, headers) { let _data =  []
        for(let k in data){ _data.push(k+'='+ data[k]) }
        return  _data.join('&')
      } ],
      data: {rows: JSON.stringify(rows)},
      method: 'post',
      responseType:'json',
    }).then( (resp) =>{
      if(resp.status == 200){
        if(resp.data.result){
          let  _rows = resp.data.rows;
          let {rows} = this.state;
          let saler_cnt = _rows.filter((r)=>(r.status==3)).length;
          let checkResult = `可导入数据${saler_cnt}, 共${rows.length}`
          this.setState({rows:_rows, checked: true, checkResult}) 
        }else{
          this.setState({errMsg: resp.data.msg})
        }
      }else{
        this.setState({ errMsg: '请求出错!'})
      }
      if(!this.unmount){ this.setState({sending: false}) }
    })

  }

  renderCheckDialog(){
    let {sending,checked, read, checkResult} = this.state;
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
        <h3>促销排产</h3>
        <Toggle label='Excel导入切换' toggled={imported}
          style={{width:150}}
          disabled = {sending || loading}
          onToggle ={(e, imported)=>{this.setState({imported})}} />
      { imported ? this.renderImport() : this.renderForm() }
      {showCheckedDialog && this.renderCheckDialog()}
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
