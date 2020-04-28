import React, {Component} from 'react';
import ReactDOM from 'react-dom';

import App from './components/App';
import registerServiceWorker from './registerServiceWorker';

import  {BrowserRouter, Switch, Route, withRouter} from "react-router-dom";
import Login from "./components/Auth/Login";
import Register from "./components/Auth/Register";

import "semantic-ui-css/semantic.min.css"

import firebase from './config/firebase'

/*Store*/

import {createStore} from "redux";
import {Provider, connect} from 'react-redux'
import {composeWithDevTools} from "redux-devtools-extension";
import rootReducer from "./store/reducers";

import {setUser, clearUser} from "./store/actions";


import Spinner from "./components/UI/Spinner";

const store = createStore(rootReducer, composeWithDevTools())

class Root extends Component {

    componentDidMount() {
        //console.log(this.props.isLoading)
        firebase.auth().onAuthStateChanged(user => {
            if(user) {
                this.props.setUser(user)
               // console.log(user)
                this.props.history.push('/');
            }else {
                this.props.history.push('/Login');
                this.props.clearUser()
            }
        })
    }

    render() {
            return this.props.isLoading ? <Spinner /> : (
                <Switch>
                    <Route exact path="/" component={App}/>
                    <Route  path="/Login" component={Login}/>
                    <Route  path="/Register" component={Register}/>
                </Switch>
            )
    }
}

const mapStateFromProps = state => ({
    isLoading: state.user.isLoading
})

const RootWithAuth = withRouter(connect(
    mapStateFromProps,
    {setUser, clearUser}
    )(Root))

ReactDOM.render(
    <Provider store={store}>
    <BrowserRouter>
    <RootWithAuth />
    </BrowserRouter>
    </Provider>,
    document.getElementById('root'));
registerServiceWorker();
