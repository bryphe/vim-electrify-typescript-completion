/**
 * SyntaxHighlightManager.ts
 */
"use strict";
var SyntaxHighlighter_1 = require("./SyntaxHighlighter");
var _ = require("lodash");
var SyntaxHighlightManager = (function () {
    function SyntaxHighlightManager(vim, host) {
        var _this = this;
        this._vim = vim;
        this._host = host;
        this._updateHighlightFunction = _.debounce(function (file) {
            _this._host._makeTssRequest("navbar", {
                file: file
            }).then(function (val) {
                console.log("Got highlighting result: " + JSON.stringify(val));
                var syntaxHighlighter = new SyntaxHighlighter_1.SyntaxHighlighter();
                var highlighting = syntaxHighlighter.getSyntaxHighlighting(val);
                _this._vim.setSyntaxHighlighting(highlighting);
                console.log("Setting syntax highlighting: " + JSON.stringify(highlighting));
            }, function (err) {
                console.error(err);
            });
        }, 100);
    }
    SyntaxHighlightManager.prototype.updateSyntaxHighlighting = function (file) {
        this._updateHighlightFunction(file);
    };
    return SyntaxHighlightManager;
}());
exports.SyntaxHighlightManager = SyntaxHighlightManager;
