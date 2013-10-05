var express = require("express")
  , path = require("path")
  , _ = require("underscore")
  , fs = require("fs")
  , doppio = require("doppio")
  , async = require("async")
  ;

module.exports = function(stats) {
  var app = express();

  app.configure(function(){
    app.use(express.static(path.join(__dirname, "..", "public")));
  });

  var indexRender = function(request, response, done){
      var indexTemplate,
      data={},
      partialDirectory= path.join(__dirname,"..","partials");
      
      
      async.waterfall ( [
          fs.readFile.bind(undefined,path.join(__dirname,"..","index.html"),
                     {encoding:"utf8" }),
          function(template,next) {
            indexTemplate = template;
            fs.readdir(partialDirectory,next);
          },
          function(files,next) {
            var fileReaders = {};
            files.forEach(function(file) {
              fileReaders[file] = fs.readFile.bind(undefined,
                  path.join(partialDirectory,file),{encoding:"utf8"});
            });
            async.parallel(fileReaders,next);
          },
          function(filesData,next) {
            data.partials = filesData;
            stats.getStats(next);
          },
          function(statsData,next) {
            data.stats = statsData;
            stats.getPlayers(next);
          },
          function(players) {
            data.players = players;
            response.send(_.template(indexTemplate,data));
          }
        ],
        done);
        
    };


  app.use("/", indexRender );
  app.use("*", indexRender );

  var server = doppio({ port: 8080 }, app);
  return server;
};