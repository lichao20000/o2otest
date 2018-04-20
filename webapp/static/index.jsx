import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import AppBar from 'material-ui/AppBar';
import Drawer from 'material-ui/Drawer';
import Divider from 'material-ui/Divider';
import Paper from 'material-ui/Paper';


import {List, ListItem} from 'material-ui/List';
import Subheader from 'material-ui/Subheader';
import ContentSend from 'material-ui/svg-icons/content/send';
import ActionGrade from 'material-ui/svg-icons/action/grade';
import ContentInbox from 'material-ui/svg-icons/content/inbox';
import ContentDrafts from 'material-ui/svg-icons/content/drafts';



class Menu extends React.Component{
    constructor(props){
        super(props); 
        this.state = {
        
        }
    }

    render(){
        let {showMenu, menu }=  this.state;
        return (
            <MuiThemeProvider>
                <div>
                    <Drawer open={showMenu}  containerStyle={{top:'64px'}}>
                        <List>
                            <Subheader>Welcome! 汪阳 </Subheader>
                            <ListItem primaryText="促销排产" 
                                leftIcon={<ContentInbox />}
                                initiallyOpen={true}
                                primaryTogglesNestedList={true}
                                disabled={true}
                                nestedItems={[
                                    <ListItem
                                        key={1}
                                        primaryText="排产"
                                        leftIcon={<ActionGrade />}
                                    />,
                                    <ListItem
                                        key={2}
                                        primaryText="历史排产"
                                        leftIcon={<ContentSend />}
                                    />
                                ]}
                            />

                            <ListItem
                                disabled={true}
                                primaryText="管理"
                                leftIcon={<ContentInbox />}
                                initiallyOpen={false}
                                nestedItems={[
                                    <ListItem
                                        key={0}
                                        primaryText="审核"
                                        leftIcon={<ContentInbox />}
                                        open={this.state.open}
                                        onNestedListToggle={this.handleNestedListToggle}
                                    />,
               
                                    <ListItem
                                        key={1}
                                        primaryText="促销点管理"
                                        leftIcon={<ActionGrade />}
                                    />,
                                    <ListItem
                                        key={2}
                                        primaryText="促销人员管理"
                                        leftIcon={<ContentSend />}
                                    />,
                                    <ListItem
                                        key={3}
                                        primaryText="权限管理"
                                        leftIcon={<ContentInbox />}
                                        open={this.state.open}
                                        onNestedListToggle={this.handleNestedListToggle}
                                    />,
                                ]}
                            />
                            <ListItem
                                primaryText='我的'
                                leftIcon={<ContentInbox />}
                            />
                        </List>
                    </Drawer>     
                    <div >
                        <AppBar title="o2o促销管理" 
                            onLeftIconButtonClick={ (event)=>{this.setState({showMenu:!showMenu})}}
                            style = {{'position': 'fixed', 'top': 0, 'left': 0}} />
                    </div>
                </div>
            </MuiThemeProvider>)

    }
}

export.default  = 1

ReactDOM.render(<Menu/> , document.getElementById('menu'))



