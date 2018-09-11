var gulp = require("gulp"),
  minifyCss = require("gulp-minify-css"), //压缩CSS
  uglify = require("gulp-uglify"), //压缩JS
  clean = require("gulp-clean"), //删除文件
  rev = require("gulp-rev"), // 通过将内容哈希附加到文件名
  concat = require("gulp-concat"), //合并文件
  useref = require("gulp-useref"), //解析HTML文件中的构建块，以使用useref替换对非优化脚本或样式表的引用
  revCollector = require("gulp-rev-collector"), //根据rev生成的manifest.json文件中的映射, 去替换文件名称, 也可以替换路径(html里的路径替换)
  del = require("del"), // 删除文件
  imagemin = require("gulp-imagemin"), //压缩图片
  babel = require("gulp-babel"), //babel es6->es5
  htmlmin = require("gulp-htmlmin"), //压缩html
  stripDebug = require("gulp-strip-debug"); //去掉所有console.log

//清空文件夹，避免资源冗余
gulp.task("clean", function(callback) {
  del([".build/**/*"]).then(() => {
    console.log("清空之前的文件成功");
    callback();
  });
});

//css文件压缩，更改版本号，并通过rev.manifest将对应的版本号用json表示出来
gulp.task("css", ["clean"], function() {
  return (
    gulp
      .src("src/css/*.css")
      //.pipe( concat('wap.min.css') )
      .pipe(
        minifyCss({
          advanced: true, //类型：Boolean 默认：true [是否开启高级优化（合并选择器等）]
          compatibility: "*", //保留ie7及以下兼容写法 类型：String 默认：''or'*' [启用兼容模式； 'ie7'：IE7兼容模式，'ie8'：IE8兼容模式，'*'：IE9+兼容模式]
          keepSpecialComments: "*" //保留所有特殊前缀 当你用autoprefixer生成的浏览器前缀，如果不加这个参数，有可能将会删除你的部分前缀
        })
      )
      .pipe(rev())
      .pipe(gulp.dest("build/css/"))
      .pipe(rev.manifest())
      .pipe(gulp.dest("build/rev/css"))
  );
});

//js文件压缩，更改版本号，并通过rev.manifest将对应的版本号用json表示出
gulp.task("util", ["clean", "css"], function() {
  return gulp
    .src("src/js/**/*")
    .pipe(
      babel({
        presets: ["es2015"] //es2015
      })
    )
    .pipe(uglify())
    .pipe(rev())
    .pipe(gulp.dest("build/js/"))
    .pipe(rev.manifest())
    .pipe(gulp.dest("build/rev/js"));
});

gulp.task("js", ["clean", "css", "util"], function() {
  return gulp
    .src("src/utils/**/*")
    .pipe(rev())
    .pipe(gulp.dest("build/utils/"))
    .pipe(rev.manifest())
    .pipe(gulp.dest("build/rev/utils"));
});

//通过hash来精确定位到html模板中需要更改的部分,然后将修改成功的文件生成到指定目录
gulp.task("rev", ["clean", "css", "util", "js"], function() {
  return gulp
    .src(["build/rev/**/*.json", "src/**/*.html"])
    .pipe(revCollector())
    .pipe(gulp.dest("build/"));
});

gulp.task(
  "img",
  ["clean", "css", "util", "js","rev"],
  function() {
    return (
      gulp
        .src(["src/img/**/*.png", "src/img/**/*.jpg"])
        //.pipe(imagemin())
        .pipe(gulp.dest("build/img/"))
    );
  }
);

//复制plug文件夹
// gulp.task(
//   "copy",
//   ["clean", "copycdn", "css", "js", "pagesjs", "conversion", "rev", "img"],
//   function() {
//     return gulp.src("static/pdfall/**/*").pipe(gulp.dest("build/pdfall"));
//   }
// );

//复制font文件夹
gulp.task(
  "copy1",
  ["clean", "css", "util", "js","rev","img"],
  function() {
    return gulp.src("src/static/font/*").pipe(gulp.dest("build/static/font"));
  }
);

//复制svg文件夹
gulp.task(
  "copysvg",
  ["clean", "css", "util", "js","rev","img","copy1"],
  function() {
    return gulp.src(["src/static/svg/**/*.svg"]).pipe(gulp.dest("build/svg"));
  }
);

//压缩html
gulp.task(
  "html",
  ["clean", "css", "util", "js","rev","img","copy1","copysvg"],
  function(callback) {
    var options = {
      removeComments: true, //清除HTML注释
      collapseWhitespace: true //压缩HTML
    };

    return gulp
      .src("build/**/*.html")
      .pipe(htmlmin(options))
      .pipe(gulp.dest("build/"));
  }
);

gulp.task(
  "default",
  ["clean", "css", "util", "js","rev","img","copy1","copysvg","html"],
  function() {
    // 将你的默认的任务代码放在这
    console.log("成功了666");
  }
);
