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
 * @file OsmRepositoriesActionComponent.ts
 */
import { Component, Injector, OnInit } from '@angular/core';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { MODALCLOSERESPONSEDATA } from 'CommonModel';
import { DeleteComponent } from 'DeleteComponent';
import { OsmRepoCreateUpdateComponent } from 'OsmRepoCreateUpdate';
import { OSMRepoData } from 'OsmRepoModel';
import { SharedService } from 'SharedService';
/**
 * Creating Component
 * @Component takes OsmRepositoriesActionComponent.html as template url
 */
@Component({
  selector: 'app-osm-repositories-action',
  templateUrl: './OsmRepositoriesActionComponent.html',
  styleUrls: ['./OsmRepositoriesActionComponent.scss']
})
/** Exporting a class @exports OsmRepositoriesActionComponent */
export class OsmRepositoriesActionComponent implements OnInit {
  /** To get the value from the osm repo via valuePrepareFunction default Property of ng-smarttable @public */
  public value: OSMRepoData;

  /** To inject services @public */
  public injector: Injector;

  /** Variables holds OSM repo name @public */
  public osmrepoName: string;

  /** Variables holds OSM repo id @public */
  public identifier: string;

  /** Instance of the modal service @private */
  private modalService: NgbModal;

  /** Contains all methods related to shared @private */
  private sharedService: SharedService;

  constructor(injector: Injector) {
    this.injector = injector;
    this.sharedService = this.injector.get(SharedService);
    this.modalService = this.injector.get(NgbModal);
  }

  /** Lifecyle Hooks the trigger before component is instantiate @public */
  public ngOnInit(): void {
    this.osmrepoName = this.value.name;
    this.identifier = this.value.identifier;
  }

  /** Delete OSM Repository @public */
  public deleteOsmRepository(): void {
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

  /** Edit a osm repo @public */
  public editOsmrepo(id: string): void {
    // eslint-disable-next-line security/detect-non-literal-fs-filename
    const modalRef: NgbModalRef = this.modalService.open(OsmRepoCreateUpdateComponent, { backdrop: 'static' });
    modalRef.componentInstance.createupdateType = 'Edit';
    modalRef.componentInstance.osmrepoid = id;
    modalRef.result.then((result: MODALCLOSERESPONSEDATA) => {
      if (result) {
        this.sharedService.callData();
      }
    }).catch((): void => {
      // Catch Navigation Error
  });
  }
}
