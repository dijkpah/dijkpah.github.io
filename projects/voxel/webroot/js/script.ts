/*******************************************************************************
 * Types
 ******************************************************************************/

type ABGR = number;

/*******************************************************************************
 * Constants
 ******************************************************************************/

const CANVAS_ELEM = document.getElementById('canvas')! as HTMLCanvasElement
const CANVAS_CONTEXT = CANVAS_ELEM.getContext('2d')!;

const INIT_IMAGE_DATA = CANVAS_CONTEXT.createImageData(CANVAS_ELEM.width, CANVAS_ELEM.height);
const INIT_BUFF_ARR = new ArrayBuffer(INIT_IMAGE_DATA.width * INIT_IMAGE_DATA.height * 4);

const BACKGROUND_COLOR = "#9090E0";

// Controls --------------------------------------------------------------------

const HORIZON_HORIZONTAL = 100;

const MOUSE_FORWARD_SPEED = 3;
const MOUSE_PITCH_SPEED = 500;
const MOUSE_LEFTRIGHT_SPEED = .2;
const MOUSE_UPDOWN_SPEED = 10;

const KEY_FORWARD_SPEED = 3;
const KEY_PITCH_SPEED = 5;
const KEY_LEFTRIGHT_SPEED = .05;
const KEY_UPDOWN_SPEED = 2;

/*******************************************************************************
 * Variables
 ******************************************************************************/

// Viewer information ----------------------------------------------------------

const camera = {
    x:        512, // x position on the map
    y:        800, // y position on the map
    height:    78, // height of the camera
    angle:      0, // direction of the camera
    horizon:  HORIZON_HORIZONTAL, // horizon position (look up and down)
    distance: 800, // draw distance of map
    speed:   0.03  // camera movement speed 
};

// Landscape data --------------------------------------------------------------

const map = {
    width:    1024,
    height:   1024,
    shift:    10,  // power of two: 2^10 = 1024
    altitude: new Uint8Array(1024*1024), // 1024 * 1024 byte array with height information
    color:    new Uint32Array(1024*1024) // 1024 * 1024 int array with RGB colors
};

// Screen data -----------------------------------------------------------------

const screenData = {
    imagedata: INIT_IMAGE_DATA,
    buf8:      new Uint8Array(INIT_BUFF_ARR), // the same array but with bytes
    buf32:     new Uint32Array(INIT_BUFF_ARR), // the same array but with 32-Bit words
    backgroundcolor: hexColorToUInt32(BACKGROUND_COLOR),
};

// Rendering configuration -----------------------------------------------------

const settings = {
    resolution: 1,
    lodInv: 0.0015,
    fade: noFade,
}

// Generator configuration -----------------------------------------------------


const materials = {
    snow: hexColorToUInt32("#FFFFFF"),
    mountain: hexColorToUInt32("#5C5040"),
    grass: hexColorToUInt32("#54643C"),
    forest: hexColorToUInt32("#48582C"),
    gravel: hexColorToUInt32("#808480"),
    water: hexColorToUInt32("#2F637F"),
    waterDeep: hexColorToUInt32("#000000"),
}

const layers = [
    [255, hexColorToUInt32("#FF0000")], // range never reached!
    [250, materials.snow], 
    [150, materials.mountain],
    [135, materials.mountain],
    [130, materials.grass], 
    [120, materials.grass],
    [110, materials.forest],
    [100, materials.grass], 
    [80, materials.gravel],
    [60, materials.water], 
    [20, materials.water], 
    [0, materials.waterDeep],
]

// interpolate inbetween colours
let colors: number[] = [];
for(const [ i, color ] of layers) {
    colors[i] = color;
}
for(let l=0; l<layers.length - 1; l++) {
    const [iTop, colorTop] = layers[l];
    const [iBottom, colorBottom] = layers[l+1];
    const range = (iTop - iBottom);
    for(let i=iTop; i>iBottom; i--) {
        const ratio = (i - iBottom)/range;
        colors[i] = interpolate(colorTop, colorBottom, 1-ratio);
    }
}

// Log color palette
console.log(colors.map(_c => "%c ").join(""), ...colors.map(c => `background: ${uint32ToHexColor(c)};`));

const generator = {
    colors: colors,
    trees: {
        maxTreeAltitude: 140,
        minTreeAltitude: 100,
        treeDensity: 0.05,
    },
    iterations: 6,
}

