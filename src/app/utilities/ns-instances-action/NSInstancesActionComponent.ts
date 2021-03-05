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
 * @file NS InstancesAction Component
 */
import { ChangeDetectionStrategy, ChangeDetectorRef, Component, Injector } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { NotifierService } from 'angular-notifier';
import { ERRORDATA, MODALCLOSERESPONSEDATA } from 'CommonModel';
import { DeleteComponent } from 'DeleteComponent';
import { environment } from 'environment';
import { NSDDetails } from 'NSDModel';
import { NSDInstanceData } from 'NSInstanceModel';
import { NSPrimitiveComponent } from 'NSPrimitiveComponent';
import { RestService } from 'RestService';
import { SharedService } from 'SharedService';
import { ShowInfoComponent } from 'ShowInfoComponent';
import { VDU, VNFD } from 'VNFDModel';
/**
 * Creating component
 * @Component takes NSInstancesActionComponent.html as template url
 */
@Component({
  templateUrl: './NSInstancesActionComponent.html',
  styleUrls: ['./NSInstancesActionComponent.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
/** Exporting a class @exports NSInstancesActionComponent */
export class NSInstancesActionComponent {
  /** To get the value from the nspackage via valuePrepareFunction default Property of ng-smarttable @public */
  public value: NSDInstanceData;

  /** Invoke service injectors @public */
  public injector: Injector;

  /** Instance of the modal service @public */
  public restService: RestService;

  /** Config Status Check @public */
  public configStatus: string;

  /** Operational Status Check @public */
  public operationalStatus: string;

  /** Check the loading results for loader status @public */
  public isLoadingMetricsResult: boolean = false;

  /** Give the message for the loading @public */
  public message: string = 'PLEASEWAIT';

  /** Instance of the modal service @private */
  private modalService: NgbModal;

  /** Holds teh instance of AuthService class of type AuthService @private */
  private router: Router;

  /** Contains instance ID @private */
  private instanceID: string;

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
    this.modalService = this.injector.get(NgbModal);
    this.restService = this.injector.get(RestService);
    this.router = this.injector.get(Router);
    this.sharedService = this.injector.get(SharedService);
    this.notifierService = this.injector.get(NotifierService);
    this.translateService = this.injector.get(TranslateService);
    this.cd = this.injector.get(ChangeDetectorRef);
  }

  /**
   * Lifecyle Hooks the trigger before component is instantiate
   */
  public ngOnInit(): void {
    this.configStatus = this.value.ConfigStatus;
    this.operationalStatus = this.value.OperationalStatus;
    this.instanceID = this.value.identifier;
  }

  /** Shows information using modalservice @public */
  public infoNs(): void {
    this.modalService.open(ShowInfoComponent, { backdrop: 'static' }).componentInstance.params = {
      id: this.instanceID,
      page: 'ns-instance',
      titleName: 'INSTANCEDETAILS'
    };
  }

  /** Delete NS Instanace @public */
  public deleteNSInstance(forceAction: boolean): void {
    const modalRef: NgbModalRef = this.modalService.open(DeleteComponent, { backdrop: 'static' });
    modalRef.componentInstance.params = { forceDeleteType: forceAction };
    modalRef.result.then((result: MODALCLOSERESPONSEDATA): void => {
      if (result) {
        this.sharedService.callData();
      }
    }).catch();
  }

  /** History of operations for an Instanace @public */
  public historyOfOperations(): void {
    this.router.navigate(['/instances/ns/history-operations/', this.instanceID]).catch((): void => {
      // Catch Navigation Error
    });
  }

  /** NS Topology */
  public nsTopology(): void {
    this.router.navigate(['/instances/ns/', this.instanceID]).catch((): void => {
      // Catch Navigation Error
    });
  }

  /** Exec NS Primitive @public */
  public execNSPrimitiveModal(): void {
    this.modalService.open(NSPrimitiveComponent, { backdrop: 'static' }).componentInstance.params = {
      memberIndex: this.value.memberIndex,
      nsConfig: this.value.nsConfig,
      name: this.value.NsdName
    };
  }

  /** Redirect to Grafana Metrics @public */
  public metrics(): void {
    this.isLoadingMetricsResult = true;
    this.restService.getResource(environment.NSDINSTANCES_URL + '/' + this.instanceID).subscribe((nsData: NSDDetails[]): void => {
      nsData['vnfd-id'].forEach((vnfdID: string[]): void => {
        this.restService.getResource(environment.VNFPACKAGES_URL + '/' + vnfdID)
          .subscribe((vnfd: VNFD): void => {
            vnfd.vdu.forEach((vduData: VDU): void => {
              if (vduData['monitoring-parameter'] !== undefined && vduData['monitoring-parameter'].length > 0) {
                this.isLoadingMetricsResult = false;
                const location: string = environment.GRAFANA_URL + '/' + this.instanceID + '/osm-ns-metrics-metrics';
                window.open(location);
              } else {
                this.isLoadingMetricsResult = false;
                this.notifierService.notify('error', this.translateService.instant('GRAFANA.METRICSERROR'));
              }
            });
            setTimeout((): void => {
              this.cd.detectChanges();
            }, this.timeOut);
          }, (error: ERRORDATA): void => {
            this.restService.handleError(error, 'get');
            this.isLoadingMetricsResult = false;
          });
      });
    }, (error: ERRORDATA): void => {
      this.restService.handleError(error, 'get');
      this.isLoadingMetricsResult = false;
    });
  }
}
