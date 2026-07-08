const [queue,setQueue]=useState([]);

const [selectedCall,setSelectedCall]=useState(null);

const [pensioner,setPensioner]=useState(null);

const [messages,setMessages]=useState([]);

const [notes,setNotes]=useState("");

const [callTime,setCallTime]=useState(0);

const [busy,setBusy]=useState(false);

const [cameraOn,setCameraOn]=useState(true);

const [micOn,setMicOn]=useState(true);

const [recording,setRecording]=useState(false);

const [officers,setOfficers]=useState([]);
const socket=io(API,{
 transports:["websocket"]
});
useEffect(()=>{

socket.emit("registerOfficer",{

officerId:user._id,

name:user.fullName

});

},[]);
useEffect(()=>{

socket.on("queueUpdated",(data)=>{

setQueue(data);

});

return()=>{

socket.off("queueUpdated");

}

},[]);
useEffect(()=>{

socket.on("incomingCall",(call)=>{

setSelectedCall(call);

});

return()=>{

socket.off("incomingCall");

}

},[]);
const acceptCall=()=>{

socket.emit("acceptCall",{

roomId:selectedCall.roomId,

officerId:user._id

});

setBusy(true);

};
const rejectCall=()=>{

socket.emit("rejectCall",{

roomId:selectedCall.roomId,

officerId:user._id

});

setSelectedCall(null);

};
<div className="w-80 bg-white rounded-xl shadow">

<div className="p-4 border-b">

<h2 className="font-bold">

Waiting Queue

</h2>

</div>

<div>

{

queue.map(call=>(

<div

key={call.roomId}

className="border-b p-3 hover:bg-gray-100 cursor-pointer"

onClick={()=>setSelectedCall(call)}

>

<p>

{call.pensionerName}

</p>

<p>

{call.faydaNumber}

</p>

</div>

))

}

</div>

</div>
<div className="relative">

<video

ref={remoteVideo}

autoPlay

playsInline

className="w-full rounded-xl bg-black"

/>

<video

ref={myVideo}

autoPlay

muted

playsInline

className="absolute

bottom-4

right-4

w-48

rounded-lg

border-4

border-white"

/>

</div>
  <div className="bg-white rounded-xl p-5">

<h2>

Pensioner Information

</h2>

<p>

Name :

{pensioner?.nameEng}

</p>

<p>

Fayda :

{pensioner?.faydaNumber}

</p>

<p>

Phone :

{pensioner?.phone}

</p>

<p>

Branch :

{pensioner?.poessaBranch}

</p>

<p>

Status :

{

pensioner?.verified ?

"Verified"

:

"Waiting"

}

</p>

</div>
  <div className="bg-white rounded-xl shadow p-4">

    <h2 className="font-bold text-lg mb-3">
        Live Chat
    </h2>

    <div className="border rounded h-56 overflow-y-auto p-3">

        {messages.map((msg,index)=>(
            <div
                key={index}
                className={`mb-2 ${
                    msg.sender===user.fullName
                        ?"text-right"
                        :"text-left"
                }`}
            >
                <div className="font-semibold">
                    {msg.sender}
                </div>

                <div className="inline-block bg-blue-100 rounded-lg px-3 py-2">
                    {msg.message}
                </div>
            </div>
        ))}

    </div>

    <div className="flex mt-3">

        <input
            className="flex-1 border rounded-l-lg p-2"
            value={message}
            onChange={(e)=>setMessage(e.target.value)}
            placeholder="Type message..."
        />

        <button
            onClick={sendMessage}
            className="bg-blue-700 text-white px-5 rounded-r-lg"
        >
            Send
        </button>

    </div>

