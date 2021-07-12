var HOST = location.origin.replace(/^http/, 'ws')//url of the socket server
const webSocket = new WebSocket(HOST);//heroku ip

/*web sockets allow communication i.e., after the establishment of connection 
between server and client data exchange can take place between them*/

webSocket.onmessage = (event) => {
    handleSignallingData(JSON.parse(event.data))
}

function handleSignallingData(data) {
    switch (data.type) {
        case "answer":
/*The message containing the RTCSessionDescription object,
is added to the RTCPeerConnection object using the setRemoteDescription() method.*/
            myPeer.setRemoteDescription(data.answer)//
            break
        case "candidate":
            myPeer.addIceCandidate(data.candidate)
    }
}

let username//This variable is used to get the username
/*When the send button created in  server.html file is clicked the user_id function is called
and the value entered in the input-box is stored in the server*/
function user_id() {

    username = document.getElementById("username-input").value//This line gets the username from the input box of id "username-input"
    sendData({ //object
        type: "store_user"//store user_name
    })
}

function sendData(data) {
    /*Attach the username as whenever we send any data we need to send 
    the username as well so that the Server knows who the data belongs to*/
    data.username = username
    /*send object to the server and as the data should be
    a string JSON.stringify is used to convert the data to string*/
    webSocket.send(JSON.stringify(data))
}


let localStream
let myPeer
function startCall() {
    document.getElementById("video-call-div")
    .style.display = "inline"//display = inline so that the video is visible inside the current block on the same line
//getUserMedia() to set up your local media stream and add it to the RTCPeerConnection object using the addStream() method.
    navigator.getUserMedia({//helps in video stream
        video: {
            frameRate: 24,
            width: {
                min: 480, ideal: 720, max: 1280
            },
            aspectRatio: 1.33333
        },
        audio: true
    }, (stream) => {//getUserMedia function gets a callback function as the second parameter and with this it returns the stream
        localStream = stream
        document.getElementById("local-video").srcObject = localStream

        let configuration = {
            iceServers: [
                {
                    "urls": ["stun:stun.l.google.com:19302", 
                    "stun:stun1.l.google.com:19302", 
                    "stun:stun2.l.google.com:19302"]/*We are using multiple servers here as one of the would return better
                    candidates that can be used to establich connection*/
                },{ url: 'turn:numb.viagenie.ca',
                credential: 'muazkh',
                username: 'webrtc@live.com'}
                
            ]
        }

        myPeer = new RTCPeerConnection(configuration)//This is used to create a peer connection
        myPeer.addStream(localStream)//Here we are attaching the localstream to the peer connection

        myPeer.onaddstream = (e) => {//It handles the displaying of the video stream once it is received from the remote peer.
            document.getElementById("remote-video").srcObject = e.stream
        }

        myPeer.onicecandidate = ((e) => {//It sends any ICE candidates to the other peer, as they are received.
            if (e.candidate == null)
                return
            sendData({
                type: "store_candidate",
                candidate: e.candidate
            })
        })

        createAndSendOffer()
    }, (error) => {//Third parameter
        console.log(error)
    })
}

//Offer will store on socket server and server will send offer to the clientand get that person's answer
function createAndSendOffer() {
    myPeer.createOffer((offer) => {
        sendData({//sends offer to server
            type: "store_offer",
            offer: offer
        })

        myPeer.setLocalDescription(offer)//set the sescription of remote peer
    }, (error) => {
        console.log(error)
    })
}

let isAudio = true
function muteAudio() {
    isAudio = !isAudio
    localStream.getAudioTracks()[0].enabled = isAudio
}

let isVideo = true
function muteVideo() {
    isVideo = !isVideo
    localStream.getVideoTracks()[0].enabled = isVideo
}