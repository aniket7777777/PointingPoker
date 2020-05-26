import {Component, Inject, OnInit, Optional} from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';

export interface Story {
  Key: string;
  Summary: string;
  'Story Points': string;
}

@Component({
  selector: 'app-story-dialog-box',
  templateUrl: './story-dialog-box.component.html',
  styleUrls: ['./story-dialog-box.component.css']
})
export class StoryDialogBoxComponent implements OnInit {
  action: string;
  localData: any;

  constructor(public dialogRef: MatDialogRef<StoryDialogBoxComponent>,
              @Optional() @Inject(MAT_DIALOG_DATA) public data: Story) {
    this.localData = {...data};
    this.action = this.localData.action;
  }

  ngOnInit(): void {
  }

  doAction() {
    this.dialogRef.close({event: this.action, data: this.localData});
  }

  closeDialog() {
    this.dialogRef.close({event: 'Cancel'});
  }
}
