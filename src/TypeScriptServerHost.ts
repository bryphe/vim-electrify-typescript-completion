import childProcess = require("child_process");
import fs = require("fs");
import path = require("path");
import readline = require("readline");
import os = require("os");
import Promise = require("bluebird");

declare var log;

var tssPath = path.join(__dirname, "..", "node_modules", "typescript", "lib", "tsserver.js");

export class TypeScriptServerHost {

    private _tssProcess = null;
    private _seqNumber = 0;
    private _seqToPromises = {};
    private _rl: any;

    public get pid(): number {
        return this._tssProcess.pid;
    }


    constructor() {
        this._tssProcess = childProcess.spawn("node", [tssPath], {detached: true});
        console.log("Process ID: " + this._tssProcess.pid);

        this._rl = readline.createInterface({
            input: this._tssProcess.stdout,
            output: this._tssProcess.stdin,
            terminal: false
        });

        this._tssProcess.stderr.on("data", (data, err) => {
            log.error("Error from tss: " + data);
        });

        this._rl.on("line", (msg) => {
            // log.verbose("TSS - got line: " + msg);
            // log.verbose("msg.indexOf('{')" + msg.indexOf("{"))

            if(msg.indexOf("{") === 0) {
                this._parseResponse(msg);
            }
        });
    }

    public openFile(fullFilePath: string): void {
        log.verbose("OPEN FILE");
        this._makeTssRequest("open", {
            file: fullFilePath
        });
    }

    public getProjectInfo(fullFilePath: string): void {
        this._makeTssRequest("projectInfo", {
            file: fullFilePath,
            needFileNameList: true
        });
    }


    public getTypeDefinition(fullFilePath: string, line: number, col: number): Promise<void> {
        return this._makeTssRequest<void>("typeDefinition", {
            file: fullFilePath,
            line: line,
            offset: col
        });
    }

    public getCompletions(fullFilePath: string, line: number, col: number): Promise<any> {
        return this._makeTssRequest<void>("completions", {
            file: fullFilePath,
            line: line,
            offset: col
        });
    }

    public updateFile(fullFilePath: string, updatedContents: string): Promise<void> {

        // this._makeTssRequest<void>("close", 
        //     file: fullFilePath,
        // });
        // console.log("calling open");

        // updatedContents = updatedContents.split(os.EOL).join("");
        var promise = this._makeTssRequest<void>("open", {
                file: fullFilePath,
                fileContent: updatedContents
            });

        // var tmpFile = "C:/tempfile.txt";

        //  this._makeTssRequest<void>("saveto", {
        //     file: fullFilePath,
        //     tmpfile: tmpFile
        // });

        return promise;
    }

    // public getCompletionEntryDetails(fullFilePath: string, line: number, col: number): Promise<void> {
    //     return this._makeTssRequest<void>("completionEntryDetails", {
    //         file: fullFilePath,
    //         line: line,
    //         offset: col
    //     });
    // }

    public getQuickInfo(fullFilePath: string, line: number, col: number): Promise<void> {
        return this._makeTssRequest<void>("quickinfo", {
            file: fullFilePath,
            line: line,
            offset: col
        });
    }

    public saveTo(fullFilePath: string, tmpFile: string): Promise<void> {
        return this._makeTssRequest<void>("saveto", {
            file: fullFilePath,
            tmpfile: tmpFile
        });
    }

    public getSignatureHelp(fullFilePath: string, line: number, col: number): Promise<void> {
        return this._makeTssRequest<void>("signatureHelp", {
            file: fullFilePath,
            line: line,
            offset: col
        });
    }

    public getErrors(fullFilePath: string): Promise<void> {
        return this._makeTssRequest<void>("geterr", {
            file: fullFilePath,
        });
    }

    private _makeTssRequest<T>(commandName: string, args: any): Promise<T> {
        var seqNumber = this._seqNumber++;
        var payload = {
            seq: seqNumber,
            type: "request",
            command: commandName,
            arguments: args
        };

        var ret =  this._createDeferredPromise<T>();
        this._seqToPromises[seqNumber] = ret;

        log.verbose("Sending request: " + JSON.stringify(payload));
        // this._rl.write(JSON.stringify(payload) + os.EOL);
        this._tssProcess.stdin.write(JSON.stringify(payload) + os.EOL);

        return ret.promise;
    }

    private _parseResponse(returnedData: string): void {
        var response = JSON.parse(returnedData);

        var seq = response["request_seq"];
        var success = response["success"];

        if(typeof seq === "number") {
            if(success) {
                this._seqToPromises[seq].resolve(response.body);
            } else {
                this._seqToPromises[seq].reject(response.message);
            }
        }
    }

    private _createDeferredPromise<T>(): any {
        var resolve, reject;
        var promise = new Promise(function() {
            resolve = arguments[0];
            reject = arguments[1];
        });
        return {
            resolve: resolve,
            reject: reject,
            promise: promise
        };
    }

}

