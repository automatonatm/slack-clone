import React, {Component} from 'react';
import mime from 'mime-types'
import {Button, Icon, Input, Modal} from "semantic-ui-react";

class FileModal extends Component {
    state = {
        file: null,
        authorized: ['image/jpeg', 'image/png']
    }

    fileChangeHandler = (event) => {
        const file = event.target.files[0]
       if(file) {
           this.setState({file: file})
       }
    }

    isAuthorised = (filename) => this.state.authorized.includes(mime.lookup(filename))

    sendFileHandler = () => {
        const {file} = this.state
        const {uploadFile, closeModal} = this.props
        if(file !== null) {
            if(this.isAuthorised(file.name)) {
                const metadata = {
                    contentType: mime.lookup(file.name),
                }
                uploadFile(file, metadata)

                closeModal()
                this.clearFile()

            }
        }
     }

    clearFile = () => this.setState({file: null})

    render() {
        const {modal, closeModal} = this.props
        return (
            <Modal basic open={modal}>
                <Modal.Header>Select an Image file</Modal.Header>
                <Modal.Content>
                    <Input
                        onChange={this.fileChangeHandler}
                        fluid
                        label="File type: jpg, png"
                        name="file"
                        type="file"
                    />
                    <Modal.Actions>
                        <Button color={"green"}
                                inverted
                                onClick={this.sendFileHandler}
                        >
                            <Icon name={"checkmark"}/> Send
                        </Button>
                        <Button color={"red"}
                                inverted
                                onClick={closeModal}
                        >
                            <Icon name={"remove"}/> Cancel
                        </Button>
                    </Modal.Actions>
                </Modal.Content>
            </Modal>
        );
    }
}

export default FileModal;