import {Currency} from '../Utils/Currency';
import {Groupmember} from './Groupmember';
import {Transaction} from './Transaction';
import {Recommendation} from './Recommendation';
import {Activity} from './Activity';
import {AtomarChange} from './AtomarChange';
import {Subject} from 'rxjs';

/**
 * Group which the user is part of. A group is something holding groupmembers, transactions, recommendations and activities.
 * It is a cntral object of the application and enables keeping track of shared expenses between people.
 */
export class Group {
  private readonly _groupId: string;
  private _name: string;
  private _currency: Currency;
  private _groupmembers: Groupmember[];
  private _transactions: Transaction[];
  private _recommendations: Recommendation[];
  private _activities: Activity[];

  private transactionChangeEmitter: Subject<void> = new Subject<void>();
  private activityChangeEmitter: Subject<void> = new Subject<void>();
  private memberChangeEmitter: Subject<void> = new Subject<void>();

  public getTransactionChangeEmitter(): Subject<void> {
    return this.transactionChangeEmitter;
  }

  public getActivityChangeEmitter(): Subject<void> {
    return this.activityChangeEmitter;
  }

  public getMemberChangeEmitter(): Subject<void> {
    return this.memberChangeEmitter;
  }

  /**
   * Constructor for Group. In addition to setting the values given by the arguments, groupmembers, transactions, recommendations and
   * activities are initialized as empty arrays.
   * @param groupId  ID of the group.
   * @param name  Name of the group.
   * @param currency  Currency for all transactions in the group.
   */
  public constructor(groupId: string, name: string, currency: Currency) {
    this._groupId = groupId;
    this._name = name;
    this._currency = currency;
    this._groupmembers = [];
    this._transactions = [];
    this._recommendations = [];
    this._activities = [];
  }

  /**
   * Returns the group ID.
   */
  public get groupId(): string {
    return this._groupId;
  }

  /**
   * Returns the name of the group.
   */
  public get name(): string {
    return this._name;
  }

  /**
   * Sets the name of the group.
   * @param value  The new name.
   */
  public set name(value: string) {
    this._name = value;
    // It may be necessary to call a Change Emitter here in case the ViewModel is not updated fast enough
  }

  /**
   * Returns the currency of the group.
   */
  public get currency(): Currency {
    return this._currency;
  }

  /**
   * Sets the currency
   * @param value  The new currency.
   */
  public set currency(value: Currency) {
    this._currency = value;
  }

  /**
   * Returns an array with all the group's groupmembers.
   */
  public get groupmembers(): Groupmember[] {
    return this._groupmembers;
  }

  /**
   * Returns an array with all the group's transactions.
   */
  public get transactions(): Transaction[] {
    return this._transactions;
  }

  /**
   * Returns an array with all the group's recommendations.
   */
  public get recommendations(): Recommendation[] {
    return this._recommendations;
  }

  /**
   * Returns an array with all the group's activities.
   */
  public get activities(): Activity[] {
    return this._activities;
  }

  /**
   * Adds a new groupmember to the group.
   * @param groupmember  The groupmember that should be added.
   */
  public addGroupmember(groupmember: Groupmember): void { // TODO: OPTIONAL: sort array or insert in right position to ensure post-condition
    this._groupmembers.push(groupmember);
    this.memberChangeEmitter.next();
  }

  /**
   * removes a groupmember from the group.
   * @param contactId  Contact Id of the groupmember that should be removed.
   */
  public removeGroupmember(contactId: string): void { // TODO: ensure somewhere that only groupmembers whith zero balance can be removed
    this._groupmembers.forEach( (item, index) => {
      if (item.contact.contactId === contactId) { this._groupmembers.splice(index, 1); }
    });
    this.memberChangeEmitter.next();
  }

  /**
   * Adds a transaction to the group.
   * @param transaction  Transaction that should be added to the group.
   */
  public addTransaction(transaction: Transaction): void { // TODO: OPTIONAL: sort array or insert in right position to ensure post-condition
    this._transactions.push(transaction);
    this.transactionChangeEmitter.next();
  }

  /**
   * Edits a transaction by setting its values to the values specified in the arguments.
   * @param transactionId  ID of the transaction that should be edited. The ID cannot be edited, it serves to identify the transaction.
   * @param name  New name for the transaction.
   * @param payer  New payer for the transaction.
   * @param recipients  New recipients for the transaction.
   */
  public editTransaction(transactionId: string, name: string, payer: AtomarChange, recipients: AtomarChange[]): void {
    const transaction = this.getTransaction(transactionId);
    if (transaction != null) {
      transaction.name = name;
      transaction.payer = payer;
      transaction.recipients = recipients;
    }
    this.transactionChangeEmitter.next();
  }

  /**
   * Returns a specific transaction speified by transaction ID. Returns null of no transaction of that ID is in the group.
   * @param transactionId  ID of the transaction that should be returned.
   */
  public getTransaction(transactionId: string): Transaction {
    for (const transaction of this._transactions) {
      if (transaction.transactionId === transactionId) {
        return transaction;
      }
    }
    return null;
  }

  public getGroupmember(contactId: string): Groupmember {
    for (const groupmember of this._groupmembers) {
      if (groupmember.contact.contactId === contactId) {
        return groupmember;
      }
    }
    return null;
  }

  /**
   * Sets the array with current Recommendations for the group. Since recommendations only make sense as a whole, single recommendations
   * cannot be added.
   * @param recommendations  New recommendations for the group.
   */
  public setRecommendations(recommendations: Recommendation[]): void {
    this._recommendations = recommendations;
  }

  /**
   * Deletes a Recommendation from the recommendation array. This should only be done when a transaction of the type PAYBACK is added.
   * @param payerId  ID of the payer that was part of the recommendation.
   * @param recipiantId  ID of the recipiant that was part of the recommendation.
   */
  public deleteRecommendation(payerId: string, recipiantId: string): void { /* TODO: implement it. DONE. Untested.
  TODO: OPTIONAL: change argument to Id instead of object. DONE*/
    this._recommendations.forEach( (item, index) => {
      if (item.payer.contact.contactId === payerId && item.recipient.contact.contactId === recipiantId) {
        this._recommendations.splice(index, 1); }
    });
  }

  /**
   * Adds an Activity to the group.
   * @param activity  Activity that should be added.
   */
  public addActivity(activity: Activity): void { // TODO: OPTIONAL: sort array or insert in right position to ensure post-condition
    this._activities.push(activity);
    this._activities = this._activities.sort(this.compare);
    console.log(this._activities[0].creationDate);
    this.activityChangeEmitter.next();
  }

  private compare(a: Activity, b: Activity): number {
    // Use toUpperCase() to ignore character casing
    const dateA = a.creationDate;
    const dateB = b.creationDate;

    let comparison = 0;
    if (dateA > dateB) {
      comparison = 1;
    } else if (dateA < dateB) {
      comparison = -1;
    }
    return comparison;
  }
}
