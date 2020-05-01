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
 * @file WIM AccountsAction Component
 */
import { Component, Injector } from '@angular/core';
import { Router } from '@angular/router';
import { NgbActiveModal, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { MODALCLOSERESPONSEDATA } from 'CommonModel';
import { DeleteComponent } from 'DeleteComponent';
import { SharedService } from 'SharedService';
import { WIMAccountInfoComponent } from 'WIMAccountInfo';
import { WIMValue } from 'WIMAccountModel';

/**
 * Creating component
 * @Component takes WIMAccountsActionComponent.html as template url
 */
@Component({
    templateUrl: './WIMAccountsActionComponent.html',
    styleUrls: ['./WIMAccountsActionComponent.scss']
})
/** Exporting a class @exports WIMAccountsActionComponent */
export class WIMAccountsActionComponent {
    /** To get the value from the vnfpackage via valuePrepareFunction default Property of ng-smarttable @public */
    public value: WIMValue;

    /** To inject services @public */
    public injector: Injector;

    /** Instance of the modal service @private */
    private modalService: NgbModal;

    /** Variables holds WIM ID @private */
    private wimID: string;

    /** Contains all methods related to shared @private */
    private sharedService: SharedService;

    constructor(injector: Injector) {
        this.injector = injector;
        this.modalService = this.injector.get(NgbModal);
        this.sharedService = this.injector.get(SharedService);
    }

    /** Lifecyle Hooks the trigger before component is instantiate @public */
    public ngOnInit(): void {
        this.wimID = this.value.identifier;
    }

    /** Show WIM account information @public */
    public showWIMAccountInfo(): void {
        this.modalService.open(WIMAccountInfoComponent, { backdrop: 'static' }).componentInstance.params = {
            id: this.wimID,
            page: 'wim-accounts'
        };
    }

    /** Delete WIM Account @public */
    public deleteWIMAccount(): void {
        const modalRef: NgbModalRef = this.modalService.open(DeleteComponent, { backdrop: 'static' });
        modalRef.result.then((result: MODALCLOSERESPONSEDATA) => {
            if (result) {
                this.sharedService.callData();
            }
        }).catch();
    }
}
