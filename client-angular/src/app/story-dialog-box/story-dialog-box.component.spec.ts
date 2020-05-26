import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StoryDialogBoxComponent } from './story-dialog-box.component';

describe('StoryDialogBoxComponent', () => {
  let component: StoryDialogBoxComponent;
  let fixture: ComponentFixture<StoryDialogBoxComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StoryDialogBoxComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StoryDialogBoxComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
