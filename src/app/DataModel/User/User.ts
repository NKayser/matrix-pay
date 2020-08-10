import {Contact} from '../Group/Contact';
import {Currency} from '../Utils/Currency';
import {Language} from '../Utils/Language';
import {Group} from '../Group/Group';
import {Groupmember} from '../Group/Groupmember';

/**
 * User of the application. The user is the person using this application right now.
 * It is linked with the user's contact and saves all the user's groups.
 */
export class User {
  private static _singleUser: User;
  private readonly _contact: Contact;
  private _currency: Currency;
  private _language: Language;
  private _groups: Group[];

  /**
   * Constructor for user. In addition to setting the values given by the arguments, groups is initialized as an empty array and the user
   * itself is made singleton object of the Class User.
   * @param contact  Contact of the person using the application.
   * @param currency  Preferred currency of the user.
   * @param language  Language of the user.
   */
  constructor(contact: Contact, currency: Currency, language: Language) {
    this._contact = contact;
    this._currency = currency;
    this._language = language;
    this._groups = [];
    User._singleUser = this;
  }

  /**
   * Returns the singleton user object.
   */
  static get singleUser(): User {
    return this._singleUser;
  }

  /**
   * Returns the user's contact.
   */
  get contact(): Contact {
    return this._contact;
  }

  /**
   * Returns the user's currency.
   */
  get currency(): Currency {
    return this._currency;
  }

  /**
   * Sets the user's currency.
   * @param value  New currency.
   */
  set currency(value: Currency) {
    this._currency = value;
  }

  /**
   * Returns the user's language.
   */
  get language(): Language {
    return this._language;
  }

  /**
   * Sets the user's language.
   * @param value  New language.
   */
  set language(value: Language) {
    this._language = value;
  }

  /**
   * Returns an array holding the user's groups.
   */
  get groups(): Group[] {
    return this._groups;
  }

  /**
   * Returns a specific group specified by group ID of the user.
   * @param groupId  ID of the group that should be returned.
   */
  public getGroup(groupId: string): Group { // TODO: implement it. DONE
    for (const group of this.groups) {
      if (group.groupId === groupId) {return group; }
    }
    return null;
  }

  /**
   * Creates a new group for the user. Adds the group to the user's groups. Adds the user to the group's groupmembers.
   * @param groupId  ID of the new group.
   * @param name  Name of the new group.
   * @param currency  Currency of the new group.
   */
  public createGroup(groupId: string, name: string, currency: Currency): Group {
    const group: Group = new Group(groupId, name, currency);
    this._groups.push(group);
    group.addGroupmember(new Groupmember(this._contact, group));
    return group;
  }
}
