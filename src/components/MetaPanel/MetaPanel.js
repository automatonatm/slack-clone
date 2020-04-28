import React, {Component} from 'react';
import {Accordion, Header, Icon, Image, Segment, List} from "semantic-ui-react";

class MetaPanel extends Component {
    state = {
        activeIndex: 0,
        isPrivateChannel: this.props.isPrivateChannel,
        channel: this.props.currentChannel
    }

    setActiveIndex = (event, titleProps) => {


        const  {index} = titleProps
        const {activeIndex} = this.state
        const newIndex = activeIndex === index ? -1 : index
        this.setState({activeIndex: newIndex})

    }

    formatCount = (val) => (
        val > 1 || val === 0 ? `${val} Posts` : `${val} Post`
    )




    render() {

        const {activeIndex, isPrivateChannel, channel} = this.state
        const {userPosts} = this.props

        if(isPrivateChannel) return  null
        return (
            <Segment loading={!channel}>
                <Header as="h5" attached="top">
                     About # { channel && channel.name}
                </Header>

                <Accordion styled attached="true">
                    <Accordion.Title
                        active={activeIndex === 0}
                        index={0}
                        onClick={this.setActiveIndex}
                    >
                        <Icon name={"dropdown"}/>
                        <Icon name={"info"}/>
                        Channels Details
                    </Accordion.Title>
                    <Accordion.Content active={activeIndex === 0}>
                        {channel && channel.details}
                    </Accordion.Content>


                    <Accordion.Title
                        active={activeIndex === 1}
                        index={1}
                        onClick={this.setActiveIndex}
                    >
                        <Icon name={"dropdown"}/>
                        <Icon name={"user circle"}/>
                        Top Posters
                    </Accordion.Title>
                    <Accordion.Content active={activeIndex === 1}>
                        <List>
                            {
                                userPosts ?   Object.entries(userPosts)
                                    .sort((a, b) => b[1] - a[1] )
                                    .map(([key, val], i) => (
                                          <List.Item key={i}>
                                            <Image avatar src={val.avatar}/>
                                            <List.Content>
                                                <List.Header as="a">{key}</List.Header>
                                                <List.Description>{this.formatCount(val.count)}</List.Description>
                                            </List.Content>
                                        </List.Item>
                                    ))
                                        .slice(0, 5)
                                    : ''
                            }
                        </List>
                    </Accordion.Content>



                    <Accordion.Title
                        active={activeIndex === 2}
                        index={2}
                        onClick={this.setActiveIndex}
                    >
                        <Icon name={"dropdown"}/>
                        <Icon name={"pencil alternate"}/>
                        Created By
                    </Accordion.Title>
                    <Accordion.Content active={activeIndex === 2}>
                        <Header>
                            <Image circular src={channel && channel.createdBy.avatar} />
                            {channel && channel.createdBy.name}
                        </Header>

                    </Accordion.Content>



                </Accordion>
            </Segment>
        );
    }
}

export default MetaPanel;