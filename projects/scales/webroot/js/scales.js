function Scales(){//0,  1,    2,   3,   4,    5,   6,    7,   8,   9,    10,  11
	this.notes = ["A", "B♭", "B", "C", "D♭", "D", "E♭", "E", "F", "G♭", "G", "A♭"];
	this.scales = {//Scales in A
		"chromatic":		[0,1,2,3,4,5,6,7,8,9,10,11], //this.notes
		"dorian":			[0,2,3,5,7,9,10],	//A, B, C, D, E, F#,G
		"harmonic minor":	[0,2,3,5,7,8,11],	//A, B, C, D, E, F, G#
		"major":			[0,2,4,5,7,9,11],	//A, B, C#,D, E, F#,G#
		"melodic minor":	[0,2,3,5,7,9,11],	//A, B, C, D, E, F#,G#
		"natural minor":	[0,2,3,5,7,8,10], 	//A, B, C, D, E, F, G
		"pentatonic minor blues":[0,3,5,6,7,10],//A, C, D, D#,E, G
		"pentatonic minor": [0,3,5,7,10], 		//A, C, D, E, G
		"pentatonic major": [0,2,4,7,9],		//A, B, C#,E, F#
		"custom":[0]
	};
	this.tuning = ["E", "A", "D", "G", "B", "E"]; //Standard tuning

	this.getScale = getScale;
	this.toString = toString;
	this.getScaleNames = getScaleNames;
	this.drawNeck = drawNeck;
	this.drawNotes = drawNotes;
	this.toggleCustomNote = toggleCustomNote;
	this.changeTuning = changeTuning;

	function getScale(scaleName, key){
		var result=[];
		var keyIndex = this.notes.indexOf(key);
		var scale = this.scales[scaleName];
		for(var i=0;i<this.scales[scaleName].length;i++){
			result.push(this.notes[(scale[i]+keyIndex)%this.notes.length]);
		}
		return result;
	};

	function getScaleNames(){
		var keys = [];
		for (var key in this.scales) {
			keys.push(key);
		}
		return keys;
	};

	function toString(scaleName, key){
		var result="";
		var keyIndex = this.notes.indexOf(key);
		var scale = this.scales[scaleName];
		for(var i=0;i<this.scales[scaleName].length;i++){
			result += this.notes[(scale[i]+keyIndex)%this.notes.length]+",";
		}
		return result;
	};

	function drawNeck(scale, key, tuning){
		if(!tuning){
			tuning = this.tuning;
		}
		if(!key){
			key = "C";
		}
		scale = this.getScale(scale, key);

		var fragment = document.createDocumentFragment();

		for(var string=tuning.length-1;string>=0;string--){
			var tr = document.createElement("tr");

			for(var fret=0;fret<23;fret++){
				var td = document.createElement("td");
				td.style.width = (Math.max(8-0.25*fret,3))+"em";

				var note = this.notes[(fret+this.notes.indexOf(tuning[string]))%this.notes.length];
				if(scale.indexOf(note) !== -1){
					var div = document.createElement("div");
					div.style.left = "-"+(Math.max(3.9-0.088*fret,2.1))+"em";
					div.className = "note" + (note === key ? " key":"");
					div.innerHTML = note;
					td.appendChild(div);
				}

				if((fret+1)%2===0 && string ==Math.ceil((tuning.length-1)/2) && fret !== 1 && fret !== 11 && fret !== 13 && fret !== 23){
					var div = document.createElement("div");
					div.className = "dot";
					div.style.left = "-"+(Math.max(4.2-0.092*fret,2.2))+"em";
					td.appendChild(div);
				}else if(fret===12 && (string==Math.ceil((tuning.length-1)/2-1) || string==Math.ceil((tuning.length-1)/2)+1)){
					var div = document.createElement("div");
					div.className = "dot";
					div.style.left = "-"+(Math.max(4.3-0.1*fret,3))+"em";
					td.appendChild(div);
				}
				tr.appendChild(td);
			}
			fragment.appendChild(tr);
		}
		var table = document.createElement("table");
		table.appendChild(fragment);
		$('#neck').html(table);
	};

	function drawNotes(key){
		var scale = this.scales["custom"];
		var keyIndex = this.notes.indexOf(key);
		var fragment = document.createDocumentFragment();

		for(var i=0;i < this.notes.length;i++){
			var note = document.createElement("div");
			var diff = (i - keyIndex+12)%12;//interval from key note
			if(scale.indexOf(diff)>-1){
				note.className = "note" + (this.notes[i]===key ? " key" : "");
			}else{
				note.className = "disabled note" + (this.notes[i]===key ? " key" : "");
			}
			note.innerHTML = this.notes[i];
			fragment.appendChild(note);
		}
		$('#notes').html(fragment);
	};

	function toggleCustomNote(key, note){
		var keyIndex = this.notes.indexOf(key);
		var noteIndex = this.notes.indexOf(note);
		var diff = (noteIndex - keyIndex +12) % 12;//interval of toggled note in scale
		var customIndex = this.scales["custom"].indexOf(diff);//index of interval of toggled note in custom scale
		if(customIndex !== -1){
			this.scales["custom"].splice(customIndex, 1);//remove interval from custom scale
		}else{
			this.scales["custom"].push(diff);
		}
	};


	function changeTuning(tuning){
		this.tuning = tuning;
		var fragment = document.createDocumentFragment();
		for(var string=0;string<tuning.length;string++){
			var div = document.createElement("div");
			div.id = "string-"+string;

			var upButton = document.createElement("button");
			upButton.className = "up";
			var upCircle = document.createElement("div");
			upCircle.className = "circle";
			upCircle.innerHTML = "&#x25B2;";
			upButton.appendChild(upCircle);
			div.appendChild(upButton);

			var input = document.createElement("input");
			input.className = "value";
			input.value = tuning[string];
			input.disabled = "disabled";
			div.appendChild(input);

			var downButton = document.createElement("button");
			downButton.className = "down";
			var downCircle = document.createElement("div");
			downCircle.className = "circle";
			downCircle.innerHTML = "&#x25BC;";
			downButton.appendChild(downCircle);
			div.appendChild(downButton);

			fragment.appendChild(div);
		}

		$('#tuning').html(fragment);

	};

};
