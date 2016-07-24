"use strict";
var TypeScriptServerHost_1 = require("./TypeScriptServerHost");
var OmniCompleter_1 = require("./OmniCompleter");
var SyntaxHighlightManager_1 = require("./SyntaxHighlightManager");
var ErrorManager_1 = require("./ErrorManager");
var QuickInfo_1 = require("./QuickInfo");
var host = new TypeScriptServerHost_1.TypeScriptServerHost();
var errorManager = new ErrorManager_1.ErrorManager(vim, host);
var syntaxHighlightManager = new SyntaxHighlightManager_1.SyntaxHighlightManager(vim, host);
var quickInfo = new QuickInfo_1.QuickInfo(vim, host, errorManager);
vim.omniCompleters.register("typescript", new OmniCompleter_1.OmniCompleter(host));
vim.omniCompleters.register("javascript", new OmniCompleter_1.OmniCompleter(host));
vim.on("BufferChanged", function (args) {
    host.updateFile(args.currentBuffer, args.newContents);
    syntaxHighlightManager.updateSyntaxHighlighting(args.currentBuffer);
    errorManager.checkForErrorsInCurrentBuffer(args.currentBuffer);
});
vim.on("BufWritePre", function (args) {
    errorManager.checkForErrorsAcrossProject(args.currentBuffer);
});
vim.on("BufEnter", function (args) {
    host.openFile(args.currentBuffer);
    syntaxHighlightManager.updateSyntaxHighlighting(args.currentBuffer);
    errorManager.checkForErrorsAcrossProject(args.currentBuffer);
});
vim.on("CursorMoved", function (args) {
    quickInfo.showQuickInfo(args);
});
vim.addCommand("TSDefinition", function (args) {
    host.getTypeDefinition(args.currentBuffer, parseInt(args.line), parseInt(args.col)).then(function (val) {
        val = val[0];
        vim.openBuffer(val.file, val.start.line, val.start.offset);
    }, function (err) {
        vim.echo("Error: " + err);
    });
});
