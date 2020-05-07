import React, {Component} from 'react';
import {Button, Dropdown, Grid, Header, Icon, Image, Input, Modal} from "semantic-ui-react";
import firebase from '../../config/firebase'

import AvatarEditor from 'react-avatar-editor'

class UserPanel extends Component {

    state = {
        user: this.props.currentUser,
        modal: false,
        previewImage: '',
        croppedImage: '',
        blob: '',
        storageRef: firebase.storage().ref(),
        usersRef: firebase.auth().currentUser,
        userRef : firebase.database().ref('users'),
        metadata: {
            contentType: 'image/jpeg'
        },
        uploadedCroppedImage: ''
    }

    openModalHandler = () =>  this.setState({modal: true})

    closeModalHandler = () =>  this.setState({modal: false})

    changeAvatarHandler = (event) => {
        const file  = event.target.files[0]
        const reader = new FileReader()
        if (file) {
            console.log(reader.result)
            reader.readAsDataURL(file)
            reader.addEventListener('load', () => {
                this.setState({previewImage: reader.result })
            })
        }


    }

    cropImageHandler = () => {
        if(this.avatarEditor) {
            this.avatarEditor.getImageScaledToCanvas().toBlob(blob => {
                let imageUrl = URL.createObjectURL(blob)
                this.setState({
                    croppedImage: imageUrl,
                    blob
                })
            })
        }
    }

    avatarUploadHandler = () => {
        const {storageRef, usersRef, blob, metadata} = this.state
        storageRef
            .child(`avatars/users/${usersRef.uid}`)
            .put(blob, metadata )
            .then(snap => {
                snap.ref.getDownloadURL()
                    .then(downloadUrl => {
                        this.setState({uploadedCroppedImage:downloadUrl }, () => {
                          this.changeAvatar()
                        })
                    })
            })
    }

    changeAvatar = () => {
        this.state.usersRef
            .updateProfile({
                photoURL: this.state.uploadedCroppedImage
            })
            .then(() => {
                this.closeModalHandler()
            })
            .catch(error => {
                console.log(error)
            })

        this.state.userRef
            .child(this.state.user.uid)
            .update({avatar: this.state.uploadedCroppedImage})
            .then(() => {
                console.log('User Avatar Uploaded')
            })
            .catch(error => {
                console.log(error)
            })
    }

    dropdownOptions = () => [
        {
            key: "user",
            text: <span >Signed in as <strong>{ this.state.user.displayName }</strong></span>,
            disabled: true
        },
        {
            key: "avatar",
            text: <span onClick={this.openModalHandler}>Change Avatar</span>
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

        const {user , modal, previewImage, croppedImage, blob} = this.state

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
                 {/*Change user avatar modal*/}
                 <Modal basic open={modal} onClose={this.closeModalHandler}>
                     <Modal.Header>Change Avatar</Modal.Header>
                     <Modal.Content>
                         <Input
                             fluid
                             type="file"
                             label="New Avatar"
                             name="preview Image"
                             onChange={this.changeAvatarHandler}
                         />
                         <Grid centered stackable columns={2}>
                             <Grid.Row centered>
                                 <Grid.Column className="ui center aligned grid">
                                     {previewImage && (
                                         <AvatarEditor
                                             image={previewImage}
                                             width={120}
                                             height={120}
                                             border={50}
                                             scale={1.2}
                                             ref={node => (this.avatarEditor = node)}
                                         />
                                     ) }
                                 </Grid.Column>
                                 <Grid.Column className="">
                                     {croppedImage && (
                                         <Image
                                             style={{margin: '3.5em auto'}}
                                             witdth={100}
                                             height={100}
                                             src={croppedImage}/>
                                     )}
                                 </Grid.Column>
                             </Grid.Row>
                         </Grid>
                     </Modal.Content>
                     <Modal.Actions>

                         {croppedImage && (
                             <Button color="green" inverted onClick={this.avatarUploadHandler}>
                                 <Icon name="save"/> Change Avatar
                             </Button>
                         )}

                         <Button color="green" inverted onClick={this.cropImageHandler}>
                             <Icon name="save"/> Preview Avatar
                         </Button>

                         <Button color="red" inverted onClick={this.closeModalHandler}>
                             <Icon name="remove"/> Cancel
                         </Button>
                     </Modal.Actions>
                 </Modal>
               </Grid.Column>
           </Grid>
        );
    }
}



export default UserPanel