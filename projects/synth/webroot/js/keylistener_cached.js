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
    "<div class=\"kkey\">&#8679;</div>" +
    "<div class=\"kkey\">Z</div>" +
    "<div class=\"kkey\">X</div>" +
    "<div class=\"kkey\">C</div>" +
    "<div class=\"kkey\">V</div>" +
    "<div class=\"kkey\">B</div>" +
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
    "<div class=\"kkey\">N</div>" +
    "<div class=\"kkey\">M</div>" +
    "<div class=\"kkey\">,</div>" +
    "<div class=\"kkey\">.</div>" +
    "<div class=\"kkey\">/</div>";

var blackKeysAltLayout =
    "<div class=\"kkey black\">A</div>" +
    "<div class=\"kkey black\">S</div>" +
    "<div class=\"kkey black last\">D</div>" +
    "<div class=\"kkey black\">G</div>" +
    "<div class=\"kkey black last\">`</div>" +
    "<div class=\"kkey black\">2</div>" +
    "<div class=\"kkey black\">3</div>" +
    "<div class=\"kkey black last\">4</div>" +
    "<div class=\"kkey black\">6</div>" +
    "<div class=\"kkey black last\">7</div>" +
    "<div class=\"kkey black\">9</div>" +
    "<div class=\"kkey black\">0</div>" +
    "<div class=\"kkey black last\">-</div>" +
    "<div class=\"kkey black\">&#8592;</div>" +
    "<div class=\"kkey black last\">H</div>" +
    "<div class=\"kkey black\">K</div>" +
    "<div class=\"kkey black\">L</div>" +
    "<div class=\"kkey black last\">;</div>";

var keyBindingsAlt = Array();

    keyBindingsAlt[16]  = 17;	//Shift
    keyBindingsAlt[65]  = 18;	//A
    keyBindingsAlt[90]  = 19;	//Z
    keyBindingsAlt[83]  = 20;	//S
    keyBindingsAlt[88]  = 21;	//X
    keyBindingsAlt[68]  = 22;	//D
    keyBindingsAlt[67]  = 23;	//C
    keyBindingsAlt[86]  = 24;	//V
    keyBindingsAlt[71]	= 25;	//G
    keyBindingsAlt[66]  = 26;	//B
    keyBindingsAlt[192] = 27;	//``
    keyBindingsAlt[9]	= 28;	//TAB
    keyBindingsAlt[81]	= 29;	//Q
    keyBindingsAlt[50]	= 30;	//2
    keyBindingsAlt[87]	= 31;	//W
    keyBindingsAlt[51]	= 32;	//3
    keyBindingsAlt[69]	= 33;	//E
    keyBindingsAlt[52]	= 34;	//4
    keyBindingsAlt[82]	= 35;	//R
    keyBindingsAlt[84]	= 36;	//T
    keyBindingsAlt[54]	= 37;	//6
    keyBindingsAlt[89]	= 38;	//Y
    keyBindingsAlt[55]	= 39;	//7
    keyBindingsAlt[85]	= 40;	//U
    keyBindingsAlt[73]	= 41;	//I
    keyBindingsAlt[57]	= 42;	//9
    keyBindingsAlt[79]	= 43;	//O
    keyBindingsAlt[48]	= 44;	//0
    keyBindingsAlt[80]	= 45;	//P
    keyBindingsAlt[189]	= 46;	//-
    keyBindingsAlt[219] = 47;	//[
    keyBindingsAlt[221] = 48;	//]
    keyBindingsAlt[8]	= 49;	//BACKSPACE
    keyBindingsAlt[220] = 50;	//\
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
    keysEnabled  = true,
    soundBuffers = [],
    noteVolumes  = [],
    frequency    = [],
    neq_freq_dev_cap= 0,//MIN_FREQ = START_FREQ + neq_freq_dev_cap
    pos_freq_dev_cap= 0,//MAX_FREQ = START_FREQ + pos_freq_dev_cap
    FIRST_MIDI   = 17,
    LAST_MIDI    = 107,
    octaveOffset = 2,
    volume	     = 0.1,
    soundName    = "default",
    cutOff		 = true,
    cutOffHard	 = false,
    cutOffTime	 = 400;

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
    lib             = [];


