import { HashRouter as Router, Route, Link } from 'react-router-dom'
import Menu from './menu'
import {SalesPosition , SalesPositionManager }from './pos/sales-position'


const Home = () => (
  <div>
    <h2>Home</h2>
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
        <Route path="/plan/arrange/" component={About}/>
        <Route path="/plan/history/" component={Home} />
        <Route path="/pos/manager/" exact component={SalesPosition} />
        <Route path="/pos/manager/:pos_id" component={SalesPositionManager}/>
        <Route path="/user/mine" component={Topics} />
    </Menu>
  </Router>
), document.getElementById('app'))
