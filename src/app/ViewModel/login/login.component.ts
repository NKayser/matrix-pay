import { Component, Output, EventEmitter} from '@angular/core';
import {FormControl, Validators} from '@angular/forms';
import {MatrixClientService} from '../../ServerCommunication/CommunicationInterface/matrix-client.service';
import {ClientInterface} from "../../ServerCommunication/CommunicationInterface/ClientInterface";
import {ServerResponse} from "../../ServerCommunication/Response/ServerResponse";
import {ClientError} from "../../ServerCommunication/Response/ErrorTypes";

// @ts-ignore
import {MatrixClient} from "matrix-js-sdk";
import {GroupService} from "../../ServerCommunication/GroupCommunication/group.service";


@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  private clientService: ClientInterface;

  // emitter to tell the App Component to display the Menu when logged in
  @Output() loggedIn = new EventEmitter<boolean>();

  // Manages if the password is shown in the view
  hide = true;

  // gets the input values of the user and checks if they obey all requirements
  matrixUrlControl = new FormControl('', [Validators.required, Validators.pattern('.*')]);
  passwordControl = new FormControl('', [Validators.required]);

  constructor(clientService: MatrixClientService, private groupService: GroupService) {
    this.clientService = clientService;
  }


  // login the user with the current values if matrixUrl and password
  async login() {

      // check all formControls to make sure all values are correct
      this.matrixUrlControl.markAllAsTouched();
      this.passwordControl.markAllAsTouched();

      // check if any values are incorrect, if no pass them to the service
      if (!this.matrixUrlControl.invalid && !this.passwordControl.invalid){
        // Make here the call to register the user in the clientInterface with this.matrixUrlControl.value and
        // this.passwordControl.value
        const loginResponse: ServerResponse = await this.clientService.login(this.matrixUrlControl.value,
          this.passwordControl.value);

        if (loginResponse.wasSuccessful()) {
          console.log('logIn successful !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
        } else {
          console.log('logIn failed :/    :( because ' + ClientError[loginResponse.getError()]);
        }

        //const client: MatrixClient = await this.clientService.getPreparedClient();
        //console.log(client.getRooms());

        //await client.setRoomAccountData('!vEoxoAdSnmcjVQQczC:dsn.tm.kit.edu', 'balances', {'@uelkt:dsn.tm.kit.edu': 0});

        const groupResponse: ServerResponse = await this.groupService.leaveGroup('!vEoxoAdSnmcjVQQczC:dsn.tm.kit.edu').catch();

        if (groupResponse.wasSuccessful()) {
          console.log('groupCreation successful !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!');
        } else {
          console.log('groupCreation failed :/    :( because ' + groupResponse.getError());
        }

        //console.log(this.matrixUrlControl.value + ' ' + this.passwordControl.value);

        // Tell AppComponent, that user is logged in
        this.loggedIn.emit(true);
      }
  }

  // get the error message for the password form
  getPasswordErrorMessage(): string{
    return 'Please enter a password';
  }

  // get the error message for the matrixUrl form
  getMatrixUrlErrorMessage(): string{
    if (this.matrixUrlControl.hasError('required')){
      return 'Please enter a matrixUrl';
    } else {
      return 'Please enter a valid matrixUrl';
    }
  }

}