$document.keydown(function(e){
    if(e.keyCode){
        key = e.keyCode;
    }else{
        key = toKeyCode(e.charCode);
    }
    if(key in keyBindings){
        startKey(keyBindings[key]);
        if(keysEnabled)e.preventDefault();
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
        if (octaveOffset < 4){
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


flushCache =function(){
    soundBuffers = [];
};

startKey = function(key){
    if(!pressedKeys[key]){
        $("#"+key).addClass("pressed");

        var MIDI = parseInt(key)+(12*octaveOffset);
        if(MIDI){
            if(soundBuffers[MIDI]){//if sound in cache
                // play the sound
                var lineOut	= new WebAudiox.LineOut(context),
                    source	= context.createBufferSource(),
                    buffer	= soundBuffers[MIDI];
                source.buffer = buffer;
                source.connect(lineOut.destination);
                source.start(0);
                noteVolumes[key] = lineOut;
            }else{
                var min = frequency[MIDI] + neq_freq_dev_cap;
                var max = frequency[MIDI] + pos_freq_dev_cap;
                lib[MIN_FREQ] = (min<frequency[FIRST_MIDI])? frequency[FIRST_MIDI] : min;
                lib[MAX_FREQ] = (max>frequency[FIRST_MIDI])? frequency[LAST_MIDI] : max;
                lib[START_FREQ] = frequency[MIDI];

                // play the sound
                var lineOut	= new WebAudiox.LineOut(context),
                    source	= context.createBufferSource(),
                    buffer	= WebAudiox.getBufferFromJsfx(context, lib);
                source.buffer = buffer;
                source.connect(lineOut.destination);
                source.start(0);
                noteVolumes[key] = lineOut;

                //cache sound
                soundBuffers[MIDI]	= WebAudiox.getBufferFromJsfx(context, lib);
            }
        }
        pressedKeys[key] = true;
    }
};

stopKey = function(key){
    $("#"+key).removeClass("pressed");
    if(cutOff && pressedKeys[key]){
        if(cutOffHard){
            noteVolumes[key].volume =0;
        }else{
            var lineOut = noteVolumes[key],
                startTime = new Date().getTime(),
                interval = setInterval(function(){
                    var t = (new Date().getTime() - startTime);
                    if (t <= cutOffTime){
                        var frac = t/cutOffTime;
                        frac = (1-(frac * frac));
                        lineOut.volume = frac*frac; //(1-(t/c)^2)^2 is more efficient than cos(PI*((0.5*t)/c))
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
        .attr('disabled', 'disabled')
        .attr('data-step', ((max-min)> 0 ? (max-min)/100 : 0.05));
    var option = dial.attr('number');
    if(option == MIN_FREQ){
        dial.val(neq_freq_dev_cap);
    }else if(option == MAX_FREQ){
        dial.val(pos_freq_dev_cap);
    }else{
        dial.val(lib[dial.attr('number')])//LOAD PRESET LIBRARY
    }
});

$(".dial").knob({
    "width":100,
    "height":100,
    "angleOffset":-125,
    "angleArc":250,
    "inputColor": "#3FBBB1",
    "fgColor": "#3FBBB1",
    'change' : function (v) {
        var soundOption = this.$.attr('number');
        if(soundOption == MIN_FREQ){
            neq_freq_dev_cap = v;
        }else if(soundOption == MAX_FREQ){
            pos_freq_dev_cap = v;
        }else{
            lib[soundOption] = v;
        }
        flushCache();
    }
});

/********************************************
*    		LOADING SOUND SHAPES			*
********************************************/
$(".waveform").click(function(e){
    lib[SHAPE] = e.currentTarget.id;
    $(".waveform").removeClass('selected');
    $(e.currentTarget).addClass('selected');
    flushCache();
});

/********************************************
*    		LOADING VOLUME SLIDER    		*
********************************************/
var selector    = '[data-rangeslider]',
    $element    = $(selector);
$element.rangeslider({
    polyfill: false,
    onInit: function() {},
    onSlide: function(position, value) {
        lib[VOLUME] = value;
        flushCache();

        $volumeIcon.attr('class', 'icon');
        if(value>0.1){
            $volumeIcon.addClass('icon-volumefull');
        }else if(value>=0.01){
            $volumeIcon.addClass('icon-volumehalf');
        }else{
            $volumeIcon.addClass('icon-volumemute');
        }
    },
    onSlideEnd: function(position) {}
});

/********************************************
*    	    	LOADING BUTTONS    	    	*
********************************************/
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

$('#cutOffHard').click(function(e){
    cutOffHard = $(e.target).is(':checked');
});

$('#cutOff').click(function(e){
    cutOff = $(e.target).is(':checked');
    $('#cutOffHard').prop('disabled', !cutOff);
});

$('#whiteKeys').html(whiteKeysLayout);
$('#blackKeys').html(blackKeysLayout);

// Finish loading
$('#status').text("Loading...Done!");
$('#startButton').toggleClass('disabled');

$('#helpIcon').click(function(){
    $('#overlay').show();
});

$('#menuIcon').click(function() {
    $("#wrapper").toggleClass("toggled");
});

$('#saveIcon').click(function(){
    var names = soundLibrary.soundNames();
    keysEnabled = false;
    alertify.prompt("Saving... please enter name for this sound:", function (confirm, name) {
        if (confirm && name !== null) {
            if(names.indexOf(name) !== -1){
                alertify.confirm("Name already in use, overwrite?", function (overwrite) {
                    if (overwrite) {
                        //Put freq. deviation cap in lib
                        lib[MIN_FREQ] = neq_freq_dev_cap;
                        lib[MAX_FREQ] = pos_freq_dev_cap;
                        soundLibrary.changeSound(new Sound(name, lib, cutOff, cutOffHard, cutOffTime))
                    }
                });
            } else {
                lib[MIN_FREQ] = neq_freq_dev_cap;
                lib[MAX_FREQ] = pos_freq_dev_cap;
                soundLibrary.addSound(new Sound(name, lib, cutOff, cutOffHard, cutOffTime));
                listSounds();
            }
        }
        keysEnabled = true;
    }, soundName);
});

updateButtons = function(){
    $(".dial").map(function(e){
        var dial = $(this);
        dial.val(lib[dial.attr('number')]).trigger('change')//LOAD PRESET LIBRARY
    });
    $(".waveform").removeClass('selected');
    $("#"+lib[SHAPE]).addClass('selected');
    flushCache();

    $('#cutOffHard').prop('checked', cutOffHard);
    $('#cutOffHard').prop('disabled', !cutOff);
    $('#cutOff').prop('checked', cutOff);
}

/********************************************
*    	    	SOUND LIBRARY    	    	*
********************************************/

//calculate frequencies for MIDI
for (var x=FIRST_MIDI; x<=LAST_MIDI;x++){//7 notes + 7 octaves
   frequency[x] = (440/32) * Math.pow(2,((x-9)/12));
}

function loadSound(sound){
    var oldVolume   = lib[VOLUME];
    soundName       = sound.getName();
    lib             = sound.getLib();
    cutOff          = sound.getCutOff();
    cutOffHard      = sound.getCutOffHard();
    cutOffTime      = sound.getCutOffTime();
    //Extract freq. deviation caps from saved lib
    neq_freq_dev_cap   = lib[MIN_FREQ];
    pos_freq_dev_cap   = lib[MAX_FREQ];
    //Restore volume setting
    lib[VOLUME]     = oldVolume;
}

function listSounds(){
    var names = soundLibrary.soundNames();
    var links = "";
    for(var i=0;i<names.length;i++){
        links += "<li><a href=\"#\" sound=\""+names[i]+"\" class=\"loadSound\"><span class=\"icon icon-open\"></span>"+names[i]+"</a>";
        links += "<a href=\"#\" sound=\""+names[i]+"\" class=\"deleteSound\"><span class=\"icon icon-delete\"></span></a></li>";
    }
    $('#soundList').html(links);

    $('.loadSound').click(function(e){
        var name = $(e.target).attr("sound");
        loadSound(soundLibrary.loadSound(name));
        updateButtons();
    });
    $('.deleteSound').click(function(e){
        var name = $(e.target.parentNode).attr("sound");
        alertify.confirm("Are you sure you want to delete '"+name+"'", function (confirm) {
            if (confirm) {
                soundLibrary.deleteSound(name);
                listSounds();
            }
        });
    });
}

var soundLibrary = new SoundLibrary(new Array());
loadSound(soundLibrary.example());
soundLibrary.load();
updateButtons();
listSounds();

});
