import {Component, Input} from '@angular/core';
import {PaymentDialogData, PaymentModalComponent} from '../payment-modal/payment-modal.component';
import {MatDialog} from '@angular/material/dialog';
import {Transaction} from '../../DataModel/Group/Transaction';

@Component({
  selector: 'app-group-transaction',
  templateUrl: './group-transaction.component.html',
  styleUrls: ['./group-transaction.component.css']
})
export class GroupTransactionComponent {

  // Input is used to pass the current selected group to the transaction component
  @Input() group: string;

  // the data that is used to create a transaction
  data: PaymentDialogData;
  transactions: Transaction[] = new Array<Transaction>(0);

  constructor(public dialog: MatDialog) {
  }

  editExpense(index: number): void{
  }

  // open a dialog window, when it gets closed check if you got data and save it accordingly
  createExpense(): void {
    const dialogRef = this.dialog.open(PaymentModalComponent, {
      width: '350px',
      data: {modalTitle: 'Create Transaction', recipientsId: ['Alice', 'Bob', 'Eve'], amount: [6, 10, 5], isAdded: [true, true, true]}
    });

    dialogRef.afterClosed().subscribe(result => {
      this.data = result;
      if (this.data !== undefined){
        // TODO Send Data to matrix here
        console.log(this.data.description);
      }

    });
  }

  fetchHistory(): void{

  }

}
