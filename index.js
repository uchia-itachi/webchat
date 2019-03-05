var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);
var port = process.env.PORT || 3000;

var usernames = [];
var current_sockets=new Array();

app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function(socket){

    socket.on('username',function(username){
      socket.username=username;
      current_sockets.push(socket);
      usernames.push(username);
      console.log(usernames);
      console.log("connected no of users : ",usernames.length);
      io.emit('joined',{
        usernames,
        username
      });
    });

    socket.on('chat', function(data){
    io.emit('chat', data);
  });

  socket.on('disconnect',function(){
    console.log("disconnected");

    var i = usernames.indexOf(socket.username);
      usernames.splice(i, 1);
      i = current_sockets.indexOf(socket);
      current_sockets.splice(i,1);

    socket.broadcast.emit('user-disconnected',{
      usernames,
      username: socket.username
    });
    socket.broadcast.emit('nottyping',socket.username);
      console.log("connected no of users : ",usernames.length);

  });

  socket.on('typing',function(username){
    socket.broadcast.emit('typing',username);
  });

  socket.on('nottyping',function(username){
    socket.broadcast.emit('nottyping',username);
  });

  socket.on('privatemessage',function(data){

    var i= usernames.indexOf(data.user);
    if(i!=-1)
    io.to(current_sockets[i].id).emit("privatemessage", data.msg);
    console.log(data);
  });

});

http.listen(port, function(){
  console.log('listening on *:' + port);
});
