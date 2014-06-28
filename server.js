var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var Db = require('mongodb').Db;
var Server = require('mongodb').Server;
var Connection = require('mongodb').Connection;
var db = new Db('leaderboard', new Server('localhost', Connection.DEFAULT_PORT, {}), {safe:true});


app.use(express.static(__dirname));

db.open(function(err, database){
  if(err) return console.log(err);

  // db.collection('rankings', function(err, collection){
  //   collection.remove({}, function(){});
  // });
});

app.get('/', function(request, result){
	result.sendfile('index.html');
});

app.get('/data', function(request, result){
  db.collection('rankings', function(err, collection){
    collection.find({}).toArray(function(err, data){
      result.send(data);
      console.log(data);
    });
  });
});

io.on('connection', function(socket){
  console.log("Connected")

  socket.on('updates', function(arr){
    db.collection('rankings', function(err, collection){
      for(i = 0; i < arr.length; i++){
        var obj = arr[i];
        console.log(obj);
        collection.update(
          {fname: obj.fname},
          {
            $set: {
                fname: obj.fname,
                sets: obj.sets, 
                ranking: obj.ranking
            }
          },
          { upsert: true, },
          function(err, result){
            console.log(err);
            console.log(result);
          }
        );
      }
      collection.find({}).toArray(function(err,data){
        io.emit('table updates', data);
      });
    });
  });

  socket.on('disconnect', function(){
    console.log("Disconected");
  })
});


http.listen(3000, function(){
  console.log("server listening on port: 3000");
});
