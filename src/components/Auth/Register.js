import React, {Component} from 'react';

import {Grid, Form, Segment, Button, Header, Message, Icon, GridColumn, FormInput} from "semantic-ui-react"
import {Link} from "react-router-dom";

class Register extends Component {

    state = {}

    handleChange = () => {

    }

    render() {

        return (
            <div>
               <Grid textAlign="center" verticalAlign="middle">
                   <GridColumn style={{maxWidth: 450}}>
                       <Header as="h2" icon color="orange" textAlign="center">
                           <Icon name="puzzle piece" color="orange" />
                           Register for DevChat
                       </Header>
                       <Segment stacked>
                            <FormInput fluid name="username"  icon="user"
                                       placeholder="username"
                                       iconposition="left"
                                       type="text"
                                       onChange={this.handleChange}
                            />

                           <FormInput fluid name="email"  icon="mail"
                                      placeholder="email"
                                      iconposition="left"
                                      type="email"
                                      onChange={this.handleChange}
                           />

                           <FormInput fluid name="password"  icon="lock"
                                      placeholder="password"
                                      iconposition="left"
                                      type="password"
                                      onChange={this.handleChange}
                           />

                           <FormInput fluid name="passwordConfirmation"  icon="lock"
                                      placeholder="Password Confirmation"
                                      iconposition="left"
                                      type="passwordConfirmation"
                                      onChange={this.handleChange}
                           />

                           <Button color="orange" fluid size="large">Submit</Button>
                           <Message>Already a user? <Link to="/Login">Login</Link></Message>

                       </Segment>
                   </GridColumn>
               </Grid>
            </div>
        );
    }
}

export default Register;