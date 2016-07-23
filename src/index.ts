import path = require("path");
import fs = require("fs");

import Promise = require("bluebird");


import * as ts from "typescript";
import * as tshost from "./TypeScriptServerHost"
import * as omni from "./OmniCompleter"
import {SyntaxHighlighter} from "./SyntaxHighlighter"

declare var vim;

var host = new tshost.TypeScriptServerHost();

var cachedContents = "";

host.on("semanticDiag", (diagnostics) => {
    var file = diagnostics.file;

    var errors = diagnostics.diagnostics.map(d => {

        var text = d.text.split("'").join("`");

        return {
            fileName: file,
            lineNumber: d.start.line,
            startColumn: d.start.offset,
            endColumn: d.end.offset,
            text: text
        }
    });

    vim.setErrors("vim-electrify-typescript", errors);
});

vim.on("BufferChanged", (args) => {
    if (args.filetype !== "javascript" && args.filetype !== "typescript")
        return;

    console.log("BufferChanged: " + JSON.stringify(args));
    var fileName = args.fileName;
    var newContents = args.newContents;
    cachedContents = newContents;

    host.updateFile(args.currentBuffer, newContents);
    updateSyntaxHighlighting(args.currentBuffer);

    host.getErrors(args.currentBuffer);
});

vim.omniCompleters.register("typescript", new omni.OmniCompleter(host));
vim.omniCompleters.register("javascript", new omni.OmniCompleter(host));

vim.on("BufEnter", (args) => {
    if (args.filetype !== "javascript" && args.filetype !== "typescript")
        return;

    host.openFile(args.currentBuffer);
    updateSyntaxHighlighting(args.currentBuffer);
    host.getErrors(args.currentBuffer);

});

vim.on("CursorMoved", (args) => {
    if (args.filetype !== "javascript" && args.filetype !== "typescript")
        return;

    showQuickInfo(args);
});

vim.on("CursorMovedI", (args) => {
    if (args.filetype !== "javascript" && args.filetype !== "typescript")
        return;

    showQuickInfo(args);
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

        // TODO: Consider porting back to vim API
        vim.exec(":e! " + val.file);
        vim.exec(":keepjumps norm " + val.start.line + "G" + val.start.offset);
        vim.exec(":norm zz");
        vim.exec(":redraw");
    }, (err) => {
        vim.echo("Error: " + err);
    });
});

vim.addCommand("TSErrors", (args) => {
    host.getErrors(args.currentBuffer).then((val: any) => {
        console.log("Return")
        // vim.exec(":e " + val.file + " | :norm " + val.start.line + "G" + val.start.offset + "| | zz");
    }, (err) => {
        vim.echo("Error: " + err);
    });
});

vim.addCommand("TSSyntaxHighlight", (args) => {
    console.log("Syntax highlight");

    updateSyntaxHighlighting(args.currentBuffer);
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
