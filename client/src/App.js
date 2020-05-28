import React, {Component} from 'react';
import Identicon from 'react-identicons';
import {SelectButton} from 'primereact/selectbutton';
import {Message} from 'primereact/message';
import {DataTable} from 'primereact/datatable';
import {FileUpload} from 'primereact/fileupload';
import {RadioButton} from 'primereact/radiobutton';
import {Growl} from 'primereact/growl';
import {Dialog} from 'primereact/dialog';
import {InputNumber} from 'primereact/inputnumber';
import {ProgressSpinner} from 'primereact/progressspinner';

import io from 'socket.io-client'

import 'primereact/resources/themes/nova-light/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';

import 'medium-editor/dist/css/medium-editor.css';
import 'medium-editor/dist/css/themes/default.css';
import './App.css';
import {Column} from "primereact/column";
import {Button} from "primereact/button";
import {InputText} from "primereact/inputtext";

// const socketUri = 'wss://';
const socketUri = 'ws://localhost:5000';
// let uri = '/file';
let uri = 'http://localhost:5000/file';
// const socket = io(uri);
const socket = io.connect(socketUri, {transports: ['websocket'], path: '/backend'});
let uploadUrl = uri + "/upload";

class App extends Component {
    constructor(props) {
        // super()
        super(props);
        this.export = this.export.bind(this);
        this.addNew = this.addNew.bind(this);
        this.save = this.save.bind(this);
        this.onUpload = this.onUpload.bind(this);
        this.onUploadError = this.onUploadError.bind(this);
        this.onBeforeUpload = this.onBeforeUpload.bind(this);
        this.selectPreviousStory = this.selectPreviousStory.bind(this);
        this.selectNextStory = this.selectNextStory.bind(this);
        this.handleRoomId = this.handleRoomId.bind(this);
        this.handleUsername = this.handleUsername.bind(this);
        this.isStoryPointed = this.isStoryPointed.bind(this);
        this.flipPoints = this.flipPoints.bind(this);
        this.calculateAvgPoint = this.calculateAvgPoint.bind(this);
        this.storyFinalPoints = this.storyFinalPoints.bind(this);
        this.isAdmin = this.isAdmin.bind(this);
        this.logInUser = this.logInUser.bind(this);
        this.exitRoom = this.exitRoom.bind(this);

        this.state = {
            loggedIn: false,
            currentUsers: [],
            stories: [],
            /*currentUsers: [
                {
                    username: 'Aniket',
                    self: true,
                    point: '',
                    pointsGiven: false
                },
                {
                    username: 'Mihir',
                    self: true,
                    point: '2',
                    pointsGiven: true
                }],
            */userActivity: [],
            username: '',
            text: '',
            points: [{label: '0', key: '0'}, {label: '1', key: '1'}, {label: '2', key: '2'}, {
                label: '3',
                key: '3'
            }, {label: '5', key: '5'}, {label: '8', key: '8'}, {label: '13', key: '13'}, {
                label: '?',
                key: '?'
            }, {label: 'Pass', key: 'Pass'}],
            selectedPoint: '',
            uploaded: false,
            progressSpinner: false,
            selectedStory: {},
            finalPoints: null
        };
        /*for (var i = 0; i < 8; i++) {
            this.state.currentUsers.push({
                username: 'Aniket' + i,
                self: true,
                point: '5',
                pointsGiven: true
            });
        }*/
    }

    componentDidMount() {
        this.setSocketListeners()
        /*let storiesData = this.storyService.getStories();
        this.setState({stories: storiesData})
        if (storiesData.length > 1) {
            this.setState({selectedStory: storiesData[0]});
        }*/
    }

    logInUser = () => {
        if (this.state.selectedOption === 'manual') {
            socket.emit('createManually', {username: this.state.username});
        } else {
            socket.emit('login', {username: this.state.username, roomId: this.state.roomId});
        }
        this.setState({loggedIn: true});
    }


    setSocketListeners() {
        socket.on('message', (data) => {
            console.log(data.message)
        });

        socket.on('greet', (data) => {
            this.growl.show({severity: 'info', summary: data, detail: ''});
        })

        socket.on('pointingData', (data) => {
            console.log(data);
            let pointingData = JSON.parse(data);
            this.setState({
                stories: Object.values(pointingData['_stories']),
                currentUsers: Object.values(pointingData['_users']),
                selectedStory: pointingData['_selected_story'],
                roomId: pointingData['_roomId']
            });
        })

        socket.on('selectStoryResp', (data) => {
            this.setState({
                selectedStory: data,
                progressSpinner: false,
                selectedPoint: ''
            });
        })

        socket.on('publishUsers', (data) => {
            console.log("publishUsers", data);
            this.setState({currentUsers: Object.values(JSON.parse(data))});
        })

        socket.on('publishStories', (data) => {
            console.log("publishStories", data);
            this.setState({stories: Object.values(JSON.parse(data))});
        })

    }

