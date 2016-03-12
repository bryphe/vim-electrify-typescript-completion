import path = require("path");
import fs = require("fs");

import * as ts from "typescript";


export default class TypeScriptLanguageServiceHost implements ts.LanguageServiceHost {
    private _files: { [filename: string]: { file: ts.IScriptSnapshot; ver: number} } = {};

    public getScriptFileNames(): string[] {
        var names: string[] = [];
        for(var name in this._files) {
            if(this._files.hasOwnProperty(name)) {
                names.push(name);
            }
        }

        console.log("getScriptFileNames:" + names);
        return names;
    }

    public getScriptVersion(fileName: string): string {
        console.log("Getting script version: " + fileName);
        return this._files[fileName].ver.toString();
    }

    public getScriptSnapshot(fileName: string): ts.IScriptSnapshot {
        console.log("Getting snapshot: " + fileName);
        return this._files[fileName].file;
    }

    public getCompilationSettings(): ts.CompilerOptions {
        return ts.getDefaultCompilerOptions();
    }

    public getCurrentDirectory(): string {
        return "";
    }

    public getDefaultLibFileName(options): string {
        return "lib";
    }

    public addFile(fileName: string, body: string): void {
        var snap = ts.ScriptSnapshot.fromString(body);
        snap.getChangeRange = _ => undefined;
        var existing = this._files[fileName];
        if(existing) {
            this._files[fileName].ver++;
            this._files[fileName].file = snap;
        } else {
            this._files[fileName] = { ver: 1, file: snap };
        }
    }

}
