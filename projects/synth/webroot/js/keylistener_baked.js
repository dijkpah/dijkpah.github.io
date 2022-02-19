$(function(){


var $document = $(document),
    $volumeIcon = $('#volumeIcon');

var whiteKeysLayout =
    "<div class=\"kkey\">&#8679;</div>" +
    "<div class=\"kkey\">Z</div>" +
    "<div class=\"kkey\">X</div>" +
    "<div class=\"kkey\">C</div>" +
    "<div class=\"kkey\">V</div>" +
    "<div class=\"kkey\">B</div>" +
    "<div class=\"kkey\">N</div>" +
    "<div class=\"kkey\">M</div>" +
    "<div class=\"kkey\">,</div>" +
    "<div class=\"kkey\">.</div>" +
    "<div class=\"kkey\">/</div>" +
    "<div class=\"kkey\">&#8633;</div>" +

    "<div class=\"kkey\">Q</div>" +
    "<div class=\"kkey\">W</div>" +
    "<div class=\"kkey\">E</div>" +
    "<div class=\"kkey\">R</div>" +
    "<div class=\"kkey\">T</div>" +
    "<div class=\"kkey\">Y</div>" +
    "<div class=\"kkey\">U</div>" +
    "<div class=\"kkey\">I</div>" +
    "<div class=\"kkey\">O</div>" +
    "<div class=\"kkey\">P</div>" +
    "<div class=\"kkey\">[</div>" +
    "<div class=\"kkey\">]</div>" +
    "<div class=\"kkey\">\\</div>";

var blackKeysLayout =
    "<div class=\"kkey black\">A</div>" +
    "<div class=\"kkey black\">S</div>" +
    "<div class=\"kkey black last\">D</div>" +
    "<div class=\"kkey black\">G</div>" +
    "<div class=\"kkey black last\">H</div>" +
    "<div class=\"kkey black\">K</div>" +
    "<div class=\"kkey black\">L</div>" +
    "<div class=\"kkey black last\">;</div>" +

    "<div class=\"kkey black\">1</div>" +
    "<div class=\"kkey black last\">2</div>" +
    "<div class=\"kkey black\">4</div>" +
    "<div class=\"kkey black\">5</div>" +
    "<div class=\"kkey black last\">6</div>" +
    "<div class=\"kkey black\">8</div>" +
    "<div class=\"kkey black last\">9</div>" +
    "<div class=\"kkey black\">-</div>" +
    "<div class=\"kkey black\">=</div>" +
    "<div class=\"kkey black last\">&#8592;</div>";

var keyBindingsDefault = Array();
    keyBindingsDefault[16] = 17;	//Shift
    keyBindingsDefault[65] = 18;	//A
    keyBindingsDefault[90] = 19;	//Z
    keyBindingsDefault[83] = 20;	//S
    keyBindingsDefault[88] = 21;	//X
    keyBindingsDefault[68] = 22;	//D
    keyBindingsDefault[67] = 23;	//C
    keyBindingsDefault[86] = 24;	//V
    keyBindingsDefault[71] = 25;	//G
    keyBindingsDefault[66] = 26;	//B
    keyBindingsDefault[72] = 27;	//H
    keyBindingsDefault[78] = 28;	//N
    keyBindingsDefault[77] = 29;	//M
    keyBindingsDefault[75] = 30;	//K
    keyBindingsDefault[188]= 31;	//,
    keyBindingsDefault[76] = 32;	//L
    keyBindingsDefault[190]= 33;	//.
    keyBindingsDefault[186]= 34;	//;
    keyBindingsDefault[191]= 35;	///
    keyBindingsDefault[9]  = 36;	//TAB
    keyBindingsDefault[49] = 37;	//1
    keyBindingsDefault[81] = 38;	//Q
    keyBindingsDefault[50] = 39;	//2
    keyBindingsDefault[87] = 40;	//W
    keyBindingsDefault[69] = 41;	//E
    keyBindingsDefault[52] = 42;	//4
    keyBindingsDefault[82] = 43;	//R
    keyBindingsDefault[53] = 44;	//5
    keyBindingsDefault[84] = 45;	//T
    keyBindingsDefault[54] = 46;	//6
    keyBindingsDefault[89] = 47;	//Y
    keyBindingsDefault[85] = 48;	//U
    keyBindingsDefault[56] = 49;	//8
    keyBindingsDefault[73] = 50;	//I
    keyBindingsDefault[57] = 51;	//9
    keyBindingsDefault[79] = 52;	//O
    keyBindingsDefault[80] = 53;	//P
    keyBindingsDefault[189]= 54;	//-
    keyBindingsDefault[219]= 55;	//[
    keyBindingsDefault[187]= 56;	//=
    keyBindingsDefault[221]= 57;	//]
    keyBindingsDefault[8]  = 58;	//BACKSPACE
    keyBindingsDefault[220]= 59;	//\

var whiteKeysAltLayout =
    "<div class=\"kkey\">&#8633;</div>" +
    "<div class=\"kkey\">Q</div>" +
    "<div class=\"kkey\">W</div>" +
    "<div class=\"kkey\">E</div>" +
    "<div class=\"kkey\">R</div>" +
    "<div class=\"kkey\">T</div>" +
    "<div class=\"kkey\">Y</div>" +
    "<div class=\"kkey\">U</div>" +
    "<div class=\"kkey\">I</div>" +
    "<div class=\"kkey\">O</div>" +
    "<div class=\"kkey\">P</div>" +
    "<div class=\"kkey\">[</div>" +
    "<div class=\"kkey\">]</div>" +
    "<div class=\"kkey\">\\</div>" +
    "<div class=\"kkey\">&#8679;</div>" +
    "<div class=\"kkey\">Z</div>" +
    "<div class=\"kkey\">X</div>" +
    "<div class=\"kkey\">C</div>" +
    "<div class=\"kkey\">V</div>" +
    "<div class=\"kkey\">B</div>" +
    "<div class=\"kkey\">N</div>" +
    "<div class=\"kkey\">M</div>" +
    "<div class=\"kkey\">,</div>" +
    "<div class=\"kkey\">.</div>" +
    "<div class=\"kkey\">/</div>";

var blackKeysAltLayout =
    "<div class=\"kkey black\">1</div>" +
    "<div class=\"kkey black\">2</div>" +
    "<div class=\"kkey black last\">3</div>" +
    "<div class=\"kkey black\">5</div>" +
    "<div class=\"kkey black last\">6</div>" +
    "<div class=\"kkey black\">8</div>" +
    "<div class=\"kkey black\">9</div>" +
    "<div class=\"kkey black last\">0</div>" +
    "<div class=\"kkey black\">=</div>" +
    "<div class=\"kkey black last\">&#8592;</div>" +
    "<div class=\"kkey black\">A</div>" +
    "<div class=\"kkey black\">S</div>" +
    "<div class=\"kkey black last\">D</div>" +
    "<div class=\"kkey black\">G</div>" +
    "<div class=\"kkey black last\">H</div>" +
    "<div class=\"kkey black\">K</div>" +
    "<div class=\"kkey black\">L</div>" +
    "<div class=\"kkey black last\">;</div>";

var keyBindingsAlt = Array();
    keyBindingsAlt[9]	= 17;	//TAB
    keyBindingsAlt[49] = 18;	//1
    keyBindingsAlt[81]	= 19;	//Q
    keyBindingsAlt[50]	= 20;	//2
    keyBindingsAlt[87]	= 21;	//W
    keyBindingsAlt[51]	= 22;	//3
    keyBindingsAlt[69]	= 23;	//E
    keyBindingsAlt[82]	= 24;	//R
    keyBindingsAlt[53]	= 25;	//5
    keyBindingsAlt[84]	= 26;	//T
    keyBindingsAlt[54]	= 27;	//6
    keyBindingsAlt[89]	= 28;	//Y
    keyBindingsAlt[85]	= 29;	//U
    keyBindingsAlt[56]	= 30;	//8
    keyBindingsAlt[73]	= 31;	//I
    keyBindingsAlt[57]	= 32;	//9
    keyBindingsAlt[79]	= 33;	//O
    keyBindingsAlt[48]	= 34;	//0
    keyBindingsAlt[80]	= 35;	//P
    keyBindingsAlt[219] = 36;	//[
    keyBindingsAlt[187] = 37;	//=
    keyBindingsAlt[221] = 38;	//]
    keyBindingsAlt[8]	= 39;	//BACKSPACE
    keyBindingsAlt[220] = 40;	//\
    keyBindingsAlt[16]	= 41;	//Shift
    keyBindingsAlt[65]	= 42;	//A
    keyBindingsAlt[90]	= 43;	//Z
    keyBindingsAlt[83]	= 44;	//S
    keyBindingsAlt[88]	= 45;	//X
    keyBindingsAlt[68]  = 46;	//D
    keyBindingsAlt[67]  = 47;	//C
    keyBindingsAlt[86]  = 48;	//V
    keyBindingsAlt[71]	= 49;	//G
    keyBindingsAlt[66]  = 50;	//B
    keyBindingsAlt[72]	= 51;	//H
    keyBindingsAlt[78]  = 52;	//N
    keyBindingsAlt[77]  = 53;	//M
    keyBindingsAlt[75]  = 54;	//K
    keyBindingsAlt[188] = 55;	//,
    keyBindingsAlt[76]	= 56;	//L
    keyBindingsAlt[190] = 57;	//.
    keyBindingsAlt[186] = 58;	//;
    keyBindingsAlt[191] = 59;	///

var keyBindings = keyBindingsDefault,
    altKeyBindings = false,
    pressedKeys  = [],
    soundBuffers = [],
    noteVolumes = [],
    frequency    = [],
    octaveOffset = 2,
    volume	     = 0.1,
    cutoff		 = true,
    cutoffHard	 = false,
    cutoffTime	 = 400,

// get audio context
    var context;
    if('AudioContext' in window) {
        context = new AudioContext();
    }else if('webkitAudioContext' in window) {
        context = new webkitAudioContext();
    }else if('Audio' in window) {
        context = new Audio();
    }
    
/********************************************
*    			SOUND SHAPE					*
********************************************/
    SHAPE 			= 0,
    QUALITY 		= 1,
    VOLUME 			= 2,
/********************************************
*    			ENVELOPE					*
********************************************/
    ATTACK_TIME 	= 3,
    SUSTAIN_TIME 	= 4,
    SUSTAIN_PUNCH 	= 5,
    DECAY_TIME 		= 6,
/********************************************
*    			FREQUENCY					*
********************************************/
    MIN_FREQ 		= 7,
    START_FREQ 		= 8,
    MAX_FREQ		= 9,
    SLIDE			= 10,
    DELTA_SLIDE		= 11,
/********************************************
*    		  	  VIBRATO					*
********************************************/
    VIBRATO_DEPTH	= 12,
    VIBRATO_FREQ	= 13,
    VIBRATE_DEPTH_SLIDE = 14,
    VIBRATE_FREQ_SLIDE  = 15,
/********************************************
*    			  CHANGE					*
********************************************/
    CHANGE_AMOUNT 	= 16,
    CHANGE_SPEED 	= 17,
/********************************************
*    			 SQUARE DUTY				*
********************************************/
    SQUARE_DUTY 	= 18,
    SQUARE_DUTY_SWEEP = 19,
/********************************************
*    			  REPEAT					*
********************************************/
    REPEAT_SPEED 	= 20,
/********************************************
*    			  PHASER					*
********************************************/
    PHASER_OFFSET	= 21,
    PHASER_SWEEP	= 22,
/********************************************
*    			  FILTERS					*
********************************************/
    LP_CUTOFF		= 23,
    LP_CUTOFF_SWEEP = 24,
    LP_RESONANCE	= 25,
    HP_CUTOFF		= 26,
    HP_CUTOFF_SWEEP	= 27
/*******************************************/

// get sound buffer from jsfx.js
    lib	 = [
    /********************************************
    *    			SOUND SHAPE					*
    ********************************************/
    "saw",
    0.0000,  	//quality: 		[0..16]
    0.1,		//volume: 		[0..1]
    /********************************************
    *    			ENVELOPE					*
    ********************************************/
    0.0140,		//attack time 	[0..1]
    2,			//sustain time	[0..2]
    0.8190,		//sustain punch	[0..3]
    0.3460,		//decay time 	[0..2]
    /********************************************
    *    			FREQUENCY					*
    ********************************************/
    1053.0000, 	//min   freq.	[20..2400]
    790.0000,	//start freq.	[20..2400]
    1207.0000,	//max   freq.	[20..2400]
    -0.1820,	//slide			[-1..1]
    -0.1540,	//delta slide	[-1..1]
    /********************************************
    *    		  	  VIBRATO					*
    ********************************************/
    0.1850,		//vibrato depth	[0..1]
    0.0100,		//vibrato freq.	[0,01..47,592]
    0.0003,		//vib. depth sl	[-0,3..1]
    0.0000,		//vib freq. sl	[-1..1]
    /********************************************
    *    			  CHANGE					*
    ********************************************/
    -1.0000,	//change amount	[-1..1]
    0.0000,		//change speed	[0..1]
    /********************************************
    *    			 SQUARE DUTY				*
    ********************************************/
    0.2230,		//square duty	[0..0,5]
    0.0060,		//sq. duty sweep[-1..1]
    /********************************************
    *    			  REPEAT					*
    ********************************************/
    0.0000,		//repeat speed	[0..0,8]
    /********************************************
    *    			  PHASER					*
    ********************************************/
    -0.3440,	//phaser offset	[-1..1]
    -0.5020,	//phaser sweep	[-1..1]
    /********************************************
    *    			  FILTERS					*
    ********************************************/
    1.0000,		//LP cutoff		[0..1]
    1.0000,		//LP cut. sweep	[-1..1]
    0.4230,		//LP resonance	[0..1]
    0.5980,		//HP cutoff		[0..1]
    0.0000		//HP cut. sweep	[-1..1]
];


$document.keydown(function(e){
    if(e.keyCode){
        key = e.keyCode;
    }else{
        key = toKeyCode(e.charCode);
    }
    if(key in keyBindings){
        startKey(keyBindings[key]);
        e.preventDefault();
    }else if(key === 37){ //left arrow
        if(octaveOffset > 0){
            octaveOffset--;
            $(".key p").each(function(){
                var text = jQuery.text(this),
                    octave = text.charAt(1);
                $(this).html("c"+(parseInt(octave)-1));
            });
        }
    }else if(key === 39){ //right arrow
        if (octaveOffset < 2){
            octaveOffset++;
            $(".key p").each(function(){
                var text = jQuery.text(this),
                    octave = text.charAt(1);
                $(this).html("c"+(parseInt(octave)+1));
            });
        }
    }
 });

$document.keyup(function(e){
    if(e.keyCode){
        key = e.keyCode;
    }else{
        key = toKeyCode(e.charCode);
    }
    if(key in keyBindings){
        stopKey(keyBindings[key]);
    }
});

 $('.key').on('mousedown', function(e){
    if(e.target.id){
        key = e.target.id;
        startKey(key);
    }else{
        key = e.target.parentElement.id;
        startKey(key);
    }
});

$('.key').on('mouseup mouseout', function(e){
    if(e.target.id){
        key = e.target.id;
        stopKey(key);
    }else{
        key = e.target.parentElement.id;
        stopKey(key);
    }
});

bakeSounds = function(sound, buffers){
    for(var i=0;i<127;i++){
        sound[START_FREQ] = frequency[i];
        buffers[i]	= WebAudiox.getBufferFromJsfx(context, lib)
    }
}

startKey = function(key){
    if(!pressedKeys[key]){
        $("#"+key).addClass("pressed");

        var MIDI = parseInt(key)+(12*octaveOffset);
        if(MIDI){
            // play the sound
            var lineOut	= new WebAudiox.LineOut(context),
                source	= context.createBufferSource();
            source.buffer = soundBuffers[MIDI];
            source.connect(lineOut.destination);
            source.start(0);
            noteVolumes[key] = lineOut;
        }
        pressedKeys[key] = true;
    }
};

stopKey = function(key){
    $("#"+key).removeClass("pressed");
    if(cutoff && pressedKeys[key]){
        if(cutoffHard){
            noteVolumes[key].stop(0);
        }else{
            var lineOut = noteVolumes[key],
                startTime = new Date().getTime(),
                interval = setInterval(function(){
                    var t = (new Date().getTime() - startTime);
                    if (t <= cutoffTime){
                         lineOut.volume = Math.cos(Math.PI*((0.5*t)/cutoffTime));
                    }else{
                        clearInterval(interval);
                        lineOut.volume = 0;
                    }
            }, 50 );
        }
    }
    pressedKeys[key] = false;
};


/********************************************
*    			LOADING TABS				*
********************************************/
$('.tabContent').not(':first').hide();
$('ul.tabs li:first').addClass('active').show();
$('ul.tabs li').click(function() {
    $('ul.tabs li.active').removeClass('active');
    $(this).addClass('active');
    $('.tabContent').hide();
    $($('a',this).attr('href')).fadeIn('slow');
    return false;
});
/********************************************
*    			LOADING KNOBS				*
********************************************/
$(".dial").map(function(e){
    var dial = $(this),
        min = dial.attr('data-min'),
        max = dial.attr('data-max');

    dial
        .val(lib[dial.attr('number')])//LOAD PRESET LIBRARY
        .attr('disabled', 'disabled')
        .attr('data-step', ((max-min)> 0 ? (max-min)/100 : 0.05));
});

$(".dial").knob({
    "width":100,
    "height":100,
    "angleOffset":-125,
    "angleArc":250,
    "inputColor": "#3FBBB1",
    "fgColor": "#3FBBB1",
    'change' : function (v) {
        lib[this.$.attr('number')] = v;
        bakeSounds(lib, soundBuffers);
    }
});
/********************************************
*    		LOADING SOUND SHAPES			*
********************************************/
$(".waveform").click(function(e){
    lib[SHAPE] = e.currentTarget.id;
    $(".waveform").removeClass('selected');
    $(e.currentTarget).addClass('selected');
});









$('#whiteKeys').html(whiteKeysLayout);
$('#blackKeys').html(blackKeysLayout);

var velocity = 0.5, // how hard the note hits

//calculate frequencies for MIDI
a = 440; // a is 440 hz...
for (var x=0; x< 127;x++){
   frequency[x] = (a/32) * Math.pow(2,((x-9)/12));
}
bakeSounds(lib, soundBuffers);
//load volume slider
var selector    = '[data-rangeslider]',
    $element    = $(selector);

$document.on('change', 'input[type="range"]', function(e) {
    volume = e.target.value;
    lib[VOLUME] = volume;

    $volumeIcon.attr('class', 'icon');
    if(volume>0.1){
        $volumeIcon.addClass('icon-volumefull');
    }else if(volume>=0.01){
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



// Finish loading
$('#status').text("Loading...Done!");
$('#startButton').toggleClass('disabled');


//ACTION ASSIGNMENTS
$('#startButton').click(function(){
    if(!$('#startButton').hasClass('disabled')){
        $('#overlay').hide();
    }
});

$('#switchButton').click(function(){
    if(altKeyBindings){
        altKeyBindings = false;
        keyBindings = keyBindingsDefault;
        $('#whiteKeys').html(whiteKeysLayout);
        $('#blackKeys').html(blackKeysLayout);
    } else {
        altKeyBindings = true;
        keyBindings = keyBindingsAlt;
        $('#whiteKeys').html(whiteKeysAltLayout);
        $('#blackKeys').html(blackKeysAltLayout);
    }
});

$('#helpIcon').click(function(){
    $('#overlay').show();
});


});
