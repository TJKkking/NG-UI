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

 Author: SANDHYA JS (sandhya.j@tataelxsi.co.in)
*/
/**
 * @file change password component
 */
import { Component, Injector, OnInit } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { AddEditUserComponent } from 'AddEditUserComponent';
import { MODALCLOSERESPONSEDATA } from 'CommonModel';
import { SharedService } from 'SharedService';

/**
 * Creating component
 * @Component takes ChangePasswordComponent.html as template url
 */
@Component({
    templateUrl: './ChangePasswordComponent.html',
    styleUrls: ['./ChangePasswordComponent.scss']
})
/** Exporting a class @exports ChangePasswordComponent */
export class ChangePasswordComponent implements OnInit {
    /** To inject services @public */
    public injector: Injector;

    /** handle translate @public */
    public translateService: TranslateService;

    /** Contains edit type data @public */
    public editType: string = 'changePassword';

    /** Contains all methods related to shared @private */
    private sharedService: SharedService;

    /** Instance of the modal service @private */
    private modalService: NgbModal;

    constructor(injector: Injector) {
        this.injector = injector;
        this.translateService = this.injector.get(TranslateService);
        this.sharedService = this.injector.get(SharedService);
        this.modalService = this.injector.get(NgbModal);
    }

    /** Lifecyle Hooks the trigger before component is instantiate @public */
    public ngOnInit(): void {
        const modalRef: NgbModalRef = this.modalService.open(AddEditUserComponent, { backdrop: 'static', keyboard: false });
        modalRef.componentInstance.userID = localStorage.getItem('user_id');
        if (this.editType === 'changePassword') {
            modalRef.componentInstance.userTitle = this.translateService.instant('PAGE.USERS.EDITCREDENTIALS');
        }
        modalRef.componentInstance.userType = this.editType;
        modalRef.result.then((result: MODALCLOSERESPONSEDATA): void => {
            if (result) {
                this.sharedService.callData();
            }
        }).catch((err: Error): void => { // catch error
        });
    }

}
