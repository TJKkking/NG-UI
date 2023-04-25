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
 * @file Drag and Drop feature.
 */
import { Directive, EventEmitter, HostBinding, HostListener, Output } from '@angular/core';
import { DomSanitizer, SafeUrl } from '@angular/platform-browser';

/** Interface for FileHandle */
export interface FileHandle {
  file: File;
  url: SafeUrl;
}

/**
 * Creating Directive
 * @Directive for handling the files.
 */
@Directive({
  selector: '[appDrag]'
})
/** Exporting a class @exports DragDirective */
export class DragDirective {
  /** To publish the details of files @public */
  @Output() public files: EventEmitter<FileList> = new EventEmitter();

  /** To set the background of drag and drop region @public */
  @HostBinding('style.background') private background: string = '#e6f3fe';

  /** To set the background of drag and drop region @public */
  @HostBinding('style.color') private color: string = '#6a7a8c';

  /** To trust the SecurityURL @public */
  private sanitizer: DomSanitizer;

  constructor(sanitizer: DomSanitizer) {
    this.sanitizer = sanitizer;
  }

  /** To handle the Drag over Event @public */
  @HostListener('dragover', ['$event']) public onDragOver(evt: DragEvent): void {
    evt.preventDefault();
    evt.stopPropagation();
    this.background = '#087add';
    this.color = '#fff';
  }
  /** To handle Drag leave Event @public */
  @HostListener('dragleave', ['$event']) public onDragLeave(evt: DragEvent): void {
    evt.preventDefault();
    evt.stopPropagation();
    this.background = '#e6f3fe';
    this.color = '#6a7a8c';
  }
  /** To handle Drop Event @public */
  @HostListener('drop', ['$event']) public onDrop(evt: DragEvent): void {
    evt.preventDefault();
    evt.stopPropagation();
    this.background = '#e6f3fe';
    this.color = '#6a7a8c';

    const files: FileHandle[] = [];
    Array.from(evt.dataTransfer.files).forEach((listFiles: File, index: number) => {
      const file: File = listFiles;
      // eslint-disable-next-line @microsoft/sdl/no-angular-bypass-sanitizer
      const url: SafeUrl = this.sanitizer.bypassSecurityTrustUrl(window.URL.createObjectURL(file));
      files.push({ file, url });
    });
    if (files.length > 0) {
      this.files.emit(evt.dataTransfer.files);
    }
  }
}
