


class LoginOut extends React.Component{
    constructor(props){
        super(props) ;
    
    }

    componentDidMount(){
        axios.get('/u/login_out.json').then((resp)=>{
            window.location ='/'
        }).catch((e)=>{
             
        })
    }

    render(){
        return null 
    }

}


exports.LoginOut = LoginOut;
