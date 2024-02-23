/*******************************************************************************
 * Types
 ******************************************************************************/

type hexColor = `#${string}`;
type altitude = number; // between 0 - 255
type ABGR = number; // UInt32 RGBA with reverse byte order

/*******************************************************************************
 * Constants
 ******************************************************************************/

const CANVAS_ELEM = document.getElementById('canvas')! as HTMLCanvasElement
const CANVAS_CONTEXT = CANVAS_ELEM.getContext('2d')!;

const INIT_IMAGE_DATA = CANVAS_CONTEXT.createImageData(CANVAS_ELEM.width, CANVAS_ELEM.height);
const INIT_BUFF_ARR = new ArrayBuffer(INIT_IMAGE_DATA.width * INIT_IMAGE_DATA.height * 4);

const BACKGROUND_COLOR: hexColor = "#9090E0";

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
    x:        -7024, // x position on the map
    y:        -14835, // y position on the map
    angle:      0.9, // direction of the camera
    height:    378, // height of the camera
    horizon:   0, // horizon position (look up and down)
    speed:   0.03, // camera movement speed 
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
    backgroundcolor: hexColorToABGR(BACKGROUND_COLOR),
};

// Rendering configuration -----------------------------------------------------

const settings = {
    resolution: 0.5,
    lodInv: 0.0015,
    fade: linearDelayedFade,
    renderDistance: 3000,
}

// Input data ------------------------------------------------------------------

const input = {
    forwardBackward: 10,
    leftRight:       0.0005,
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

function abgrToHexColor(hex: ABGR): string {
    const padded = `00000000${hex.toString(16)}`;
    const [ b2, b1, g2, g1, r2, r1] = padded.substring(padded.length - 6);
    return `#${r2}${r1}${g2}${g1}${b2}${b1}`;
}

function hexColorToABGR(color: hexColor): ABGR {
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
function linearFade (z: number): number { return 255 - 255 * z / settings.renderDistance };
function linearDelayedFade (z: number): number { 
    const c = 255/0.25; // last 25% of the distance is faded
    return Math.min(255, c - c * z / settings.renderDistance); 
}
let exponentialFade = inverseExponential(255, settings.renderDistance);

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
    for(let z=1, deltaZ=1; z<settings.renderDistance; z+=deltaZ) {
        // 90 degree field of view
        let plx   =  -cosAngle * z - sinAngle * z;
        let ply   =   sinAngle * z - cosAngle * z;
        const prx =   cosAngle * z - sinAngle * z;
        const pry =  -sinAngle * z - cosAngle * z;
        
        const deltaX = (prx - plx) / screenWidth;
        const deltaY = (pry - ply) / screenWidth;
        plx += camera.x;
        ply += camera.y;

        const mask = fade(z) << 24 | 0x00FFFFFF; 
        const invZ = scaleHeight / z;
        
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
        camera.x = (camera.x + map.width - input.forwardBackward * Math.sin(camera.angle) * delta) % map.width;
        camera.y = (camera.y + map.height - input.forwardBackward * Math.cos(camera.angle) * delta) % map.height;
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