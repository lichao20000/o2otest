import { HashRouter as Router, Route, Link } from 'react-router-dom'
import Menu from './menu'
import {SalesPosition  } from './pos/sales-position'
import {SalesPositionManager } from './pos/sales-editor'
import { NewPosition}  from './pos/sales-new'
import { SalerList } from './saler/saler'
import { SalerEditor } from './saler/saler-editor'
import { NewSaler } from './saler/saler-new'
import { PosImport} from './pos/pos-batch'
import { SalerImport } from './saler/saler-batch'
import { LoginOut } from './user/login-out'
import { AdminSwitch} from './user/admin-switch'
import { Plan } from './plan/plan'
import { HomeData} from './home'



ReactDOM.render((
  <Router>
    <Menu>
        <Route path="/"  exact component={HomeData}/>

        <Route path="/pos/manager/" exact component={SalesPosition} />
        <Route path="/pos/manager/:pos_id" component={SalesPositionManager}/>
        <Route path="/pos/new" exact component={NewPosition} />
        <Route path="/pos/import" exact component={PosImport} />

        <Route path="/saler/manager" exact component={SalerList} />
        <Route path="/saler/manager/:mobile" component={SalerEditor}/>
        <Route path="/saler/new" exact component={NewSaler} />
        <Route path="/saler/import" exact component={SalerImport} />

        <Route path="/plan/arrange" exact component={Plan} />

        <Route path="/admin/switch" component={AdminSwitch} />
        <Route path="/login_out/" component={LoginOut} />
    </Menu>
  </Router>
), document.getElementById('app'))
