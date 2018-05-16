import CircularProgress from 'material-ui/CircularProgress'
import RaisedButton from 'material-ui/RaisedButton'
import TextField from 'material-ui/TextField'
import {Table, TableBody, TableHeader, TableHeaderColumn,
  TableRow, TableRowColumn,TableFooter} from 'material-ui/Table'
import Toggle from 'material-ui/Toggle'

class AdminPostType extends React.Component{
    constructor(props){
        super(props);
        this.state={
            loading:false,
            rows:[],
            errMsg:'',
        }
    }

    componentDidMount(){
        this.getData()
    }

    getData(){
        this.setState({loading:true});
        axios({
            url: '/user/api/get_pos_tag.json' ,
            transformRequest:[ function(data, headers) {
                let _data =  []
                for(let k in data){
                    _data.push(k+'='+ data[k])}
                    return  _data.join('&')}],
            data: {'pos_id':this.state.pos_id, },
            method: 'post',
            responseType:'json',
        }).then((resp)=>{
            if(resp.status==200){
                this.setState({rows:resp.data.rows})
            }else{
                this.setState({errMsg:'请求类型数据失败'})
            }
            this.setState({loading:false})
        })
    }

    onChange(){

    }

    render(){
        let {loading,rows}=this.state;
        return(
            <div>{loading ? <CircularProgress size={40} thickness={3}/> :
                rows.map((r)=>{
                    return (
                        <Toggle label={r.tag_label} />
                    )
                })
            }
            </div>
        )
    }

}

exports.AdminPostType = AdminPostType;