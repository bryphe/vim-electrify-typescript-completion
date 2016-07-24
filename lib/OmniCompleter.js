/**
 * OmniCompleter.ts
 *
 * Implementation of JavaScript/TypeScript omnicompleter
 */
"use strict";
var Promise = require("bluebird");
var DisplayPartsParser = require("./DisplayPartsParser");
var OmniCompleter = (function () {
    function OmniCompleter(host) {
        this._host = host;
    }
    OmniCompleter.prototype.getCompletions = function (eventContext) {
        var col = parseInt(eventContext.col);
        var line = parseInt(eventContext.line);
        // In vim, columns are '1' based, so if we're at position 1,
        // there is nothing left to complete
        if (col <= 1)
            return Promise.resolve(null);
        var currentCharacter = eventContext.lineContents[col - 2];
        var previousCharacter = " ";
        if (col > 2)
            previousCharacter = eventContext.lineContents[col - 3];
        if (currentCharacter == ".") {
            return this._getCompletions(eventContext.currentBuffer, line, col)
                .then(function (items) {
                return {
                    base: col - 1,
                    line: eventContext.line,
                    items: items
                };
            }, function (err) {
                console.error("Error during completion: " + err);
                return null;
            });
        }
        else if (currentCharacter.match(/[a-z]/i) && !previousCharacter.match(/[a-z]/i)) {
            return this._getCompletions(eventContext.currentBuffer, line, col)
                .then(function (items) {
                items = items.filter(function (completion) { return completion.word && completion.word[0] === currentCharacter; });
                return {
                    base: col - 2,
                    line: eventContext.line,
                    items: items
                };
            }, function (err) {
                console.error("Error during completion: " + err);
                return null;
            });
        }
        else if (currentCharacter === "("
            || currentCharacter === ","
            || (currentCharacter === " " && previousCharacter === ",")) {
            return this._getSignatureHelp(eventContext.currentBuffer, line, col);
        }
        else {
            return Promise.resolve(null);
        }
    };
    OmniCompleter.prototype._getSignatureHelp = function (currentBuffer, line, col) {
        var displayPartsParser = new DisplayPartsParser.DisplayPartsParser();
        return this._host.getSignatureHelp(currentBuffer, line, col)
            .then(function (help) {
            var ret = [];
            if (help && help.items) {
                help.items.forEach(function (item) {
                    var prefixDisplayParts = displayPartsParser.convertToDisplayString(item.prefixDisplayParts);
                    var parameterDisplayParts = [];
                    var parameters = [];
                    var snippet = "";
                    var count = 1;
                    item.parameters.forEach(function (parameter) {
                        parameterDisplayParts.push(displayPartsParser.convertToDisplayString(parameter.displayParts));
                        parameters.push("${" + count.toString() + ":" + parameter.name + "}");
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
    };
    OmniCompleter.prototype._getCompletions = function (currentBuffer, line, col) {
        var _this = this;
        var fullCompletionInfo = [];
        var entryDetails = {};
        return this._host.getCompletions(currentBuffer, line, col)
            .then(function (completionInfo) { return _this._mapCompletionValues(completionInfo); });
        // Adding the entry details for all entries is too slow to be realistic right now
        // .then((completionInfo) => fullCompletionInfo = completionInfo)
        // .then(() => this._getCompletionEntryDetails(currentBuffer, line, col, fullCompletionInfo))
        // .then((details) => entryDetails = details)
        // .then(() => this._augmentCompletions(fullCompletionInfo, entryDetails));
    };
    OmniCompleter.prototype._augmentCompletions = function (completionInfo, completionEntryDetails) {
        var displayPartsParser = new DisplayPartsParser.DisplayPartsParser();
        var out = completionInfo.map(function (completion) {
            var ret = {
                "word": completion.word,
                "menu": completion.menu
            };
            if (completionEntryDetails[completion.word]) {
                ret["menu"] = displayPartsParser.convertToDisplayString(completionEntryDetails[completion.word]);
            }
            return ret;
        });
        return Promise.resolve(out);
    };
    OmniCompleter.prototype._getCompletionEntryDetails = function (currentBuffer, line, col, completionInfo) {
        var entryNames = completionInfo
            .filter(function (c) { return c.menu; })
            .map(function (c) { return c.word; });
        return Promise.resolve({});
    };
    OmniCompleter.prototype._mapCompletionValues = function (completionInfo) {
        return completionInfo.map(function (completion) {
            var kind = "";
            if (completion.kind !== "warning") {
                kind = "(" + completion.kind + ")";
            }
            return {
                "word": completion.name,
                "menu": kind
            };
        });
    };
    return OmniCompleter;
}());
exports.OmniCompleter = OmniCompleter;
;
