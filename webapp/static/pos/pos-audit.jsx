import React from 'react'
import {Table,TableBody,TableHeader,TableHeaderColumn,TableRow,TableRowColumn} from 'material-ui/Table'
import CircularProgress from 'material-ui/CircularProgress'

class PosAudit extends React.Component{
    constructor(props){
        super(props);
        this.state={
            loading:false,
            status:{},
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
            url:'/pos/api/pos_audit_list.json',
            transformRequest:[ function (data,headers) {
                let _data=[]
                for(let k in data){
                    _data.push(k+'='+data[k])
                }
                return _data.join('&')
            }],
            data:{status:[1,2,3].join(',')},
            method:'post',
            responseType:'json',
        }).then((resp)=>{
            if(resp.status==200){
                this.setState({rows:resp.data.rows})
            }else{
                errMsg='请求数据错误';
                this.setState({errMsg})
            }
            this.setState({loading:false})
        })
    }
    render(){
        let {loading,rows}=this.state;
        let headers=['序号','门店名称','上报人'];
        return (
            <div>
                {loading?<CircularProgress size={40} thickness={3}/>:
                    <div>
                        <Table fixedHeader={false} displaySelectAll={false}>
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
                        </Table>
                        <TableBody displayRowCheckbox={false} stripedRows={false}
                                   showRowHover={true} >
                            { rows.map((r, idx)=>{
                                return(
                                    <TableRow key ={idx} style={{fontSize:12}}>
                                        <TableRowColumn>{r.poi_id}</TableRowColumn>
                                        <TableRowColumn>{r.poi_name}</TableRowColumn>
                                        <TableRowColumn>{r.saler_name}</TableRowColumn>
                                    </TableRow>
                                )})
                            }
                            </TableBody>
                    </div>
                }
            </div>
        )
    }
}

exports.PosAudit=PosAudit;