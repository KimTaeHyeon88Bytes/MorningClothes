var express = require("express");
var bodyParser = require("body-parser");
var methodOverride = require("method-override");
var multer = require("multer");
var mongoose = require("mongoose");

var main = express();

var storage = multer.diskStorage({
  destination: function(req, file, cb) {
    cb(null, "public/images/");
  },
  filename: function(req, file, cb) {
    Num.findOne({id:"id"}, function(err, num) {
      cb(null, num.number + 1 + ".png");
      Num.findOneAndUpdate({id:"id"}, {number:num.number + 1, count:num.count + 1}, function(err, num) {
      });
    });
  }
});
var upload = multer({storage:storage});

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
  picture:{type:String, required:true},
  comment:{type:String}
});
var Data = mongoose.model("data", dataSchema);
var numSchema = mongoose.Schema({
  id:{type:String},
  number:{type:Number},
  count:{type:Number}
});
var Num = mongoose.model("num", numSchema);

main.set("view engine", "ejs");
main.use(express.static(__dirname + "/public"));
main.use(bodyParser.json());
main.use(bodyParser.urlencoded({extended:true}));
main.use(methodOverride("_method"));

main.get("/", function(req, res) {
  /*Data.create({"title":"prevent ERROR", "picture":"0", "comment":""}, function(err, Data) {
    if(err) return res.json(err);
  });*/
  res.redirect("/index");
});
main.get("/index", function(req, res) {
  Data.find({}, function(err, datas) {
    if(err) return res.json(err);
    var n = datas[datas.length - 1].picture;
    var info = {
      datas:datas,
      num:n
    };
    res.render("index", info);
  });
});
main.get("/index/new", function(req, res) {
  res.render("new");
});
main.get("/index/:id", function(req, res) {
  Data.findOne({_id:req.params.id}, function(err, data) {
    res.render("show", {data:data});
  });
});
main.get("/index/settings/reset", function(req, res) {
  Data.remove({}, function(err, data) {
    if(err) res.json(err);
  });
  Data.create({"title":"prevent ERROR", "picture":"0", "comment":""}, function(err, data) {
    if(err) res.json(err);
  });
  Num.findOneAndUpdate({id:"id"}, {"id":"id", "number":2, "count":2}, function(err, data) {
    if(err) res.json(err);
  });
  res.send("Successfully reset!");
});
main.get("/index/settings/makeEx1", function(req, res) {
  Data.create({"title":"ex1", "picture":"1", "comment":""}, function(err, data) {
    if(err) res.json(err);
  });
  res.send("Successfully make example1");
});
main.get("/index/settings/makeEx2", function(req, res) {
  Data.create({"title":"ex2", "picture":"2", "comment":""}, function(err, data) {
    if(err) res.json(err);
  });
  res.send("Successfully make example2");
});
main.post("/index", upload.single("picture"), function(req, res) {
  Num.findOne({id:"id"}, function(err, num) {
    Data.create({"title":req.body.title, "picture":num.number, "comment":""}, function(err, data) {
      if(err) return res.json(err);
      res.redirect("/index");
    });
  });
});
main.put("/index/:id", function(req, res) {
  Data.findOne({_id:req.params.id}, function(err, datac) {
    Data.findOneAndUpdate({_id:req.params.id}, {"comment":datac.comment + "!@#" + req.body.comment}, function(err, data) {
      if(err) return res.json(err);
      res.redirect("/index/" + req.params.id);
    });
  });
});

var port = process.env.PORT || 8000;

main.listen(port, function() {
  console.log("Server On!");
});
