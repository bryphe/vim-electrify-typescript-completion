import * as path from "path";
import * as fs from "fs";
import * as Promise from "bluebird";
import {TypeScriptServerHost} from "./TypeScriptServerHost"
import {OmniCompleter} from "./OmniCompleter"

import {SyntaxHighlighter} from "./SyntaxHighlighter"
import {ErrorManager} from "./ErrorManager"

declare var vim;

var host = new TypeScriptServerHost();
var errorManager = new ErrorManager(vim, host);

var cachedContents = "";

vim.on("BufferChanged", (args) => {
    console.log("BufferChanged: " + JSON.stringify(args));
    var fileName = args.fileName;
    var newContents = args.newContents;
    cachedContents = newContents;

    host.updateFile(args.currentBuffer, newContents);
    updateSyntaxHighlighting(args.currentBuffer);

    errorManager.checkForErrorsInCurrentBuffer(args.currentBuffer);
});

vim.omniCompleters.register("typescript", new OmniCompleter(host));
vim.omniCompleters.register("javascript", new OmniCompleter(host));

vim.on("BufSavePre", (args) => {
    errorManager.checkForErrorsAcrossProject(args.currentBuffer);
});

vim.on("BufEnter", (args) => {
    host.openFile(args.currentBuffer);
    updateSyntaxHighlighting(args.currentBuffer);
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

function updateSyntaxHighlighting(file) {
    host._makeTssRequest<void>("navbar", {
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
}
