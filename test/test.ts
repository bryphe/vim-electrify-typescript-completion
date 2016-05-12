import * as assert from "assert";
import { expect } from "chai";
import { OmniCompleter } from "../lib/OmniCompleter"

describe("test", () => {

    it("fails", () => {
        // var omniCompleter = new OmniCompleter(null);
        // omniCompleter.getCompletions(null);
        expect(1).to.not.equal(2);

        var omni: OmniCompleter = new OmniCompleter();
        expect(2).to.not.equal(derp, derp2);
        omni.getCompletions(oh);
    });
});
