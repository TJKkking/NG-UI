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
 * @file Instance Module file
 */
import { CommonModule, LOCATION_INITIALIZED } from '@angular/common';
import { HttpClient, HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { APP_INITIALIZER, Injector, NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterModule } from '@angular/router';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateLoader, TranslateModule, TranslateService } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { NotifierModule, NotifierOptions } from 'angular-notifier';
import { AuthInterceptorService } from 'AuthInterceptorService';
import { HeaderComponent } from 'HeaderComponent';
import { LayoutComponent } from 'LayoutComponent';
import { Ng2SmartTableModule } from 'ng2-smart-table';
import { RestService } from 'RestService';
import { SidebarComponent } from 'SidebarComponent';
import { AppComponent } from './AppComponent';

import { appRoutes } from './approutes.module';

import { DataService } from 'DataService';
import { ProjectService } from 'ProjectService';
import { SharedService } from 'SharedService';

import { CodemirrorModule } from '@ctrl/ngx-codemirror';
import { NgSelectModule } from '@ng-select/ng-select';

import { NgIdleKeepaliveModule } from '@ng-idle/keepalive';
import { AuthenticationService } from 'AuthenticationService';
import { AuthGuardService } from 'AuthGuardService';
import { BreadcrumbComponent } from 'BreadCrumb';
import { ChangePasswordComponent } from 'ChangePasswordComponent';
import { ChangePasswordModule } from 'ChangePasswordModule';
import { ComposePackages } from 'ComposePackages';
import { ConfirmationTopologyComponent } from 'ConfirmationTopology';
import { DeleteComponent } from 'DeleteComponent';
import { DeviceCheckService } from 'DeviceCheckService';
import { GoToTopDirective } from 'GoToTopDirective';
import { InstantiateNetSliceTemplateComponent } from 'InstantiateNetSliceTemplate';
import { InstantiateNsComponent } from 'InstantiateNs';
import { LoaderModule } from 'LoaderModule';
import { LoginComponent } from 'LoginComponent';
import { NetsliceInstancesActionComponent } from 'NetsliceInstancesActionComponent';
import { NetslicePackagesActionComponent } from 'NetslicePackagesAction';
import { NSInstancesActionComponent } from 'NSInstancesActionComponent';
import { NsPackagesActionComponent } from 'NsPackagesAction';
import { PageNotFoundComponent } from 'PageNotFound';
import { PDUInstancesActionComponent } from 'PDUInstancesActionComponent';
import { ProjectLinkComponent } from 'ProjectLinkComponent';
import { ProjectsActionComponent } from 'ProjectsAction';
import { ScalingComponent } from 'ScalingComponent';
import { SDNControllerActionComponent } from 'SDNControllerActionComponent';
import { SharedModule } from 'SharedModule';
import { ShowInfoComponent } from 'ShowInfoComponent';
import { SwitchProjectComponent } from 'SwitchProjectComponent';
import { UsersActionComponent } from 'UsersActionComponent';
import { UserSettingsComponent } from 'UserSettingsComponent';
import { VimAccountsActionComponent } from 'VimAccountsAction';
import { VmMigrationComponent } from 'VmMigrationComponent';
import { VNFInstancesActionComponent } from 'VNFInstancesActionComponent';
import { VNFLinkComponent } from 'VNFLinkComponent';
import { VNFPackagesActionComponent } from 'VNFPackagesAction';
import { WIMAccountsActionComponent } from 'WIMAccountsAction';

/**
 * Custom angular notifier options
 */
const customNotifierOptions: NotifierOptions = {
    position: { horizontal: { position: 'right' }, vertical: { position: 'top' } },
    behaviour: { autoHide: 3000, onClick: 'hide', onMouseover: 'pauseAutoHide' }
};

/**
 * An NgModule is a class adorned with the @NgModule decorator function.
 * @NgModule takes a metadata object that tells Angular how to compile and run module code.
 */
