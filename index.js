var express = require("express");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var Sentiment = require("sentiment");
var sentiment = new Sentiment();
var spamcheck = require("spam_detecter");
var config = require("./config/config");
var Message = require("./models/message");
var jwt = require("jsonwebtoken");
var cors = require("cors");
var app = express();
function replace_content(content)
{
var exp_match = /(\b(https?|):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;
var element_content=content.replace(exp_match, "<ion-anchor href='$1'>$1</ion-anchor>");
var new_exp_match =/(^|[^\/])(www\.[\S]+(\b|$))/gim;
var new_content=element_content.replace(new_exp_match, '$1<ion-anchor target="_blank" href="http://$2">$2</ion-anchor>');
return new_content;
}

app.use(cors());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
mongoose.connect(config.db, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true
});

const connection = mongoose.connection;

connection.once("open", () => {
  console.log("MongoDB database connection established successfully!");
});

connection.on("error", err => {
  console.log(
    "MongoDB connection error. Please make sure MongoDB is running. " + err
  );
  process.exit();
});

let server = require("http").createServer(app);
let io = require("socket.io")(server);

io.on("connection", socket => {
  socket.on("logout", data => {
    console.log(data);
    io.emit("logout", "data");
  });

  socket.on("group_created", data => {
    console.log(data);
    io.emit("group_created", data);
  });
  socket.on("group_deleted", data => {
    console.log(data);
    io.emit("group_deleted", data);
  });
  socket.on("logined", data => {
    console.log(data);
    io.emit("logined", data);
  });
  socket.on("typing", message => {
    channel = message.from + "-" + message.to;
    message.isTyping = true ;
    message.isMessage = false;
    message.isDeleted=false;
        io.emit(channel, message);
        console.log(message);
  });
  socket.on("ntyping", message => {
    channel = message.from + "-" + message.to;
    message.isnTyping = true ;
    message.isMessage = false;
    message.isDeleted=false;
        io.emit(channel, message);
        console.log(message);
  });

  socket.on("signup", data => {
    io.emit("new_user", data);
  });

  socket.on("tagged", message => {
    message.isTagged = true;
    console.log(message.index);
    index=message.index;
    Message.updateOne({ _id : { $eq: message._id } }, message, (err, data) => {
      if(data){
        channel = message.from + "-" + message.to;
        message.isMessage = false;
        message.isDeleted=false;
        message.index=index;
        io.emit(channel, message);
        console.log(message);
      }
      if (err) {
        message.isTagged = false;
        channel = message.from + "-" + message.to;
        message.OperationStatus= false;
        message.index=index;
        message.OperationName= "Taging Failed";
        io.emit(channel, message);
        console.log(data);
      }
    });
   
  });


  socket.on("deleted", message => {
    console.log(message);
    var Opted = message.Option;
    message[Opted] = true;
    console.log(message);
    console.log(message.index);
    index=message.index;
    Message.updateOne({ _id : { $eq: message._id } }, message, (err, data) => {
      if(data){
        console.log(data);
        channel = message.from + "-" + message.to;
        message.isMessage = false;
        message.OperationStatus= true;
        message.index=index;
        message.isDeleted=true;
        console.log(message);
        io.emit(channel, message);
        console.log(message);
      }
      if (err) {
        channel = message.from + "-" + message.to;
        message.OperationStatus= false;
        message.index=index;
        message.OperationName= "Deleting Failed";
        io.emit(channel, message);
        console.log(data);
      }
    });
   
  });
  

  socket.on("send-message", message => {
    console.log(message);
    console.log(typeof message);
   // message = JSON.parse(message);
  
    var x = sentiment.analyze(message.message);
    console.log(message.isBan);
    if(x.score < -15){
      message.isBan = true;
      console.log(message.isBan);
    }
    console.log(message.isBan);
    message.score = x.score;
    message.isMessage = true;
    message.spamcheck = spamcheck.detect(message.message);
    // message.message.replace(/(https?:\/\/[^\s]+)/g,"<a href='$1'  >$1</a>")
    message.createdAt = new Date();
    //message.message = replace_content(message.message);
    console.log(message);
    let newMessage = Message(message);
    newMessage.save(function(err, data) {
      if (err) {
        console.log(err);
      }
      if (data) {
     
        console.log(data)
        data.isMessage = true;
        channel = data.from + "-" + data.to;
        console.log(channel,data)
        io.emit(channel, data);
      }
    });
  });

  socket.on("message_in_group", message => {
    console.log(message);
    var x = sentiment.analyze(message.message);
    message.score = x.score;
    message.spamcheck = spamcheck.detect(message.message);
    message.createdAt = new Date();
    //message.message = replace_content(message.message);
    if(message.score > 10){
      message.isBan=true;
    }
    let newMessage = Message(message);
    newMessage.save(function(err, data) {
      if (err) {
        console.log(err);
      }
      if (data) {
        console.log(data);
        io.emit("message_in_group", data);
      }
    });
  });
});

var port = process.env.PORT || 5000;

server.listen(port, function() {
  console.log("socket.io listening in http://localhost:" + port);
});
