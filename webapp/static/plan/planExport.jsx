import React from 'react'
import Paper from 'material-ui/Paper'
import RaisedButton from 'material-ui/RaisedButton'
import Checkbox from 'material-ui/Checkbox'
import TextField from 'material-ui/TextField'
import MultipleDatePicker from 'react-multiple-datepicker'
import SelectField from 'material-ui/SelectField'
import MenuItem from 'material-ui/MenuItem'

const style={
    label:{
        fontSize:16,
        color:'rgba(0, 0, 0, 0.3)',
        display:'inline-block'
    },
    paper:{height:'100%',
        width:'100%',
        display:'inline-block',
        textAlign:'center'},
    button:{
        margin: 12, float:'right'
    },
    textfiled:{
        width:'15%',
        display:'inline-block'
    },
    selectfield:{
        display:'inline-block',
        verticalAlign:'middle',
    }
};


class planExport extends React.Component{
    constructor(props){
        super(props);
        this.state={
            plan_tag:[],
            pos_tag:[],
            saler_tag:[],
            user_tag:[],
            dates:[],
            sales_dates:'',
            status_id:'',

            sales_depart_id:'',

        }
    }

    componentDidMount(){
        this.getColumn()
    }

    getColumn(){
        axios({
            url:'/plan/api/get_column.json',
            transformRequest:[ function(data, headers) {
            let _data =  []
            for(let k in data){
            _data.push(k+'='+ (data[k]==null?'':data[k]))
            }
            return  _data.join('&')
            }],
            data:{},
            method: 'post',
            responseType:'json',
        }).then((resp)=>{
            if(resp.status==200){
                this.setState({
                    plan_tag:resp.data.plan_column,
                    pos_tag:resp.data.pos_column,
                    saler_tag:resp.data.saler_column,
                    user_tag:resp.data.user_column
                })
            }else{
                this.setState({errMsg:'请求列数据失败'})
            }
            }
        )
    }

    renderPlan(){
        let {dates,sales_dates,status_id}=this.state;
        return (
            <Paper>
                <h4>排产信息</h4>
                <label>排产日期</label>
                <MultipleDatePicker style={{display:'inline-block'}}
                onSubmit={(dates)=>{this.setState({dates});
                    let sales_dates = dates.map((d)=>{let mm = d.getMonth()+1;
                    mm = mm>9 ? mm: '0' + mm;
                    let dd = d.getDate() ;
                    dd = dd >9 ? dd: '0' + dd;
                    return ''.concat(d.getFullYear(),'').concat(mm, "").concat(dd,"")});
                        this.setState({sales_dates})
                    }}/>
                <label>审核状态</label>
                    <SelectField value={status_id}
                                 onChange={(e,idx,status_id)=>(this.setState({status_id}))}
                                 labelStyle={{fontSize:12, lineHeight:4, textAlign:'center'}}
                                 style ={{display:'inline-block' , lineHeight: 24,
                                     verticalAlign:'middle', width:150, height:40,}}
                                 >
                        <MenuItem  value={''} primaryText={'请选择'} />
                        {
                            [{status:'待审核',id:1},{status:'审核通过',id:2},{status:'审核不通过',id:4},{status:'通过后取消',id:5}].map(
                                (t, idx)=>(<MenuItem key ={idx} value={t.id} primaryText={t.status} />))
                        }
                    </SelectField>
            </Paper>)
    }

    renderUser(){
        let user_info=(((window.NS||{}).userInfo||{}).user_info||{});
        let {sales_depart_id}=this.state;
        return(
            <Paper>
                <h4>排产人员信息</h4>
                <TextField disabled = {true}
                           underlineShow={true}
                           floatingLabelText="渠道"
                           value= {user_info['channel_name']}
                           floatingLabelFixed={true}
                           style={style.textfiled}/>
                {user_info['charge_departs'].length>2?
                    <div style={{display:'inline_block'}}>
                        <label>区分</label>
                        <SelectField value={sales_depart_id}
                                     onChange={(e,key,sales_depart_id)=>{this.setState({sales_depart_id:sales_depart_id})}}
                                     style={style.selectfield}>
                            <MenuItem value={''} primaryText={'请选择'}/>
                            {
                                user_info['charge_departs_info'].filter((d)=>(
                                    d.parent_id!=0)).map((d,idx)=>(
                                        <MenuItem key={'d-'+idx} value={d.sales_depart_id} primaryText={d.sales_depart_name}/>
                                ))
                            }
                        </SelectField>
                    </div>
                    :
                    <TextField disabled = {true}
                           underlineShow={true}
                           floatingLabelText="区分"
                           value= {user_info['sales_depart_name']}
                           floatingLabelFixed={true}
                           style={style.textfiled}/>
                }
            </Paper>
        )
    }

    renderPos(){
        return(
            <Paper>
                <h4>促销点信息</h4>
            </Paper>
        )

    }

    renderSaler(){
        return(
            <Paper>
                <h4>促销人员信息</h4>
            </Paper>
        )
    }

    onSubmit(){
        let{sales_dates,status_id,sales_depart_id}=this.state;
        window.location.href='/plan/api/plan_export?'+'sales_dates='+sales_dates+'&status_id='+status_id+'&sales_depart_id='+sales_depart_id;
    }


    render(){
        return(
            <div>
                {this.renderPlan()}
                {this.renderUser()}
                {this.renderPos()}
                {this.renderSaler()}
                <RaisedButton primary={true}
                              label="导出数据"
                              onClick={(e)=>(this.onSubmit.bind(this))}/>
            </div>
        )
    }
}

exports.planExport = planExport;