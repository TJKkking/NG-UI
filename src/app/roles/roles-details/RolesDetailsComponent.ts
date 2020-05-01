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
 * @file Roles Deatils component.
 */
import { Component, Injector, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { ERRORDATA } from 'CommonModel';
import { DataService } from 'DataService';
import { environment } from 'environment';
import { LocalDataSource } from 'ng2-smart-table';
import { RestService } from 'RestService';
import { RolesActionComponent } from 'RolesAction';
import { RoleData, RoleDetails } from 'RolesModel';
import { Subscription } from 'rxjs';
import { SharedService } from 'SharedService';

/**
 * Creating component
 * @Component takes RolesComponent.html as template url
 */
@Component({
  selector: 'app-roles-details',
  templateUrl: './RolesDetailsComponent.html',
  styleUrls: ['./RolesDetailsComponent.scss']
})
export class RolesDetailsComponent implements OnInit {
  /** To inject services @public */
  public injector: Injector;

  /** Formation of appropriate Data for LocalDatasource @public */
  public dataSource: LocalDataSource = new LocalDataSource();

  /** handle translate @public */
  public translateService: TranslateService;

  /** Columns list of the smart table @public */
  public columnLists: object = {};

  /** Settings for smarttable to populate the table with columns @public */
  public settings: object = {};

  /** Check the loading results @public */
  public isLoadingResults: boolean = true;

  /** Give the message for the loading @public */
  public message: string = 'PLEASEWAIT';

  /** Instance of the rest service @private */
  private restService: RestService;

  /** dataService to pass the data from one component to another @private */
  private dataService: DataService;

  /** Contains role details data @private */
  private roleData: RoleData[] = [];

  /** Contains all methods related to shared @private */
  private sharedService: SharedService;

   /** Instance of subscriptions @private */
  private generateDataSub: Subscription;

  /** Holds the instance of roter service @private */
  private router: Router;

  constructor(injector: Injector) {
    this.injector = injector;
    this.restService = this.injector.get(RestService);
    this.dataService = this.injector.get(DataService);
    this.sharedService = this.injector.get(SharedService);
    this.translateService = this.injector.get(TranslateService);
    this.router = this.injector.get(Router);
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
    this.columnLists = {
      name: { title: this.translateService.instant('NAME'), width: '30%', sortDirection: 'asc' },
      identifier: { title: this.translateService.instant('IDENTIFIER'), width: '35%' },
      modified: { title: this.translateService.instant('MODIFIED'), width: '15%' },
      created: { title: this.translateService.instant('CREATED'), width: '15%' },
      Actions: {
        name: 'Actions', width: '5%', filter: false, sort: false, type: 'custom',
        title: this.translateService.instant('ACTIONS'),
        valuePrepareFunction: (cell: RoleData, row: RoleData): RoleData => row,
        renderComponent: RolesActionComponent
      }
    };
  }

  /** smart table Data Settings @public */
  public generateSettings(): void {
    this.settings = {
      edit: {
        editButtonContent: '<i class="fa fa-edit" title="Edit"></i>',
        confirmSave: true
      },
      delete: {
        deleteButtonContent: '<i class="far fa-trash-alt" title="delete"></i>',
        confirmDelete: true
      },
      columns: this.columnLists,
      actions: {
        add: false,
        edit: false,
        delete: false,
        topology: false,
        position: 'right'
      },
      attr: this.sharedService.tableClassConfig(),
      pager: this.sharedService.paginationPagerConfig(),
      noDataMessage: this.translateService.instant('NODATAMSG')
    };
  }

  /** smart table listing manipulation @public */
  public onChange(perPageValue: number): void {
    this.dataSource.setPaging(1, perPageValue, true);
  }

  /** convert UserRowSelect Function @private */
  public onUserRowSelect(event: MessageEvent): void {
    Object.assign(event.data, { page: 'roles' });
    this.dataService.changeMessage(event.data);
  }

  /** Fetching the role data from API and Load it in the smarttable @public */
  public generateData(): void {
    this.isLoadingResults = true;
    this.roleData = [];
    this.restService.getResource(environment.ROLES_URL).subscribe((roleList: RoleDetails[]) => {
      roleList.forEach((role: RoleDetails) => {
        const roleDataObj: RoleData = this.generateRoleData(role);
        this.roleData.push(roleDataObj);
      });
      this.dataSource.load(this.roleData).then((data: boolean) => {
        this.isLoadingResults = false;
      }).catch();
    }, (error: ERRORDATA) => {
      this.restService.handleError(error, 'get');
      this.isLoadingResults = false;
    });
  }

  /** Generate role data object and return for the datasource @public */
  public generateRoleData(roleData: RoleDetails): RoleData {
    return {
      name: roleData.name,
      identifier: roleData._id,
      modified: this.sharedService.convertEpochTime(Number(roleData._admin.modified)),
      created: this.sharedService.convertEpochTime(Number(roleData._admin.created)),
      permissions: roleData.permissions
    };
  }

  /** Create role click handler @public */
  public createRole(): void {
    this.router.navigate(['/roles/create']).catch(() => {
      // Catch Navigation Error
    });
  }

  /** Lifecyle hook which get trigger on component destruction @private */
  public ngOnDestroy(): void {
    this.generateDataSub.unsubscribe();
  }

}
