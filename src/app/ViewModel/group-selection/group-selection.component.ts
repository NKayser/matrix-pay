import {Component, OnInit} from '@angular/core';
import {BreakpointObserver, Breakpoints} from '@angular/cdk/layout';
import {Observable} from 'rxjs';
import {map, shareReplay} from 'rxjs/operators';
import {CreateGroupModalComponent, GroupCreateDialogData} from '../create-group-modal/create-group-modal.component';
import {MatDialog} from '@angular/material/dialog';
import {LeaveGroupDialogData, LeaveGroupModalComponent} from '../leave-group-modal/leave-group-modal.component';
import {AddMemberToGroupDialogData, AddMemberToGroupModalComponent} from '../add-user-to-group-modal/add-member-to-group-modal.component';
import {DataModelService} from '../../DataModel/data-model.service';
import {Currency} from '../../DataModel/Utils/Currency';
import {Group} from '../../DataModel/Group/Group';
import {Transaction} from '../../DataModel/Group/Transaction';
import {TransactionType} from '../../DataModel/Group/TransactionType';
import {Contact} from '../../DataModel/Group/Contact';
import {Groupmember} from '../../DataModel/Group/Groupmember';
import {AtomarChange} from '../../DataModel/Group/AtomarChange';
import {Recommendation} from '../../DataModel/Group/Recommendation';
import {Activity} from '../../DataModel/Group/Activity';
import {ActivityType} from '../../DataModel/Group/ActivityType';
import {GroupService} from '../../ServerCommunication/GroupCommunication/group.service';
import {promiseTimeout, TIMEOUT} from '../promiseTimeout';
import {DialogProviderService} from '../dialog-provider.service';
import {MatrixBasicDataService} from '../../ServerCommunication/CommunicationInterface/matrix-basic-data.service';

@Component({
  selector: 'app-group-selection',
  templateUrl: './group-selection.component.html',
  styleUrls: ['./group-selection.component.css']
})
export class GroupSelectionComponent implements OnInit{

  // saves the currently selected group
  public currentGroup: Group = new Group('', '', null);
  // save returned data form dialogs
  private createGroupData: GroupCreateDialogData;
  private leaveGroupData: LeaveGroupDialogData;
  private addUserToGroupData: AddMemberToGroupDialogData;

  public loadingLeaveGroup = false;
  public loadingAddMember = false;
  public loadingAddGroup = false;

  // this is an array of group names, which gets displayed by the view
  // this should get read from the dataService
  public groups = [];

  isHandset$: Observable<boolean> = this.breakpointObserver.observe(Breakpoints.Handset)
    .pipe(
      map(result => result.matches),
      shareReplay()
    );

  constructor(private breakpointObserver: BreakpointObserver, public dialog: MatDialog, private dataModelService: DataModelService,
              private matrixBasicDataService: MatrixBasicDataService, private dialogProviderService: DialogProviderService) {}

  // set default selected group
  ngOnInit(): void{


    // TODO Remove test code
    /*const c1 = this.dataModelService.initializeUserFirstTime('c1', 'Alice').contact;
    this.dataModelService.getUser().createGroup('1', 'gruppe1', Currency.EUR);
    this.dataModelService.getUser().createGroup('2', 'gruppe2', Currency.USD);
    const c2 = new Contact('c2', 'Bob');
    const c3 = new Contact('c3', 'Eve');
    const testGroup = this.dataModelService.getGroup('1');
    const m2 = new Groupmember(c2, testGroup);
    const m3 = new Groupmember(c3, testGroup);
    const m1 = testGroup.groupmembers[0];
    m1.balance = 5;
    console.log(m1.balance + ' ' + m1.contact.contactId);
    testGroup.addGroupmember(m2);
    testGroup.addGroupmember(m3);
    testGroup.addTransaction(new Transaction(TransactionType.EXPENSE, 't1', 't1', new Date(2020, 10, 5), testGroup,
      new AtomarChange(c1, 10), [new AtomarChange(c2, 10)], m1));
    testGroup.addTransaction(new Transaction(TransactionType.EXPENSE, 't2', 'another onesodgaoebhpoejgeojgeorj',
      new Date(2020, 10, 13), testGroup,
      new AtomarChange(c3, 15), [new AtomarChange(c2, 15)], m1));
    const r1 = new Recommendation(testGroup, new AtomarChange(c1, 10), new AtomarChange(c2, -10));
    const r2 = new Recommendation(testGroup, new AtomarChange(c3, 15), new AtomarChange(c1, -15));
    const r3 = new Recommendation(testGroup, new AtomarChange(c1, 10), new AtomarChange(c2, -10));
    const r4 = new Recommendation(testGroup, new AtomarChange(c3, 15), new AtomarChange(c1, -15));
    const r5 = new Recommendation(testGroup, new AtomarChange(c1, 10), new AtomarChange(c2, -10));
    const r6 = new Recommendation(testGroup, new AtomarChange(c3, 15), new AtomarChange(c1, -15));
    const r7 = new Recommendation(testGroup, new AtomarChange(c1, 10), new AtomarChange(c2, -10));
    const r8 = new Recommendation(testGroup, new AtomarChange(c3, 15), new AtomarChange(c1, -15));
    const r9 = new Recommendation(testGroup, new AtomarChange(c1, 10), new AtomarChange(c2, -10));
    const r10 = new Recommendation(testGroup, new AtomarChange(c3, 15), new AtomarChange(c1, -15));
    testGroup.setRecommendations([r1, r2, r2, r3, r4, r5, r6, r7, r8, r9, r10]);
    const a1 = new Activity(ActivityType.CONTACTLEFTGROUP, testGroup, c1, new Date());
    const a2 = new Activity(ActivityType.GROUPCREATION, testGroup, c1, new Date());
    const a3 = new Activity(ActivityType.NEWCONTACTINGROUP, testGroup, c1, new Date());
    const a4 = new Activity(ActivityType.NEWPAYBACK, testGroup, c1, new Date());
    testGroup.addActivity(a1);
    testGroup.addActivity(a2);
    testGroup.addActivity(a3);
    testGroup.addActivity(a4);*/
    // TODO test code ends here

    // get all groups and select the first group as default
    this.groups = this.dataModelService.getGroups();
    if (this.groups.length >= 1){
      this.currentGroup = this.groups[0];
    }
  }

