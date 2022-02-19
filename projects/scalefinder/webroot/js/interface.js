var scales = new Scales();
var matches = [];
var notes = [];
var key = null;
scales.init();

$(function(){
    var $scales    = $("#scales tbody");
    var $notes     = $("#notes");
    var $chordKeys = $("#chordKeys");
    var $scaleKeys = $("#scaleKeys");
    var $flavours  = $("#flavours");
    var $additions = $("#additions");
    var $addButton = $("#addChord");
    const SCALES_URL = "../scales/index.html"

    function noteToIndex(note){
        return this.scales.notes.indexOf(note);
    }

    function indexToNote(index){
        return this.scales.notes[index];
    }

	function toggleNote(note){
        if(this.notes.indexOf(note) >= 0){
            this.notes = this.notes.filter(x => x != note);
        }else{
            this.notes.push(note);
        }
        $("#notes .note:nth-child("+(noteToIndex(note)+1)+")").toggleClass("disabled");
	}

    function addNote(note){
        if(this.notes.indexOf(note) < 0){
            this.notes.push(note);
        }
        $("#notes .note:nth-child("+(noteToIndex(note)+1)+")").removeClass("disabled");
	}

    function changeKey(note){
        $("#notes .note:nth-child("+(noteToIndex(this.key)+1)+")").removeClass("key");
        $("#notes .note:nth-child("+(noteToIndex(note)+1)+")").addClass("key");
        this.key = note;

    }

    function getSelectedChordNoteIndices(){
        var flavour = this.scales.chords[$flavours.val()];
        var selectedAddition = $additions.val();
        var intervals = [];
        var key = noteToIndex($chordKeys.val());
        var result;
        //we need to find the index of the selected addition
        flavour.additions.map((addition,i) => {
            if(addition.code === selectedAddition){
                result =  flavour.additions[i].notes.map(note =>
                    (key+note) % 12
                );
            };
        });
        return result;
    }

    function addChord(){
        getSelectedChordNoteIndices().map(index => addNote(indexToNote(index)));
        update();
	}

	/* DRAW GUI */

    function listMatches(matches){
        var fragment = document.createDocumentFragment();
        if(matches.length == 0){
            var colspan = document.createElement("tr");
            colspan.innerHTML = '<td colspan=42 class="subheader">No results</td>';
            fragment.appendChild(colspan);
            $scales.html(fragment);
            return;
        }

        var prev = undefined;
        for(var i=0;i < matches.length;i++){
            var match = matches[i];
            //add subheaders
            if(prev === undefined || prev.notes.length != match.notes.length){
                var colspan = document.createElement("tr");
                switch(match.notes.length){
                    case 5 : colspan.innerHTML = '<td colspan=42 class="subheader">pentatonic</td>';break;
                    case 6 : colspan.innerHTML = '<td colspan=42 class="subheader">hexatonic</td>';break;
                    case 7 : colspan.innerHTML = '<td colspan=42 class="subheader">heptatonic</td>';break;
                    case 8 : colspan.innerHTML = '<td colspan=42 class="subheader">octatonic</td>';break;
                }
                fragment.appendChild(colspan);
            }
            var elem = document.createElement("tr");
            elem.className = "scale";
            elem.innerHTML = (!prev || prev.name !== match.name)
                ? '<td class="name">'+match.name+"</td>"
                : "<td></td>";
            elem.innerHTML+= '<td class="root"><span class="note key">'+match.key+"</span></td>";
            //add notes
            var html = '<td class="notes">';
            for(note in match.notes){
                if(match.notes[note] != match.key)
                    html+= '<span class="note">'+match.notes[note]+"</span>";
            }
            html+= "</td>";
            elem.innerHTML+= html;
            //add base chords
            html = '<td class="triads">';
            for(chord in match.triadChords){
                html+= '<span class="chord">'+match.triadChords[chord]+"</span>";
            }
            html+= "</td>";
            elem.innerHTML+= html;
            //add full chords
            html = '<td class="chords">';
            for(chord in match.seventhChords){
                html+= '<span class="chord">'+match.seventhChords[chord]+"</span>";
            }
            html+= "</td>";
            elem.innerHTML+= html;

            //add scale link
            html = '<td class="link">';
            html += '<a target=new href="'+ SCALES_URL +
                '?scale='+match.name+'&key='+match.key+'&notes='+match.indices+'"><span class="icon-guitar"></span></a>';
            html += '<a target=new href="'+ SCALES_URL +
                '?scale='+match.name+'&key='+match.key+'&notes='+match.indices+'&tuning=E,A,D,G"><span class="icon-bass"></span></a>';
            html+= "</td>";
            elem.innerHTML+= html;

            fragment.appendChild(elem);
            prev = match;
        }
        $scales.html(fragment);
    }

    function loadNotes(){
        var fragment = document.createDocumentFragment();
        for(i in  this.scales.notes){
            var note = indexToNote(i);
            var elem = document.createElement("div");
            elem.className = "disabled note" ;
            elem.innerHTML = note;
            fragment.appendChild(elem);
        }
        $notes.html(fragment);
    }

    function loadChordKeys(){
        var fragment = document.createDocumentFragment();
        for(i in this.scales.notes){
            var note = indexToNote(i);
            var elem = document.createElement("option");
            elem.value = note;
            elem.innerHTML = note.toUpperCase();
            fragment.appendChild(elem);
        }
        $chordKeys.html(fragment);
    }

    function loadScaleKeys(){
        var fragment = document.createDocumentFragment();
        for(i in this.scales.notes){
            var note = indexToNote(i);
            var elem = document.createElement("option");
            elem.value = note;
            elem.innerHTML = note;
            fragment.appendChild(elem);
        }
        var elem = document.createElement("option");
        elem.value = "none";
        elem.innerHTML = "-";
        elem.selected = "selected";
        fragment.appendChild(elem);
        $scaleKeys.html(fragment);
    }

    function loadFlavours(){
        var fragment = document.createDocumentFragment();
        for(i in this.scales.chords){
            var chord = this.scales.chords[i];
            var elem = document.createElement("option");
            elem.value = i;
            elem.innerHTML = chord.name;
            fragment.appendChild(elem);
        }
        $flavours.html(fragment);
    }

    function loadAdditions(flavour){
        var currentAddition = $additions.val();
        var fragment = document.createDocumentFragment();
        var selection = " ";
        var additions = this.scales.chords[flavour].additions;
        if(additions.filter(add => add.code === currentAddition).length !== 0){
            selection = currentAddition;
        }
        for(i in additions){
            var addition = additions[i];
            var elem = document.createElement("option");
            if(addition.code === selection){
                elem.selected = "selected";
            }
            //We need the code, rather than the index as the value
            //so we can keep the value the same if possible
            elem.value = addition.code;
            elem.innerHTML = addition.code;
            fragment.appendChild(elem);
        }
        $additions.html(fragment);
    }

    function update(){
        var combinedNotes = [].concat(this.notes).concat((this.key != null)? this.key : []);
        this.matches = this.scales.findScale(combinedNotes, this.key);
        listMatches(matches);
    }

	/* BIND ACTIONS */

    $notes.click(function(e){
        if(e.target.id != "notes"){
            var note = e.target.innerHTML;
            toggleNote(note);
            update();
        }
    });

    $scaleKeys.change(function(){
        if($scaleKeys.val() === "none"){
            changeKey(null);
        }else{
            changeKey($scaleKeys.val());
        }
        update();
    });

    $flavours.change(function(){
        loadAdditions($flavours.val());
    });

    $addButton.click(function(e){
        addChord();
    });
    $addButton.on('mouseover',function(e){
        var notes = getSelectedChordNoteIndices();
        for(i in notes){
            $("#notes .note:nth-child("+(notes[i]+1)+")").addClass("highlight");
        }
    });
    $addButton.on('mouseout',function(e){
        $("#notes .note").each(function(i, e){$(e).removeClass("highlight")});
    });

	/* INITIALIZE */

    loadChordKeys();
    loadScaleKeys();
    loadFlavours();
    loadAdditions($flavours.val());
    loadNotes();
    changeKey(null);
    update();
});
