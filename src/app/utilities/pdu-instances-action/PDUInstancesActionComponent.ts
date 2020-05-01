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
 * @file PDUInstancesActionComponent Component
 */
import { Component, Injector } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { MODALCLOSERESPONSEDATA } from 'CommonModel';
import { DeleteComponent } from 'DeleteComponent';
import { PDUInstanceDetails } from 'PDUInstanceModel';
import { SharedService } from 'SharedService';
import { ShowInfoComponent } from 'ShowInfoComponent';

/**
 * Creating component
 * @Component takes PDUInstancesActionComponent.html as template url
 */
@Component({
    templateUrl: './PDUInstancesActionComponent.html',
    styleUrls: ['./PDUInstancesActionComponent.scss']
})
/** Exporting a class @exports PDUInstancesActionComponent */
export class PDUInstancesActionComponent {
    /** To get the value from the PDU Instances via valuePrepareFunction default Property of ng-smarttable @public */
    public value: PDUInstanceDetails;

    /** To inject services @public */
    public injector: Injector;

    /** Instance of the modal service @private */
    private modalService: NgbModal;

    /** Contains PDU Instance ID @private */
    private pduInstanceID: string;

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

    /** Lifecyle Hooks the trigger before component is instantiate @public */
    public ngOnInit(): void {
        this.pduInstanceID = this.value.identifier;
    }

    /** Delete PDU Instances @public */
    public deletePDUInstance(): void {
        const modalRef: NgbModalRef = this.modalService.open(DeleteComponent, {backdrop: 'static'});
        modalRef.result.then((result: MODALCLOSERESPONSEDATA) => {
            if (result) {
                this.sharedService.callData();
            }
        }).catch();
    }

    /** Shows PDU Instances information using modalservice @public */
    public showInfo(): void {
        this.modalService.open(ShowInfoComponent, { backdrop: 'static' }).componentInstance.params = {
            id: this.pduInstanceID,
            page: 'pdu-instances',
            titleName: 'INSTANCEDETAILS'
        };
    }
}
