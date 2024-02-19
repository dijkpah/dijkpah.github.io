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
    backgroundcolor: hexColorToUInt8(BACKGROUND_COLOR),
};

// Input data ------------------------------------------------------------------

const input = {
    forwardBackward: 0,
    leftRight:       0,
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

function hexColorToUInt8(color: string): number {
    const [_hash, r1,r2,g1,g2,b1,b2] = color;
    return parseInt(`0xFF${b1}${b2}${g1}${g2}${r1}${r2}`, 16);
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
    for(let x=0; x < screenWidth; x++) {
        hiddenY[x] = CANVAS_ELEM.height;
    }
    
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

        const invZ = 240 / z;
        const buf32 = screenData.buf32;
        
        for(let x=0; x < screenWidth; x++) {
            
            const mapOffset = ((Math.floor(ply) & mapWidthPeriod) << map.shift) + (Math.floor(plx) & mapHeightPeriod);
            const heightOnScreen = (camera.height - map.altitude[mapOffset]) * invZ + camera.horizon;

            const yTop = Math.max(heightOnScreen | 0, 0);
            const yBottom = hiddenY[x];

            // Draw vertical line
            if (yTop <= yBottom) {                
                // get offset on screen for the vertical line
                let offset = ((yTop * screenWidth) + x);
                for (let k = yTop; k < yBottom; k++) {
                    buf32[offset] = map.color[mapOffset];
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
        deltaZ *= 1.0025;
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
    switch(e.key) {
        case "ArrowLeft":
        case "a":
            input.leftRight = KEY_LEFTRIGHT_SPEED;
            break;
        case "ArrowRight":
        case "d":
            input.leftRight = -KEY_LEFTRIGHT_SPEED;
            break;
        case "ArrowUp":
        case "w":
            input.forwardBackward = KEY_FORWARD_SPEED;
            break;
        case "ArrowDown":
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
    // enforce max width of 800
    CANVAS_ELEM.width = window.innerWidth < 800 ? window.innerWidth : 800;
    
    // resize maintaining aspect ratio
    const aspect = window.innerWidth / window.innerHeight;
    CANVAS_ELEM.height = CANVAS_ELEM.width / aspect;

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
    draw();
}

init();