import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PointingCardComponent } from './pointing-card.component';

describe('PointingCardComponent', () => {
  let component: PointingCardComponent;
  let fixture: ComponentFixture<PointingCardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PointingCardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PointingCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
