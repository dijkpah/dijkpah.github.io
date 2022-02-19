$(function () {

var $document = $(document),

	$bar   		= $('#bar'),
	$bars  		= $('#bars'),
	$beats 		= $('#beats'),
	$bpm   		= $('#bpm'),
	$load 		= $('#load'),
	$message	= $("#message"),
	$moreButton = $('#moreButton'),
	$notes 		= $('#notes'),
	$overlay	= $('#overlay'),
	$play		= $('#play'),
	$songlist	= $("#songlist"),
	$status 	= $('#status'),
	$volumeIcon	= $("#volumeIcon"),

//---------------------------------SETTINGS----------------------------------//



	midi = [ 65, 68, 62, 70, 64, 66, 55, 59, 69, 63, 61, 50, 51, 53, 60, 58, 54, 49,   52, 67, 71, 73, 74, 75, 76, 77, 78, 79, 82, 83, 86, 87, 88, 90],
	instruments = [
	"Chinese Cymbal", //65
	"Splash Cymbal", //68
	"Crash Cymbal 1", //62
	"Crash Cymbal 2", //70
	"Ride Cymbal", //64
	"Ride Bell", //66
	"Closed Hi Hat", //55
	"Open Hi-Hat", //59
	"Cowbell", //69
	"High Tom", //63
	"Hi-Mid Tom", //61
	"Side Stick", //50
	"Acoustic Snare", //51
	"Electric Snare", //53
	"Low-Mid Tom", //60
	"Low Tom", //58
	"Floor Tom", //54
	"Bass Drum", //49

	"Hand Clap", //52
	"Tambourine", //67
	"Vibraslap", //71
	"Hi Bongo", //73
	"Low Bongo", //74
	"Mute Hi Conga", //75
	"Open Hi Conga", //76
	"Low Conga", //77
	"High Timbale", //78
	"Low Timbale", //79
	"Cabasa", //82
	"Maracas", //83
	"Short Guiro", //86
	"Long Guiro", //87
	"Claves", //88
	"Woodblock", //90
],

	velocity = 128,
	playing  = false,

	name,
	notes,				//amount of notes
	bpm,				//beats per minute
	beats,				//beats per bar
	bar,				//notes per bar
	beat,				//the actual notes
	song = example(),
	lib = new SongLibrary(new Array()),

	more = false; //show all instruments

//---------------------------------IO FUNCTIONS------------------------------//

getURLParameter = function(sParam){
    var sPageURL = window.location.search.substring(1),
		sURLVariables = sPageURL.split('&');
    for (var i = 0; i < sURLVariables.length; i++){
        var sParameterName = sURLVariables[i].split('=');
        if (sParameterName[0] == sParam){
            return sParameterName[1];
        }
    }
};
parse = function(){
	var beat = Array();
	for(note=0;note<notes;note++){
		beat[note] = Array();
		$.each($('input.column_'+note+":checked"), function(i, val){
			beat[note].push( val["name"]);
		});
	}
	return beat;
};

toSong = function(){
	return new Song(name, bpm, notes, beats, bar, beat);
};

load = function(song){
	name  = song.getName();
	bpm   = song.getBpm();
	notes = song.getNotes();
	beats = song.getBeats();
	bar   = song.getBar();
	beat  = song.getBeat();

	redraw();
	setBars(bar);
	$bpm.val(bpm);
	$beats.val(beats);
	$bar.val(bar);
	$notes.val(notes);
	setNotes(notes);

	for(note=0;note<notes;note++){
		for(j=0;j<beat[note].length;j++){
			$("#"+beat[note][j]+"_"+note).attr("checked", "checked");
		}
	}
	return beat;
};

loadButton = function(name){
	load(lib.loadSong(name));
	beat = parse();
};
deleteButton = function(name){
	var confirmation = confirm("Are you sure you want to delete "+(name)+"?");
	if (confirmation === true){
		lib.deleteSong(name);
		$songlist.html(listSongs());
	}
};
urlButton = function(name){
    var url = window.location.protocol + "//" + window.location.host + window.location.pathname +"?song="+btoa(lib.loadSong(name).toString());
    window.prompt("Copy to clipboard: Ctrl+C, Enter", url);
};

//--------------------------------GUI FUNCTIONS------------------------------//

redraw = function(){
	$('table').undelegate('input:checkbox', 'click');
	var table = "<table><tr><th></th>";
	for(j=1;j<=notes;j++){
		table += "<th>"+j+"</th>";
	}
	table += "</tr>";
	for(i=0;i<instruments.length;i++){
		table += "<tr id='instrument_"+midi[i]+"'><th><button class='preview' id='"+midi[i]+"'>&#9654;</button>"+instruments[i]+"</th>";
		for(j=0;j<notes;j++){
			table += "<td><input type='checkbox' class='column_"+j+"' name='"+midi[i]+"' id='"+midi[i]+"_"+j+"'><label for='"+midi[i]+"_"+j+"'><span></span></label></td>";
		}
		table += "</tr>";
	}
	table += "</table>";
	$("#table").html(table);
	$('table').delegate('input:checkbox', 'click', function(e){
		beat = parse();
	});
	$('table').delegate('button.preview','click', function(e){
		e.preventDefault();
		previewButton(e.currentTarget.id);
	});
	moreButton();
};

setBars = function(n){
	$bars.html(
		"td:nth-child("+n+"n+1){"+
			"border-right: 1px solid #CCC;"+
			"padding-right: 2px"+
		"}"
	);
};

setNotes = function(n){
	n = Math.max(n,0);
	n = Math.min(128,n);
	$notes.val(n);
	var diff;
	if(n > notes){
		diff = n - notes;

		//Add header
		var header = "";
		for(j=notes+1;j<=n;j++){
			header+= "<th>"+j+"</th>";
		}
		jQuery($('tr').get(0)).append(header);

		//Add buttons for notes
		for(i=0;i<instruments.length;i++){
			var html = "";
			for(j=notes+0;j<n;j++){
				html+= "<td><input type='checkbox' class='column_"+j+"' name='"+midi[i]+"' id='"+i+"."+j+"'><label for='"+i+"."+j+"'><span></span></label></td>";
			}
			jQuery($('tr').get(i+1)).append(html);
		}
	}else{
		diff = notes - n;
		for(i=0;i<diff;i++){
			//remove header
			$('th:last-child').remove();
			//remove last note from every row
			$('td:last-child').remove();
		}
	}
	notes = n;
};

listSongs = function(){
	$message
		.undelegate( ".loadButton", "click")
		.undelegate( ".deleteButton", "click")
		.undelegate( ".urlButton", "click");
	var list = "<ul>";
	var songs = lib.songNames();
	for(i=0;i<songs.length;i++){
		list += "<li><label>"+songs[i]+
		"</label><button class='loadButton' name='"+songs[i]+"'><h3>Load</h3></button>"+
		"<button class='deleteButton' name='"+songs[i]+"'><h3>Delete</h3></button>"+
		"<button class='urlButton' name='"+songs[i]+"'><h3>Url</h3></button>";
		"</li>";
	}
	list += "</ul>";
	$message
		.delegate( ".loadButton", "click", function(e) {
			loadButton(e.currentTarget.name);
		})
		.delegate( ".deleteButton", "click", function(e) {
			deleteButton(e.currentTarget.name);
		})
		.delegate( ".urlButton", "click", function(e) {
			urlButton(e.currentTarget.name);
		});
	return list;
};

moreButton = function(){
	if (more){
		$('#table tr:gt(18)').slideDown();
		$moreButton.html('Less &#x25B2;');
	}else{
		$('#table tr:gt(18)').slideUp();
		$moreButton.html('More &#x25BC;');
	}
}

previewButton = function(e){
	startKey(e);
}
//-------------------------------SOUND FUNCTIONS-----------------------------//

looper = function(){
	var note = 0;
	duration = (60*1000)/(bpm)*(beats/bar);

	var myLoop = setInterval(function(){
		if(playing){
			$load.attr('style', "width:"+(174+(note*23))+"px");
			for(j=0;j<beat[note].length;j++){
				startKey(beat[note][j]);
			}
			note= (note+1)% notes;
		} else {
			clearInterval(myLoop);
		}
	},duration);
};

changeNote = function(e){
	var input = e.currentTarget.id.split("_");
	var midi = input[0];
	var note = input[1];
	if(e.currentTarget.checked){
		beat[note].push(midi);
	}else{
		beat[note].splice(beat[note].indexOf(midi),1);
	}
}

$document.keydown(function(e){
	if(e.keyCode){
		key = e.keyCode;
	}else{
		key = toKeyCode(e.charCode);
	}
	if(key === 32){//space bar
		e.preventDefault();
		if(!$overlay.is(':visible')){
			$play.click();
		}
	}
 });

startKey = function(key){
	MIDI.noteOn(0, parseInt(key), velocity, 0);
};

stopKey = function(key){
	MIDI.noteOff(0, parseInt(key), 0);
};

//-----------------------------------ON READY---------------------------------//


var getBeat = getURLParameter("song");
if(getBeat){
	load(parseSong(atob(getBeat)));
} else {
	load(song);
}
$status.text("Loading \'"+name+"\'...!");

lib.load();

$bpm.val(bpm);
$notes.val(notes);
$beats.val(beats);
$bar.val(bar);
$('#table tr:gt(18)').hide()

setBars(bar);

moreButton();

$moreButton.on('click', function(){
	more = !more;
	moreButton();
});

$songlist.html(listSongs());

$('#message button').attr("disabled", "disabled");
$beats.on('keyup change', function(){
	beats = parseInt($('#beats').val());
});
$bar.on('keyup change', function(){
	bar = parseInt($('#bar').val());
	setBars(bar);
});
$bpm.on('keyup change', function(){
	bpm = parseInt($('#bpm').val());
});

$('table').delegate('input:checkbox', 'click', function(e){
	beat = parse();
});
$('table').delegate('button.preview','click', function(e){
	e.preventDefault();
	previewButton(e.currentTarget.id);
});

$notes.on('keyup change', function(){
	setNotes(parseInt($('#notes').val()));
});

MIDI.loadPlugin({
	soundfontUrl: "./soundfont/synth_drum/",
	instrument: "synth_drum",
	onsuccess: function() {
		MIDI.programChange(0, 118); // Load "synth_drum" (118) into channel 0
		MIDI.setVolume(0, 127);
		$status.text("Loading...Done!");
		$('#message button').removeAttr("disabled");
	}
});

//-----------------------------------BUTTONS---------------------------------//

$('#continueButton').click(function(){
	$('#overlay').hide();
});
$('#saveIcon').click(function(){
	beat = parse();
	var songName = window.prompt("Save beat as:", name);
	if(songName != null){
		name = songName;
		if(jQuery.inArray(songName, lib.songNames()) >= 0){
			var confirmation = confirm(songName+" already exists, overwrite?");
			if(confirmation){
				lib.changeSong(toSong());
				lib.save();
			}
		} else {
			lib.addSong(toSong());
			lib.save();
		}
	}
});
$('#openIcon').click(function(){
	if(playing){$('#play').click();}
	$('#songlist').html(listSongs());
	$('#overlay').show();
});

$play.click(function(){
	if(!$play.prop('disabled') && !playing){
		beat = parse();
		$play.text('Stop');
		$('#settings input').attr("disabled", "disabled");
		looper();
	} else {
		$('#settings input').removeAttr("disabled");
		$('td.focus').removeClass('focus');
		$play.text('Play');
	}
	playing = !playing;
});

$('#reset').click(function(){
	redraw();
	beat = parse();
	playing = false;
});

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
