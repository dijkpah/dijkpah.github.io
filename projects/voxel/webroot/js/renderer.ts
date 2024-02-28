/*******************************************************************************
 * Types
 ******************************************************************************/

type hexColor = `#${string}`;
type altitude = number; // between 0 - 255
type ABGR = number; // UInt32 RGBA with reverse byte order
const enum Shape {
    Concave = -0.5,
    Flat = 0,
    Convex = 0.5,
}
type MapData = {
    name: string,
    altitudes: Uint8Array,
    colors: Uint32Array,
    background: hexColor,
    sun: hexColor,
    dimension: number,
    shape: number,
};

/*******************************************************************************
 * Constants
 ******************************************************************************/

const CANVAS_ELEM = document.getElementById('canvas')! as HTMLCanvasElement
const CANVAS_CONTEXT = CANVAS_ELEM.getContext('2d')!;

const INIT_IMAGE_DATA = CANVAS_CONTEXT.createImageData(CANVAS_ELEM.width, CANVAS_ELEM.height);
const INIT_BUFF_ARR = new ArrayBuffer(INIT_IMAGE_DATA.width * INIT_IMAGE_DATA.height * 4);

const DEFAULT_BACKGROUND_COLOR: hexColor = "#9090E0";
const DEFAULT_SUN_COLOR: hexColor = "#FFFFFF";

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
 * Map
 ******************************************************************************/

let _map = {
    name: "",
    width: 1024,
    height: 1024,
    shift: 10,  // power of two: 2^10 = 1024
    altitudes: new Uint8Array( 1024*1024), // 1024 * 1024 byte array with height information
    colors:    new Uint32Array(1024*1024), // 1024 * 1024 int array with RGB colors
    backgroundColor: hexColorToABGR(DEFAULT_BACKGROUND_COLOR),
    sunColor: hexColorToABGR(DEFAULT_SUN_COLOR),
    shape: Shape.Flat,
};

function setMap({ altitudes, colors, background, sun, dimension, name }: MapData): void {
    if(dimension !== Math.sqrt(altitudes.length)) {
        throw new Error("Only square maps are supported");
    }

    CANVAS_ELEM.style.setProperty("background", background);
    _map = {
        name,
        altitudes,
        colors,
        shape,
        backgroundColor: hexColorToABGR(background),
        sunColor: hexColorToABGR(sun),
        height: dimension,
        width: dimension,
        shift: Math.log(dimension)/Math.log(2),
    }
}

function getMap(): Readonly<MapData> {
    return {
        name: _map.name,
        altitudes: _map.altitudes,
        colors: _map.colors,
        dimension: _map.width,
        background: abgrToHexColor(_map.backgroundColor),
        sun: abgrToHexColor(_map.sunColor),
        shape: _map.shape,
    };
}
/*******************************************************************************
 * Variables
 ******************************************************************************/

// Viewer information ----------------------------------------------------------

const camera = {
    x:        -7024, // x position on the map
    y:        -14835, // y position on the map
    angle:      0, // direction of the camera
    height:    400, // height of the camera
    horizon:   60, // horizon position (look up and down), number of pixels on canvas from top of screen
    speed:   0.03, // camera movement speed 
};

// Screen data -----------------------------------------------------------------

const screenData = {
    imagedata: INIT_IMAGE_DATA,
    buf8:      new Uint8Array(INIT_BUFF_ARR), // the same array but with bytes
    buf32:     new Uint32Array(INIT_BUFF_ARR), // the same array but with 32-Bit words
};

// Rendering configuration -----------------------------------------------------