</div>
  const captureScreenshot=()=>{

const canvas=document.createElement("canvas");

canvas.width=remoteVideo.current.videoWidth;

canvas.height=remoteVideo.current.videoHeight;

const ctx=canvas.getContext("2d");

ctx.drawImage(

remoteVideo.current,

0,

0,

canvas.width,

canvas.height

);

const image=canvas.toDataURL("image/jpeg");

socket.emit("captureEvidence",{

roomId:selectedCall.roomId,

image

});

};
  const saveScreenshot=async(image)=>{

await axios.post(

`${API}/api/video/save-evidence`,

{

roomId:selectedCall.roomId,

image,

officerId:user._id

}

);

};
  <div className="bg-white rounded-xl shadow p-4">

<h2 className="font-bold mb-3">

Officer Notes

</h2>

<textarea

className="border w-full h-40 rounded-lg p-3"

value={notes}

onChange={(e)=>setNotes(e.target.value)}

/>

<button

onClick={saveNotes}

className="mt-3 bg-green-700 text-white px-5 py-2 rounded"

>

Save Notes

</button>

</div>
  const saveNotes=()=>{

socket.emit("saveNotes",{

roomId:selectedCall.roomId,

notes

});

};
  <div className="flex items-center gap-2">

<div

className={`w-3 h-3 rounded-full ${
recording
?"bg-red-600 animate-pulse"
:"bg-gray-400"
}`}

/>

<span>

{

recording

?

"Recording..."

:

"Not Recording"

}

</span>

</div>
  <div className="text-lg font-bold">

⏱

{

Math.floor(callTime/60)

}

:

{

String(callTime%60)

.padStart(2,"0")

}

</div>
  useEffect(()=>{

let timer;

if(callStarted){

timer=setInterval(()=>{

setCallTime(prev=>prev+1);

},1000);

}

return()=>clearInterval(timer);

},[callStarted]);
  <div className="grid grid-cols-4 gap-3">

<button

onClick={toggleCamera}

className="bg-indigo-700 text-white p-3 rounded"

>

{

cameraOn

?

"Camera Off"

:

"Camera On"

}

</button>

<button

onClick={toggleMic}

className="bg-yellow-600 text-white p-3 rounded"

>

{

micOn

?

"Mute"

:

"Unmute"

}

</button>

<button

onClick={captureScreenshot}

className="bg-purple-700 text-white p-3 rounded"

>

Screenshot

</button>

<button

onClick={endCall}

className="bg-red-700 text-white p-3 rounded"

>

End Call

</button>

</div>
  <button

onClick={approveRenewal}

className="bg-green-700 text-white w-full mt-5 py-3 rounded-lg"

>

Approve Renewal

</button>
  const approveRenewal=async()=>{

await axios.post(

`${API}/api/video/approve-renewal`,

{

callId:selectedCall._id,

officerId:user._id,

notes

}

);

alert("Renewal Approved");

};
  <select

className="border rounded-lg p-2"

onChange={(e)=>transferCall(e.target.value)}

>

<option>

Transfer Call

</option>

{

officers

.filter(o=>!o.busy)

.map(o=>(

<option

key={o._id}

value={o._id}

>

{o.fullName}

</option>

))

}

</select>
  const transferCall=(officerId)=>{

socket.emit("transferCall",{

roomId:selectedCall.roomId,

fromOfficer:user._id,

toOfficer:officerId

});

};
  <div className="bg-white rounded-xl shadow p-4">

<h2 className="font-bold">

Evidence

</h2>

<div className="grid grid-cols-3 gap-2">

{

evidences.map(img=>(

<img

key={img._id}

src={img.image}

alt="Evidence"

className="rounded-lg"

/>

))

}

</div>

</div>
  <div className="bg-white rounded-xl shadow p-4">

<h2 className="font-bold mb-3">

Audit Trail

</h2>

{

audit.map(item=>(

<div

key={item._id}

className="border-l-4 border-blue-600 pl-3 mb-3"

>

<p className="font-semibold">

{item.action}

</p>

<p>

{item.officerName}

</p>

<small>

{

new Date(item.createdAt)

.toLocaleString()

}

</small>

</div>

))

}

</div>
