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
 * @file SDN Controller Action Component
 */
import { Component, Injector } from '@angular/core';
import { Router } from '@angular/router';
import { NgbActiveModal, NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { MODALCLOSERESPONSEDATA } from 'CommonModel';
import { DeleteComponent } from 'DeleteComponent';
import { SDNControllerInfoComponent } from 'SDNControllerInfoComponent';
import { SDNControllerList } from 'SDNControllerModel';
import { SharedService } from 'SharedService';

/**
 * Creating component
 * @Component takes SDNControllerActionComponent.html as template url
 */
@Component({
    templateUrl: './SDNControllerActionComponent.html',
    styleUrls: ['./SDNControllerActionComponent.scss']
})
/** Exporting a class @exports SDNControllerActionComponent */
export class SDNControllerActionComponent {
    /** To get the value from the vnfpackage via valuePrepareFunction default Property of ng-smarttable @public */
    public value: SDNControllerList;

    /** To inject services @public */
    public injector: Injector;

    /** Instance of the modal service @private */
    private modalService: NgbModal;

    /** Variables holds SDN ID @private */
    private sdnID: string;

    /** Contains all methods related to shared @private */
    private sharedService: SharedService;

    constructor(injector: Injector) {
        this.injector = injector;
        this.modalService = this.injector.get(NgbModal);
        this.sharedService = this.injector.get(SharedService);
    }

    /** Lifecyle Hooks the trigger before component is instantiate @public */
    public ngOnInit(): void {
        this.sdnID = this.value.identifier;
    }

    /** Show SDN Controller Information @public */
    public showSDNControllerInfo(): void {
        this.modalService.open(SDNControllerInfoComponent, { backdrop: 'static' }).componentInstance.params = {
            id: this.sdnID,
            page: 'sdn-controller'
        };
    }

    /** Delete SDN Controller @public */
    public deleteSDNController(): void {
        const modalRef: NgbModalRef = this.modalService.open(DeleteComponent, { backdrop: 'static' });
        modalRef.result.then((result: MODALCLOSERESPONSEDATA) => {
            if (result) {
                this.sharedService.callData();
            }
        }).catch();
    }
}
