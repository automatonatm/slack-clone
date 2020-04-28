import React, {Component} from 'react';
import {Header, Icon, Input, Segment} from "semantic-ui-react";

class MessagesHeader extends Component {
    render() {

        const {channelName,
                numuniqueUsers,
                searchHandler,
                isChannelStarred,
                starredHandler,
                isPrivateChannel} = this.props

        return (
         <Segment clearing>
             {/*Channel Title*/}
             <Header fluid="true" as="h2" floated="left" style={{marginHeight: 0}}>
                <span>
                 {channelName}
                 {!isPrivateChannel &&  (
                     <Icon
                         onClick={starredHandler}
                           name={isChannelStarred ? 'star' : 'star outline'}
                           color={isChannelStarred ? 'yellow' : 'black'}/>
                     ) }
                </span>
                 <Header.Subheader>{numuniqueUsers}</Header.Subheader>
             </Header>

             {/*Channel Search Inputs*/}
             <Header floated={"right"}>
                    <Input
                        onChange={searchHandler}
                        size={"mini"}
                        icon={"search"}
                        name={"searchQuery"}
                        placeholder={"Search Messages"}

                    />
             </Header>

         </Segment>
        );
    }
}

export default MessagesHeader;