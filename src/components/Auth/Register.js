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
import md5 from "md5";



class Register extends Component {

    state = {
        username: '',
        email: '',
        password: '',
        passwordConfirmation: '',
        errors: [],
        loading: false,
        usersRef: firebase.database().ref('users')
    }



    handleChange = (event) => {
        this.setState({[event.target.name]: event.target.value })
    }

    isEmpty = ({username, email, password, passwordConfirmation}) => {
        return !username.length || !password.length || !email || !passwordConfirmation
    }

    isPasswordValid = ({password, passwordConfirmation}) => {
        if(password.length < 6 || passwordConfirmation.length < 6) {
            return false
        }else if (password !== passwordConfirmation) {
            return false
        }else  {
            return  true
        }
    }


    isFormValid = () => {
        let errors = []
        let error

        if(this.isEmpty(this.state)) {
            error =  {message: 'Fill in all fields'}
            this.setState({errors: errors.concat(error)})
            return false
        }else if(!this.isPasswordValid(this.state)) {
            error =  {message: 'Password must be the same and must have at least six characters'}
            this.setState({errors: errors.concat(error)})
            return  false
        }else {
            return true
        }
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

    saveUser = (createrUser) => {
        return this.state.usersRef.child(createrUser.user.uid).set({
            name: createrUser.user.displayName,
            avatar: createrUser.user.photoURL,
            created_at: createrUser.user.metadata.creationTime
        })
    }


    submitHandler = (event) => {

        event.preventDefault()

        if(this.isFormValid()) {
            this.setState({loading: true, errors: []})
            firebase
                .auth()
                .createUserWithEmailAndPassword(this.state.email, this.state.password)
                .then(createdUser => {
                   // console.log(createdUser)
                   createdUser.user.updateProfile({
                       displayName: this.state.username,
                       photoURL: `https://gravatar.com/avatar/${md5(createdUser.user.email)}?d=identicon`
                   })
                       .then(() => {
                           this.saveUser(createdUser).then(() => {
                               //console.log('User Saved')
                           })

                       })
                       .catch(error => {
                           console.log(error)
                           this.setState({loading: false, errors: this.state.errors.concat(error)})
                       })

                })
                .catch(error => {
                    console.log(error)
                    this.setState({loading: false, errors: this.state.errors.concat(error)})
                })
        } else {
            this.setState({loading: false})
        }
    }


    render() {

        const {username, email, password, passwordConfirmation, errors, loading}  = this.state


        return (
            <div>
               <Grid textAlign="center" verticalAlign="middle" className="app">
                   <GridColumn style={{maxWidth: 450}}>
                       <Header as="h2" icon color="orange" textAlign="center">
                           <Icon name="puzzle piece" color="orange" />
                           Register for DEVCHAT
                       </Header>

                       <Message>Already a user? <Link to="/Login">Login</Link></Message>

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
                               <FormInput fluid name="username"  icon="user"
                                          placeholder="username"
                                          iconposition="left"
                                          type="text"
                                          className={this.inputErrorHandler(errors, 'user') + "Form"}
                                          value={username}
                                          onChange={this.handleChange}
                               />

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

                               <FormInput fluid name="passwordConfirmation"  icon="lock"
                                          placeholder="Password Confirmation"
                                          iconposition="left"
                                          type="password"
                                          className={this.inputErrorHandler(errors, 'password') + " Form"}
                                          value={passwordConfirmation}
                                          onChange={this.handleChange}
                               />


                               <Button disabled={loading} className={loading ? 'loading' : ''} color="orange" fluid size="large">Submit</Button>


                           </Segment>
                       </Form>


                   </GridColumn>
               </Grid>
            </div>
        );
    }
}

export default Register;