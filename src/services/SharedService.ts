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
 * @file Provider for Shared Service
 */
import { HttpErrorResponse, HttpHeaders } from '@angular/common/http';
import { EventEmitter, Injectable, Output } from '@angular/core';
import { FormArray, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { CONSTANTNUMBER, ERRORDATA, GETAPIURLHEADER, PACKAGEINFO, PAGERSMARTTABLE, SMARTTABLECLASS, TARSETTINGS } from 'CommonModel';
import { environment } from 'environment';
import * as HttpStatus from 'http-status-codes';
import * as untar from 'js-untar';
import * as pako from 'pako';
import { RestService } from 'RestService';
import { isNullOrUndefined } from 'util';

/** This is added globally by the tar.js library */
// tslint:disable-next-line: no-any
declare const Tar: any;

/**
 * An Injectable is a class adorned with the @Injectable decorator function.
 * @Injectable takes a metadata object that tells Angular how to compile and run module code
 */
@Injectable({
    providedIn: 'root'
})
/** Exporting a class @exports SharedService */
export class SharedService {
    /** call the parent using event information @private */
    @Output() public dataEvent: EventEmitter<{}> = new EventEmitter<{}>();

    /** Variables to hold regexp pattern for URL */
    // tslint:disable-next-line: max-line-length
    public REGX_URL_PATTERN: RegExp = new RegExp(/^(http?|ftp|https):\/\/([a-zA-Z0-9.-]+(:[a-zA-Z0-9.&%$-]+)*@)*((25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9][0-9]?)(\.(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])){3}|([a-zA-Z0-9-]+\.)*[a-zA-Z0-9-]+\.[a-zA-Z0-9]{2,15})(:((6553[0-5])|(655[0-2][0-9])|(65[0-4][0-9]{2})|(6[0-4][0-9]{3})|([1-5][0-9]{4})|([0-5]{0,5})|([0-9]{1,4})))*(\/($|[a-zA-Z0-9.,?'\\+&%$#=~_-]+))*$/);

    /** Variables to hold regexp pattern for IP Address */
    public REGX_IP_PATTERN: RegExp = new RegExp(/^(?:(25[0-5]|2[0-4][0-9]|1[0-9]{2}|[1-9]?[0-9])(\.(?!$)|$)){4}$/);

    /** Variables to hold regexp pattern for Port Number */
    // tslint:disable-next-line: max-line-length
    public REGX_PORT_PATTERN: RegExp = new RegExp(/^((6553[0-5])|(655[0-2][0-9])|(65[0-4][0-9]{2})|(6[0-4][0-9]{3})|([1-5][0-9]{4})|([0-5]{0,5})|([0-9]{1,4}))$/);

    /** Variables to hold regexp pattern for DPID */
    public REGX_DPID_PATTERN: RegExp = new RegExp(/^[0-9a-fA-F]{2}(:[0-9a-fA-F]{2}){7}$/);

    /** Variable to hold regexp pattern for password */
    // tslint:disable-next-line: max-line-length
    public REGX_PASSWORD_PATTERN: RegExp = new RegExp(/^.*(?=.{8,})((?=.*[!@#$%^&*()\-_=+{};:,<.>]){1})(?=.*\d)((?=.*[a-z]){1})((?=.*[A-Z]){1}).*$/);

    /** FormGroup instance added to the form @ html @public */
    public formGroup: FormGroup;

    /** Controls the go to top button on scroll  @public */
    public showGotoTop: boolean;

    /** Holds OSM Version value @public */
    public osmVersion: string;

    /** express number for time manupulation -2 */
    private epochTimeMinus2: number = -2;

    /** express number for time manupulation 1000 */
    private epochTime1000: number = 1000;

    /** Random string generator length */
    private randomStringLength: number = 4;

    /** Instance of the rest service @private */
    private restService: RestService;

    /** Service holds the router information @private */
    private router: Router;

    /** Random color string generator length @private */
    private colorStringLength: number = 256;

    /** Check for the root directory @private */
    private directoryCount: number = 2;

    constructor(restService: RestService, router: Router) {
        this.restService = restService;
        this.router = router;
    }

    /** convert epoch time function @public */
    public convertEpochTime(unixtimestamp: number): string {
        const monthsArr: string[] = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
            'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        const date: Date = new Date(unixtimestamp * this.epochTime1000);
        const year: number = date.getFullYear();
        const month: string = monthsArr[date.getMonth()];
        const day: number = date.getDate();
        const hours: number = date.getHours();
        const minutes: string = '0' + date.getMinutes();
        const seconds: string = '0' + date.getSeconds();
        return month + '-' + day + '-' + year + ' ' + hours + ':' + minutes.substr(this.epochTimeMinus2) + ':'
            + seconds.substr(this.epochTimeMinus2);
    }

    /** Download Files function @public */
    public downloadFiles(shortName: string, binaryData: Blob[], filetype: string): void {
        const downloadLink: HTMLAnchorElement = document.createElement('a');
        downloadLink.href = window.URL.createObjectURL(new Blob(binaryData, { type: filetype }));
        if (shortName !== undefined) {
            if (window.navigator.msSaveOrOpenBlob) {
                window.navigator.msSaveBlob(new Blob(binaryData, { type: filetype }), 'OSM_Export_' + shortName + '.tar.gz');
            } else {
                downloadLink.setAttribute('download', 'OSM_Export_' + shortName + '.tar.gz');
                document.body.appendChild(downloadLink);
                downloadLink.click();
            }
        }
    }

    /** Call this method after delete perform action is completed in the ng-smart-table data @public */
    public callData(): void {
        this.dataEvent.emit();
    }

    /** Generate random string @public */
    public randomString(): string {
        const chars: string = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        let result: string = '';
        // tslint:disable-next-line:no-increment-decrement
        for (let randomStringRef: number = this.randomStringLength; randomStringRef > 0; --randomStringRef) {
            result += chars[Math.floor(Math.random() * chars.length)];
        }
        return result;
    }
    /** Function to read uploaded file String @public */
    public async getFileString(files: FileList, fileType: string): Promise<string | ArrayBuffer> {
        const reader: FileReader = new FileReader();
        return new Promise<string | ArrayBuffer>((resolve: Function, reject: Function): void => {
            if (this.vaildataFileInfo(files[0], fileType)) {
                this.readFileContent(reader, files[0], fileType);
            } else {
                reject('typeError');
            }
            reader.onload = (): void => {
                if (reader.result === null) {
                    reject('contentError');
                }
                resolve(reader.result);
            };
            reader.onerror = (event: Event): void => {
                reject('contentError');
            };
        });
    }
    /** Method to handle tar and tar.gz file for shared YAML file content @public */
    public async targzFile(packageInfo: PACKAGEINFO): Promise<string | ArrayBuffer> {
        return new Promise<string | ArrayBuffer>((resolve: Function, reject: Function): void => {
            const httpOptions: GETAPIURLHEADER = this.getHttpOptions();
            let apiUrl: string = '';
            apiUrl = packageInfo.packageType === 'nsd' ? environment.NSDESCRIPTORS_URL + '/' + packageInfo.id + '/nsd_content' :
                environment.VNFPACKAGES_URL + '/' + packageInfo.id + '/package_content';
            this.restService.getResource(apiUrl, httpOptions).subscribe((response: ArrayBuffer) => {
                try {
                    // tslint:disable-next-line: no-any
                    const tar: any = new Tar();
                    const originalInput: Uint8Array = pako.inflate(response, { to: 'Uint8Array' });
                    untar(originalInput.buffer).then((extractedFiles: TARSETTINGS[]) => {
                        const getFoldersFiles: {}[] = extractedFiles;
                        const folderNameStr: string = extractedFiles[0].name;
                        getFoldersFiles.forEach((value: TARSETTINGS) => {
                            const getRootFolder: string[] = value.name.split('/');
                            if (value.name.startsWith(folderNameStr) &&
                                (value.name.endsWith('.yaml') || value.name.endsWith('.yml')) &&
                                getRootFolder.length === this.directoryCount) {
                                tar.append(value.name, packageInfo.descriptor, { type: value.type });
                            } else {
                                if (value.type !== 'L') {
                                    tar.append(value.name, new Uint8Array(value.buffer), { type: value.type });
                                }
                            }
                        });
                        const out: Uint8Array = tar.out;
                        const originalOutput: Uint8Array = pako.gzip(out);
                        resolve(originalOutput.buffer);
                    }, (err: string) => {
                        reject('');
                    });
                } catch (e) {
                    reject('');
                }
            }, (error: HttpErrorResponse) => {
                if (error.status === HttpStatus.NOT_FOUND || error.status === HttpStatus.UNAUTHORIZED) {
                    this.router.navigateByUrl('404', { skipLocationChange: true }).catch();
                } else {
                    this.restService.handleError(error, 'get');
                    reject('');
                }
            });
        });
    }
    /** Method to check given string is JSON or not @public */
    public checkJson(jsonString: string): boolean {
        jsonString = jsonString.replace(/'/g, '"');
        try {
            JSON.parse(jsonString);
        } catch (e) {
            return false;
        }
        return true;
    }
    /** Clean the form before submit @public */
    public cleanForm(formGroup: FormGroup): void {
        Object.keys(formGroup.controls).forEach((key: string) => {
            if ((!isNullOrUndefined((formGroup.get(key) as FormArray | FormGroup).controls)) && key !== 'vimconfig') {
                // tslint:disable-next-line: no-shadowed-variable
                for (const { item, index } of (formGroup.get(key).value).map((item: {}, index: number) => ({ item, index }))) {
                    const newFormGroup: FormGroup = (formGroup.get(key) as FormArray).controls[index] as FormGroup;
                    this.cleanForm(newFormGroup);
                }
            } else if (formGroup.get(key).value !== undefined && formGroup.get(key).value !== null && key !== 'vimconfig') {
                if (!Array.isArray(formGroup.get(key).value)) {
                    if (typeof formGroup.get(key).value === 'string') {
                        formGroup.get(key).setValue(formGroup.get(key).value.trim());
                    }
                }
            } else if (key === 'vimconfig') {
                const newFormGroup: FormGroup = formGroup.get(key) as FormGroup;
                this.cleanForm(newFormGroup);
            }
        });
    }
    /** Method to return the config of pager value for ngSmarttable @public */
    public paginationPagerConfig(): PAGERSMARTTABLE {
        return {
            display: true,
            perPage: environment.paginationNumber
        };
    }
    /** Method to return the class for the table for ngSmarttable @public */
    public tableClassConfig(): SMARTTABLECLASS {
        return {
            class: 'table list-data'
        };
    }
    /** Method to return all languages name and its code @public */
    public languageCodeList(): {}[] {
        return [
            { code: 'en', language: 'English' },
            { code: 'es', language: 'Spanish' },
            { code: 'pt', language: 'Portuguese' },
            { code: 'de', language: 'German' }
        ];
    }
    /** Fetch OSM Version @public */
    public fetchOSMVersion(): void {
        this.restService.getResource(environment.OSM_VERSION_URL).subscribe((res: { version: string }) => {
            const version: string[] = res.version.split('+');
            if (!isNullOrUndefined(version[0])) {
                this.osmVersion = version[0];
            } else {
                this.osmVersion = null;
            }
        }, (error: ERRORDATA) => {
            this.osmVersion = null;
            this.restService.handleError(error, 'get');
        });
    }
    /** Random RGB color code generator @public */
    public generateColor(): string {
        const x: number = Math.floor(Math.random() * this.colorStringLength);
        const y: number = Math.floor(Math.random() * this.colorStringLength);
        const z: number = Math.floor(Math.random() * this.colorStringLength);
        return 'rgb(' + x + ',' + y + ',' + z + ')';
    }
    /** Method to validate file extension and size @private */
    private vaildataFileInfo(fileInfo: File, fileType: string): boolean {
        const extension: string = fileInfo.name.substring(fileInfo.name.lastIndexOf('.') + 1);
        const packageSize: number = CONSTANTNUMBER.oneMB * environment.packageSize;
        if (extension.toLowerCase() === fileType && fileInfo.size <= packageSize) {
            return true;
        }
        return false;
    }
    /** Method to read file content based on type @private */
    private readFileContent(reader: FileReader, fileInfo: File, fileType: string): void {
        if (fileType === 'gz') {
            reader.readAsArrayBuffer(fileInfo);
        } else {
            reader.readAsText(fileInfo);
        }
    }
    /** Method to handle http options @public */
    private getHttpOptions(): GETAPIURLHEADER {
        return {
            headers: new HttpHeaders({
                Accept: 'application/gzip, application/json',
                'Cache-Control': 'no-cache, no-store, must-revalidate, max-age=0'
            }),
            responseType: 'arraybuffer'
        };
    }
}
