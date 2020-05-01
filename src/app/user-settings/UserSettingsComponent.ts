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
 * @file User Settings Modal Component.
 */

import { Component, Injector, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { SharedService } from 'SharedService';

/**
 * Creating component
 * @Component takes UserSettingsComponent.html as template url
 */
@Component({
    templateUrl: './UserSettingsComponent.html',
    styleUrls: ['./UserSettingsComponent.scss']
})
/** Exporting a class @exports UserSettingsComponent */
export class UserSettingsComponent implements OnInit {
    /** Invoke service injectors @public */
    public injector: Injector;

    /** Supported language list for the dropdown */
    public languageList: {}[];

    /** FormGroup instance added to the form @ html @public */
    public usersettingsForm: FormGroup;

    /** Instance for active modal service @public */
    public activeModal: NgbActiveModal;

    /** Form submission Add */
    public submitted: boolean = false;

    /** FormBuilder instance added to the formBuilder @private */
    private formBuilder: FormBuilder;

    /** Instance for translate service @private */
    private translateService: TranslateService;

    /** Contains all methods related to shared @private */
    private sharedService: SharedService;

    constructor(injector: Injector) {
        this.injector = injector;
        this.formBuilder = this.injector.get(FormBuilder);
        this.activeModal = this.injector.get(NgbActiveModal);
        this.translateService = this.injector.get(TranslateService);
        this.sharedService = this.injector.get(SharedService);
    }

    /**
     * Lifecyle Hooks the trigger before component is instantiate
     */
    public ngOnInit(): void {
        this.initializeSettings();
    }

    /** Initialize user's settings */
    public initializeSettings(): void {
        this.languageList = this.sharedService.languageCodeList();
        /** Initializing Form Action */
        this.usersettingsForm = this.formBuilder.group({
            selectedLanguage: [null, [Validators.required]]
        });
        const setLanguage: string = localStorage.getItem('languageCode');
        if (setLanguage !== null && this.validateLanguageList(setLanguage)) {
            // tslint:disable-next-line:no-backbone-get-set-outside-model
            this.usersettingsForm.get('selectedLanguage').setValue(setLanguage);
        } else {
            // tslint:disable-next-line:no-backbone-get-set-outside-model
            this.usersettingsForm.get('selectedLanguage').setValue('en');
        }
    }

    /** convenience getter for easy access to form fields */
    get f(): FormGroup['controls'] { return this.usersettingsForm.controls; }

    /** On modal submit UserSettingsSubmit will called @public */
    public usersettingsSubmit(): void {
        this.submitted = true;
        if (!this.usersettingsForm.invalid) {
            const selectedLanguage: string = this.usersettingsForm.value.selectedLanguage;
            localStorage.setItem('languageCode', this.usersettingsForm.value.selectedLanguage);
            this.translateService.use(selectedLanguage);
            location.reload();
        }
    }
    /** Validate language code in the language list @private */
    private validateLanguageList(setLanguage: string): boolean {
        return this.languageList.some((item: { code: string }) => item.code === setLanguage);
    }
}
