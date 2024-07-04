/** 
 * This file shall contain common functions that multiple other 
 * files may require.
*/

export function getRandomIntegerBetween(x, y) {
    /** Returns a random integer between integers 
     *  x and y inclusive. 
     *  @param x: Min integer.
     *  @param y: Max integer.
     *  @return: Random integer between x and y (inclusive).
     */
    return Math.floor(Math.random() * (y - x + 1)) + x;
}

export function volumeCylinder(height, radius) {
    /** Computes and returns the volume of a cylinder. */
    return Math.PI * (radius ** 2) * height
}

export function getAdjacentPositions(x, y, level2) {
    /**
     * Given any position x and y on a grid, 
     * returns positions immediately adjacent 
     * to it (vertically, horizontally, diagonally.)
     * @param x: Row index of position on 2D grid.
     * @param y: Column index of position on 2D grid.
     * @param level2: Whether to include positions immediately
     *                surrounding adjacent positions.
     * @return: Row and column indices of positions 
     *          immediately adjacent to the given position.
     */
    
    let adjacentPositions = [
        [x - 1, y - 1], // Top-left
        [x - 1, y],     // Top
        [x - 1, y + 1], // Top-right
        [x, y - 1],     // Left
        [x, y + 1],     // Right
        [x + 1, y - 1], // Bottom-left
        [x + 1, y],     // Bottom
        [x + 1, y + 1], // Bottom-right
    ]

    if (level2) {
        const extendedPositions = [
            // [x + 2, y],
            // [x - 2, y + 2],
            // [x, y + 2],
            [x + 2, y + 2],
            // [x - 2, y], 
            // [x + 2, y - 2], 
            // [x, y - 2], 
            [x - 2, y - 2],  
        ]
        adjacentPositions = adjacentPositions.concat(extendedPositions)
    }

    return adjacentPositions
}

export function shuffle(array) { 
    /** 
     * Shuffles given array using the Fisher-Yates Sorting Algorithm. 
     * Reference: https://dev.to/codebubb/how-to-shuffle-an-array-in-javascript-2ikj
     */
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array
}

export function roundToNDecimalPlaces(value, decimals) {
    /** 
     * Rounds a number to given no. of decimal places.
     * @param value: Value to round.
     * @param decimals: The no. of decimal places to round to.
     */
    if (isNaN(value) || isNaN(decimals)) {
        throw new Error('Both value and decimals must be numbers.');
    }
    const factor = Math.pow(10, decimals);
    return Math.round(value * factor) / factor;
}

export function computeCarbonInWoodWeight (weight) {
    /** 
     * Computes amount of carbon in given amount of
     * wood in grams.
     * @param weight: Weight of wood in grams.
     * @return: Weight of carbon in grams.
     */
    const dryPc = JSON.parse(process.env.NEXT_PUBLIC_WOOD_DRY_WEIGHT_PC) // g
    const weightDry = weight * dryPc
    const carbonPc = JSON.parse(process.env.NEXT_PUBLIC_C_PC_TREE)
    return carbonPc * weightDry
}

// Chat GPT 4.0
export function randomNormalSample(mean, stdDev) {
    /**
     * Generates a random sample from a normal distribution with 
     * the given mean and standard deviation.
     * @param mean: The mean of the normal distribution.
     * @param stdDev: The standard deviation of the normal distribution.
     * @return: A random sample from the specified normal distribution.
     */

    // Generate two uniformly distributed random numbers between 0 and 1.
    let u1 = Math.random()
    let u2 = Math.random()
    
    // Apply the Box-Muller transform to get two standard 
    // normal distributed random numbers.
    let z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2)

    // Scale and shift the result to match the specified 
    // mean and standard deviation.
    return z0 * stdDev + mean
}

// Reference: https://stackoverflow.com/questions/9461621/format-a-number-as-2-5k-if-a-thousand-or-more-otherwise-900
export function nFormatter(num, digits) {
    /**
     * Returns formatted string representation of 
     * numbers (with K or M to indicate 1000 or million)
     * so that numbers are easier to read.
     * @param num: Number as string.
     * @param digits: No. of decimal places.
     * @return: Easier to read string format.
     */
    const lookup = [
        { value: 1, symbol: "" },
        { value: 1e3, symbol: "k" },
        { value: 1e6, symbol: "M" },
        // { value: 1e9, symbol: "G" },
        // { value: 1e12, symbol: "T" },
        // { value: 1e15, symbol: "P" },
        // { value: 1e18, symbol: "E" }
    ]
    const regexp = /\.0+$|(?<=\.[0-9]*[1-9])0+$/
    const item = lookup.findLast(item => num >= item.value)
    return item ? (num / item.value).toFixed(digits).replace(regexp, "").concat(
        item.symbol
    ) : "0"
}

// Chat GPT 4.0
export function reverseNFormatter(formattedStr) {
    /**
     * Converts formatted string representation of 
     * numbers (with K or M) back to the original number as a string.
     * @param formattedStr: Formatted string representation of the number.
     * @return: Original number as a string.
     */
    const lookup = {
        "K": 1e3,
        "M": 1e6,
        // "G": 1e9,
        // "T": 1e12,
        // "P": 1e15,
        // "E": 1e18
    };

    const regex = /^(\d+(\.\d+)?)([KM]?)$/;
    const match = formattedStr.match(regex);

    if (!match) {
        throw new Error("Invalid formatted number string");
    }

    const number = parseFloat(match[1]);
    const symbol = match[3];

    if (symbol) {
        return (number * lookup[symbol]).toString();
    }

    return number.toString();
}

export function co2massFromCmass (cMassBig) {
    /** 
     * Given mass of carbon, returns that of CO2
     * assuming all carbon is found in the form of
     * CO2. 
     * @param cMassBig: Mass of carbon as a Big object.
     * @return co2Mass: Mass of CO2 as a Big object.
     */
    const molarMassCO2 = 44.01
    const molarMassC = 12.01
    return cMassBig.mul(molarMassCO2/molarMassC)
}