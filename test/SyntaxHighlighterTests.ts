import * as assert from "assert";
import { expect } from "chai";
import { SyntaxHighlighter } from "../lib/SyntaxHighlighter"

describe("SyntaxHighlighter", () => {

    it("handles empty array", () => {
        var syntaxHighlighter = new SyntaxHighlighter();

        var emptyResult = syntaxHighlighter.getEmptySyntaxHighlighting();

        var derp = syntaxHighlighter.getSyntaxHighlighting([]);
        // var omniCompleter = new OmniCompleter(null);
        // omniCompleter.getCompletions(null);
        expect(derp).to.deep.equal(emptyResult);
    });

    it("handles simple element", () => {
        var syntaxHighlighter = new SyntaxHighlighter();
        var expectedResult = syntaxHighlighter.getEmptySyntaxHighlighting();

        var result = syntaxHighlighter.getSyntaxHighlighting([{
            text: "var_test",
            kind: "var"
        }]);

        expectedResult["Identifier"] = ["var_test"];
        expect(result).to.deep.equal(expectedResult);
    });

    it("handles root-level child, and buckets appropriately", () => {
        var syntaxHighlighter = new SyntaxHighlighter();
        var expectedResult = syntaxHighlighter.getEmptySyntaxHighlighting();

        var result = syntaxHighlighter.getSyntaxHighlighting([
            {
                text: "RootItem",
                kind: "someRandomType",
                childItems: [
                    {
                        text: "var_test",
                        kind: "var"
                    }, {
                        text: "alias_test",
                        kind: "alias"
                    }, {
                        text: "function_test",
                        kind: "function"
                    }, {
                        text: "method_test",
                        kind: "method"
                    }, {
                        text: "property_test",
                        kind: "property"
                    }, {
                        text: "class_test",
                        kind: "class"
                    }]
            }
        ]);

        expectedResult["Identifier"] = ["var_test"];
        expectedResult["Include"] = ["alias_test"];
        expectedResult["Function"] = ["function_test", "method_test", "property_test"];
        expectedResult["Type"] = ["class_test"];

        expect(result).to.deep.equal(expectedResult);
    });

});
