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
 * @file Delete Model
 */
import { HttpHeaders } from '@angular/common/http';
import { Component, Injector, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { NotifierService } from 'angular-notifier';
import { DELETEPARAMS, ERRORDATA, MODALCLOSERESPONSEDATA, URLPARAMS } from 'CommonModel';
import { DataService } from 'DataService';
import { environment } from 'environment';
import { RestService } from 'RestService';

/**
 * Creating component
 * @Component takes DeleteComponent.html as template url
 */
@Component({
  selector: 'app-delete',
  templateUrl: './DeleteComponent.html',
  styleUrls: ['./DeleteComponent.scss']
})
/** Exporting a class @exports DeleteComponent */
export class DeleteComponent {
  /** To inject services @public */
  public injector: Injector;

  /** Instance for active modal service @public */
  public activeModal: NgbActiveModal;

  /** Instance of the modal service @public */
  public title: string;

  /** Show the Delete Ok button to trigger the terminate and delete */
  public forceDelete: boolean = false;

  /** Check the loading results @public */
  public isLoadingResults: Boolean = false;

  /** Give the message for the loading @public */
  public notifyMessage: string = 'DELETELOADERMESSAGE';

  /** Give the message for the loading @public */
  public message: string = 'PLEASEWAIT';

  /** DataService to pass the data from one component to another @private */
  private dataService: DataService;

  /** Instance of the rest service @private */
  private restService: RestService;

  /** Instance of the modal service @private */
  private id: string;

  /** Variables holds url to be delete @private */
  private deleteURL: string;

  /** Controls the header form @private */
  private headers: HttpHeaders;

  /** Input contains component objects @private */
  @Input() private params: URLPARAMS;

  /** Notifier service to popup notification @private */
  private notifierService: NotifierService;

  /** Contains tranlsate instance @private */
  private translateService: TranslateService;

  constructor(injector: Injector) {
    this.injector = injector;
    this.restService = this.injector.get(RestService);
    this.dataService = this.injector.get(DataService);
    this.activeModal = this.injector.get(NgbActiveModal);
    this.notifierService = this.injector.get(NotifierService);
    this.translateService = this.injector.get(TranslateService);
  }

  /**
   * Lifecyle Hooks the trigger before component is instantiate
   */
  public ngOnInit(): void {
    this.headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0'
    });
    this.dataService.currentMessage.subscribe((data: DELETEPARAMS) => {
      if (data.identifier !== undefined || data.identifier !== '' || data.identifier !== null) {
        this.id = data.identifier;
      }
      this.createTitleandID(data);
      this.createDeleteUrl(data);
    });
  }
  /** Generate Title and Id from data @public */
  public createTitleandID(data: DELETEPARAMS): void {
    this.title = '';
    if (data.name !== undefined) {
      this.title = data.name;
    } else if (data.shortName !== undefined) {
      this.title = data.shortName;
    } else if (data.projectName !== undefined) {
      this.title = data.projectName;
      this.id = this.title;
    } else if (data.userName !== undefined) {
      this.title = data.userName;
    } else if (data.username !== undefined) {
      this.title = data.username;
    }
  }
  /** Generate Delete url from data @public */
  public createDeleteUrl(data: DELETEPARAMS): void {
    this.deleteURL = '';
    if (data.page === 'ns-instance') {
      this.deleteURL = environment.NSINSTANCESCONTENT_URL;
      this.forceDelete = this.params.forceDeleteType;
    } else if (data.page === 'ns-package') {
      this.deleteURL = environment.NSDESCRIPTORSCONTENT_URL;
      this.notifyMessage = 'DELETEDSUCCESSFULLY';
    } else if (data.page === 'vnf-package') {
      this.deleteURL = environment.VNFPACKAGESCONTENT_URL;
      this.notifyMessage = 'DELETEDSUCCESSFULLY';
    } else if (data.page === 'vim-account') {
      this.deleteURL = environment.VIMACCOUNTS_URL;
      this.notifyMessage = 'DELETEDSUCCESSFULLY';
    } else if (data.page === 'wim-account') {
      this.deleteURL = environment.WIMACCOUNTS_URL;
      this.notifyMessage = 'DELETEDSUCCESSFULLY';
    } else if (data.page === 'projects') {
      this.deleteURL = environment.PROJECTS_URL;
      this.notifyMessage = 'DELETEDSUCCESSFULLY';
      this.id = data.id;
    } else if (data.page === 'users') {
      this.deleteURL = environment.USERS_URL;
      this.notifyMessage = 'DELETEDSUCCESSFULLY';
    } else if (data.page === 'network-slice') {
      this.deleteURL = environment.NETWORKSLICETEMPLATECONTENT_URL;
      this.notifyMessage = 'DELETEDSUCCESSFULLY';
    } else if (data.page === 'net-slice-instance') {
      this.deleteURL = environment.NETWORKSLICEINSTANCESCONTENT_URL;
      this.forceDelete = this.params.forceDeleteType;
    } else if (data.page === 'roles') {
      this.deleteURL = environment.ROLES_URL;
      this.notifyMessage = 'DELETEDSUCCESSFULLY';
    } else if (data.page === 'pdu-instances') {
      this.deleteURL = environment.PDUINSTANCE_URL;
    } else if (data.page === 'sdn-controller') {
      this.deleteURL = environment.SDNCONTROLLER_URL;
      this.notifyMessage = 'DELETEDSUCCESSFULLY';
    } else if (data.page === 'k8-cluster') {
      this.deleteURL = environment.K8SCLUSTER_URL;
      this.notifyMessage = 'DELETEDSUCCESSFULLY';
    } else if (data.page === 'k8-repo') {
      this.deleteURL = environment.K8REPOS_URL;
      this.notifyMessage = 'DELETEDSUCCESSFULLY';
    }
  }
  /** Generate Data function @public */
  public deleteData(): void {
    this.isLoadingResults = true;
    const modalData: MODALCLOSERESPONSEDATA = {
      message: 'Done'
    };
    let deletingURl: string = '';
    if (this.forceDelete) {
      deletingURl = this.deleteURL + '/' + this.id + '?FORCE=true';
      this.notifyMessage = 'DELETEDSUCCESSFULLY';
    } else {
      deletingURl = this.deleteURL + '/' + this.id;
    }
    this.restService.deleteResource(deletingURl).subscribe((res: {}) => {
      this.activeModal.close(modalData);
      this.notifierService.notify('success', this.translateService.instant(this.notifyMessage, { title: this.title}));
    }, (error: ERRORDATA) => {
      this.isLoadingResults = false;
      this.restService.handleError(error, 'delete');
    }, () => {
      this.isLoadingResults = false;
    });
  }
}
