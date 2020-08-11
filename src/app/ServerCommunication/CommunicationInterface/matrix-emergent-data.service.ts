import { Injectable } from '@angular/core';
import {EmergentDataInterface} from './EmergentDataInterface';
import {ServerResponse} from '../Response/ServerResponse';
// @ts-ignore
import {MatrixClient} from 'matrix-js-sdk';
import {SuccessfulResponse} from '../Response/SuccessfulResponse';

@Injectable({
  providedIn: 'root'
})
export class MatrixEmergentDataService implements EmergentDataInterface {
  private client: MatrixClient;

  private static BALANCES_EVENT_TYPE: string = 'balances';
  private static RECOMMENDATIONS_EVENT_TYPE: string = 'recommendations';

  constructor() {  }

  /**
   *
   * @param groupId
   * @param balances
   * @param contactsIds
   * @param lastTransactionId
   */
  public async setBalances(groupId: string, balances: number[], contactsIds: string[], lastTransactionId: string): Promise<ServerResponse> {
    await this.client;

    const content: object = {
      'balances': balances,
      'contacts': contactsIds,
      'last_transaction': lastTransactionId
    }

    await this.client.setRoomAccountData(groupId, MatrixEmergentDataService.BALANCES_EVENT_TYPE, content);
    return new SuccessfulResponse(); // any errors are unexpected and will be uncaught
  }

  /**
   *
   * @param groupId
   * @param amounts
   * @param payerIds
   * @param recipientIds
   * @param lastTransactionId
   */
  public async setRecommendations(groupId: string, amounts: number[], payerIds: string[], recipientIds: string[],
                                  lastTransactionId: string): Promise<ServerResponse> {
    // TODO: known error: when setting Recommendations and then creating Transaction, this error occurs:
    // Error: This room is configured to use encryption, but your client does not support encryption.
    await this.client;

    const content: object = {
      'recipients': recipientIds,
      'payers': payerIds,
      'amounts': amounts,
      'last_transaction': lastTransactionId
    }

    await this.client.setRoomAccountData(groupId, MatrixEmergentDataService.RECOMMENDATIONS_EVENT_TYPE, content);
    return new SuccessfulResponse(); // any errors are unexpected and will be uncaught
  }

  public setClient(client: MatrixClient): void {
    this.client = client;
  }
}
