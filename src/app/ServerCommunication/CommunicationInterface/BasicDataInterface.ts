//import { Currency, Language } from 'DataModel';
import { ServerResponse } from '../Response/ServerResponse';

interface Currency {}
interface Language {}

export interface BasicDataInterface {
    // Erstelle eine neue Gruppe mit dem Name name und der Währung currency.
    groupCreate(name: string, currency: Currency): Promise<ServerResponse>;

    // Füge den Kontakt mit Id contactId zu der Gruppe mit Id groupId hinzu.
    groupAddMember(groupId: string, contactId: string): Promise<ServerResponse>;

    // Verlasse die Gruppe mit der Id groupId.
    leaveGroup(groupId: string): Promise<ServerResponse>;

    // Erstelle eine Transaktion mit den angegebenen Daten.
    createTransaction(groupId: string, description: string, payerId: string, recipientIds: string[], amounts: number[]):
      Promise<ServerResponse>;

    // Setze die Daten des Payments mit der Id transactionId in der Gruppe mit Id groupId auf die angegebenen Daten.
    modifyTransaction(groupId: string, transactionId: string, description: string, payerId: string,
                      recipientIds: string[], amounts: number[]) : Promise<ServerResponse>;

    // Ändere die Standardwährung des Benutzers zu currency.
    userChangeDefaultCurrency(currency: Currency): Promise<ServerResponse>;

    // Ändere die Benutzersprache zu language.
    userChangeLanguage(language: Language): Promise<ServerResponse>;

    // Bestätige die vorgeschlagene Rückzahlung.
    confirmPayback(amount: number, payerId: string, recipientId: string) : Promise<ServerResponse>;

    // Lade die nächstälteren Transaktionen und Aktivitäten der Gruppe mit groupId, die seit dem letzten Login noch nicht abgefragt wurden und gib sie an den entsprechenden Observable.
    fetchHistory(groupId: string): Promise<ServerResponse>;
}
