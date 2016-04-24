var gulp = require("gulp");
var ts = require("gulp-typescript");

var srcProject = ts.createProject("src\\tsconfig.json");

gulp.task("build:src", function() {
    var tsResult = srcProject.src() 
        .pipe(ts(srcProject));

    return tsResult.js.pipe(gulp.dest("lib"));
});

gulp.watch("src\\**\\*.ts", gulp.parallel("build:src"));

gulp.task("build", gulp.series("build:src"));
gulp.task("default", gulp.series("build"));
