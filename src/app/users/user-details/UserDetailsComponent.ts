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
 * @file users details Component.
 */
import { Component, Injector, OnDestroy, OnInit } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { AddEditUserComponent } from 'AddEditUserComponent';
import { ERRORDATA, MODALCLOSERESPONSEDATA } from 'CommonModel';
import { DataService } from 'DataService';
import { environment } from 'environment';
import { LocalDataSource } from 'ng2-smart-table';
import { ProjectService } from 'ProjectService';
import { RestService } from 'RestService';
import { Subscription } from 'rxjs';
import { SharedService } from 'SharedService';
import { UserData, UserDetail } from 'UserModel';
import { UsersActionComponent } from 'UsersActionComponent';

/**
 * Creating component
 * @Component takes UserDetailsComponent.html as template url
 */
@Component({
  templateUrl: './UserDetailsComponent.html',
  styleUrls: ['./UserDetailsComponent.scss']
})
/** Exporting a class @exports UserDetailsComponent */
export class UserDetailsComponent implements OnInit, OnDestroy {
  /** Data of smarttable populate through LocalDataSource @public */
  public dataSource: LocalDataSource = new LocalDataSource();

  /** handle translate @public */
  public translateService: TranslateService;

  /** To inject services @public */
  public injector: Injector;

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

  /** Instance of the modal service @private */
  private modalService: NgbModal;

  /** Formation of appropriate Data for LocalDatasource @private */
  private userData: {}[] = [];

  /** Contains all methods related to shared @private */
  private sharedService: SharedService;

  /** Holds all project details */
  private projectService: ProjectService;

  /** holds the project information @private */
  private projectList: {}[] = [];

  /** Columns list of the smart table @public */
  private columnLists: object = {};

  /** Instance of subscriptions @private */
  private generateDataSub: Subscription;

  constructor(injector: Injector) {
    this.injector = injector;
    this.restService = this.injector.get(RestService);
    this.dataService = this.injector.get(DataService);
    this.sharedService = this.injector.get(SharedService);
    this.modalService = this.injector.get(NgbModal);
    this.projectService = this.injector.get(ProjectService);
    this.translateService = this.injector.get(TranslateService);
  }

  /**
   * Lifecyle Hooks the trigger before component is instantiate
   */
  public ngOnInit(): void {
    this.projectService.getAllProjects().subscribe((projects: {}[]) => {
      this.projectList = projects;
    });
    this.generateColumns();
    this.generateSettings();
    this.generateData();
    this.generateDataSub = this.sharedService.dataEvent.subscribe(() => { this.generateData(); });
  }

  /** smart table Header Colums @public */
  public generateColumns(): void {
    this.columnLists = {
      username: { title: this.translateService.instant('NAME'), width: '20%', sortDirection: 'asc' },
      projects: { title: this.translateService.instant('PAGE.DASHBOARD.PROJECTS'), width: '25%' },
      identifier: { title: this.translateService.instant('IDENTIFIER'), width: '20%' },
      modified: { title: this.translateService.instant('MODIFIED'), width: '15%' },
      created: { title: this.translateService.instant('CREATED'), width: '15%' },
      Actions: {
        name: 'Action', width: '5%', filter: false, sort: false, title: this.translateService.instant('ACTIONS'), type: 'custom',
        valuePrepareFunction: (cell: UserData, row: UserData): UserData => row,
        renderComponent: UsersActionComponent
      }
    };
  }

  /** smart table Data Settings @public */
  public generateSettings(): void {
    this.settings = {
      edit: { editButtonContent: '<i class="fa fa-edit" title="Edit"></i>', confirmSave: true },
      delete: { deleteButtonContent: '<i class="far fa-trash-alt" title="delete"></i>', confirmDelete: true },
      columns: this.columnLists,
      actions: { add: false, edit: false, delete: false, position: 'right' },
      attr: this.sharedService.tableClassConfig(),
      pager: this.sharedService.paginationPagerConfig(),
      noDataMessage: this.translateService.instant('NODATAMSG')
    };
  }

  /** on Navigate to Composer Page @public */
  public composeUser(): void {
    const modalRef: NgbModalRef = this.modalService.open(AddEditUserComponent, { backdrop: 'static' });
    modalRef.componentInstance.userTitle = this.translateService.instant('PAGE.USERS.NEWUSER');
    modalRef.componentInstance.userType = 'add';
    modalRef.result.then((result: MODALCLOSERESPONSEDATA) => {
      if (result) {
        this.sharedService.callData();
      }
    }).catch();
  }

  /** smart table listing manipulation @private */
  public onChange(perPageValue: number): void {
    this.dataSource.setPaging(1, perPageValue, true);
  }

  /** OnUserRowSelect function @private */
  public onUserRowSelect(event: MessageEvent): void {
    Object.assign(event.data, { page: 'users' });
    this.dataService.changeMessage(event.data);
  }

  /** Set up user details @public */
  public setUserDetails(userData: UserDetail): void {
    const userDataObj: UserData = {
      username: userData.username,
      modified: this.sharedService.convertEpochTime(userData._admin.modified),
      created: this.sharedService.convertEpochTime(userData._admin.created),
      projects: userData.projectListName,
      identifier: userData._id
    };
    this.userData.push(userDataObj);
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
    this.restService.getResource(environment.USERS_URL).subscribe((usersData: UserDetail[]) => {
      this.userData = [];
      usersData.forEach((userData: UserDetail) => {
        if (userData.projects.length > 0) {
          userData.projectListName = userData.projects.join(', ');
        } else {
          userData.projectListName = '';
        }
        this.setUserDetails(userData);
      });
      if (this.userData.length > 0) {
        this.checkDataClass = 'dataTables_present';
      } else {
        this.checkDataClass = 'dataTables_empty';
      }
      this.dataSource.load(this.userData).then((data: {}) => {
        this.isLoadingResults = false;
      }).catch();
    }, (error: ERRORDATA) => {
      this.restService.handleError(error, 'get');
      this.isLoadingResults = false;
    });
  }
}
