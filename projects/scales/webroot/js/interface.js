var scales = new Scales();
var minStrings = 4;
var maxStrings = 12;
var stringOffset = 5;
var selectedKey = "E";
var selectedScale;

 $(function(){

     function findGetParameter(parameterName) {
        var result = null,
            tmp = [];
        var items = location.search.substr(1).split("&");
        for (var index = 0; index < items.length; index++) {
            tmp = items[index].split("=");
            if (tmp[0] === parameterName) result = decodeURIComponent(tmp[1]);
        }
        return result;
    }

    function updateURL(){
        var url="?";
        url += "scale="+selectedScale+"&";
        url += "key="+selectedKey+"&";
        url += "tuning="+scales.tuning;
        if(selectedScale === "custom"){
            url+="&notes="+scales.scales.custom;
        }
        history.pushState(null, null, url);
    }

	/* ADD FUNCTION TO TUNING GUI */
	$("#tuning").on("click", "button.up, button.down", function(){
		var up = ($(this).attr('class') === 'up');
		var str = $(this).closest('[id^="string-"]').attr('id');
		var stringNumber = parseInt(str.substring(str.indexOf('-')+1));
		var note = $("#string-"+stringNumber+" input").val();
		var nextNote;
		if(up){
			nextNote = scales.notes[(scales.notes.indexOf(note)+1)%scales.notes.length];
		}else{
			nextNote = scales.notes[(scales.notes.indexOf(note)+scales.notes.length-1)%scales.notes.length];
		}
		$("#string-"+stringNumber+" input").val(nextNote);
		selectedTuning[stringNumber] = nextNote;
		scales.drawNeck(selectedScale, selectedKey, selectedTuning);
        updateURL();
	});

	$("#low-string").on("click", "button.add", function(){
		if(selectedTuning.length < maxStrings){
			var newTuning = [scales.notes[(scales.notes.indexOf(selectedTuning[0])+scales.notes.length - stringOffset) % scales.notes.length]];
			selectedTuning = newTuning.concat(selectedTuning);
			scales.changeTuning(selectedTuning);
			scales.drawNeck(selectedScale, selectedKey);
            updateURL();
		}
	});

	$("#low-string").on("click", "button.remove", function(){
		if(selectedTuning.length > minStrings){
			selectedTuning = selectedTuning.slice(1);
			scales.changeTuning(selectedTuning);
			scales.drawNeck(selectedScale, selectedKey);
            updateURL();
		}
	});

	$("#high-string").on("click", "button.add", function(){
		if(selectedTuning.length < maxStrings){
			var newTuning = [scales.notes[(scales.notes.indexOf(selectedTuning[selectedTuning.length-1])+stringOffset) % scales.notes.length]];
			selectedTuning = selectedTuning.concat(newTuning);
			scales.changeTuning(selectedTuning);
			scales.drawNeck(selectedScale, selectedKey);
            updateURL();
		}
	});

	$("#high-string").on("click", "button.remove", function(){
		if(selectedTuning.length > minStrings){
			selectedTuning = selectedTuning.slice(0, selectedTuning.length-1);
			scales.changeTuning(selectedTuning);
			scales.drawNeck(selectedScale, selectedKey);
            updateURL();
		}
	});

	/* ADD FUNCTION TO KEY */
	$("#key").on("click", "button.up, button.down", function(){
		var up = ($(this).attr('class') === 'up');
		var note = $("#key input").val();
		if(up){
			selectedKey = scales.notes[(scales.notes.indexOf(note)+1)%scales.notes.length];
		}else{
			selectedKey = scales.notes[(scales.notes.indexOf(note)+scales.notes.length-1)%scales.notes.length];
		}

		$("#key input").val(selectedKey);
		scales.drawNeck(selectedScale, selectedKey, selectedTuning);
        scales.drawNotes(selectedKey);
        updateURL();
	});

	/* DRAW AND FILL DROPDOWN */
	var scaleNames = scales.getScaleNames();
	var select = document.createElement("select");

	for(i=0;i<scaleNames.length;i++){
		var option = document.createElement("option");
		option.value = scaleNames[i];
		option.innerHTML = scaleNames[i]
			.replace(/([A-Z])/g, ' $1')
			.replace(/^./, function(str){ return str.toUpperCase(); })+
			" scale";
		if(scaleNames[i] === selectedScale){
			option.selected = "selected";
		}
		select.appendChild(option);
	}
	$('#scale').html(select);


	$("#scale select").change(function(){
		selectedScale = $("#scale select").val()
		scales.drawNeck(selectedScale, selectedKey, selectedTuning);
        if(selectedScale === "custom"){
            $("#notesselector").show();
        }else{
            $("#notesselector").hide();
        }
        updateURL();
	});


    $("#notes").click(function(e){
        var note = e.target.innerHTML;
        scales.toggleCustomNote(selectedKey, note);
        scales.drawNotes(selectedKey);
        scales.drawNeck("custom", selectedKey, selectedTuning);
        updateURL();
    });


    function init(){
        var getSelectedTuning = findGetParameter("tuning"),
            getSelectedScale  = findGetParameter("scale"),
            getSelectedKey    = findGetParameter("key"),
            getSelectedNotes  = findGetParameter("notes");

        selectedScale  = getSelectedScale ? getSelectedScale  : selectedScale;
        selectedKey    = getSelectedKey   ? getSelectedKey.toUpperCase() : selectedKey;
        selectedTuning = getSelectedTuning? getSelectedTuning.toUpperCase().split(",") : selectedTuning;

        if(getSelectedNotes){
            scales.scales["custom"] = getSelectedNotes.split(",").map(note => parseInt(note));
            if(scales.scales[selectedScale] === undefined){
                selectedScale = "custom";
            }
        }

    	/* DRAW GUI */
		$("#key input").val(selectedKey);
		$("#scale select").val(selectedScale);

    	scales.changeTuning(selectedTuning);
    	scales.drawNeck(selectedScale, selectedKey, selectedTuning);
        scales.drawNotes(selectedKey);

        if(selectedScale !== "custom"){
            $("#notesselector").hide();
        }
        updateURL();
    }

    init();
 });