  /**
   * Select a specific group
   * @param index the index of the group to select
   */
  public selectGroup(index: number): void{
    this.currentGroup = this.groups[index];
  }

  /**
   * Leave the group that is defined by this.currentGroup
   */
  public leaveGroup(): void{
    const dialogRef = this.dialog.open(LeaveGroupModalComponent, {
      width: '300px',
      data: {group: this.currentGroup, leave: false}
    });

    dialogRef.afterClosed().subscribe(result => {
      this.leaveGroupData = result;
      if (this.leaveGroupData !== undefined){

        if (this.leaveGroupData.leave === true){
          this.loadingLeaveGroup = true;
          promiseTimeout(TIMEOUT, this.matrixBasicDataService.leaveGroup(this.leaveGroupData.group.groupId)).then((data) => {
            console.log(data);
            if (!data.wasSuccessful()){
              this.dialogProviderService.openErrorModal('error leave group 1: ' + data.getMessage(), this.dialog);
            }
            this.loadingLeaveGroup = false;
          }, (err) => {
            this.dialogProviderService.openErrorModal('error leave group 2: ' + err, this.dialog);
            this.loadingLeaveGroup = false;
          });
        }


      }

    });
  }

  /**
   * Add a group
   */
  public addGroup(): void {
    const dialogRef = this.dialog.open(CreateGroupModalComponent, {
      width: '300px',
      data: {groupName: '', currency: this.dataModelService.getUser().currency}
    });

    dialogRef.afterClosed().subscribe(result => {
      this.createGroupData = result;
      if (this.createGroupData !== undefined){
        console.log(this.createGroupData.groupName);

        this.loadingAddGroup = true;
        promiseTimeout(TIMEOUT, this.matrixBasicDataService.groupCreate(this.createGroupData.groupName,
          this.createGroupData.currency.toString()))
          .then((data) => {
          console.log(data);
          if (!data.wasSuccessful()){
            this.dialogProviderService.openErrorModal('error add group 1: ' + data.getMessage(), this.dialog);
          }
          this.loadingAddGroup = false;
        }, (err) => {
            this.dialogProviderService.openErrorModal('error add group 2: ' + err, this.dialog);
            this.loadingAddGroup = false;
        });
      }

    });
  }

  /**
   * Add a member to the group that is defined by this.currentGroup
   */
  public addMemberToGroup(): void{
    const dialogRef = this.dialog.open(AddMemberToGroupModalComponent, {
      width: '300px',
      data: {group: this.currentGroup, user: ''}
    });

    dialogRef.afterClosed().subscribe(result => {
      this.addUserToGroupData = result;
      if (this.addUserToGroupData !== undefined){
        console.log(this.addUserToGroupData.user);

        this.loadingAddGroup = true;
        promiseTimeout(TIMEOUT, this.matrixBasicDataService.groupAddMember(this.addUserToGroupData.group.groupId,
          this.addUserToGroupData.user))
          .then((data) => {
            console.log(data);
            if (!data.wasSuccessful()){
              this.dialogProviderService.openErrorModal('error add member 1: ' + data.getMessage(), this.dialog);
            }
            this.loadingAddGroup = false;
          }, (err) => {
            this.dialogProviderService.openErrorModal('error add member 2: ' + err, this.dialog);
            this.loadingAddGroup = false;
          });
      }

    });
  }

}
