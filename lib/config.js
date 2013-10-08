module.exports = function() {
  var api = {};
  api.getMongoServer = function() {
    return process.env.DB_SERVER || "localhost:27017";
  };
  api.getMongoURI = function() {
    return process.env.DB_URI || process.env.MONGOLAB_URI || "mongodb://" +
      api.getMongoServer() + "/statsboard";
  };
  return api;
};