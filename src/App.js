import React, { Component } from 'react';
// import { w3cwebsocket as W3CWebSocket } from "websocket";
import Identicon from 'react-identicons';
import SelectButton from 'primereact/selectbutton';

import {
  Navbar,
  NavbarBrand,
  UncontrolledTooltip
} from 'reactstrap';
import Editor from 'react-medium-editor';
import 'medium-editor/dist/css/medium-editor.css';
import 'medium-editor/dist/css/themes/default.css';
import './App.css';

const client = new WebSocket('ws://127.0.0.1:8080/backend');
const contentDefaultMessage = "Start writing your document here";

class App extends Component {
  constructor(props) {
    super(props);
    this.state = {
      currentUsers: [{ username: 'Aniket' }, { username: 'Mihir' }],
      userActivity: [],
      username: null,
      text: '',
      points: [{ label: '0', key: '0' }, { label: '1', key: '1' }, { label: '2', key: '2' }, { label: '3', key: '3' }, { label: '5', key: '5' }, { label: '8', key: '8' }, { label: '13', key: '13' }, { label: '?', key: '?' }, { label: 'Pass', key: 'Pass' }],
      selectedPoint: ''
    };
  }

  logInUser = () => {
    const username = this.username.value;
    if (username.trim()) {
      const data = {
        username
      };
      this.setState({
        ...data
      }, () => {
        client.send(JSON.stringify({
          ...data,
          type: "userevent"
        }));
      });
    }
  }

  /* When content changes, we send the
current content of the editor to the server. */
 onEditorStateChange = (text) => {
   client.send(JSON.stringify({
     type: "contentchange",
     username: this.state.username,
     content: text
   }));
 };

 componentWillMount() {
   client.onopen = () => {
     console.log('WebSocket Client Connected');
   };
   client.onmessage = (message) => {
     const dataFromServer = JSON.parse(message.data);
     const stateToChange = {};
     if (dataFromServer.type === "userevent") {
       stateToChange.currentUsers = Object.values(dataFromServer.data.users);
     } else if (dataFromServer.type === "contentchange") {
       stateToChange.text = dataFromServer.data.editorContent || contentDefaultMessage;
     }
     stateToChange.userActivity = dataFromServer.data.userActivity;
     this.setState({
       ...stateToChange
     });
   };
 }

  showLoginSection = () => (
    <div className="account">
      <div className="account__wrapper">
        <div className="account__card">
          <div className="account__profile">
            <Identicon className="account__avatar" size={64} string="randomness" />
            <p className="account__name">Hello, user!</p>
            <p className="account__sub">Enter the code to join the dashboard</p>
          </div>
          <input name="username" ref={(input) => { this.username = input; }} className="form-control" />
          <button type="button" onClick={() => this.logInUser()} className="btn btn-primary account__btn">Join</button>
        </div>
        <div className="account__card">
          <p className="account__name">Or</p>
        </div>
        <div className="account__card">
          <p className="account__sub">Create dashboard</p>
          <button type="button" onClick={() => this.logInUser()} className="btn btn-primary account__btn">Create</button>
        </div>
      </div>
    </div>
  )

  cardTemplate(point) {
    return (
      <div style={{ textAlign: 'center', padding: '1em', width: '125px' }}>
        <div>{point.label}</div>
      </div>
    );
  }


    showEditorSection = () => (
      <div className="main-content">
        <div className="storyline" />
        <div className="document-holder">
          <div className="currentusers">
            {this.state.currentUsers.map(user => (
              <div className="currentuser" key={user.username}>
                <div id={user.username} className="userInfo" key={user.username}>
                  <Identicon className="account__avatar" style={{ backgroundColor: user.randomcolor }} size={40} string={user.username} />
                </div>
                <span>{user.username}</span>
              </div>
            ))}
          </div>
          {/* <Editor
          options={{
            placeholder: {
              text: this.state.text ? contentDefaultMessage : ""
            }
          }}
          className="body-editor"
          text={this.state.text}
          onChange={this.onEditorStateChange}
        /> */}
        </div>
        <div className="story-holder">
          {/* <ul>
          {this.state.userActivity.map((activity, index) => <li key={`activity-${index}`}>{activity}</li>)}
        </ul> */}
        </div>
        <div className="footer">
          <SelectButton value={this.state.selectedPoint} options={this.state.points} onChange={e => this.setState({ selectedPoint: e.value })} itemTemplate={this.cardTemplate} optionLabel="label" optionValue="key" />
        </div>
      </div>
    )

    render() {
      const {
        username
      } = this.state;
      return (
        <React.Fragment>
          <Navbar color="light" light>
            <NavbarBrand href="/">Planning Pointer</NavbarBrand>
          </Navbar>
          <div className="container-fluid">
            {/* { this.showEditorSection() */}
            {username ? this.showEditorSection() : this.showLoginSection()}
          </div>
        </React.Fragment>
      );
    }
}

export default App;
