"use strict";

/*******************************************************************************
 * Constants
 ******************************************************************************/

const CANVAS_ELEM = document.getElementById('fullscreenCanvas')! as HTMLCanvasElement
const CANVAS_CONTEXT = CANVAS_ELEM.getContext('2d')!;

const INIT_IMAGE_DATA = CANVAS_CONTEXT.createImageData(CANVAS_ELEM.width, CANVAS_ELEM.height);
const INIT_BUFF_ARR = new ArrayBuffer(INIT_IMAGE_DATA.width * INIT_IMAGE_DATA.height * 4);

const BACKGROUND_COLOR = "#9090E0";

/*******************************************************************************
 * Variables
 ******************************************************************************/

// Viewer information ----------------------------------------------------------

const camera = {
    x:        512, // x position on the map
    y:        800, // y position on the map
    height:    78, // height of the camera
    angle:      0, // direction of the camera
    horizon:  100, // horizon position (look up and down)
    distance: 800, // distance of map
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
    backgroundcolor: hexColorToUInt8(BACKGROUND_COLOR),
};

// Input data ------------------------------------------------------------------

const input = {
    forwardBackward: 0,
    leftRight:       0,
    upDown:          0,
    lookup:          false,
    lookdown:        false,
    mouseposition:   null as null | [number, number],
    keyPressed:      false
}
let drawingFrame = false;
let time = new Date().getTime();

// for fps display
let timelastframe = new Date().getTime();
let frameCount = 0;

/*******************************************************************************
 * Helper functions
 ******************************************************************************/

function hexColorToUInt8(color: string): number {
    const r = color.substring(1,3);
    const g = color.substring(3,5);
    const b = color.substring(5,7);
    return parseInt(`0xFF${b}${g}${r}`, 16);
}

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
    const sinAngle = Math.sin(camera.angle);
    const cosAngle = Math.cos(camera.angle);
    
    const hiddenY = new Int32Array(screenWidth);
    for(let x=0; x<CANVAS_ELEM.width; x++) {
        hiddenY[x] = CANVAS_ELEM.height;
    }
    
    // Draw from front to back
    for(let z=1, deltaZ=1; z<camera.distance; z+=deltaZ) {
        // 90 degree field of view
        let plx   =  -cosAngle * z - sinAngle * z;
        let ply   =   sinAngle * z - cosAngle * z;
        const prx =   cosAngle * z - sinAngle * z;
        const pry =  -sinAngle * z - cosAngle * z;
        
        const dx = (prx - plx) / screenWidth;
        const dy = (pry - ply) / screenWidth;
        plx += camera.x;
        ply += camera.y;

        const invz = 240 / z;
        const buf32 = screenData.buf32;
        
        for(let x=0; x < screenWidth; x++) {
            
            const mapOffset = ((Math.floor(ply) & mapWidthPeriod) << map.shift) + (Math.floor(plx) & mapHeightPeriod);
            const heightOnScreen = (camera.height - map.altitude[mapOffset]) * invz + camera.horizon;

            let ytop = heightOnScreen | 0;
            const ybottom = hiddenY[x];

            // Draw vertical line
            if (ytop <= ybottom) {
                if (ytop < 0) {
                    ytop = 0;
                }
                
                // get offset on screen for the vertical line
                let offset = ((ytop * screenWidth) + x);
                for (let k = ytop; k < ybottom; k++) {
                    buf32[offset] =  map.color[mapOffset];
                    offset = offset + screenWidth;
                }
            }

            if (heightOnScreen < ybottom) {
                hiddenY[x] = heightOnScreen;
            } 
            plx += dx;
            ply += dy;
        }
        deltaZ += 0.005;
    }
}

/** Draws the next frame */
function draw(): void {
    drawingFrame = true;
    updateCamera();
    drawBackground();
    render();
    flip();
    frameCount++;
    
    // if (!input.keypressed) {
    //     drawingFrame = false;
    // } else {
    //     window.requestAnimationFrame(draw);
    // }
    window.requestAnimationFrame(draw);
}

