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
        return (
            <MuiThemeProvider>
                <div>
                    <Drawer open={showMenu}  containerStyle={{top:'64px'}}>
                        <SelectableList value ={menuSelected}>
                            <Subheader>Welcome! 汪阳 </Subheader>
                            { menus.map((m, idx)=>(
                                m.url?
                              <Link to={m.url} key={m.id}  value={m.url||m.id}>
                               <ListItem  key ={m.id} 
                                  primaryText = {m.label}
                                  leftIcon={<ActionGrade />}  /> 
                              </Link>:
                              <ListItem  key ={m.id}
                                  primaryText = {m.label}
                                  value = {m.url||m.id} 
                                  initiallyOpen={(m.items||[]).map((i)=>(i.id)).indexOf(menuSelected)>-1}
                                  primaryTogglesNestedList={true}
                                  leftIcon={<ActionGrade />}
                                  disabled= {!!(m.items||[]).length}
                                  nestedItems ={
                                      (m.items||[]).map((s, idx)=>(
                                        <Link to={s.url} key={s.id} 
                                        value={s.url||s.id} >
                                          <ListItem  key={s.id} 
                                            nestedLevel={1}
                                            primaryText = {s.label}
                                            leftIcon={<ActionGrade />}/ >
                                        </Link> 
                                      ))
                                  } />
                            ))}
                        </SelectableList>
                    </Drawer>     
                    <div >
                        <AppBar title="o2o促销管理" 
                        style = {{'position': 'fixed', 'top': 0, 'left': 0}} 
                            onLeftIconButtonClick={ (event)=>{this.setState({showMenu:!showMenu})}}/>

                        <Paper style={{ left:showMenu?'260px': '5px', 
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



