import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PointingDashboardComponent } from './pointing-dashboard.component';

describe('PointingDashboardComponent', () => {
  let component: PointingDashboardComponent;
  let fixture: ComponentFixture<PointingDashboardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PointingDashboardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PointingDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
