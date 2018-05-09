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
import IconButton from 'material-ui/IconButton';
import HardwareKeyboardArrowRight from 'material-ui/svg-icons/hardware/keyboard-arrow-right'   ;
import HardwareKeyboardArrowLeft from 'material-ui/svg-icons/hardware/keyboard-arrow-left';
let AL = HardwareKeyboardArrowLeft;
let AR = HardwareKeyboardArrowRight;
import ActionCheckCircle from 'material-ui/svg-icons/action/check-circle';
import ActionDone from 'material-ui/svg-icons/action/done';
import AlertError from 'material-ui/svg-icons/alert/error';
import Dialog from 'material-ui/Dialog';
import FlatButton from 'material-ui/FlatButton';
import FontIcon from 'material-ui/FontIcon';
import {blue500, red500, greenA200} from 'material-ui/styles/colors';






class PosImport extends React.Component{
    constructor(props){
        super(props); 
        let user_info = (((window.NS||{}).userInfo||{}).user_info||{});
        this.state = {
          sales_depart_id : user_info['sales_depart_id'],
          pos_type: null,
          file: null,
          file_name: '',
          sending: false,
          rows: [],
          checked: false,  
          read: false,
          percentCompleted: 0,
          showConfirm: false, 
          checkResult:'',
            errMsg:'',
           user_info ,
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
              rows = rows.map((r, idx)=>({status:1, msg:'',data:r, idx: idx}))
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


    onNext(){
        let {checked, rows} = this.state
        if(!checked){
            this.onCheck()
        }else{
            this.setState({showConfirm:true}) 
        }
    }
    onCancel(){
        this.setState({showConfirm:false, checked: false, read: false, fileName:'', checkResult:''}) 
        this.refs['fileExcel'].value=null;
    
    }

    onCommit(){ // 确定提交了
        this.setState({showConfirm: false, sending: true})
        let {rows, sales_depart_id, pos_type} = this.state;
        let args = rows.filter((r)=>(r.status==3));
        axios({
              url: '/pos/api/pos_import.json' ,
              transformRequest:[ function(data, headers) { let _data =  []
                  for(let k in data){ _data.push(k+'='+ data[k]) }
                  return  _data.join('&')
              } ],
              data: {rows: JSON.stringify(args), pos_type},
              method: 'post',
              responseType:'json',
          }).then( (resp) =>{
              if(resp.status == 200){
                   if(resp.data.result){
                       this.onCancel()
                       this.setState({errMsg: '导入成功'})
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
      let {rows, user_info}= this.state;
      rows.map((r)=>{
            if(!r.data[0] || !r.data[4] || !r.data[6] || !r.data[7]|| !r.data[8]) {
                r.status = 4
                r.msg = '必填项.'
            }
            if( r.data[7].toString().length !=11 
                          || !r.data[7].toString().match(/^\d+$/)){
                r.status = 4
                r.msg = '手机号.'
            }
          if(r.data[0] && user_info.charge_departs.indexOf(r.data[0])==-1){
                r.status = 4
                r.msg = '无权区分ID.'
          }
          console.log(r.data[8]);
          if(!(r.data[8]=='有租金'||r.data[8]=='无租金')){
                r.status=4
              r.msg='租金类型不正确'
          }
        })
    this.setState({sending:true, rows})
    let args = rows.filter((r)=>(r.status==1));
    axios({
          url: '/pos/api/check_import.json' ,
          transformRequest:[ function(data, headers) { let _data =  []
              for(let k in data){ _data.push(k+'='+ data[k]) }
              return  _data.join('&')
          } ],
          data: {rows: JSON.stringify(args)},
          method: 'post',
          responseType:'json',
      }).then( (resp) =>{
          if(resp.status == 200){
               if(resp.data.result){
                   let  _rows = resp.data.rows;
                   let {rows} = this.state;
                   let idxs = _rows.map((c)=>(c.idx))
                   _rows.map((row,_)=>{
                       rows[row.idx] = row
                   })
                   let cnt = _rows.filter((r)=>(r.status==3)).length;
                   let checkResult = `可导入数据${cnt}, 共${rows.length}`
                    this.setState({rows, checked: true, checkResult}) 
               }else{
                   this.setState({errMsg: resp.data.msg})
               }
          }else{
              this.setState({ errMsg: '请求出错!'})
          }
          if(!this.unmount){ this.setState({sending: false}) }
      })
    }

    renderRows(){
      let {rows, read, sending}  = this.state;
      let headers = ['序号',' ','区分ID','单元'	,'促销点ID','代码点','门店名称','门店地址',
              '负责人姓名','负责人电话','租金类型'];
      let iconStyle ={verticalAlign:'middle', marginRight:'5'}
      return (
       <div style={{    overflow: 'hidden', }}>
        <Table fixedHeader={true} displaySelectAll={false} height={'500px'}>
          <TableHeader displaySelectAll={false} adjustForCheckbox={false}> 
          <TableRow>
            { headers.map((h,idx)=>{
                return (
                <TableHeaderColumn key={idx} >{h}</TableHeaderColumn>
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
                <TableRowColumn>{r.data[0]}</TableRowColumn>
                <TableRowColumn>{r.data[1]}</TableRowColumn>
                <TableRowColumn>{r.data[2]}</TableRowColumn>
                <TableRowColumn>{r.data[3]}</TableRowColumn>
                <TableRowColumn>{r.data[4]}</TableRowColumn>
                <TableRowColumn>{r.data[5]}</TableRowColumn>
                <TableRowColumn>{r.data[6]}</TableRowColumn>
                <TableRowColumn>{r.data[7]}</TableRowColumn>
                  <TableRowColumn>{r.data[8]}</TableRowColumn>
              </TableRow>
                )})
              }
            </TableBody>
          </Table>
          </div>)
    }

    render(){
        let user_info = (((window.NS||{}).userInfo||{}).user_info||{});
        let sales_departs = user_info.charge_departs_info;
        let {read, percentCompleted, rows, errMsg, fileName,
                showConfirm, sales_depart_id, pos_type,
                checked, checkResult, sending,} = this.state;
        return (
            <div style={{padding:'30px 20px' }}>
                <TextField
                    style ={{width:'100%'}}
                    disabled = {true}
                    underlineShow={false}  
                    floatingLabelText="渠道"
                    value= {user_info['channel_name']}
                    onChange={this.fuck}
                    floatingLabelFixed={true} />
                <Divider />
                {
                    /*
                <SelectField
                    floatingLabelText="区分"
                    value = {sales_depart_id}
                    onChange = {(e,idx,sales_depart_id)=>(this.setState({sales_depart_id}))}>
                    {
                        sales_departs.map((d, i)=>(
                            <MenuItem key ={'f-'+i} value={d.sales_depart_id} 
                                primaryText={d.sales_depart_name} />
                        ))
                    }
                </SelectField>
                */
                }
              <SelectField
                      floatingLabelText="类型"
                      value = {pos_type}
                        onChange = {(e,idx,pos_type)=>(this.setState({pos_type}))}>
                      {
                        ['固定促销点'].map((t, idx)=>(
                        <MenuItem key ={idx} value={t} primaryText={t} />
                        ))
                      }
                  </SelectField>
              <div>
                    <input ref='fileExcel' type='file' id='file' 
                    onChange={this.onChoose.bind(this)}
                    style={{display:'none'}}/>
              { sending?
                [ <CircularProgress
                  mode="determinate"
                  size={20}
                  thickness = {2} 
                  style ={{dsplay:'inline-block'}} value={percentCompleted} key = 'c' />, <div key='l' 
                    style={{fontSize:12, color:'#888',display:'inline-block', width:60, textAlign:'center'}}>
                {percentCompleted}%</div>]
                    :<RaisedButton  primary={true} label='选择文件'
                        disabled = {!pos_type}
                        onClick = {(e)=>{ this.refs['fileExcel'].click(e)}}
                    /> 
              }
              <label style={{fontSize:14, color:'#333'}}> {fileName} </label>
                  <div>
                  <label style={{fontSize:14, color:'#880'}}>导入说明 </label>
                  <div style={{fontSize:14, color:'#f00'}}>
                      请按照以下图片提示，将数据填写到
                      <a href="/static/files/import-pos-sample.xlsx" download>样例表格</a>
                      再导入(只有第一个Sheet,第一行为表头)
                    <a href='/static/images/import-pos-tips.png'
                    target='_blank' >点我看大图</a>
                  </div>
                  <div className='import-pos-tips'> </div>
                  <div>
                    <label style={{fontSize:14, color:'#888'}}>区分对应ID</label>
                    {user_info.charge_departs_info.map((d,idx)=>{
                        return (
                            <div key = {idx}>
                                <label style={{fontSize:14, color:'#333'}}>{d.sales_depart_name}</label>
                                <label style={{fontSize:14, color:'#333',marginLeft:20}}>{d.sales_depart_id}</label>
                        </div>
                        )
                    })
                    }
                  </div>
                  </div>
                </div>
              {
              <Dialog
                title="即将要导入的数据"
                actions={sending?
                        [<div  style ={{height:38 , paddingRight:80}}>
                            <CircularProgress thickness={2} size={18} />
                            <label style={{fontSize:14, color:'#ff5722'}}> 数据{checked?'导入':'检查'}中...</label>
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
                open={read}
                >
                  {this.renderRows()}

                  <Dialog
                      title="确认"
                      actions={ [ <FlatButton
                          label="取消"
                          primary={true}
                          onClick={this.onCancel.bind(this)}
                      />,
                          <FlatButton
                              label="提交"
                              primary={true}
                              onClick={this.onCommit.bind(this)}
                          />, ]} 
                      modal={false}
                      open={showConfirm}
                      onRequestClose={()=>this.setState({showConfirm:false})}
                  >
                      { checkResult } , 提交前请检查区分和类型信息是否正确？
                  </Dialog>

                </Dialog>
              }
              {/*
            <AlertError color='red'/>
            <ActionDone color='green'/>
            <ActionCheckCircle color='#0d0'/>
            <CircularProgress thickness={2} size={18} />
            */
              }
          <Snackbar 
            open={!!errMsg}
            message={errMsg}
            autoHideDuration={3000}
            onRequestClose={(e)=>{this.setState({errMsg:''})}}
            />
         
            </div>
        )

    }
}

exports.PosImport = PosImport

