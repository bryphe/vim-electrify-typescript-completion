var gulp = require("gulp");
var ts = require("gulp-typescript");

var srcProject = ts.createProject("src\\tsconfig.json");
var testProject = ts.createProject("test\\tsconfig.json");

gulp.task("build:src", function() {
    var tsResult = srcProject.src() 
        .pipe(ts(srcProject));

    return tsResult.js.pipe(gulp.dest("lib"));
});

gulp.task("build:test", function() {
    var tsResult = testProject.src() 
        .pipe(ts(testProject));

    return tsResult.js.pipe(gulp.dest("test"));
});
gulp.watch("src\\**\\*.ts", gulp.parallel("build:src"));
gulp.watch("test\\**\\*.ts", gulp.parallel("build:test"));

gulp.task("build", gulp.series("build:src", "build:test"));
gulp.task("default", gulp.series("build"));
