/*******************************************************************************
 * Rendering configuration
 ******************************************************************************/

type AltitudeToColor = [altitude, hexColor][];

type GeneratorConfig = {
    width: number,
    height: number,
    palette: ABGR[], // array of length 256
    trees: {
        maxTreeAltitude: number,
        minTreeAltitude: number,
        treeDensity: number,
    },
    iterations: number,
    background: hexColor,
}

/*******************************************************************************
 * Material and layer templates
 ******************************************************************************/

const materials: Record<string, hexColor> = {
    snow: "#FFFFFF",
    mountain: "#5C5040",
    forest: "#48582C",
    road: "#5C5040",
    grass: "#54643C",
    gravel: "#808480",
    water: "#2F637F",
    waterDeep: "#000000",   
}

const landscape: GeneratorConfig = {
    height: 1024,
    width: 1024,
    trees: {
        maxTreeAltitude: 140,
        minTreeAltitude: 100,
        treeDensity: 0.05,
    },
    iterations: 5,
    background: "#9090E0",

    palette: calculatePalette([
        [255, materials.snow],
        [250, materials.snow], 
        [150, materials.mountain],
        [135, materials.mountain],
        [130, materials.grass], 
        [120, materials.grass],
        [110, materials.forest],

        [106, materials.grass],
        [105, materials.road],
        [104, materials.grass],
        [100, materials.grass], 
        [80, materials.gravel],
        [60, materials.water], 
        [20, materials.water], 
        [0, materials.waterDeep],
    ]),
};

const rainbow: GeneratorConfig = {
    height: 2048,
    width: 2048,
    trees: {
        maxTreeAltitude: 0,
        minTreeAltitude: 0,
        treeDensity: 0
    },
    iterations: 7,
    background: "#FFFFFF",
    
    palette: calculatePalette([
        // Reds
        [255, "#FFFFFF"],
        
        [253, "#666666"], // Line
        [252, "#666666"], // Line

        [251, "#C29E9E"],
        [245, "#C29E9E"],
        [244, "#666666"], // Line
        [243, "#E2ABA6"],
        [237, "#E2ABA6"],
        [236, "#666666"], // Line
        [235, "#D7AAA4"],
        [229, "#D7AAA4"],
        [228, "#666666"], // Line
        [227, "#F5B79E"],
        [221, "#F5B79E"],
        [220, "#666666"], // Line
        [219, "#E7BB94"],
        [214, "#E7BB94"],

        [213, "#666666"], // Line
        [212, "#666666"], // Line
        
        // Yellows
        [211, "#FBE59A"],
        [205, "#FBE59A"],
        [204, "#666666"], // Line
        [203, "#E6D69A"],
        [197, "#E6D69A"],
        [196, "#666666"], // Line
        [195, "#C1C7A1"],
        [189, "#C1C7A1"],
        [188, "#666666"], // Line
        [187, "#BBC9A5"],
        [181, "#BBC9A5"],
        [180, "#666666"], // Line
        [179, "#A6C3A7"],
        [174, "#A6C3A7"],
        
        [173, "#666666"], // Line
        [172, "#666666"], // Line

        // Greens
        [171, "#9FC6A9"],
        [165, "#9FC6A9"],
        [164, "#666666"], // Line
        [163, "#9CC4A2"],
        [157, "#9CC4A2"],
        [156, "#666666"], // Line
        [155, "#A1C5A1"],
        [149, "#A1C5A1"],
        [148, "#666666"], // Line
        [147, "#ADD5A3"],
        [141, "#ADD5A3"],
        [140, "#666666"], // Line
        [139, "#CEEAB7"],
        [134, "#CEEAB7"],
        
        [133, "#666666"], // Line
        [132, "#666666"], // Line
        
        // Whites
        [131, "#D0EEB8"],
        [125, "#D0EEB8"],
        [124, "#666666"], // Line
        [123, "#D5F1BE"],
        [117, "#D5F1BE"],
        [116, "#666666"], // Line
        [115, "#DBF8CA"],
        [109, "#DBF8CA"],
        [108, "#666666"], // Line
        [107, "#DFF9D4"],
        [101, "#DFF9D4"],
        [100, "#666666"], // Line
        [99, "#F4FFFF"],
        [94, "#F4FFFF"],

        [93, "#666666"], // Line
        [92, "#666666"], // Line
        
        // Blues
        [91, "#C9FFFF"],
        [85, "#C9FFFF"],
        [84, "#666666"], // Line
        [83, "#9BFFFF"],
        [77, "#9BFFFF"],
        [76, "#666666"], // Line
        [75, "#99F0FA"],
        [69, "#99F0FA"],
        [68, "#666666"], // Line
        [67, "#A0EDFD"],
        [61, "#A0EDFD"],
        [60, "#666666"], // Line
        [59, "#A1E0FF"],
        [53, "#A1E0FF"],
        [52, "#666666"], // Line
        [51, "#A1E0FF"],
        [46, "#A1E0FF"],

        [45, "#666666"], // Line
        [44, "#666666"], // Line
        
        // Purples
        [43, "#96BAF6"],
        [37, "#96BAF6"],
        [36, "#666666"], // Line
        [35, "#96BAF6"],
        [29, "#96BAF6"],
        [28, "#666666"], // Line
        [27, "#9BB0EF"],
        [21, "#9BB0EF"],
        [20, "#666666"], // Line
        [19, "#9EACF7"],
        [13, "#9EACF7"],
        [12, "#666666"], // Line
        [11, "#A1A8F8"],
        [5, "#A1A8F8"],
        [4, "#666666"], // Line
        [3, "#A09FE1"],
        [0, "#A09FE1"],
    ])
};

