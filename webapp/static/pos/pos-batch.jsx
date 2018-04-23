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
          file: null,
          file_name: '',
          sending: false,
          rows: [],
          checking:false,
          read: false,
          percentCompleted: 0,
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

    onCheck(){
      let {rows}= this.state;
      rows.forEach((r,idx)=>{
        r.status = 2  
        this.setState({rows})

      })
    }


    renderRows(){

      let {rows, read, sending}  = this.state;
      let headers = ['序号',,'单元'	,'促销点ID','代码点','门店名称','门店地址',
              '负责人姓名','负责人电话'];
      let iconStyle ={verticalAlign:'middle', marginRight:'5'}
      return (
       <div style={{    overflow: 'hidden', }}>
        <Table fixedHeader={true} displaySelectAll={false} height={'500px'}>
          <TableHeader displaySelectAll={false} adjustForCheckbox={false}> 
          <TableRow>
            { headers.map((h,idx)=>{
                return (
                <TableHeaderColumn key={idx} tooltip={h}>{h}</TableHeaderColumn>
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
              {r.status==2&& <CircularProgress thickness={2} 
                style={iconStyle}
                size={18}/>}
              {r.status==3&& <ActionCheckCircle color='#0d0' style={iconStyle}/> }
              {r.status==4&& <AlertError color='red' style={iconStyle}/> }
              {r.idx+1}
              </TableRowColumn>
                <TableRowColumn>{r.data[0]}</TableRowColumn>
                <TableRowColumn>{r.data[1]}</TableRowColumn>
                <TableRowColumn>{r.data[2]}</TableRowColumn>
                <TableRowColumn>{r.data[3]}</TableRowColumn>
                <TableRowColumn>{r.data[4]}</TableRowColumn>
                <TableRowColumn>{r.data[5]}</TableRowColumn>
                <TableRowColumn>{r.data[6]}</TableRowColumn>
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
      let {read, percentCompleted, rows, errMsg, fileName, sending} = this.state;
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

                <SelectField
                    floatingLabelText="区分"
                    value = {user_info['sales_depart_id']}
                    onChange = {(e,idx,sales_depart_id)=>(this.setState({sales_depart_id}))}>
                    {
                        sales_departs.map((d, i)=>(
                            <MenuItem key ={'f-'+i} value={d.sales_depart_id} 
                                primaryText={d.sales_depart_name} />
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
                  style ={{dsplay:'inline-block'}}
                  value={percentCompleted}
                  key = 'c'
                  />, <div key='l' 
                    style={{fontSize:12, color:'#888',display:'inline-block', width:60, textAlign:'center'}}>
                {percentCompleted}%</div>]
                    :<RaisedButton  primary={true} label='选择文件'
                        onClick = {(e)=>{ this.refs['fileExcel'].click(e)}}
                    /> 
              }
              <label style={{fontSize:14, color:'#333'}}> {fileName} </label>
                  <div>
                  <label style={{fontSize:14, color:'#88'}}>导入说明 </label>
                  <div style={{fontSize:14, color:'#f00'}}>
                     请按照以下图片显示要求提供导入的excel表(系统只读第一个sheet,第一行为表头)
                    <a href='/static/images/import-pos-tips.png'
                    target='_blank' >点我看大图</a>
                  </div>
                
                  <div className='import-pos-tips'> </div>
                  </div>

                </div>
              {
              <Dialog
                title="即将要导入的数据"
                actions={[
                  <FlatButton
                  label="取消"
                  primary={true}
                  onClick={(e)=>{this.setState({read:false})}}
                  />,
                  <FlatButton
                  label="下一步"
                  primary={true}
                  onClick={this.onCheck.bind(this)}
                  />, ]}
                modal={true}
                contentStyle={{width:'100%', height:'100%', maxWidth:'none'}}
                open={read}
                >
                  {this.renderRows()}
                </Dialog>
              }
            <AlertError color='red'/>
            <ActionDone color='green'/>
            <ActionCheckCircle color='#0d0'/>
            <CircularProgress thickness={2} size={18} />
            </div>
        )

    }
}

exports.PosImport = PosImport

