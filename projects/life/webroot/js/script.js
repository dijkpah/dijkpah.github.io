$(function(){

var colors = [[0,0,1],[0,1,0],[0,1,1],[1,0,0],[1,0,1],[1,1,0],[1,1,1]]
,   tiles
,   interval
,   pxPerTile = 6
,   canvas = document.getElementById("canvas")
,   width = window.innerWidth
,   height = window.innerHeight
,   tilesWidth = Math.ceil(width/pxPerTile)
,   tilesHeight = Math.ceil(height/pxPerTile)
,   ctx = canvas.getContext("2d")
,   birthWhen
,   surviveWhen
;


function getColor(rgb){
    if(rgb[0]){
        if(rgb[1]){
            if(rgb[2]){
                return 'white';//white
            }else{
                return 'DarkOrange';//orange
            }
        }else if(rgb[2]){
            return 'purple';//purple
        }else{
            return 'red';//red
        }
    }else if(rgb[1]){
        if(rgb[2]){
            return '#5FAD41';//green
        }else{
            return '#FAA613';//yellow
        }
    }else if(rgb[2]){
        return '#0D00A4';//blue
    }else{
        return '#141414';//black
    }
}

function getInitValue(x,y){
    if(Math.random()<0.5)
        return [0,0,0];
    return colors[Math.floor(Math.random()*7)];
}

function next(matrix){
    var nextTiles = new Array();
    for(var y=0;y<matrix.length;y++){
        nextTiles[y] = new Array();
        for(var x=0;x<matrix[y].length;x++){
            nextTiles[y][x]=getDot(x,y);
        }
    }
    return nextTiles;
}

function notBlack(rgb){
    return rgb[0] || rgb[1] || rgb[2];
}

function getDot(x,y){
    var tile = tiles[y][x]
    ,   rgb = [tile[0],tile[1],tile[2]]
    ,   nc = 0
    ,   neighbours = [
        tiles[y][(x+1) % tilesWidth],
        tiles[y][(x-1+tilesWidth)%tilesWidth],
        tiles[(y+1)%tilesHeight][(x+1)%tilesWidth],
        tiles[(y+1)%tilesHeight][x],
        tiles[(y+1)%tilesHeight][(x-1+tilesWidth)%tilesWidth],
        tiles[(y-1+tilesHeight)%tilesHeight][(x+1)%tilesWidth],
        tiles[(y-1+tilesHeight)%tilesHeight][x],
        tiles[(y-1+tilesHeight)%tilesHeight][(x-1+tilesWidth)%tilesWidth]
    ];

    //collect colours of neighbours
    for(var n in neighbours){
        var nb = neighbours[n];
    	if (notBlack(nb)){
    		nc++; rgb[0] += nb[0]; rgb[1] += nb[1]; rgb[2] += nb[2];
    	}
    }
    if((notBlack(tile) && surviveWhen.indexOf(nc)>-1)  || birthWhen.indexOf(nc)>-1 ){
    // if((notBlack(tiles[y][x]) && (nc == 1 || nc==3))  || nc == 2 ){
    // if(notBlack(tiles[y][x]) && nc == 2 || nc == 3 ){
        var r = rgb[0]
        ,   g = rgb[1]
        ,   b = rgb[2];

        if(r>g){
            if(r>b){
                return [1,0,0];//red
            }else if(r==b){
                return [1,0,1];//purple
            }else{
                return [0,0,1];//blue
            }
        }else if(r==g){
            if(g>b){
                return [1,1,0];//orange
            }else if(g==b){
                return [1,1,1];//white
            }else{
                return [0,0,1];//blue
            }
        }else{
            if(g>b){
                return [0,1,0];//yellow
            }else if(g==b){
                return [0,1,1];//green
            }else{
                return [0,0,1];//blue
            }
        }
    }else{
        return [0,0,0];
    }
}

function drawMatrix(matrix){
    for(var y=0;y<matrix.length;y++){
        for(var x=0;x<matrix[y].length;x++){
            ctx.fillStyle=getColor(matrix[y][x]);
            ctx.fillRect(x*pxPerTile, y*pxPerTile, pxPerTile, pxPerTile);
        }
    }
}

function resize(newWidth, newHeight){

    var newTiles = new Array();
    for(var y=0;y<newHeight;y++){
        var tmp = new Array();
        for(var x=0;x<newWidth;x++){
            if(x<tilesWidth && y<tilesHeight)
                tmp[x] = tiles[y][x];
            else
                tmp[x] = [0,0,0];
        }
        newTiles[y] = tmp;
    }


    tilesWidth = newWidth;
    tilesHeight = newHeight;
    tiles = newTiles;
}

function parseCheckboxes(){
    birthWhen = new Array();
    surviveWhen = new Array();
    for(var i=0;i<9;i++){
        if($('#b'+i).is(':checked'))
            birthWhen.push(i);
        if($('#s'+i).is(':checked'))
            surviveWhen.push(i);
    }
    console.log(birthWhen, surviveWhen);
}

function init(){

    parseCheckboxes();

    canvas.width = width;
    canvas.height = height;

    tilesWidth = Math.ceil(width/pxPerTile);
    tilesHeight = Math.ceil(height/pxPerTile);

    tiles = new Array();

    for(var y=0;y<tilesHeight;y++){
        var tmp = new Array();
        for(var x=0;x<tilesWidth;x++){
            tmp[x] = getInitValue(y,x);
        }
        tiles[y] = tmp;
    }

    clearInterval(interval);
    interval = setInterval(function() {
        tiles = next(tiles);
        drawMatrix(tiles);
    }, 85);
}

$(window).resize(function(){
    canvas.width=window.innerWidth;
    canvas.height=window.innerHeight;
    resize(Math.ceil(canvas.width/pxPerTile), Math.ceil(canvas.height/pxPerTile));
});

$('#restart').click(function(){
    init();
});

init();
});
