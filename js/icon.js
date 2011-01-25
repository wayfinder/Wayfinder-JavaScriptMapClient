/**
 * Class
 */

/**
 * Creates a new Icon.</br>
 * <br>
 * <b>Parameters:</b></br>
 * IconOptions specifies the appearance of the icon. It is a generic object of type:</br>
 * <code>{image:String, width:Integer, height:Integer, anchorX:Integer, 
 * anchorY:Integer, spriteX:Integer, spriteY:Integer}</code> </br>
 * 
 * @type Constructor
 * @name Icon
 * @param params: IconOptions
 */

function Icon (params) {
    this.image            = "";                   // the url of the icon image
    this.size             = new Size(0,0);        // the icon width and height in pixels
    this.mapAnchor        = new Anchor(0, 0);     // the pixel coordinate relative to the top left corner of the icon image at which the icon is anchored to the map.
    this.spriteAnchor     = new Anchor(0, 0);     // the pixel coordinate of the icon image relative to the top left corner of the sprites image    
    this.imageMap         = [];                   // an array of integer coordinates representing the clickable part of the image
    this.infoWindowAnchor = new Anchor(-1000, 0); // the pixel coordinate relative to the top left corner of the icon image at which the info window is anchored to the icon.
       
    /**
	 * Redefines the icon's appearance.
     *
     * @type Icon
     * @name setIcon
     * @param icon: obj: IconOptions
     * @return None
     */
    this.setIcon = function (newIcon) {

        if (typeof newIcon != 'undefined') {
            if (typeof newIcon.image != 'undefined') {
                this.image = newIcon.image;
            }

            if (typeof newIcon.width != 'undefined' && typeof newIcon.height != 'undefined') {
                this.size.width = newIcon.width;
                this.size.height = newIcon.height;
            }

            if (typeof newIcon.anchorX != 'undefined' && typeof newIcon.anchorY != 'undefined') {
                this.mapAnchor.x = newIcon.anchorX;
                this.mapAnchor.y = newIcon.anchorY;
            }

            if (typeof newIcon.spriteX != 'undefined' && typeof newIcon.spriteY != 'undefined') {
                this.spriteAnchor.x = newIcon.spriteX;
                this.spriteAnchor.y = newIcon.spriteY;
            }
            
            if (typeof newIcon.infoWindowAnchorX != 'undefined') {
                this.infoWindowAnchor.x = newIcon.infoWindowAnchorX;
            }

            if (typeof newIcon.imageMap != 'undefined') {
                this.imageMap = newIcon.imageMap;
            }
        }
    };
    
    this.setIcon(params);

}