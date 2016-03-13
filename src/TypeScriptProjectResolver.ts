import events = require("events");

/**
 * Helper class to resolve all the file and project references,
 * and notify when there are file updates
 *
 * Fires 'change' event when a file changes
 */
export interface ITypeScriptProjectResolver extends events.EventEmitter {

    /**
     * Return full paths of all the files in the solution
     */
    getFiles(): string[];
}

export class SingularProjectResolver extends events.EventEmitter implements ITypeScriptProjectResolver {

    private _file: string;

    constructor(file: string) {
        super();
        this._file = file;
    }

    public getFiles(): string[] {
        return [this._file];
    }
}

/**
 * DefaultProjectResolver gets all files in the current directory and below
 */
export class DefaultProjectResolver extends events.EventEmitter implements ITypeScriptProjectResolver {

    constructor(projectRootPath: string) {
        super();


    }

    public getFiles(): string [] {
        return [];
    }
}


