/**
 * SyntaxHighlighter.ts
 */

export interface SyntaxHighlightResult {
    [highlightGroup: string]: string[];
}

export interface SyntaxHighlightItem {
    text: string;
    kind: string;
    childItems?: SyntaxHighlightItem[];
}

var kindToHighlightGroup = {
    var: "Identifier",
    alias: "Include",
    function: "Function",
    method: "Function",
    property: "Function",
    class: "Type"
};

var allHighlightGroups = Object.keys(kindToHighlightGroup).map((key) => kindToHighlightGroup[key]);

export class SyntaxHighlighter {

    public getSyntaxHighlighting(items: SyntaxHighlightItem[]): SyntaxHighlightResult {
        var highlightDictionary = this.getEmptySyntaxHighlighting();

        items.forEach(item => {
            this._createSyntaxHighlighting(item, highlightDictionary);
        });

        return highlightDictionary;
    }

    public getEmptySyntaxHighlighting(): SyntaxHighlightResult {
        var highlightDictionary = <SyntaxHighlightResult>{};

        allHighlightGroups.forEach((group) => {
            highlightDictionary[group] = [];
        });
        return highlightDictionary;
    }

    private _createSyntaxHighlighting(rootNavBarItem, highlightDictionary) {
        if (!rootNavBarItem)
            return;

        var group = kindToHighlightGroup[rootNavBarItem.kind];
        if (group) {
            highlightDictionary[group].push(rootNavBarItem.text);
        }

        if(!rootNavBarItem.childItems || !rootNavBarItem.childItems.length)
            return;

        rootNavBarItem.childItems.forEach((child) => {

            this._createSyntaxHighlighting(child, highlightDictionary);
        });
    }
}
