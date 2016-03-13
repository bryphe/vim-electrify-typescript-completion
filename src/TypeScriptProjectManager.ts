import * as tsp from "./TypeScriptProject"
import * as tspr from "./TypeScriptProjectResolver"

var projectCache = {};

export function getProjectFromFile(fileName: string): tsp.ITypeScriptProject {

    var rootPath = getProjectRootPathFromFile(fileName);

    var resolver = new tspr.SingularProjectResolver(fileName);

    return new tsp.TypeScriptProject(fileName, resolver);
}

function getProjectRootPathFromFile(fileName: string): string {
    return fileName;
}


