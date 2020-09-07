import {Component, Input, OnChanges} from '@angular/core';
import {PaymentDialogData, PaymentModalComponent} from '../payment-modal/payment-modal.component';
import {MatDialog} from '@angular/material/dialog';
import {Transaction} from '../../DataModel/Group/Transaction';
import {Group} from '../../DataModel/Group/Group';
import {TransactionType} from '../../DataModel/Group/TransactionType';
import {Contact} from '../../DataModel/Group/Contact';
import {promiseTimeout, TIMEOUT} from '../promiseTimeout';
import {currencyMap} from '../../DataModel/Utils/Currency';
import {DialogProviderService} from '../dialog-provider.service';
import {MatrixBasicDataService} from '../../ServerCommunication/CommunicationInterface/matrix-basic-data.service';

// @ts-ignore
import {MatrixEvent} from 'matrix-js-sdk';
import {PaymentViewComponent} from '../payment-view/payment-view.component';
import {Time, times} from '../../SystemTests/Time';

@Component({
  selector: 'app-group-transaction',
  templateUrl: './group-transaction.component.html',
  styleUrls: ['./group-transaction.component.css']
})
export class GroupTransactionComponent implements OnChanges {

  // Input is used to pass the current selected group to the transaction component
  @Input() group: Group;

  // the data that is used to create a transaction
  private data: PaymentDialogData;
  public transactions: Transaction[] = [];

  // Save if operation is loading
  public loadingCreateExpense = false;
  public loadingEditExpense = false;

  public currencyMap = currencyMap;

  constructor(public dialog: MatDialog, private matrixBasicDataService: MatrixBasicDataService,
              private dialogProviderService: DialogProviderService) {
  }

  /**
   * Update the transaction reference every time something in the view changes, to make sure that a switch of the selected
   * group switches the transactions
   */
  ngOnChanges(): void {
    this.transactions = this.group.transactions;
  }

  /**
   * Creates an expense by opening a dialog where the user can input all necessary details
   * and send the data to matrix via the transactionService
   */
  public createExpense(): void {

    const dialogRef = this.dialog.open(PaymentModalComponent, {
      width: '350px',
      data: this.generateCreateExpenseData(),
    });

    dialogRef.afterClosed().subscribe((result) => {
      this.data = result;
      if (this.data !== undefined){

        const recipientIds = [];
        const sendAmounts = [];
        for (let i = 0; i < this.data.recipients.length; i++){
          if (this.data.isAdded[i] === true){
            recipientIds.push(this.data.recipients[i].contactId);
            sendAmounts.push(this.data.amount[i]);
          }

        }


        this.loadingCreateExpense = true;
        // Timestamp
        times.push(new Time(Date.now(), this.group.groupId + this.data.description));
        // Timestamp
        promiseTimeout(TIMEOUT, this.matrixBasicDataService.createTransaction(this.group.groupId, this.data.description,
          this.data.payer.contactId, recipientIds, sendAmounts, false))
          .then((data) => {
            if (!data.wasSuccessful()){
              this.dialogProviderService.openErrorModal('error create transaction 1: ' + data.getMessage(), this.dialog);
            }
            this.loadingCreateExpense = false;
          }, (err) => {
            this.dialogProviderService.openErrorModal('error create Transaction 2: ' + err, this.dialog);
            this.loadingCreateExpense = false;
          });
      }

    });
  }

  /**
   * Edit an expense by opening a dialog where the user can change the data of the selected transaction and send
   * the edited data via the transactionService to Matrix
   * @param expense the transaction that is edited
   */
  public editExpense(expense: Transaction): void{

    if (expense.transactionType === TransactionType.EXPENSE){
      this.dialog.open(PaymentViewComponent, {
        width: '350px',
        data: this.generateEditExpenseData(expense),
      });

      // This code is (unfinished work) that can set edit transactions to matrix
      /*dialogRef.afterClosed().subscribe(result => {
        this.data = result;
        if (this.data !== undefined){

          const recipientIds = [];
          const sendAmounts = [];
          for (let i = 0; i < this.data.recipients.length; i++){
            if (this.data.isAdded[i] === true){
              recipientIds.push(this.data.recipients[i].contactId);
              sendAmounts.push(this.data.amount[i]);
            }

          }

          this.loadingEditExpense = true;
          promiseTimeout(TIMEOUT, this.matrixBasicDataService.modifyTransaction(this.group.groupId, expense.transactionId,
            this.data.description, this.data.payer.contactId, recipientIds, sendAmounts))
            .then((data) => {
              if (!data.wasSuccessful()){
                this.dialogProviderService.openErrorModal('error edit transaction 1: ' + data.getMessage(), this.dialog);
              }
              this.loadingEditExpense = false;
            }, (err) => {
              this.dialogProviderService.openErrorModal('error edit Transaction 2: ' + err, this.dialog);
              this.loadingEditExpense = false;
            });

        }

      });*/
    }
  }

  // Generate input data for expense Modal from the current transaction
  private generateEditExpenseData(transaction: Transaction): PaymentDialogData {

    const modalTitle = transaction.name;
    const recipients = Array<Contact>(0);
    const description = transaction.name;
    const payer = transaction.payer.contact;
    const amount = Array<number>(0);
    const isAdded = Array<boolean>(0);
    for (const recipient of this.group.groupmembers){
      recipients.push(recipient.contact);
      const recipientAmount = this.getRecipientAmountFromTransaction(recipient.contact.contactId, transaction);
      amount.push(recipientAmount);
      isAdded.push(recipientAmount !== 0);
    }
    const currency = this.group.currency;

    return {modalTitle, description, payer, recipients, amount, isAdded, currency};
  }

  // Generate input data for expense Modal for a create transaction modal
  private generateCreateExpenseData(): PaymentDialogData {

    const modalTitle = 'Create Transaction';
    const recipients = Array<Contact>(0);
    const description = '';
    let payer = this.group.groupmembers[0].contact;
    for (const currentPayer of this.group.groupmembers){
      if (currentPayer.active){
        payer = currentPayer.contact;
        break;
      }
    }
    const amount = Array<number>(0);
    const isAdded = Array<boolean>(0);
    for (const recipient of this.group.groupmembers){
      if (recipient.active){
        recipients.push(recipient.contact);
        amount.push(0);
        isAdded.push(true);
      }
    }
    const currency = this.group.currency;

    return {modalTitle, description, payer, recipients, amount, isAdded, currency};
  }

  // get the amounts of a recipient, if the recipient is not in the transaction return 0
  private getRecipientAmountFromTransaction(recipientId: string, transaction: Transaction): number {

    for (const recipient of transaction.recipients){
      if (recipient.contact.contactId === recipientId){
        return recipient.amount;
      }
    }

    return 0;
  }

  /*fetchHistory(): void{

  }*/

}
