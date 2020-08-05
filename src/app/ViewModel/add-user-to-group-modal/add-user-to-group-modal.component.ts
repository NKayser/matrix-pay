import {Component, Inject, OnInit} from '@angular/core';
import {FormControl, Validators} from '@angular/forms';
import {MAT_DIALOG_DATA, MatDialogRef} from '@angular/material/dialog';

export interface AddUserToGroupDialogData {
  group: string;
  user: string;
}

@Component({
  selector: 'app-add-user-to-group-modal',
  templateUrl: './add-user-to-group-modal.component.html',
  styleUrls: ['./add-user-to-group-modal.component.css']
})
export class AddUserToGroupModalComponent implements OnInit {

  // Save the FormControl which checks the GroupName TODO Add regex
  formControlUser = new FormControl('', [Validators.required]);

  constructor(
    public dialogRef: MatDialogRef<AddUserToGroupModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: AddUserToGroupDialogData) {
  }

  ngOnInit(): void {
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  // Save the dialog and return the data, if the form is valid
  onSave(): void {
    if (!this.formControlUser.invalid){
      this.dialogRef.close({user: this.formControlUser.value, group: this.data.group});
    }
  }

  getInvalidUserErrorMessage(): string{
    return 'Not a valid user name';
  }

}
