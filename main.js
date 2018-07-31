var express = require("express");
var bodyParser = require("body-parser");
var methodOverride = require("method-override");
var mongoose = require("mongoose");

var main = express();

mongoose.connect(process.env.MONGO_DB, {useNewUrlParser:true});
var db = mongoose.connection;

db.once("open", function() {
  console.log("DB Connected!");
});
db.on("error", function(err) {
  console.log("DB ERROR : " + err);
});

var dataSchema = mongoose.Schema({
  title:{type:String},
  picture:{type:String, required:true}
});
var Data = mongoose.model("data", dataSchema);

main.set("view engine", "ejs");
main.use(express.static(__dirname + "/public"));
main.use(bodyParser.json());
main.use(bodyParser.urlencoded({extended:true}));
main.use(methodOverride("_method"));

main.get("/", function(req, res) {
  res.redirect("/index");
});
main.get("/index", function(req, res) {
  Data.find({}, function(err, datas) {
    if(err) return res.json(err);
    res.render("index", {datas:datas});
  });
});
main.get("/index/new", function(req, res) {
  res.render("new");
});
main.post("/index", function(req, res) {
  Data.create(req.body, function(err, data) {
    if(err) return ress.json(err);
    res.redirect("/index");
  });
});

var port = process.env.PORT || 8000;

main.listen(port, function() {
  console.log("Server On!");
});
