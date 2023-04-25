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
 * @file VNF-instancesAction Component
 */
import { Component, Injector } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { ShowInfoComponent } from 'ShowInfoComponent';
import { VNFInstanceData } from 'VNFInstanceModel';
/**
 * Creating component
 * @Component takes VNFInstancesActionComponent.html as template url
 */
@Component({
    templateUrl: './VNFInstancesActionComponent.html',
    styleUrls: ['./VNFInstancesActionComponent.scss']
})
/** Exporting a class @exports VNFInstancesActionComponent */
export class VNFInstancesActionComponent {
    /** To get the value from the vnfpackage via valuePrepareFunction default Property of ng-smarttable @public */
    public value: VNFInstanceData;

    /** Invoke service injectors @public */
    public injector: Injector;

    /** Instance of the modal service @private */
    private modalService: NgbModal;

    /** Contains instance ID @private */
    private instanceID: string;

    constructor(injector: Injector) {
        this.injector = injector;
        this.modalService = this.injector.get(NgbModal);
    }

    /**
     * Lifecyle Hooks the trigger before component is instantiate
     */
    public ngOnInit(): void {
        this.instanceID = this.value.identifier;
    }

    /** Shows information using modalservice @public */
    public infoVNF(): void {
        // eslint-disable-next-line security/detect-non-literal-fs-filename
        this.modalService.open(ShowInfoComponent, { backdrop: 'static' }).componentInstance.params = {
            id: this.instanceID,
            page: 'vnf-instance',
            titleName: 'INSTANCEDETAILS'
        };
    }
}
