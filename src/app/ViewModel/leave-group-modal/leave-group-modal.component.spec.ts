import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { LeaveGroupModalComponent } from './leave-group-modal.component';

describe('LeaveGroupModalComponent', () => {
  let component: LeaveGroupModalComponent;
  let fixture: ComponentFixture<LeaveGroupModalComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ LeaveGroupModalComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(LeaveGroupModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});