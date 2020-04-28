import React, {Component} from 'react';
import {Button, Input, Progress, Segment} from "semantic-ui-react";
import firebase from '../../config/firebase'
import FileModal from "./FileModal";
import uuidv4 from 'uuid/v4'
import ProgressBar from './ProgressBar'

class MessageForm extends Component {
    state = {
        message: '',
        loading: false,
        errors: [],
        modal: false,
        channel: this.props.channel,
        user: this.props.currentUser,
        uploadState: '',
        uploadTask: null,
        percentUploaded: 0,
        storageRef: firebase.storage().ref()
    }

    //get the message input
    MessageInputHandler = (event) => {
        this.setState({[event.target.name]: event.target.value})
    }


    //Create a new message
    createMessage = (fileUrl = null) => {
     const   message = {
            timestamp: firebase.database.ServerValue.TIMESTAMP,
            user: {
                id: this.state.user.uid,
                name: this.state.user.displayName,
                avatar: this.state.user.photoURL
            },

        };

     if(fileUrl !== null) {
            message['image'] = fileUrl
     }else {
         message['content'] = this.state.message
     }
        return message
    }

    // Send A normal text message
    sendMessageHandler = () => {
        const {getMessagesRef} = this.props
        const {message, channel} = this.state
        if(message) {
            this.setState({loading: true})
            getMessagesRef()
                .child(channel.id)
                .push()
                .set(this.createMessage())
                .then(() => {
                    this.setState({loading: false, message: '', errors: []})
                })
                .catch((error) => {
                    console.log(error)
                    this.setState({
                        loading: false,
                        errors: this.state.errors.concat(error),

                    })
                })
            //Send Message
        }else {
            this.setState({errors: this.state.errors.concat({message: 'Add a message'})})
        }

    }

    //Open and close modals
    openModalHandler = () => this.setState({modal: true})

    closeModalHandler = () => this.setState({modal: false})

    getPath = () => {
        if (this.props.isPrivateChannel)  {
            return `chat/private-${this.state.channel.id}`
        } else  {
            return 'chat/public'
        }
    }

   // Upload a file
    uploadFile = (file, metadata) => {
        console.log(metadata)
        const pathToUpload = this.state.channel.id
        const ref = this.props.getMessagesRef()
        const  filePath = `${this.getPath()}/${uuidv4()}.jpg`

        this.setState({
            uploadState: 'uploading',
            uploadTask: this.state.storageRef.child(filePath).put(file, metadata)
        },
            () => {
                    this.state.uploadTask.on('state_changed',
                            snap => {
                        const percentUploaded = Math.round((snap.bytesTransferred / snap.totalBytes) * 100)
                        this.props.isProgressBarVisible(percentUploaded)
                        this.setState({percentUploaded: percentUploaded})
                    },
                        err => {
                            console.log(err)
                            this.setState({
                                errors: this.state.errors.concat(err),
                                uploadState: 'error',
                                uploadTask: null
                            })
                        },

                        () => {
                            this.state.uploadTask.snapshot.ref.getDownloadURL()
                                .then(downloadUrl => {
                                    this.sendFileMessage(downloadUrl, ref, pathToUpload)
                                })
                                .catch(error => {
                                    console.log(error)
                                    this.setState({
                                        errors: this.state.errors.concat(error),
                                        uploadState: 'error',
                                        uploadTask: null
                                    })
                                })
                        }

                    )

            }



        )

    }

    // Send to file message to message database
    sendFileMessage =  (fireUrl, ref, pathToUpload) => {
        ref.child(pathToUpload)
            .push()
            .set(this.createMessage(fireUrl))
            .then(() => {
                this.setState({uploadState: 'done'})
            })
            .catch(error => {
                console.log(error)
                this.setState({
                    errors: this.state.errors.concat(error)
                })
            })

    }

    render() {

        const {errors, message, loading, modal, uploadState, percentUploaded} = this.state

        return (
         <Segment className="message__form">
            <Input
                fluid
                value={message}
                name={"message"}
                className={
                    errors.some(error => error.message.includes('message'))
                        ? 'error' : ''
                }
                style={{marginBottom: '0.7em'}}
                label={<Button icon={"add"} />}
                labelPosition={"left"}
                placeholder={"Write you message"}
                onChange={this.MessageInputHandler}

            />
            <Button.Group>
                <Button
                    disabled={loading}
                    color="orange"
                    content="Add Reply"
                    labelPosition={"left"}
                    icon={"edit"}
                    onClick={this.sendMessageHandler}
                />

                <Button
                    onClick={this.openModalHandler}
                    color="teal"
                    disabled={uploadState === 'uploading'}
                    content="Upload Media"
                    labelPosition={"right"}
                    icon={"cloud upload"}
                />

            </Button.Group>
             <FileModal
                 modal={modal}
                 closeModal={this.closeModalHandler}
                 uploadFile={this.uploadFile}
             />
             { uploadState !== 'done' &&  <ProgressBar
                 uploadState={uploadState}
                 percentUploaded={percentUploaded}
             />}
         </Segment>
        );
    }
}

export default MessageForm;