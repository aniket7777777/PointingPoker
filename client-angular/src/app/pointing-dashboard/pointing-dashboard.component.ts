import {Component, OnInit} from '@angular/core';
import {SocketService} from '../socket.service';
import {SelectionModel} from '@angular/cdk/collections';
import {MatTableDataSource} from '@angular/material/table';
import {Router} from '@angular/router';
import {StoryDialogBoxComponent} from '../story-dialog-box/story-dialog-box.component';
import {MatDialog} from '@angular/material/dialog';

export interface Story {
  Key: string;
  Summary: string;
  'Story Points': string;
}

@Component({
  selector: 'app-pointing-dashboard',
  templateUrl: './pointing-dashboard.component.html',
  styleUrls: ['./pointing-dashboard.component.css']
})
export class PointingDashboardComponent implements OnInit {
  private readonly username: string;
  roomId: string;
  stories: Story[];
  currentUsers: any[];
  selectedStory: any;
  private progressSpinner: boolean;
  points = ['0', '1/2', '1', '2', '3', '5', '8', '13', '20', '40', '100', '?', 'Pass'];
  selectedPoint: string;
  displayedStoryColumns: string[] = ['Key', 'Summary', 'Story Points'];
  storyDataSource = new MatTableDataSource<Story>(this.stories);
  selection = new SelectionModel<Story>(false, []);
  showStoryTable: boolean;
  finalPoints: string;
  private story: any;
  private displayDialog: boolean;

  constructor(private socketService: SocketService,
              private router: Router,
              public dialog: MatDialog) {
    this.username = socketService.getUsername();
    this.roomId = socketService.getRoomId();
    this.story = {};
    // this.stories = JSON.parse('[{"Key":"23","Story Points":"16","Summary":""},{"Key":"","Story Points":"","Summary":""},{"Key":"MSAPP-10436","Story Points":"5","Summary":"Build Breaks for all services if not meeting SonarQube code coverage of 75% - part2"},{"Key":"MSAPP-11081","Story Points":"","Summary":"[Infrastructure] Move Service Maven to Gradle Built- Data Registry"},{"Key":"MSAPP-11082","Story Points":"","Summary":"[Infrastructure] Move Service Maven to Gradle Built- Internal Gateway Service"},{"Key":"MSAPP-11083","Story Points":"","Summary":"[Infrastructure] Move Service Maven to Gradle Built- Data Ingest Service"},{"Key":"MSAPP-11084","Story Points":"","Summary":"[Infrastructure] Move Service Maven to Gradle Built- Semantic Modelling Service"},{"Key":"MSAPP-11085","Story Points":"","Summary":"[Infrastructure] Move utils Maven to Gradle Built- Service Secret Manager"},{"Key":"MSAPP-11121","Story Points":"8","Summary":"Performance Improvement for processResponse "},{"Key":"MSAPP-11428","Story Points":"","Summary":"[Infrastructure] Change V3 API code to retrieve mapping"},{"Key":"MSAPP-11453","Story Points":"","Summary":"[Technical] Write the regular expressions for SQL ingestions"},{"Key":"MSAPP-11828","Story Points":"3","Summary":"Validation missing in create ontology"},{"Key":"MSAPP-12101","Story Points":"","Summary":"Add metadata tags for query"},{"Key":"MSAPP-12102","Story Points":"","Summary":"Add Semantic metadata tags for every semantic models"},{"Key":"MSAPP-12103","Story Points":"","Summary":"Search schemas based on metadata tags associated with registry IDs"},{"Key":"MSAPP-12200","Story Points":"","Summary":"Security Relevant Finding: Non-compliant Runbook https://confluence.mindsphere-tools.siemens.cloud/pages/viewpage.action?pageId=99090632"},{"Key":"MSAPP-12201","Story Points":"","Summary":"Security Relevant Finding: Non-compliant Runbook https://confluence.mindsphere-tools.siemens.cloud/pages/viewpage.action?pageId=99090668"},{"Key":"MSAPP-12203","Story Points":"","Summary":"Security Relevant Finding: Non-compliant Runbook https://confluence.mindsphere-tools.siemens.cloud/pages/viewpage.action?pageId=99090592"},{"Key":"MSAPP-12371","Story Points":"","Summary":"Understand AWS Infrastructure for aligning Azure infra to AWS"},{"Key":"MSAPP-12372","Story Points":"","Summary":"KT sessions"},{"Key":"MSAPP-12373","Story Points":"","Summary":"[SPIKE] Understand scaffolding of various Azure environments"},{"Key":"MSAPP-12374","Story Points":"","Summary":"[Placeholder] Customer bug analysis"},{"Key":"MSAPP-12406","Story Points":"","Summary":"[SPIKE] Create Local Stack for Azure"},{"Key":"MSAPP-12432","Story Points":"","Summary":"[NFR] Test query service & query executor at Peak Load"},{"Key":"MSAPP-12447","Story Points":"","Summary":"Deployment 4.1.0 ProdA "}]');
  }

