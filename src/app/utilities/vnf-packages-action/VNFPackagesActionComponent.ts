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
 * @file VNF-packagesAction Component
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
import { RestService } from 'RestService';
import { SharedService } from 'SharedService';
import { ShowContentComponent } from 'ShowContent';
import { VNFData } from 'VNFDModel';

/**
 * Creating component
 * @Component takes VNFPackagesActionComponent.html as template url
 */
@Component({
  templateUrl: './VNFPackagesActionComponent.html',
  styleUrls: ['./VNFPackagesActionComponent.scss']
})
/** Exporting a class @exports VNFPackagesActionComponent */
export class VNFPackagesActionComponent {
  /** To get the value from the vnfpackage via valuePrepareFunction default Property of ng-smarttable @public */
  public value: VNFData;

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
  private vnfID: string;

  /** Variables holds NS name @private */
  private vnfName: string;

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
  // eslint-disable-next-line @typescript-eslint/no-magic-numbers
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

  /**
   * Lifecyle Hooks the trigger before component is instantiate
   */
  public ngOnInit(): void {
    this.headers = new HttpHeaders({
      Accept: 'application/zip, application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0'
    });
    this.vnfID = this.value.identifier;
    this.vnfName = this.value.productName;
  }

  /** Delete VNF packages @public */
  public deleteVNFPackage(): void {
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    const modalRef: NgbModalRef = this.modalService.open(DeleteComponent, { backdrop: 'static' });
    modalRef.result.then((result: MODALCLOSERESPONSEDATA) => {
      if (result) {
        this.sharedService.callData();
      }
    }).catch((): void => {
      // Catch Navigation Error
  });
  }

  /** Set instance for NSD Edit @public */
  public vnfdEdit(): void {
    this.router.navigate(['/packages/vnf/edit/', this.vnfID]).then((nav: {}) => {
      // Navigated Successfully
    }, (error: Error) => {
      // Navigation Error Handler
    });
  }

  /** list out all the file content of a descriptors @public */
  public showContent(): void {
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    this.modalService.open(ShowContentComponent, { backdrop: 'static' }).componentInstance.params = { id: this.vnfID, page: 'vnfd' };
  }

  /** Download VNF Package @public */
  public downloadVNFPackage(): void {
    this.isLoadingDownloadResult = true;
    const httpOptions: GETAPIURLHEADER = {
      headers: this.headers,
      responseType: 'blob'
    };
    this.restService.getResource(environment.VNFPACKAGES_URL + '/' + this.vnfID + '/package_content', httpOptions)
      .subscribe((response: Blob) => {
        this.isLoadingDownloadResult = false;
        this.changeDetactionforDownload();
        const binaryData: Blob[] = [];
        binaryData.push(response);
        this.sharedService.downloadFiles(this.vnfName, binaryData, response.type);
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

  /** Compose VNF Packages @public */
  public composeVNFPackages(): void {
    this.router.navigate(['/packages/vnf/compose/', this.vnfID]).catch((): void => {
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
  public cloneVNFPackage(): void {
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    const cloneModal: NgbModalRef = this.modalService.open(ClonePackageComponent, { backdrop: 'static' });
    cloneModal.componentInstance.params = { id: this.vnfID, page: 'vnfd', name: this.vnfName };
    cloneModal.result.then((result: MODALCLOSERESPONSEDATA) => {
      if (result) {
        this.sharedService.callData();
      }
    }).catch((): void => {
      // Catch Navigation Error
  });
  }
}
