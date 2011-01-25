/**
 * Class
 * Anchor is used to establish an image anchor.
 */

 /**
 * The x and y attributes define the offset from the top left corner of the image
 * @name Anchor
 * @type Constructor
 * @param x: number
 * @param y: number
 */

function Anchor(x, y) {
    this.x = x;
	this.y = y;

	/**
	 * Returns true if anchor is the same as the current anchor object and false otherwise
     *
     * @type Anchor
     * @name equals
     * @param anchor: obj: Anchor
     * @return Boolean
     */
	
	this.equals = function(anchor) {
		return (anchor.x == this.x && anchor.y == this.y);
	};
}