    componentWillMount() {
        /*client.onconnect = () => {
            console.log('WebSocket Client Connected');
        };
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
        };*/
    }

    onUpload(event) {
        this.growl.show({severity: 'info', summary: 'Success', detail: 'File Uploaded'});
        this.setState({uploaded: true})
        this.setState({roomId: event.xhr.response})
    }

    getCookieVal(cookiename) {
        // Get name followed by anything except a semicolon
        var cookiestring = RegExp(cookiename + "=[^;]+").exec(document.cookie);
        // Return everything after the equal sign, or an empty string if the cookie name not found
        return decodeURIComponent(!!cookiestring ? cookiestring.toString().replace(/^[^=]+./, "") : "");
    }

    onBeforeUpload(event, url) {
        event.xhr.open("POST", uploadUrl);
        event.xhr.setRequestHeader("username", this.state.username);
        event.xhr.setRequestHeader("X-XSRF-TOKEN", this.getCookieVal("XSRF-TOKEN"));
        console.log(event);
    }

    onUploadError(event) {
        this.growl.show({severity: 'error', summary: 'Error Message', detail: 'Upload failed'});
    }

    handleUsername(event) {
        this.setState({username: event.target.value})
    }

    handleRoomId(event) {
        this.setState({roomId: event.target.value})
    }

    showLoginSection = () => (
        <div className="account">
            <div className="account__wrapper">
                <div className="account__card">
                    <div className="account__profile">
                        <Identicon className="account__avatar" size={64} string="randomness"/>
                        <p className="account__name">Hello </p><input placeholder="Enter Your Name" name="username"
                                                                      value={this.state.username}
                                                                      onChange={this.handleUsername}
                                                                      className="form-control"/>
                    </div>
                </div>
                <div className="account__card">
                    <div className="account__profile">
                        <label><b>Enter the code to join the dashboard</b></label>
                    </div>
                    <input name="code"
                           onChange={this.handleRoomId}
                           className="form-control"/>
                    <button type="button" onClick={() => this.logInUser()}
                            disabled={!(this.isUsernameEntered() && this.isRoomIdEntered())}
                            className="btn btn-primary account__btn">Join
                    </button>
                </div>
                <p style={{textAlign: 'center', background: 'white', marginTop: '10px'}}>OR</p>
                <div className="account__card">
                    <div className="account__profile">
                        <label><b>Create dashboard</b></label>
                    </div>
                    <RadioButton value="upload" name="create"
                                 onChange={(e) => this.setState({selectedOption: e.value})}
                                 checked={this.state.selectedOption === 'upload'}/><label
                    className="p-radiobutton-label">Upload File</label>
                    <br/>
                    <RadioButton value="manual" name="create"
                                 onChange={(e) => this.setState({selectedOption: e.value})}
                                 checked={this.state.selectedOption === 'manual'}/><label
                    className="p-radiobutton-label">Enter Stories
                    Manually</label>
                    <br/>
                    {this.isUsernameEntered() && this.state.selectedOption === 'upload' ?
                        <FileUpload name="upload" url={uploadUrl} onBeforeSend={this.onBeforeUpload}
                                    onUpload={this.onUpload} onError={this.onUploadError}/> : ''}
                    <br/>
                    <button
                        type="button" onClick={() => this.logInUser()}
                        disabled={!(this.isUsernameEntered() && (this.state.uploaded || this.state.selectedOption === 'manual'))}
                        className="btn btn-primary account__btn">Create
                    </button>
                </div>
            </div>
        </div>
    )

    isUsernameEntered() {
        return (this.state.username !== null && this.state.username.length !== 0);
    }

    isRoomIdEntered() {
        return (this.state.roomId !== null && this.state.roomId !== undefined && this.state.roomId.length !== 0);
    }

    cardTemplate(point) {
        return (
            <div className="pointCard">
                {point.label}
            </div>
        );
    }

    showStoryLine(selectedStory) {
        if (this.state.progressSpinner) {
            return (<ProgressSpinner style={{width: '50px', height: '50px'}} strokeWidth="8" fill="#EEEEEE"
                                     animationDuration=".5s"/>)
        }
        if (selectedStory) {
            return selectedStory["Key"] + " : " + selectedStory.Summary
        }
    }

