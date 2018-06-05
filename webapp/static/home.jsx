
import CircularProgress from 'material-ui/CircularProgress';

class HomeData extends React.Component{
    constructor(props){
        super(props);
        this.state={
            loading:false,
            files: [],
        }
    }
    componentDidMount(){
        this.setState({loading: true})
        axios.post('/get_files.json',)
            .then((resp)=>{
                this.setState({files: resp.data||[], loading:false})
                console.log(this.state.files)
            }).catch((err)=>{
                this.setState({loading: false})
            })
    }

    render(){
        let {loading, files }= this.state
 let user_info=((window.NS||{}).userInfo||{}).user_info||{};
        let privs=user_info.privs;
        let download='';
        for (let i=0;i<privs.length;i++){
            if(privs[i]=='PRIV_ADMIN_DATA'){
                download= files.map((f, idx) => {
                                return (
                                    <div key={idx}>
                                        <a href={`/get_file/${f}`}>下载明细：{f}</a>
                                    </div>
                                )
                            })
            }
        }
        return (
            <div style={{padding: 10}}>
                <h2>首页</h2>
                {loading ?
                    < CircularProgress size={40} thickness={3}/> :
                    download
                }
            </div>
        )
    }
}

exports.HomeData = HomeData