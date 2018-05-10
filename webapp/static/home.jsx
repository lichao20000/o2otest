
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
            }).catch((err)=>{
                this.setState({loading: false})
            })

    }

    render(){
        let {loading, files }= this.state
        return (
            <div style={{padding: 10}}>
                <h2>首页</h2>
                {loading ?
                < CircularProgress size={40} thickness={3} />:
                    files.map((f,idx)=>{
                            return (
                                <div key ={idx}>
                              <a href={`/get_file/${f}`} >下载明细：{f}</a>
                                </div> 
                            ) 
                        
                        })
                }
            </div>
        ) 
    }
}

exports.HomeData = HomeData
