/*******************************************************************************
 * Menu 
 ******************************************************************************/

const menuOptions = ["map", "files", "controls",  "settings"] as const;
let openedMenu = "map";

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
 * Loading spinner
 ******************************************************************************/

async function showSpinner(): Promise<void> {
    const spinnerElem = document.getElementById("spinner");
    spinnerElem?.classList.add("visible");
    // Give browser time to render spinner before continuing
    await new Promise((resolve) => setTimeout(resolve, 50));
}

function hideSpinner(): void {
    const spinnerElem = document.getElementById("spinner");
    spinnerElem?.classList.remove("visible");
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

function changeMapShape(val: number): void {
    _map.shape = val;
}

function changeFade(name: string): void {
    switch(name) {
        case "none": settings.fade = noFade; break;
        case "linear": settings.fade = linearFade; break;
        case "linear_delayed": settings.fade = linearDelayedFade; break;
        case "exponential": settings.fade = exponentialFade; break;
    }
}

function changeBackground(name: string): void {
    switch(name) {
        case "monochrome": settings.background = monochromeBackground; break;
        case "sun_line": settings.background = sunLineBackground; break;
        case "sun_point": settings.background = sunPointBackground; break;
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
 * Map selection
 ******************************************************************************/

async function loadMap(filenames: string): Promise<void> {
    const files = filenames.split(";");
    const [ type, name ] = files;
    
    await showSpinner();

    try {
        if(type === "generate") {
            switch(name) {
                case "rainbow": generateRainbow(); break;
                case "halo": generateHalo(); break;
                case "landscape": generateLandscape(); break;
            }
        } else if(type === "map") {
            const [colorData, heightData] = await loadImagesAsync([`maps/${name}_color.png`, `maps/${name}_height.png`]);
            const map = imagesToMapData(colorData, heightData, name);
            if(name === "retrowave") {
                map.sun = "#000000";
                map.background = "#F5386E";
                settings.background = sunLineBackground;
                setMap(map, { x: 400, angle: -2*Math.PI, height: 100, horizon: HORIZON_HORIZONTAL });
            } else if(name === "clouds") {
                map.sun = "#427296";
                map.background = "#FFFFFF";
                settings.background = sunLineBackground;
                setMap(map);
            } else if(name === "morrowind_large_cartoon") {
                for(let i=0; i<map.dimension*map.dimension; i++) {
                    const z = heightData.data[i<<2];
                    
                    // Fade to sea colour
                    if(z <= 18) {
                        map.colors[i] = interpolate(map.colors[i], hexColorToABGR("#181417"), 0.5 + (0.5 - z/36));
                    }

                    // Fake waves
                    if(z === 17 || z === 15) {
                        map.colors[i] = interpolate(map.colors[i], 0xFFFFFFFF, 0.03);
                    }
                    if(z === 16) {
                        map.colors[i] = interpolate(map.colors[i], 0xFFFFFFFF, 0.075);
                    }
                }
                setMap(map, { x: 1500, y: 4000, angle: -0.5, height: 320, horizon: 60 });
            } else {
                setMap(map);
            }
        } else if(type === "model") {
            const [colorData, heightData] = await loadImagesAsync([`models/${name}_color.png`, `models/${name}_height.png`]);
            const map = imagesToMapData(colorData, heightData, name);
            setMap(map);
        }
    } finally {
        hideSpinner();
    }
}

/*******************************************************************************
 * Image loaders
 ******************************************************************************/

/** Downloads the png */
async function loadImagesAsync(urls: string[]): Promise<ImageData[]> {
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

function imagesToMapData(colorData: ImageData, heightData: ImageData, name: string): MapData {
    const { width, height } = colorData;
    const colorImage = colorData.data;
    const altitudeImage = heightData.data;

    const mapData: MapData = {
        name,
        altitudes: new Uint8Array(width * height), 
        colors: new Uint32Array(width * height),
        background: DEFAULT_BACKGROUND_COLOR, 
        sun: DEFAULT_SUN_COLOR,
        dimension: width,
        shape: Shape.Flat,
    };

    for(let i=0; i<width*height; i++) {
        // Combine the RGB values into single Hex
        mapData.colors[i] = (colorImage[(i<<2) + 3] << 24) | (colorImage[(i<<2) + 2] << 16) | (colorImage[(i<<2) + 1] << 8) | colorImage[(i<<2) + 0];
        mapData.altitudes[i] = altitudeImage[i<<2];
    }
    return mapData; 
}

async function uploadImage(): Promise<void> {
    const colorFile = (document.getElementById("colorFile") as HTMLInputElement).files![0];
    const heightFile = (document.getElementById("heightFile") as HTMLInputElement).files![0]

    if(colorFile && heightFile) {
        const [ colorData, heightData ] = await loadImagesAsync([URL.createObjectURL(colorFile), URL.createObjectURL(heightFile)]) ;
        const mapData = imagesToMapData(colorData, heightData, colorFile.name.split(".")[0]);
        setMap(mapData);
    }
}

function downloadImages(): void {
    const { dimension, colors, altitudes, name } = getMap();

    var tmpCanvas = document.createElement('canvas');
    var tmpCtx = tmpCanvas.getContext('2d');
    tmpCanvas.width = dimension;
    tmpCanvas.height = dimension;
    let imgData = new ImageData(dimension, dimension);

    // Create color map image
    imgData.data.set(new Uint8ClampedArray(colors.buffer));
    tmpCtx?.putImageData(imgData, 0, 0);
    const colorMap = tmpCanvas.toDataURL("image/png")

    // Create height map image
    const buff = new ArrayBuffer(dimension * dimension * 4);
    const buf8 = new Uint8ClampedArray(buff);

    for(let i=0; i<dimension*dimension; i++) {
        const j = i<<2;
        buf8[j] = altitudes[i]; //R
        buf8[j+1] = altitudes[i]; //G
        buf8[j+2] = altitudes[i]; //B
        buf8[j+3] = 255; //A
    }
    imgData.data.set(buf8);
    tmpCtx?.putImageData(imgData, 0, 0);
    const heightMap = tmpCanvas.toDataURL("image/png");

    // Download maps
    for(const [fileName, map] of [ [`${name}_color`, colorMap], [`${name}_height`, heightMap]]) {
        const element = document.createElement('a');
        element.setAttribute('href', map);
        element.setAttribute('download', `${fileName}.png`);
        element.style.display = 'none';
        document.body.appendChild(element);
        element.click();
        document.body.removeChild(element);
    }
}

/*******************************************************************************
 * Goxel file handling
 ******************************************************************************/

async function uploadGoxel(file: File): Promise<void> {

    // X Y Z RRGGBB
    const voxels = (await file.text())
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

    // Dimension is first power of two equal or greater than both height and width
    let dimension = 1;
    while(dimension < width && dimension < height) {
        dimension *=2;
    }
    
    const mapData: MapData = { 
        name: file.name.split(".")[0],
        altitudes: new Uint8Array(dimension * dimension), 
        colors: new Uint32Array(dimension * dimension),
        background: DEFAULT_BACKGROUND_COLOR, 
        sun: DEFAULT_SUN_COLOR,
        dimension,
        shape: Shape.Flat,
    };

    // Read color and altitude (z-index)
    for(const voxel of voxels) {
        const [xStr, yStr, zStr, rrggbb] = voxel.split(" ");
        const x = Number(xStr)|0;
        const y = Number(yStr)|0;
        const z = Number(zStr);
        const i = dimension * x + y;

        if(z >= mapData.altitudes[i]) {
            mapData.altitudes[i] = z;
            mapData.colors[i] = hexColorToABGR(`#${rrggbb}`);
        }
    }
    setMap(mapData); 
}

function downloadGoxel(): void {
    // Create goxel text file
    let data = "";
    const { dimension, colors, altitudes } = getMap();
    for(let x=0; x<dimension; x++) {
        for(let y=0; y<dimension; y++){
            const color = colors[dimension * x + y].toString(16);
            const [_a1, _a2, b1, b2, g1, g2, r1, r2] = color;
            const altitude = altitudes[dimension * x + y];
            data += `${x} ${y} ${altitude} ${r1}${r2}${g1}${g2}${b1}${b2}\r\n`;

            // Fill gaps between highest voxel and neighbours
            const lowestNeighbour = Math.min(...[
                altitudes[dimension * x + y + 1] ?? -1,
                altitudes[dimension * x + y - 1] ?? -1,
                altitudes[dimension * (x+1) + y] ?? -1,
                altitudes[dimension * (x-1) + y] ?? -1,
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
