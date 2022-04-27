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

 Author: SANDHYA JS (sandhya.j@tataelxsi.co.in)
*/
/**
 * @file WarningConfiguration Model
 */
import { Component, Injector, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
/**
 * Creating component
 * @Component takes WarningComponent.html as template url
 */
@Component({
    selector: 'app-warning',
    templateUrl: './WarningComponent.html',
    styleUrls: ['./WarningComponent.scss']
})
/** Exporting a class @exports WarningComponent */
export class WarningComponent {
    /** To inject services @public */
    public injector: Injector;

    /** Instance for active modal service @public */
    public activeModal: NgbActiveModal;

    /** Check the loading results @public */
    public isLoad: Boolean = false;

    /** Contains title data @public */
    @Input()
    public heading: string;

    /** Contains body data @public */
    @Input()
    public confirmationMessage: string;

    /** Contains footer data @public */
    @Input()
    public submitMessage: string;

    /** Give the message for the loading @public */
    public message: string = 'PLEASEWAIT';

    constructor(injector: Injector) {
        this.injector = injector;
        this.activeModal = this.injector.get(NgbActiveModal);
    }

    /**
     * Lifecyle Hooks the trigger before component is instantiate
     */
    public ngOnInit(): void {
        //empty
    }

    /** Close the modal  @public */
    public closeModal(getMessage: string): void {
        this.activeModal.close({ message: getMessage });
    }
}
