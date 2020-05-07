import React from 'react';

import {Button, Form, Icon, Input, Menu, Modal, Label} from "semantic-ui-react";

import firebase from '../../config/firebase'

import {connect} from "react-redux";

import {setCurrentChannel, setPrivateChannel} from "../../store/actions";

class Channels extends React.Component {

    state = {
        channels: [],
        channel: null,
        activeChannel: '',
        channelName: '',
        channelDetails: '',
        loading: false,
        modal: false,
        channelsRef: firebase.database().ref('channels'),
        messagesRef: firebase.database().ref('messages'),
        typingRef: firebase.database().ref('typing'),
        notifications: [],
        currentUser: this.props.currentUser,
        firstLoad: true,

    }

    componentDidMount() {
        this.addListeners()

    }

    componentWillUnmount() {
        this.removeListeners()
        this.state.channels.forEach(channel => {
            this.state.messagesRef.child(channel.id).off()
        })
    }

    addListeners = () => {

        let loadedChannels = []
        this.state.channelsRef.on('child_added', snap => {
            loadedChannels.push(snap.val())

           this.setState({channels: loadedChannels}, () => this.setFirstChannel())

            //console.log(snap.key)
            //add a notification listener for notifications
            this.addNotificationListener(snap.key)
        })
    }

    //Handle and listen to notifications
    addNotificationListener = (channelId) => {
        //console.log(channelId)
        this.state.messagesRef.child(channelId).on('value', snap => {
            if(this.state.channel) {
                //Send the user notifications
                this.handleNotifications(channelId, this.state.channel.id, this.state.notifications, snap)
            }
        })
    }

    //Handle the notifications here
    handleNotifications = (channelId, currentChannelId, notifications, snap )  => {
        let lastTotal = 0

        let index = notifications.findIndex(notification => notification.id === channelId)
        if(index !== -1) {
            if(channelId !== currentChannelId) {
                lastTotal = notifications[index].total
                if((snap.numChildren() - lastTotal) > 0) {

                    notifications[index].count = snap.numChildren() - lastTotal
                }
            }
            notifications[index].lastKnownTotal = snap.numChildren() - lastTotal
        }else {
            notifications.push({
                id: channelId,
                total: snap.numChildren(),
                lastKnownTotal: snap.numChildren(),
                count: 0
            })
        }
        this.setState({notifications})
    }

    //Clear Notifications
    clearNotifications = () => {
        let index = this.state.notifications.findIndex(notification => notification.id === this.state.channel.id)
        if(index !== -1) {
            let updateNotifications = [...this.state.notifications]
            updateNotifications[index].total = this.state.notifications[index].lastKnownTotal
            updateNotifications[index].count = 0
            this.setState({notifications: updateNotifications})
        }
    }

    //count the numbers of notifications
    getNotificationCount = (channel) => {
        let count = 0
        this.state.notifications.forEach(notification => {
            if(notification.id === channel.id) {
                count = notification.count
            }
        })
        if (count > 0) return count
    }

    removeListeners = () => {
        this.state.channelsRef.off()

        this.state.channels.forEach(channel => {
            this.state.messagesRef.child(channel.id).off()
        })
    }

    openModalHandler = () => {
        this.setState({modal: true})
    }

    closeModalHandler = () => {
        this.setState({modal: false})
    }

    inputChangeHandler = (event) => {
        this.setState({[event.target.name] : event.target.value})
    }

    isFormValid = ({channelName, channelDetails}) =>   channelDetails && channelName

    createChannelHandler = (event) => {
        event.preventDefault()
        if(this.isFormValid(this.state)) {
            this.setState({loading: true})
            this.addChannel()
            this.setState({loading: false})
        }
    }

    addChannel = () => {
      const {channelsRef, channelName, channelDetails, currentUser, loading} = this.state
        const  key = channelsRef.push().key
        const newChannel = {
            id: key,
            name: channelName,
            details: channelDetails,
            createdBy : {
               name:  currentUser.displayName,
                avatar: currentUser.photoURL
            }
        }
        channelsRef
            .child(key)
            .update(newChannel)
            .then(() => {

                this.setState({channelName: '', channelDetails: '',})

                this.closeModalHandler()

               // console.log('channel Added')
            })
            .catch((error) => {
                console.log(error)
            })
    }

    //Display all chanels
    displayChannels = channels => {
        if (channels.length > 0) {
            return channels.map(channel => (
                <Menu.Item
                    key={channel.id}
                    onClick={() => this.changeChannel(channel)}
                    name={channel.name}
                    style={{opacity: 0.7}}
                    active={channel.id === this.state.activeChannel}
                >
                    {this.getNotificationCount(channel) && (
                        <Label color="red">{this.getNotificationCount(channel)}</Label>
                    )}
                    # {channel.name}
                </Menu.Item>

            ))

        }
    }

    setFirstChannel = () => {
        const  firstChannel = this.state.channels[0]
        if(this.state.firstLoad && this.state.channels.length > 0) {
            this.props.setCurrentChannel(firstChannel)
            this.setActiveChannel(firstChannel)
            this.setState({channel: firstChannel})
        }

        this.setState({firstLoad: false})

    }


    changeChannel = (channel) => {
        this.setActiveChannel(channel)
        this.state.typingRef
            .child(this.state.channel.id)
            .child(this.state.currentUser.uid)
            .remove()
        this.clearNotifications()
        this.props.setCurrentChannel(channel)
        this.props.setPrivateChannel(false)
        this.setState({channel})
    }



    //values[12]

    setActiveChannel = (channel) => {
            this.setState({activeChannel: channel.id})
    }


    render() {
        const {channels, modal, loading} = this.state
        return (
            <React.Fragment>
            <Menu.Menu className="menu">

               <Menu.Item>
                   <span  >
                       <Icon name="exchange"   /> CHANNELS
                   </span>{"  "}
                   ({channels.length}) <Icon onClick={this.openModalHandler} name="add"/>
               </Menu.Item>

                {this.displayChannels(channels)}

            </Menu.Menu>


               {/*Add Channel*/}

               <Modal basic open={modal} onClose={this.closeModalHandler}>
                <Modal.Header>Add a Channel</Modal.Header>
                <Modal.Content>
                    <Form onSubmit={this.createChannelHandler}>
                        <Form.Field>
                            <Input
                                fluid
                                label="Name of Channel"
                                name="channelName"
                                onChange={this.inputChangeHandler}
                            />
                        </Form.Field>

                        <Form.Field>
                            <Input
                                fluid
                                label="Channel Description"
                                name="channelDetails"
                                onChange={this.inputChangeHandler}
                            />
                        </Form.Field>
                    </Form>
                </Modal.Content>
                    <Modal.Actions>
                        <Button color="green" inverted onClick={this.createChannelHandler}>
                            <Icon name="checkmark"/> Add
                        </Button>
                        <Button disabled={this.state.loading} className={this.state.loading ? 'loading' : ''}  color="red" inverted onClick={this.closeModalHandler}>
                            <Icon name="remove"/> Cancel
                        </Button>
                    </Modal.Actions>

            </Modal>
            </React.Fragment>
        );
    }
}

export default connect(
    null,
    {setCurrentChannel, setPrivateChannel}
    )(Channels);