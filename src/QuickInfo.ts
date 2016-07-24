/**
 * QuickInfo.ts
 *
 * Show QuickInfo (or error) as cursor moves in normal mode
 */
import {TypeScriptServerHost} from "./TypeScriptServerHost"
import {ErrorManager} from "./ErrorManager"

export class QuickInfo {
    private _host: TypeScriptServerHost;
    private _errorManager: ErrorManager;
    private _vim: any;

    constructor(vim: any, host: TypeScriptServerHost, errorManager: ErrorManager) {
        this._vim = vim;
        this._host = host;
        this._errorManager = errorManager;
    }

    public showQuickInfo(args): void {
        var error = this._errorManager.getErrorOnLine(args.currentBuffer, parseInt(args.line));
        if(error) {
            this._vim.echohl("ERROR: " + error, "Error");
        } else {
            this._showQuickInfo(args);
        }
    }

    private _showQuickInfo(args): void {
        this._host.getQuickInfo(args.currentBuffer, parseInt(args.line), parseInt(args.col)).then((val: any) => {
            console.log("Quick info: " + JSON.stringify(val));
            var outputString = val.displayString;

            // Truncate display string if over 100 characters
            outputString = outputString.substring(0, 100);

            outputString = outputString.split("\n").join(" ");
            this._vim.echo(outputString);
        });
    }
}
