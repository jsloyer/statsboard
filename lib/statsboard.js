var express = require("express")
  , path = require("path")
  , _ = require("underscore")
  , fs = require("fs")
  , doppio = require("doppio")
  , async = require("async")
  , socketio = require("socket.io")
  , url = require("url")
  ;

module.exports = function(stats) {
  var app = express(),
    io;

  app.configure(function(){
    app.use(express.static(path.join(__dirname, "..", "public")));
  });

  var indexRender = function(request, response, done){
      var indexTemplate,
      data={
        endComment:"-->",
        beginComment:"<!--",
        isCompress:false
      },
      partialDirectory= path.join(__dirname,"..","public","partials"),
      templateFunctions = [],
      partialCompile ="",
      params;
      
      if ( process.env.NODE_ENV === "production" ) {
        data.isCompress = true;
        params = url.parse(request.url, true);
        if( params.query.debug ) {
          data.isCompress = false;
        }
      }
      
      templateFunctions.push(function(next) {
        fs.readFile(path.join(__dirname,"..","public","index-template.html"),
        {encoding:"utf8" },next);
      });
      
      templateFunctions.push(function(template,next) {
        indexTemplate = template;
        next();
      });
      
      if(data.isCompress) {
        partialCompile+="-->\n";
        templateFunctions.push(function(next) {
          fs.readdir(partialDirectory,next);
        });
        templateFunctions.push(function(files,next) {
            
          var partialsFunction = [];
          _.each(files,function(file) {
            
            partialsFunction.push(function(callback) {
              partialCompile+="<script type=\"text/ng-template\" "+
              "id=\"partials/"+file+"\">\n";
              callback();
            });
            
            partialsFunction.push(fs.readFile.bind(undefined,
                path.join(partialDirectory,file),{encoding:"utf8"}));
            
            partialsFunction.push(function(cont,callback) {
              partialCompile+=cont;
              partialCompile+="</script>\n";
              callback();
            });
          });
          async.waterfall(partialsFunction,next);
        });
        templateFunctions.push(function(next) {
          partialCompile+="<!-- ";
          next();
        });
      }
      templateFunctions.push(function() {
        data.partials = partialCompile;
        response.send(_.template(indexTemplate,data));
      });
      async.waterfall ( templateFunctions, done);
    };

  app.use("/js/remote-controller.js", function(request, response, done){
    var indexTemplate ="";
    async.waterfall ( [
      fs.readFile.bind(undefined,path.join(__dirname,"..",
        "remote-controller.js"), {encoding:"utf8" }),
      function(template,next) {
        indexTemplate = template;
        stats.getStats(next);
      },
      function(statsData) {
        var data = {stats:statsData};
        response.send(_.template(indexTemplate,data));
      }
    ],
    done);
  });
  app.use("/compress.js", function(request, response, done){
    var scriptInclude = [
      "components/angular/angular.min.js",
      "components/angular-route/angular-route.min.js",
      "components/underscore/underscore-min.js",
      "components/socket.io-client/dist/socket.io.min.js",
      "components/angular-socket-io/socket.js",
      "components/angular-bootstrap/ui-bootstrap-tpls.min.js",
      "components/d3/d3.js",
      "components/angular-dchart/dist/angular-dchart.min.js",
      "js/local.js"
    ],
    page = "",
    fileReaders = [],
    indexTemplate = "";
    scriptInclude.forEach(function(file) {
      fileReaders.push(function(callback) {
          fs.readFile(path.join(__dirname,"..","public",file),
                      {encoding:"utf8"},callback);
        
        });
      fileReaders.push(function(cont,callback) {
        page+="\n"+cont;
        callback();
      });
    });
    
    fileReaders.push(fs.readFile.bind(undefined,
      path.join(__dirname,"..","remote-controller.js"), {encoding:"utf8" }));
    fileReaders.push(function(template,next) {
      indexTemplate = template;
      stats.getStats(next);
    });
    fileReaders.push(function(statsData,callback) {
      var data = {stats:statsData};
      page+=_.template(indexTemplate,data);
      callback();
    });
    
    fileReaders.push(function() {
      response.send(page);
    });
    async.waterfall ( fileReaders, done);

  });
  
  app.use("/graph", function(request, response, done){
    var query = url.parse(request.url, true).query;
    async.waterfall (
      [
        function(next) {
          stats.getStatsHistory(query.statsType,query.name,next);
        },
        function(stats) {
          response.set("Content-Type", "application/json");
          response.send(stats);
        }
      ], done);

  });
  
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
