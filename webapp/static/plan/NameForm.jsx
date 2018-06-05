import { Table, TableBody, TableHeader, TableHeaderColumn, 
  TableRow, TableRowColumn,TableFooter
} from 'material-ui/Table';
import { HashRouter as Router, Route, Link } from 'react-router-dom'
import Paper  from 'material-ui/paper';
import Snackbar from 'material-ui/Snackbar';
import CircularProgress from 'material-ui/CircularProgress';
import TextField from 'material-ui/TextField';
import Divider from 'material-ui/Divider';
import RaisedButton from 'material-ui/RaisedButton';
import FlatButton from 'material-ui/FlatButton';
import Toggle from 'material-ui/Toggle';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import Checkbox from 'material-ui/Checkbox';
import {RadioButton, RadioButtonGroup} from 'material-ui/RadioButton';
import ActionDone from 'material-ui/svg-icons/action/done';
import ActionCheckCircle from 'material-ui/svg-icons/action/check-circle';
import IconButton from 'material-ui/IconButton';
import MultipleDatePicker from 'react-multiple-datepicker'
import Select from 'rc-select'
import Pagination from 'rc-pagination';
import Dialog from 'material-ui/Dialog'
import ShowMap from'../libs/showmap'
class NameForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
        arr:['1'],
        brr:['1'],
        crr:['1'],
        uploadurl:'',
        fileInput: null,
        file_name: '',
        sending: false
    };
    this.get = this.get.bind(this);
    this.post = this.post.bind(this);
    this.yecu = this.yecu.bind(this);
    this.shichang=this.shichang.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
  }
  get(){
        axios.get('/user/api/download').then((res)=>{
            console.log(res.data);
            this.setState({arr:res.data});
            document.getElementById('fff').style.display='block'
        })
            .catch((err)=>{
            console.log(err.status);
        })
    }
    yecu(){
        axios.get('/user/api/yecu').then((res)=>{
            console.log(res.data);
            this.setState({crr:res.data});
            document.getElementById('iii').style.display='block'
        })
            .catch((err)=>{
            console.log(err.status);
        })
    }
    shichang(){
        axios.get('/user/api/shichang').then((res)=>{
            console.log(res.data);
            this.setState({brr:res.data});
            document.getElementById('sss').style.display='block'
        })
            .catch((err)=>{
            console.log(err.status);
        })
    }
  handleSubmit(event) {
    var formdata = new FormData();
    formdata.append('fileAttach',this.fileInput.files[0])
    event.preventDefault();
    // alert(
    //   `Selected file - ${
    //     this.fileInput.files[0].name
    //   }`
    // );
    axios({
        url:'/user/api/shangchuan',
        method:'post',
        data:formdata,
        headers: {'Content-Type': 'multipart/form-data'}
        }).then((res)=>{
        alert(res['data']);
        }).catch((err)=>{
        alert(err);
        })
  }
   post(){
        var formdata = this.state.file;;
        axios({
            url:'/user/api/shangchuan',
            method:'post',
            data:formdata,
            headers: {'Content-Type': 'application/x-www-form-urlencoded'}
        }).then((res)=>{
            console.log(res);
        }).catch((err)=>{
            console.log(err.status);
        })
  }
  test(){
      var form = new FormData(document.getElementById("form"));
      $.ajax({
      url:"/user/api/shangchuan",
      data:form,
      cache: false,
      processData: false,
      type:"post",
      contentType: false,
      success:function(data){
            alert(data);
           fff.href=data;

      },
      error:function(e){
          alert("文件编码错误，请修改编码后重试！！");
       }
      });
    }
  render(){
    return (<div><br/>
            <h1>一、发展人编码导入</h1>
<form className="fileAttach" onSubmit={this.handleSubmit}>
    <p>Ps:请使用csv文件进行上传操作。点击下方可下载模板文件。</p><a href="/static/files/moban.csv" download>模板文件</a><p>请按照模板格式从左到右依次分别填写手机号、发展编码、人员类型(可不填 )、上传人员(OA前缀)，文件名以英文命名，文件中不含中文。</p>
        <label>

          <input
            type="file"
            ref={input => {
              this.fileInput = input;
            }}
          />
        </label>
        <br /><br />
        <button type="submit">
          提交
        </button>
      </form>
            <hr />
            <br/><br/>
            <h1>二、新版产能下载</h1>
                        <input type="button" value="单击按钮后生成下载链接" onClick={this.get}/><br/>
            <p>PS：单击后稍等即可生成下载链接。</p>
            <div><a href ={this.state.arr} id="fff" style={{display:'none'}}>单击此处下载明细</a>
            </div>
            <hr />
            <br/><br/>
            <h1>三、夜促人员</h1>
            <input type="button" value="单击按钮后生成下载链接" onClick={this.yecu}/>
            <br/>
            <p>PS：单击后稍等即可生成下载链接。</p>
            <div><a href ={this.state.brr}  id="iii" style={{display:'none'}}>单击此处下载明细</a>

            </div><hr /><br/><br/>
                        <h1>四、新版-所有促销人员促销时长</h1>
            <input type="button" value="单击按钮后生成下载链接" onClick={this.shichang}/>
            <br/>
            <p>PS：单击后稍等即可生成下载链接。</p>
            <div><a href ={this.state.brr}  id="sss" style={{display:'none'}}>单击此处下载明细</a>
            </div>
            <hr />
        </div>

    );
  }
}
exports.NameForm = NameForm;
