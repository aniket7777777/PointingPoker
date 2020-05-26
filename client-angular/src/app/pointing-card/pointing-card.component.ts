import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-pointing-card',
  templateUrl: './pointing-card.component.html',
  styleUrls: ['./pointing-card.component.css']
})
export class PointingCardComponent implements OnInit {
  @Input() isPublic: boolean;
  @Input() point: string;
  @Input() name: string;

  constructor() {
  }

  ngOnInit(): void {
  }

  getColorClass() {
    let colorClass = '';
    if (this.point === '?') {
      colorClass = 'orange-card';
    } else if (parseInt(this.point, 10) > 8) {
      colorClass = 'green-card';
    } else if (this.point === 'Pass') {
      colorClass = 'gray-card';
    } else {
      colorClass = 'blue-card';
    }
    return colorClass;
  }
}
