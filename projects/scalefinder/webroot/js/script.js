function Scales(){
    this.notes        = ["a", "b♭", "b", "c", "d♭", "d", "e♭", "e", "f", "g♭", "g", "a♭"];
    this.encodedNotes = ["a", "1",  "b", "c", "2",  "d", "3", "e", "f", "4",  "g", "5" ];

    this.scales = [
        {name:"pentatonic minor",distances:[3,2,2,3,2],       keys:[] },  //C E♭ F  G  B♭
        {name:"pentatonic major",distances:[2,2,3,2,3],       keys:[] },  //C E  D  G  A
        {name:"augmented",       distances:[3,1,3,1,3,1],     keys:[] },  //C E♭ E  G  A♭ B
        {name:"major blues",     distances:[2,1,1,3,2,3],     keys:[] },  //C D  E♭ E  G  A
        {name:"minor blues",     distances:[3,2,1,1,3,2],     keys:[] },  //C E♭ F  G♭ G  B♭
        {name:"whole tone",      distances:[2,2,2,2,2,2],     keys:[] },  //C D  E  G♭ A♭ B♭
        {name:"major",           distances:[2,2,1,2,2,2,1],   keys:[] },  //C D  E  F  G  A  B
        {name:"harmonic minor",  distances:[2,1,2,2,1,3,1],   keys:[] },  //C D  E♭ F  G  A♭ B
        {name:"melodic minor",   distances:[2,1,2,2,2,2,1],   keys:[] },  //C D  E♭ F  G  A  B
        {name:"natural minor",   distances:[2,1,2,2,1,2,2],   keys:[] },  //C D  E♭ F  G  A♭ B♭
        {name:"dorian",          distances:[2,1,2,2,2,1,2],   keys:[] },  //C D  E♭ F  G  A  B♭
        {name:"phrygian",        distances:[1,2,2,2,1,2,2],   keys:[] },  //C D♭ E♭ F  G  A♭ B♭
        {name:"lydian",          distances:[2,2,2,1,2,2,1],   keys:[] },  //C D  E  F  G♭ A  B
        {name:"mixolydian",      distances:[2,2,1,2,2,1,2],   keys:[] },  //C D  E  F  G  A  B♭
        {name:"locrian",         distances:[1,2,2,1,2,2,2],   keys:[] },  //C D♭ E♭ F  G♭ A♭ B♭
        {name:"gypsy",           distances:[2,1,3,1,1,3,1],   keys:[] },  //C D  E♭ G♭ G  A♭ B
        {name:"diminished",      distances:[1,2,1,2,1,2,1,2], keys:[] },  //C D♭ E♭ E  G♭ G  A B♭
    ];

    //number: 1 2 3 4 5 6 7  8 9 10 11 12 13
    //note:   C D E F G A B  C D E  F  G  A
    //index:  0 2 4 5 7 9 11 0 2 4  5  7  9
    this.chords = [
        {name:"major", code: "", additions: [
            { code: "",   notes: [0, 4, 7]},              //C E G
            { code: "6",  notes: [0, 4, 7, 9]},           //C E G A
            { code: "Δ",  notes: [0, 4, 7, 11]},          //C E G B
            { code: "Δ9", notes: [0, 4, 7, 11, 2]},       //C E G B  D
            { code: "Δ11",notes: [0, 4, 7, 11, 2, 5]},    //C E G B  D F
            { code: "Δ13",notes: [0, 4, 7, 11, 2, 5, 9]}, //C E G B  D F A
            { code: "7",  notes: [0, 4, 7, 10]},          //C E G B♭
            { code: "9",  notes: [0, 4, 7, 10, 2]},       //C E G B♭ D
            { code: "11", notes: [0, 4, 7, 10, 2, 5]},    //C E G B♭ D F
            { code: "13", notes: [0, 4, 7, 10, 2, 5, 9]}, //C E G B♭ D F A
        ]},
        {name:"minor", code: "m", additions: [
            { code: "",    notes: [0, 3, 7]},             //C E♭ G
            { code: "6",   notes: [0, 3, 7, 9]},          //C E♭ G A
            { code: "Δ",   notes: [0, 3, 7, 11]},         //C E♭ G B
            { code: "Δ9",  notes: [0, 3, 7, 11, 2]},      //C E♭ G B  D
            { code: "Δ11", notes: [0, 3, 7, 11, 2, 5]},   //C E♭ G B  D F
            { code: "Δ13", notes: [0, 3, 7, 11, 2, 5, 9]},//C E♭ G B  D F A
            { code: "7",   notes: [0, 3, 7, 10]},         //C E♭ G B♭
            { code: "9",   notes: [0, 3, 7, 10, 2]},      //C E♭ G B♭ D
            { code: "11",  notes: [0, 3, 7, 10, 2, 5]},   //C E♭ G B♭ D F
            { code: "13",  notes: [0, 3, 7, 10, 2, 5, 9]},//C E♭ G B♭ D F A
        ]},
        {name:"diminished", code: "o", additions: [
            { code: "",   notes: [0, 3, 6]},              //C E♭ G♭
            { code: "7",  notes: [0, 3, 6, 9]},           //C E♭ G♭ B♭♭
            { code: "9",  notes: [0, 3, 6, 9, 2]},        //C E♭ G♭ B♭♭ D
            { code: "11", notes: [0, 3, 6, 9, 1, 5]},     //C E♭ G♭ B♭♭ D♭
        ]},
        {name:"half diminished", code: "ø", additions: [
            { code: "",   notes: [0, 3, 6, 10]},         //C E♭ G♭ B♭
            { code: "9",  notes: [0, 3, 6, 10, 2]},      //C E♭ G♭ B♭ D
            { code: "11", notes: [0, 3, 6, 10, 1, 5]},   //C E♭ G♭ B♭ D♭ F
            { code: "13", notes: [0, 3, 6, 10, 1, 5, 9]},//C E♭ G♭ B♭ D♭ F A
        ]},
        {name:"augmented", code: "+", additions: [
            { code: "",   notes: [0, 4, 8]},              //C E G#
            { code: "7",  notes: [0, 4, 8, 10]},          //C E G# B♭
            { code: "9",  notes: [0, 4, 8, 10, 2]},       //C E G# B♭ D
            { code: "11", notes: [0, 4, 8, 10, 2, 5]},    //C E G# B♭ D F
            { code: "13", notes: [0, 4, 8, 10, 2, 5, 9]}, //C E G# B♭ D F A
        ]},
        {name:"suspended", code: "sus", additions: [
            { code: "2",  notes: [0, 2, 7]},              //C D G
            { code: "",   notes: [0, 5, 7]},              //C F G
            { code: "7",  notes: [0, 5, 7, 10]},          //C F G B♭
            { code: "2+", notes: [0, 2, 8]},              //C D A♭
            { code: "+",  notes: [0, 5, 8]},              //C F A♭
        ]},
        {name:"other", code: "", additions: [
            { code: "m(#5)", notes: [0, 3, 8]},           //C E♭ G#
            { code: "(♭5)", notes: [0, 4, 6]},           //C E G♭
            { code: "7(♭5)",notes: [0, 4, 6, 10]},       //C E G♭ B♭
            { code: "5",     notes: [0, 7]},              //C   G
        ]},
    ];

    this.getChordFlavours = getChordFlavours;
    this.getChordAdditions = getChordAdditions;
    this.findScale = findScale;
    this.findChords = findChords;
    this.findChord = findChord;
    this.findAllChords = findAllChords;
    this.init = init;
    this.encode = encode;

    function findChords(scale, sevenths = false, all=false){
        var chords = [];
        for(rootstr in scale.distances){
            //calculate allowed notes
            var scaleNotes = [];
            var note = 0;
            var root = parseInt(rootstr);
            for(var i=0;i<scale.distances.length;i++){
                scaleNotes.push(note);
                note = (note + scale.distances[(root+i) % scale.distances.length]) % 12;
            }
            if(all){
                chords.push(this.findAllChords(scaleNotes));
            }else{
                chords.push(this.findChord(scaleNotes, sevenths));
            }
        }
        return chords;
    }

    function findChord(scaleNotes, sevenths = false){
        var matchChord = "?";
        var matchSize = 0;
        for(flavour in this.chords){

            var chord = this.chords[flavour];
            for(i in chord.additions){
                var addition = chord.additions[i];
                var notes = addition.notes;
                if((
                        (sevenths && notes.length > matchSize && notes.length <= 4 && addition.code !== "6") ||
                        (notes.length == 3 && !sevenths)
                    ) &&
                    (notes.filter(note => scaleNotes.indexOf(note) <0).length == 0)
                ){
                    matchSize = notes.length;
                    matchChord = chord.code+addition.code;
                }
            }
            //Maintain chord priority
            if(matchSize > 0){
                // hardcoded skip on diminished with possibility of half diminished
                // due to shared chord base
                if(sevenths && matchChord === "o" && scaleNotes.indexOf(10) >= 0){
                    matchChord = "ø";
                }
                break;
            }
        }
        return matchChord;
    }

    function findAllChords(scaleNotes){
        var matches = [];
        for(flavour in this.chords){
            var chord = this.chords[flavour];
            for(i in chord.additions){
                var addition = chord.additions[i];
                var notes = addition.notes;
                if(notes.filter(note => scaleNotes.indexOf(note) <0).length == 0){
                    matches.push(chord.code+addition.code);
                }
            }
        }
        return matches;
    }

    function getChordFlavours(){
        var keys = [];
        for (var key in this.chords) {
            keys.push(key);
        }
        return keys;
    };

    function getChordAdditions(chord){
        var keys = [];
        for (var key in this.chords[chord]) {
            keys.push(key);
        }
        return keys;
    };

    function encode(scaleNotes){
        var result = "";
        for(i in scaleNotes){
            result += this.encodedNotes[this.notes.indexOf(scaleNotes[i])];
        }
        return result;
    };

    function findScale(scaleNotes, selectedKey = null){
        scaleNotes = this.encode(scaleNotes);
        if(selectedKey !== null){//convert note to index
            selectedKey = this.notes.indexOf(selectedKey);
        }
        var result = [];
        for(scale in this.scales){
            for(var key=0;key<this.scales[scale].keys.length;key++){ //we need to get the index as number
                if(
                    new RegExp("\\b["+ this.scales[scale].keys[key].regexp+"]+\\b").test(scaleNotes) &&
                    (selectedKey == null || key === selectedKey)
                ){
                    result.push(this.scales[scale].keys[key]);
                }
            }
        }
        return result;
    };

    function init(){
        for(scale in this.scales){

            this.scales[scale].seventhChords = this.findChords(this.scales[scale], true);
            this.scales[scale].triadChords   = this.findChords(this.scales[scale]);
            this.scales[scale].allChords     = this.findChords(this.scales[scale], false, true);

            for(key = 0; key < this.notes.length;key++){
                var seventhChords = [];
                var triadChords   = [];
                var scaleNotes    = [];
                var indices       = [];
                var note  = key;
                var index = 0;

                for(distance in this.scales[scale].distances){
                    var scaleNote = this.notes[note];
                    scaleNotes.push(scaleNote);
                    indices.push(index);
                    seventhChords.push(scaleNote.toUpperCase()+this.scales[scale].seventhChords[distance]);
                    triadChords.push(  scaleNote.toUpperCase()+this.scales[scale].triadChords[distance]);

                    var dist = this.scales[scale].distances[distance];
                    index+= dist;
                    note = (note + dist) % 12;
                }

                this.scales[scale].keys[key] = {
                    "key":this.notes[key],
                    "notes":scaleNotes,
                    "indices": indices,
                    "name": this.scales[scale].name,
                    "regexp":this.encode(scaleNotes),
                    "seventhChords": seventhChords,
                    "triadChords": triadChords,
                };
            }
        }
    };

};
