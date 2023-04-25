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
 * @file Roles Action Component
 */
import { Component, Injector } from '@angular/core';
import { Router } from '@angular/router';
import { NgbModal, NgbModalRef } from '@ng-bootstrap/ng-bootstrap';
import { MODALCLOSERESPONSEDATA } from 'CommonModel';
import { DeleteComponent } from 'DeleteComponent';
import { RoleData } from 'RolesModel';
import { SharedService } from 'SharedService';

/**
 * Creating component
 * @Component takes RolesActionComponent.html as template url
 */
@Component({
  selector: 'app-roles-action',
  templateUrl: './RolesActionComponent.html',
  styleUrls: ['./RolesActionComponent.scss']
})
/** Exporting a class @exports RolesActionComponent */
export class RolesActionComponent {
  /** To get the role data via valuePrepareFunction default Property of ng-smarttable @public */
  public value: RoleData;

  /** To inject services @public */
  public injector: Injector;

  /** Instance of the modal service @private */
  private modalService: NgbModal;

  /** Contains all methods related to shared @private */
  private sharedService: SharedService;

  /** Holds the instance of roter service @private */
  private router: Router;

  constructor(injector: Injector) {
    this.injector = injector;
    this.modalService = this.injector.get(NgbModal);
    this.sharedService = this.injector.get(SharedService);
    this.router = this.injector.get(Router);
  }

  /** Delete Role click handler @public */
  public deleteRole(): void {
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

  /** Edit Role click handler @public */
  public editRole(): void {
    this.router.navigate(['/roles/edit', this.value.identifier]).catch(() => {
      // Catch Navigation Error
    });
  }
}
