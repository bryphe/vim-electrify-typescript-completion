import Promise = require("bluebird");

declare var log;

import * as tshost from "./TypeScriptServerHost"

interface CompletionContext {
    col: number;
    line: number;
    currentCharacter: string;
    previousCharacter: string;
}

export class OmniCompleter {

    private _host: tshost.TypeScriptServerHost;

    constructor(host: tshost.TypeScriptServerHost) {
        this._host = host;
    }

    public getCompletions(eventContext): Promise<any> {
        var col = parseInt(eventContext.col);
        var line = parseInt(eventContext.line);

        if (col <= 2)
            return Promise.resolve(null);

        var currentCharacter = eventContext.lineContents[col - 2];
        var previousCharacter = eventContext.lineContents[col - 3];

        if (currentCharacter == ".") {
            return this._host.getCompletions(eventContext.currentBuffer, line, col).then((completionInfo) => {
                var items = completionInfo.map((completion) => { return { "word": completion.name, "menu": completion.kindModifiers + " " + completion.kind }; });
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
            return this._host.getCompletions(eventContext.currentBuffer, line, col).then((completionInfo) => {
                var items = completionInfo.map((completion) => { return { "word": completion.name, "menu": completion.kindModifiers + " " + completion.kind }; });
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
        } else if (currentCharacter == "(") {
            return Promise.resolve(null);
            // return Promise.resolve({
            //     base: col -1,
            //     line: eventContext.line,
            //     items: [ "a", "b", "c"]
            // });
        } else {
            return Promise.resolve(null);
        }

    }


};
