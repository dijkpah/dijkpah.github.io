
const menuOptions = ["map", "files", "controls",  "settings"] as const;
let openedMenu = "map";

/*******************************************************************************
 * Menu 
 ******************************************************************************/

function openMenu(id: string): void {
    openedMenu = id;

    for(const option of menuOptions) {
        document.getElementById(option)?.classList.remove("selected");
        document.getElementById(`menu-${option}`)?.classList.remove("selected");
    }

    document.getElementById(id)?.classList.add("selected");
    document.getElementById(`menu-${id}`)?.classList.add("selected");
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
 * Rendering configuration
 ******************************************************************************/

function changeCameraDistance(distance: number): void {
    const exponentialFadeSelected = settings.fade === exponentialFade;

    settings.renderDistance = distance
    exponentialFade = inverseExponential(255, settings.renderDistance);

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
                const { width, height } = image;
                const tempcanvas = document.createElement("canvas");
                const tempcontext = tempcanvas.getContext("2d")!;
                tempcanvas.width = width;
                tempcanvas.height = height;
                tempcontext.drawImage(image, 0, 0, width, height);
                result[i] = tempcontext.getImageData(0, 0, width, height);
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

    if(files[0] === "generate") {
        switch(files[1]) {
            case "rainbow": generateMap(rainbow); break;
            case "landscape": generateMap(landscape); break;
        }
    } else {   
        const result = await downloadImagesAsync([`maps/${files[0]}.png`, `maps/${files[1]}.png`]);
        onLoadedImages(result);
    }
}

function onLoadedImages(result: ImageData[]): void {
    const { width, height } = result[0];
    map.width = width;
    map.height = height;
    map.shift = Math.log(width)/Math.log(2);
    const color = result[0].data;
    const altitude = result[1].data;
    for(let i=0; i<map.width*map.height; i++) {
        // Combine the RGB values into single Hex
        map.color[i] = 0xFF000000 | (color[(i<<2) + 2] << 16) | (color[(i<<2) + 1] << 8) | color[(i<<2) + 0];
        map.altitude[i] = altitude[i<<2];
    }
}

/*******************************************************************************
 * Goxel file handling
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
            map.color[i] = hexColorToABGR(`#${rrggbb}`);
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