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
 * @file Roles Module
 */
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { LoaderModule } from 'LoaderModule';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import { PagePerRowModule } from 'PagePerRowModule';
import { PageReloadModule } from 'PageReloadModule';
import { RolesComponent } from 'Roles';
import { RolesActionComponent } from 'RolesAction';
import { RolesCreateEditComponent } from 'RolesCreateEdit';
import { RolesDetailsComponent } from 'RolesDetails';

/** const values for Roles Routes */
const routes: Routes = [
    {
        path: '',
        component: RolesComponent,
        children: [
            {
                path: 'details',
                data: {
                    breadcrumb: [{ title: 'PAGE.DASHBOARD.DASHBOARD', url: '/' }, { title: 'ROLES', url: null }]
                },
                component: RolesDetailsComponent
            },
            {
                path: 'create',
                data: {
                    breadcrumb: [{ title: 'PAGE.DASHBOARD.DASHBOARD', url: '/' }, { title: 'ROLES', url: '/roles/details' },
                    { title: 'PAGE.ROLES.CREATEROLE', url: null }]
                },
                component: RolesCreateEditComponent
            },
            {
                path: 'edit/:id',
                data: {
                    breadcrumb: [{ title: 'PAGE.DASHBOARD.DASHBOARD', url: '/' }, { title: 'ROLES', url: '/roles/details' },
                    { title: '{id}', url: null }]
                },
                component: RolesCreateEditComponent
            }
        ]
    }
];
/**
 * An NgModule is a class adorned with the @NgModule decorator function.
 * @NgModule takes a metadata object that tells Angular how to compile and run module code.
 */
@NgModule({
    imports: [FormsModule, ReactiveFormsModule, CommonModule, HttpClientModule, TranslateModule,
        RouterModule.forChild(routes), NgbModule, PagePerRowModule, Ng2SmartTableModule, LoaderModule, PageReloadModule],
    declarations: [RolesComponent, RolesDetailsComponent, RolesActionComponent, RolesCreateEditComponent]
})
/**
 * AppModule is the Root module for application
 */
export class RolesModule {
    /** Variables declared to avoid state-less class */
    private rolesModule: string;
}
