$(function () {

var $document = $(document),

	$status 	= $('#status'),
	$volumeIcon	= $("#volumeIcon"),
    $bg = $("#bg"),

//---------------------------------SETTINGS----------------------------------//


	snare = 51,//Eb3
	floor = 54,//Gb3
	left = 61, //Db4
	right = 60,//C4
	hihatClosed = 55,//G3
	hihatOpen = 59,//B3
	hihat = hihatOpen,
	caps = false,
	ride = 64, //E4
	crash = 62, //Db
	bass = 49, //Db3

	velocity = 128,
	showKeys = false;

//-------------------------------SOUND FUNCTIONS-----------------------------//

$document.keydown(function(e){
	if(!showKeys){
		showKeys = true;
		visibleKeys();
	}
	if(e.keyCode){
		key = e.keyCode;
	}else{
		key = toKeyCode(e.charCode);
	}
	if(key===49||key===50||key===81||key===87){//1,2,q,w
		startKey(crash);
	}else if(key===51||key===52||key===69||key===82){//3,4,e,r
		startKey(left);
	}else if(key===53||key===54||key===84||key===89){//5,6,t,y
		startKey(right);
	}else if(key===55||key===85||key===73||key===56){//7,8,u,i
		startKey(ride);
	}else if(key===65||key===83||key===90||key===88||key===76){//a,s,z,x,l
		startKey(hihat);
	}else if(key===68||key===70||key===67||key===86){//d,f,c,v
		startKey(snare);
	}else if(key===71||key===72||key===66||key===78||key===32){//g,h,b,n, space
		$("#pedal").addClass("clicked");
		startKey(bass);
	}else if(key===74||key===75||key===77||key===188){//j,k,m,,
		startKey(floor);
	}else if(key===16){//SHIFT
		if(!caps){
			hihat=hihatClosed;
			$("#hihatpedal").addClass("clicked");
		}else{
			hihat=hihatOpen;
			$("#hihatpedal").removeClass("clicked");
		}
	}else if(key===20){//CAPS LOCK
		caps = !caps;
		if(caps){
			hihat=hihatClosed;
			$("#hihatpedal").addClass("clicked");
		}else{
			hihat=hihatOpen;
			$("#hihatpedal").removeClass("clicked");
		}
	}
 });


$document.keyup(function(e){
	if(e.keyCode){
		key = e.keyCode;
	}else{
		key = toKeyCode(e.charCode);
	}
	if(key===16){//SHIFT
		if(caps){
			hihat=hihatClosed;
			$("#hihatpedal").addClass("clicked");
		}else{
			hihat=hihatOpen;
			$("#hihatpedal").removeClass("clicked");
		}
	}else if(key===71||key===72||key===66||key===78||key===32){//g,h,b,n, space
		$("#pedal").removeClass("clicked");
	}
});

startKey = function(key){
	MIDI.noteOn(0, parseInt(key), velocity, 0);
    $bg.toggleClass("trigger");
};

stopKey = function(key){
	MIDI.noteOff(0, parseInt(key), 0);
};

//-----------------------------------ON READY---------------------------------//

$('#message button').attr("disabled", "disabled");

MIDI.loadPlugin({
	soundfontUrl: "./soundfont/synth_drum/",
	instrument: "synth_drum",
	onsuccess: function() {
		MIDI.programChange(0, 118); // Load "synth_drum" (118) into channel 0
		MIDI.setVolume(0, 127);
		$status.text("Loading...Done!");
		$('#continueButton').removeAttr("disabled");
	}
});

//-----------------------------------BUTTONS---------------------------------//


$('#continueButton').on("click tap", function(){
	if($('#continueButton').attr("disabled") !== "disabled"){
		$('#overlay').hide();
		$('#bg').removeClass("blurred");
		$('#content').removeClass("blurred");
	}
});
$('#helpIcon').click(function(){
	$('#overlay').show();
	$('#bg').addClass("blurred");
	$('#content').addClass("blurred");
});

$('#volumeIcon').on("click tap", function(e){
	if(e.target.id == "volumeIcon"){
		$('#slider').toggleClass("hidden");
	}
});

$('#pedal').on("mousedown tap", function(p){
	startKey(bass);
});
$('#bass').on("mousedown tap", function(p){
	startKey(bass);
	$("#pedal").addClass("clicked");
});
$('#pedal').on("mousedown touchstart", function(p){
	$("#pedal").addClass("clicked");
});
$('body').on("mouseup touchend", function(p){
	$("#pedal").removeClass("clicked");
});

$('#hihatpedal').on("mousedown touchstart", function(p){
	caps = !caps;
	if(caps){
		hihat=hihatClosed;
		$("#hihat").addClass("clicked");
		$("#hihatpedal").addClass("clicked");
	}else{
		hihat=hihatOpen;
		$("#hihat").removeClass("clicked");
		$("#hihatpedal").removeClass("clicked");
	}
});

$('#snare').on("mousedown tap", function(p){
	startKey(snare);
});
$('#floor').on("mousedown tap", function(p){
	startKey(floor);
});
$('#left').on("mousedown tap", function(p){
	startKey(left);
});
$('#right').on("mousedown tap", function(p){
	startKey(right);
});

$('#hihat').on("mousedown tap", function(p){
	startKey(hihat);
});
$('#ride').on("mousedown tap", function(p){
	startKey(ride);
});
$('#crash').on("mousedown tap", function(p){
	startKey(crash);
});

$(window).resize(function(){
	if(($(window).height()-82)/$(window).width() < 0.7){
		$("#content").css("width",((1.38 * $(window).height())-82)+"px");
		$("#overlay").css("width",((1.38 * $(window).height())-82)+"px");
	}else{
		$("#content").css("width", "100%" );
		$("#overlay").css("width", "100%" );
	}
});

function is_touch_device() {
   return ('ontouchstart' in window)     // works on most browsers
   || (!!navigator.maxTouchPoints); // works on IE10/11 and Surface
}

function visibleKeys(){
	$('.key').css("visibility", "visible");
}

$(document).ready(function(){
	$(window).trigger('resize');
	showKeys = !is_touch_device();
	if(showKeys){
		visibleKeys();
	}
})


//-----------------------------LOAD VOLUME SLIDER----------------------------//

var selector    = '[data-rangeslider]',
	$element    = $(selector);

$document.on('change', 'input[type="range"]', function(e) {
	velocity = e.target.value;
	$volumeIcon.attr('class', 'icon');
	if(velocity>128){
		$volumeIcon.addClass('icon-volumefull');
	}else if(velocity>=5){
		$volumeIcon.addClass('icon-volumehalf');
	}else{
		$volumeIcon.addClass('icon-volumemute');
	}
});

$element.rangeslider({
	polyfill: false,
	onInit: function() {},
	onSlide: function(position, value) {},
	onSlideEnd: function(position) {}
});


});
