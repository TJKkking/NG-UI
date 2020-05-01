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
 * @file Vim AccountsAction Component
 */
import { Component, Injector, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { MODALCLOSERESPONSEDATA } from 'CommonModel';
import { DeleteComponent } from 'DeleteComponent';
import { NSInstanceDetails } from 'NSInstanceModel';
import { SharedService } from 'SharedService';
import { VIMData } from 'VimAccountModel';

/**
 * Creating component
 * @Component takes VimAccountsActionComponent.html as template url
 */
@Component({
    selector: 'app-vim-accounts-action',
    templateUrl: './VimAccountsActionComponent.html',
    styleUrls: ['./VimAccountsActionComponent.scss']
})
/** Exporting a class @exports VimAccountsActionComponent */
export class VimAccountsActionComponent implements OnInit {
    /** To get the value from the vimAccounts via valuePrepareFunction default Property of ng-smarttable @public */
    public value: VIMData;

    /** To inject services @public */
    public injector: Injector;

    /** To show Instances running @public */
    public showMapIcon: boolean =  false;

    /** To show Details Instances running @public */
    public showInstanceDetails: {}[];

    /** Instance of the modal service @private */
    private modalService: NgbModal;

    /** Holds teh instance of AuthService class of type AuthService @private */
    private router: Router;

    /** Variables holds NS ID @private */
    private vimID: string;

    /** Contains all methods related to shared @private */
    private sharedService: SharedService;

    constructor(injector: Injector) {
        this.injector = injector;
        this.modalService = this.injector.get(NgbModal);
        this.router = this.injector.get(Router);
        this.sharedService = this.injector.get(SharedService);
    }
    /** Lifecyle Hooks the trigger before component is instantiate @public */
    public ngOnInit(): void {
        this.getInstancesDetails();
    }

    /** Delete VIM Account @public */
    public deleteVIMAccount(): void {
        const modalRef: NgbModalRef = this.modalService.open(DeleteComponent, {backdrop: 'static'});
        modalRef.result.then((result: MODALCLOSERESPONSEDATA) => {
            if (result) {
                this.sharedService.callData();
            }
        }).catch();
    }

    /** On navigate to Info VimAccount @public */
    public vimInfo(): void {
        this.vimID = this.value.identifier;
        this.router.navigate(['/vim/info', this.vimID]).catch(() => {
            // Catch Navigation Error
          });
    }

    /** To show the Instances Info for the particular VimAccount @public */
    public getInstancesDetails(): void {
        this.showInstanceDetails = [];
        this.value.instancesData.filter((item: NSInstanceDetails) => {
            if (item.datacenter === this.value.identifier) {
                this.showMapIcon = true;
                this.showInstanceDetails.push(item);
            }
        });
    }
}
