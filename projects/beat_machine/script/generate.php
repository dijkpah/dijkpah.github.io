<?php

function getEncodedVideoString($file) {
   return 'data:audio/ogg;base64,' . base64_encode(file_get_contents($file)); 
}

$filename = "Drum-";
$notes = array("C","Db","D","Eb","E","F","Gb","G","Ab","A","Bb","B");

for($i=0; $i<3; $i++){
	for($j=0; $j<count($notes); $j++){
		$string = "\"".$notes[$j].$i."\": \"\",
";
		print($string);
	}
}

for($i=1; $i<=47; $i++){

	$number = sprintf("%02d",$i);

	$name = $filename.$number.".ogg";

	$file = getEncodedVideoString("ogg/".$name);

	$note = $notes[($i-1)%12];

	$octave = floor(($i-1)/12);

	$result = "\"".$note.($octave+3)."\": \"".$file."\",
";
	print($result);
}

for($i=6; $i<=8; $i++){
	if($i==6){
		$string = "\"B6\": \"\",
";
		print($string);
	}else{
		for($j=0; $j<12; $j++){
			$string = "\"".$notes[$j].$i."\": \"\",
";
			print($string);
		}
	}
}

?>