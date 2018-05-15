import React, {Component} from 'react';
import {
  Table,
  TableBody,
  TableFooter,
  TableHeader,
  TableHeaderColumn,
  TableRow,
  TableRowColumn,
} from 'material-ui/Table';
import TextField from 'material-ui/TextField';
import Paper  from 'material-ui/paper';
import RaisedButton from 'material-ui/RaisedButton';
import CircularProgress from 'material-ui/CircularProgress';
import SelectField from 'material-ui/SelectField';
import MenuItem from 'material-ui/MenuItem';
import Select from "rc-select";
import Pagination from 'rc-pagination';
import {parseWkt} from '../libs/wkt.jsx'
import FlatButton from 'material-ui/FlatButton'
import MapsAddLocation from 'material-ui/svg-icons/maps/add-location'
import Dialog from 'material-ui/Dialog'
import ShowMap from'../libs/showmap'
import Snackbar from 'material-ui/Snackbar'


export default class TableExampleComplex extends Component {
    constructor(props) {
        super(props);
        this.onAudit=this.onAudit.bind(this);
        this.onUnAudit=this.onUnAudit.bind(this);
        this.state = {
            fixedHeader: true,
            fixedFooter: true,
            stripedRows: false,
            showRowHover: true,
            selectable: true,
            multiSelectable: true,
            enableSelectAll: true,
            deselectOnClickaway: false,
            showCheckboxes: true,
            loading:false,
            errMsg:'',
            pageCurrent: 1,
            pageSize: 20,
            rowsTotal: 0,
            rows:[],
            selectedRows:'none',
            sales_depart_id:'',
            poi_tag:[],
            selectedTag:'',
            status_id:'',
            queryPoi:'',
            queryMan:'',
            lng:null,
            lat:null,
            address:'',
            map:false,
        };
    }

    componentDidMount() {
        this.getData();
        this.getTag();
    }

    getData() {
        let {pageCurrent, pageSize} = this.state;
        let {sales_depart_id,selectedTag,status_id,queryPoi,queryMan}=this.state;
        let args={
            status:[1,2,3].join(','),
            pageCurrent:pageCurrent,
            pageSize:pageSize,
            sales_depart_id:sales_depart_id,
            selectedTag:selectedTag,
            status_id:status_id,
            queryPoi:queryPoi,
            queryMan:queryMan
        };
        this.setState({loading: true});
        axios({
            url: '/pos/api/pos_audit_list.json',
            transformRequest: [function (data, headers) {
                let _data = []
                for (let k in data) {
                    _data.push(k + '=' + data[k])
                }
                return _data.join('&')
            }],
            data: args,
            method: 'post',
            responseType: 'json',
        }).then((resp) => {
            if (resp.status == 200) {
                this.setState({rows: resp.data.rows, rowsTotal: resp.data.cnt})
            } else {
                let errMsg = '请求数据错误';
                this.setState({errMsg})
            }
            this.setState({loading: false})
        })
    }

    getTag(){
        this.setState({loading:true});
        axios({
            url:'/pos/api/get_poi_tag.json',
            transformRequest: [function (data, headers) {
                let _data = []
                for (let k in data) {
                    _data.push(k + '=' + data[k])
                }
                return _data.join('&')
            }],
            method:'post',
            responseType:'json',
        }).then((resp)=>{
            if(resp.status==200&&resp.data.rows instanceof Array){
                this.setState({poi_tag:resp.data.rows})
            }else{
                let errMsg='获取类型数据失败';
                this.setState({errMsg})
            }
        })
    }

    onShowSizeChange(current,pageSize){
        this.state.pageCurrent=current;
        this.state.pageSize=pageSize;
        this.getData();
    }

    onPageChange(page){
        this.state.pageCurrent=page;
        this.getData();
    }


    onAudit(){
        let {selectedRows,rows}=this.state;
        let status=2; //审核通过
        let selectedPoi=[];
        if(selectedRows instanceof Array){
            console.log(selectedRows);
            for(let i=0;i<selectedRows.length;i++){
                if(rows[selectedRows[i]].status in [1,4]){
                    selectedPoi.push(rows[selectedRows[i]].poi_id)
                }
            }
            console.log(selectedPoi)
        }else if(selectedRows=='all'){
            for(let i=0;i<rows.length;i++){
                if(rows[i].status in [1,4]){
                    selectedPoi.push(rows[i].poi_id)
                }
            }
            console.log(selectedPoi)
        }else{
            let errMsg='勾选审核数据错误';
            this.setState({errMsg});
        }
        if(selectedPoi.length==0||selectedRows=='none'){
            let errMsg='未选择任何行，或已选择行的状态不允许审核通过';
            this.setState({errMsg});
        }
        else {
            this.setState({loading:true});
            axios({
                url: '/pos/api/pos_audit.json',
                transformRequest: [function (data, headers) {
                    let _data = []
                    for (let k in data) {
                        _data.push(k + '=' + data[k])
                    }
                    return _data.join('&')
                }],
                data: {selectedPoi:selectedPoi,status:status},
                method: 'post',
                responseType: 'json',
            }).then((resp => {
                if (resp.status == 200) {
                    this.setState({errMsg:resp.data.msg});
                    this.getData();
                } else {
                    let errMsg = '审核请求失败';
                    this.setState({errMsg})
                }
                this.setState({loading:true})
            }))
        }
    }

