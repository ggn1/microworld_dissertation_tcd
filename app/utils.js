/** This file shall contain common functions that multiple other 
 *  files may require. */

export function getRandomIntegerBetween(x, y) {
    /** Returns a random integer between integers 
     *  x and y inclusive. 
     *  @param x: Min integer.
     *  @param y: Max integer.
     *  @return: Random integer between x and y (inclusive).
     */
    return Math.floor(Math.random() * (y - x + 1)) + x;
}