const settings = {
    resolution: 0.5,
    lodInv: 0.0015,
    fade: linearDelayedFade,
    renderDistance: 3000,
    background: sunPointBackground
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

function abgrToHexColor(hex: ABGR): hexColor {
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
 * Backgrounds 
 ******************************************************************************/

function monochromeBackground(): void {
    const buf32 = screenData.buf32;
    const color = _map.backgroundColor;
    for (let i = 0; i < buf32.length; i++) {
        buf32[i] = color;
    }
}

function sunLineBackground(): void {
    const buf32 = screenData.buf32;
    const { backgroundColor, sunColor } = _map;
    const { width } = screenData.imagedata;

    // sin(a) has shape of sin(x), convert to shape of, cos(x) and map to 0-1
    const horizontalFactor = (Math.cos(-camera.angle)/2 + 0.5);
    const horizon = Math.floor(camera.horizon);

    for (let i = width * horizon; i < buf32.length; i++) {
        buf32[i] = backgroundColor;
    }
    for(let y=0; y <= horizon; y++) {
        // screen fade between top and horizon
        const fadeColor = interpolate(backgroundColor, sunColor, horizontalFactor * (1 -(y/horizon)));
        for(let x=0; x< width; x++) {
            const i = (x + y* width);
            buf32[i] = fadeColor;
        }
    }
}

function sunPointBackground(): void {
    const buf32 = screenData.buf32;
    const { backgroundColor, sunColor } = _map;
    const { width } = screenData.imagedata;

    
    const horizon = Math.floor(camera.horizon);
    const deg45 = Math.PI / 4;
    const deg90 = 2*deg45;

    for (let i = width * horizon; i < buf32.length; i++) {
        buf32[i] = backgroundColor;
    }
    for(let x=0; x< width; x++) {
        const horizontalFactor = (Math.cos(-camera.angle - deg45 + deg90*x/width)/2 + 0.5)**5
        for(let y=0; y < horizon; y++) {
            // screen fade between top and horizon
            const verticalFactor = 1-(y/horizon);
            const fadeColor = interpolate(backgroundColor, sunColor, horizontalFactor * verticalFactor);
            const i = (x + y* width);
            buf32[i] = fadeColor;
        }
    }
}
/*******************************************************************************
 * Rendering functions
 ******************************************************************************/

const drawBackground = sunLineBackground;

/** Show the back buffer on screen */
function flip(): void {
    screenData.imagedata.data.set(screenData.buf8);
    CANVAS_CONTEXT.putImageData(screenData.imagedata, 0, 0);
}

/** The main render routine */
function render(): void {
    const mapWidthPeriod = _map.width - 1;
    const mapHeightPeriod = _map.height - 1;
    
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
        const roll = _map.shape * z;
        
        for(let x=0; x < screenWidth; x++) {
            
            const mapOffset = ((ply & mapWidthPeriod) << _map.shift) + (plx & mapHeightPeriod);
            const heightOnScreen = (camera.height - _map.altitudes[mapOffset]) * invZ + roll + camera.horizon; // + 0.3*z for roll

            const yTop = Math.max(heightOnScreen | 0, 0);
            const yBottom = hiddenY[x];

            // Draw vertical line
            if (yTop <= yBottom) {                
                // get offset on screen for the vertical line
                let offset = ((yTop * screenWidth) + x);
                for (let k = yTop; k < yBottom; k++) {
                    // Linear fade to background color using mask
                    buf32[offset] = mask & _map.colors[mapOffset];
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
    settings.background();
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
        camera.x = (camera.x + _map.width - input.forwardBackward * Math.sin(camera.angle) * delta) % _map.width;
        camera.y = (camera.y + _map.height - input.forwardBackward * Math.cos(camera.angle) * delta) % _map.height;
    }
    if (input.upDown != 0) {
        camera.height += input.upDown * delta;
    }
    if (input.pitch) {
        camera.horizon += input.pitch * delta;
    }
    
    // Collision detection. Don't fly below the surface.
    const mapoffset = ((Math.floor(camera.y) & (_map.width-1)) << _map.shift) + (Math.floor(camera.x) & (_map.height-1));
    if ((_map.altitudes[mapoffset]+10) > camera.height) {
        camera.height = _map.altitudes[mapoffset] + 10;
    }
    
    time = current;
}