    onUnAudit(){
        let {selectedRows,rows}=this.state;
        let status=4; //审核不通过
        let selectedPoi=[];
        if(selectedRows instanceof Array){
            console.log(selectedRows);
            for(let i=0;i<selectedRows.length;i++){
                let r=rows[selectedRows[i]]
                if(r.status==1||r.status==2){
                    selectedPoi.push(r.poi_id)
                }
            }
            console.log(selectedPoi)
        }else if(selectedRows=='all'){
            for(let i=0;i<rows.length;i++){
                if(rows[i].status==1||rows[i].status==2){
                    selectedPoi.push(rows[i].poi_id)
                }
            }
            console.log(selectedPoi)
        }else{
            let errMsg='勾选审核数据错误';
            this.setState({errMsg});
        }
        if(selectedPoi.length==0||selectedRows=='none'){
            let errMsg='未选择任何行，或已选择行的状态不允许审核不通过';
            this.setState({errMsg});
        }
        else {
            this.setState({loading:true});
            axios({
                url: '/pos/api/pos_audit.json',
                transformRequest: [function (data, headers) {
                    let _data = []
                    for (let k in data) {
                        _data.push(k + '=' + data[k])
                    }
                    return _data.join('&')
                }],
                data: {selectedPoi:selectedPoi,status:status},
                method: 'post',
                responseType: 'json',
            }).then((resp => {
                if (resp.status == 200) {
                    this.setState({errMsg:resp.data.msg});
                     this.getData()
                } else {
                    let errMsg = '审核请求失败';
                    this.setState({errMsg})
                }
                this.setState({loading:true})
            }))
        }
    }

    getGeomFromwkt(wkt){
        if(wkt==null){
            return null
        }else{
            var geom=parseWkt(wkt);
            if(geom&&geom.type=='POINT'){
                this.setState({lng:geom.coords.x,lat:geom.coords.y});
            }
        }
    }

