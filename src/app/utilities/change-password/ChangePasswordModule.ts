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
 * @file ChangePassword Module.
 */
import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { NgSelectModule } from '@ng-select/ng-select';
import { TranslateModule } from '@ngx-translate/core';
import { AddEditUserComponent } from 'AddEditUserComponent';
import { LoaderModule } from 'LoaderModule';
/**
 * Creating @NgModule component for Modules
 */
@NgModule({
    imports: [CommonModule, TranslateModule, FormsModule, ReactiveFormsModule, NgSelectModule, LoaderModule],
    declarations: [AddEditUserComponent],
    exports: [AddEditUserComponent],
    entryComponents: [AddEditUserComponent]
})
/** Exporting a class @exports ChangePasswordModule */
export class ChangePasswordModule {
    /** Variables declared to avoid state-less class */
    private changepwdModule: string;
}
