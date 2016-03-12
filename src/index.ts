import path = require("path");
import fs = require("fs");

declare var vim;
import * as ts from "typescript";

import * as tspm from "./TypeScriptProjectManager"


vim.addCommand("TSDefinition", (args) => {

    var project = tspm.getProjectFromFile(args.currentBuffer);

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
