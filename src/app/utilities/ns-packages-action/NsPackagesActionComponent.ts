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
 * @file NS PackagesAction Component
 */
import { HttpHeaders } from '@angular/common/http';
import { ChangeDetectorRef, Component, Injector } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { NotifierService } from 'angular-notifier';
import { ClonePackageComponent } from 'ClonePackage';
import { ERRORDATA, GETAPIURLHEADER, MODALCLOSERESPONSEDATA } from 'CommonModel';
import { DeleteComponent } from 'DeleteComponent';
import { environment } from 'environment';
import { InstantiateNsComponent } from 'InstantiateNs';
import { NSData } from 'NSDModel';
import { RestService } from 'RestService';
import { SharedService } from 'SharedService';
import { ShowContentComponent } from 'ShowContent';

/**
 * Creating component
 * @Component takes NsPackagesActionComponent.html as template url
 */
@Component({
  selector: 'app-ns-packages-action',
  templateUrl: './NsPackagesActionComponent.html',
  styleUrls: ['./NsPackagesActionComponent.scss']
})

/** Exporting a class @exports NsPackagesActionComponent */
export class NsPackagesActionComponent {
  /** To get the value from the nspackage via valuePrepareFunction default Property of ng-smarttable @public */
  public value: NSData;

  /** To inject services @public */
  public injector: Injector;

  /** Check the loading results for loader status @public */
  public isLoadingDownloadResult: boolean = false;

  /** Give the message for the loading @public */
  public message: string = 'PLEASEWAIT';

  /** Instance of the rest service @private */
  private restService: RestService;

  /** Holds teh instance of AuthService class of type AuthService @private */
  private router: Router;

  /** Instance of the modal service @private */
  private modalService: NgbModal;

  /** Variables holds NS ID @private */
  private nsdID: string;

  /** Variables holds NS name @private */
  private nsdName: string;

  /** Controls the header form @private */
  private headers: HttpHeaders;

  /** Contains all methods related to shared @private */
  private sharedService: SharedService;

  /** Notifier service to popup notification @private */
  private notifierService: NotifierService;

  /** Contains tranlsate instance @private */
  private translateService: TranslateService;

  /** Detect changes for the User Input */
  private cd: ChangeDetectorRef;

  /** Set timeout @private */
  private timeOut: number = 1000;

  constructor(injector: Injector) {
    this.injector = injector;
    this.restService = this.injector.get(RestService);
    this.sharedService = this.injector.get(SharedService);
    this.modalService = this.injector.get(NgbModal);
    this.router = this.injector.get(Router);
    this.notifierService = this.injector.get(NotifierService);
    this.translateService = this.injector.get(TranslateService);
    this.cd = this.injector.get(ChangeDetectorRef);
  }

  /** Lifecyle Hooks the trigger before component is instantiate @public */
  public ngOnInit(): void {
    this.headers = new HttpHeaders({
      Accept: 'application/zip, application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0'
    });
    this.nsdID = this.value.identifier;
    this.nsdName = this.value.shortName;
  }

  /** Instantiate NS using modalservice @public */
  public instantiateNS(): void {
    this.modalService.open(InstantiateNsComponent, { backdrop: 'static' });
  }

  /** Delete NS Package @public */
  public deleteNSPackage(): void {
    const modalRef: NgbModalRef = this.modalService.open(DeleteComponent, { backdrop: 'static' });
    modalRef.result.then((result: MODALCLOSERESPONSEDATA) => {
      if (result) {
        this.sharedService.callData();
      }
    }).catch();
  }

  /** Set instance for NSD Edit @public */
  public nsdEdit(): void {
    this.router.navigate(['/packages/ns/edit/', this.nsdID]).catch(() => {
      // Catch Navigation Error
    });
  }

  /** list out all the file content of a descriptors @public */
  public showContent(): void {
    this.modalService.open(ShowContentComponent, { backdrop: 'static' }).componentInstance.params = { id: this.nsdID, page: 'nsd' };
  }

  /** Download NS Package @public */
  public downloadNSPackage(): void {
    this.isLoadingDownloadResult = true;
    const httpOptions: GETAPIURLHEADER = {
      headers: this.headers,
      responseType: 'blob'
    };
    this.restService.getResource(environment.NSDESCRIPTORS_URL + '/' + this.nsdID + '/nsd_content', httpOptions)
      .subscribe((response: Blob) => {
        const binaryData: Blob[] = [];
        binaryData.push(response);
        this.sharedService.downloadFiles(this.nsdName, binaryData, response.type);
        this.isLoadingDownloadResult = false;
        this.changeDetactionforDownload();
      }, (error: ERRORDATA) => {
        this.isLoadingDownloadResult = false;
        this.notifierService.notify('error', this.translateService.instant('ERROR'));
        this.changeDetactionforDownload();
        if (typeof error.error === 'object') {
          error.error.text().then((data: string): void => {
            error.error = JSON.parse(data);
            this.restService.handleError(error, 'getBlob');
          });
        }
      });
  }

  /** Compose NS Packages @public */
  public composeNSPackages(): void {
    this.router.navigate(['/packages/ns/compose/', this.nsdID]).catch(() => {
      // Catch Navigation Error
    });
  }

  /** Change the detaction @public */
   public changeDetactionforDownload(): void {
    setTimeout(() => {
      this.cd.detectChanges();
    }, this.timeOut);
  }

  /** Clone NS Packages @public */
  public cloneNSPackage(): void {
    const cloneModal: NgbModalRef = this.modalService.open(ClonePackageComponent, { backdrop: 'static' });
    cloneModal.componentInstance.params = { id: this.nsdID, page: 'nsd', name: this.nsdName };
    cloneModal.result.then((result: MODALCLOSERESPONSEDATA) => {
      if (result) {
        this.sharedService.callData();
      }
    }).catch();
  }
}
