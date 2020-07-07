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
 * @file OsmRepositoriesDetailsComponent.ts
 */
import { Component, Injector, OnDestroy, OnInit } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { ERRORDATA, MODALCLOSERESPONSEDATA, OSMREPO_TYPES } from 'CommonModel';
import { DataService } from 'DataService';
import { environment } from 'environment';
import { LocalDataSource } from 'ng2-smart-table';
import { OsmRepoCreateUpdateComponent } from 'OsmRepoCreateUpdate';
import { OSMRepoData, OSMRepoDetails } from 'OsmRepoModel';
import { OsmRepositoriesActionComponent } from 'OsmRepositoriesAction';
import { RestService } from 'RestService';
import { Subscription } from 'rxjs';
import { SharedService } from 'SharedService';
/**
 * Creating Component
 * @Component takes OsmRepositoriesComponent.html as template url
 */
@Component({
  selector: 'app-osm-repositories-details',
  templateUrl: './OsmRepositoriesDetailsComponent.html',
  styleUrls: ['./OsmRepositoriesDetailsComponent.scss']
})
export class OsmRepositoriesDetailsComponent implements OnInit {
  /** To inject services @public */
  public injector: Injector;

  /** handle translate @public */
  public translateService: TranslateService;

  /** Data of smarttable populate through LocalDataSource @public */
  public dataSource: LocalDataSource = new LocalDataSource();

  /** Columns list of the smart table @public */
  public columnLists: object = {};

  /** Settings for smarttable to populate the table with columns @public */
  public settings: object = {};

  /** Check the loading results @public */
  public isLoadingResults: boolean = true;

  /** Give the message for the loading @public */
  public message: string = 'PLEASEWAIT';

  /** Contains osm repo details data @public */
  public osmRepoData: OSMRepoData[] = [];

  /** Instance of the rest service @private */
  private restService: RestService;

  /** dataService to pass the data from one component to another @private */
  private dataService: DataService;

  /** Instance of the modal service @private */
  private modalService: NgbModal;

  /** Contains all methods related to shared @private */
  private sharedService: SharedService;

  /** Instance of subscriptions @private */
  private generateDataSub: Subscription;

  // creates osm repository component
  constructor(injector: Injector) {
    this.injector = injector;
    this.restService = this.injector.get(RestService);
    this.dataService = this.injector.get(DataService);
    this.sharedService = this.injector.get(SharedService);
    this.modalService = this.injector.get(NgbModal);
    this.translateService = this.injector.get(TranslateService);
  }

  /** Lifecyle Hooks the trigger before component is instantiate @public */
  public ngOnInit(): void {
    this.generateColumns();
    this.generateSettings();
    this.generateData();
    this.generateDataSub = this.sharedService.dataEvent.subscribe(() => { this.generateData(); });
  }

  /** smart table listing manipulation @private */
  public onChange(perPageValue: number): void {
    this.dataSource.setPaging(1, perPageValue, true);
  }

  /** convert UserRowSelect Function @private */
  public onUserRowSelect(event: MessageEvent): void {
    Object.assign(event.data, { page: 'osmrepo' });
    this.dataService.changeMessage(event.data);
  }

  /** smart table Header Colums @public */
  public generateColumns(): void {
    this.columnLists = {
      name: { title: this.translateService.instant('NAME'), width: '15%', sortDirection: 'asc' },
      identifier: { title: this.translateService.instant('IDENTIFIER'), width: '15%' },
      url: { title: this.translateService.instant('URL'), width: '15%' },
      type: {
        title: this.translateService.instant('TYPE'), width: '15%',
        filter: {
          type: 'list',
          config: {
            selectText: 'Select',
            list: OSMREPO_TYPES
          }
        }
      },
      modified: { title: this.translateService.instant('MODIFIED'), width: '15%' },
      created: { title: this.translateService.instant('CREATED'), width: '15%' },
      Actions: {
        name: 'Action', width: '10%', filter: false, sort: false, type: 'custom',
        title: this.translateService.instant('ACTIONS'),
        valuePrepareFunction: (cell: OSMRepoData, row: OSMRepoData): OSMRepoData => row,
        renderComponent: OsmRepositoriesActionComponent
      }
    };
  }

  /** smart table Data Settings @public */
  public generateSettings(): void {
    this.settings = {
      columns: this.columnLists,
      actions: {
        add: false,
        edit: false,
        delete: false,
        position: 'right'
      },
      attr: this.sharedService.tableClassConfig(),
      pager: this.sharedService.paginationPagerConfig(),
      noDataMessage: this.translateService.instant('NODATAMSG')
    };
  }

  /** Generate osmRepoData object from loop and return for the datasource @public */
  public generateOsmRepoData(osmRepo: OSMRepoDetails): OSMRepoData {
    return {
      name: osmRepo.name,
      identifier: osmRepo._id,
      url: osmRepo.url,
      type: osmRepo.type,
      description: osmRepo.description,
      modified: this.sharedService.convertEpochTime(Number(osmRepo._admin.modified)),
      created: this.sharedService.convertEpochTime(Number(osmRepo._admin.created))
    };
  }

  /** Create a osm repo @public */
  public addOsmrepo(): void {
    const modalRef: NgbModalRef = this.modalService.open(OsmRepoCreateUpdateComponent, { backdrop: 'static' });
    modalRef.componentInstance.createupdateType = 'Add';
    modalRef.result.then((result: MODALCLOSERESPONSEDATA) => {
      if (result) {
        this.generateData();
      }
    }).catch();
  }

  /**
   * Lifecyle hook which get trigger on component destruction
   */
  public ngOnDestroy(): void {
    this.generateDataSub.unsubscribe();
  }

  /** Fetching the data from server to Load in the smarttable @protected */
  protected generateData(): void {
    this.isLoadingResults = true;
    this.restService.getResource(environment.OSMREPOS_URL).subscribe((osmRepoData: OSMRepoDetails[]) => {
      this.osmRepoData = [];
      osmRepoData.forEach((osmRepo: OSMRepoDetails) => {
        const osmRepoDataObj: OSMRepoData = this.generateOsmRepoData(osmRepo);
        this.osmRepoData.push(osmRepoDataObj);
      });
      this.dataSource.load(this.osmRepoData).then((data: boolean) => {
        this.isLoadingResults = false;
      }).catch();
    }, (error: ERRORDATA) => {
      this.restService.handleError(error, 'get');
      this.isLoadingResults = false;
    });
  }
}
