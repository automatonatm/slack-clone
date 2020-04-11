import React from 'react';
import ReactDOM from 'react-dom';

import App from './components/App';
import registerServiceWorker from './registerServiceWorker';

import  {BrowserRouter as Router, Switch, Route} from "react-router-dom";
import Login from "./components/Auth/Login";
import Register from "./components/Auth/Register";

import "semantic-ui-css/semantic.min.css"


const Root = () =>  (
    <Router>
        <Switch>
            <Route exact path="/" component={App}/>
            <Route  path="/Login" component={Login}/>
            <Route  path="/Register" component={Register}/>
        </Switch>
    </Router>
)
ReactDOM.render(<Root />, document.getElementById('root'));
registerServiceWorker();
