var express=require("express"),app=express(),http=require("http").Server(app),io=require("socket.io")(http),bodyParser=require("body-parser"),data=[{fname:"Shane",sets:9,ranking:1e3},{fname:"Seb",sets:9,ranking:1e3},{fname:"Katrina",sets:9,ranking:1e3},{fname:"Rav",sets:9,ranking:1e3},{fname:"Shannon",sets:9,ranking:1e3},{fname:"Joe",sets:9,ranking:1e3}];app.use(express.static(__dirname)),app.get("/",function(e,n){n.sendfile("index.html")}),app.get("/data",function(e,n){n.send(data)}),io.on("connection",function(e){console.log("a user connected"),e.on("save data",function(e){data=e,console.log(data),io.emit("updated",data)})}),http.listen(3e3);