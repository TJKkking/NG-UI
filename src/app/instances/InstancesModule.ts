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
 * @file Instance module
 */
import { CommonModule } from '@angular/common';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { FlexLayoutModule } from '@angular/flex-layout';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { CodemirrorModule } from '@ctrl/ngx-codemirror';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';
import { TranslateModule } from '@ngx-translate/core';
import { AddPDUInstancesComponent } from 'AddPDUInstancesComponent';
import { DataService } from 'DataService';
import { HistoryOperationsComponent } from 'HistoryOperationsComponent';
import { InstancesComponent } from 'InstancesComponent';
import { LoaderModule } from 'LoaderModule';
import { NetsliceInstancesComponent } from 'NetsliceInstancesComponent';
import { SidebarModule } from 'ng-sidebar';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import { NSInstancesComponent } from 'NSInstancesComponent';
import { NSPrimitiveComponent } from 'NSPrimitiveComponent';
import { NSTopologyComponent } from 'NSTopologyComponent';
import { OperationalViewAppActionsComponent } from 'OperationalAppActionsComponent';
import { OperationalViewAppConfigsComponent } from 'OperationalAppConfigsComponent';
import { OperationalViewAppExecutedActionsComponent } from 'OperationalAppExecutedActionsComponent';
import { OperationalViewComponent } from 'OperationalViewComponent';
import { PagePerRowModule } from 'PagePerRowModule';
import { PageReloadModule } from 'PageReloadModule';
import { PDUInstancesComponent } from 'PDUInstancesComponent';
import { VNFInstancesComponent } from 'VNFInstancesComponent';

/** To halndle project information */
const projectInfo: {} = { title: '{project}', url: '/' };

/** Exporting a function using Routes @exports routes */
const routes: Routes = [
    {
        path: '',
        component: InstancesComponent,
        children: [
            {
                path: 'ns',
                data: {
                    breadcrumb: [{ title: 'PAGE.DASHBOARD.DASHBOARD', url: '/' }, { title: 'PAGE.DASHBOARD.PROJECTS', url: '/projects' },
                        projectInfo, { title: 'NSINSTANCES', url: null }]
                },
                component: NSInstancesComponent
            },
            {
                path: 'vnf',
                data: {
                    breadcrumb: [{ title: 'PAGE.DASHBOARD.DASHBOARD', url: '/' }, { title: 'PAGE.DASHBOARD.PROJECTS', url: '/projects' },
                        projectInfo, { title: 'VNFINSTANCES', url: null }]
                },
                component: VNFInstancesComponent
            },
            {
                path: 'pdu',
                data: {
                    breadcrumb: [{ title: 'PAGE.DASHBOARD.DASHBOARD', url: '/' }, { title: 'PAGE.DASHBOARD.PROJECTS', url: '/projects' },
                        projectInfo, { title: 'PDUINSTANCES', url: null }]
                },
                component: PDUInstancesComponent
            },
            {
                path: 'netslice',
                data: {
                    breadcrumb: [{ title: 'PAGE.DASHBOARD.DASHBOARD', url: '/' }, { title: 'PAGE.DASHBOARD.PROJECTS', url: '/projects' },
                        projectInfo, { title: 'PAGE.DASHBOARD.NETSLICEINSTANCE', url: null }]
                },
                component: NetsliceInstancesComponent
            },
            {
                path: ':type/history-operations/:id',
                data: {
                    breadcrumb: [{ title: 'PAGE.DASHBOARD.DASHBOARD', url: '/' }, { title: 'PAGE.DASHBOARD.PROJECTS', url: '/projects' },
                        projectInfo, { title: '{type}', url: '/instances/{type}' }, { title: '{id}', url: null }]
                },
                component: HistoryOperationsComponent
            },
            {
                path: 'ns/:id',
                data: {
                    breadcrumb: [{ title: 'PAGE.DASHBOARD.DASHBOARD', url: '/' }, { title: 'PAGE.DASHBOARD.PROJECTS', url: '/projects' },
                        projectInfo, { title: 'NSINSTANCES', url: '/instances/ns' }, { title: '{id}', url: null }]
                },
                component: NSTopologyComponent
            },
            {
                path: 'operational-view',
                data: {
                    breadcrumb: [{ title: 'PAGE.DASHBOARD.DASHBOARD', url: '/' }, { title: 'PAGE.DASHBOARD.PROJECTS', url: '/projects' },
                        projectInfo, { title: 'PAGE.OPERATIONALDASHBOARD.TITLE', url: null }]
                },
                component: OperationalViewComponent
            },
            {
                path: 'operational-view/:id',
                data: {
                    breadcrumb: [{ title: 'PAGE.DASHBOARD.DASHBOARD', url: '/' }, { title: 'PAGE.DASHBOARD.PROJECTS', url: '/projects' },
                        projectInfo, { title: 'PAGE.OPERATIONALDASHBOARD.TITLE', url: '/instances/operational-view' },
                    { title: '{id}', url: null }]
                },
                component: OperationalViewComponent
            }
        ]
    }
];

/**
 * An NgModule is a class adorned with the @NgModule decorator function.
 * @NgModule takes a metadata object that tells Angular how to compile and run module code.
 */
@NgModule({
    imports: [ReactiveFormsModule.withConfig({ warnOnNgModelWithFormControl: 'never' }), FormsModule, TranslateModule,
        CodemirrorModule, CommonModule, Ng2SmartTableModule, FlexLayoutModule, RouterModule.forChild(routes), NgbModule,
        NgSelectModule, PagePerRowModule, LoaderModule, SidebarModule.forRoot(), PageReloadModule],
    declarations: [InstancesComponent, NSInstancesComponent, VNFInstancesComponent, PDUInstancesComponent, AddPDUInstancesComponent,
        NetsliceInstancesComponent, HistoryOperationsComponent, NSTopologyComponent, NSPrimitiveComponent, OperationalViewComponent,
        OperationalViewAppConfigsComponent, OperationalViewAppActionsComponent, OperationalViewAppExecutedActionsComponent],
    schemas: [CUSTOM_ELEMENTS_SCHEMA],
    providers: [DataService]
})
/** Exporting a class @exports InstancesModule */
export class InstancesModule {
    /**
     * Lifecyle Hooks the trigger before component is instantiate
     */
     constructor() {
        //Empty
      }
}
