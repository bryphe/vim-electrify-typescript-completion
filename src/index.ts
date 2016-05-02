import path = require("path");
import fs = require("fs");

declare var vim;
declare var log;

import * as ts from "typescript";

import * as tshost from "./TypeScriptServerHost"

var host = new tshost.TypeScriptServerHost();

var cachedContents = "";

var autoCompleter = {
    onFileUpdate: (fileName: string, newContents: string) => {
        cachedContents = newContents;
        host.updateFile(fileName, newContents);
        updateSyntaxHighlighting(fileName);
    },

    getCompletions: (args) => {
        return host.getCompletions(args.currentBuffer, parseInt(args.line), parseInt(args.col) + 1).then((completionInfo) => {
            // return ["hello", "derp1", "derp2", "derp3"];
            //
            return completionInfo.map((completion) => { return { "word": completion.name, "menu": completion.kindModifiers + " " + completion.kind }; });
            // return completionInfo.map((completion) => completion.name);
        }, (err) => {
            return [];
        });
        // log.verbose(JSON.stringify(args));
        //     var project = tspm.getProjectFromFile(args.currentBuffer);

        //     if(args.tempFile) {
        //         log.verbose("Temp file specified");

        //         project.updateFile(args.currentBuffer, fs.readFileSync(args.tempFile, "utf8"));
        //     }
        // var completions = project.getCompletions(args.currentBuffer, null, args.byte);
    }
};

vim.on("BufferChanged", (args) => {
    log.info("BufferChanged: " + JSON.stringify(args));
    var fileName = args.fileName;
    var newContents = args.newContents;
    cachedContents = newContents;

    host.updateFile(fileName, newContents);
    updateSyntaxHighlighting(fileName);
});

vim.addOmniCompleter(autoCompleter);

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

vim.on("BufEnter", (args) => {
    host.openFile(args.currentBuffer);
    updateSyntaxHighlighting(args.currentBuffer);
});

vim.on("CursorMoved", (args) => {
    showQuickInfo(args);
});

vim.on("CursorMovedI", (args) => {
    showQuickInfo(args);
});

function showQuickInfo(args) {

    host.getQuickInfo(args.currentBuffer, parseInt(args.line), parseInt(args.col)).then((val: any) => {
        log.verbose("Quick info: " + JSON.stringify(val));
        var outputString = val.displayString;
        outputString = outputString.split("\n").join(" ");
        vim.echo(outputString);
    });
}


vim.addCommand("TSSaveDebug", (args) => {
    host.saveTo(args.currentBuffer, "C:/test-file.txt");
});

vim.addCommand("TSSuperDerp", (args) => {
    host.updateFile(args.currentBuffer, "DERP");
});

vim.addCommand("TSSuperUpdate", (args) => {

    host.updateFile(args.currentBuffer, cachedContents);
});

vim.addCommand("TSDefinition", (args) => {
    host.getTypeDefinition(args.currentBuffer, parseInt(args.line), parseInt(args.col)).then((val: any) => {
        val = val[0];
        vim.exec(":e! " + val.file + " | :norm " + val.start.line + "G" + val.start.offset + "| | zz");
    }, (err) => {
        vim.echo("Error: " + err);
    });
});

vim.addCommand("TSCompletions", (args) => {
    host.getCompletions(args.currentBuffer, parseInt(args.line), parseInt(args.col)).then((val: any) => {
        log.verbose("Completions: " + JSON.stringify(val));
        // vim.exec(":e " + val.file + " | :norm " + val.start.line + "G" + val.start.offset + "| | zz");
    }, (err) => {
        vim.echo("Error: " + err);
    });
});

vim.addCommand("TSQuickInfo", (args) => {
    host.getQuickInfo(args.currentBuffer, parseInt(args.line), parseInt(args.col)).then((val: any) => {
        log.verbose("Quick info: " + JSON.stringify(val));
        vim.echo(val.displayString);
        // vim.exec(":e " + val.file + " | :norm " + val.start.line + "G" + val.start.offset + "| | zz");
    }, (err) => {
        vim.echo("Error: " + err);
    });
});

vim.addCommand("TSSignatureHelp", (args) => {
    host.getSignatureHelp(args.currentBuffer, parseInt(args.line), parseInt(args.col)).then((val: any) => {
        log.verbose("Signature help" + JSON.stringify(val));
        // vim.exec(":e " + val.file + " | :norm " + val.start.line + "G" + val.start.offset + "| | zz");
    }, (err) => {
        vim.echo("Error: " + err);
    });
});

vim.addCommand("TSErrors", (args) => {
    host.getErrors(args.currentBuffer).then((val: any) => {
        // vim.exec(":e " + val.file + " | :norm " + val.start.line + "G" + val.start.offset + "| | zz");
    }, (err) => {
        vim.echo("Error: " + err);
    });
});

vim.addCommand("TSDerp", (args) => {
    host.getSignatureHelp(args.currentBuffer, parseInt(args.line), parseInt(args.col)).then((val: any) => {
        // vim.exec(":e " + val.file + " | :norm " + val.start.line + "G" + val.start.offset + "| | zz");
    }, (err) => {
        vim.echo("Error: " + err);
    });
});

vim.addCommand("TSNavigationBarItems", (args) => {
    host._makeTssRequest<void>("navbar", {
        file: args.currentBuffer
    }).then((val: any) => {
        log.info(JSON.stringify(val));
        console.log(JSON.stringify(val));
    }, (err) => {
        console.log("Error:" + err);
    });
});

vim.addCommand("TSSyntaxHighlight", (args) => {
    log.info("Syntax highlight");

    updateSyntaxHighlighting(args.currentBuffer);
});

function updateSyntaxHighlighting(file) {

    host._makeTssRequest<void>("navbar", {
        file: file
    }).then((val: any) => {
        var highlightDictionary = {};

        getAllGroups().forEach((group) => {
            highlightDictionary[group] = [];
        });

        createSyntaxHighlighting(val[0], highlightDictionary);
        vim.setSyntaxHighlighting(highlightDictionary);
        log.info("Setting syntax highlighting: " + JSON.stringify(highlightDictionary));
    }, (err) => {
        log.error(err);
    });
}

function createSyntaxHighlighting(rootNavBarItem, highlightDictionary) {
    if (!rootNavBarItem.childItems || !rootNavBarItem.childItems.length)
        return;

    rootNavBarItem.childItems.forEach((child) => {
        var group = kindToHighlightGroup[child.kind];
        if (group) {
            highlightDictionary[group].push(child.text);
        }

        createSyntaxHighlighting(child.childItems, highlightDictionary);
    });
}

var kindToHighlightGroup = {
    var: "Identifier",
    alias: "Include",
    function: "Function",
    method: "Function",
    property: "Function",
    class: "Type"
};

function getAllGroups() {
    return Object.keys(kindToHighlightGroup).map((key) => kindToHighlightGroup[key]);
}

vim.addCommand("TSProcessID", (args) => {
    vim.echo(host.pid);
});

vim.addCommand("TSGetHostProcessID", (args) => {
    vim.echo(process.pid);
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
