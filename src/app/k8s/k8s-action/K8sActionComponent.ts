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
 * @file K8 Action Component
 */
import { Component, Injector } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { MODALCLOSERESPONSEDATA } from 'CommonModel';
import { DeleteComponent } from 'DeleteComponent';
import { K8SCLUSTERDATADISPLAY, K8SREPODATADISPLAY } from 'K8sModel';
import { SharedService } from 'SharedService';
import { ShowInfoComponent } from 'ShowInfoComponent';
/**
 * Creating component
 * @Component takes K8sActionComponent.html as template url
 */
@Component({
  selector: 'app-k8s-action',
  templateUrl: './K8sActionComponent.html',
  styleUrls: ['./K8sActionComponent.scss']
})
/** Exporting a class @exports K8sActionComponent */
export class K8sActionComponent{
  /** To inject services @public */
  public injector: Injector;

  /** To get the value from the Users action via valuePrepareFunction default Property of ng-smarttable @public */
  public value: K8SCLUSTERDATADISPLAY | K8SREPODATADISPLAY;

  /** handle translate @public */
  public translateService: TranslateService;

  /** Contains K8s Type @private */
  public getK8sType: string;

  /** Instance of the modal service @private */
  private modalService: NgbModal;

  /** Contains all methods related to shared @private */
  private sharedService: SharedService;

  /** Contains instance ID @private */
  private instanceID: string;

  constructor(injector: Injector) {
    this.injector = injector;
    this.modalService = this.injector.get(NgbModal);
    this.sharedService = this.injector.get(SharedService);
    this.translateService = this.injector.get(TranslateService);
  }

  /**
   * Lifecyle Hooks the trigger before component is instantiate
   */
  public ngOnInit(): void {
    this.instanceID = this.value.identifier;
    this.getK8sType = this.value.pageType;
  }

  /** Delete User Account @public */
  public deleteK8s(pageType: string): void {
    const modalRef: NgbModalRef = this.modalService.open(DeleteComponent, { backdrop: 'static' });
    modalRef.result.then((result: MODALCLOSERESPONSEDATA) => {
      if (result) {
        this.sharedService.callData();
      }
    }).catch();
  }

  /** Shows information using modalservice @public */
  public infoK8s(pageType: string): void {
    let pageName: string = '';
    let title: string = '';
    if (pageType === 'repo') {
      pageName = 'k8s-repo';
      title = 'PAGE.K8S.K8SREPODETAILS';
    } else {
      pageName = 'k8s-cluster';
      title = 'PAGE.K8S.K8SCLUSTERDETAILS';
    }
    this.modalService.open(ShowInfoComponent, { backdrop: 'static' }).componentInstance.params = {
      id: this.instanceID,
      page: pageName,
      titleName: title
    };
  }
}
