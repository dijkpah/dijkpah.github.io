$(function () {

//---------------------------------SETTINGS----------------------------------//
var bpm = 120,
    playing = false,
    loop = null,

    timeout = 2000,
    counted = 0,
    initial = 0,
    previous = 0,

	closedHiHat = 55,
	openHiHat = 59,
	snare = 51,
	bassKick = 49,

    beep = 52,
    boop = 53,

    $primaryAccentUI = document.getElementById('primary');
    $secondaryAccentUI = document.getElementById('secondary');
    $tapbutton = document.getElementById('tapbutton');
    $bpm = document.getElementById('bpm');

    primaryAccent = bassKick,
    secondaryAccent = snare,
    tick = closedHiHat,

	instruments = [
		"Closed Hi Hat", 			//55
		"Open Hi-Hat",				//59
		"Acoustic Snare", 			//51
		"Bass Drum", 				//49
	],

	velocity = 128,
	beat = [[55,49],[55],[55,51],[55]];	//the actual notes

	var swing = false,
		//strict
		swing_multiplier = 3,
		swing_addition = [[],[tick]];

		//average
		//swing_multiplier = 30,
		//swing_addition = [[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[],[tick],[],[],[],[],[],[],[],[],[],[],[]];

		//loose
		//swing_multiplier = 5,
		//swing_addition = [[],[],[tick],[]];


//---------------------------BEAT CREATION ALGORITHM--------------------------//

convertToBeat = function(permutation){
	var result = [];
	for(var i=0;i<permutation.length;i++){
		for(var j=1;j<=permutation[i];j++){
			var notes = [];
			if(j===1){
				if(i===0){//primary accent
					notes.push(primaryAccent);
				}else{//secondary accent
					notes.push(secondaryAccent);
				}
			}
			notes.push(tick);
			result.push(notes);
            if(swing){
				result = result.concat(swing_addition);
            }
		}
	}
    console.log(result);
	return result;
}


//---------------------------------MIDI LOOPER--------------------------------//

looper = function(){
	var note = 0,
    	duration = (60*1000)/(bpm),
        halfduration = duration /2,
        notes = beat.length;
    if(swing){
        duration = duration / swing_multiplier;
    }
	var myLoop = setInterval(function(){
		if(playing){
            if(note == 0){
                $primaryAccentUI.style.backgroundColor = 'orange';
                setTimeout(function(){$primaryAccentUI.style.backgroundColor = '#1D1D1D';}, halfduration);
            }else if (beat[note].length > 1){
                $primaryAccentUI.style.backgroundColor = '#3399FF';
                setTimeout(function(){$primaryAccentUI.style.backgroundColor = '#1D1D1D';}, halfduration);
            }
            $secondaryAccentUI.style.backgroundColor = '#3399FF';
            setTimeout(function(){$secondaryAccentUI.style.backgroundColor = '#1D1D1D';}, halfduration);

			for(j=0;j<beat[note].length;j++){
				startKey(beat[note][j]);
			}
			note= (note+1)% notes;
		} else {
			clearInterval(myLoop);
		}
	},duration);
    return myLoop;
};

startKey = function(key){
	MIDI.noteOn(0, key, velocity, 0);
};

stopKey = function(key){
	MIDI.noteOff(0, key, 0);
};

MIDI.loadPlugin({
	soundfontUrl: "./soundfont/synth_drum/",
	instrument: "synth_drum",
	onprogress: function(state, progress) {
		console.log(state, progress);
	},
	onsuccess: function() {
		MIDI.programChange(0, 118); // Load "synth_drum" (118) into channel 0
		MIDI.setVolume(0, 127);
		$('#status').text("Loading...Done!");
		$('#startbutton').removeClass('disabled');
	}
});


//-----------------------------METRONOME FUNCTION----------------------------//
window.onkeydown = function(e) {
    var key = e.keyCode ? e.keyCode : e.which;

    if (key == 84) {//t
        e.preventDefault();
        tap();
    }else if(key ==32){
        e.preventDefault();
        play();
    }else if(key == 13){//enter
        if ($("#bpm input").is(":focus")){
            bpm = $('#bpm input').val();
            $bpm.innerHTML = '<i class="icon-note"></i> = '+ bpm;
            update();
        }
    }
};

init = function(){
    counted = 0;
    initial = Date.now();
    previous = initial;
};

tap = function(){
    var now = Date.now();
    if(now - previous > timeout){
        init();
    }else{
        counted++;
        previous = now;
        bpm = Math.round(counted * 60 / ((now - initial)/1000));
        $bpm.innerHTML = '<i class="icon-note"></i> = ' + bpm;
    }
    $tapbutton.style.backgroundColor = 'orange';
    setTimeout(function(){$tapbutton.style.backgroundColor = '#3399FF';}, 100);
};

play = function(){
	if(!$('#startbutton').hasClass('disabled')){
        $('#play').toggleClass('playing');
        playing = !playing;
        if(playing){
            loop = looper();
        }
    }
};

update = function(){
    $('#dropbox').width((($('#dropbox').children().length+1) * 60 + 40) + "px");
    var elems = $('#dropbox .quaver');
    var perm = [];
    for(var i=0;i<elems.length;i++){
        if(elems[i].id === "double"){
            perm.push(2);
        }else{
            perm.push(3);
        }
    }
    beat = convertToBeat(perm);
    if(playing){
        clearInterval(loop);
        loop = looper();
    }
};


//-----------------------------------BUTTONS---------------------------------//
$('input[name=beatbutton]').change(function(){
    if($(this).is(':checked')){//BEAT
        primaryAccent = bassKick;
        secondaryAccent = snare;
        tick = closedHiHat;
    }else{//BEEP
        primaryAccent = beep;
        secondaryAccent = boop;
        tick = boop;
    }
    swing_addition = [[],[tick]];
    update();
});

$('input[name=swingbutton]').change(function(){
    if($(this).is(':checked')){//NORMAL
        swing = false;
    }else{//SWING
        swing = true;
    }
    update();
});

$('#helpIcon').click(function(){
	$('#overlay').show();
});

$("#dragbox").on("click", "li", function(e){
    $("#dropbox").append($(e.currentTarget).clone());
    update();
});

$("#dropbox").on("click", "li", function(e){
    $(e.currentTarget).remove();
    update();
});

$("#dragbox li").draggable({
    cursor: 'move',
    helper: 'clone',
    connectToSortable: '#dropbox',
    appendTo: '#dropbox',
});

$("#dragbox").droppable({
    accept: "#dropbox li",
    drop: function (event, ui) {
        $(ui.draggable).remove();
    }
});

$("#dropbox").droppable({
    accept: "#dragbox li"
});

$("#dropbox").sortable({
    update: function (event, ui) {
        update();
    }
});


$("#dropbox li").dblclick(function () {
    $(this).remove();
    update();
});


$("ul, li").disableSelection();

$('#playbutton').click(function(){
    play();
});

$('#startbutton').click(function(){
	if(!$('#startbutton').hasClass('disabled')){
		$('#overlay').hide();
	}
});

$('#tapbutton').click(function(){
	tap();
});

$('center').bind('touchend', function(e) {
  e.preventDefault();
   $(this).trigger('click').trigger('click');
})

$('#bpm').on("click", function(){
    var sel = getSelection().toString();
    if(!sel){
        this.innerHTML = '<i class="icon-note"></i> = <input type=text name="bpm_input" value='+ bpm +'>';
        $('#bpm input').focus();
        $('#bpm input').blur(function(){
            bpm = $('#bpm input').val();
            $bpm.innerHTML = '<i class="icon-note"></i> = '+ bpm;
            update();
        });
    }
});

//---------------------------------ONLOAD------------------------------------//

update();
$bpm.innerHTML = '<i class="icon-note"></i> = ' + bpm;

//-----------------------------VOLUME SLIDER---------------------------------//
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
