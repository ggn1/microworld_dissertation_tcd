/** This file shall contain common functions that multiple other 
 *  files may require. */

const linearInterpolator = require('linear-interpolator')

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

export function convertScale(scaleFrom, scaleTo, x) {
    /** 
     * Converts given number x from given "from" scale
     * to given "to" scale.
     * @param scaleFrom: The scale that x belongs [min, max].
     * @param scaleTo: The scale that y should belong to [min, max].
     * @return y: Given x in scale "scaleTo".
    */
    const y = (
        ((x - scaleFrom[0]) * (scaleTo[1] - scaleTo[0])) /
        (scaleFrom[1] - scaleFrom[0])
    ) + scaleFrom[0]
    return y
}

export function getAdjacentPositions(x, y) {
    /**
     * Given any position x and y on a grid, 
     * returns positions immediately adjacent 
     * to it (vertically, horizontally, diagonally.)
     * @param x: Row index of position on 2D grid.
     * @param y: Column index of position on 2D grid.
     * @return: Row and column indices of positions 
     *          immediately adjacent to the given position.
     */

    const adjacentPositions = [
        [x - 1, y - 1], // Top-left
        [x - 1, y],     // Top
        [x - 1, y + 1], // Top-right
        [x, y - 1],     // Left
        [x, y + 1],     // Right
        [x + 1, y - 1], // Bottom-left
        [x + 1, y],     // Bottom
        [x + 1, y + 1], // Bottom-right
    ]

    return adjacentPositions
}

export function createInterpolationFunction(xyPoints) {
    /** 
     * A function that returns a linear interpolator
     * that connects given points using a line.
     * @param xyPoints: Points to interpolate between.
     * @return: The interpolation function.
     */

    // Create the interpolation function.
    const interpolationFunction = linearInterpolator(xyPoints)

    // Define a new function that takes an x value 
    // and returns the interpolated y value.
    function interpolatedFunction(x) {
        return interpolationFunction(x)
    }

    return interpolatedFunction
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