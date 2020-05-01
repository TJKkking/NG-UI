/*
 Copyright 2020 TATA ELXSI

 Licensed under the Apache License, Version 2.0 (the 'License');
 you may not use this file except in compliance with the License.
 You may obtain a copy of the License at

  http://www.apache.org/licenses/LICENSE-2.0

 Unless required by applicable law or agreed to in writing, software
 distributed under the License is distributed on an "AS IS" BASIS,
 WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 See the License for the specific language governing permissions and
 limitations under the License.

 Author: KUMARAN M (kumaran.m@tataelxsi.co.in), RAJESH S (rajesh.s@tataelxsi.co.in), BARATH KUMAR R (barath.r@tataelxsi.co.in)
*/
/**
 * @file Add Edit Component.
 */
import { HttpHeaders } from '@angular/common/http';
import { Component, Injector, Input, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { NotifierService } from 'angular-notifier';
import { AuthenticationService } from 'AuthenticationService';
import { APIURLHEADER, ERRORDATA, MODALCLOSERESPONSEDATA } from 'CommonModel';
import { environment } from 'environment';
import { RestService } from 'RestService';
import { SharedService } from 'SharedService';
import { isNullOrUndefined } from 'util';

/**
 * Creating component
 * @Component takes AddEditUserComponent.html as template url
 */
@Component({
  templateUrl: './AddEditUserComponent.html',
  styleUrls: ['./AddEditUserComponent.scss']
})
/** Exporting a class @exports AddEditUserComponent */
export class AddEditUserComponent implements OnInit {
  /** To inject services @public */
  public injector: Injector;

  /** Instance for active modal service @public */
  public activeModal: NgbActiveModal;

  /** FormGroup user Edit Account added to the form @ html @public */
  public userForm: FormGroup;

  /** Form submission Add */
  public submitted: boolean = false;

  /** Input contains Modal dialog component Instance @public */
  @Input() public userTitle: string;

  /** Input contains Modal dialog component Instance @public */
  @Input() public userType: string;

  /** Input contains Modal dialog component Instance @public */
  @Input() public userID: string;

  /** Input contains Modal dialog component Instance @public */
  @Input() public userName: string;

  /** Check the loading results for loader status @public */
  public isLoadingResults: boolean = false;

  /** Give the message for the loading @public */
  public message: string = 'PLEASEWAIT';

  /** Holds list of domains @public */
  public domains: {}[] = [];

  /** Instance of the rest service @private */
  private restService: RestService;

  /** FormBuilder instance added to the formBuilder @private */
  private formBuilder: FormBuilder;

  /** Controls the header form @private */
  private headers: HttpHeaders;

  /** Notifier service to popup notification @private */
  private notifierService: NotifierService;

  /** Contains tranlsate instance @private */
  private translateService: TranslateService;

  /** Contains all methods related to shared @private */
  private sharedService: SharedService;

  /** ModalData instance of modal @private  */
  private modalData: MODALCLOSERESPONSEDATA;

  /** Utilizes auth service for any auth operations @private */
  private authService: AuthenticationService;

  constructor(injector: Injector) {
    this.injector = injector;
    this.formBuilder = this.injector.get(FormBuilder);
    this.restService = this.injector.get(RestService);
    this.activeModal = this.injector.get(NgbActiveModal);
    this.notifierService = this.injector.get(NotifierService);
    this.translateService = this.injector.get(TranslateService);
    this.sharedService = this.injector.get(SharedService);
    this.authService = this.injector.get(AuthenticationService);

    /** Initializing Form Action */
    this.userForm = this.formBuilder.group({
      userName: ['', Validators.required],
      password: [null, [Validators.required, Validators.pattern(this.sharedService.REGX_PASSWORD_PATTERN)]],
      password2: [null, Validators.required],
      domain_name: [null]
    });
  }

  /** convenience getter for easy access to form fields */
  get f(): FormGroup['controls'] { return this.userForm.controls; }

  /** Lifecyle Hooks the trigger before component is instantiate @public */
  public ngOnInit(): void {
    this.headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0'
    });
    if (this.userType === 'add') {
      this.getDomainName();
    } else if (this.userType === 'editUserName') {
      this.userForm.patchValue({ userName: this.userName });
    }
  }

  /** On modal submit users acction will called @public */
  public userAction(userType: string): void {
    if (userType === 'editPassword') {
      this.getFormControl('userName').setValidators([]);
      this.getFormControl('userName').updateValueAndValidity();
    } else if (userType === 'editUserName') {
      this.getFormControl('password').setValidators([]);
      this.getFormControl('password').updateValueAndValidity();
      this.getFormControl('password2').setValidators([]);
      this.getFormControl('password2').updateValueAndValidity();
    }
    this.submitted = true;
    this.modalData = {
      message: 'Done'
    };
    this.sharedService.cleanForm(this.userForm);
    if (!this.userForm.invalid) {
      if (this.userForm.value.password !== this.userForm.value.password2) {
        this.notifierService.notify('error', this.translateService.instant('PAGE.USERS.PASSWORDCONFLICT'));
        return;
      }
      if (userType === 'add') {
        this.addUser();
      } else if (userType === 'editUserName' || userType === 'editPassword') {
        this.editUser();
      }
    }
  }

  /** Add user @public */
  public addUser(): void {
    this.isLoadingResults = true;
    const payLoad: {} = JSON.stringify({
      username: (this.userForm.value.userName).toLowerCase(),
      password: (this.userForm.value.password),
      domain_name: !isNullOrUndefined(this.userForm.value.domain_name) ? this.userForm.value.domain_name : undefined
    });
    const apiURLHeader: APIURLHEADER = {
      url: environment.USERS_URL,
      httpOptions: { headers: this.headers }
    };
    this.restService.postResource(apiURLHeader, payLoad).subscribe((result: {}) => {
      this.activeModal.close(this.modalData);
      this.isLoadingResults = false;
      this.notifierService.notify('success', this.translateService.instant('PAGE.USERS.CREATEDSUCCESSFULLY'));
    }, (error: ERRORDATA) => {
      this.restService.handleError(error, 'post');
      this.isLoadingResults = false;
    });
  }

  /** Edit user @public */
  public editUser(): void {
    this.isLoadingResults = true;
    const payLoad: { username?: string, password?: string } = {};
    if (this.userType === 'editPassword') {
      payLoad.password = (this.userForm.value.password);
    } else {
      payLoad.username = this.userForm.value.userName.toLowerCase();
    }
    const apiURLHeader: APIURLHEADER = {
      url: environment.USERS_URL + '/' + this.userID,
      httpOptions: { headers: this.headers }
    };
    this.restService.patchResource(apiURLHeader, payLoad).subscribe((result: {}) => {
      this.checkUsername(payLoad);
      this.activeModal.close(this.modalData);
      this.isLoadingResults = false;
      this.notifierService.notify('success', this.translateService.instant('PAGE.USERS.EDITEDSUCCESSFULLY'));
    }, (error: ERRORDATA) => {
      this.restService.handleError(error, 'put');
      this.isLoadingResults = false;
    });
  }
  /** Get domain name @private */
  private getDomainName(): void {
    this.isLoadingResults = true;
    this.restService.getResource(environment.DOMAIN_URL).subscribe((domains: { project_domain_name: string, user_domain_name: string }) => {
      let domainNames: string[] = [];
      if (!isNullOrUndefined(domains.project_domain_name)) {
        domainNames = domainNames.concat(domains.project_domain_name.split(','));
      }
      if (!isNullOrUndefined(domains.user_domain_name)) {
        domainNames = domainNames.concat(domains.user_domain_name.split(','));
      }
      domainNames = Array.from(new Set(domainNames));
      this.checkDomainNames(domainNames);
      this.isLoadingResults = false;
    }, (error: ERRORDATA) => {
      this.restService.handleError(error, 'get');
      this.isLoadingResults = false;
    });
  }

  /** Check the domain names and create modal for domain select @private */
  private checkDomainNames(domainNames: string[]): void {
    if (domainNames.length > 0) {
      domainNames.forEach((domainName: string) => {
        if (!domainName.endsWith(':ro')) {
          this.domains.push({ id: domainName, text: domainName });
        }
      });
    }
  }

  /** Used to get the AbstractControl of controlName passed @private */
  private getFormControl(controlName: string): AbstractControl {
    return this.userForm.controls[controlName];
  }

  /** Method to check loggedin username and update  @private */
  private checkUsername(payLoad: { username?: string }): void {
    const logUsername: string = localStorage.getItem('username');
    if (this.userType === 'editUserName' && logUsername === this.userName) {
      this.authService.userName.next(payLoad.username);
      localStorage.setItem('username', payLoad.username);
    }
  }
}
