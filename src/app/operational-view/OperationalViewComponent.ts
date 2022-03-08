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

 Author: BARATH KUMAR R (barath.r@tataelxsi.co.in)
*/

/**
 * @file Page for Operational View Component
 */
import { Component, Injector, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { TranslateService } from '@ngx-translate/core';
import { CONSTANTNUMBER, ERRORDATA } from 'CommonModel';
import { environment } from 'environment';
import * as HttpStatus from 'http-status-codes';
import { OperationalViewAppActionsComponent } from 'OperationalAppActionsComponent';
import { OperationalViewAppConfigsComponent } from 'OperationalAppConfigsComponent';
import { OperationalViewAppExecutedActionsComponent } from 'OperationalAppExecutedActionsComponent';
import { EXECUTEDACTIONS, MACHINES, SET_TIMER, SETMODELS, SETTIMER, VCAAPPLICATIONS, VCADETAILS, VCASTATUS, VCAUNITS } from 'OperationalModel';
import { RestService } from 'RestService';
import { Observable } from 'rxjs';
import { Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { SharedService } from 'SharedService';
import { isNullOrUndefined } from 'util';
/**
 * Creating component
 * @Component takes OperationalViewComponent.html as template url
 */
@Component({
    selector: 'app-operational-view',
    templateUrl: './OperationalViewComponent.html'
})
/** Exporting a class @exports OperationalViewComponent */
export class OperationalViewComponent implements OnInit {
    /** Invoke service injectors @public */
    public injector: Injector;

    /** Check the loading results @public */
    public isLoadingResults: boolean = false;

    /** Give the message for the loading @public */
    public message: string = 'PLEASEWAIT';

    /** Formation of appropriate Data for vcaStatus Details @public */
    public vcaDetails: VCADETAILS[] = [];

    /** Contains all methods related to shared @public */
    public sharedService: SharedService;

    /** Utilizes rest service for any CRUD operations @public */
    public restService: RestService;

    /** variables contains activeID @public */
    public activeID: string = null;

    /** variables contains NS Instances ID @public */
    public instancesID: string = null;

    /** variables contains URL of operational Dashboard @public */
    public openURL: string = 'instances/operational-view/';

    /** variables contains default seconds for the timeout @public */
    public timeOutDefaultSeconds: number = CONSTANTNUMBER.timeOutDefaultSeconds;

    /** variables contains minimum seconds for the timeout @public */
    public minSeconds: number = 5;

    /** variables contains maximum seconds for the timeout @public */
    public maxSeconds: number = 60;

    /** variables contains timer calculation value of milliseconds @public */
    public timeDefaultCal: number = 1000;

    /** variables contains timeout @public */
    public timeOut: number;

    /** Set the timer button @public */
    // tslint:disable-next-line: no-magic-numbers
    public setSeconds: SETTIMER[] = SET_TIMER;

    /** Instance of subscriptions @private */
    private generateDataSub: Subscription;

    /** Contains tranlsate instance @private */
    private translateService: TranslateService;

    /** Holds teh instance of AuthService class of type AuthService @private */
    private activatedRoute: ActivatedRoute;

    /** Instance of the modal service @private */
    private modalService: NgbModal;

    /** creates Operational view component */
    constructor(injector: Injector) {
        this.injector = injector;
        this.restService = this.injector.get(RestService);
        this.sharedService = this.injector.get(SharedService);
        this.translateService = this.injector.get(TranslateService);
        this.activatedRoute = this.injector.get(ActivatedRoute);
        this.modalService = this.injector.get(NgbModal);
    }

    /**
     * Lifecyle Hooks the trigger before component is instantiate
     */
    public ngOnInit(): void {
        // tslint:disable-next-line:no-backbone-get-set-outside-model
        this.instancesID = this.activatedRoute.snapshot.paramMap.get('id');
        this.generateData();
        this.generateDataSub = this.sharedService.dataEvent.subscribe((): void => { this.generateData(); });
    }
    /** Fetching the juju vca_status data from API and Load it in the respective table @public */
    public generateData(): void {
        this.clearTimeoutAndInterval();
        this.modalService.dismissAll();
        this.isLoadingResults = true;
        this.vcaDetails = [];
        let NSURL: string = environment.NSDINSTANCES_URL;
        if (this.instancesID !== null) {
            NSURL = NSURL + '/' + this.instancesID;
            this.generateIndividualNSData(NSURL);
        } else {
            this.generateAllNSData(NSURL);
        }
    }
    /**
     * Show all NS Data that contains the juju vca_status from API and Load it in the table @public
     * @param NSURL : osm/nslcm/v1/ns_instances
     */
    public generateAllNSData(NSURL: string): void {
        this.restService.getResource(NSURL).subscribe((operationalList: VCASTATUS[]): void => {
            if (operationalList.length > 0) {
                operationalList.forEach((list: VCASTATUS): void => {
                    if (!isNullOrUndefined(list.vcaStatus)) {
                        const getVCAStatusDetails: VCADETAILS = this.vcaDetailsData(list, false, this.timeOutDefaultSeconds);
                        this.vcaDetails.push(getVCAStatusDetails);
                    }
                });
                if (this.activeID === null && this.vcaDetails.length > 0) {
                    this.activeID = this.vcaDetails[0].ns_id;
                }
            }
            this.isLoadingResults = false;
        }, (error: ERRORDATA): void => {
            this.isLoadingResults = false;
            this.restService.handleError(error, 'get');
        });
    }
    /**
     * Show the individual NS Data that contains the juju vca_status from generateNSData method and Load it in the table @public
     * @param NSURL : osm/nslcm/v1/ns_instances/<ID>
     */
    public generateIndividualNSData(NSURL: string): void {
        this.generateNSData(NSURL, false, this.timeOutDefaultSeconds).subscribe((getVCAStatusDetails: VCADETAILS): void => {
            this.vcaDetails.push(getVCAStatusDetails);
            if (this.activeID === null && this.vcaDetails.length > 0) {
                this.activeID = this.instancesID;
            }
            this.isLoadingResults = false;
        }, (error: ERRORDATA): void => {
            this.isLoadingResults = false;
            this.restService.handleError(error, 'get');
        });
    }
    /**
     * Fetching the Individual NS Data that contains the juju vca_status from API and return the VCADetails @public
     * @param NSURL : osm/nslcm/v1/ns_instances/<ID>
     * @param liveData : Needs to repeat the httprequest
     * @param timeOutSeconds : set the timeout seconds to trigger the httprequest
     */
    public generateNSData(NSURL: string, liveData: boolean, timeOutSeconds: number): Observable<VCADETAILS> {
        if (liveData) {
            NSURL = NSURL + '?vcaStatusRefresh=true';
        }
        return this.restService.getResource(NSURL).pipe(map((operationalList: VCASTATUS): VCADETAILS => {
            return this.vcaDetailsData(operationalList, liveData, timeOutSeconds);
        }));
    }
    /**
     * Form the VCA Details for each NS Instances
     */
    public formVCADetails(getData: VCADETAILS): VCADETAILS {
        return {
            isLiveloading: getData.isLiveloading,
            ns_id: getData.ns_id,
            vcaStatusModels: getData.vcaStatusModels,
            timeOutSeconds: getData.timeOutSeconds,
            vca_id: getData.vca_id,
            vca_name: getData.vca_name
        };
    }
    /**
     * Assign the VCA Status of Multiple model in getModels array for each NS Instance
     */
    public assignVCAStatusOfEachModel(getData: SETMODELS): SETMODELS {
        return {
            applications: getData.applications,
            branches: getData.branches,
            controller_timestamp: getData.controller_timestamp,
            executedActions: getData.executedActions,
            machines: getData.machines,
            model: getData.model,
            offers: getData.offers,
            relations: getData.relations,
            remote_applications: getData.remote_applications,
            units: getData.units,
            unknown_fields: getData.unknown_fields
        };
    }
    /**
     * Use to fetch the vcaDetails from vca_status @public
     */
    public vcaDetailsData(list: VCASTATUS, liveData: boolean, timeOutSeconds: number): VCADETAILS {
        const assignVCADetails: VCADETAILS[] = [];
        const setModels: SETMODELS[] = [];
        Object.keys(list.vcaStatus).forEach((key: string): void => {
            const vcaApplication: VCAAPPLICATIONS[] = this.appData(list.vcaStatus[key].applications);
            const vcaUnits: VCAUNITS[] = this.unitsData(vcaApplication);
            const vcaMachines: MACHINES[] = this.machinesData(list.vcaStatus[key].machines);
            const assignNSInstancesID: string = key;
            list.vcaStatus[key].units = vcaUnits;
            list.vcaStatus[key].applications = vcaApplication;
            list.vcaStatus[key].machines = vcaMachines;
            list.vcaStatus[key].relations = list.vcaStatus[key].relations;
            list.vcaStatus[key].model = list.vcaStatus[key].model;
            const getEachModelData: SETMODELS = this.assignVCAStatusOfEachModel(list.vcaStatus[key]);
            setModels.push(getEachModelData);
            list.vcaStatus[assignNSInstancesID].vca_id = key;
            list.vcaStatus[assignNSInstancesID].vca_name = list.name;
            list.vcaStatus[assignNSInstancesID].ns_id = list.id;
            list.vcaStatus[assignNSInstancesID].isLiveloading = liveData;
            list.vcaStatus[assignNSInstancesID].timeOutSeconds = timeOutSeconds;
            list.vcaStatus[assignNSInstancesID].vcaStatusModels = setModels;
            const getAssignedData: VCADETAILS = this.formVCADetails(list.vcaStatus[assignNSInstancesID]);
            assignVCADetails.push(getAssignedData);
        });
        return assignVCADetails[0];
    }
    /**
     * Use to fetch the app data from vca_status @public
     */
    public appData(applicationData: VCAAPPLICATIONS): VCAAPPLICATIONS[] {
        const vcaApplication: VCAAPPLICATIONS[] = [];
        Object.keys(applicationData).forEach((applicationKey: string): void => {
            const charmSplitlist: string[] = applicationData[applicationKey].charm.split('/');
            const status: string = applicationData[applicationKey].status.status;
            const charm: string = charmSplitlist[1].substr(0, charmSplitlist[1].lastIndexOf('-'));
            const store: string = charmSplitlist[0].substr(0, charmSplitlist[0].lastIndexOf(':'));
            applicationData[applicationKey].app_id = applicationKey;
            applicationData[applicationKey].charm = charm;
            applicationData[applicationKey].status = status;
            applicationData[applicationKey].scale = Object.keys(applicationData[applicationKey].units).length;
            applicationData[applicationKey].store = store;
            applicationData[applicationKey].configs = !isNullOrUndefined(applicationData[applicationKey].configs) ?
                applicationData[applicationKey].configs : null;
            applicationData[applicationKey].actions = !isNullOrUndefined(applicationData[applicationKey].actions) ?
                applicationData[applicationKey].actions : null;
            vcaApplication.push(applicationData[applicationKey]);
        });
        return vcaApplication;
    }
    /**
     * Use to fetch the units data from vca_status @public
     */
    public unitsData(applicationData: VCAAPPLICATIONS[]): VCAUNITS[] {
        const vcaUnits: VCAUNITS[] = [];
        applicationData.forEach((applicationList: VCAAPPLICATIONS): void => {
            Object.keys(applicationList.units).forEach((unitsKey: string): void => {
                applicationList.units[unitsKey].unit_id = unitsKey;
                vcaUnits.push(applicationList.units[unitsKey]);
            });
        });
        return vcaUnits;
    }
    /**
     * Use to fetch the machines data from vca_status @public
     */
    public machinesData(machinesData: MACHINES[]): MACHINES[] {
        const vcaMachines: MACHINES[] = [];
        Object.keys(machinesData).forEach((machineKey: string): void => {
            vcaMachines.push(machinesData[machineKey]);
        });
        return vcaMachines;
    }
    /** Show the Config list in modal using modalservice @public */
    public showExecutedActionsList(executeActionsList: EXECUTEDACTIONS[]): void {
        this.modalService.open(OperationalViewAppExecutedActionsComponent, { size: 'xl', backdrop: 'static' })
            .componentInstance.params = { executedActions: executeActionsList };
    }
    /** Show the Config list in modal using modalservice @public */
    public showConfigList(configList: object): void {
        this.modalService.open(OperationalViewAppConfigsComponent, { size: 'xl', backdrop: 'static' })
            .componentInstance.params = { configs: configList };
    }
    /** Show the Config list in modal using modalservice @public */
    public showActionsList(actionsList: object): void {
        this.modalService.open(OperationalViewAppActionsComponent, { size: 'xl', backdrop: 'static' })
            .componentInstance.params = { actions: actionsList };
    }
    /** Call the live data to fetch the latest results @public */
    public callLiveData(isChecked: boolean, getNSID: string, index: number): void {
        this.vcaDetails[index].isLiveloading = isChecked;
        if (isChecked) {
            this.stopExistingModelLiveLoading(getNSID);
            this.generateRefreshedData(getNSID, index, this.vcaDetails[index].timeOutSeconds);
        } else {
            this.clearTimeoutAndInterval();
        }
    }
    /** Fetching the juju vca_status data from API and Load it in the respective model @public */
    public generateRefreshedData(getNSID: string, index: number, secondsValue: number): void {
        this.modalService.dismissAll();
        const liveDataURL: string = environment.NSDINSTANCES_URL + '/' + getNSID;
        this.generateNSData(liveDataURL, true, secondsValue).subscribe((getVCAStatusDetails: VCADETAILS): void => {
            this.vcaDetails[index] = getVCAStatusDetails;
            this.callSetTimeOut(getNSID, index, secondsValue);
        }, (error: ERRORDATA): void => {
            this.restService.handleError(error, 'get');
            if (error.error.status === HttpStatus.NOT_FOUND) {
                this.vcaDetails.splice(index, 1);
            }
            this.clearTimeoutAndInterval();
        });
    }
    /** Call the setimeout to refresh the all models data in regular timeout @public */
    public callSetTimeOut(id: string, index: number, secondsValue: number): void {
        this.clearTimeoutAndInterval();
        this.timeOut = window.setTimeout((): void => {
            this.generateRefreshedData(id, index, secondsValue);
        }, secondsValue * this.timeDefaultCal);
    }
    /** Stop existing model live reload @public */
    public stopExistingModelLiveLoading(getNSID: string): void {
        this.clearTimeoutAndInterval();
        this.vcaDetails.forEach((vcaDetail: VCADETAILS, i: number): void => {
            if (vcaDetail.ns_id !== getNSID) {
                vcaDetail.isLiveloading = false;
            }
        });
    }
    /** Method to show/hide the tables @public */
    public showHideTables(event: HTMLElement, getTableName: string, index: number): void {
        let selectedClassName: string = getTableName + index;
        if (selectedClassName === 'all' + index) {
            selectedClassName = '';
        }
        document.querySelectorAll('.filter' + index).forEach((button: HTMLElement): void => {
            button.classList.remove('active');
            if (selectedClassName !== '') {
                if (button.classList.contains(selectedClassName)) {
                    button.classList.add('active');
                }
            } else if (button.classList.contains('all' + index)) {
                button.classList.add('active');
            }
        });
        document.querySelectorAll('.filterTable' + index).forEach((table: HTMLElement): void => {
            table.classList.remove('hide');
            if (selectedClassName !== '') {
                if (!table.classList.contains(selectedClassName)) {
                    table.classList.add('hide');
                }
            }
        });
    }
    /** Get the timer selected @public */
    public onSetTimerSelector(getSeconds: number, nsID: string, index: number): void {
        this.vcaDetails[index].timeOutSeconds = getSeconds;
        this.callLiveData(true, nsID, index);
    }
    /** Clear settimeOut and setinterval @public */
    public clearTimeoutAndInterval(): void {
        clearTimeout(this.timeOut);
    }
    /**
     * Lifecyle hook which get trigger on component destruction
     */
    public ngOnDestroy(): void {
        this.clearTimeoutAndInterval();
        this.generateDataSub.unsubscribe();
    }
}
