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
import { Audit } from './plan/audit'
import { MyPlan } from './plan/myplan'
import { HomeData} from './home'
import {AdminManager} from './user/admin-manager'
import {AdminEditor} from './user/admin-editor'
import T from './pos/pos-audit'
import TableExampleComplex from './plan/test'
import {AdminPostType} from './user/admin-postype'
import {planExport} from './plan/planExport.jsx'

ReactDOM.render((
  <Router>
    <Menu>
        <Route path="/"  exact component={HomeData}/>

        <Route path="/pos/manager/" exact component={SalesPosition} />
        <Route path="/pos/manager/:pos_id" component={SalesPositionManager}/>
        <Route path="/pos/new" exact component={NewPosition} />
        <Route path="/pos/import" exact component={PosImport} />
        <Route path="/pos/audit" component={T}/>

        <Route path="/saler/manager" exact component={SalerList} />
        <Route path="/saler/manager/:mobile" component={SalerEditor}/>
        <Route path="/saler/new" exact component={NewSaler} />
        <Route path="/saler/import" exact component={SalerImport} />

        <Route path="/plan/arrange" exact component={Plan} />
        <Route path="/plan/audit" exact component={Audit} />
        <Route path="/plan/export" exact component={planExport}/>
        <Route path="/plan/mine" exact component={MyPlan} />

        <Route path="/admin/switch" component={AdminSwitch} />
        <Route path="/admin/manager" exact component={AdminManager} />
        <Route path="/admin/manager/:user_id" component={AdminEditor}/>
        <Route path="/login_out/" component={LoginOut} />

        <Route path="/test" component={TableExampleComplex}/>

        <Route path="/pos/type" component={AdminPostType}/>
    </Menu>
  </Router>
), document.getElementById('app'))