    selectPreviousStory() {
        if (this.state.selectedStory) {
            let index = this.state.stories.findIndex(x => x["Key"] === this.state.selectedStory["Key"]);
            if (index > 0) {
                this.selectStory(this.state.stories[index - 1]);
            }
        }
    }

    selectNextStory() {
        if (this.state.selectedStory) {
            let index = this.state.stories.findIndex(x => x["Key"] === this.state.selectedStory["Key"]);
            if (index < this.state.stories.length - 1) {
                this.selectStory(this.state.stories[index + 1]);
            }
        }
    }

    flipPoints() {
        socket.emit('flip', {
            roomId: this.state.roomId,
            username: this.state.username
        })
    }

    storyFinalPoints() {
        socket.emit('enterFinalPoints', {
            roomId: this.state.roomId,
            username: this.state.username,
            points: this.state.finalPoints,
            "Key": this.state.selectedStory["Key"]
        });
        this.setState({
            finalPoints: null
        });
    }

    exitRoom() {
        socket.emit('exitRoom', {
            roomId: this.state.roomId,
            username: this.state.username
        });
        this.setState({
            loggedIn: false
        });
    }

    isAdmin() {
        let users = this.state.currentUsers.filter(user => user._name === this.state.username);
        if (users.length !== 0) {
            return users[0]._isAdmin;
        }
        return false;
    }

    showStoryControls = () => (
        <React.Fragment>
            <Button label="Previous Story" icon="pi pi-step-backward-alt" iconPos="left"
                    onClick={this.selectPreviousStory}/>
            <Button label="Next Story" icon="pi pi-step-forward-alt" iconPos="right"
                    onClick={this.selectNextStory}/>
            <Button label="Flip" icon="pi pi-refresh" className="p-button-warning" iconPos="right"
                    onClick={this.flipPoints}/>
            <InputNumber size={5} value={this.state.finalPoints}
                         onChange={(e) => this.setState({finalPoints: e.value})}/>
            <Button label="Enter Final Points" className="p-button-success" onClick={this.storyFinalPoints}/>
            <Button label="Exit" icon="pi pi-sign-out" className="p-button-danger" onClick={this.exitRoom}/>
        </React.Fragment>
    )

    showAvgPoint = () => (
        <div style={{textAlign: 'center', height: '100%'}}>
            <h5>Avg Point</h5>
            <h3>{this.calculateAvgPoint()}</h3>
        </div>
    )

    calculateAvgPoint() {
        if (!this.state.selectedStory || !this.state.selectedStory["Key"])
            return 0;
        let sum = 0;
        let count = 0;
        this.state.currentUsers.forEach(user => {
            if (user._points[this.state.selectedStory["Key"]] != null) {
                let parsed = parseInt(user._points[this.state.selectedStory["Key"]]._point, 10);
                if (parsed) {
                    sum += parsed;
                    count++;
                }
            }
        })
        return count !== 0 ? (sum / count).toFixed(1) : 0;
    }

    isEmpty(o) {
        if (o === undefined || o === null)
            return true;
        return Object.keys(o).length === 0
    }

    isStoryPointed(user) {
        if (this.state.selectedStory) {
            if (!this.isEmpty(user._points) && user._points[this.state.selectedStory['Key']]) {
                return user._points[this.state.selectedStory['Key']]._isPointed;
            }
        }
        return false
    }

    displayPoints(user) {
        if (this.state.selectedStory) {
            return user._points[this.state.selectedStory["Key"]]._point;
        }
    }

