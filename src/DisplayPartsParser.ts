
export interface DisplayPart {
    text: string;
    kind: string;
}


export class DisplayPartsParser {

    public convertToDisplayString(displayParts: DisplayPart[]) {
        var ret = "";

        displayParts.forEach((dp) => {
            ret += dp.text;
        });

        return ret;
    }
}

