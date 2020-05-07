import React, {Component, Fragment} from 'react';

import {Segment, Comment} from "semantic-ui-react";
import MessagesHeader from "./MessagesHeader";
import MessageForm from "./MessageForm";

import firebase from '../../config/firebase'

import Message from "./Message";
import {connect} from "react-redux";
import {setUserPosts} from '../../store/actions'
import Typing from "./Typing"

import Skeleton from './Skeleton'

class Messages extends Component {


    state = {
        channel: this.props.currentChannel,
        currentUser: this.props.currentUser,
        privateChannel: this.props.isPrivateChannel,
        isChannelStarred: false,
        messagesLoading: true,
        modal: false,
        messages: [],
        messagesRef: firebase.database().ref('messages'),
        privateMessageRef: firebase.database().ref('privateMessages'),
        usersRef: firebase.database().ref('users'),
        progressBar: false,
        numuniqueUsers: '',
        searchQuery: '',
        searchLoading: false,
        searchResults: [],
        typingRef: firebase.database().ref('typing'),
        typingUsers: [],
        connectedRef: firebase.database().ref('.info/connected'),
        listeners: []
    }

    componentDidMount() {
        const {channel, currentUser} = this.state

        if(channel && currentUser) {
            this.addListeners(channel.id)
            this.addUserStarsListener(channel.id, currentUser.uid)
        }
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        /*Fire the Message end*/
        if(this.messagesEnd) {
            this.scrollToBottom();
        }
    }

    componentWillUnmount() {
        this.removeListeners(this.state.listeners);
        this.state.connectedRef.off()
    }

    removeListeners = (listeners) => {
        listeners.forEach(l => {
            l.ref.child(l.id).off(l.event)
        })
    }


    addToListeners = (id, ref, event) => {
        const index = this.state.listeners.findIndex(listener => {
            return listener.id === id && listener.ref === ref && listener.event === event
        })
        if(index === -1) {
            const newListener = {id, ref, event}
            this.setState({listeners: this.state.listeners.concat(newListener)})
        }

    }

    /*Scroll to the Bottom*/
    scrollToBottom = () => {
        this.messagesEnd.scrollIntoView({behavior: 'smooth'})
    }


    addListeners = (channelId) => {
        this.addMessageListener(channelId)
        this.addTypingListeners(channelId)
    }

    // listen for new added stars
    addUserStarsListener = (channelId, userId) => {
        this.state.usersRef
            .child(userId)
            .child('starred')
            .once('value')
            .then(data => {
                if(data.val() !== null) {
                    const channelIds = Object.keys(data.val())
                    const prevStarred = channelIds.includes(channelId)
                    this.setState({isChannelStarred: prevStarred})
                }
            })
    }

    //get the database ref base on the status of a channel i.e private or !private
    getMessagesRef = () => {
        const {messagesRef, privateMessageRef, privateChannel } = this.state
        return privateChannel ? privateMessageRef : messagesRef
    }
    //Listen for new messages
    addMessageListener = (channelId) => {
        //console.log(channelId)
        const ref = this.getMessagesRef()
        let loadMessages = []
        ref.child(channelId).on('child_added', snap => {
            loadMessages.push(snap.val())
            this.setState({
                messages: loadMessages,
                messagesLoading: false
            })

            //Count the users that have contributed to this channel
            this.countUniqueUsers(loadMessages)

            // counting for top post
            this.countUsersPosts(loadMessages )
        })


    }


    /*The typing Listener*/

    addTypingListeners = (channelId) => {

        let typingUsers = []

        this.state.typingRef
            .child(channelId)
            .on('child_added', snap => {
                if(snap.key !== this.state.currentUser.uid) {
                       typingUsers = typingUsers.concat({
                           id: snap.key,
                           name: snap.val()
                       })
                    this.setState({typingUsers})
                }
            })
        //Add to Listeners
        this.addToListeners(channelId, this.state.typingRef, 'child_added')

        this.state.typingRef
            .child(channelId)
            .on('child_removed', snap => {
                const index = typingUsers.findIndex(user => user.id === snap.key)
                if(index !== -1) {
                    typingUsers = typingUsers.filter(user => user.id !== snap.key)
                    this.setState({typingUsers})
                }
            })
        //Add to Listeners
        this.addToListeners(channelId, this.state.typingRef, 'child_removed')

        this.state.connectedRef
            .on('value', snap => {
                if(snap.val() === true) {
                    this.state.typingRef
                        .child(channelId)
                        .child(this.state.currentUser.uid)
                        .onDisconnect()
                        .remove(err => {
                            if(err !== null) {
                                console.log(err)
                            }
                        })
                }
            })



    }




