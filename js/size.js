/**
 * Class
 * Size is used to define the size of an icon.
 */

 /**
 * \Internal 
 * @name Size
 * @type Constructor
 * @param width: number
 * @param height: number
 */

function Size(width, height) {
    this.width	= width;
	this.height	= height;

	/**
     * \Internal
	  * Returns true if 'size' is the same as the current Size and false otherwise
     *
     * @type Size
     * @name equals
     * @param sizeObj: obj: Size    
     * @return Boolean
     */

	this.equals = function(sizeObj) {
	    return (sizeObj.width == this.width && sizeObj.height == this.height);
	};
}
