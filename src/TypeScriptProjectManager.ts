import fs = require("fs");
import path = require("path");

import * as ts from "typescript";

import TypeScriptLanguageServiceHost from "./TypeScriptLanguageServiceHost"

var libPath = path.join(__dirname, "..", "node_modules", "typescript", "lib", "lib.d.ts");

export interface IDefinition {
    fileName: string;
    byteOffset: number;
}

export interface ICompletionInfo {
    word: string;
}

export interface ITypeScriptProject {
    getDefinition(fileFullPath: string, byteOffset: number);
    getCompletions(fileFullPath: string, incrementalEdits: string[], byteOffset: number): ICompletionInfo[];

    updateFile(fileFullPath: string, text: string): void;
}

export class TypeScriptProject implements ITypeScriptProject {
    private _host: TypeScriptLanguageServiceHost;
    private _services: ts.LanguageService;
    private _fileToFullPathMapping = {};
    
    constructor(rootPathName: string) {
        var host = new TypeScriptLanguageServiceHost();
        this._services = ts.createLanguageService(host, ts.createDocumentRegistry());

        // TODO: Populate files based on strategy (gulpfile, tsconfig, or none)
        // TODO: Incrementally look for / add files?
        host.addFile("lib.d.ts", fs.readFileSync(libPath, "utf8"));
        host.addFile(rootPathName, fs.readFileSync(rootPathName, "utf8"));

        this._host = host;

        this._fileToFullPathMapping["lib.d.ts"] = libPath;
    }
    public getDefinition(fileFullPath: string, byteOffset: number): IDefinition {
        var definitionInfo = this._services.getDefinitionAtPosition(fileFullPath, byteOffset);

        console.log(JSON.stringify(definitionInfo));
        if(!definitionInfo || !definitionInfo.length)
            return null;

        var definition = definitionInfo[0];

        return {
            fileName: this._getFullPath(definition.fileName),
            byteOffset: definition.textSpan.start + 1
        };
    }

    public updateFile(fileFullPath: string, text: string): void {
        this._host.addFile(fileFullPath, text);
    }

    public getCompletions(fileFullPath: string, incrementalEdits: string[], byteOffset: number): ICompletionInfo[] {

        console.log("get completions called with arguments"+ JSON.stringify(arguments));
        var completions = this._services.getCompletionsAtPosition(fileFullPath, byteOffset);

        if(!completions || !completions.entries)
            return null;

        console.log("COMPLETIONS DERP: " +  completions.entries.length);
        var ret = [];
        completions.entries.forEach((entry) => {
            ret.push(entry.name);
        });

        return ret;
    }

    private _getFullPath(file: string): string {
        if(this._fileToFullPathMapping[file])
            return this. _fileToFullPathMapping[file];

        return file;
    }
}


export function getProjectFromFile(fileName: string): ITypeScriptProject {

    return new TypeScriptProject(fileName);
}