    //Count the number of unique users
    countUniqueUsers = (messages) => {
        const uniqueUsers = messages.reduce((acc, message ) => {
            if(!acc.includes(message.user.name)) {
                acc.push(message.user.name)
            }
            return acc
        }, [])

        const plular = uniqueUsers.length > 1 || uniqueUsers === 0
        const numuniqueUsers = `${uniqueUsers.length} user${plular ? "s" : ""}`
        this.setState({numuniqueUsers})
    }

    countUsersPosts = (messages) => {
         let userPosts = messages.reduce( (acc, message) => {
             if(message.user.name in acc) {
                     acc[message.user.name].count +=1
             }else {
                 acc[message.user.name] = {
                     avatar: message.user.avatar,
                     count: 1
                 }
              }
             return acc
         }, {})
        this.props.setUserPosts(userPosts)
       // console.log(userPosts)
    }


    displayMessages = messages => (
            messages.length > 0 && messages.map(message => (
                <Message message={message}
                         user={this.state.currentUser}
                         key={message.timestamp}
                />
            ))
    )

    /*Display Skeleton*/

    displaySkeleton = loading => (
        loading ? (
            <React.Fragment>
                {[...Array(10)].map((_, i) => (
                    <Skeleton key={i}/>
                ))}
            </React.Fragment>
        ) : null
    )

    //Condition for changing the classes of messages when  upload percentage is is on
    isProgressBarVisible = (percent) => {
        if(percent > 0) {
            this.setState({progressBar: true})
        }
    }

    displayChannelName = channel => {
        return  channel ? `${this.state.privateChannel ? '@' : '#'}${channel.name}` : ''
    }

    //Search For messages
    searchHandler = (event) => {
        this.setState({
            searchQuery: event.target.value,
            searchLoading: true
        },
            () =>  this.searchMessageHandler()
            )
    }

    //Find all messages
    searchMessageHandler = () => {
        const  channelMessages = [...this.state.messages] //push all messages
        const regex = new RegExp(this.state.searchQuery, 'gi') // create a grobal search
        const searchResults = channelMessages.reduce((acc, message) => {
            if(message.content && message.content.match(regex) || message.user.name.match(regex)) {
                acc.push(message)
            }
            return acc
        }, [])
        this.setState({searchResults})
    }

    //Handle starred channels with a click
    starredHandler = () => {

        this.setState(prevState => ({
            isChannelStarred: !prevState.isChannelStarred
        }), () => this.starChannel())
    }

    starChannel = () => {
        if(this.state.isChannelStarred ) {
            this.state.usersRef
                .child(`${this.state.currentUser.uid}/starred`)
                .update({
                    [this.state.channel.id] : {
                        name: this.state.channel.name,
                        details: this.state.channel.details,
                        createdBy: {
                            name: this.state.channel.createdBy.name,
                            avatar: this.state.channel.createdBy.avatar
                        }
                    }
                })
        }else {
           this.state.usersRef
               .child(`${this.state.currentUser.uid}/starred`)
               .child(this.state.channel.id)
                .remove(err => {
                    if(err != null) {
                        console.log(err)
                    }
                })
        }
    }

    displayTypingUsers = (users) => (
        users.length > 0 && users.map(user => (
            <div style={{display: 'flex', alignItems: 'center  ', marginBottom: '0.2em'}} key={user.id}>
                <span className="user__typing">{user.name} is typing</span>
                <Typing/>
            </div>
        ))
    )


    render() {
        const {messagesRef, channel,
               currentUser, messages,
               progressBar, numuniqueUsers,
               searchQuery, searchResults,
               privateChannel, isChannelStarred,
               typingUsers, messagesLoading
        } = this.state
        return (
            <React.Fragment>
                <MessagesHeader
                    channelName={this.displayChannelName(channel)}
                    numuniqueUsers={numuniqueUsers}
                    searchHandler={this.searchHandler}
                    isPrivateChannel={privateChannel}
                    starredHandler={this.starredHandler}
                    isChannelStarred={isChannelStarred}
                />
                    <Segment>
                        <Comment.Group className={progressBar ? 'message__progress' : 'messages'}>
                            {/*Messages*/}
                            {  this.displaySkeleton(messagesLoading)}
                            {
                                searchQuery ? this.displayMessages(searchResults)
                                : this.displayMessages(messages)
                            }
                            {this.displayTypingUsers(typingUsers)}
                            <div ref={node => (this.messagesEnd = node)}></div>

                        </Comment.Group>
                    </Segment>

                <MessageForm
                    currentUser={currentUser}
                    messagesRef={messagesRef}
                    isPrivateChannel={privateChannel}
                    getMessagesRef={this.getMessagesRef}
                    isProgressBarVisible={this.isProgressBarVisible} //Used to to check the progressBar
                    channel={channel} />

            </React.Fragment>
        );
    }
}

export default connect(null, {setUserPosts})(Messages);