// Input data ------------------------------------------------------------------

const input = {
    forwardBackward: 10, //10
    leftRight:       0.0005,//0.0005
    upDown:          0,
    pitch:           0,
    mouseposition:   null as null | [number, number],
}
let time = new Date().getTime();

// for fps display
let timelastframe = new Date().getTime();
let frameCount = 0;

/*******************************************************************************
 * Helper functions
 ******************************************************************************/

/* Randomize array in-place using Durstenfeld shuffle algorithm */
function shuffleArray(array: number[]) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

function uint32ToHexColor(hex: ABGR): string {
    const padded = `00000000${hex.toString(16)}`;
    const [ b2, b1, g2, g1, r2, r1] = padded.substring(padded.length - 6);
    return `#${r2}${r1}${g2}${g1}${b2}${b1}`;
}

function hexColorToUInt32(color: string): ABGR {
    const [_hash, r1,r2,g1,g2,b1,b2] = color;
    return parseInt(`0xFF${b1}${b2}${g1}${g2}${r1}${r2}`, 16);
}

function inverseExponential(maxX: number, zeroAt: number): (x: number) => number {
    const c = Math.sqrt(zeroAt * zeroAt / maxX);
    return (x: number) => {
        const e = x / c;
        return -(e*e) + maxX;
    }
}

/*******************************************************************************
 * Faders: return alpha (opacity) at distance from camera
 ******************************************************************************/

function noFade(_z: number): number { return 255 };
function linearFade (z: number): number { return 255 - 255 * z / camera.distance };
function linearDelayedFade (z: number): number { 
    const c = 255/0.25; // last 25% of the distance is faded
    return Math.min(255, c - c * z / camera.distance); 
}
let exponentialFade = inverseExponential(255, camera.distance);

/*******************************************************************************
 * Rendering functions
 ******************************************************************************/

function drawBackground(): void {
    const buf32 = screenData.buf32;
    const color = screenData.backgroundcolor;
    for (let i = 0; i < buf32.length; i++) {
        buf32[i] = color;
    }
}

/** Show the back buffer on screen */
function flip(): void {
    screenData.imagedata.data.set(screenData.buf8);
    CANVAS_CONTEXT.putImageData(screenData.imagedata, 0, 0);
}

/** The main render routine */
function render(): void {
    const mapWidthPeriod = map.width - 1;
    const mapHeightPeriod = map.height - 1;
    
    const screenWidth = CANVAS_ELEM.width;
    const scaleHeight = screenWidth / 2;
    
    const sinAngle = Math.sin(camera.angle);
    const cosAngle = Math.cos(camera.angle);
    
    const hiddenY = new Int32Array(screenWidth);
    for(let x=0; x < screenWidth; x++) {
        hiddenY[x] = CANVAS_ELEM.height;
    }

    const buf32 = screenData.buf32;
    const { fade, lodInv } = settings;

    // Draw from front to back
    for(let z=1, deltaZ=1; z<camera.distance; z+=deltaZ) {
        // 90 degree field of view
        let plx   =  -cosAngle * z - sinAngle * z;
        let ply   =   sinAngle * z - cosAngle * z;
        const prx =   cosAngle * z - sinAngle * z;
        const pry =  -sinAngle * z - cosAngle * z;
        
        const deltaX = (prx - plx) / screenWidth;
        const deltaY = (pry - ply) / screenWidth;
        plx += camera.x;
        ply += camera.y;

        const invZ = scaleHeight / z;
        const mask = fade(z) << 24 | 0x00FFFFFF; 
        
        for(let x=0; x < screenWidth; x++) {
            
            const mapOffset = ((ply & mapWidthPeriod) << map.shift) + (plx & mapHeightPeriod);
            const heightOnScreen = (camera.height - map.altitude[mapOffset]) * invZ + camera.horizon;

            const yTop = Math.max(heightOnScreen | 0, 0);
            const yBottom = hiddenY[x];

            // Draw vertical line
            if (yTop <= yBottom) {                
                // get offset on screen for the vertical line
                let offset = ((yTop * screenWidth) + x);
                for (let k = yTop; k < yBottom; k++) {
                    // Linear fade to background color using mask
                    buf32[offset] = mask & map.color[mapOffset];
                    offset = offset + screenWidth;
                }
            }

            if (heightOnScreen < yBottom) {
                hiddenY[x] = heightOnScreen;
            } 
            plx += deltaX;
            ply += deltaY;
        }
        // Reduce level of detail further from camera
        deltaZ += lodInv;
    }
}

