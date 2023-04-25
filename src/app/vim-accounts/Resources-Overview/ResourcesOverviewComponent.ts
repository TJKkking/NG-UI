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

 Author: SANDHYA JS (sandhya.j@tataelxsi.co.in)
*/
/**
 * @file Resources Overview Component
 */
import { Component, Injector, Input, OnChanges } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ChartOptions, ChartType, Chart } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';
Chart.register(ChartDataLabels);
import { CONSTANTNUMBER } from 'CommonModel';
import {
    CHARTRANGE,
    CHARTVALUES,
    CONFIGRESOURCESTITLE,
    RANGECOLOR,
    RESOURCESCHARTDATA,
    RESOURCESDATA,
    VimAccountDetails
} from 'VimAccountModel';
/**
 * Creating component
 * @Component takes ResourcesOverviewComponent.html as template url
 */
@Component({
    selector: 'app-resources-overview',
    templateUrl: './ResourcesOverviewComponent.html',
    styleUrls: ['./ResourcesOverviewComponent.scss']
})
/** Exporting a class @exports ResourcesOverviewComponent */
export class ResourcesOverviewComponent implements OnChanges {
    /** To inject services @public */
    public injector: Injector;
    /** handle translate @public */
    public translateService: TranslateService;
    /** Chart Options @public */
    public chartOptions: ChartOptions = {
        responsive: true
    };
    /** Chart Lables @public */
    public chartLabels: String[] = [];
    /** Chart Type @public */
    public chartType: ChartType = 'doughnut';
    /** Chart Legend @public */
    public chartLegend: boolean = false;
    /** Input data of Resources from parent @public */
    @Input() public resourcesData: VimAccountDetails;
    /** Resources data for generating chart @public */
    public chartData: RESOURCESDATA[] = [];
    constructor(injector: Injector) {
        this.injector = injector;
        this.translateService = this.injector.get(TranslateService);
    }
    /**
     * Lifecyle Hooks the trigger while changes in the input
     */
    public ngOnChanges(): void {
        this.callChartData();
    }
    /**
     * Call the graphData
     */
    public callChartData(): void {
        this.chartLabels = [];
        this.chartLabels.push(this.translateService.instant('PAGE.VIMDETAILS.USED'), this.translateService.instant('PAGE.VIMDETAILS.FREE'));
        this.createVIMResourceChartData(this.resourcesData);
    }
    /**
     * Get the selected VIM Account Details
     * @param vimAccountData: VimAccountDetails
     */
    public createVIMResourceChartData(vimAccountData: VimAccountDetails): void {
        this.chartData = [];
        if (vimAccountData.resources !== null && vimAccountData.resources !== undefined) {
            if (vimAccountData.resources.compute !== null && vimAccountData.resources.compute !== undefined) {
                const computeList: RESOURCESCHARTDATA[] = this.createResourcesData(vimAccountData.resources.compute, 'ram');
                this.chartData.push(this.generateResourceObject('Compute', computeList.length, computeList));
            }
            if (vimAccountData.resources.storage !== null && vimAccountData.resources.storage !== undefined) {
                const storageList: RESOURCESCHARTDATA[] = this.createResourcesData(vimAccountData.resources.storage, 'null');
                this.chartData.push(this.generateResourceObject('Volume', storageList.length, storageList));
            }
            if (vimAccountData.resources.network !== null && vimAccountData.resources.network !== undefined) {
                const networkList: RESOURCESCHARTDATA[] = this.createResourcesData(vimAccountData.resources.network, 'null');
                this.chartData.push(this.generateResourceObject('Network', networkList.length, networkList));
            }
        }
    }
    /**
     * Generate the Resources Data and return @public
     * @param compute {}
     * @param keyValidate string
     * @returns RESOURCESCHARTDATA[]
     */
    public createResourcesData(compute: {}, keyValidate?: string): RESOURCESCHARTDATA[] {
        const getCompute: string[] = Object.keys(compute);
        const getData: RESOURCESCHARTDATA[] = [];
        const range: CHARTRANGE = { percentage: 100, nearlyFull: 75, full: 100 };
        getCompute.forEach((key: string): void => {
            let usedColor: string = RANGECOLOR.used;
            // eslint-disable-next-line security/detect-object-injection
            const getValuesUsedFree: number[] = Object.values(compute[key]);
            const total: number = key === keyValidate ? getValuesUsedFree[0] / CONSTANTNUMBER.oneGB : getValuesUsedFree[0];
            const used: number = key === keyValidate ? getValuesUsedFree[1] / CONSTANTNUMBER.oneGB : getValuesUsedFree[1];
            const remaining: number = total - used;
            const usedPercentage: number = (used / total) * range.percentage;
            if (usedPercentage >= range.nearlyFull && usedPercentage < range.full) {
                usedColor = RANGECOLOR.nearlyfull;
            }
            if (usedPercentage === range.full) {
                usedColor = RANGECOLOR.full;
            }
            getData.push(this.generateChartData(key, { total, used, remaining }, [usedColor, '#b9bcc3'] ));
        });
        return getData;
    }
    /**
     * Generate chart data @public
     * @param setTitle string
     * @param setValues CHARTVALUES
     * @returns RESOURCESCHARTDATA
     */
    public generateChartData(setTitle: string, setValues: CHARTVALUES, setColor: string[]): RESOURCESCHARTDATA {
        return {
            // eslint-disable-next-line security/detect-object-injection
            title: CONFIGRESOURCESTITLE[setTitle],
            values: this.generateChartDataValues(setValues.total, setValues.used, setValues.remaining),
            data: [{data: [setValues.used, setValues.remaining], backgroundColor: setColor,
                 hoverBackgroundColor: setColor, hoverBorderColor: setColor}]
        };
    }
    /**
     * Generate values for the chart data @public
     * @param setTotal number
     * @param setUsed number
     * @param setRemaining number
     * @returns CHARTVALUES
     */
    public generateChartDataValues(setTotal: number, setUsed: number, setRemaining: number): CHARTVALUES {
        return {
            total: setTotal !== null ? setTotal : 0,
            used: setUsed !== null ? setUsed : 0,
            remaining: setRemaining !== null ? setRemaining : 0
        };
    }
    /**
     * Generate the resource data object @public
     * @param setHeading string
     * @param setLength number
     * @param setData RESOURCESCHARTDATA[]
     * @returns RESOURCESDATA
     */
    public generateResourceObject(setHeading: string, setLength: number, setData: RESOURCESCHARTDATA[]): RESOURCESDATA {
        return {
            heading: setHeading,
            length: setLength,
            data: setData
        };
    }
    /**
     * Chart type can be changed
     * @param isChecked: boolean
     */
    public changeChartType(isChecked: boolean): void {
        if (isChecked) {
            this.chartType = 'pie';
        } else {
            this.chartType = 'doughnut';
        }
        this.callChartData();
    }
}
