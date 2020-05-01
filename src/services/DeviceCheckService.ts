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
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
/**
 * @file Provider for Device Check Service
 */
/**
 * An Injectable is a class adorned with the @Injectable decorator function.
 * @Injectable takes a metadata object that tells Angular how to compile and run module code
 */
@Injectable({
    providedIn: 'root'
})
/** Exporting a class @exports DeviceCheckService */
export class DeviceCheckService {
    /** Get method for Observable isMobile */
    get isMobile(): Observable<boolean> {
        return this.isMobile$.asObservable();
    }
    /** Holds the mobile condition of type BehaviorSubject<boolean> @private */
    private isMobile$: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);

    /** Return the Device type @public */
    public checkDeviceType(): void {
        if (navigator.userAgent.match(/Android/i)
            || navigator.userAgent.match(/webOS/i)
            || navigator.userAgent.match(/iPhone/i)
            || navigator.userAgent.match(/iPod/i)
            || navigator.userAgent.match(/BlackBerry/i)
            || navigator.userAgent.match(/Windows Phone/i)) {
            this.isMobile$.next(true);
        } else {
            this.isMobile$.next(false);
        }
    }
}
