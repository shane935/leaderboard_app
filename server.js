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
  // db.collection('games', function(err, collection){
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
    });
  });
});

io.on('connection', function(socket){
  console.log("Connected");

  socket.on('updates', function(arr){

    var date = new Date();

    db.collection('rankings', function(err, collection){
      for(i = 0; i < arr.length; i++){
        var obj = arr[i];
        collection.update(
          {fname: obj.fname},
          {
            $set: {
              fname: obj.fname,
              totalSets: obj.totalSets, 
              ranking: obj.ranking,
            }
          },
          { upsert: true, },
          function(err, result){
            console.log("Error: " + err);
            console.log("Result: " + result);
          }
        );
      }
      collection.find({},{previousGames: 0}).toArray(function(err,data){
        socket.broadcast.emit('table updates', data);
      });
    });

    db.collection('games', function(err, collection){
      collection.insert(
        {
          previousGames: {
            player: arr[0].fname,
            playerSets: arr[0].sets,
            opponent: arr[1].fname,
            opponentSets: arr[1].sets,
            gameDate: date
          }
        },
        function(err, result){
          console.log("Games error: " + err);
          console.log("Games result: " + result);
        }
      );
      collection.find({}).toArray(function(err,data){
        console.log(data);
      });
    });
  });

  socket.on('disconnect', function(){
    console.log("Disconected");
  })
});

var port = Number(process.env.PORT || 5001);
http.listen(port, function(){
  console.log("server listening on port: " + port);
});
