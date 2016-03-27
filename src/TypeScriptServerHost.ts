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


    constructor() {
        this._tssProcess = childProcess.spawn("node", [tssPath], {detached: true});

        this._rl = readline.createInterface({
            input: this._tssProcess.stdout,
            output: this._tssProcess.stdin
        });

        this._tssProcess.stderr.on("data", (data, err) => {
            log.error("Error from tss: " + data);
        });

        this._rl.on("line", (msg) => {
            log.verbose("TSS - got line: " + msg);
            log.verbose("msg.indexOf('{')" + msg.indexOf("{"))

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

    // TODO: Make this a promise
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
        this._tssProcess.stdin.write(JSON.stringify(payload) + os.EOL);

        return ret.promise;
        // this._rl.write(JSON.stringify(payload));
    }

    private _parseResponse(returnedData: string): void {
        var response = JSON.parse(returnedData);

        var seq = response["request_seq"];
        var success = response["success"];

        if(typeof seq === "number") {
            if(success) {
                this._seqToPromises[seq].resolve(response.body[0]);
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

