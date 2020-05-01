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
 * @file Sidebar Component
 */
import { Component, Injector, OnInit } from '@angular/core';
import { DeviceCheckService } from 'DeviceCheckService';
import { MENU_ITEMS, MENUITEMS } from 'src/models/MenuModel';
import { isNullOrUndefined } from 'util';

/**
 * Creating component
 * @Component takes SidebarComponent.html as template url
 */
@Component({
    selector: 'app-sidebar',
    templateUrl: './SidebarComponent.html',
    styleUrls: ['./SidebarComponent.scss']
})
/** Exporting a class @exports SidebarComponent */
export class SidebarComponent implements OnInit {
    /** To inject services @public */
    public injector: Injector;

    /** submenu router endpoints @public */
    public routerEndpoint: string;

    /** submenu router endpoints @public */
    public getMenus: MENUITEMS[];

    /** selected Menu @public */
    public selectedItem: string;

    /** get the classlist @public */
    public elementCheck: HTMLCollection;

    /** Apply active class for Desktop @public */
    public classAppliedForDesktop: boolean = false;

    /** Apply active class for mobile @public */
    public classAppliedForMobile: boolean = false;

    /** Device Check service @public */
    public deviceCheckService: DeviceCheckService;

    /** Check for the mobile @public */
    public isMobile$: boolean;

    constructor(injector: Injector) {
        this.injector = injector;
        this.deviceCheckService = this.injector.get(DeviceCheckService);
        this.getMenus = MENU_ITEMS;
    }

    /** Lifecyle Hooks the trigger before component is instantiate @public */
    public ngOnInit(): void {
        this.deviceCheckService.checkDeviceType();
        this.deviceCheckService.isMobile.subscribe((checkIsMobile: boolean) => {
            this.isMobile$ = checkIsMobile;
            this.getDeviceType();
        });
    }
    /** method to open sideBarOpen in all the views */
    public sideBarOpenClose(): void {
        if (this.isMobile$) {
            this.classAppliedForMobile = !this.classAppliedForMobile;
        } else {
            this.classAppliedForDesktop = !this.classAppliedForDesktop;
        }
        this.addClassMainWrapper();
    }
    /** Add class for mobile/Desktop in main-wrapper @public */
    public addClassMainWrapper(): void {
        const elementMain: HTMLElement = document.querySelector('#main-wrapper');
        if (!isNullOrUndefined(elementMain)) {
            if (this.isMobile$) {
                elementMain.classList.toggle('sidebar-mobile');
            } else {
                elementMain.classList.toggle('sidebar-desktop');
            }
        }
    }
    /** Return the Device type @public */
    public getDeviceType(): void {
        if (this.isMobile$) {
            this.classAppliedForMobile = true;
            this.classAppliedForDesktop = false;
        } else {
            this.classAppliedForMobile = false;
            this.classAppliedForDesktop = false;
        }
        this.addClassMainWrapper();
    }
    /** Set the SideBar Menus click function @public */
    public handleMenuFunction(index: number, method: string, className: string, childExists: boolean): void {
        this.selectedItem = method;
        if (!isNullOrUndefined(method)) {
            this.parentactiveClassAddRemove(index, method, className, childExists);
        }
    }
    /** Removing the parentactive class which is already present and add it to current @public */
    public parentactiveClassAddRemove(index: number, method: string, className: string, childExists: boolean): void {
        const element: HTMLElement = document.querySelector('#' + method + '' + index);
        const checkOpenedelement: boolean = element.classList.contains(className);
        if (!checkOpenedelement) {
            this.elementCheck = document.getElementsByClassName(className);
            if (this.elementCheck.length > 0) {
                this.removeClasses(className);
            }
        }
        if (method !== 'nosubmenu') {
            element.classList.toggle(className);
        }
        if (this.isMobile$ && !childExists) {
            this.checkAndCloseSideBar(childExists);
        }
    }
    /** Hide / Show Menus based on the clicking in the menus @public */
    public checkAndCloseSideBar(childExists: boolean): void {
        event.stopPropagation();
        if (this.isMobile$ && !childExists) {
            this.sideBarOpenClose();
        }
    }
    /** remove existing Class @public */
    public removeClasses(className: string): void {
        this.elementCheck[0].classList.remove(className);
        if (this.elementCheck[0]) {
            this.removeClasses(className);
        }
    }
}
