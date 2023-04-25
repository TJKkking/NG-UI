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
import { isNullOrUndefined } from 'util';
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
import { NsUpdateComponent } from 'NsUpdateComponent';
import { RestService } from 'RestService';
import { forkJoin, Observable } from 'rxjs';
import { ScalingComponent } from 'ScalingComponent';
import { SharedService } from 'SharedService';
import { ShowInfoComponent } from 'ShowInfoComponent';
import { StartStopRebuildComponent } from 'StartStopRebuildComponent';
import { VerticalScalingComponent } from 'VerticalScalingComponent';
import { VmMigrationComponent } from 'VmMigrationComponent';
import { DF, VDU, VNFD } from 'VNFDModel';
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

  /** CNF Status Check @public */
  public k8sStatus: boolean = false;

  /** get Admin Details @public */
  public getAdminDetails: {};

  /** Scaling is accepted @public */
  public isScalingPresent: boolean = false;

  /** Check the loading results for loader status @public */
  public isLoadingNSInstanceAction: boolean = false;

  /** Give the message for the loading @public */
  public message: string = 'PLEASEWAIT';

  /** Assign the VNF Details @public */
  public vnfDetails: VNFD[] = [];

  /** Contains instance ID @public */
  public instanceID: string;

  /** Contains operational dashboard view @public */
  public isShowOperationalDashboard: boolean = false;

  /** Instance of the modal service @private */
  private modalService: NgbModal;

  /** Holds teh instance of AuthService class of type AuthService @private */
  private router: Router;

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
  private timeOut: number = 100;

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
    this.getAdminDetails = this.value.adminDetails;
    for (const key of Object.keys(this.getAdminDetails)) {
      if (key === 'deployed') {
        // eslint-disable-next-line security/detect-object-injection
        const adminData: {} = this.getAdminDetails[key];
        for (const k8sData of Object.keys(adminData)) {
          if (k8sData === 'K8s') {
            // eslint-disable-next-line security/detect-object-injection
            if (adminData[k8sData].length !== 0) {
              this.k8sStatus = true;
            }
          }
        }
      }
    }
    this.isShowOperationalDashboard = !isNullOrUndefined(this.value.vcaStatus) ?
      Object.keys(this.value.vcaStatus).length === 0 && typeof this.value.vcaStatus === 'object' : true;
  }

  /** Shows information using modalservice @public */
  public infoNs(): void {
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    this.modalService.open(ShowInfoComponent, { backdrop: 'static' }).componentInstance.params = {
      id: this.instanceID,
      page: 'ns-instance',
      titleName: 'INSTANCEDETAILS'
    };
  }

  /** Delete NS Instanace @public */
  public deleteNSInstance(forceAction: boolean): void {
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    const modalRef: NgbModalRef = this.modalService.open(DeleteComponent, { backdrop: 'static' });
    modalRef.componentInstance.params = { forceDeleteType: forceAction };
    modalRef.result.then((result: MODALCLOSERESPONSEDATA): void => {
      if (result) {
        this.sharedService.callData();
      }
    }).catch((): void => {
      // Catch Navigation Error
  });
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
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    this.modalService.open(NSPrimitiveComponent, { backdrop: 'static' }).componentInstance.params = {
      memberIndex: this.value.memberIndex,
      nsConfig: this.value.nsConfig,
      name: this.value.NsdName,
      id: this.value.constituent
    };
  }

  /** Redirect to Grafana Metrics @public */
  public metrics(): void {
    this.isLoadingNSInstanceAction = true;
    this.restService.getResource(environment.NSDINSTANCES_URL + '/' + this.instanceID).subscribe((nsData: NSDDetails[]): void => {
      nsData['vnfd-id'].forEach((vnfdID: string[]): void => {
        this.restService.getResource(environment.VNFPACKAGES_URL + '/' + vnfdID)
          .subscribe((vnfd: VNFD): void => {
            vnfd.vdu.forEach((vduData: VDU): void => {
              if (vduData['monitoring-parameter'] !== undefined && vduData['monitoring-parameter'].length > 0) {
                this.isLoadingNSInstanceAction = false;
                const location: string = environment.GRAFANA_URL + '/' + this.instanceID + '/osm-ns-metrics-metrics';
                // eslint-disable-next-line security/detect-non-literal-fs-filename
                window.open(location);
              } else {
                this.isLoadingNSInstanceAction = false;
                this.notifierService.notify('error', this.translateService.instant('PAGE.NSMETRIC.METRICERROR'));
              }
            });
            this.doChanges();
          }, (error: ERRORDATA): void => {
            this.restService.handleError(error, 'get');
            this.isLoadingNSInstanceAction = false;
          });
      });
    }, (error: ERRORDATA): void => {
      this.restService.handleError(error, 'get');
      this.isLoadingNSInstanceAction = false;
    });
  }

  /**
   * Do the manual scaling
   * Here we are going to get a list of VNFD ID used in the instances
   * and have this in array with URL created then pass to checkscaling method for forkjoin to get the data @public
   */
  public manualScaling(): void {
    this.isLoadingNSInstanceAction = true;
    const tempURL: Observable<{}>[] = [];
    this.value.vnfID.forEach((id: string): void => {
      const apiUrl: string = environment.VNFPACKAGESCONTENT_URL + '/' + id;
      tempURL.push(this.restService.getResource(apiUrl));
    });
    this.checkScaling(tempURL);
  }

  /**
   * Used to forkjoin to all the request to send parallely, get the data and check 'scaling-aspect' key is present @public
   */
  public checkScaling(URLS: Observable<{}>[]): void {
    forkJoin(URLS).subscribe((data: VNFD[]): void => {
      this.vnfDetails = data;
      if (this.vnfDetails.length > 0) {
        this.vnfDetails.forEach((vnfdData: VNFD): void => {
          vnfdData.df.forEach((dfData: DF): void => {
            if (!isNullOrUndefined(dfData['scaling-aspect']) && dfData['scaling-aspect'].length > 0) {
              this.isScalingPresent = true;
            }
          });
        });
      }
      this.isLoadingNSInstanceAction = false;
      if (this.isScalingPresent) {
        this.openScaling();
      } else {
        this.notifierService.notify('error', this.translateService.instant('SCALINGNOTFOUND'));
      }
      this.doChanges();
    });
  }

  /** Open the scaling pop-up @public */
  public openScaling(): void {
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    const modalRef: NgbModalRef = this.modalService.open(ScalingComponent, { backdrop: 'static' });
    modalRef.componentInstance.params = {
      id: this.instanceID,
      vnfID: this.value.vnfID,
      nsID: this.value['nsd-id'],
      nsd: this.value.nsd,
      data: this.vnfDetails
    };
    modalRef.result.then((result: MODALCLOSERESPONSEDATA): void => {
      if (result) {
        this.sharedService.callData();
      }
    }).catch((): void => {
      // Catch Navigation Error
  });
  }

  /** To open VM Migration in NS Instances */
  public openVmMigration(): void {
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    const modalRef: NgbModalRef = this.modalService.open(VmMigrationComponent, { backdrop: 'static' });
    modalRef.componentInstance.params = {
      id: this.instanceID
    };
    modalRef.result.then((result: MODALCLOSERESPONSEDATA): void => {
      if (result) {
        this.sharedService.callData();
      }
    }).catch((): void => {
      // Catch Navigation Error
  });
  }

  /** To open the Ns Update pop-up */
  public openNsUpdate(): void {
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    const modalRef: NgbModalRef = this.modalService.open(NsUpdateComponent, { backdrop: 'static' });
    modalRef.componentInstance.params = {
      id: this.instanceID
    };
    modalRef.result.then((result: MODALCLOSERESPONSEDATA): void => {
      if (result) {
        this.sharedService.callData();
      }
    }).catch((): void => {
      // Catch Navigation Error
  });
  }

  /** To open the Start, Stop & Rebuild pop-up */
  public openStart(actionType: string): void {
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    const modalRef: NgbModalRef = this.modalService.open(StartStopRebuildComponent, { backdrop: 'static' });
    modalRef.componentInstance.params = {
      id: this.instanceID
    };
    if (actionType === 'start') {
      modalRef.componentInstance.instanceTitle = this.translateService.instant('START');
    } else if (actionType === 'stop') {
      modalRef.componentInstance.instanceTitle = this.translateService.instant('STOP');
    } else {
      modalRef.componentInstance.instanceTitle = this.translateService.instant('REBUILD');
    }
    modalRef.componentInstance.instanceType = actionType;
    modalRef.result.then((result: MODALCLOSERESPONSEDATA): void => {
      if (result) {
        this.sharedService.callData();
      }
    }).catch((): void => {
      // Catch Navigation Error
  });
  }

  /** To open the vertical Scaling pop-up */
  public openVerticalScaling(): void {
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    const modalRef: NgbModalRef = this.modalService.open(VerticalScalingComponent, { backdrop: 'static' });
    modalRef.componentInstance.params = {
      id: this.instanceID
    };
    modalRef.result.then((result: MODALCLOSERESPONSEDATA): void => {
      if (result) {
        this.sharedService.callData();
      }
    }).catch((): void => {
      // Catch Navigation Error
  });
  }

  /**
   * Check any changes in the child component @public
   */
  public doChanges(): void {
    setTimeout((): void => {
      this.cd.detectChanges();
    }, this.timeOut);
  }
}
