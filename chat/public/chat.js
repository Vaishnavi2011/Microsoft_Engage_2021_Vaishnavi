$(document).ready(function () {

    var socket = io.connect('https://arcane-journey-18816.herokuapp.com/')//name of the site
    var username = $("#username");
    //get the input
    var change_username = $("#change_username");
    //used for appending the message
    var feedback = $("#feedback");
    //to send messages
    var message = $("#message");
    var change_message = $("#change_message");
    change_message.click(function () {
        socket.emit('new_message', {message:message.val()})
    })
    //sends the message by appending tje message
    socket.on('new_message',(data) => {
       
        message.val('');
        feedback.append('<p>' + data.username +" : " + data.message)
    })
    
    //to change username
    change_username.click(function () {
        socket.emit('change_username', {
            username:username.val()
        })
    })
    message.bind('keypress', () => {
        socket.emit('typing')
    })
    

})