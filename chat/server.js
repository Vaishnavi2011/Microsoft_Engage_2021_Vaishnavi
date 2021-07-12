const PORT = process.env.PORT || 3000;
const INDEX = '/index.ejs';
//Framework for developing web app - Express js
const express = require('express')
const app = express()
app.set("view engine", "ejs")
app.use(express.static('public'))
app.get('/', (req, res) => {//What URL is it going to live - It's going to live under root folder
    res.render('index')
})

const server = app.listen(PORT, () => {
    console.log("Server is listening");
}) 

const io = require('socket.io')(server);

io.on('connection',(socket) => {
    socket.username = "Anonymous";//When a user wants to chat anonymously
    socket.on('new_message',(data) => {
        io.sockets.emit('new_message',{
            message:data.message,
            username: socket.username
        });
        socket.on('change_username',(data) => {
            socket.username = data.username;//change username 
        });

        socket.on("typing", data => {
            socket.broadcast.emit("typing",{
                username:socket.username
            });
        })
    });
});