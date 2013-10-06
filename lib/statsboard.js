var express = require("express")
  , path = require("path")
  , _ = require("underscore")
  , fs = require("fs")
  , doppio = require("doppio")
  , async = require("async")
  , socketio = require("socket.io")
  ;

module.exports = function(stats) {
  var app = express(),
    io;

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
          function(statsData) {
            data.stats = statsData;
            response.send(_.template(indexTemplate,data));
          }
        ],
        done);
        
    };


  app.use("/", indexRender );
  app.use("*", indexRender );
  
  
  
  var options = { };
  if ( process.env.NODE_ENV !== "test" ) {
    if( process.env.PORT ) {
      options.port = parseInt(process.env.PORT,10);
    } else {
      options.port = 8080;
    }
  }
  console.log("Starting server");
  console.log(options);
  var server = doppio(options, app);
  
  io = socketio.listen(server.server(),{ log: false });
  
  if( process.env.DYNO ) {
    io.configure(function () {
      io.set("transports", ["xhr-polling"]);
      io.set("polling duration", 10);
    });
  }
  
  io.sockets.on("connection", function (socket) {

    socket.on("addResult", function(data) {
      console.log("Add Results",data);
      stats.addResult(data,function(err,results) {
        if(!err && results) {
          console.log("Sending changes",results);
          socket.broadcast.emit("changeInfo",results);
          socket.emit("changeInfo",results);
        }
      });
    });
  });
  
  return server;
};
