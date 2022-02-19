$(function(){

var $document   = $(document),
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
	keyBindingsAlt[49]  = 18;	//1
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

var keyBindings = keyBindingsDefault
  , altKeyBindings = false
  , pressedKeys  = Array()
  , velocity	 = 128
  , octaveOffset = 2




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





startKey = function(key){
	if(!pressedKeys[key]){
		$("#"+key).addClass("pressed");
		MIDI.noteOn(0, parseInt(key)+(12*octaveOffset), velocity, 0);
		pressedKeys[key] = true;
	}
};
stopKey = function(key){
	$("#"+key).removeClass("pressed");
	MIDI.noteOff(0, parseInt(key)+(12*octaveOffset), 0);
	pressedKeys[key] = false;
};


$('#whiteKeys').html(whiteKeysLayout);
$('#blackKeys').html(blackKeysLayout);

MIDI.loadPlugin({
	soundfontUrl: "./soundfont/acoustic_grand_piano/",
	instrument: "acoustic_grand_piano",
	onsuccess: function() {
		MIDI.setVolume(0, 127);
		$('#status').text("Loading...Done!");
		$('#startButton').toggleClass('disabled');
	}
});

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

/********************************************
*    		LOADING VOLUME SLIDER    		*
********************************************/
var	selector    = '[data-rangeslider]',
	$element    = $(selector);

$element.rangeslider({
	polyfill: false,
	onInit: function() {},
	onSlide: function(position, value) {
		velocity = value;
		$('#volumeIcon').attr('class', 'icon');
		if(velocity>128){
			$('#volumeIcon').addClass('icon-volumefull');
		}else if(velocity>=5){
			$('#volumeIcon').addClass('icon-volumehalf');
		}else{
			$('#volumeIcon').addClass('icon-volumemute');
		}
	},
	onSlideEnd: function(position) {}
});
});
