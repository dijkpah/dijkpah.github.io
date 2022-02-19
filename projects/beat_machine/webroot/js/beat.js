function Song(name, bpm, notes, beats, bar, beat){

	this.name = name;
	this.bpm = bpm;
	this.notes = notes;
	this.beats = beats;
	this.bar = bar;
	this.beat = beat;
	
	this.getName = getName;
	this.getBpm = getBpm;
	this.getNotes = getNotes;
	this.getBeats = getBeats;
	this.getBar = getBar;
	this.getBeat = getBeat;
	
	this.toString = toString;
	
	function getName(){return this.name;};
	function getBpm(){return this.bpm;};
	function getNotes(){return this.notes;};
	function getBeats(){return this.beats;};
	function getBar(){return this.bar;};
	function getBeat(){return this.beat;};
	
	function toString(){return JSON.stringify(this)};
};

function SongLibrary(songs){
	this.songs = songs;
	
	this.songNames = songNames;
	this.save = save;
	this.load = load;
	this.loadSong = loadSong;
	this.addSong = addSong;
	this.deleteSong = deleteSong;
	this.changeSong = changeSong;
	this.toString = toString;
	
	function songNames(){
		var names = new Array();
		for(i=0;i<this.songs.length;i++){
			names.push(this.songs[i].getName());
		}
		return names;
	};
	
	function save(){
		document.cookie="songs="+this.toString();
	};
	
	function load(){
		var songsLib = JSON.parse(getCookieValue("songs"));
		if(songsLib != null){songsLib = songsLib["songs"];}else{songsLib = new Array();}
		this.songs = Array();
		for(i=0;i<songsLib.length;i++){
			this.songs.push(new Song(
				songsLib[i]["name"],
				songsLib[i]["bpm"],
				songsLib[i]["notes"],
				songsLib[i]["beats"],
				songsLib[i]["bar"],
				songsLib[i]["beat"]
			));
		}
	};
	
	function loadSong(name){
		for(i=0;i<this.songs.length;i++){
			if(this.songs[i]["name"] == name){
				return this.songs[i];
			}
		}
	};
	
	function addSong(song){
		this.songs.push(song);
		this.save();
	};
	
	function changeSong(song){
		var name = song.getName();
		this.deleteSong(name);
		this.songs.push(song);
		this.save();
	};
	
	function deleteSong(name){
		this.songs.splice(this.songs.indexOf(this.loadSong(name)),1);
		this.save();
	};
	
	function toString(){
		return JSON.stringify(this);
	};
};

function parseSong(string){
	json  = JSON.parse(string);
	return new Song(json['name'], json['bpm'], json['notes'], json['beats'], json['bar'], json['beat']);
};

function example(){
	var name = "Amen Break";
	var bpm = 120;
	var notes = 64;
	var beats = 4;
	var bar = 16;
	var beat = '[["49","55"],[],["49","55"],[],["51","55"],[],["55"],["51"],["55"],["51"],["49","55"],["49"],["51","55"],[],["55"],["51"],["49","55"],[],["49","55"],[],["51","55"],[],["55"],["51"],["55"],["51"],["49","55"],["49"],["51","55"],[],["55"],["51"],["49","55"],[],["55","49"],[],["51","55"],[],["55"],["51"],["55"],["51"],["55","49"],[],["55"],[],["55","51","51"],[],["55"],["51"],["55","49"],["49"],["51","55"],[],["55"],["51"],["55"],["51"],["49","68"],[],["55"],[],["51","55"],[]]';
	return new Song(name, bpm, notes, beats, bar, JSON.parse(beat));
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