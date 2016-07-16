var gulp = require("gulp");
var merge = require("merge2");
var ts = require("gulp-typescript");
var gulpTypings = require("gulp-typings");

gulp.task("build:src", function() {
    var srcProject = ts.createProject("tsconfig.json");
    var tsResult = gulp.src(["typings/**/*.d.ts", "src/**/*.ts"])
        .pipe(ts(srcProject));

    return merge(tsResult.js.pipe(gulp.dest("lib")), tsResult.dts.pipe(gulp.dest("lib")));
});

gulp.task("build:test", function() {
    var testProject = ts.createProject("tsconfig.json");
    var tsResult = gulp.src(["typings/**/*.d.ts", "test/**/*.ts"]) 
        .pipe(ts(testProject));

    return tsResult.js.pipe(gulp.dest("test"));
});

gulp.task("typings:src", function() {
    return gulp.src("src/typings.json")
            .pipe(gulpTypings());
});

gulp.task("watch", function() {
    gulp.watch("src\\**\\*.ts", gulp.parallel("build:src"));
    gulp.watch("test\\**\\*.ts", gulp.parallel("build:test"));
});

gulp.task("build", gulp.series("build:src", "build:test"));
gulp.task("default", gulp.series("build"));