/** Update the camera for next frame. Dependent on keypresses */ 
function updateCamera(): void {
    const current = new Date().getTime();
    const delta = (current - time) * camera.speed;
    
    input.keyPressed = false;
    if (input.leftRight != 0) {
        camera.angle += input.leftRight * 0.1 * delta;
        input.keyPressed = true;
    }
    if (input.forwardBackward != 0) {
        camera.x -= input.forwardBackward * Math.sin(camera.angle) * delta;
        camera.y -= input.forwardBackward * Math.cos(camera.angle) * delta;
        input.keyPressed = true;
    }
    if (input.upDown != 0) {
        camera.height += input.upDown * delta;
        input.keyPressed = true;
    }
    if (input.lookup) {
        camera.horizon += 2 * delta;
        input.keyPressed = true;
    }
    if (input.lookdown) {
        camera.horizon -= 2 * delta;
        input.keyPressed = true;
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
    input.forwardBackward = 3;
    input.mouseposition = getMousePosition(e);
    time = new Date().getTime();
    
    if (!drawingFrame) {
        draw();
    }
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
    
    input.leftRight = (input.mouseposition[0] - currentMousePosition[0]) / window.innerWidth * 2;
    camera.horizon  = 100 + (input.mouseposition[1] - currentMousePosition[1]) / window.innerHeight * 500;
    input.upDown    = (input.mouseposition[1] - currentMousePosition[1]) / window.innerHeight * 10;
}

function onKeyDown(e: KeyboardEvent): boolean | void {    
    switch(e.key) {
        case "ArrowLeft":
        case "a":
            input.leftRight = +1.;
            break;
        case "ArrowRight":
        case "d":
            input.leftRight = -1.;
            break;
        case "ArrowUp":
        case "w":
            input.forwardBackward = 3.;
            break;
        case "ArrowDown":
        case "s":
            input.forwardBackward = -3.;
            break;
        case "r":
            input.upDown = +2.;
            break;
        case "f":
            input.upDown = -2.;
            break;
        case "e":
            input.lookup = true;
            break;
        case "q":
            input.lookdown = true;
            break;
        default:
            return;
    }
    
    if (!drawingFrame) {
        time = new Date().getTime();
        draw();
    }
    return false;
}

function onKeyUp(e: KeyboardEvent): boolean | void {
    switch(e.key) {
        case "ArrowLeft":
        case "a":
            input.leftRight = 0;
            break;
        case "ArrowRight":
        case "d":
            input.leftRight = 0;
            break;
        case "ArrowUp":
        case "w":
            input.forwardBackward = 0;
            break;
        case "ArrowDown":
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
            input.lookup = false;
            break;
        case "q":
            input.lookdown = false;
            break;
        default:
            return;
    }
    return false;
}

function onResize(): void {    
    // enforce max width of 800
    CANVAS_ELEM.width = window.innerWidth < 800 ? window.innerWidth : 800;
    
    // resize maintaining aspect ratio
    const aspect = window.innerWidth / window.innerHeight;
    CANVAS_ELEM.height = CANVAS_ELEM.width / aspect;

    screenData.imagedata = CANVAS_CONTEXT.createImageData(CANVAS_ELEM.width, CANVAS_ELEM.height);
    
    const bufarray   = new ArrayBuffer(screenData.imagedata.width * screenData.imagedata.height * 4);
    screenData.buf8  = new Uint8Array(bufarray);
    screenData.buf32 = new Uint32Array(bufarray);
    draw();
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
    draw();
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
    
    window.setInterval(function(){
        const current = new Date().getTime();
        document.getElementById('fps')!.innerText = (frameCount / (current-timelastframe) * 1000).toFixed(1) + " fps";
        frameCount = 0;
        timelastframe = current;
    }, 2000);
}

init();