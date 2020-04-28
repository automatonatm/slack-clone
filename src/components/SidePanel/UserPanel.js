import React, {Component} from 'react';
import {Dropdown, Grid, Header, Icon, Image} from "semantic-ui-react";
import firebase from '../../config/firebase'




class UserPanel extends Component {

    state = {
        user: this.props.currentUser
    }

    dropdownOptions = () => [
        {
            key: "user",
            text: <span >Signed in as <strong>{ this.state.user.displayName }</strong></span>,
            disabled: true
        },
        {
            key: "avatar",
            text: <span>Change Avatar</span>
        },

        {
            key: "signout",
            text: <span onClick={this.signOutHandler}>Sign Out</span>
        }
    ]

    signOutHandler = () => {
        firebase
            .auth()
            .signOut()
            .then(() => console.log('Signed Out'))
    }

    render() {

        const {user} = this.state

        return (
           <Grid style={{background: "#4c34c"}}>
               <Grid.Column>
                   <Grid.Row style={{padding: '1.2rem', margin: 0}}>
                       {/*APP HEADER*/}
                       <Header inverted floated="left" as="h2">
                           <Icon name="code"/>
                           <Header.Content>DEVCHAT</Header.Content>
                       </Header>
                   </Grid.Row>

                   {/*User Drop Down*/}
                   <Header style={{padding: '0.5rem'}} as="h4" inverted>
                       <Dropdown  trigger={
                           <span>
                               <Image src={user.photoURL} space="right" avatar />
                               {user.displayName}
                           </span>
                       } options={this.dropdownOptions()}/>
                   </Header>
               </Grid.Column>
           </Grid>
        );
    }
}



export default UserPanel