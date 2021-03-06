import {ChangeDetectorRef, Component, NgZone, OnInit} from '@angular/core';
import {Recommendation} from '../../DataModel/Group/Recommendation';
import {DataModelService} from '../../DataModel/data-model.service';
import {Currency, currencyMap} from '../../DataModel/Utils/Currency';
import {Contact} from '../../DataModel/Group/Contact';
import {ConfirmPaybackDialogData, ConfirmPaybackModalComponent} from '../confirm-payback-modal/confirm-payback-modal.component';
import {MatDialog} from '@angular/material/dialog';
import {MatrixBasicDataService} from '../../ServerCommunication/CommunicationInterface/matrix-basic-data.service';
import {promiseTimeout, TIMEOUT} from '../promiseTimeout';
import {DialogProviderService} from '../dialog-provider.service';
import {gridListResize} from '../gridListResizer';

interface BalanceTuple {
  balance: number;
  currency: Currency;
}

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {

  public usedCurrencies: Set<Currency> = new Set();
  public recommendations: Recommendation[] = [];
  public currencyMap = currencyMap;

  public balanceList: BalanceTuple[] = [];

  public loadingConfirmPayback = false;

  public userContact: Contact;
  private dialogData: ConfirmPaybackDialogData;

  public breakpoint: number;

  constructor(private dataModelService: DataModelService, public dialog: MatDialog,
              private matrixBasicDataService: MatrixBasicDataService,
              private dialogProviderService: DialogProviderService,
              private ref: ChangeDetectorRef, private zone: NgZone) {}

  /**
   * Get reference to the recommendations and user
   */
  ngOnInit(): void {

    this.userContact = this.dataModelService.getUser().contact;
    this.initBalancesRecommendations();
    this.dataModelService.getBalanceEmitter().subscribe(() => {this.initBalancesRecommendations(); } );

    // initialize the number of the grid list columns for the recommendations
    this.breakpoint = gridListResize(window.innerWidth, 2200, 4);
  }

  private initBalancesRecommendations(): void{
    const groups = this.dataModelService.getGroups();
    this.recommendations = [];
    for (const group of groups){
      // Filter all recommendations concerning the user
      for (const rec of group.recommendations) {
        if (rec.payer.contact.contactId === this.userContact.contactId || rec.recipient.contact.contactId === this.userContact.contactId) {
          this.recommendations.push(rec);
        }
      }

      this.usedCurrencies.add(group.currency);
    }

    this.balanceList = [];
    for (const currency of this.usedCurrencies){
      const balance = this.getTotalBalance(currency);
      this.balanceList = this.balanceList.concat({balance, currency});
    }
    this.ref.detectChanges();
  }

  /**
   * Calculate the number of columns for the grid list, when the screen size changes;
   * @param event when the screen changes size
   */
  onResize(event): void {
    // TODO Magic numbers in the function
    this.breakpoint = gridListResize(event.target.innerWidth, 2200, 4);
  }

  /**
   * Calculate the total balance for the user for the selected Currency
   * @param currency the currency for which the balances should be calculated
   */
  public getTotalBalance(currency: Currency): number{
    const groups = this.dataModelService.getGroups();
    let balance = 0;
    for (const group of groups){
      if (group.currency === currency){
        for (const member of group.groupmembers){
          if (member.contact.contactId === this.userContact.contactId){

            balance += member.balance;
            break;
          }
        }
      }
    }

    return balance;
  }

  /**
   * Confirm the payback
   * @param recommendationIndex the Index of the recommendation that should be confirmed
   */
  confirmPayback(recommendationIndex: number): void {

    this.zone.run(() => {

      const currentRec = this.recommendations[recommendationIndex];

      const dialogRef = this.dialog.open(ConfirmPaybackModalComponent, {
        width: '350px',
        data: {recommendation: currentRec}
      });

      dialogRef.afterClosed().subscribe(result => {
        this.dialogData = result;
        if (this.dialogData !== undefined) {

          this.loadingConfirmPayback = true;
          promiseTimeout(TIMEOUT, this.matrixBasicDataService.createTransaction(this.dialogData.recommendation.group.groupId,
              'Payback from ' + this.dialogData.recommendation.payer.contact.name + ' to ' +
              this.dialogData.recommendation.recipient.contact.name,
              this.dialogData.recommendation.payer.contact.contactId, [this.dialogData.recommendation.recipient.contact.contactId],
              [this.dialogData.recommendation.recipient.amount], true))
              .then((data) => {
                if (!data.wasSuccessful()) {
                  this.dialogProviderService.openErrorModal('error confirm payback 1: ' + data.getMessage(), this.dialog);
                }
                this.loadingConfirmPayback = false;
              }, (err) => {
                this.dialogProviderService.openErrorModal('error confirm payback 2: ' + err, this.dialog);
                this.loadingConfirmPayback = false;
              });
        }
      });

    });
  }

}
