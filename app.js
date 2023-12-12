const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const adminRouter = require('./routes/admin.route')
const userRouter=require('./routes/user.route')
const chat=require('./models/user/chat.model.js')
const chatID=require('./models/user/chatID.model.js')
var fs = require('fs');
var path = require('path');

const {ObjectId} = require('mongodb');
  const app = require('express')();
  const socketio = require('socket.io');

 // const server = require('http').createServer(app);
  //const io = require('socket.io');


  app.get('/chat', function(req, res) {
    //console.log('chattttttttttt');
    res.sendFile(path.join(__dirname, '/check.html'));
  });
 

// parse requests of content-type - application/x-www-form-urlencoded
app.use(express.json({ limit: '10000mb' ,parameterLimit:5000000000}))
    .use(express.urlencoded({limit: '10000mb', extended: true }));

// Configuring the database
const db = require('./config/db.js');

mongoose.Promise = global.Promise;

// Connecting to the database
mongoose.connect(db.database, {
    useNewUrlParser: true
}).then(() => {
    console.log("Successfully connected to the database");
}).catch(err => {
    console.log('Could not connect to the database. Exiting now...', err);
    process.exit();
});

//initialize cors middleware
//app.use(cors());
app.use(cors({
    origin: '*'
}));

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Allow-Headers", "Origin,Content-Type, Content-Length, X-Requested-With");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    //req.con = con
    next();
});

// parse requests of content-type - application/json
app.use(express.json()) //handling the form data
app.use(express.json({ limit: '10000mb',parameterLimit:50000000}))
app.use(bodyParser.urlencoded({limit: "10000mb", extended: true, parameterLimit:5000000}));
const port = 3000;

app.use('/v1/admin', adminRouter);
app.use('/v1/user', userRouter);



const server = app.listen(port, () => {
  console.log(`Example app listening on port ${port}!`)
});


const io = socketio(server)
var sockets = [];
io.sockets.on('connection', function(socket) {
  /****** create socket id *********/
  console.log('connected');  
  socket.on('join', function (data) {
  //  console.log("Socket DATa:: ", data);
    //console.log("Socket DATa:: ", data.receiver);
    sockets[data.userid] = socket.id;   
    
     chat.find({chatid:ObjectId(data.chatid)}).then(res_data => {
      console.log('res_data after join ',res_data);
      if(res_data){       
         // console.log('res_data after join ',res_data);
         // sockets[res_data[0].receiver] = socket.id;   
         // var socketID = sockets[res_data[0].receiver];

          io.to(socket.id).emit('check',res_data )
         // io.to(socketID).emit('check',res_data )
       
      }else{
        //const chatid = new chatID({stylist: data.stylist, user: data.user});
      //  chatid.save().then(item1 => {         
        //}) 
      }
        
     })  
      

     /*** get contacts Listing ***/
    //  socket.on('contactsCall', function (data) {     
    //       //var socketID = sockets[data.user_id+'_'+data.reveiver];
    //       console.log('contactsCall------------- req:');
    //       /***** get Contacts lists ******/
    //       chatID.find({sender:data.sender}).then(res_data => {
    //         console.log('contacts',res_data);
    //         socket.emit('contacts', res_data); 
    //       })                           
       
  });
    //var socket.id = sockets[data.sender+'_'+data.reveiver];
   // console.log('socketID',socket.id);
     // Handle input events
     socket.on('input', function(data){
      console.log('input',data);
      var socketID = sockets[data.userid];
      var socketID1 = sockets[data.receiver];
      console.log('sockets',sockets);
    //chatID.findOne({sender:ObjectId(data.sender) ,receiver:ObjectId(data.receiver) }).then(res_data => {     
      const newuser = new chat({chatid:data.chatid,sender: data.userid, receiver: data.receiver ,message:data.message});
      newuser.save(newuser).then(item => {
      //console.log("item saved to database",item);
      //chat.findOne({chatid:data.chatid}).then(item => {        
        io.to(socketID).emit('messagecheck',  item )
        io.to(socketID1).emit('messagecheck',  item )
     // })
    })     
  });
    
      // sockets[data.user_id+'_'+data.user_type] = socket.id;
      // console.log('check socket', data.user_id+'_'+data.user_type+' ... '+socket.id);
  ///});  
  
})