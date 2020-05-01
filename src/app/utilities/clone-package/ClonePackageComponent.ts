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
 * @file Clone Package  Model
 */
import { HttpHeaders } from '@angular/common/http';
import { Component, Injector, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { NotifierService } from 'angular-notifier';
import { APIURLHEADER, ERRORDATA, GETAPIURLHEADER, MODALCLOSERESPONSEDATA, URLPARAMS } from 'CommonModel';
import { environment } from 'environment';
import * as jsyaml from 'js-yaml';
import { NSDDetails } from 'NSDModel';
import { RestService } from 'RestService';
import { SharedService } from 'SharedService';

/**
 * Creating component
 * @Component takes ClonePackageComponent.html as template url
 */

@Component({
  selector: 'app-clone-package',
  templateUrl: './ClonePackageComponent.html',
  styleUrls: ['./ClonePackageComponent.scss']
})
/** Exporting a class @exports ClonePackageComponent */
export class ClonePackageComponent implements OnInit {
  /** To inject services @public */
  public injector: Injector;

  /** Instance for active modal service @public */
  public activeModal: NgbActiveModal;

  /** Input contains component objects @public */
  @Input() public params: URLPARAMS;

  /** To handle loader status for API call @public */
  public isLoadingResults: boolean = false;

  /** Give the message for the loading @public */
  public message: string = 'PLEASEWAIT';

  /** Contains all methods related to shared @private */
  private sharedService: SharedService;

  /** Instance of the rest service @private */
  private restService: RestService;

  /** Notifier service to popup notification @private */
  private notifierService: NotifierService;

  /** Contains tranlsate instance @private */
  private translateService: TranslateService;

  /** Contains cloned package name instance @private */
  private packageName: string = '';

  /** Contains API end point for package creation @private */
  private endPoint: string;

  constructor(injector: Injector) {
    this.injector = injector;
    this.restService = this.injector.get(RestService);
    this.sharedService = this.injector.get(SharedService);
    this.activeModal = this.injector.get(NgbActiveModal);
    this.notifierService = this.injector.get(NotifierService);
    this.translateService = this.injector.get(TranslateService);
  }
  /**
   * Lifecyle Hooks the trigger before component is instantiate
   */
  public ngOnInit(): void {
    // Empty Block
  }
  /**
   * Get package information based on type
   */
  public clonePackageInfo(): void {
    let apiUrl: string = '';
    const httpOptions: GETAPIURLHEADER = this.getHttpoptions();
    apiUrl = this.params.page === 'nsd' ? apiUrl = environment.NSDESCRIPTORS_URL + '/' + this.params.id + '/nsd' :
      apiUrl = environment.VNFPACKAGES_URL + '/' + this.params.id + '/vnfd';
    this.isLoadingResults = true;
    this.restService.getResource(apiUrl, httpOptions)
      .subscribe((nsData: NSDDetails[]) => {
        this.modifyContent(nsData);
      }, (error: ERRORDATA) => {
        this.isLoadingResults = false;
        error.error = typeof error.error === 'string' ? jsyaml.load(error.error) : error.error;
        this.restService.handleError(error, 'get');
      });
  }
  /**
   * Get HTTP header options
   */
  private getHttpoptions(): GETAPIURLHEADER {
    const apiHeaders: HttpHeaders = new HttpHeaders({
      'Content-Type': 'application/json',
      Accept: 'text/plain',
      'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0'
    });
    return {
      headers: apiHeaders,
      responseType: 'text'
    };
  }
  /**
   * Get and modify package information based on type
   */
  private modifyContent(packageInfo: NSDDetails[]): void {
    const packageContent: string = jsyaml.load(packageInfo.toString());
    if (this.params.page === 'nsd') {
      this.packageName = 'clone_' + packageContent['nsd:nsd-catalog'].nsd[0].name;
      this.endPoint = environment.NSDESCRIPTORSCONTENT_URL;
      packageContent['nsd:nsd-catalog'].nsd.forEach((nsd: NSDDetails) => {
        nsd.id = 'clone_' + nsd.id;
        nsd.name = 'clone_' + nsd.name;
        nsd['short-name'] = 'clone_' + nsd['short-name'];
      });
    } else {
      this.packageName = 'clone_' + packageContent['vnfd:vnfd-catalog'].vnfd[0].name;
      this.endPoint = environment.VNFPACKAGESCONTENT_URL;
      packageContent['vnfd:vnfd-catalog'].vnfd.forEach((vnfd: NSDDetails) => {
        vnfd.id = 'clone_' + vnfd.id;
        vnfd.name = 'clone_' + vnfd.name;
        vnfd['short-name'] = 'clone_' + vnfd['short-name'];
      });
    }
    this.clonePackage(packageContent);
  }
  /**
   * Create clone package and upload as TAR.GZ file
   */
  private clonePackage(packageContent: string): void {
    const descriptorInfo: string = jsyaml.dump(packageContent);
    const apiHeader: HttpHeaders = new HttpHeaders({
      'Content-Type': 'application/gzip',
      Accept: 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0'
    });
    const modalData: MODALCLOSERESPONSEDATA = {
      message: 'Done'
    };
    this.sharedService.targzFile({ packageType: this.params.page, id: this.params.id, descriptor: descriptorInfo })
      .then((content: ArrayBuffer): void => {
        const apiURLHeader: APIURLHEADER = {
          url: this.endPoint,
          httpOptions: { headers: apiHeader }
        };
        this.restService.postResource(apiURLHeader, content).subscribe((result: { id: string }) => {
          this.activeModal.close(modalData);
          this.isLoadingResults = false;
          this.notifierService.notify('success', this.translateService.instant('CLONESUCCESSFULLY'));
        }, (error: ERRORDATA) => {
          this.isLoadingResults = false;
          this.restService.handleError(error, 'post');
        });
      }).catch((): void => {
        this.isLoadingResults = false;
        this.notifierService.notify('error', this.translateService.instant('ERROR'));
      });
  }
}
