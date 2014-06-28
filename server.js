var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var bodyParser = require('body-parser');

var data = [
   {
      "fname" : "Shane",
      "sets" : 9,
      "ranking" : 1000,
   },
   {
      "fname" : "Seb",
      "sets" : 9,
      "ranking" : 1000,
   },
   {
      "fname" : "Katrina",
      "sets" : 9,
      "ranking" : 1000,
   },
   {
      "fname" : "Rav",
      "sets" : 9,
      "ranking" : 1000,
   },
   {
      "fname" : "Shannon",
      "sets" : 9,
      "ranking" : 1000,
   },
   {
      "fname" : "Joe",
      "sets" : 9,
      "ranking" : 1000,
   }
];

app.use(express.static(__dirname));

// app.use(bodyParser.json());

// app.post('/add', function(req, res){
// 	if (!req.body.hasOwnProperty('fname') || !req.body.hasOwnProperty('sets')) {
// 		res.statusCode = 400;
// 		return res.send('Error: 400: Catastrophic failure');
// 	}
// 	console.log(req.body.fname);
// });

app.get('/', function(request, result){
	result.sendfile('index.html');
});

app.get('/data', function(request, result){
  result.send(data);
});

io.on('connection', function(socket){
  console.log('a user connected');
  socket.on('save data', function(obj){
    data = obj;
    console.log(data);
    io.emit('updated', data);
  })
});


http.listen(3000);
