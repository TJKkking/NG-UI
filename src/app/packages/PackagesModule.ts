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
 * @file Packages Module.
 */
import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { FormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { CodemirrorModule } from '@ctrl/ngx-codemirror';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';
import { TranslateModule } from '@ngx-translate/core';
import { ClonePackageComponent } from 'ClonePackage';
import { DataService } from 'DataService';
import { DragDirective } from 'DragDirective';
import { EditPackagesComponent } from 'EditPackagesComponent';
import { LoaderModule } from 'LoaderModule';
import { NetsliceTemplateComponent } from 'NetsliceTemplate';
import { SidebarModule } from 'ng-sidebar';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import { NSComposerComponent } from 'NSComposer';
import { NSPackagesComponent } from 'NSPackages';
import { PackagesComponent } from 'Packages';
import { PagePerRowModule } from 'PagePerRowModule';
import { PageReloadModule } from 'PageReloadModule';
import { ShowContentComponent } from 'ShowContent';
import { VNFComposerComponent } from 'VNFComposer';
import { VNFPackagesComponent } from 'VNFPackages';

/** To halndle project information */
const projectInfo: {} = { title: '{project}', url: '/' };

/**
 * configures  routers
 */
const routes: Routes = [
    {
        path: '',
        component: PackagesComponent,
        children: [
            {
                path: 'ns',
                data: {
                    breadcrumb: [{ title: 'PAGE.DASHBOARD.DASHBOARD', url: '/' }, { title: 'PAGE.DASHBOARD.PROJECTS', url: '/projects' },
                        projectInfo, { title: 'NSPACKAGES', url: null }]
                },
                component: NSPackagesComponent
            },
            {
                path: 'vnf',
                data: {
                    breadcrumb: [{ title: 'PAGE.DASHBOARD.DASHBOARD', url: '/' }, { title: 'PAGE.DASHBOARD.PROJECTS', url: '/projects' },
                        projectInfo, { title: 'VNFPACKAGES', url: null }]
                },
                component: VNFPackagesComponent
            },
            {
                path: 'netslice',
                data: {
                    breadcrumb: [{ title: 'PAGE.DASHBOARD.DASHBOARD', url: '/' }, { title: 'PAGE.DASHBOARD.PROJECTS', url: '/projects' }
                        , projectInfo, { title: 'PAGE.DASHBOARD.NETSLICETEMPLATE', url: null }]
                },
                component: NetsliceTemplateComponent
            },
            {
                path: ':type/edit/:id',
                data: {
                    breadcrumb: [{ title: 'PAGE.DASHBOARD.DASHBOARD', url: '/' }, { title: 'PAGE.DASHBOARD.PROJECTS', url: '/projects' }
                        , projectInfo, { title: '{type}', url: '/packages/{type}' }, { title: '{id}', url: null }]
                },
                component: EditPackagesComponent
            },
            {
                path: 'ns/compose/:id',
                data: {
                    breadcrumb: [{ title: 'PAGE.DASHBOARD.DASHBOARD', url: '/' }, { title: 'PAGE.DASHBOARD.PROJECTS', url: '/projects' }
                        , projectInfo, { title: 'NSPACKAGES', url: '/packages/ns' }, { title: '{id}', url: null }]
                },
                component: NSComposerComponent
            },
            {
                path: 'vnf/compose/:id',
                data: {
                    breadcrumb: [{ title: 'PAGE.DASHBOARD.DASHBOARD', url: '/' }, { title: 'PAGE.DASHBOARD.PROJECTS', url: '/projects' },
                        projectInfo, { title: 'VNFPACKAGES', url: '/packages/vnf' }, { title: '{id}', url: null }]
                },
                component: VNFComposerComponent
            }
        ]
    }
];

/**
 * Creating @NgModule component for Modules
 */
@NgModule({
    imports: [ReactiveFormsModule.withConfig({ warnOnNgModelWithFormControl: 'never' }), FormsModule, CommonModule, Ng2SmartTableModule,
        CodemirrorModule, TranslateModule, RouterModule.forChild(routes), NgbModule, NgSelectModule,
        PagePerRowModule, SidebarModule.forRoot(), LoaderModule, PageReloadModule],
    declarations: [PackagesComponent, NSPackagesComponent, VNFPackagesComponent, NetsliceTemplateComponent,
        DragDirective, ShowContentComponent, NSComposerComponent, VNFComposerComponent, EditPackagesComponent, ClonePackageComponent],
    providers: [DataService],
    schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
/** Exporting a class @exports PackagesModule */
export class PackagesModule {
    /** Variables declared to avoid state-less class */
    private packagesModule: string;
}
