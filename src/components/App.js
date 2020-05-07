import React from 'react';

import "./App.css"

import {Grid} from "semantic-ui-react";
import ColorPanel from "./ColorPanel/ColorPanel";
import SidePanel from "./SidePanel/SidePanel";
import Messages from "./Messages/Messages";
import MetaPanel from "./MetaPanel/MetaPanel";
import {connect} from "react-redux";

const App = ({currentUser, currentChannel, isPrivateChannel, userPosts}) => {
  return (
     <Grid  columns="equal" className="app" style={{background: "#eee"}}>

         <ColorPanel
             currentUser={currentUser}
             key={currentUser && currentUser.name}
         />

       <SidePanel currentUser={currentUser }
                  key={currentUser && currentUser.uid}
       />

       <Grid.Column style={{marginLeft: 320}}>
           <Messages
               currentUser={currentUser}
               currentChannel={currentChannel}
               isPrivateChannel={isPrivateChannel}
               key={currentChannel && currentChannel.id}
           />
       </Grid.Column>

         <Grid.Column width={4}>
             <MetaPanel
                 key={currentChannel && currentChannel.name}
                 isPrivateChannel={isPrivateChannel}
                 currentChannel={currentChannel}
                 userPosts={userPosts}

             />
         </Grid.Column>

     </Grid>
  );
};


const mapStateToProps = (state) => ({
    currentUser: state.user.currentUser,
    currentChannel: state.channels.currentChannel,
    isPrivateChannel: state.channels.isPrivateChannel,
    userPosts: state.user.posts

})

export default connect(mapStateToProps)(App);
