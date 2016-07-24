"use strict";
var QuickInfo = (function () {
    function QuickInfo(vim, host, errorManager) {
        this._vim = vim;
        this._host = host;
        this._errorManager = errorManager;
    }
    QuickInfo.prototype.showQuickInfo = function (args) {
        var error = this._errorManager.getErrorOnLine(args.currentBuffer, parseInt(args.line));
        if (error) {
            this._vim.echohl("ERROR: " + error, "Error");
        }
        else {
            this._showQuickInfo(args);
        }
    };
    QuickInfo.prototype._showQuickInfo = function (args) {
        var _this = this;
        this._host.getQuickInfo(args.currentBuffer, parseInt(args.line), parseInt(args.col)).then(function (val) {
            console.log("Quick info: " + JSON.stringify(val));
            var outputString = val.displayString;
            // Truncate display string if over 100 characters
            outputString = outputString.substring(0, 100);
            outputString = outputString.split("\n").join(" ");
            _this._vim.echo(outputString);
        });
    };
    return QuickInfo;
}());
exports.QuickInfo = QuickInfo;
