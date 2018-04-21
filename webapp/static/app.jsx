import { HashRouter as Router, Route, Link } from 'react-router-dom'
import Menu from './menu'

/*
React.render((
  <Router>
    <Route path="/" component={App}>
      <Route path="about" component={About}/>
      <Route path="users" component={Users}>
        <Route path="/user/:userId" component={User}/>
      </Route>
      <Route path="*" component={NoMatch}/>
    </Route>
  </Router>
), document.body)

*/

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
      <h3>Please select a topic.</h3>
    )}/>
  </div>) }

ReactDOM.render((
  <Router>
    <Menu>
        <Route path="/plan/arrange/" component={About}/>
        <Route path="/plan/history/" component={Home} />
        <Route path="/user/mine" component={Topics} />
    </Menu>
  </Router>
), document.getElementById('app'))
