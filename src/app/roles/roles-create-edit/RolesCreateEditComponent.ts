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
 * @file Roles Create and Edit Component
 */
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Component, Injector, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { NotifierService } from 'angular-notifier';
import { APIURLHEADER, ERRORDATA } from 'CommonModel';
import { environment } from 'environment';
import * as jsonpath from 'jsonpath';
import { RestService } from 'RestService';
import { Permission, PermissionGroup, RoleConfig, RoleData } from 'RolesModel';
import { SharedService } from 'SharedService';
import { isNullOrUndefined } from 'util';

/**
 * Creating component
 * @Component takes RolesCreateEditComponent.html as template url
 */
@Component({
  selector: 'app-roles-create-edit',
  templateUrl: './RolesCreateEditComponent.html',
  styleUrls: ['./RolesCreateEditComponent.scss']
})
/** Exporting a class @exports RolesCreateEditComponent */
export class RolesCreateEditComponent implements OnInit {
  /** To inject services @public */
  public injector: Injector;

  /** contains role permissions from config file @public */
  public rolePermissions: {}[];

  /** contains role form group information @public */
  public roleForm: FormGroup;

  /** Instance of the rest service @public */
  public restService: RestService;

  /** Check the loading results for loader status @public */
  public isLoadingResults: boolean = false;

  /** Give the message for the loading @public */
  public message: string = 'PLEASEWAIT';

  /** Instance to check role form submitted status @public */
  public submitted: boolean = false;

  /** Contains role create or edit value @public */
  public getRoleType: string;

  /** Contains view selection value either text or preview @public */
  public viewMode: string = 'text';

  /** Contains role id value @private */
  private roleRef: string;

  /** Notifier service to popup notification @private */
  private notifierService: NotifierService;

  /** Contains tranlsate instance @private */
  private translateService: TranslateService;

  /** contians form builder module @private */
  private formBuilder: FormBuilder;

  /** Contains all methods related to shared @private */
  private sharedService: SharedService;

  /** Controls the header form @private */
  private headers: HttpHeaders;

  /** Varaibles to hold http client @private */
  private httpClient: HttpClient;

  /** Holds the instance of activatedRoute of router service @private */
  private activatedRoute: ActivatedRoute;

  /** Holds the instance of roter service @private */
  private router: Router;

  constructor(injector: Injector) {
    this.injector = injector;
    this.restService = this.injector.get(RestService);
    this.notifierService = this.injector.get(NotifierService);
    this.translateService = this.injector.get(TranslateService);
    this.formBuilder = this.injector.get(FormBuilder);
    this.sharedService = this.injector.get(SharedService);
    this.httpClient = this.injector.get(HttpClient);
    this.activatedRoute = this.injector.get(ActivatedRoute);
    this.router = this.injector.get(Router);
  }

  /** Lifecyle Hooks the trigger before component is instantiate @public */
  public ngOnInit(): void {
    this.headers = new HttpHeaders({
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0'
    });
    this.roleForm = this.formBuilder.group({
      roleName: ['', [Validators.required]],
      permissions: ['']
    });
    this.getRolePermissions();
  }

  /** Get role permission information based on action @public */
  public getRolePermissions(): void {
    this.isLoadingResults = true;
    this.loadPermissions().then((response: RoleConfig) => {
      this.rolePermissions = response.rolePermissions;
      if (this.activatedRoute.snapshot.url[0].path === 'create') {
        this.getRoleType = 'Add';
        this.isLoadingResults = false;
      } else {
        this.getRoleType = 'Edit';
        this.getRoleData();
      }
    }).catch(() => {
      // Empty Block
    });
  }