/** Draws the next frame */
function draw(): void {
    updateCamera();
    drawBackground();
    render();
    flip();
    frameCount++;
    window.requestAnimationFrame(draw);
}

/** Update the camera for next frame. Dependent on keypresses */ 
function updateCamera(): void {
    const current = new Date().getTime();
    const delta = (current - time) * camera.speed;
    
    if (input.leftRight != 0) {
        camera.angle += input.leftRight * delta;
    }
    if (input.forwardBackward != 0) {
        camera.x -= input.forwardBackward * Math.sin(camera.angle) * delta;
        camera.y -= input.forwardBackward * Math.cos(camera.angle) * delta;
    }
    if (input.upDown != 0) {
        camera.height += input.upDown * delta;
    }
    if (input.pitch) {
        camera.horizon += input.pitch * delta;
    }
    
    // Collision detection. Don't fly below the surface.
    const mapoffset = ((Math.floor(camera.y) & (map.width-1)) << map.shift) + (Math.floor(camera.x) & (map.height-1));
    if ((map.altitude[mapoffset]+10) > camera.height) {
        camera.height = map.altitude[mapoffset] + 10;
    }
    
    time = current;
}

/*******************************************************************************
 * Event handlers
 ******************************************************************************/

function getMousePosition(e: MouseEvent | TouchEvent): [number, number] {

    function isTouchEvent(e: MouseEvent | TouchEvent): e is TouchEvent {
        return e.type.startsWith('touch');
    }

    // fix for Chrome
    if (isTouchEvent(e)) {
        return [e.targetTouches[0].pageX, e.targetTouches[0].pageY];
    } else {
        return [e.pageX, e.pageY];
    }
}

function onMouseDown(e: MouseEvent | TouchEvent): void {
    if("button" in e) {
        if(e.button !== 0) {
            return;
        }
    }
    input.forwardBackward = MOUSE_FORWARD_SPEED;
    input.mouseposition = getMousePosition(e);
}

function onMouseUp(): void {
    input.mouseposition = null;
    input.forwardBackward = 0;
    input.leftRight = 0;
    input.upDown = 0;
}

function onMouseMove(e: MouseEvent | TouchEvent): void {
    e.preventDefault();
    if (input.mouseposition == null) {
        return;
    }
    if (input.forwardBackward == 0) {
        return;
    }
    
    const currentMousePosition = getMousePosition(e);
    
    const deltaX = (input.mouseposition[0] - currentMousePosition[0]) / window.innerWidth;
    const deltaY = (input.mouseposition[1] - currentMousePosition[1]) / window.innerHeight;

    input.leftRight = deltaX * MOUSE_LEFTRIGHT_SPEED;
    camera.horizon  = HORIZON_HORIZONTAL + deltaY * MOUSE_PITCH_SPEED;
    input.upDown    = deltaY * MOUSE_UPDOWN_SPEED;
}

function onKeyDown(e: KeyboardEvent): boolean | void {    
    switch(e.key.toLocaleLowerCase()) {
        case "arrowleft":
        case "a":
            input.leftRight = KEY_LEFTRIGHT_SPEED;
            break;
        case "arrowright":
        case "d":
            input.leftRight = -KEY_LEFTRIGHT_SPEED;
            break;
        case "arrowup":
        case "w":
            input.forwardBackward = KEY_FORWARD_SPEED;
            break;
        case "arrowdown":
        case "s":
            input.forwardBackward = -KEY_FORWARD_SPEED;
            break;
        case "r":
            input.upDown = KEY_UPDOWN_SPEED;
            break;
        case "f":
            input.upDown = -KEY_UPDOWN_SPEED;
            break;
        case "e":
            input.pitch = KEY_PITCH_SPEED;
            break;
        case "q":
            input.pitch = -KEY_PITCH_SPEED;
            break;
        default:
            return;
    }
    
    return false;
}

