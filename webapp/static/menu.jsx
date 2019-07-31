import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import AppBar from 'material-ui/AppBar';
import Drawer from 'material-ui/Drawer';
import Divider from 'material-ui/Divider';
import Paper from 'material-ui/Paper';


import {List, ListItem, makeSelectable} from 'material-ui/List';
let SelectableList = makeSelectable(List);

import Subheader from 'material-ui/Subheader';
import ContentSend from 'material-ui/svg-icons/content/send';
import ActionGrade from 'material-ui/svg-icons/action/grade';
import ContentInbox from 'material-ui/svg-icons/content/inbox';
import ContentDrafts from 'material-ui/svg-icons/content/drafts';
import HardwareKeyboardArrowRight from 'material-ui/svg-icons/hardware/keyboard-arrow-right'   ;
import HardwareKeyboardArrowLeft from 'material-ui/svg-icons/hardware/keyboard-arrow-left';
import IconButton from 'material-ui/IconButton';

let AL = HardwareKeyboardArrowLeft;
let AR = HardwareKeyboardArrowRight;



import { Link } from 'react-router-dom'
let Item = (props)=>{
  return (
    <ListItem 
        initiallyOpen={false}
        primaryTogglesNestedList={true}
        primaryText={props.label}
        leftIcon={<ActionGrade />}
        disabled= {!!(props.items||[]).length}
        nestedLevel= {1}
        nestedItems ={
            (props.items||[]).map((m, idx)=>(<Item  key={m.id} {...m}/>))
        }
    />
    
  
  )
  
}

class Menu extends React.Component{
    constructor(props){
        super(props); 
        this.state = {
          showMenu:true        
        }
    }

    render(){

        let {showMenu, menu}=  this.state;
        let menus = ((window.NS||{}).sidebarConf||{}).items || [];
        let menuSelected = window.location.hash.slice(1);
        let user_info = (((window.NS||{}).userInfo||{}) .user_info||{});
        return (
            <MuiThemeProvider>
                <div>
                    {//!showMenu&& <IconButton style={{top:64, left:-25, padding:0, zIndex:4}}><AR/></IconButton> 
                    }
                    <Drawer open={showMenu}  containerStyle={{top:'64px'}}>
                        <SelectableList value ={menuSelected}>
                            <Subheader>Welcome! {user_info.user_name}
                                ({user_info.channel_name}-{user_info.sales_depart_name})
                              </Subheader>
                            { menus.map((m, idx)=>(
                                m.url?
                                <Link to={m.url} key={m.id}  value={m.url||m.id}
                                        style={{ fontSize: 12, height:30}} >
                               <ListItem  key ={m.id} 
                                   style={{ fontSize: 12, height:30}}
                                  primaryText = {m.label}
                              /> 
                              </Link>:
                              <ListItem  key ={m.id}
                                  primaryText = {m.label}
                                  style={{ fontSize: 12, height:30 }}
                                  value = {m.url||m.id} 
                                  initiallyOpen={true
                                  /*(m.items||[]).map((i)=>(i.id)).indexOf(menuSelected)>-1 */
                                  }
                                  primaryTogglesNestedList={true}
                                  disabled= {!!(m.items||[]).length}
                                  nestedListStyle={{padding:0}}
                                  nestedItems ={
                                      (m.items||[]).map((s, idx)=>(
                                        <Link to={s.url} key={s.id} 
                                        style={{ fontSize: 12, height:30, padding:0}}
                                        value={s.url||s.id} >
                                          <ListItem  key={s.id} 
                                            style={{ fontSize: 12, height:30, padding:0}}
                                            nestedLevel={1}
                                            primaryText = {s.label}
                                          />
                                        </Link> 
                                      ))
                                  } />
                            ))}
                        </SelectableList>
                    </Drawer>     
                    <div >
                        <AppBar title="佣金薪酬审查"
                        style = {{'position': 'fixed', 'top': 0, 'left': 0}} 
                            onLeftIconButtonClick={ (event)=>{this.setState({showMenu:!showMenu})}}/>

                        <Paper style={{ left:showMenu?'265px': '5px', 
                            position:'fixed', overflow:'auto',
                            top:'0px', 'height': '100%','right': '0',
                            paddingTop:70 ,
                            paddingBottom:70 ,
                            boxSizing:'border-box',
                            right:'5px' }}>
                        {this.props.children}
                      </Paper>
                    </div>
                </div>
            </MuiThemeProvider>)

    }
}

export default  Menu

//ReactDOM.render(<Menu/> , document.getElementById('menu'))



