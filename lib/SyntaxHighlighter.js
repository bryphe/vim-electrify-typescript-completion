/**
 * SyntaxHighlighter.ts
 */
"use strict";
var kindToHighlightGroup = {
    var: "Identifier",
    alias: "Include",
    function: "Function",
    method: "Function",
    property: "Function",
    class: "Type"
};
var allHighlightGroups = Object.keys(kindToHighlightGroup).map(function (key) { return kindToHighlightGroup[key]; });
var SyntaxHighlighter = (function () {
    function SyntaxHighlighter() {
    }
    SyntaxHighlighter.prototype.getSyntaxHighlighting = function (items) {
        var _this = this;
        var highlightDictionary = this.getEmptySyntaxHighlighting();
        items.forEach(function (item) {
            _this._createSyntaxHighlighting(item, highlightDictionary);
        });
        return highlightDictionary;
    };
    SyntaxHighlighter.prototype.getEmptySyntaxHighlighting = function () {
        var highlightDictionary = {};
        allHighlightGroups.forEach(function (group) {
            highlightDictionary[group] = [];
        });
        return highlightDictionary;
    };
    SyntaxHighlighter.prototype._createSyntaxHighlighting = function (rootNavBarItem, highlightDictionary) {
        var _this = this;
        if (!rootNavBarItem)
            return;
        var group = kindToHighlightGroup[rootNavBarItem.kind];
        if (group) {
            highlightDictionary[group].push(rootNavBarItem.text);
        }
        if (!rootNavBarItem.childItems || !rootNavBarItem.childItems.length)
            return;
        rootNavBarItem.childItems.forEach(function (child) {
            _this._createSyntaxHighlighting(child, highlightDictionary);
        });
    };
    return SyntaxHighlighter;
}());
exports.SyntaxHighlighter = SyntaxHighlighter;
