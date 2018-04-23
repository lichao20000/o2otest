import { HashRouter as Router, Route, Link } from 'react-router-dom'
import Menu from './menu'
import {SalesPosition  } from './pos/sales-position'
import {SalesPositionManager } from './pos/sales-editor'
import { NewPosition}  from './pos/sales-new'
import { SalerList } from './saler/saler'
import { SalerEditor } from './saler/saler-editor'
import { NewSaler } from './saler/saler-new'
import { PosImport} from './pos/pos-batch'


const Home = () => (
  <div>
    <h2>统计信息</h2>
    待开发，敬请期待
  </div>
)

const About = () => (
  <div>
    <h2>About</h2>
  </div>
)

const Topic = ({ match }) => (
  <div>
    <h3>{match.params.topicId}</h3>
  </div>
)

const Topics = ({ match }) =>{
  console.info(match)
  return(
  <div>
    <h2>Topics</h2>
    <ul>
      <li>
        <Link to={`{match.url}/rendering`}>
          Rendering with React
        </Link>
      </li>
      <li>
        <Link to={`${match.url}/components`}>
          Components
        </Link>
      </li>
      <li>
        <Link to={`${match.url}/props-v-state`}>
          Props v. State
        </Link>
      </li>
    </ul>

    <Route path={`${match.path}/:topicId`} component={Topic}/>
    <Route exact path={match.path} render={() => (
      <h3>Please select a topic.{match.pos_id}</h3>
    )}/>
  </div>) }


ReactDOM.render((
  <Router>
    <Menu>
        <Route path="/"  exact component={Home}/>
        <Route path="/plan/arrange/" component={About}/>
        <Route path="/plan/history/" component={Home} />
        <Route path="/pos/manager/" exact component={SalesPosition} />
        <Route path="/pos/manager/:pos_id" component={SalesPositionManager}/>
        <Route path="/pos/new" exact component={NewPosition} />
        <Route path="/pos/import" exact component={PosImport} />
        <Route path="/saler/manager" exact component={SalerList} />
        <Route path="/saler/manager/:mobile" component={SalerEditor}/>
        <Route path="/saler/new" exact component={NewSaler} />
        <Route path="/user/mine" component={Topics} />
    </Menu>
  </Router>
), document.getElementById('app'))
