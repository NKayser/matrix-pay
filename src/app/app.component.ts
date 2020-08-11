import { Component } from '@angular/core';
import {Router} from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'Angular-MatrixMicroPayments-App';
  loggedIn = false;

  constructor(private router: Router) {
  }

  /**
   * Manage that correct site is shown when user gets logged out
   */
  public logout(): void{
    this.loggedIn = false;
    this.router.navigate(['/login']);
  }

  /**
   * Manage that correct site is shown when user gets logged in
   */
  public login(): void{
    this.loggedIn = true;
    this.router.navigate(['/home']);
  }
}
