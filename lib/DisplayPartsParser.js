"use strict";
var DisplayPartsParser = (function () {
    function DisplayPartsParser() {
    }
    DisplayPartsParser.prototype.convertToDisplayString = function (displayParts) {
        var ret = "";
        if (!displayParts || !displayParts.forEach)
            return ret;
        displayParts.forEach(function (dp) {
            ret += dp.text;
        });
        return ret;
    };
    return DisplayPartsParser;
}());
exports.DisplayPartsParser = DisplayPartsParser;