@NgModule({
    declarations: [
        AppComponent,
        LayoutComponent,
        HeaderComponent,
        SidebarComponent,
        LoginComponent,
        PageNotFoundComponent,
        VNFPackagesActionComponent,
        NsPackagesActionComponent,
        NSInstancesActionComponent,
        VNFInstancesActionComponent,
        VNFLinkComponent,
        NetsliceInstancesActionComponent,
        BreadcrumbComponent,
        DeleteComponent,
        NetslicePackagesActionComponent,
        UsersActionComponent,
        VimAccountsActionComponent,
        ProjectsActionComponent,
        ProjectLinkComponent,
        UserSettingsComponent,
        ShowInfoComponent,
        InstantiateNetSliceTemplateComponent,
        InstantiateNsComponent,
        ConfirmationTopologyComponent,
        ComposePackages,
        WIMAccountsActionComponent,
        PDUInstancesActionComponent,
        SDNControllerActionComponent,
        SwitchProjectComponent,
        GoToTopDirective,
        ScalingComponent,
        ChangePasswordComponent,
        VmMigrationComponent
    ],
    imports: [
        NotifierModule.withConfig(customNotifierOptions),
        CommonModule,
        BrowserModule,
        BrowserAnimationsModule,
        FormsModule,
        ReactiveFormsModule.withConfig({ warnOnNgModelWithFormControl: 'never' }),
        Ng2SmartTableModule,
        CodemirrorModule,
        NgSelectModule,
        HttpClientModule,
        TranslateModule.forRoot({
            loader: {
                provide: TranslateLoader,
                useFactory: HttpLoaderFactory,
                deps: [HttpClient]
            }
        }),
        NgbModule,
        NgSelectModule,
        RouterModule.forRoot(appRoutes, { useHash: false, relativeLinkResolution: 'legacy' }),
        NgIdleKeepaliveModule.forRoot(),
        LoaderModule,
        SharedModule,
        ChangePasswordModule
    ],
    providers: [
        {
            provide: APP_INITIALIZER,
            useFactory: appInitializerFactory,
            deps: [TranslateService, Injector],
            multi: true
        },
        {
            provide: HTTP_INTERCEPTORS,
            useClass: AuthInterceptorService,
            multi: true
        },
        RestService,
        AuthenticationService,
        AuthGuardService,
        DataService,
        ProjectService,
        SharedService,
        DeviceCheckService
    ],
    bootstrap: [AppComponent],
    entryComponents: [
        VNFPackagesActionComponent,
        NsPackagesActionComponent,
        NSInstancesActionComponent,
        VNFInstancesActionComponent,
        VNFLinkComponent,
        NetsliceInstancesActionComponent,
        BreadcrumbComponent,
        DeleteComponent,
        NetslicePackagesActionComponent,
        UsersActionComponent,
        VimAccountsActionComponent,
        ProjectsActionComponent,
        ProjectLinkComponent,
        UserSettingsComponent,
        ShowInfoComponent,
        InstantiateNetSliceTemplateComponent,
        InstantiateNsComponent,
        ConfirmationTopologyComponent,
        ComposePackages,
        WIMAccountsActionComponent,
        PDUInstancesActionComponent,
        SDNControllerActionComponent,
        SwitchProjectComponent,
        ScalingComponent,
        ChangePasswordComponent,
        VmMigrationComponent
    ]
})

/** Exporting a class @exports AppModule */
export class AppModule {
    /** Variables declared to avoid state-less class */
    private appModule: string;
}

/**
 * HttpLoaderFactory is for translate service of the application.
 */
// tslint:disable:function-name
export function HttpLoaderFactory(http: HttpClient): TranslateHttpLoader {
    const now: number = new Date().getTime();
    return new TranslateHttpLoader(http, './assets/i18n/', '.json?locale=' + now);
}
/**
 * HttpLoaderFactory is for translate service of the application.
 */
// tslint:disable:function-name
export function appInitializerFactory(translate: TranslateService, injector: Injector): Object {
    // tslint:disable-next-line: no-any
    return async (): Promise<any> => {
        await injector.get(LOCATION_INITIALIZED, Promise.resolve(null));
        translate.setDefaultLang('en');
        const languageCode: string = localStorage.getItem('languageCode');
        if (languageCode !== null && languageCode !== undefined && languageCode !== '') {
            await translate.use(languageCode).toPromise().catch((): void => {
                translate.setDefaultLang('en');
            });
        } else {
            await translate.use('en').toPromise();
            localStorage.setItem('languageCode', 'en');
        }
    };
}
