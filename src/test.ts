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
 * @file This file is required by karma.conf.js and loads recursively all the .spec and framework files.
 */
import { getTestBed } from '@angular/core/testing';
import {
    BrowserDynamicTestingModule,
    platformBrowserDynamicTesting
} from '@angular/platform-browser-dynamic/testing';
import 'zone.js/dist/zone-testing';

/** const variable require */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare const require: any;

// First, initialize the Angular testing environment.
getTestBed().initTestEnvironment(
    BrowserDynamicTestingModule,
    platformBrowserDynamicTesting(), {
    teardown: { destroyAfterEach: false }
}
);

/** const variable context */
// Then we find all the tests.
const context = require.context('./', true, /\.spec\.ts$/);
// And load the modules.
context.keys().map(context);
