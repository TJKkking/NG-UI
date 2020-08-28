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
 * @file Vim Account Component.
 */
import { Component, Injector, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { CONFIGCONSTANT, CONSTANTNUMBER, ERRORDATA, VIM_TYPES } from 'CommonModel';
import { DataService } from 'DataService';
import { environment } from 'environment';
import { LocalDataSource } from 'ng2-smart-table';
import { NSInstanceDetails } from 'NSInstanceModel';
import Feature from 'ol/Feature';
import Point from 'ol/geom/Point';
import { defaults as defaultInteractions } from 'ol/interaction';
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer';
import Map from 'ol/Map';
import Overlay from 'ol/Overlay';
import { fromLonLat } from 'ol/proj.js';
import OSM from 'ol/source/OSM';
import VectorSource from 'ol/source/Vector';
import { Icon, Style } from 'ol/style';
import View from 'ol/View';
import { RestService } from 'RestService';
import { Subscription } from 'rxjs';
import { SharedService } from 'SharedService';
import { VimAccountDetails, VIMData } from 'VimAccountModel';
import { VimAccountsActionComponent } from 'VimAccountsAction';
/**
 * Creating component
 * @Component takes VimAccountDetailsComponent.html as template url
 */
@Component({
    selector: 'app-vim-account-details',
    templateUrl: './VimAccountDetailsComponent.html',
    styleUrls: ['./VimAccountDetailsComponent.scss']
})
/** Exporting a class @exports VimAccountDetailsComponent */
export class VimAccountDetailsComponent implements OnInit {
    /** To inject services @public */
    public injector: Injector;
    /** handle translate @public */
    public translateService: TranslateService;
    /** initially show the map container@public */
    public showMap: boolean;
    /**  hide and show popup @public */
    public popupShow: boolean = false;
    /** Data of smarttable populate through LocalDataSource @public */
    public dataSource: LocalDataSource = new LocalDataSource();
    /** Columns list of the smart table @public */
    public columnLists: object = {};
    /** Settings for smarttable to populate the table with columns @public */
    public settings: object = {};
    /** initially hide the list@private */
    public showList: boolean;
    /** to store locations name @public */
    public getLocation: GetLocation[];
    /** Contains content for map popup @public */
    public popupData: string;
    /** Check the loading results @public */
    public isLoadingResults: boolean = true;
    /** Give the message for the loading @public */
    public message: string = 'PLEASEWAIT';
    /** Class for empty and present data @public */
    public checkDataClass: string;
    /** Formation of appropriate Data for LocalDatasource @public */
    public vimData: VIMData[];
    /** operational State init data @public */
    public operationalStateFirstStep: string = CONFIGCONSTANT.vimOperationalStateFirstStep;
    /** operational State running data @public */
    public operationalStateSecondStep: string = CONFIGCONSTANT.vimOperationalStateStateSecondStep;
    /** operational State failed data @public */
    public operationalStateThirdStep: string = CONFIGCONSTANT.vimOperationalStateThirdStep;
    /** NS Instances operational State failed data @public */
    public nsinstancesoperationalStateRunning: string = CONFIGCONSTANT.operationalStateSecondStep;
    /** Instance of the rest service @private */
    private restService: RestService;
    /** dataService to pass the data from one component to another @private */
    private dataService: DataService;
    /** Contains all methods related to shared @private */
    private sharedService: SharedService;
    /** Holds the instance of router class @private */
    private router: Router;
    /** ns INstance Data @private */
    private nsData: NSInstanceDetails[];
    /** map object @private */
    private map: Map;
    /**  used to bind marker @private */
    private vectorSource: VectorSource;
    /** used to bind vectorSource @private */
    private vectorLayer: VectorLayer;
    /** marker @private */
    private marker: Feature;
    /** latitude @private */
    private lat: number;
    /** longitude @private */
    private lng: number;
    /**  each vector layer of marker is pushed to layers array @private */
    private layers: VectorLayer[] = [];
    /** locationData @private */
    private locationData: VimAccountDetails[];
    /** popup array @private */
    private overLay: Overlay[] = [];
    /** Instance of subscriptions @private */
    private generateDataSub: Subscription;

    constructor(injector: Injector) {
        this.injector = injector;
        this.restService = this.injector.get(RestService);
        this.dataService = this.injector.get(DataService);
        this.sharedService = this.injector.get(SharedService);
        this.router = this.injector.get(Router);
        this.translateService = this.injector.get(TranslateService);
    }
    /** Lifecyle Hooks the trigger before component is instantiate @public */
    public ngOnInit(): void {
        this.osmMapView();
        this.listView();
        this.generateColumns();
        this.generateSettings();
        this.generateData();
        this.generateDataSub = this.sharedService.dataEvent.subscribe(() => { this.generateData(); });
    }

    /** smart table Header Colums @public */
    public generateColumns(): void {
        this.columnLists = {
            name: { title: this.translateService.instant('NAME'), width: '15%', sortDirection: 'asc' },
            identifier: { title: this.translateService.instant('IDENTIFIER'), width: '25%' },
            type: {
                title: this.translateService.instant('TYPE'), width: '15%',
                filter: {
                    type: 'list',
                    config: {
                        selectText: 'Select',
                        list: VIM_TYPES
                    }
                }
            },
            operationalState: {
                title: this.translateService.instant('OPERATIONALSTATUS'), width: '15%', type: 'html',
                filter: {
                    type: 'list',
                    config: {
                        selectText: 'Select',
                        list: [
                            { value: this.operationalStateFirstStep, title: this.operationalStateFirstStep },
                            { value: this.operationalStateSecondStep, title: this.operationalStateSecondStep },
                            { value: this.operationalStateThirdStep, title: this.operationalStateThirdStep }
                        ]
                    }
                },
                valuePrepareFunction: (cell: VIMData, row: VIMData): string => {
                    if (row.operationalState === this.operationalStateFirstStep) {
                        return `<span class="icon-label" title="${row.operationalState}">
                        <i class="fas fa-clock text-warning"></i>
                        </span>`;
                    } else if (row.operationalState === this.operationalStateSecondStep) {
                        return `<span class="icon-label" title="${row.operationalState}">
                        <i class="fas fa-check-circle text-success"></i>
                        </span>`;
                    } else if (row.operationalState === this.operationalStateThirdStep) {
                        return `<span class="icon-label" title="${row.operationalState}">
                        <i class="fas fa-times-circle text-danger"></i>
                        </span>`;
                    } else {
                        return `<span>${row.operationalState}</span>`;
                    }
                }
            },
            description: { title: this.translateService.instant('DESCRIPTION'), width: '25%' },
            Actions: {
                name: 'Action', width: '5%', filter: false, sort: false, title: this.translateService.instant('ACTIONS'), type: 'custom',
                valuePrepareFunction: (cell: VIMData, row: VIMData): VIMData => row,
                renderComponent: VimAccountsActionComponent
            }
        };
    }

    /** smart table Data Settings @public */
    public generateSettings(): void {
        this.settings = {
            edit: {
                editButtonContent: '<i class="fa fa-edit" title="Edit"></i>',
                confirmSave: true
            },
            delete: {
                deleteButtonContent: '<i class="far fa-trash-alt" title="delete"></i>',
                confirmDelete: true
            },
            columns: this.columnLists,
            actions: {
                add: false,
                edit: false,
                delete: false,
                position: 'right'
            },
            attr: this.sharedService.tableClassConfig(),
            pager: this.sharedService.paginationPagerConfig(),
            noDataMessage: this.translateService.instant('NODATAMSG')
        };
    }

    /** smart table listing manipulation @public */
    public onChange(perPageValue: number): void {
        this.dataSource.setPaging(1, perPageValue, true);
    }

    /** smart table listing manipulation @public */
    public onUserRowSelect(event: MessageEvent): void {
        Object.assign(event.data, { page: 'vim-account' });
        this.dataService.changeMessage(event.data);
    }

    /** on Navigate to Composer Page @public */
    public composeVIM(): void {
        this.router.navigate(['vim/new']).catch(() => {
            //empty block
        });
    }

    /** To show map conatainer @public */
    public mapView(): void {
        this.showList = true;
        this.showMap = false;
    }
    /** To show listview @public */
    public listView(): void {
        this.showMap = true;
        this.showList = false;
    }
    /** Load the datasource appropriatetype @public */
    public loadDatasource(getdata: VIMData[]): void {
        if (getdata.length > 0) {
            this.checkDataClass = 'dataTables_present';
        } else {
            this.checkDataClass = 'dataTables_empty';
        }
        this.dataSource.load(getdata).then((data: boolean) => {
            //empty block
        }).catch(() => {
            //empty block
        });
    }

    /** Generate generateVIMData object from loop and return for the datasource @public */
    public generateVIMData(vimAccountData: VimAccountDetails): VIMData {
        return {
            name: vimAccountData.name,
            identifier: vimAccountData._id,
            type: vimAccountData.vim_type,
            operationalState: vimAccountData._admin.operationalState,
            description: vimAccountData.description,
            instancesData: this.nsData
        };
    }

    /**
     * Lifecyle hook which get trigger on component destruction
     */
    public ngOnDestroy(): void {
        this.generateDataSub.unsubscribe();
    }

    /** Fetching the data from server to Load in the smarttable @protected */
    private generateData(): void {
        this.isLoadingResults = true;
        this.vimData = [];
        this.getNSData().then((): void => {
            this.restService.getResource(environment.VIMACCOUNTS_URL).subscribe((vimAccountsData: VimAccountDetails[]) => {
                this.locationData = vimAccountsData;
                vimAccountsData.forEach((vimAccountData: VimAccountDetails) => {
                    const vimDataObj: VIMData = this.generateVIMData(vimAccountData);
                    this.vimData.push(vimDataObj);
                });
                this.loadDatasource(this.vimData);
                this.removeLayersOverLay();
                this.arrayOfLocation();
                this.isLoadingResults = false;
            }, (error: ERRORDATA) => {
                this.restService.handleError(error, 'get');
                this.isLoadingResults = false;
            });
        }).catch((error: ERRORDATA): void => {
            this.restService.handleError(error, 'get');
            this.isLoadingResults = false;
        });
    }

    /** fetching the nsdata @private */
    private async getNSData(): Promise<Boolean> {
        return new Promise<Boolean>((resolve: Function, reject: Function): void => {
            this.nsData = [];
            this.restService.getResource(environment.NSDINSTANCES_URL).subscribe((nsdInstancesData: NSInstanceDetails[]) => {
                const nsRunningInstancesData: NSInstanceDetails[] = nsdInstancesData.filter((instancesData: NSInstanceDetails) =>
                    instancesData['operational-status'] === this.nsinstancesoperationalStateRunning);
                this.nsData = nsRunningInstancesData;
                resolve(true);
            }, (error: ERRORDATA) => {
                this.restService.handleError(error, 'get');
                resolve(true);
            });
        });
    }

    /** create map view @private */
    private osmMapView(): void {
        this.map = new Map({
            target: 'map',
            layers: [new TileLayer({
                source: new OSM()
            })],
            interactions: defaultInteractions({
                mouseWheelZoom: true
            }),
            view: new View({
                center: fromLonLat([CONSTANTNUMBER.osmapviewlong, CONSTANTNUMBER.osmapviewlat]),
                zoom: 3,
                minZoom: 1.5
            })
        });
    }

    /** remove the layers and overlay @private */
    private removeLayersOverLay(): void {
        this.layers.forEach((layer: VectorLayer) => {
            this.map.removeLayer(layer);
        });
        this.overLay.forEach((lay: Overlay) => {
            this.map.removeOverlay(lay);
        });
    }

    /** filter locations from vimaccounts @private */
    private arrayOfLocation(): void {
        this.getLocation = [];
        this.locationData.filter((item: VimAccountDetails) => {
            if (item.hasOwnProperty('config')) {
                if (item.config.hasOwnProperty('location')) {
                    this.getLocation.push({ name: item.name, location: item.config.location, id: item._id });
                }
            }
        });
        if (this.getLocation !== []) {
            this.getLocation.filter((loc: GetLocation) => {
                if (loc.location !== '') {
                    const getLatLong: string[] = loc.location.split(',');
                    this.lng = +getLatLong[CONSTANTNUMBER.splitLongitude];
                    this.lat = +getLatLong[CONSTANTNUMBER.splitLatitude];
                    this.addMarker(getLatLong[0], loc.id, loc.name);
                }
            });
        }
    }
    /** add markers on map @private */
    private addMarker(loc: string, id: string, name: string): void {
        const container: HTMLElement = document.getElementById('popup');
        const closer: HTMLElement = document.getElementById('popup-closer');
        this.popupShow = true;
        const overlay: Overlay = this.addOverlay(container);
        this.marker = this.addFeature(loc, id, name);
        this.setStyleMarker();
        this.setVectorSource();
        this.setVectorLayer();
        this.map.addLayer(this.vectorLayer);
        this.layers.push(this.vectorLayer);
        if (this.layers.length === 1) {
            this.markerClickEvent(closer, overlay);
        }
    }
    /** Create an overlay to anchor the popup to the map @private */
    private addOverlay(container: HTMLElement): Overlay {
        return new Overlay({
            element: container,
            autoPan: true,
            autoPanAnimation: {
                duration: 250
            }
        });
    }
    /** Return the Feature of creating a marker in the map @private */
    private addFeature(loc: string, id: string, name: string): Feature {
        return new Feature({
            geometry: new Point(fromLonLat([this.lng, this.lat])),
            location: loc,
            Id: id,
            vimName: name
        });
    }
    /** Set the style of the marker @private */
    private setStyleMarker(): void {
        this.marker.setStyle(new Style({
            image: new Icon(({
                crossOrigin: 'anonymous',
                src: 'assets/images/map-icon.png'
            }))
        }));
    }
    /** Set the map vector source @private */
    private setVectorSource(): void {
        this.vectorSource = new VectorSource({
            features: [this.marker]
        });
    }
    /** Set the map vector layer @private */
    private setVectorLayer(): void {
        this.vectorLayer = new VectorLayer({
            source: this.vectorSource
        });
    }
    /** Add a click handler to the map to render the popup. @private */
    private markerClickEvent(closer: HTMLElement, overlay: Overlay): void {
        // tslint:disable-next-line: no-any
        this.map.on('singleclick', (evt: any) => {
            const feature: Feature = this.map.forEachFeatureAtPixel(evt.pixel,
                (f: Feature) => {
                    return f;
                });
            if (feature) {
                this.setCoordinates(feature, overlay);
            } else {
                this.map.removeOverlay(overlay);
            }
        });
        /** Handle close event for overlay */
        closer.onclick = (): boolean => {
            overlay.setPosition(undefined);
            closer.blur();
            return false;
        };
    }
    /** Set the coordinates point if the feature is available @private */
    // tslint:disable-next-line: no-any
    private setCoordinates(feature: any, overlay: Overlay): void {
        this.popupData = '';
        this.popupData += '<h3 class="popover-header">' + feature.values_.vimName + '</h3>';
        this.popupData += '<ul class="list-unstyled m-2">';
        const instnaceData: NSInstanceDetails[] = this.nsData.filter((item: NSInstanceDetails) => {
            if (item.datacenter === feature.values_.Id) {
                this.popupData += '<li class="m-2"><a class="d-block text-truncate" target="_parent" href="instances/ns/' + item._id + '">'
                    + item.name + '</a></li>';
                return item;
            }
        });
        if (instnaceData.length === 0) {
            this.popupData += '<li class="m-2">' + this.translateService.instant('PAGE.DASHBOARD.NOINSTANCES') + '</li>';
        }
        this.popupData += '</ul>';
        const coordinates: number[] = feature.getGeometry().getCoordinates();
        overlay.setPosition(coordinates);
        this.overLay.push(overlay);
        this.map.addOverlay(overlay);
    }
}

/** interface for get location */
interface GetLocation {
    location: string;
    id: string;
    name?: string;
}
