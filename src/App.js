import React, {Component} from 'react';
// import { w3cwebsocket as W3CWebSocket } from "websocket";
import Identicon from 'react-identicons';
import {SelectButton} from 'primereact/selectbutton';
import {Message} from 'primereact/message';
import {DataTable} from 'primereact/datatable';
import {Card} from 'primereact/card';
import {FileUpload} from 'primereact/fileupload';
import {RadioButton} from 'primereact/radiobutton';
import {Growl} from 'primereact/growl';
import {Dialog} from 'primereact/dialog';

import 'primereact/resources/themes/nova-light/theme.css';
import 'primereact/resources/primereact.min.css';
import 'primeicons/primeicons.css';

import {
    Navbar,
    NavbarBrand,
    UncontrolledTooltip
} from 'reactstrap';
import Editor from 'react-medium-editor';
import 'medium-editor/dist/css/medium-editor.css';
import 'medium-editor/dist/css/themes/default.css';
import './App.css';
import {StoryService} from "./StoryService";
import {Column} from "primereact/column";
import {Button} from "primereact/button";
import {InputText} from "primereact/inputtext";

const client = new WebSocket('ws://127.0.0.1:8080/backend');
const contentDefaultMessage = "Start writing your document here";

class App extends Component {
    constructor(props) {
        // super()
        super(props);
        this.storyService = new StoryService();
        this.export = this.export.bind(this);
        this.addNew = this.addNew.bind(this);
        this.save = this.save.bind(this);

        this.state = {
            currentUsers: [
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
            userActivity: [],
            username: null,
            text: '',
            points: [{label: '0', key: '0'}, {label: '1', key: '1'}, {label: '2', key: '2'}, {
                label: '3',
                key: '3'
            }, {label: '5', key: '5'}, {label: '8', key: '8'}, {label: '13', key: '13'}, {
                label: '?',
                key: '?'
            }, {label: 'Pass', key: 'Pass'}],
            selectedPoint: ''
        };
        for (var i = 0; i < 8; i++) {
            this.state.currentUsers.push({
                username: 'Aniket' + i,
                self: true,
                point: '5',
                pointsGiven: true
            });
        }
    }

    componentDidMount() {
        let storiesData = this.storyService.getStories();
        this.setState({stories: storiesData})
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

    onUpload(event) {
        this.growl.show({severity: 'info', summary: 'Success', detail: 'File Uploaded'});
    }

    showLoginSection = () => (
        <div className="account">
            <div className="account__wrapper">
                <div className="account__card">
                    <div className="account__profile">
                        <Identicon className="account__avatar" size={64} string="randomness"/>
                        <p className="account__name">Hello, user!</p>
                        <p className="account__sub">Enter the code to join the dashboard</p>
                    </div>
                    <input name="username" ref={(input) => {
                        this.username = input;
                    }} className="form-control"/>
                    <button type="button" onClick={() => this.logInUser()}
                            className="btn btn-primary account__btn">Join
                    </button>
                </div>
                <br/>
                <p style={{textAlign: 'center', background: 'white'}}>OR</p>
                <div className="account__card">
                    <p className="account__sub">Create dashboard</p>
                    <RadioButton value="upload" name="create" onChange={(e) => this.setState({selectedOption: e.value})}
                                 checked={this.state.selectedOption === 'upload'}/><label
                    className="p-radiobutton-label">Upload File</label>
                    <br/>
                    <RadioButton value="manual" name="create" onChange={(e) => this.setState({selectedOption: e.value})}
                                 checked={this.state.selectedOption === 'manual'}/><label
                    className="p-radiobutton-label">Enter Stories
                    Manually</label>
                    <br/>
                    {this.state.selectedOption === 'upload' ?
                        <FileUpload name="upload" url="./upload" onUpload={this.onUpload}></FileUpload> : ''}
                    <button type="button" onClick={() => this.logInUser()}
                            className="btn btn-primary account__btn">Create
                    </button>
                </div>
            </div>
        </div>
    )

    cardTemplate(point) {
        return (
            <div className="pointCard">
                {point.label}
            </div>
        );
    }

    showStoryLine(selectedStory) {
        if (selectedStory) {
            return "Issue : " + selectedStory.Summary

        }
    }

    showAvgPoint = () => (
        <Card title="Avg Point" style={{textAlign: 'center', height: '100%'}}>
            <h1 style={{textAlign: 'center'}}>
                {this.calculateAvgPoint()}
            </h1>
        </Card>
    )

    calculateAvgPoint() {
        let sum = 0;
        this.state.currentUsers.forEach(user => {
            let parsed = parseInt(user.point, 10);
            sum += parsed ? parsed : 0;
        })
        let length = this.state.currentUsers.length;
        if (length > 0)
            return sum / length
        else
            return '-'
    }


    showEditorSection = () => (
        <div className="main-content">
            <div className="storyline">{this.showStoryLine(this.state.selectedStory)}</div>
            <div className="avgPoint">{this.showAvgPoint()}</div>
            <div className="document-holder">
                <div className="currentusers">
                    {this.state.currentUsers.map(user => (
                        <div className="currentuser" key={user.username}>
                            <div style={{display: 'inline-flex'}}>
                                <div id={user.username} className="userInfo" key={user.username}>
                                    <Identicon className="account__avatar" style={{backgroundColor: user.randomcolor}}
                                               size={40} string={user.username}/>
                                </div>
                                <div>{user.pointsGiven ?
                                    <Message severity="success"
                                             text={user.point}></Message> : ''}</div>
                            </div>
                            <div>{user.username}</div>
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
                <SelectButton value={this.state.selectedPoint} options={this.state.points}
                              onChange={e => this.setState({selectedPoint: e.value})} itemTemplate={this.cardTemplate}
                              optionLabel="label" optionValue="key"/>
            </div>
        </div>
    )

    export() {
        this.dt.exportCSV();
    }

    addNew() {
        this.setState({
            story: {IssueKey: '', Summary: '', StoryPoints: ''},
            displayDialog: true
        });
    }

    updateProperty(property, value) {
        let story = this.state.story;
        story[property] = value;
        this.setState({story: story});
    }

    save() {
        let stories = [...this.state.stories];
        stories.push(this.state.story);
        this.setState({stories: stories, selectedStory: null, story: null, displayDialog: false});
    }

    showStoryTableSection() {
        let header = <div style={{textAlign: 'left'}}><Button type="button" icon="pi pi-external-link" iconPos="left"
                                                              label="CSV" onClick={this.export}></Button></div>;
        let footer = <div className="p-clearfix" style={{width: '100%'}}>
            <Button style={{float: 'left'}} label="Add" icon="pi pi-plus" onClick={this.addNew}/>
        </div>;
        let dialogFooter = <div className="ui-dialog-buttonpane p-clearfix">
            <Button label="Save" icon="pi pi-check" onClick={this.save}/>
        </div>;
        return (
            <div>
                <DataTable value={this.state.stories} selectionMode="single" selection={this.state.selectedStory}
                           onSelectionChange={e => this.setState({selectedStory: e.value})}
                           header={header} footer={footer}
                           ref={(el) => {
                               this.dt = el;
                           }} resizableColumns={true}>
                    <Column field="IssueKey" header="Issue Key" style={{width: '10%'}}/>
                    <Column field="Summary" header="Summary" style={{width: '70%'}}/>
                    <Column field="StoryPoints" header="Story Points" style={{width: '20%'}}/>
                </DataTable>

                <Dialog visible={this.state.displayDialog} width="300px" header="Story Details" modal={true}
                        footer={dialogFooter} onHide={() => this.setState({displayDialog: false})}>
                    {
                        this.state.story &&

                        <div className="p-grid p-fluid">
                            <div className="p-col-4" style={{padding: '.75em'}}><label htmlFor="IssueKey">Issue
                                Key</label></div>
                            <div className="p-col-8" style={{padding: '.5em'}}>
                                <InputText id="IssueKey" onChange={(e) => {
                                    this.updateProperty('IssueKey', e.target.value)
                                }} value={this.state.story.IssueKey}/>
                            </div>

                            <div className="p-col-4" style={{padding: '.75em'}}><label htmlFor="Summary">Summary</label>
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
