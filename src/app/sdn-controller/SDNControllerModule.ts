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
 * @file SDN Controller module.
 */
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';
import { TranslateModule } from '@ngx-translate/core';
import { DataService } from 'DataService';
import { LoaderModule } from 'LoaderModule';
import { NewSDNControllerComponent } from 'NewSDNControllerComponent';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import { PagePerRowModule } from 'PagePerRowModule';
import { PageReloadModule } from 'PageReloadModule';
import { SDNControllerComponent } from 'SDNControllerComponent';
import { SDNControllerDetailsComponent } from 'SDNControllerDetailsComponent';
import { SDNControllerInfoComponent } from 'SDNControllerInfoComponent';

/** To halndle project information */
const projectInfo: {} = localStorage.getItem('project') !== null ? { title: localStorage.getItem('project'), url: '/' } : {};

/**
 * configures  routers
 */
const routes: Routes = [
    {
        path: '',
        component: SDNControllerComponent,
        children: [
            {
                path: 'details',
                data: {
                    breadcrumb: [{ title: 'PAGE.DASHBOARD.DASHBOARD', url: '/' }, { title: 'PAGE.DASHBOARD.PROJECTS', url: '/projects' },
                        projectInfo, { title: 'SDNCONTROLLER', url: null }]
                },
                component: SDNControllerDetailsComponent
            }
        ]
    }
];

/**
 * Creating @NgModule component for Modules
 */
@NgModule({
    imports: [ReactiveFormsModule.withConfig({ warnOnNgModelWithFormControl: 'never' }), FormsModule, CommonModule,
        HttpClientModule, NgSelectModule, Ng2SmartTableModule, TranslateModule, RouterModule.forChild(routes), NgbModule,
        PagePerRowModule, LoaderModule, PageReloadModule],
    declarations: [SDNControllerComponent, SDNControllerDetailsComponent, SDNControllerInfoComponent, NewSDNControllerComponent],
    providers: [DataService],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
/** Exporting a class @exports SDNControllerModule */
export class SDNControllerModule {
    /**
     * Lifecyle Hooks the trigger before component is instantiate
     */
     constructor() {
        //Empty
      }
}
