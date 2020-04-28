import React, {Component} from 'react';
import {} from 'semantic-ui-react'
import {Sidebar, Menu, Divider, Button, Modal, Icon, Label, Segment } from "semantic-ui-react";
import {SliderPicker } from 'react-color'

import firebase from '../../config/firebase'




class ColorPanel extends Component {

    state = {
        modal: false,
        primary: '',
        secondary: '',
        user : this.props.currentUser,
        usersRef: firebase.database().ref('users')
    }

    openModalHandler = () => this.setState({modal: true})

    closeModalHandler = () => this.setState({modal: false})

    primaryColorHandler = color => this.setState({primary: color.hex })

    secondaryColorHandler = color => this.setState({secondary: color.hex })


    saveColorHandler = () => {
        if (this.state.secondary && this.state.primary)  {
            this.saveColors(this.state.primary, this.state.secondary)
        }
    }



    saveColors = (primary, secondary) => {
        const {userRef, user} = this.state
       // console.log(user.uid)
        this.state.usersRef
            .child(`${user.uid}/colors`)
            .push()
            .update({
                primary,
                secondary
            })
            .then(() => {
                console.log('Color saved')
            })
            .error(error => {
                console.log(error)
            })

    }

    render() {
        const  {modal, primary, secondary} = this.state
        return (
            <Sidebar
                as={Menu}
                icon="labeled"
                inverted
                vertical
                visible
                width="very thin"
            >
                <Divider/>
                <Button icon="add" size="small" onClick={this.openModalHandler} color="blue"/>
                {/*Color Picker Model*/}
               <Modal open={modal} onClose={this.closeModalHandler}>
                   <Modal.Header>Choose App Colors</Modal.Header>
                   <Modal.Content>
                       <Segment inverted>
                        <Label content="Primary Color" />
                            <SliderPicker color={primary} onChange={this.primaryColorHandler} />
                       </Segment>

                       <Segment inverted>
                       <Label content="Secondary Color" />
                           <SliderPicker color={secondary} onChange={this.secondaryColorHandler} />
                       </Segment>


                   </Modal.Content>
                   <Modal.Actions>
                       <Button color="green" inverted onClick={this.saveColorHandler}>
                           <Icon name="checkmark"/>Save Colors
                       </Button>
                       <Button color="red" inverted onClick={this.closeModalHandler}>
                           <Icon name="remove"/>Cancel
                       </Button>
                   </Modal.Actions>
               </Modal>
            </Sidebar>
        );
    }
}

export default ColorPanel;