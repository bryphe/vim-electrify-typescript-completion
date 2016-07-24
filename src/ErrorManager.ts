/**
 * ErrorManager.ts
 *
 * Handles managing error state, persisting it back to vim, and checking for errors
*/

import * as path from "path";
import * as fs from "fs";
import * as Promise from "bluebird";
import {TypeScriptServerHost} from "./TypeScriptServerHost"

interface IErrorInfo {
    fileName: string;
    lineNumber: number;
    startColumn: number;
    endColumn: number;
    text: string;
}

export class ErrorManager {
    private _host: TypeScriptServerHost;
    private _vim: any;
    private _lastErrors: IErrorInfo[] = [];

    constructor(vim: any, host: TypeScriptServerHost) {
        this._vim = vim;
        this._host = host;

        this._host.on("semanticDiag", (diagnostics) => {
            var file = diagnostics.file;

            var errors = diagnostics.diagnostics.map(d => {
                var text = d.text.split("'").join("`");
                text = text.split("\"").join("`");

                return {
                    fileName: file,
                    lineNumber: d.start.line,
                    startColumn: d.start.offset,
                    endColumn: d.end.offset,
                    text: text
                }
            });

            if(!this._areErrorArraysEqual(errors, this._lastErrors)) {
                this._lastErrors = errors;
                this._vim.setErrors("vim-electrify-typescript", this._lastErrors);
            }
        });
    }

    public getErrorOnLine(bufferName: string, line: number): string {
        var errorOnLine = this._lastErrors.filter(e => {
            return e.fileName === bufferName && e.lineNumber === line;
        });

        if(errorOnLine.length >= 1) {
            return errorOnLine[0].text;
        } else {
            return null;
        }
    }

    public checkForErrorsInCurrentBuffer(bufferName: string): void {
        this._host.getErrors(bufferName);
    }

    public checkForErrorsAcrossProject(bufferName: string): void {
        this._host.getErrorsAcrossProject(bufferName);
    }


    private _areErrorArraysEqual(err1: IErrorInfo[], err2: IErrorInfo[]): boolean {
        if(err1.length !== err2.length)
            return false;

        for(var i = 0; i < err1.length; i++) {
            var e1 = err1[i];
            var e2 = err2[i];

            if(!(
                e1.fileName === e2.fileName
            &&  e1.lineNumber === e2.lineNumber
            && e1.startColumn === e2.startColumn
            && e1.endColumn === e2.endColumn
            && e1.text === e2.text
            ))
                return false;
        }

        return true;
    }
}