    render() {
        let {loading,errMsg}=this.state;
        let {rows}=this.state;
        let {pageCurrent,pageSize,rowsTotal}=this.state;
        let {sales_depart_id,poi_tag,selectedTag,status_id,queryPoi,queryMan}=this.state;
        let {selectedRows}=this.state;
        let charge_departs=(((window.NS||{}).userInfo||{}).user_info||{}).charge_departs_info||[];
        let status=[{status:'待审核',id:1},{status:'审核通过',id:2},{status:'审核不通过',id:4},{status:'通过后取消',id:5}];
    return (
        <div>
                <Paper style={{padding:'5px 20px', margin:'5px 0px'}} zDepth={2}>
                    <div>筛选条件：</div>
                    <div style={{display:'inline-block' ,  verticalAlign:'middle'}}>
                        <label style={{fontSize:12, color:'rgba(0, 0, 0, 0.3)'}}>区分</label>
                        <SelectField value={sales_depart_id}
                                     onChange={(e,i,sales_depart_id)=>{this.setState({sales_depart_id})}}
                                     labelStyle={{fontSize:12, lineHeight:4, textAlign:'center'}}
                                     style ={{display:'inline-block' , lineHeight: 24,
                                     verticalAlign:'middle', width:150, height:40,}}>
                            <MenuItem  value={''} primaryText={'请选择'} />
                            {
                            charge_departs.map((d, i)=>(
                                <MenuItem key ={'f-'+i} value={d.sales_depart_id}
                                          primaryText={d.sales_depart_name} />
                            ))}
                        </SelectField>
                        <label style={{fontSize:12, color:'rgba(0, 0, 0, 0.3)'}}>促销点类型</label>
                        <SelectField value={selectedTag}
                                     onChange={(e,idx,selectedTag)=>(this.setState({selectedTag}))}
                                     labelStyle={{fontSize:12, lineHeight:4, textAlign:'center'}}
                                     style ={{display:'inline-block',lineHeight: 24,
                                         verticalAlign:'middle', width:150, height:40,}}
                                 >
                        <MenuItem  value={''} primaryText={'请选择'} />
                        {
                            poi_tag.map((t, idx)=>(<MenuItem key ={idx} value={t.tag} primaryText={t.tag_label} />))
                        }
                        </SelectField>
                        <label style={{fontSize:12,
                            color:'rgba(0, 0, 0, 0.3)'}}>审核状态</label>
                        <SelectField value={status_id}
                                 onChange={(e,idx,status_id)=>(this.setState({status_id}))}
                                 labelStyle={{fontSize:12, lineHeight:4, textAlign:'center'}}
                                 style ={{display:'inline-block' , lineHeight: 24,
                                     verticalAlign:'middle', width:150, height:40,}}
                                 >
                        <MenuItem  value={''} primaryText={'请选择'} />
                        {
                            status.map(
                                (t, idx)=>(<MenuItem key ={idx} value={t.id} primaryText={t.status} />))
                        }
                        </SelectField>
                        <TextField hintText="门店名称/地址"
                               value = {queryPoi}
                               onChange = {(e,queryPoi)=>{this.setState({queryPoi})}}
                               style ={{display:'inline-block' ,
                                   fontSize: 14,
                                   verticalAlign:'middle',
                                   width:150,
                                   height:40,}} />
                        <TextField hintText="姓名/电话"
                               value = {queryMan}
                               onChange = {(e,queryMan)=>{this.setState({queryMan})}}
                               style ={{display:'inline-block' ,
                                   fontSize: 14,
                                   verticalAlign:'middle',
                                   width:150,
                                   height:40,}} />
                    </div>
                    <RaisedButton label='查找'
                                  primary={true}
                                  onClick={this.getData.bind(this)}
                                  disabled={loading}
                                  style={{height:30,width:50,marginLeft:20}}/>
                    <RaisedButton label='审核通过'
                                  primary={true}
                                  onClick={this.onAudit}
                                  disabled={loading}
                                  style={{height:30,width:50,marginLeft:20}}/>
                    <RaisedButton label='审核不通过'
                                  primary={true}
                                  onClick={this.onUnAudit}
                                  disabled={loading}
                                  style={{height:30,width:60,marginLeft:20}}/>
                </Paper>
            {loading ? <CircularProgress size={40} thickness={3} />:

                <div>
                    <Table fixedHeader={this.state.fixedHeader}
                           fixedFooter={this.state.fixedFooter}
                           selectable={this.state.selectable}
                           multiSelectable={this.state.multiSelectable}
                           onRowSelection={(selectedRows)=>{this.state.selectedRows=selectedRows}}
                    >
                        <TableHeader displaySelectAll={this.state.showCheckboxes}
                                     adjustForCheckbox={this.state.showCheckboxes}
                                     enableSelectAll={this.state.enableSelectAll}>
                            <TableRow>
                                <TableHeaderColumn tooltip="Time">创建时间</TableHeaderColumn>
                                <TableHeaderColumn tooltip="status">审核状态</TableHeaderColumn>
                                <TableHeaderColumn tooltip="poi_type">类型</TableHeaderColumn>
                                <TableHeaderColumn tooltip="Name">门店名称</TableHeaderColumn>
                                <TableHeaderColumn tooltip="Address">地址</TableHeaderColumn>
                                <TableHeaderColumn tooltip="Status">上报人</TableHeaderColumn>
                                <TableHeaderColumn tooltip="position">定位</TableHeaderColumn>
                            </TableRow>
                        </TableHeader>
                        <TableBody displayRowCheckbox={this.state.showCheckboxes}
                                   deselectOnClickaway={this.state.deselectOnClickaway}
                                   showRowHover={this.state.showRowHover}
                                   stripedRows={this.state.stripedRows}>
                            {rows.map((row, index) => (
                                <TableRow key={index}>
                                    <TableRowColumn>{row.create_date}</TableRowColumn>
                                    <TableRowColumn>{row.status_label}</TableRowColumn>
                                    <TableRowColumn>{row.tag_label}</TableRowColumn>
                                    <TableRowColumn>{row.poi_name}</TableRowColumn>
                                    <TableRowColumn>{row.address}</TableRowColumn>
                                    <TableRowColumn>{row.saler_name}{row.mobile}</TableRowColumn>
                                    <TableRowColumn>
                                        <FlatButton icon={<MapsAddLocation/>} onClick={(e)=>{this.getGeomFromwkt(row.wkt);this.setState({address:row.address,map:true})}}>
                                        </FlatButton>
                                    </TableRowColumn>
                                </TableRow>
                            ))}
                            </TableBody>
                        <TableFooter>
                            <Pagination style={{float:'right'}}
                                        selectComponentClass={Select}
                                        showSizeChanger
                                        onShowSizeChange={this.onShowSizeChange.bind(this)}
                                        onChange={this.onPageChange.bind(this)}
                                        current={pageCurrent}
                                        pageSize={pageSize}
                                        defaultCurrent={1}
                                        total={rowsTotal}
                                        showTotal={(total)=>`总共${total}条记录`}
                            />
                        </TableFooter>
                    </Table>
                </div>}
                <Dialog title="地图展示"
                        contentStyle={{width:'100%', height:'100%', maxWidth:'none'}}
                        actions={[<FlatButton label="关闭"
                                                   primary={true}
                                                   onClick={(e)=>{this.setState({map:false})}}
                                        />]}
                        open={this.state.map}
                        style={{width:'50%',height:'50%',marginLeft:'25%',marginRight:'25%'}}
                        onRequestClose={(e)=>{this.setState({map:false})}}
                >
                    {this.state.address}
                    <div style={{width:950,height:750}}>
                        <ShowMap lng={this.state.lng}
                             lat={this.state.lat}/>
                    </div>
                </Dialog>
                  <Snackbar open={!!errMsg}
                            message={errMsg}
                            style ={{textAlign: 'center'}}
                            autoHideDuration={3000}
                            onRequestClose={(e)=>{this.setState({errMsg:''})}}
                  />
      </div>
    );
  }
}