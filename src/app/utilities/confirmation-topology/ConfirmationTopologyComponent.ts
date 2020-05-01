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
 * @file Delete Topology Model
 */
import { Component, Injector, Input, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { MODALCLOSERESPONSEWITHCP } from 'CommonModel';
/**
 * Creating component
 * @Component takes ConfirmationTopologyComponent.html as template url
 */
@Component({
  selector: 'app-confirmation-topology',
  templateUrl: './ConfirmationTopologyComponent.html',
  styleUrls: ['./ConfirmationTopologyComponent.scss']
})
/** Exporting a class @exports ConfirmationTopologyComponent */
export class ConfirmationTopologyComponent implements OnInit {
  /** Form valid on submit trigger @public */
  public submitted: boolean = false;
  /** To inject services @public */
  public injector: Injector;
  /** Instance for active modal service @public */
  public activeModal: NgbActiveModal;
  /** FormGroup instance added to the form @ html @public */
  public addConfirmationForm: FormGroup;
  /** Input contains Modal dialog componentInstance @private */
  @Input() public topologytitle: string;
  /** Input contains Modal dialog componentInstance @private */
  @Input() public topologyname: string;
  /** Input contains Modal dialog componentInstance @private */
  @Input() public topologyType: string;
  /** Input contains Modal dialog componentInstance @private */
  @Input() public cpDetails: {}[];

  /** Contains connectionpoint @public */
  public connectionPointInput: string;

  /** Contains tranlsate instance @private */
  private translateService: TranslateService;
  /** FormBuilder instance added to the formBuilder @private */
  private formBuilder: FormBuilder;
  constructor(injector: Injector) {
    this.injector = injector;
    this.activeModal = this.injector.get(NgbActiveModal);
    this.translateService = this.injector.get(TranslateService);
    this.formBuilder = this.injector.get(FormBuilder);
  }

  /**
   * Lifecyle Hooks the trigger before component is instantiate
   */
  public ngOnInit(): void {
    this.initializeForm();
  }
  /** convenience getter for easy access to form fields */
  get f(): FormGroup['controls'] { return this.addConfirmationForm.controls; }

  /** initialize Forms @public */
  public initializeForm(): void {
    this.addConfirmationForm = this.formBuilder.group({
      cpName: [null, [Validators.required]]
    });
  }

  /** add confirmation to be handled in this function @public */
  public addConfirmation(): void {
    this.submitted = true;
    if (this.addConfirmationForm.invalid) { return; } // Proceed, onces form is valid
    const modalData: MODALCLOSERESPONSEWITHCP = {
      message: 'Done',
      connection_point: this.connectionPointInput
    };
    this.activeModal.close(modalData);
  }
  /** confirmation to be handled in this function @public */
  public confirmation(): void {
    const modalData: MODALCLOSERESPONSEWITHCP = {
      message: 'Done'
    };
    this.activeModal.close(modalData);
  }

}
