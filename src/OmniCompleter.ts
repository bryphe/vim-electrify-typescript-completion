import Promise = require("bluebird");

declare var log;

import * as tshost from "./TypeScriptServerHost"

var DisplayPartsParser = require("./DisplayPartsParser");

export interface EventContext {
    col: string;
    line: string;
    lineContents: string;
    currentBuffer: string;
}

interface CompletionContext {
    col: number;
    line: number;
    currentCharacter: string;
    previousCharacter: string;
}

interface CompletionEntryDetails {
    [name: string]: any;
}

export class OmniCompleter {

    private _host: tshost.TypeScriptServerHost;

    constructor(host: tshost.TypeScriptServerHost) {
        this._host = host;
    }

    public getCompletions(eventContext: EventContext): Promise<any> {
        var col = parseInt(eventContext.col);
        var line = parseInt(eventContext.line);

        // In vim, columns are '1' based, so if we're at position 1,
        // there is nothing left to complete
        if (col <= 1)
            return Promise.resolve(null);

        var currentCharacter = eventContext.lineContents[col - 2];

        var previousCharacter: any = " ";
        if(col > 2)
            previousCharacter = eventContext.lineContents[col - 3];

        if (currentCharacter == ".") {
            return this._getCompletions(eventContext.currentBuffer, line, col)
                .then((items) => {
                    return {
                        base: col - 1,
                        line: eventContext.line,
                        items: items
                    };
                }, (err) => {
                    log.error("Error during completion: " + err);
                    return null;
                });
        } else if (currentCharacter.match(/[a-z]/i) && !previousCharacter.match(/[a-z]/i)) {
            return this._getCompletions(eventContext.currentBuffer, line, col)
                .then((items) => {
                    items = items.filter((completion) => { return completion.word && completion.word[0] === currentCharacter });
                    return {
                        base: col - 2,
                        line: eventContext.line,
                        items: items
                    };
                }, (err) => {
                    log.error("Error during completion: " + err);
                    return null;
                });
        } else if (currentCharacter === "(" 
                    || currentCharacter === ","
                    || (currentCharacter === " " && previousCharacter === ",")) {
            return this._getSignatureHelp(eventContext.currentBuffer, line, col);
        } else {
            return Promise.resolve(null);
        }
    }


    private _getSignatureHelp(currentBuffer: string, line: number, col: number): Promise<any> {
        var displayPartsParser = new DisplayPartsParser.DisplayPartsParser();

        return this._host.getSignatureHelp(currentBuffer, line, col)
            .then((help: any) => {
                var ret = [];

                if(help && help.items) {
                    help.items.forEach((item) => {
                        var prefixDisplayParts = displayPartsParser.convertToDisplayString(item.prefixDisplayParts);

                        var parameterDisplayParts = [];
                        var parameters = [];
                        var snippet = "";
                        var count = 1;

                        item.parameters.forEach((parameter) => {
                            parameterDisplayParts.push(displayPartsParser.convertToDisplayString(parameter.displayParts));
                            parameters.push("${" + count.toString() + ":"  + parameter.name + "}");
                            count++;
                        });

                        var suffixDisplayParts = displayPartsParser.convertToDisplayString(item.suffixDisplayParts);

                        var snippet = parameters.join(", ");
                        var pdText = parameterDisplayParts.join(", ");

                        ret.push({
                            menu: prefixDisplayParts + pdText + suffixDisplayParts,
                            snippet: snippet
                        });
                    });
                }

                return {
                    base: col,
                    line: line,
                    items: ret
                };
            });
    }
    

    private _getCompletions(currentBuffer: string, line: number, col: number): Promise<any> {
        var fullCompletionInfo = [];
        var entryDetails: CompletionEntryDetails = {};
        return this._host.getCompletions(currentBuffer, line, col)
            .then((completionInfo) => this._mapCompletionValues(completionInfo))

            // Adding the entry details for all entries is too slow to be realistic right now
            // .then((completionInfo) => fullCompletionInfo = completionInfo)
            // .then(() => this._getCompletionEntryDetails(currentBuffer, line, col, fullCompletionInfo))
            // .then((details) => entryDetails = details)
            // .then(() => this._augmentCompletions(fullCompletionInfo, entryDetails));
    }

    private _augmentCompletions(completionInfo: any, completionEntryDetails: CompletionEntryDetails): Promise<any> {

        var displayPartsParser = new DisplayPartsParser.DisplayPartsParser();

        var out = completionInfo.map(completion => {
            var ret = {
                "word": completion.word,
                "menu": completion.menu
            };

            if(completionEntryDetails[completion.word]) {
                ret["menu"] = displayPartsParser.convertToDisplayString(completionEntryDetails[completion.word]);
            }

            return ret;
        });

        return Promise.resolve(out);
    }

    private _getCompletionEntryDetails(currentBuffer: string, line: number, col: number, completionInfo: any): Promise<CompletionEntryDetails> {
        var entryNames = completionInfo
            .filter((c) => c.menu)
            .map((c) => c.word);

        return Promise.resolve({});
    }

    private _mapCompletionValues(completionInfo): any {

        return completionInfo.map((completion) => {
            var kind = "";

            if (completion.kind !== "warning") {
                kind = "(" + completion.kind + ")"
            }

            return {
                "word": completion.name,
                "menu": kind
            }
        });
    }


};