function onKeyUp(e: KeyboardEvent): boolean | void {
    switch(e.key.toLocaleLowerCase()) {
        case "arrowleft":
        case "a":
            input.leftRight = 0;
            break;
        case "arrowright":
        case "d":
            input.leftRight = 0;
            break;
        case "arrowup":
        case "w":
            input.forwardBackward = 0;
            break;
        case "arrowdown":
        case "s":
            input.forwardBackward = 0;
            break;
        case "r":
            input.upDown = 0;
            break;
        case "f":
            input.upDown = 0;
            break;
        case "e":
            input.pitch = 0;
            break;
        case "q":
            input.pitch = 0;
            break;
        default:
            return;
    }
    return false;
}

function onResize(): void {
    CANVAS_ELEM.width = window.innerWidth * settings.resolution;
    CANVAS_ELEM.height = window.innerHeight * settings.resolution;

    screenData.imagedata = CANVAS_CONTEXT.createImageData(CANVAS_ELEM.width, CANVAS_ELEM.height);
    
    const bufarray   = new ArrayBuffer(screenData.imagedata.width * screenData.imagedata.height * 4);
    screenData.buf8  = new Uint8Array(bufarray);
    screenData.buf32 = new Uint32Array(bufarray);
}

/*******************************************************************************
 * Image loaders
 ******************************************************************************/

/** Downloads the png */
async function downloadImagesAsync(urls: string[]): Promise<ImageData[]> {
    return new Promise(function(resolve, _reject) {
        
        var pending = urls.length;
        var result: ImageData[] = [];
        if (pending === 0) {
            resolve([]);
            return;
        }
        for(const [i, url] of urls.entries()) {
            const image = new Image();
            image.onload = function() {
                const tempcanvas = document.createElement("canvas");
                const tempcontext = tempcanvas.getContext("2d")!;
                tempcanvas.width = map.width;
                tempcanvas.height = map.height;
                tempcontext.drawImage(image, 0, 0, map.width, map.height);
                result[i] = tempcontext.getImageData(0, 0, map.width, map.height);
                pending--;
                if (pending === 0) {
                    resolve(result);
                }
            };
            image.src = url;
        }
    });
}

async function loadMap(filenames: string): Promise<void> {
    const files = filenames.split(";");
    const result = await downloadImagesAsync([`maps/${files[0]}.png`, `maps/${files[1]}.png`]);
    onLoadedImages(result);
}

function onLoadedImages(result: ImageData[]): void {
    const color = result[0].data;
    const height = result[1].data;
    for(let i=0; i<map.width*map.height; i++) {
        // Combine the RGB values into single Hex
        map.color[i] = 0xFF000000 | (color[(i<<2) + 2] << 16) | (color[(i<<2) + 1] << 8) | color[(i<<2) + 0];
        map.altitude[i] = height[i<<2];
    }
    generateMap();
}

/*******************************************************************************
 * File handling
 ******************************************************************************/

async function upload(): Promise<void> {
    const input = document.getElementById("file") as HTMLInputElement;
    
    // X Y Z RRGGBB
    const voxels = (await input.files![0].text())
        .split("\r\n")
        .filter(voxel => voxel.trim().length > 0 && voxel[0] !== "#");

    // Calculate map dimensions
    let width = 0;
    let height = 0;
    for(const voxel of voxels) {
        const [xStr, yStr] = voxel.split(" ");
        const x = Number(xStr)|0;
        const y = Number(yStr)|0;
        width = Math.max(width, x);
        height = Math.max(height, y);
    }
    width++;
    height++;

    map.altitude = new Uint8Array(width * height);
    map.color = new Uint32Array(width * height);
    map.width = width;
    map.height = height;
    map.shift = Math.log(width)/Math.log(2);

    for(const voxel of voxels) {
        const [xStr, yStr, zStr, rrggbb] = voxel.split(" ");
        const x = Number(xStr)|0;
        const y = Number(yStr)|0;
        const z = Number(zStr);
        const i = width * x + y;

        if(z >= map.altitude[i]) {
            map.altitude[i] = z;
            map.color[i] = hexColorToUInt32("#"+rrggbb);
        }
    }
}

