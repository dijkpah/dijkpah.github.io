function Sound(name, lib, cutOff, cutOffHard, cutOffTime){

	this.name = name;
	this.lib = lib;
    this.cutOff = cutOff;
    this.cutOffHard = cutOffHard;
    this.cutOffTime = cutOffTime;

	this.getName = getName;
	this.getLib = getLib;
	this.getCutOff = getCutOff;
	this.getCutOffHard = getCutOffHard;
	this.getCutOffTime = getCutOffTime;

	function getName(){return this.name;};
	function getLib(){return this.lib;};
	function getCutOff(){return this.cutOff;};
	function getCutOffHard(){return this.cutOffHard;};
	function getCutOffTime(){return this.cutOffTime;};

	function toString(){return JSON.stringify(this)};
};

function SoundLibrary(sounds){
	this.sounds      = sounds;
	this.soundNames  = soundNames;
	this.save        = save;
	this.load        = load;
	this.loadSound   = loadSound;
	this.getSound    = getSound;
	this.addSound    = addSound;
	this.deleteSound = deleteSound;
	this.changeSound = changeSound;
	this.toString    = toString;
	this.example     = example;

	function soundNames(){
		var names = new Array();
		for(i=0;i<this.sounds.length;i++){
			names.push(this.sounds[i].getName());
		}
		return names;
	};

	function save(){
		document.cookie="sounds="+this.toString();
	};

	function load(){
		this.sounds = new Array();
		var soundsLib = JSON.parse(getCookieValue("sounds"));
		if(soundsLib != null){soundsLib = soundsLib["sounds"];}else{soundsLib = new Array();}
		soundsLib.sort(function(a, b){
		    if( a["name"] < b["name"]) return -1;
		    if( a["name"] > b["name"]) return 1;
		    return 0;
		});
		for(i=0;i<soundsLib.length;i++){
			this.sounds.push(new Sound(
				soundsLib[i]["name"],
				soundsLib[i]["lib"],
				soundsLib[i]["cutOff"],
				soundsLib[i]["cutOffHard"],
				soundsLib[i]["cutOffTime"]
			));
		}
	};

	function loadSound(name){
		this.load();//reload sounds to remove changes made since previous load
		for(i=0;i<this.sounds.length;i++){
			if(this.sounds[i]["name"] == name){
				return this.sounds[i];
			}
		}
	};

	function getSound(name){
		for(i=0;i<this.sounds.length;i++){
			if(this.sounds[i]["name"] == name){
				return this.sounds[i];
			}
		}
	}

	function addSound(sound){
		this.load();//reload sounds to remove changes made since previous load
		this.sounds.push(sound);
		this.save();
	};

	function changeSound(sound){
		this.load();//reload sounds to remove changes made since previous load
		var name = sound.getName();
		this.deleteSound(name);
		this.sounds.push(sound);
		this.save();
	};

	function deleteSound(name){
		this.load();//reload sounds to remove changes made since previous load
		this.sounds.splice(this.sounds.indexOf(this.getSound(name)),1);
		this.save();
	};

	function toString(){
		return JSON.stringify(this);
	};

	function example(){
		var name = "Fez";
		var lib	 = [
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
			0,          //neq. freq. deviation cap [-200..0]                        //1053.0000, 	//min   freq.	[20..2400]
			790.0000,	//start freq.	[20..2400]
			0,          //pos. freq. deviation cap [0..200]                        //1207.0000,	//max   freq.	[20..2400]
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
		var cutOff = true;
		var cutOffHard = false;
		var cutOffTime = 400;
		return new Sound(name, lib, cutOff, cutOffHard, cutOffTime);
	};
};

function parseSound(string){
	json  = JSON.parse(string);
	return new Sound(json['name'], json['lib'], json['cutOff'], json['cutOffHard'], json['cutOffTime']);
};

function getCookieValue(key) {
  var cookies = document.cookie.split('; ');
  for (var i = 0, parts; (parts = cookies[i] && cookies[i].split('=')); i++) {
    if (parts.shift() === key) {
      return parts.join('=');
    }
  }
  return null;
}
