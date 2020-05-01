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
 * @file Dashboard Module
 */
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { DashboardComponent } from 'DashboardComponent';
import { LoaderModule } from 'LoaderModule';
import { ChartsModule } from 'ng2-charts';

/** To halndle project information */
const projectInfo: {} = { title: '{project}', url: '/' };

/** const values for dashboard Routes */
const routes: Routes = [
    {
        path: '',
        data: {
            breadcrumb: [{ title: 'PAGE.DASHBOARD.DASHBOARD', url: '/' }, { title: 'PAGE.DASHBOARD.PROJECTS', url: '/projects' },
                projectInfo]
        },
        component: DashboardComponent
    }
];
/**
 * An NgModule is a class adorned with the @NgModule decorator function.
 * @NgModule takes a metadata object that tells Angular how to compile and run module code.
 */
@NgModule({
    imports: [FormsModule, CommonModule, HttpClientModule, FlexLayoutModule, TranslateModule,
        ChartsModule, RouterModule.forChild(routes), NgbModule, LoaderModule],
    declarations: [DashboardComponent]
})
/** Exporting a class @exports DashboardModule */
export class DashboardModule {
    /** Variables declared to avoid state-less class */
    private dashboardModule: string;
}
