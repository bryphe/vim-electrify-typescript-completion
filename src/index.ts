import path = require("path");
import fs = require("fs");

declare var vim;
import * as ts from "typescript";

import * as tspm from "./TypeScriptProjectManager"

var autoCompleter = {
    getCompletions: (args) => {
        console.log(JSON.stringify(args));
            var project = tspm.getProjectFromFile(args.currentBuffer);

            if(args.tempFile) {
                console.log("Temp file specified");

                project.updateFile(args.currentBuffer, fs.readFileSync(args.tempFile, "utf8"));
            }
        var completions = project.getCompletions(args.currentBuffer, null, args.byte);
        return completions;
    }
};

vim.addOmniCompleter(autoCompleter);

vim.addCommand("TSDefinition", (args) => {

    var project = tspm.getProjectFromFile(args.currentBuffer);
    project.updateFile(args.currentBuffer, fs.readFileSync(args.currentBuffer, "utf8"));

    var def = (project.getDefinition(args.currentBuffer, args.byte));
    console.log(def);
    
    if(def) {
        vim.exec(":e " + def.fileName + " | " + "goto " + def.byteOffset);
    }

    // var host = new TypeScriptLanguageServiceHost();
    // var services = ts.createLanguageService(host, ts.createDocumentRegistry());

    // host.addFile("lib.d.ts", fs.readFileSync(libPath, "utf8"));
    // host.addFile(args.currentBuffer, fs.readFileSync(args.currentBuffer, "utf8"));

    // var definition = services.getDefinitionAtPosition(args.currentBuffer, args.byte);

    // if(definition) {
    //     console.log(JSON.stringify(definition));
    // } else {
    //     vim.echo("TS: Unable to locate definition.");
    // }

    // var completions = services.getCompletionsAtPosition(args.currentBuffer, args.byte);

    // console.log(JSON.stringify(completions));

});

vim.addCommand("TSGetCompletions", (args) => {
    console.log("TSGETCOMPLETIONS!");
    
    var project = tspm.getProjectFromFile(args.currentBuffer);

    var completions = project.getCompletions(args.currentBuffer, null, args.byte);
    console.log("Completion count: " + completions.length);
});