  ngOnInit(): void {
    this.initIoConnection();
  }

  private initIoConnection(): void {

    this.socketService.onEvent('message')
      .subscribe((data) => {
        console.log(data.message);
      });

    this.socketService.onEvent('pointingData')
      .subscribe((data) => {
        console.log(data);
        const pointingData = JSON.parse(data);
        this.stories = Object.values(pointingData._stories);
        this.currentUsers = Object.values(pointingData._users);
        this.selectedStory = pointingData._selected_story;
        this.roomId = pointingData._roomId;
      });

    this.socketService.onEvent('selectStoryResp')
      .subscribe((data) => {
        this.selectedStory = data;
        this.progressSpinner = false;
      });

    this.socketService.onEvent('publishUsers')
      .subscribe((data) => {
        console.log('publishUsers', data);
        this.currentUsers = Object.values(JSON.parse(data));
      });

    this.socketService.onEvent('publishStories')
      .subscribe((data) => {
        console.log('publishStories', data);
        this.stories = Object.values(JSON.parse(data));
      });
  }

  getCardPosition(index: number, decrement: number) {
    const position = 3 * index - decrement;
    return position + 'em';
  }

  selectPoint(value) {
    this.selectedPoint = value;
    this.socketService.send('selectPoint', {
      roomId: this.roomId,
      username: this.username,
      Key: this.selectedStory.Key,
      point: value
    });
  }

  isAdmin() {
    const users = this.currentUsers.filter(user => user._name === this.username);
    if (users.length !== 0) {
      return users[0]._isAdmin;
    }
    return false;
  }

  selectStory(value: any) {
    if (!this.isAdmin()) {
      return;
    }
    this.progressSpinner = true;

    this.socketService.send('selectStory', {
      roomId: this.roomId,
      username: this.username,
      Key: value.Key
    });
  }

  getSelectedStoryIndex() {
    if (this.stories == null) {
      return 0;
    }
    return this.stories.findIndex(story => story.Key === this.selectedStory.Key) + 1;
  }

  calculateAvgPoint() {
    if (!this.selectedStory || !this.selectedStory.Key || this.currentUsers == null) {
      return 0;
    }
    let sum = 0;
    let count = 0;
    this.currentUsers.forEach(user => {
      if (user._points[this.selectedStory.Key] != null) {
        const parsed = parseInt(user._points[this.selectedStory.Key]._point, 10);
        if (parsed) {
          sum += parsed;
          count++;
        }
      }
    });
    return count !== 0 ? (sum / count).toFixed(1) : 0;
  }

  selectPreviousStory() {
    if (this.selectedStory) {
      const index = this.stories.findIndex(x => x.Key === this.selectedStory.Key);
      if (index > 0) {
        this.selectStory(this.stories[index - 1]);
      }
    }
  }

  selectNextStory() {
    if (this.selectedStory) {
      const index = this.stories.findIndex(x => x.Key === this.selectedStory.Key);
      if (index < this.stories.length - 1) {
        this.selectStory(this.stories[index + 1]);
      }
    }
  }

  storyFinalPoints() {
    this.socketService.send('enterFinalPoints', {
      roomId: this.roomId,
      username: this.username,
      points: this.finalPoints,
      Key: this.selectedStory.Key
    });
    this.finalPoints = null;
  }

  displayPoints(user) {
    if (this.selectedStory != null) {
      return user._points[this.selectedStory.Key]._point;
    } else {
      return '';
    }
  }

  isEmpty(o) {
    if (o === undefined || o === null) {
      return true;
    }
    return Object.keys(o).length === 0;
  }

  isStoryPointed(user) {
    if (this.selectedStory != null) {
      if (!this.isEmpty(user._points) && user._points[this.selectedStory.Key]) {
        return user._points[this.selectedStory.Key]._isPointed;
      }
    }
    return false;
  }

  save() {
    if (!this.isAdmin()) {
      return;
    }
    this.socketService.send('addStory', {
      roomId: this.roomId,
      username: this.username,
      story: this.story
    });
    this.story = {};
    this.displayDialog = false;
  }

  flipPoints() {
    this.socketService.send('flip', {
      roomId: this.roomId,
      username: this.username
    });
  }

  exitRoom() {
    this.socketService.send('exitRoom', {
      roomId: this.roomId,
      username: this.username
    });

    this.router.navigate(['/login']);
  }

  openDialog(action, obj) {
    obj.action = action;
    const dialogRef = this.dialog.open(StoryDialogBoxComponent, {
      width: '250px',
      data: obj
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result.event === 'Add') {
        this.addRowData(result.data);
      }
    });
  }

  addRowData(obj) {
    this.story.Key = obj.Key;
    this.story.Summary = obj.Summary;
    this.story['Story Points'] = '';
    this.save();
  }
}