function download(): void {
    // Create goxel text file
    let data = "";
    const { width, height } = map;
    for(let x=0; x<width; x++) {
        for(let y=0; y<height; y++){
            const color = map.color[width * x + y].toString(16);
            const [_a1, _a2, b1, b2, g1, g2, r1, r2] = color;
            const altitude = map.altitude[width * x + y];
            data += `${x} ${y} ${altitude} ${r1}${r2}${g1}${g2}${b1}${b2}\r\n`;

            // Fill gaps between highest voxel and neighbours
            const lowestNeighbour = Math.min(...[
                map.altitude[width * x + y + 1] ?? -1,
                map.altitude[width * x + y - 1] ?? -1,
                map.altitude[width * (x+1) + y] ?? -1,
                map.altitude[width * (x-1) + y] ?? -1,
            ]);
            for(let z=altitude - 1; z >=0 && z > lowestNeighbour; z--) {
                data += `${x} ${y} ${z} ${r1}${r2}${g1}${g2}${b1}${b2}\r\n`;
            }
        }
    }
    // Download file
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(data));
    element.setAttribute('download', 'goxel.txt');
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
}

/*******************************************************************************
 * Rendering configuration
 ******************************************************************************/

function changeCameraDistance(distance: number): void {
    const exponentialFadeSelected = settings.fade === exponentialFade;

    camera.distance = distance
    exponentialFade = inverseExponential(255, camera.distance);

    if(exponentialFadeSelected) {
        settings.fade = exponentialFade;
    }
}

function changeFade(name: string): void {
    switch(name) {
        case "none": settings.fade = noFade; break;
        case "linear": settings.fade = linearFade; break;
        case "linear_delayed": settings.fade = linearDelayedFade; break;
        case "exponential": settings.fade = exponentialFade; break;
    }
}

function changeLOD(val: number) {
    // enforces number between 0.00666666 and 0
    settings.lodInv = 1 - (1490 +  Number(val)) / 1500;
}

function changeResolution(val: number) {
    settings.resolution = val;
    onResize();
}

// Bootstrapping ---------------------------------------------------------------

function init(): void {    
    loadMap("C1W;D1");
    onResize();
    
    // set event handlers for keyboard, mouse, touchscreen and window resize
    window.onkeydown = onKeyDown;
    window.onkeyup   = onKeyUp;
    window.onresize  = onResize;
    CANVAS_ELEM.onmousedown  = onMouseDown;
    CANVAS_ELEM.onmousemove  = onMouseMove;
    CANVAS_ELEM.onmouseup    = onMouseUp;
    CANVAS_ELEM.ontouchstart = onMouseDown;
    CANVAS_ELEM.ontouchmove  = onMouseMove;
    CANVAS_ELEM.ontouchend   = onMouseUp;
    CANVAS_ELEM.style.setProperty("background", BACKGROUND_COLOR);
    
    window.setInterval(function(){
        const current = new Date().getTime();
        document.getElementById('fps')!.innerText = (frameCount / (current-timelastframe) * 1000).toFixed(1) + " fps";
        frameCount = 0;
        timelastframe = current;
    }, 2000);
    draw();
}

init();

/**
 * Algorithm from https://gamedev.stackexchange.com/questions/23625/how-do-you-generate-tileable-perlin-noise
 */

// Indices
const is = [];
for(let i=0; i<256; i++) {
    is[i] = i;
}

// Random permutation of heights
let permInit = [...is];
shuffleArray(permInit);
let perm = [...permInit, ...permInit];

const dirs = [...is].map((_v, a) => [
    Math.cos(a * 2.0 * Math.PI / perm.length),
    Math.sin(a * 2.0 * Math.PI / perm.length)
]);

function noise(x: number, y: number, period: number): number {
    
    function surflet(gridX: number, gridY: number): number {
        const distX = Math.abs(x-gridX);
        const distY = Math.abs(y-gridY);
        const polyX = 1 - 6*distX**5 + 15*distX**4 - 10*distX**3;
        const polyY = 1 - 6*distY**5 + 15*distY**4 - 10*distY**3;
        const hashed = perm[perm[Math.floor(gridX)%period] + Math.floor(gridY)%period];
        if(dirs[hashed] === undefined) debugger;
        const grad = (x-gridX)*dirs[hashed][0] + (y-gridY)*dirs[hashed][1]
        return polyX * polyY * grad;
    }
    const intX = Math.floor(x);
    const intY = Math.floor(y);
    return (surflet(intX+0, intY+0) + surflet(intX+1, intY+0) +
            surflet(intX+0, intY+1) + surflet(intX+1, intY+1))
}

