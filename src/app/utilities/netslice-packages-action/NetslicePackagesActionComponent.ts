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
 * @file Netslice-packagesAction Component
 */
import { Component, Injector } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { MODALCLOSERESPONSEDATA } from 'CommonModel';
import { DeleteComponent } from 'DeleteComponent';
import { InstantiateNetSliceTemplateComponent } from 'InstantiateNetSliceTemplate';
import { NetworkSliceData } from 'NetworkSliceModel';
import { SharedService } from 'SharedService';
import { ShowInfoComponent } from 'ShowInfoComponent';

/**
 * Creating component
 * @Component takes NetslicePackagesActionComponent.html as template url
 */
@Component({
    selector: 'app-netslice-packages-action',
    templateUrl: './NetslicePackagesActionComponent.html',
    styleUrls: ['./NetslicePackagesActionComponent.scss']
})
/** Exporting a class @exports NetslicePackagesActionComponent */
export class NetslicePackagesActionComponent {
    /** To get the value from the vnfpackage via valuePrepareFunction default Property of ng-smarttable @public */
    public value: NetworkSliceData;

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

    /** Lifecyle Hooks the trigger before component is instantiate @public */
    public ngOnInit(): void {
        this.instanceID = this.value.identifier;
    }

    /** Delete NetSliceTemplate packages @public */
    public deleteNetSliceTemplate(): void {
        // eslint-disable-next-line security/detect-non-literal-fs-filename
        const modalRef: NgbModalRef = this.modalService.open(DeleteComponent, {backdrop: 'static'});
        modalRef.result.then((result: MODALCLOSERESPONSEDATA) => {
            if (result) {
                this.sharedService.callData();
            }
        }).catch((): void => {
            // Catch Navigation Error
        });
    }

    /** Shows information using modalservice @public */
    public infoNetSlice(): void {
        // eslint-disable-next-line security/detect-non-literal-fs-filename
        this.modalService.open(ShowInfoComponent, { backdrop: 'static' }).componentInstance.params = {
            id: this.instanceID,
            page: 'net-slice-package',
            titleName: 'PAGE.NETSLICETEMPLATE.NETSLICETEMPLATEDETAILS'
        };
    }

    /** Set Edit for the  @public */
    public netSliceEdit(): void {
        this.router.navigate(['/packages/netslice/edit/', this.instanceID]).catch(() => {
            // Catch Navigation Error
        });
    }

    /** Instantiate Net Slice using modalservice @public */
    public instantiateNetSlice(): void {
        // eslint-disable-next-line security/detect-non-literal-fs-filename
        this.modalService.open(InstantiateNetSliceTemplateComponent, { backdrop: 'static' });
    }
}