  /** Check Role Create or Edit and proceed action @public */
  public roleCheck(): void {
    this.submitted = true;
    if (!this.roleForm.valid) {
      const errorIp: Element = document.querySelector('.ng-invalid[formControlName]');
      if (errorIp) {
        errorIp.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    } else {
      if (this.getRoleType === 'Add') {
        this.createRole();
      } else {
        this.editRole();
      }
    }
  }

  /** Convenience getter for easy access to form fields */
  get f(): FormGroup['controls'] { return this.roleForm.controls; }

  /** Create role @private  */
  public createRole(): void {
    const apiURLHeader: APIURLHEADER = {
      url: environment.ROLES_URL,
      httpOptions: { headers: this.headers }
    };
    let permissionData: Object = {};
    this.sharedService.cleanForm(this.roleForm);
    if (!this.roleForm.invalid) {
      if (this.viewMode === 'preview') {
        this.isLoadingResults = true;
        permissionData = this.generatePermissions();
        this.roleCreateAPI(apiURLHeader, permissionData);
      } else {
        if (this.checkPermission()) {
          this.isLoadingResults = true;
          permissionData = this.roleForm.value.permissions !== '' ? JSON.parse(this.roleForm.value.permissions) : {};
          this.roleCreateAPI(apiURLHeader, permissionData);
        }
      }
    }
  }

  /** Method to handle role create API call @public */
  public roleCreateAPI(apiURLHeader: APIURLHEADER, permissionData: {}): void {
    const postData: {} = {
      name: this.roleForm.value.roleName,
      permissions: !isNullOrUndefined(permissionData) ? permissionData : {}
    };
    this.restService.postResource(apiURLHeader, postData).subscribe(() => {
      this.notifierService.notify('success', this.translateService.instant('PAGE.ROLES.CREATEDSUCCESSFULLY'));
      this.router.navigate(['/roles/details']).catch();
    }, (error: ERRORDATA) => {
      this.isLoadingResults = false;
      this.restService.handleError(error, 'post');
    });
  }

  /** Edit role  @private  */
  public editRole(): void {
    const apiURLHeader: APIURLHEADER = {
      url: environment.ROLES_URL + '/' + this.roleRef,
      httpOptions: { headers: this.headers }
    };
    let permissionData: Object = {};
    this.sharedService.cleanForm(this.roleForm);
    if (!this.roleForm.invalid) {
      if (this.viewMode === 'preview') {
        this.isLoadingResults = true;
        permissionData = this.generatePermissions();
        this.roleEditAPI(apiURLHeader, permissionData);
      } else {
        if (this.checkPermission()) {
          this.isLoadingResults = true;
          permissionData = this.roleForm.value.permissions !== '' ? JSON.parse(this.roleForm.value.permissions) : {};
          this.roleEditAPI(apiURLHeader, permissionData);
        }
      }
    }
  }

  /** Method to handle role edit API call */
  public roleEditAPI(apiURLHeader: APIURLHEADER, permissionData: {}): void {
    const postData: {} = {
      name: this.roleForm.value.roleName,
      permissions: !isNullOrUndefined(permissionData) ? permissionData : {}
    };
    this.restService.patchResource(apiURLHeader, postData).subscribe(() => {
      this.notifierService.notify('success', this.translateService.instant('PAGE.ROLES.UPDATEDSUCCESSFULLY'));
      this.router.navigate(['/roles/details']).catch();
    }, (error: ERRORDATA) => {
      this.isLoadingResults = false;
      this.restService.handleError(error, 'patch');
    });
  }

  /** Method to handle toggle role view selection @public */
  public viewSelection(): void {
    if (this.viewMode === 'text' && this.checkPermission()) {
      this.loadPermissions().then((response: RoleConfig) => {
        this.rolePermissions = response.rolePermissions;
        const permissions: {} = this.roleForm.value.permissions !== '' ? JSON.parse(this.roleForm.value.permissions) : {};
        this.filterRoleData(permissions);
        this.viewMode = 'preview';
      }).catch(() => {
        // Empty Block
      });
    } else {
      const rolePermission: {} = this.generatePermissions();
      if (Object.keys(rolePermission).length !== 0) {
        this.roleForm.patchValue({ permissions: JSON.stringify(rolePermission, null, '\t') });
      }
      this.viewMode = 'text';
    }

  }

  /** Generate role permission post data @private */
  private generatePermissions(): Object {
    const permissions: Object = {};
    this.rolePermissions.forEach((permissionGroup: PermissionGroup) => {
      if (!isNullOrUndefined(permissionGroup)) {
        permissionGroup.permissions.forEach((permission: Permission) => {
          if (!isNullOrUndefined(permission.value) && permission.value !== 'NA') {
            permissions[permission.operation] = permission.value;
          }
        });
      }
    });
    return permissions;
  }

  /** Validation method for check permission json string @private */
  private checkPermission(): boolean {
    if (this.roleForm.value.permissions) {
      if (!this.sharedService.checkJson(this.roleForm.value.permissions)) {
        this.notifierService.notify('error', this.translateService.instant('PAGE.ROLES.ROLEJSONERROR'));
        return false;
      } else {
        this.roleForm.value.permissions = this.roleForm.value.permissions.replace(/'/g, '"');
        const rolePermission: {} = JSON.parse(this.roleForm.value.permissions);
        for (const key of Object.keys(rolePermission)) {
          if (typeof rolePermission[key] !== 'boolean') {
            this.notifierService.notify('error', this.translateService.instant('PAGE.ROLES.ROLEKEYERROR', { roleKey: key }));
            return false;
          }
        }
      }
    }
    return true;
  }

  /** Get role data from NBI based on ID and apply filter @private */
  private getRoleData(): void {
    // tslint:disable-next-line: no-backbone-get-set-outside-model
    this.roleRef = this.activatedRoute.snapshot.paramMap.get('id');
    if (!isNullOrUndefined(this.roleRef)) {
      this.restService.getResource(environment.ROLES_URL + '/' + this.roleRef).subscribe((data: RoleData) => {
        this.roleForm.setValue({ roleName: data.name, permissions: JSON.stringify(data.permissions, null, '\t') });
        this.filterRoleData(data.permissions);
        this.isLoadingResults = false;
      }, (error: ERRORDATA) => {
        this.router.navigate(['/roles/details']).catch();
        this.restService.handleError(error, 'get');
      });
    }
  }

  /** Method to filter role data @private */
  private filterRoleData(permissions: {}): void {
    Object.keys(permissions).forEach((permission: string) => {
      jsonpath.apply(this.rolePermissions, '$..permissions[?(@.operation == "' + permission + '")]', (response: Permission) => {
        if (response.operation === permission) {
          response.value = permissions[permission];
        }
        return response;
      });
    });
  }

  /** Method to load the role permission Json file @private */
  private async loadPermissions(): Promise<Object> {
    const jsonFile: string = environment.PERMISSIONS_CONFIG_FILE + '?cb=' + new Date().getTime();
    return new Promise<Object>((resolve: Function, reject: Function): void => {
      this.httpClient.get(jsonFile).subscribe((response: Response) => {
        resolve(response);
      }, (error: {}) => {
        reject();
      });
    });
  }

}
