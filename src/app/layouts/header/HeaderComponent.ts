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
 * @file Header Component
 */
import { Component, Injector, OnInit } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { AddEditUserComponent } from 'AddEditUserComponent';
import { AuthenticationService } from 'AuthenticationService';
import { MODALCLOSERESPONSEDATA } from 'CommonModel';
import { environment } from 'environment';
import { ProjectService } from 'ProjectService';
import { Observable } from 'rxjs';
import { SharedService } from 'SharedService';
import { UserSettingsComponent } from 'UserSettingsComponent';

/**
 * Creating component
 * @Component takes HeaderComponent.html as template url
 */
@Component({
    selector: 'app-header',
    templateUrl: './HeaderComponent.html',
    styleUrls: ['./HeaderComponent.scss']
})
/** Exporting a class @exports HeaderComponent */
export class HeaderComponent implements OnInit {
    /** Invoke service injectors @public */
    public injector: Injector;

    /** Variables holds all the projects @public */
    public projectList$: Observable<{}[]>;

    /** Observable holds logined value  @public */
    public username$: Observable<string>;

    /** Variables holds admin is logged or not @public */
    public isAdmin: boolean;

    /** Variables holds the selected project @public */
    public selectedProject: Observable<string>;

    /** project @public */
    public getSelectedProject: string;

    /** Version holds packages version @public */
    public PACKAGEVERSION: string;

    /** To check the role of the user is systemadmin or not @public */
    public isSystemAdmin: boolean;

    /** Contains all methods related to shared @public */
    public sharedService: SharedService;

    /** Property contains to show new version tag shared @public */
    public toShowNewTag: Boolean = false;

    /** handle translate @public */
    public translateService: TranslateService;

    /** Utilizes auth service for any auth operations @private */
    private authService: AuthenticationService;

    /** Holds all project details @private */
    private projectService: ProjectService;

    /** Utilizes modal service for any modal operations @private */
    private modalService: NgbModal;

    constructor(injector: Injector) {
        this.injector = injector;
        this.authService = this.injector.get(AuthenticationService);
        this.modalService = this.injector.get(NgbModal);
        this.projectService = this.injector.get(ProjectService);
        this.sharedService = this.injector.get(SharedService);
        this.translateService = this.injector.get(TranslateService);
    }

    /** Lifecyle Hooks the trigger before component is instantiate @public */
    public ngOnInit(): void {
        this.isAdmin = (localStorage.getItem('isAdmin') === 'true') ? true : false;
        this.isSystemAdmin = localStorage.getItem('admin_show') === 'true' ? true : false;
        this.selectedProject = this.authService.ProjectName;
        this.authService.ProjectName.subscribe((projectNameFinal: string): void => {
            this.getSelectedProject = projectNameFinal;
        });
        this.username$ = this.authService.username;
        this.projectService.setHeaderProjects();
        this.projectList$ = this.projectService.projectList;
        this.PACKAGEVERSION = environment.packageVersion;
        const getLocalStorageVersion: string = localStorage.getItem('osmVersion');
        if (getLocalStorageVersion === null) {
            this.showNewVersion();
        } else if (getLocalStorageVersion !== this.sharedService.osmVersion) {
            this.showNewVersion();
        }
    }

    /** Logout function  @public */
    public logout(): void {
        this.authService.logout();
    }

    /** Show Version function  @public */
    public showNewVersion(): void {
        this.toShowNewTag = true;
    }

    /** Close Version and add in local storage  @public */
    public closeVersion(): void {
        this.toShowNewTag = false;
        localStorage.setItem('osmVersion', this.sharedService.osmVersion);
    }

    /** Implementation of model for UserSettings options.@public */
    public userSettings(): void {
        // eslint-disable-next-line security/detect-non-literal-fs-filename
        this.modalService.open(UserSettingsComponent, { backdrop: 'static' });
    }

    /** ChangePassword Function @public */
    public changePassword(): void {
        // eslint-disable-next-line security/detect-non-literal-fs-filename
        const modalRef: NgbModalRef = this.modalService.open(AddEditUserComponent, { backdrop: 'static' });
        modalRef.componentInstance.userID = localStorage.getItem('user_id');
        modalRef.componentInstance.userTitle = this.translateService.instant('PAGE.USERS.EDITCREDENTIALS');
        modalRef.componentInstance.userType = 'changePassword';
        modalRef.result.then((result: MODALCLOSERESPONSEDATA): void => {
            if (result) {
                this.sharedService.callData();
            }
        }).catch((): void => {
            // Catch Navigation Error
        });
    }
}
