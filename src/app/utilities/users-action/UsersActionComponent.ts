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
 * @file Users Action Component
 */
import { isNullOrUndefined } from 'util';
import { Component, Injector } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { AddEditUserComponent } from 'AddEditUserComponent';
import { MODALCLOSERESPONSEDATA } from 'CommonModel';
import { DeleteComponent } from 'DeleteComponent';
import { ProjectRoleComponent } from 'ProjectRoleComponent';
import { SharedService } from 'SharedService';
import { UserData } from 'UserModel';
import { WarningComponent } from 'WarningComponent';
/**
 * Creating component
 * @Component takes UsersActionComponent.html as template url
 */
@Component({
    templateUrl: './UsersActionComponent.html',
    styleUrls: ['./UsersActionComponent.scss']
})
/** Exporting a class @exports UsersActionComponent */
export class UsersActionComponent {
    /** To inject services @public */
    public injector: Injector;

    /** To get the value from the Users action via valuePrepareFunction default Property of ng-smarttable @public */
    public value: UserData;

    /** handle translate @public */
    public translateService: TranslateService;

    /** Admin Visibility Check @public */
    public isAdminShow: boolean;

    /** User Visibility Check @public */
    public isUserShow: boolean;

    /** User Status Check @public */
    public isUserStatus: string;

    /** Instance of the modal service @private */
    private modalService: NgbModal;

    /** Contains all methods related to shared @private */
    private sharedService: SharedService;

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
        this.isAdminShow = localStorage.getItem('admin_show') === 'true' ? true : false;
        this.isUserShow = localStorage.getItem('user_show') === 'true' ? true : false;
        if (!isNullOrUndefined(this.value.user_status)) {
            this.isUserStatus = this.value.user_status;
        }
    }

    /** Delete User Account @public */
    public deleteUser(): void {
        // eslint-disable-next-line security/detect-non-literal-fs-filename
        const modalRef: NgbModalRef = this.modalService.open(DeleteComponent, { backdrop: 'static' });
        modalRef.result.then((result: MODALCLOSERESPONSEDATA) => {
            if (result) {
                this.sharedService.callData();
            }
        }).catch((): void => {
            // Catch Navigation Error
        });
    }

    /** Edit User Account @public */
    public editUserModal(editType: string): void {
        // eslint-disable-next-line security/detect-non-literal-fs-filename
        const modalRef: NgbModalRef = this.modalService.open(AddEditUserComponent, { backdrop: 'static' });
        modalRef.componentInstance.userID = this.value.identifier;
        if (editType === 'editPassword') {
            modalRef.componentInstance.userTitle = this.translateService.instant('PAGE.USERS.EDITCREDENTIALS');
        } else {
            modalRef.componentInstance.userTitle = this.translateService.instant('PAGE.USERS.EDITUSERNAME');
        }
        modalRef.componentInstance.userType = editType;
        modalRef.componentInstance.userName = this.value.username;
        modalRef.result.then((result: MODALCLOSERESPONSEDATA) => {
            if (result) {
                this.sharedService.callData();
            }
        }).catch((): void => {
            // Catch Navigation Error
        });
    }

    /** Edit User Account @public */
    public projectRolesModal(): void {
        // eslint-disable-next-line security/detect-non-literal-fs-filename
        const modalRef: NgbModalRef = this.modalService.open(ProjectRoleComponent, { backdrop: 'static' });
        modalRef.componentInstance.userID = this.value.identifier;
        modalRef.componentInstance.userTitle = this.translateService.instant('PAGE.USERS.EDITPROJECTROLEMAPPING');
        modalRef.result.then((result: MODALCLOSERESPONSEDATA) => {
            if (result) {
                this.sharedService.callData();
            }
        }).catch((): void => {
            // Catch Navigation Error
        });
    }

    /** To Unlock or Renew User @public */
    public unlockRenewUser(editType: string): void {
        // eslint-disable-next-line security/detect-non-literal-fs-filename
        const modalRef: NgbModalRef = this.modalService.open(WarningComponent, { backdrop: 'static' });
        localStorage.setItem('renew', 'true');
        const id: string = localStorage.getItem('user_id');
        if (editType === 'unlock') {
            modalRef.componentInstance.heading = this.translateService.instant('Unlock User');
            modalRef.componentInstance.confirmationMessage = this.translateService.instant('Are you sure want to unlock this user');
            modalRef.componentInstance.submitMessage = this.translateService.instant('Unlock');
            modalRef.componentInstance.action = Boolean(true);
            modalRef.componentInstance.editType = editType;
            modalRef.componentInstance.id = this.value.identifier;
        } else {
            modalRef.componentInstance.heading = this.translateService.instant('Renew User');
            modalRef.componentInstance.confirmationMessage = this.translateService.instant('Are you sure want to renew this user');
            modalRef.componentInstance.submitMessage = this.translateService.instant('Renew');
            modalRef.componentInstance.action = Boolean(true);
            modalRef.componentInstance.editType = editType;
            modalRef.componentInstance.id = this.value.identifier;
        }
        modalRef.result.then((result: MODALCLOSERESPONSEDATA): void => {
            if (result) {
                this.sharedService.callData();
            }
        }).catch((): void => {
            // Catch Navigation Error
        });
    }
}
