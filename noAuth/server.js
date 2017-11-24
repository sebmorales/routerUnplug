"use strict"; //this line was added since the server stoped running
//Express
var express = require('express');
var app = express();
//HTTP and creating our awasome server
var http = require('http').createServer(app);
var port = process.env.PORT || 3000;
var server = app.listen(port);

//bodyParser helps us decode the queries
var bodyParser = require('body-parser')
app.use( bodyParser.json() );       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({     // to support URL-encoded bodies
  extended: true
}));
app.use(express.json());       // to support JSON-encoded bodies
// app.use(express.urlencoded()); // to support URL-encoded bodies
var pcap = require('pcap'),
    tcp_tracker = new pcap.TCPTracker(),
    pcap_session = pcap.createSession('en0', "ip proto \\tcp");
    // pcap_session = pcap.createSession('wlan0', "ip proto \\tcp");//for raspberry pi

var host =require('host');
var dns  = require('dns');

//if rpi:
// var gpio = require('rpi-gpio');
// var gpioPin=11;//same as GPIO 17
// gpio.setup(gpioPin, gpio.DIR_OUT);

//SerialPort in case you were connected to an arduino or a serial device
// var SerialPort = require('serialport');
// var serialPort = new SerialPort("/dev/cu.usbmodem1411", {
//   baudrate: 9600,
// 	parser: SerialPort.parsers.readline('\n')
// });

var bannedURLS=[];
var willdie=-1;
var d = new Date();



class bannedIp {
  constructor(url) {
    this.url = url;
    this.ips=[];
  }
  resolveIps(){
    dns.resolve4(this.url,(err,addresses) => {
      if(err) throw err;
      var ipJSON=JSON.parse(JSON.stringify(addresses));
      for(let i=0;i<ipJSON.length;i++){
        this.ips.push(ipJSON[i]+":443");
      }
      // console.log(this.ips)

    })
  }
}

console.log("Server running and listening at port " + port);

//In case the user goes to http://localhost:3000/unplug
app.get("/unplug", function(req, res){
  unplug();
  res.send('Bye\n');
});

app.get("/unplug/banned", function(req, res){
  if(bannedURLS.length<1){
    res.send("No websites have been banned. To ban a website post the url to 'newBannedURL=yourbannedwebsite.com'")
  }else{
    res.send(bannedURLS);
  }
});


app.get("/unplug/willdie", function(req, res){
  if(willdie>0){
    var date=new Date();
    console.log(willdie+" "+date);
    res.send("the router will unplug in "+(Number(willdie)-Number(date))+" milliseconds");
  }else{
    res.send("the router will live forever... for now.");
  }
});

//In case the user sends a post request, here you can schedule the unplug
//curl -X POST -d 'time=5000' 'http://localhost:3000/unplug'
//curl -X POST -d 'newBannedURL=facebook.com' 'http://localhost:3000/unplug'
//curl -X POST -d 'newBannedURL=facebook.com' 'http://192.168.1.98:3000/unplug'
app.post("/unplug",function(req,res){
    var waitfor=Number(req.body.time);
    var tempURL=(req.body.newBannedURL);
    console.log(tempURL);

    if(!(isNaN( waitfor ))){
      console.log(waitfor);
      setTimeout(function () {
        unplug();
      },waitfor);
      var date=Number(new Date());
      willdie=waitfor+date;
      res.send('Will unplug in '+waitfor+' milliseconds.\nBye!\n');
    }else if(typeof tempURL !== 'undefined'){
      bannedURLS.push(new bannedIp(tempURL));
      bannedURLS[bannedURLS.length-1].resolveIps();
      res.send('watching for '+tempURL);
    }else{
      res.send("I couldn't get what you mean?")
    }
});

var delay = 2000;
var cycleTimes=3;
var currentCycle=0;

function unplug(){
  //send command to motors to unplug
  console.log("unplugging");
  //if rpi
  // gp ioOn();
}
function gpioOn(){
  if(currentCycle>= cycleTimes){
    gpio.destroy(function() {
      console.log('Closed pins, now exit');
    });
    return;
  }
  setTimeout(function() {
    gpio.write(gpioPin, 1, gpioOff);
    currentCycle += 1;
  }, delay);
}
function gpioOff(){
  setTimeout(function() {
      gpio.write(gpioPin, 0, gpioOn);
  }, delay);
}



for(let i=0;i<bannedURLS.length;i++){
  console.log(bannedURLS[i].url);
  bannedURLS[i].resolveIps();
}


tcp_tracker.on('session', function (session) {
  var destIP=session.dst_name;
   // console.log(bannedURLS.length)

  for(let j=0;j<bannedURLS.length;j++){
    for(let i=0;i<bannedURLS[j].ips.length;i++){
      // console.log("here")
      if((bannedURLS[j].ips[i])==destIP){
        console.log("user went to "+bannedURLS[j].url);
        unplug();
      }
    }
  }
  // console.log("Start of session between " + session.src_name + " and " + session.dst_name);
  session.on('end', function (session) {
      // console.log("End of TCP session between " + session.src_name + " and " + session.dst_name);
  });
});

pcap_session.on('packet', function (raw_packet) {
    var packet = pcap.decode.packet(raw_packet);
    tcp_tracker.track_packet(packet);
});
