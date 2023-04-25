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
 * @file App Components
 */
import { isNullOrUndefined } from 'util';
import { Component, HostListener, Injector } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { DEFAULT_INTERRUPTSOURCES, Idle } from '@ng-idle/core';
import { AuthenticationService } from 'AuthenticationService';
import { DeviceCheckService } from 'DeviceCheckService';
import { SharedService } from 'SharedService';

/**
 * Creating component
 * @Component takes AppComponent.html as template url
 */
@Component({
    selector: 'app-root',
    templateUrl: './AppComponent.html',
    styleUrls: ['./AppComponent.scss']
})
/** Exporting a class @exports AppComponent */
export class AppComponent {
    /** To inject services @public */
    public injector: Injector;
    /** Instance for modal service @public */
    public modalService: NgbModal;
    /** Device Check service @private */
    private deviceCheckService: DeviceCheckService;
    /** Utilizes auth service for any auth operations @private */
    private authService: AuthenticationService;
    /** Handle idle time out service @private */
    private idle: Idle;
    /** Contains all methods related to shared @private */
    private sharedService: SharedService;

    constructor(injector: Injector) {
        this.injector = injector;
        this.idle = this.injector.get(Idle);
        this.authService = this.injector.get(AuthenticationService);
        this.modalService = this.injector.get(NgbModal);
        this.deviceCheckService = this.injector.get(DeviceCheckService);
        this.handleIdle();
        this.sharedService = this.injector.get(SharedService);
    }

    /**
     * Lifecyle Hooks the trigger before component is instantiate
     */
    public ngOnInit(): void {
        this.sharedService.fetchOSMVersion();
    }

    /** To handle handleIdle @public */
    public handleIdle(): void {
        const idleTime: number = 1200;
        const idleTimeOutWarning: number = 5;
        //  sets an idle timeout in seconds.
        this.idle.setIdle(idleTime);
        //sets a timeout period in seconds. after idleTime seconds of inactivity, the user will be considered timed out.
        this.idle.setTimeout(idleTimeOutWarning);
        // sets the default interrupts, in this case, things like clicks, scrolls, touches to the document
        this.idle.setInterrupts(DEFAULT_INTERRUPTSOURCES);
        this.idle.watch(true);
        this.idleTimeOut();
    }

    /** Method to capture idle time out event @public */
    public idleTimeOut(): void {
        this.idle.onTimeout.subscribe(() => {
            this.idle.stop();
            if (localStorage.getItem('id_token') !== null) {
                this.authService.logout();
            }
        });
    }

    /** Handling Window's Storage Hostlistener @public */
    @HostListener('window:storage', ['$event'])
    public handleLocalStorageEvent(evt: StorageEvent): void {
        // On Token Change
        if (evt.key === 'token_state' && !isNullOrUndefined(evt.key)) {
            if (evt.oldValue !== evt.newValue) {
                window.location.reload();
            }
        }
        // On Langauges Change
        if (evt.key === 'languageCode' && !isNullOrUndefined(evt.key)) {
            if (evt.oldValue !== evt.newValue) {
                window.location.reload();
            }
        }
    }

    /** Handling Window's POP State Hostlistener @public */
    @HostListener('window:popstate', ['$event'])
    public handleOnPOPState(evt: PopStateEvent): void {
        this.modalService.dismissAll();
    }

    /** Handling Window's orientationchange Hostlistener @public */
    @HostListener('window:resize', ['$event'])
    public onResize(event: Event): void {
        this.deviceCheckService.checkDeviceType();
    }
}
