//receiver just needs to join the already initiated call
var HOST = location.origin.replace(/^http/, 'ws')
const webSocket = new WebSocket(HOST);
/*web sockets allow communication i.e., after the establishment of connection 
between server and client data exchange can take place between them*/

webSocket.onmessage = (event) => {
    handleSignallingData(JSON.parse(event.data))
}
/*The message containing the RTCSessionDescription object,
is added to the RTCPeerConnection object using the setRemoteDescription() method.*/
function handleSignallingData(data) {
    switch (data.type) {
        case "offer":
            myPeer.setRemoteDescription(data.offer)
            createAndSendAnswer()
            break
        case "candidate":
            myPeer.addIceCandidate(data.candidate)
    }
}

function createAndSendAnswer () {
    myPeer.createAnswer((answer) => {
        myPeer.setLocalDescription(answer)
        sendData({
            type: "send_answer",
            answer: answer
        })
    }, error => {
        console.log(error)
    })
}

function sendData(data) {
    data.username = username//
    webSocket.send(JSON.stringify(data))
}


let localStream
let myPeer
let username

function joinCall() {

    username = document.getElementById("username-input").value

    document.getElementById("video-call-div")
    .style.display = "inline"//display = inline so that the video is visible inside the current block on the same line

    navigator.getUserMedia({
        video: {
            frameRate: 24,
            width: {
                min: 480, ideal: 720, max: 1280
            },
            aspectRatio: 1.33333
        },
        audio: true
    }, (stream) => {
        localStream = stream
        document.getElementById("local-video").srcObject = localStream

        let configuration = {
            iceServers: [
                {
                    "urls": ["stun:stun.l.google.com:19302", 
                    "stun:stun1.l.google.com:19302", 
                    "stun:stun2.l.google.com:19302",
                    ]
                },{ url: 'turn:numb.viagenie.ca',
                credential: 'muazkh',
                username: 'webrtc@live.com'}
            ]
        }

        myPeer = new RTCPeerConnection(configuration)
        myPeer.addStream(localStream)

        myPeer.onaddstream = (e) => {
            document.getElementById("remote-video")
            .srcObject = e.stream
        }

        myPeer.onicecandidate = ((e) => {
            if (e.candidate == null)
                return
            
            sendData({
                type: "send_candidate",
                candidate: e.candidate
            })
        })

        sendData({
            type: "join_call"
        })

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