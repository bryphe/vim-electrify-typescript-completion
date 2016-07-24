import * as path from "path";
import * as fs from "fs";
import * as Promise from "bluebird";
import {TypeScriptServerHost} from "./TypeScriptServerHost"
import {OmniCompleter} from "./OmniCompleter"

import {SyntaxHighlightManager} from "./SyntaxHighlightManager"
import {ErrorManager} from "./ErrorManager"

declare var vim;

var host = new TypeScriptServerHost();
var errorManager = new ErrorManager(vim, host);
var syntaxHighlightManager = new SyntaxHighlightManager(vim, host);

vim.omniCompleters.register("typescript", new OmniCompleter(host));
vim.omniCompleters.register("javascript", new OmniCompleter(host));

vim.on("BufferChanged", (args) => {
    host.updateFile(args.currentBuffer, args.newContents);
    syntaxHighlightManager.updateSyntaxHighlighting(args.currentBuffer);
});

vim.on("BufSavePre", (args) => {
    errorManager.checkForErrorsAcrossProject(args.currentBuffer);
});

vim.on("BufEnter", (args) => {
    host.openFile(args.currentBuffer);
    syntaxHighlightManager.updateSyntaxHighlighting(args.currentBuffer);
    errorManager.checkForErrorsAcrossProject(args.currentBuffer);
});

vim.on("CursorMoved", (args) => {
    var error = errorManager.getErrorOnLine(args.currentBuffer, parseInt(args.line));
    if(error) {
        vim.echohl("ERROR: " + error, "Error");
    } else {
        showQuickInfo(args);
    }
});

function showQuickInfo(args) {
    host.getQuickInfo(args.currentBuffer, parseInt(args.line), parseInt(args.col)).then((val: any) => {
        console.log("Quick info: " + JSON.stringify(val));
        var outputString = val.displayString;
        outputString = outputString.split("\n").join(" ");
        vim.echo(outputString);
    });
}

vim.addCommand("TSDefinition", (args) => {
    host.getTypeDefinition(args.currentBuffer, parseInt(args.line), parseInt(args.col)).then((val: any) => {
        val = val[0];
        vim.openBuffer(val.file, val.start.line, val.start.offset);
    }, (err) => {
        vim.echo("Error: " + err);
    });
});
