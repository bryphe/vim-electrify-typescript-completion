import {TypeScriptServerHost} from "./TypeScriptServerHost"
import {SyntaxHighlighter} from "./SyntaxHighlighter"
import * as _ from "lodash";

export class SyntaxHighlightManager {
    private _vim: any;
    private _host: TypeScriptServerHost;

    constructor(vim: any; host: TypeScriptServerHost) {
        this._vim = vim;
        this._host = host;
    }

    public updateSyntaxHighlighting(file: string): void {
        _.debounce(() => {
            this._host._makeTssRequest<void>("navbar", {
                file: file
            }).then((val: any) => {

                console.log("Got highlighting result: " + JSON.stringify(val));

                var syntaxHighlighter = new SyntaxHighlighter();
                var highlighting = syntaxHighlighter.getSyntaxHighlighting(val);

                vim.setSyntaxHighlighting(highlighting);
                console.log("Setting syntax highlighting: " + JSON.stringify(highlighting));
            }, (err) => {
                console.error(err);
            });
        }, 100);
    }
}
