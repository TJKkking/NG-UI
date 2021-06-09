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
 * @file Projects Action Component
 */
import { Component, Injector } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { MODALCLOSERESPONSEDATA } from 'CommonModel';
import { DeleteComponent } from 'DeleteComponent';
import { ProjectCreateUpdateComponent } from 'ProjectCreateUpdate';
import { ProjectData } from 'ProjectModel';
import { SharedService } from 'SharedService';

/**
 * Creating component
 * @Component takes ProjectsActionComponent.html as template url
 */
@Component({
    selector: 'app-projects-action',
    templateUrl: './ProjectsActionComponent.html',
    styleUrls: ['./ProjectsActionComponent.scss']
})
/** Exporting a class @exports ProjectsActionComponent */
export class ProjectsActionComponent {
    /** To get the value from the nspackage via valuePrepareFunction default Property of ng-smarttable @public */
    public value: ProjectData;

    /** To inject services @public */
    public injector: Injector;

    /** Instance of the modal service @private */
    private modalService: NgbModal;

    /** Contains all methods related to shared @private */
    private sharedService: SharedService;

    constructor(injector: Injector) {
        this.injector = injector;
        this.modalService = this.injector.get(NgbModal);
        this.sharedService = this.injector.get(SharedService);
    }

    /** Delete project @public */
    public projectDelete(): void {
        const modalRef: NgbModalRef = this.modalService.open(DeleteComponent, { backdrop: 'static' });
        modalRef.result.then((result: MODALCLOSERESPONSEDATA) => {
            if (result) {
                this.sharedService.callData();
            }
        }).catch();
    }

    /** Edit project @public */
    public projectEdit(): void {
        const modalRef: NgbModalRef = this.modalService.open(ProjectCreateUpdateComponent, { size: 'lg', backdrop: 'static' });
        modalRef.componentInstance.projectType = 'Edit';
        modalRef.result.then((result: MODALCLOSERESPONSEDATA) => {
            if (result) {
                this.sharedService.callData();
            }
        }).catch();
    }
}
