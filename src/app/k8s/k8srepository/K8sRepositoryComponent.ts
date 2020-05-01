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
 * @file K8sRepositoryComponent.ts.
 */
import { Component, Injector, OnDestroy, OnInit } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { ERRORDATA, MODALCLOSERESPONSEDATA } from 'CommonModel';
import { DataService } from 'DataService';
import { environment } from 'environment';
import { K8sActionComponent } from 'K8sActionComponent';
import { K8sAddRepoComponent } from 'K8sAddRepoComponent';
import { K8SREPODATA, K8SREPODATADISPLAY } from 'K8sModel';
import { LocalDataSource } from 'ng2-smart-table';
import { RestService } from 'RestService';
import { Subscription } from 'rxjs';
import { SharedService } from 'SharedService';
/**
 * Creating Component
 * @Component takes K8sRepositoryComponent.html as template url
 */
@Component({
  selector: 'app-k8srepository',
  templateUrl: './K8sRepositoryComponent.html',
  styleUrls: ['./K8sRepositoryComponent.scss']
})
/** Exporting a class @exports K8sRepositoryComponent */
export class K8sRepositoryComponent implements OnInit, OnDestroy {
  /** To inject services @public */
  public injector: Injector;

  /** handle translate @public */
  public translateService: TranslateService;

  /** Data of smarttable populate through LocalDataSource @public */
  public dataSource: LocalDataSource = new LocalDataSource();

  /** Columns list of the smart table @public */
  public columnList: object = {};

  /** Settings for smarttable to populate the table with columns @public */
  public settings: object = {};

  /** Check the loading results @public */
  public isLoadingResults: boolean = true;

  /** Give the message for the loading @public */
  public message: string = 'PLEASEWAIT';

  /** Class for empty and present data @public */
  public checkDataClass: string;

  /** Instance of the rest service @private */
  private restService: RestService;

  /** dataService to pass the data from one component to another @private */
  private dataService: DataService;

  /** Formation of appropriate Data for LocalDatasource @private */
  private k8sRepoData: {}[] = [];

  /** Contains all methods related to shared @private */
  private sharedService: SharedService;

  /** Instance of the modal service @private */
  private modalService: NgbModal;

  /** Instance of subscriptions @private */
  private generateDataSub: Subscription;

  constructor(injector: Injector) {
    this.injector = injector;
    this.restService = this.injector.get(RestService);
    this.dataService = this.injector.get(DataService);
    this.sharedService = this.injector.get(SharedService);
    this.translateService = this.injector.get(TranslateService);
    this.modalService = this.injector.get(NgbModal);
  }
  /** Lifecyle Hooks the trigger before component is instantiate @public */
  public ngOnInit(): void {
    this.generateColumns();
    this.generateSettings();
    this.generateData();
    this.generateDataSub = this.sharedService.dataEvent.subscribe(() => { this.generateData(); });
  }

  /** smart table Header Colums @public */
  public generateColumns(): void {
    this.columnList = {
      name: { title: this.translateService.instant('NAME'), width: '20%', sortDirection: 'asc' },
      identifier: { title: this.translateService.instant('IDENTIFIER'), width: '20%' },
      url: { title: this.translateService.instant('URL'), width: '15%' },
      type: { title: this.translateService.instant('TYPE'), width: '10%' },
      created: { title: this.translateService.instant('CREATED'), width: '15%' },
      modified: { title: this.translateService.instant('MODIFIED'), width: '15%' },
      Actions: {
        name: 'Action', width: '5%', filter: false, sort: false, title: this.translateService.instant('ACTIONS'), type: 'custom',
        valuePrepareFunction: (cell: K8SREPODATADISPLAY, row: K8SREPODATADISPLAY): K8SREPODATADISPLAY => row,
        renderComponent: K8sActionComponent
      }
    };
  }

  /** smart table Data Settings @public */
  public generateSettings(): void {
    this.settings = {
      columns: this.columnList,
      actions: { add: false, edit: false, delete: false, position: 'right' },
      attr: this.sharedService.tableClassConfig(),
      pager: this.sharedService.paginationPagerConfig(),
      noDataMessage: this.translateService.instant('NODATAMSG')
    };
  }

  /** smart table listing manipulation @public */
  public onChange(perPageValue: number): void {
    this.dataSource.setPaging(1, perPageValue, true);
  }

  /** smart table listing manipulation @public */
  public onUserRowSelect(event: MessageEvent): void {
    Object.assign(event.data, { page: 'k8-repo' });
    this.dataService.changeMessage(event.data);
  }

  /** Compose new K8s Repo Accounts @public */
  public addK8sRepo(): void {
    const modalRef: NgbModalRef = this.modalService.open(K8sAddRepoComponent, { backdrop: 'static' });
    modalRef.result.then((result: MODALCLOSERESPONSEDATA) => {
      if (result) {
        this.sharedService.callData();
      }
    }).catch();
  }

  /**
   * Lifecyle hook which get trigger on component destruction
   */
  public ngOnDestroy(): void {
    this.generateDataSub.unsubscribe();
  }

  /** Generate nsData object from loop and return for the datasource @public */
  // tslint:disable-next-line: typedef
  public generateK8sRepoData(k8sRepodata: K8SREPODATA): K8SREPODATADISPLAY {
    return {
      name: k8sRepodata.name,
      identifier: k8sRepodata._id,
      url: k8sRepodata.url,
      type: k8sRepodata.type,
      created: this.sharedService.convertEpochTime(Number(k8sRepodata._admin.created)),
      modified: this.sharedService.convertEpochTime(Number(k8sRepodata._admin.modified)),
      pageType: 'repo'
    };
  }

  /** Fetching the data from server to Load in the smarttable @protected */
  protected generateData(): void {
    this.isLoadingResults = true;
    this.restService.getResource(environment.K8REPOS_URL).subscribe((k8sRepoDatas: K8SREPODATA[]) => {
      this.k8sRepoData = [];
      k8sRepoDatas.forEach((k8sRepodata: K8SREPODATA) => {
        const k8sRepoDataObj: K8SREPODATADISPLAY = this.generateK8sRepoData(k8sRepodata);
        this.k8sRepoData.push(k8sRepoDataObj);
      });
      if (this.k8sRepoData.length > 0) {
        this.checkDataClass = 'dataTables_present';
      } else {
        this.checkDataClass = 'dataTables_empty';
      }
      this.dataSource.load(this.k8sRepoData).then((data: boolean) => {
        this.isLoadingResults = false;
      }).catch(() => {
        this.isLoadingResults = false;
      });
    }, (error: ERRORDATA) => {
      this.restService.handleError(error, 'get');
      this.isLoadingResults = false;
    });
  }

}
