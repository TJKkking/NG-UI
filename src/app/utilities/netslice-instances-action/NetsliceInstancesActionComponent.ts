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
 * @file Netslice InstancesAction Component
 */
import { Component, Injector } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { MODALCLOSERESPONSEDATA } from 'CommonModel';
import { DeleteComponent } from 'DeleteComponent';
import { NSTInstanceData } from 'NetworkSliceModel';
import { SharedService } from 'SharedService';
import { ShowInfoComponent } from 'ShowInfoComponent';
/**
 * Creating component
 * @Component takes NetsliceInstancesActionComponent.html as template url
 */
@Component({
    templateUrl: './NetsliceInstancesActionComponent.html',
    styleUrls: ['./NetsliceInstancesActionComponent.scss']
})
/** Exporting a class @exports NetsliceInstancesActionComponent */
export class NetsliceInstancesActionComponent {
    /** To get the value from the vnfpackage via valuePrepareFunction default Property of ng-smarttable @public */
    public value: NSTInstanceData;

    /** To inject services @public */
    public injector: Injector;

    /** Instance of the modal service @private */
    private modalService: NgbModal;

    /** Contains instance ID @private */
    private instanceID: string;

    /** Service holds the router information @private */
    private router: Router;

    /** Contains all methods related to shared @private */
    private sharedService: SharedService;

    constructor(injector: Injector) {
        this.injector = injector;
        this.modalService = this.injector.get(NgbModal);
        this.router = this.injector.get(Router);
        this.sharedService = this.injector.get(SharedService);
    }
    /**
     * Lifecyle Hooks the trigger before component is instantiate
     */
    public ngOnInit(): void {
        this.instanceID = this.value.identifier;
    }

    /** Shows information using modalservice @public */
    public infoNetSliceInstance(): void {
        this.modalService.open(ShowInfoComponent, { backdrop: 'static' }).componentInstance.params = {
            id: this.instanceID,
            page: 'net-slice-instance',
            titleName: 'PAGE.NETSLICETEMPLATE.NETSLICETEMPLATEDETAILS'
        };
    }

    /** Delete NetSlice Instance packages @public */
    public deleteNetSliceInstance(forceAction: boolean): void {
        const modalRef: NgbModalRef = this.modalService.open(DeleteComponent, { backdrop: 'static' });
        modalRef.componentInstance.params = {forceDeleteType: forceAction};
        modalRef.result.then((result: MODALCLOSERESPONSEDATA) => {
            if (result) {
                this.sharedService.callData();
            }
        }).catch();
    }
    /** History of operations for an Instanace @public */
    public historyOfOperations(): void {
        this.router.navigate(['/instances/netslice/history-operations/', this.instanceID]).catch(() => {
            // Catch Navigation Error
        });
    }
}