    showEditorSection = () => (
        <div className="main-content">
            <span className="storyControls">
                            &nbsp;<span
                style={{'backgroundColor': 'burlywood'}}> Access code: {this.state.roomId}</span>
                {this.isAdmin() ? this.showStoryControls(this.state.selectedStory) : ''}</span>
            <div className="storyline">{this.showStoryLine(this.state.selectedStory)}</div>
            <div className="avgPoint">{this.showAvgPoint()}</div>
            <div className="document-holder">
                <div className="currentusers">
                    {this.state.currentUsers.map(user => (
                        <div className="currentuser" key={user._name}>
                            <div style={{display: 'inline-flex'}}>
                                <div id={user.username} className="userInfo" key={user._name}>
                                    <Identicon className="account__avatar"
                                               style={{backgroundColor: user.randomcolor}}
                                               size={40} string={user._name}/>
                                </div>
                                <div>{this.isStoryPointed(user) ?
                                    <Message severity="success"
                                             text={this.displayPoints(user)}></Message> : ''}</div>
                            </div>
                            <div
                                className={(user._name === this.state.username ? 'highlight' : '')}>{user._name}</div>
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
                {this.showStoryTableSection()}
            </div>
            <div className="footer">
                <SelectButton value={this.state.selectedPoint}
                              options={this.state.points}
                              onChange={e => this.selectPoint(e.value)}
                              itemTemplate={this.cardTemplate}
                              optionLabel="label" optionValue="key"/></div>
        </div>
    )

    selectPoint(value) {
        this.setState({selectedPoint: value})
        socket.emit('selectPoint', {
            roomId: this.state.roomId,
            username: this.state.username,
            'Key': this.state.selectedStory['Key'],
            point: value
        })
    }

    export
    () {
        this.dt.exportCSV();
    }

    addNew() {
        this.setState({
            story: {"Key": '', Summary: '', StoryPoints: ''},
            displayDialog: true
        });
    }

    updateProperty(property, value) {
        let story = this.state.story;
        story[property] = value;
        this.setState({story: story});
    }

    save() {
        if (!this.isAdmin()) {
            return
        }
        socket.emit('addStory', {
            roomId: this.state.roomId,
            username: this.state.username,
            story: this.state.story
        });
        this.setState({
            story: {},
            displayDialog: false
        });
    }

    selectStory(value) {
        if (!this.isAdmin()) {
            return
        }
        this.setState({
            progressSpinner: true
        });
        socket.emit('selectStory', {
            roomId: this.state.roomId,
            username: this.state.username,
            'Key': value['Key']
        })
    }

    showStoryTableSection() {
        let header = <div style={{textAlign: 'left'}}><Button type="button" icon="pi pi-external-link"
                                                              iconPos="left"
                                                              label="CSV" onClick={this.export}/></div>;
        let footer = <div className="p-clearfix" style={{width: '100%'}}>
            <Button style={{float: 'left'}} label="Add" icon="pi pi-plus" onClick={this.addNew}/>
        </div>;
        let dialogFooter = <div className="ui-dialog-buttonpane p-clearfix">
            <Button label="Save" icon="pi pi-check" onClick={this.save}/>
        </div>;
        return (
            <div>
                <DataTable value={this.state.stories} selectionMode="single" selection={this.state.selectedStory}
                           onSelectionChange={e => this.selectStory(e.value)}
                           header={this.isAdmin() ? header : ''} footer={this.isAdmin() ? footer : ''}
                           ref={(el) => {
                               this.dt = el;
                           }} resizableColumns={true}>
                    <Column field="Key" header="Key" style={{width: '10%'}}/>
                    <Column field="Summary" header="Summary" style={{width: '70%'}}/>
                    <Column field="Story Points" header="Story Points" style={{width: '20%'}}/>
                </DataTable>

                <Dialog visible={this.state.displayDialog} width="300px" header="Story Details" modal={true}
                        footer={dialogFooter} onHide={() => this.setState({displayDialog: false})}>
                    {
                        this.state.story &&

                        <div className="p-grid p-fluid">
                            <div className="p-col-4" style={{padding: '.75em'}}><label htmlFor="Key">Issue
                                Key</label></div>
                            <div className="p-col-8" style={{padding: '.5em'}}>
                                <InputText id="Key" onChange={(e) => {
                                    this.updateProperty('Key', e.target.value)
                                }} value={this.state.story["Key"]}/>
                            </div>

                            <div className="p-col-4" style={{padding: '.75em'}}><label
                                htmlFor="Summary">Summary</label>
                            </div>
                            <div className="p-col-8" style={{padding: '.5em'}}>
                                <InputText id="Summary" onChange={(e) => {
                                    this.updateProperty('Summary', e.target.value)
                                }} value={this.state.story.Summary}/>
                            </div>

                            <div className="p-col-4" style={{padding: '.75em'}}><label htmlFor="StoryPoints">Story
                                Points</label>
                            </div>
                            <div className="p-col-8" style={{padding: '.5em'}}>
                                <InputText id="StoryPoints" onChange={(e) => {
                                    this.updateProperty('StoryPoints', e.target.value)
                                }} value={this.state.story.StoryPoints}/>
                            </div>
                        </div>
                    }
                </Dialog>
            </div>
        );


    }


    render() {
        return (
            <React.Fragment>
                <Growl ref={(el) => this.growl = el}/>
                <div className="container-fluid">
                    {this.state.loggedIn ? this.showEditorSection() : this.showLoginSection()}
                </div>
            </React.Fragment>
        );
    }
}

export default App;
