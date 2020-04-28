import React, {Component} from 'react';
import firebase from '../../config/firebase'

import
{
    Grid,
    Form,
    Segment,
    Button,
    Header,
    Message,
    Icon,
    GridColumn,
    FormInput
} from "semantic-ui-react"
import {Link} from "react-router-dom";




class Login extends Component {

    state = {

        email: '',
        password: '',
        errors: [],
        loading: false,

    }



    handleChange = (event) => {
        this.setState({[event.target.name]: event.target.value })
    }




    displayErrors =  (errors) => {
        errors.map((err, i) => {
            console.log(err.message)
            return <p key={i}>{err.message}</p>
        })
    }

    inputErrorHandler = (errors, inputName ) => {
        return errors.some(error => error.message.toLowerCase().includes(inputName))
            ? 'error' : ''

    }


    isFormValid = (email, password) => email && password


    submitHandler = (event) => {

        event.preventDefault()

        if(this.isFormValid(this.state.email, this.state.password)) {
            this.setState({loading: true, errors: []})
            firebase
                .auth()
                .signInWithEmailAndPassword(this.state.email, this.state.password)
                .then((signedInUser) => {
                    this.setState({loading: false})
                    console.log(signedInUser)
                })
                .catch((error) => {
                    this.setState({loading: false, errors: this.state.errors.concat(error)})
                    console.log(error)
                })

        } else {
            this.setState({loading: false})
        }
    }


    render() {
        const {email, password, errors, loading}  = this.state
        return (
            <div>
                <Grid textAlign="center" verticalAlign="middle" className="app">
                    <GridColumn style={{maxWidth: 450}}>
                        <Header as="h2" icon color="violet" textAlign="center">
                            <Icon name="code branch" color="violet" />
                            Login to DEVCHAT
                        </Header>

                        <Message>Create a free account <Link to="/Register">Register</Link></Message>

                        {errors.length > 0 && (
                            <Message error>
                                <h3>Error</h3>
                                {errors.map((err, i) => (
                                    <p key={i}>{err.message}</p>
                                ) )}
                            </Message>
                        )}

                        <Form onSubmit={this.submitHandler}>
                            <Segment stacked >
                                <FormInput fluid name="email"  icon="mail"
                                           placeholder="email"
                                           iconposition="left"
                                           type="email"
                                           className={this.inputErrorHandler(errors, 'email') + " Form"}
                                           value={email}
                                           onChange={this.handleChange}
                                />

                                <FormInput fluid name="password"  icon="lock"
                                           placeholder="password"
                                           iconposition="left"
                                           type="password"
                                           className={this.inputErrorHandler(errors, 'password') + " Form"}
                                           value={password}
                                           onChange={this.handleChange}
                                />




                                <Button disabled={loading} className={loading ? 'loading' : ''} color="violet" fluid size="large">Login</Button>


                            </Segment>
                        </Form>


                    </GridColumn>
                </Grid>
            </div>
        );
    }
}

export default Login;