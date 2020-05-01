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
 * @file Routing Module
 */
import { Routes } from '@angular/router';
import { AuthGuardService } from 'AuthGuardService';
import { LayoutComponent } from 'LayoutComponent';
import { LoginComponent } from 'LoginComponent';
import { PageNotFoundComponent } from 'PageNotFound';

/** Exporting a function using Routes @exports AppRoutes */
export const appRoutes: Routes = [
    {
        path: 'login',
        component: LoginComponent
    },
    {
        path: '',
        component: LayoutComponent,
        canActivate: [AuthGuardService],
        children: [
            {
                path: '',
                // tslint:disable-next-line: no-any
                loadChildren: async (): Promise<any> => import('./dashboard/DashboardModule')
                    .then((m: typeof import('./dashboard/DashboardModule')) => m.DashboardModule),
                canActivate: [AuthGuardService]
            },
            {
                path: 'packages',
                // tslint:disable-next-line: no-any
                loadChildren: async (): Promise<any> => import('./packages/PackagesModule')
                    .then((m: typeof import('./packages/PackagesModule')) => m.PackagesModule),
                canActivate: [AuthGuardService]
            },
            {
                path: 'instances',
                // tslint:disable-next-line: no-any
                loadChildren: async (): Promise<any> => import('./instances/InstancesModule')
                    .then((m: typeof import('./instances/InstancesModule')) => m.InstancesModule),
                canActivate: [AuthGuardService]
            },
            {
                path: 'vim',
                // tslint:disable-next-line: no-any
                loadChildren: async (): Promise<any> => import('./vim-accounts/VimAccountsModule')
                    .then((m: typeof import('./vim-accounts/VimAccountsModule')) => m.VimAccountsModule),
                canActivate: [AuthGuardService]
            },
            {
                path: 'wim',
                // tslint:disable-next-line: no-any
                loadChildren: async (): Promise<any> => import('./wim-accounts/WIMAccountsModule')
                    .then((m: typeof import('./wim-accounts/WIMAccountsModule')) => m.WIMAccountsModule),
                canActivate: [AuthGuardService]
            },
            {
                path: 'sdn',
                // tslint:disable-next-line: no-any
                loadChildren: async (): Promise<any> => import('./sdn-controller/SDNControllerModule')
                    .then((m: typeof import('./sdn-controller/SDNControllerModule')) => m.SDNControllerModule),
                canActivate: [AuthGuardService]
            },
            {
                path: 'users',
                // tslint:disable-next-line: no-any
                loadChildren: async (): Promise<any> => import('./users/UsersModule')
                    .then((m: typeof import('./users/UsersModule')) => m.UsersModule),
                canActivate: [AuthGuardService]
            },
            {
                path: 'projects',
                // tslint:disable-next-line: no-any
                loadChildren: async (): Promise<any> => import('./projects/ProjectsModule')
                    .then((m: typeof import('./projects/ProjectsModule')) => m.ProjectsModule),
                canActivate: [AuthGuardService]
            },
            {
                path: 'roles',
                // tslint:disable-next-line: no-any
                loadChildren: async (): Promise<any> => import('./roles/RolesModule')
                    .then((m: typeof import('./roles/RolesModule')) => m.RolesModule),
                canActivate: [AuthGuardService]
            },
            {
                path: 'k8s',
                // tslint:disable-next-line: no-any
                loadChildren: async (): Promise<any> => import('./k8s/K8sModule')
                    .then((m: typeof import('./k8s/K8sModule')) => m.K8sModule),
                canActivate: [AuthGuardService]
            }
        ]
    },
    {
        path: '**',
        component: PageNotFoundComponent
    }
];
