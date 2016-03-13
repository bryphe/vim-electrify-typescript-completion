import * as tsp from "./TypeScriptProject"
import * as tspr from "./TypeScriptProjectResolver"

var projectCache = {};

export function getProjectFromFile(fileName: string): tsp.ITypeScriptProject {

    var rootPath = getProjectRootPathFromFile(fileName);

    var existingProject = projectCache[rootPath];

    var project;
    if(existingProject) {
        project = existingProject;
    } else {
        var resolver = new tspr.SingularProjectResolver(fileName);
        project = new tsp.TypeScriptProject(fileName, resolver);
        projectCache[rootPath] = project;
    }

    return project;
}

function getProjectRootPathFromFile(fileName: string): string {
    return fileName;
}


