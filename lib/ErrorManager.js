/**
 * ErrorManager.ts
 *
 * Handles managing error state, persisting it back to vim, and checking for errors
*/
"use strict";
var _ = require("lodash");
var ErrorManager = (function () {
    function ErrorManager(vim, host) {
        var _this = this;
        this._lastErrors = [];
        this._fileToErrors = {};
        this._vim = vim;
        this._host = host;
        this._updateErrorFn = _.throttle(function () { return _this._updateErrors(); }, 250, { leading: true, trailing: true });
        this._host.on("semanticDiag", function (diagnostics) {
            var file = diagnostics.file;
            var errors = diagnostics.diagnostics.map(function (d) {
                var text = d.text.split("'").join("`");
                text = text.split("\"").join("`");
                return {
                    fileName: file,
                    lineNumber: d.start.line,
                    startColumn: d.start.offset,
                    endColumn: d.end.offset,
                    text: text
                };
            });
            _this._fileToErrors[file] = errors;
            _this._updateErrorFn();
        });
    }
    ErrorManager.prototype.clearErrorOnLine = function (bufferName, line) {
        if (this._fileToErrors[bufferName]) {
            var errors = this._fileToErrors[bufferName];
            this._fileToErrors[bufferName] = errors.filter(function (e) { return e.lineNumber !== line; });
            this._updateErrorFn();
        }
    };
    ErrorManager.prototype.getErrorOnLine = function (bufferName, line) {
        var errorOnLine = this._lastErrors.filter(function (e) {
            return e.fileName === bufferName && e.lineNumber === line;
        });
        if (errorOnLine.length >= 1) {
            return errorOnLine[0].text;
        }
        else {
            return null;
        }
    };
    ErrorManager.prototype.checkForErrorsInCurrentBuffer = function (bufferName) {
        this._host.getErrors(bufferName);
    };
    ErrorManager.prototype.checkForErrorsAcrossProject = function (bufferName) {
        this._host.getErrorsAcrossProject(bufferName);
    };
    ErrorManager.prototype._updateErrors = function () {
        var errors = this._combineErrors();
        if (!this._areErrorArraysEqual(errors, this._lastErrors)) {
            this._lastErrors = errors;
            this._vim.setErrors("vim-electrify-typescript", this._lastErrors);
        }
    };
    ErrorManager.prototype._combineErrors = function () {
        var _this = this;
        var ret = [];
        Object.keys(this._fileToErrors).forEach(function (k) {
            ret = ret.concat(_this._fileToErrors[k]);
        });
        return ret;
    };
    ErrorManager.prototype._areErrorArraysEqual = function (err1, err2) {
        if (err1.length !== err2.length)
            return false;
        for (var i = 0; i < err1.length; i++) {
            var e1 = err1[i];
            var e2 = err2[i];
            if (!(e1.fileName === e2.fileName
                && e1.lineNumber === e2.lineNumber
                && e1.startColumn === e2.startColumn
                && e1.endColumn === e2.endColumn
                && e1.text === e2.text))
                return false;
        }
        return true;
    };
    return ErrorManager;
}());
exports.ErrorManager = ErrorManager;
