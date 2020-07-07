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
 * @file Vim Account module.
 */
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { CodemirrorModule } from '@ctrl/ngx-codemirror';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';
import { TranslateModule } from '@ngx-translate/core';
import { DataService } from 'DataService';
import { InfoVimComponent } from 'InfoVim';
import { LoaderModule } from 'LoaderModule';
import { NewVimaccountComponent } from 'NewVimaccount';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import { PagePerRowModule } from 'PagePerRowModule';
import { PageReloadModule } from 'PageReloadModule';
import { VimAccountDetailsComponent } from 'VimAccountDetails';
import { VimAccountsComponent } from 'VimAccountsComponent';

/** To halndle project information */
const projectInfo: {} = { title: '{project}', url: '/' };

/** const values for dashboard Routes */
const routes: Routes = [
    {
        path: '',
        component: VimAccountsComponent,
        children: [
            {
                path: 'details',
                data: {
                    breadcrumb: [{ title: 'PAGE.DASHBOARD.DASHBOARD', url: '/' }, { title: 'PAGE.DASHBOARD.PROJECTS', url: '/projects' },
                        projectInfo, { title: 'VIMACCOUNTS', url: null }]
                },
                component: VimAccountDetailsComponent
            },
            {
                path: 'info/:id',
                data: {
                    breadcrumb: [{ title: 'PAGE.DASHBOARD.DASHBOARD', url: '/' }, { title: 'PAGE.DASHBOARD.PROJECTS', url: '/projects' },
                        projectInfo, { title: 'VIMACCOUNTS', url: '/vim/details' }, { title: '{id}', url: null }]
                },
                component: InfoVimComponent
            },
            {
                path: 'new',
                data: {
                    breadcrumb: [{ title: 'PAGE.DASHBOARD.DASHBOARD', url: '/' }, { title: 'PAGE.DASHBOARD.PROJECTS', url: '/projects' },
                        projectInfo, { title: 'VIMACCOUNTS', url: '/vim/details' }, { title: 'PAGE.VIMDETAILS.NEWVIM', url: null }]
                },
                component: NewVimaccountComponent
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
        PagePerRowModule, LoaderModule, PageReloadModule, CodemirrorModule],
    declarations: [VimAccountsComponent, InfoVimComponent, VimAccountDetailsComponent, NewVimaccountComponent],
    providers: [DataService],
    entryComponents: [InfoVimComponent]
})
/** Exporting a class @exports VimAccountsModule */
export class VimAccountsModule {
    /** Variables declared to avoid state-less class */
    private vimModule: string;
}
