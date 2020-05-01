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
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';
import { TranslateModule } from '@ngx-translate/core';
import { DataService } from 'DataService';
import { LoaderModule } from 'LoaderModule';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import { PagePerRowModule } from 'PagePerRowModule';
import { PageReloadModule } from 'PageReloadModule';
import { ProjectCreateUpdateComponent } from 'ProjectCreateUpdate';
import { ProjectsComponent } from 'ProjectsComponent';

/**
 * configures  routers
 */
const routes: Routes = [
    {
        path: '',
        data: {
            breadcrumb: [{ title: 'PAGE.DASHBOARD.DASHBOARD', url: '/' }, { title: 'PAGE.DASHBOARD.PROJECTS', url: null }]
        },
        component: ProjectsComponent
    }
];

/**
 * Creating @NgModule component for Modules
 */
// tslint:disable-next-line: no-stateless-class
@NgModule({
    imports: [
        FormsModule,
        CommonModule,
        HttpClientModule,
        Ng2SmartTableModule,
        FlexLayoutModule,
        TranslateModule,
        RouterModule.forChild(routes),
        NgbModule,
        PagePerRowModule,
        ReactiveFormsModule,
        LoaderModule,
        PageReloadModule,
        NgSelectModule
    ],
    declarations: [
        ProjectsComponent,
        ProjectCreateUpdateComponent
    ],
    providers: [
        DataService
    ],
    entryComponents: [
        ProjectCreateUpdateComponent
    ]
})
/** Exporting a class @exports ProjectsModule */
export class ProjectsModule {
    // empty module
}
