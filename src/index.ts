/// <reference path="typings/main/ambient/node/node.d.ts" />
import path = require("path");
import fs = require("fs");

declare var vim;
declare var log;

import * as ts from "typescript";

import * as tshost from "./TypeScriptServerHost"

var host = new tshost.TypeScriptServerHost();

// var autoCompleter = {
//     getCompletions: (args) => {
//         log.verbose(JSON.stringify(args));
//             var project = tspm.getProjectFromFile(args.currentBuffer);

//             if(args.tempFile) {
//                 log.verbose("Temp file specified");

//                 project.updateFile(args.currentBuffer, fs.readFileSync(args.tempFile, "utf8"));
//             }
//         var completions = project.getCompletions(args.currentBuffer, null, args.byte);
//         return completions;
//     }
// };

// vim.addOmniCompleter(autoCompleter);

vim.addCommand("TSDefinition", (args) => {
    host.openFile(args.currentBuffer);
    host.getTypeDefinition(args.currentBuffer, parseInt(args.line), parseInt(args.col)).then((val: any) => {
        vim.exec(":e " + val.file + " | :norm " + val.start.line + "G" + val.start.offset + "|");
    }, (err) => {
        vim.echo("Error: " + err);
    });
});

// vim.addCommand("TSGetCompletions", (args) => {
//     console.log("TSGETCOMPLETIONS!");
    
//     var project = tspm.getProjectFromFile(args.currentBuffer);

//     var completions = project.getCompletions(args.currentBuffer, null, args.byte);
//     if(completions)
//         console.log("Completion count: " + completions.length);
//     else
//         console.log("No completions");
// });