/*******************************************************************************
 * Color functions
 ******************************************************************************/

function calculatePalette(mapping: AltitudeToColor): ABGR[] {
    // Convert to ABGR
    const layers = mapping.map(([altitude, hexColor]) => [altitude, hexColorToABGR(hexColor)]);

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
    console.log(colors.map(_c => "%c ").join(""), ...colors.map(c => `background: ${abgrToHexColor(c)};`));
    return colors;
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

/*******************************************************************************
 * Perlin noise algorithm
 ******************************************************************************/

/* Randomize array in-place using Durstenfeld shuffle algorithm */
function shuffleArray(array: number[]) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

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

// Perlin noise
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

// Fractional brownian motion
function fBm(x: number, y: number, period: number, octaves: number): number {
    let val = 0;
    for(let o=0; o<octaves; o++){
        val += 0.5**o * noise(x*2**o, y*2**o, period*2**o);
    }
    return val
}

/*******************************************************************************
 * Map generator functions
 ******************************************************************************/

function generateMap(config: GeneratorConfig): void {
    const { width, height, iterations, palette, background } = config;

    const mapData: MapData = { 
        altitudes: new Uint8Array(width * height), 
        colors: new Uint32Array(width * height),
        background, 
        dimension: width 
    };
    
    // Reshuffle perm
    shuffleArray(permInit);
    perm = [...permInit, ...permInit];

    const freq = 1/width;
    for(let x=0; x<width; x++) {
        for(let y=0; y<height; y++) {
            const val = fBm(x*freq, y*freq, width*freq, iterations);
            var z = (val + 0.5) * 256;
            const i = width * x + y;
            mapData.altitudes[i] = z;
            mapData.colors[i] = palette[Math.floor(z)];
        }
    }

    generateTrees(config, mapData);
    generateShadow(mapData);    
    setMap(mapData);
}

function generateTrees(config: GeneratorConfig, { altitudes, colors, dimension }: MapData): void {
    const { maxTreeAltitude, minTreeAltitude, treeDensity } = config.trees;
    
    const trees = [];
    // Decide where to plant
    for(let x=0; x<dimension; x++) {
        for(let y=0; y<dimension; y++) {
            const i = dimension * x + y;
            const z = altitudes[i];
            
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
        colors[tree] = hexColorToABGR("#1E3D1E");
        altitudes[tree] += 2;

        const colored: number[] = [];
        const layer1 = [ 
            tree, // tree top
            tree - 1, tree + 1, tree - dimension, tree + dimension // orthogonal
        ].map(n => (n + altitudes.length) % altitudes.length);

        // Layer 1, circle around top
        for(const i of layer1) {
            if(!colored.includes(i)) {
                colors[i] = hexColorToABGR("#1D3A1D");
                colored.push(i);
            }
            colored.push(i);
            altitudes[i] += 4;
        }

        // Layer 2, second circle around top
        if(Math.random() > 0.7) {
            const layer2 = [ 
                tree, // tree top
                tree - 1, tree + 1, tree - dimension, tree + dimension, // orthogonal
                tree - 1 - dimension, tree + 1 - dimension, tree - 1 + dimension, tree + 1 + dimension, // diagonal
                tree - 2, tree + 2, tree - 2*dimension, tree + 2*dimension, // orthogonal + 1
            ].map(n => (n + altitudes.length) % altitudes.length);
    
            for(const i of layer2) {
                if(!colored.includes(i)) {
                    colors[i] = hexColorToABGR("#1D3A1D");
                    colored.push(i);
                }
                altitudes[i] += 4;
            }
        }
    }
}

function generateShadow({ altitudes, colors, dimension }: MapData): void {
    for(let x=0; x<dimension; x++) {
        for(let y=0; y<dimension; y++) {
            const i = dimension * x + y;
            let color = colors[i];
            let z = altitudes[i];
            
            color = altitudes[(i - dimension+altitudes.length) % altitudes.length] > z ? interpolate(0xFF00F0000, color, 0.97) : color;
            color = altitudes[(i-1+altitudes.length) % altitudes.length] > z ? interpolate(0xFF000000, color, 0.97) : color;
            colors[i] = color;
        }
    }
}