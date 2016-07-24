import * as path from "path";
import * as fs from "fs";
import * as Promise from "bluebird";
import {TypeScriptServerHost} from "./TypeScriptServerHost"
import {OmniCompleter} from "./OmniCompleter"

import {SyntaxHighlightManager} from "./SyntaxHighlightManager"
import {ErrorManager} from "./ErrorManager"
import {QuickInfo} from "./QuickInfo";

var host = new TypeScriptServerHost();
var errorManager = new ErrorManager(vim, host);
var syntaxHighlightManager = new SyntaxHighlightManager(vim, host);
var quickInfo = new QuickInfo(vim, host, errorManager);

vim.omniCompleters.register("typescript", new OmniCompleter(host));
vim.omniCompleters.register("javascript", new OmniCompleter(host));

vim.on("BufferChanged", (args) => {
    host.updateFile(args.currentBuffer, args.newContents);
    syntaxHighlightManager.updateSyntaxHighlighting(args.currentBuffer);
});

vim.on("BufWritePre", (args) => {
    errorManager.checkForErrorsAcrossProject(args.currentBuffer);
});

vim.on("BufEnter", (args) => {
    host.openFile(args.currentBuffer);
    syntaxHighlightManager.updateSyntaxHighlighting(args.currentBuffer);
    errorManager.checkForErrorsAcrossProject(args.currentBuffer);
});

vim.on("CursorMoved", (args) => {
    quickInfo.showQuickInfo(args);
});

vim.on("CursorMovedI", (args) => {
    errorManager.clearErrorOnLine(args.currentBuffer, parseInt(args.line));
});

vim.addCommand("TSDefinition", (args) => {
    host.getTypeDefinition(args.currentBuffer, parseInt(args.line), parseInt(args.col)).then((val: any) => {
        val = val[0];
        vim.openBuffer(val.file, val.start.line, val.start.offset);
    }, (err) => {
        vim.echo("Error: " + err);
    });
});

import * as events from "events";

declare var vim: Vim;

export interface OmniCompletionManager {
    register(fileType: string, omniCompleter: any);
}

export interface Vim extends events.EventEmitter {
    omniCompleters: OmniCompletionManager;
    addCommand(commandName: string, callbackFunction: Function);
    openBuffer(bufferPath: string, line?: number, column?: number);
    echo(message: string);
}
