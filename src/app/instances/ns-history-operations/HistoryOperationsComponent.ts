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
 * @file NS History Of Operations Component
 */
import { Component, Injector, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { CONFIGCONSTANT, ERRORDATA } from 'CommonModel';
import { DataService } from 'DataService';
import { environment } from 'environment';
import * as HttpStatus from 'http-status-codes';
import { LocalDataSource } from 'ng2-smart-table';
import { NSDInstanceData } from 'NSInstanceModel';
import { RestService } from 'RestService';
import { Subscription } from 'rxjs';
import { SharedService } from 'SharedService';
import { ShowInfoComponent } from 'ShowInfoComponent';

/**
 * Creating component
 * @Component takes HistoryOperationsComponent.html as template url
 */
@Component({
  templateUrl: './HistoryOperationsComponent.html',
  styleUrls: ['./HistoryOperationsComponent.scss']
})
/** Exporting a class @exports HistoryOperationsComponent */
export class HistoryOperationsComponent implements OnInit {
  /** Injector to invoke other services @public */
  public injector: Injector;

  /** NS Instance array @public */
  public nsAndnstInstanceData: object[] = [];

  /** Datasource instance @public */
  public dataSource: LocalDataSource = new LocalDataSource();

  /** Instance component are stored in settings @public */
  public settings: {} = {};

  /** Contains objects for smart table title and filter settings @public */
  public columnList: {} = {};

  /** Variable handles the page name @public */
  public page: string;

  /** Variable handles the title name @public */
  public titleName: string;

  /** Check the loading results @public */
  public isLoadingResults: boolean = true;

  /** Give the message for the loading @public */
  public message: string = 'PLEASEWAIT';

  /** Class for empty and present data @public */
  public checkDataClass: string;

  /** History State init data @public */
  public historyStateFirstStep: string = CONFIGCONSTANT.historyStateFirstStep;

  /** History State running data @public */
  public historyStateSecondStep: string = CONFIGCONSTANT.historyStateSecondStep;

  /** History State failed data @public */
  public historyStateThirdStep: string = CONFIGCONSTANT.historyStateThirdStep;

  /** dataService to pass the data from one component to another @private */
  private dataService: DataService;

  /** Utilizes rest service for any CRUD operations @private */
  private restService: RestService;

  /** Contains all methods related to shared @private */
  private sharedService: SharedService;

  /** Holds teh instance of AuthService class of type AuthService @private */
  private activatedRoute: ActivatedRoute;

  /** Instance of the modal service @private */
  private modalService: NgbModal;

  /** variables contains paramsID @private */
  private paramsID: string;

  /** variables contains paramsID @private */
  private paramsType: string;

  /** variables conatins URL of the History operations @public */
  private historyURL: string;

  /** Contains tranlsate instance @private */
  private translateService: TranslateService;

  /** Instance of subscriptions @private */
  private generateDataSub: Subscription;

  /** Service holds the router information @private */
  private router: Router;

  constructor(injector: Injector) {
    this.injector = injector;
    this.restService = this.injector.get(RestService);
    this.dataService = this.injector.get(DataService);
    this.sharedService = this.injector.get(SharedService);
    this.activatedRoute = this.injector.get(ActivatedRoute);
    this.modalService = this.injector.get(NgbModal);
    this.translateService = this.injector.get(TranslateService);
    this.router = this.injector.get(Router);
  }

  /** Lifecyle Hooks the trigger before component is instantiate @public */
  public ngOnInit(): void {
    // tslint:disable-next-line:no-backbone-get-set-outside-model
    this.paramsID = this.activatedRoute.snapshot.paramMap.get('id');
    // tslint:disable-next-line:no-backbone-get-set-outside-model
    this.paramsType = this.activatedRoute.snapshot.paramMap.get('type');
    if (this.paramsType === 'ns') {
      this.historyURL = environment.NSHISTORYOPERATIONS_URL + '/?nsInstanceId=' + this.paramsID;
      this.page = 'ns-history-operation';
      this.titleName = 'INSTANCEDETAILS';
    } else if (this.paramsType === 'netslice') {
      this.historyURL = environment.NSTHISTORYOPERATIONS_URL + '/?netsliceInstanceId=' + this.paramsID;
      this.page = 'nst-history-operation';
      this.titleName = 'INSTANCEDETAILS';
    }
    this.generateTableColumn();
    this.generateTableSettings();
    this.generateData();
    this.generateDataSub = this.sharedService.dataEvent.subscribe(() => { this.generateData(); });
  }

  /** Generate smart table row title and filters @public  */
  public generateTableSettings(): void {
    this.settings = {
      columns: this.columnList,
      actions: {
        add: false, edit: false, delete: false, position: 'right',
        custom: [{
          name: 'showInformation', title: '<i class="fas fa-info" title=" ' + this.translateService.instant('INFO') + ' "></i>'}]
      },
      attr: this.sharedService.tableClassConfig(),
      pager: this.sharedService.paginationPagerConfig(),
      noDataMessage: this.translateService.instant('NODATAMSG')
    };
  }

  /** Generate smart table row title and filters @public  */
  public generateTableColumn(): void {
    this.columnList = {
      id: { title: this.translateService.instant('ID'), width: '30%' },
      type: { title: this.translateService.instant('TYPE'), width: '20%' },
      state: {
        type: 'html', title: this.translateService.instant('OPERATIONSTATE'), width: '15%',
        filter: {
          type: 'list',
          config: {
            selectText: 'Select',
            list: [
              { value: this.historyStateFirstStep, title: this.historyStateFirstStep },
              { value: this.historyStateSecondStep, title: this.historyStateSecondStep },
              { value: this.historyStateThirdStep, title: this.historyStateThirdStep }
            ]
          }
        },
        valuePrepareFunction: (cell: NSDInstanceData, row: NSDInstanceData): string => {
          if (row.state === this.historyStateFirstStep) {
            return `<span class="icon-label" title="${row.state}">
                        <i class="fas fa-clock text-warning"></i>
                        </span>`;
          } else if (row.state === this.historyStateSecondStep) {
            return `<span class="icon-label" title="${row.state}">
                        <i class="fas fa-check-circle text-success"></i>
                        </span>`;
          } else if (row.state === this.historyStateThirdStep) {
            return `<span class="icon-label" title="${row.state}">
                        <i class="fas fa-times-circle text-danger"></i>
                        </span>`;
          } else {
            return `<span>${row.state}</span>`;
          }
        }
      },
      startTime: { title: this.translateService.instant('STARTTIME'), width: '15%' },
      statusEnteredTime: { title: this.translateService.instant('STATUSENTEREDTIME'), width: '15%' }
    };
  }

  /** smart table listing manipulation @public */
  public onUserRowSelect(event: MessageEvent): void {
    this.dataService.changeMessage(event.data);
  }
  /** smart table listing manipulation @public */
  public onChange(perPageValue: number): void {
    this.dataSource.setPaging(1, perPageValue, true);
  }
  /** show information methods modal with ns history info */
  public showInformation(event: MessageEvent): void {
    this.modalService.open(ShowInfoComponent, { backdrop: 'static' }).componentInstance.params = {
      id: event.data.id,
      page: this.page,
      titleName: this.titleName
    };
  }

  /**
   * Lifecyle hook which get trigger on component destruction
   */
  public ngOnDestroy(): void {
    this.generateDataSub.unsubscribe();
  }

  /** generateData initiate the ns-instance list @private */
  private generateData(): void {
    this.isLoadingResults = true;
    this.restService.getResource(this.historyURL).subscribe((nsdInstancesData: {}[]) => {
      this.nsAndnstInstanceData = [];
      nsdInstancesData.forEach((nsdAndnstInstanceData: NSDInstanceData) => {
        const nsAndnstDataObj: {} = {
          id: nsdAndnstInstanceData.id,
          type: nsdAndnstInstanceData.lcmOperationType,
          state: nsdAndnstInstanceData.operationState,
          startTime: this.sharedService.convertEpochTime(nsdAndnstInstanceData.startTime),
          statusEnteredTime: this.sharedService.convertEpochTime(nsdAndnstInstanceData.statusEnteredTime)
        };
        this.nsAndnstInstanceData.push(nsAndnstDataObj);
      });

      if (this.nsAndnstInstanceData.length > 0) {
        this.checkDataClass = 'dataTables_present';
      } else {
        this.checkDataClass = 'dataTables_empty';
      }
      this.dataSource.load(this.nsAndnstInstanceData).then((data: {}) => {
        //empty block
      }).catch();
      this.isLoadingResults = false;
    }, (error: ERRORDATA) => {
      this.isLoadingResults = false;
      if (error.error.status === HttpStatus.NOT_FOUND || error.error.status === HttpStatus.UNAUTHORIZED) {
        this.router.navigateByUrl('404', { skipLocationChange: true }).catch();
      } else {
        this.restService.handleError(error, 'get');
      }
    });
  }
}
