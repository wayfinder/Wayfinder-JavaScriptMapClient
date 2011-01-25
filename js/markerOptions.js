/**
 * Class
 * An instance of the MarkerOptions class is used as the options argument for the constructor of the Marker class. 
 * 
 * @name MarkerOptions
 */

function MarkerOptions(params) {
    this.icon = new Icon();
    this.useSprites = true;
    this.id = Math.floor(Math.random() * Math.pow(10, 8));
    
    if (typeof params != 'undefined') {
        if (typeof params.useSprites != 'undefined') {
            this.useSprites = params.useSprites;
        }

        if (typeof params.icon != 'undefined') {
            this.icon = new Icon(params.icon);
        }
    }
    
}