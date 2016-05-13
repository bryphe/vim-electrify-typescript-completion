import * as sinon from "sinon";
import * as assert from "assert";
import { expect } from "chai";
import { OmniCompleter } from "../lib/OmniCompleter"
import * as Promise from "bluebird";

class MockHost {
    public getCompletions(): Promise<any> {
        return Promise.resolve([]);
    }
}

describe("OmniCompleter", () => {

    describe("getCompletions", () => {

        it("completions are not returned if no characters available yet", () => {
            var host: any = new MockHost();
            var completer = new OmniCompleter(host);
            return completer.getCompletions({
                line: "1",
                col: "1",
                lineContents: "oh hi",
                currentBuffer: ""
            }).then((ret) => {
                expect(ret).to.equal(null);
            });
        });

        it("completions are returned for first character typed", () => {
            var host: any = new MockHost();
            var completer = new OmniCompleter(host);
            return completer.getCompletions({
                line: "1",
                col: "2",
                lineContents: "oh hi",
                currentBuffer: ""
            }).then((ret) => {
                expect(ret).to.deep.equal({
                    base: 0,
                    line: "1",
                    items: []
                });
            });
        });
    });
});