function fBm(x: number, y: number, period: number, octaves: number): number {
    let val = 0;
    for(let o=0; o<octaves; o++){
        val += 0.5**o * noise(x*2**o, y*2**o, period*2**o);
    }
    return val
}

function generateMap(): void {
    const width = 1024; 
    const height = 1024;

    map.altitude = new Uint8Array(width * height);
    map.color = new Uint32Array(width * height);
    map.width = width;
    map.height = height;
    map.shift = Math.log(width)/Math.log(2);

    // Reshuffle perm
    shuffleArray(permInit);
    perm = [...permInit, ...permInit];

    const freq = 1/map.width;
    for(let x=0; x<map.width; x++) {
        for(let y=0; y<map.height; y++) {
            const val = fBm(x*freq, y*freq, map.width*freq, generator.iterations);
            var z = (val + 0.5) * 256;
            const i = map.width * x + y;
            map.altitude[i] = z;
            map.color[i] = generator.colors[Math.floor(z)];
        }
    }

    generateTrees();
    generateShadow();    
}

function generateTrees(): void {
    const { maxTreeAltitude, minTreeAltitude, treeDensity } = generator.trees;
    
    const trees = [];
    // Decide where to plant
    for(let x=0; x<map.width; x++) {
        for(let y=0; y<map.height; y++) {
            const i = map.width * x + y;
            const z = map.altitude[i];
            
            // bell "curve" around middle of tree line
            const diff = Math.abs((maxTreeAltitude + minTreeAltitude)/2 - z) / ((maxTreeAltitude - minTreeAltitude)/2);

            const plantTree = Math.random() > diff && Math.random() < treeDensity;
            if(plantTree) {
                trees.push(i);
            }
        }
    }

    for(const tree of trees) {
        // Layer 0, top of tree
        map.color[tree] = hexColorToUInt32("#1E3D1E");
        map.altitude[tree] += 2;

        const colored: number[] = [];
        const layer1 = [ 
            tree, // tree top
            tree - 1, tree + 1, tree - map.width, tree + map.width // orthogonal
        ].map(n => (n + map.altitude.length) % map.altitude.length);

        // Layer 1, circle around top
        for(const i of layer1) {
            if(!colored.includes(i)) {
                map.color[i] = hexColorToUInt32("#1D3A1D");
                colored.push(i);
            }
            colored.push(i);
            map.altitude[i] += 4;
        }

        // Layer 2, second circle around top
        if(Math.random() > 0.7) {
            const layer2 = [ 
                tree, // tree top
                tree - 1, tree + 1, tree - map.width, tree + map.width, // orthogonal
                tree - 1 - map.width, tree + 1 - map.width, tree - 1 + map.width, tree + 1 + map.width, // diagonal
                tree - 2, tree + 2, tree - 2*map.width, tree + 2*map.width, // orthogonal + 1
            ].map(n => (n + map.altitude.length) % map.altitude.length);
    
            for(const i of layer2) {
                if(!colored.includes(i)) {
                    map.color[i] = hexColorToUInt32("#1D3A1D");
                    colored.push(i);
                }
                map.altitude[i] += 4;
            }
        }
    }
}

function generateShadow(): void {
    for(let x=0; x<map.width; x++) {
        for(let y=0; y<map.height; y++) {
            const i = map.width * x + y;
            let color = map.color[i];
            let z = map.altitude[i];
            
            color = map.altitude[(i - map.width+map.altitude.length) % map.altitude.length] > z ? interpolate(0xFF00F0000, color, 0.97) : color;
            color = map.altitude[(i-1+map.altitude.length) % map.altitude.length] > z ? interpolate(0xFF000000, color, 0.97) : color;
            map.color[i] = color;
        }
    }
}

function interpolate(x: ABGR, y: ABGR, ratio: number): number {
    const xR = (x & 0x000000FF);
    const yR = (y & 0x000000FF);
    const xG = (x & 0x0000FF00) >> 8;
    const yG = (y & 0x0000FF00) >> 8;
    const xB = (x & 0x00FF0000) >> 16;
    const yB = (y & 0x00FF0000) >> 16;
    
    const zR = Math.trunc((yR - xR) * ratio + xR);
    const zG = Math.trunc((yG - xG) * ratio + xG);
    const zB = Math.trunc((yB - xB) * ratio + xB);
    
    const res = (zB << 16) | (zG << 8) | zR;
    return res + 0xFF000000;
}