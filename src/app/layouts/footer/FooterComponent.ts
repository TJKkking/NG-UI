/**
 * @file Footer Component
 */

import { Component, Injector, OnInit } from '@angular/core';

@Component({
  selector: 'app-footer',
  templateUrl: './FooterComponent.html',
  styleUrls: ['./FooterComponent.scss']
})
/** Exporting a class @exports FooterComponent */
export class FooterComponent implements OnInit {
    /** Invoke service injectors @public */
    public injector: Injector;
    
    public ngOnInit(): void {

    }
}
