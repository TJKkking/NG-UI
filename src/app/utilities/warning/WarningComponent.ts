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
import { HttpHeaders } from '@angular/common/http';
import { Component, Injector, Input } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { NotifierService } from 'angular-notifier';
import { APIURLHEADER, ERRORDATA, MODALCLOSERESPONSEDATA, UNLOCKPARAMS } from 'CommonModel';
import { environment } from 'environment';
import { RestService } from 'RestService';
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

    /** Contains id of the admin user @public */
    @Input()
    public id: string;

    /** Holds which action to perform @public */
    @Input()
    public action: boolean = false;

    /** Contains editType data @public */
    @Input()
    public editType: string;

    /** handle translate @public */
    public translateService: TranslateService;

    /** Controls the header form @private */
    private headers: HttpHeaders;

    /** Instance of the rest service @private */
    private restService: RestService;

    /** Notifier service to popup notification @private */
    private notifierService: NotifierService;

    constructor(injector: Injector) {
        this.injector = injector;
        this.activeModal = this.injector.get(NgbActiveModal);
        this.restService = this.injector.get(RestService);
        this.translateService = this.injector.get(TranslateService);
        this.notifierService = this.injector.get(NotifierService);
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

    /**
     * called on submit @private onSubmit
     */
    public onSubmit(): void {
        this.isLoad = true;
        const modalData: MODALCLOSERESPONSEDATA = {
            message: 'Done'
        };
        const id: string = localStorage.getItem('user_id');
        const payLoad: UNLOCKPARAMS = {};
        if (this.editType === 'unlock') {
            payLoad.system_admin_id = id;
            payLoad.unlock = true;
        } else {
            payLoad.system_admin_id = id;
            payLoad.renew = true;
        }
        const apiURLHeader: APIURLHEADER = {
            url: environment.USERS_URL + '/' + this.id,
            httpOptions: { headers: this.headers }
        };
        this.restService.patchResource(apiURLHeader, payLoad).subscribe((result: {}): void => {
            this.activeModal.close(modalData);
            this.isLoad = false;
            if (this.editType === 'unlock') {
                this.notifierService.notify('success', this.translateService.instant('PAGE.USERS.UNLOCKUSER'));
            } else {
                this.notifierService.notify('success', this.translateService.instant('PAGE.USERS.RENEWUSER'));
            }
        }, (error: ERRORDATA): void => {
            this.restService.handleError(error, 'put');
            this.isLoad = false;
        }, (): void => {
            this.isLoad = false;
        });
    }
}
