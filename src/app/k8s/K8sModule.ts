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
 * @file K8s Module.
 */
import { CommonModule } from '@angular/common';
import { HttpClientModule } from '@angular/common/http';
import { CUSTOM_ELEMENTS_SCHEMA, NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { RouterModule, Routes } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { NgSelectModule } from '@ng-select/ng-select';
import { TranslateModule } from '@ngx-translate/core';
import { DataService } from 'DataService';
import { K8sActionComponent } from 'K8sActionComponent';
import { K8sAddClusterComponent } from 'K8sAddClusterComponent';
import { K8sAddRepoComponent } from 'K8sAddRepoComponent';
import { K8sClusterComponent } from 'K8sClusterComponent';
import { K8sComponent } from 'K8sComponent';
import { K8sRepositoryComponent } from 'K8sRepositoryComponent';
import { LoaderModule } from 'LoaderModule';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import { PagePerRowModule } from 'PagePerRowModule';
import { PageReloadModule } from 'PageReloadModule';

/** To halndle project information */
const projectInfo: {} = { title: '{project}', url: '/' };

/**
 * configures  routers
 */
const routes: Routes = [
  {
    path: '',
    component: K8sComponent,
    children: [
      {
        path: 'cluster',
        data: {
          breadcrumb: [{ title: 'PAGE.DASHBOARD.DASHBOARD', url: '/' }, { title: 'PAGE.DASHBOARD.PROJECTS', url: '/projects' },
            projectInfo, { title: 'PAGE.K8S.MENUK8SCLUSTER', url: null }]
        },
        component: K8sClusterComponent
      },
      {
        path: 'repo',
        data: {
          breadcrumb: [{ title: 'PAGE.DASHBOARD.DASHBOARD', url: '/' }, { title: 'PAGE.DASHBOARD.PROJECTS', url: '/projects' },
            projectInfo, { title: 'PAGE.K8S.MENUK8SREPO', url: null }]
        },
        component: K8sRepositoryComponent
      }
    ]
  }
];
/**
 * Creating @NgModule component for Modules
 */
@NgModule({
  imports: [
    ReactiveFormsModule.withConfig({ warnOnNgModelWithFormControl: 'never' }),
    FormsModule,
    CommonModule,
    HttpClientModule,
    NgSelectModule,
    Ng2SmartTableModule,
    TranslateModule,
    RouterModule.forChild(routes),
    NgbModule,
    PagePerRowModule,
    LoaderModule,
    PageReloadModule
  ],
  declarations: [
    K8sComponent,
    K8sClusterComponent,
    K8sRepositoryComponent,
    K8sActionComponent,
    K8sAddClusterComponent,
    K8sAddRepoComponent
  ],
  providers: [DataService],
  schemas: [CUSTOM_ELEMENTS_SCHEMA]
})
/** Exporting a class @exports K8sModule */
export class K8sModule {
  /** Variables declared to avoid state-less class */
  private k8sModule: string;
}
