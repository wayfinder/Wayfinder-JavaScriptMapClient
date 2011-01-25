/**
 * Class
 * Circle is used to draw circles on the map. After being created, it should be added to the map via DrawManager. An example of its usage can be found under "Examples". <br/> 
 * <br>
 * <b>Events:</b><br/>
 * You can listen to all default DOM events on a Circle, for example: 'click', 'dblclick', 'mouseover', 'mouseout', etc.</code><br />
 */

 /**
 * <b>Parameters:</b></br>
 * <br>
 * CircleOptions specify the appearance of a circle. It is a generic object with the following properties: </br>
 * <br>
 * <li>center: GeoPoint (default: {0,0})</br></li>
 * <br>
 * <li>radius: number (default: 0) </br>
 * Sets the radius in kilometers. Currently there is a limit, 100km. </br></li>
 * <br>
 * <li>lineWidth: number (default: 1)</br></li>
 * <br>
 * <li>color: string (default: black)</br> 
 * It can either be a color's name(e.g. red), or in hexadecimal format(e.g. #FFFFFF).</br></li>
 * <br>
 * <li>opacity: number(0,1) (default: 1)</br></li>
 * <br>
 * <li>fillColor: string (default: none)</br> 
 * It can either be a color's name(e.g. red), or in hexadecimal format(e.g. #FFFFFF).</br></li>
 * <br>
 * <li>fillOpacity: number(0,1) (default: 1)</br></li>
 *
 * @name Circle
 * @type Constructor
 * @param params: CircleOptions
 */

function Circle(params) {
    this.center = new GeoPoint(0, 0);
    this.centerServer = new GeoPoint(0, 0);
    
    this.radius = 0;
    this.radiusPixels = 0;
    
    this.lineWidth = 1;
    this.color = "#000000";
    this.opacity = 1;
    
    this.fillOpacity = 1;
    this.fillColor = "";
    
    var circleId = Math.floor(Math.random() * Math.pow(10, 8));
        
    var managerInst;
    var visible = true;
	var paper;
	var circle;
    
    
    /**
    * Returns the circle's id, which can be used to retrieve a specific circle from DrawManager.
    *
    * @type Circle
    * @name getId
    * @return String
    */
    
    this.getId = function() {
        return circleId;
    };
    
    
    /**
    * \Internal
    * Creates a canvas element for each circle.
    *
    * @type Circle
    * @name createCanvas
    * @return None
    */
    this.createCanvas = function() {
        var c = document.createElement('div');
		var width = 2 * (this.radiusPixels + 2*this.lineWidth);
		
        c.style.position = 'absolute';
        c.width = width;
        c.height = width;
        c.id = 'canvas_' + managerInst.getId() + "_" + circleId;
		
        var map = managerInst.getMapInst();
        map.getDrawPort().append(c);
		
		paper = Raphael(c.id, width, width);
		circle = paper.circle(width/2, width/2, this.radiusPixels);
    };

    
    /**
    * \Internal
    * Draws the circle on the map according to its class attributes (parameters) - position, radius and styling.
    * If the parameter is set to "redraw" the circle will be modified and redrawn according to the new class attributes.
    *
    * @type Circle
    * @name draw
    * @param param: String
    * @return None
    */
    this.draw = function(param){
        var map = managerInst.getMapInst();
        if (typeof map != "undefined" && this.radius > 0 && (this.lineWidth > 0 || this.fillOpacity > 0) && (this.opacity > 0 || this.fillOpacity > 0)) {
            this.centerServer = Convert.degreesToServer({
                geoPoint: this.center,
                refP: map
            });
            this.radiusPixels = this.convertRadiusToPixels();
            
            if (!($('#canvas_' + managerInst.getId() + "_" + circleId).length)) {
                this.createCanvas();
            }
            var width = 2*(this.radiusPixels + 2 * this.lineWidth);
			if (param == "redraw") {
				paper.setSize(width, width);
			}
            var c = document.getElementById('canvas_' + managerInst.getId() + "_" + circleId);
            
            c.width = width;
            c.height = width;
            
            var wgsToMapPos = Convert.mapCoordToTopLeft({
                geoPoint: this.centerServer,
                map: map,
                distance: this.radiusPixels
            });
            
            c.style.top = wgsToMapPos.top - width / 2 + 'px';
            c.style.left = wgsToMapPos.left - width / 2 + 'px';
            
            if (visible === false) {
                c.style.display = "none";
            } else {
                c.style.display = "block";
            }
			
			if(param == "redraw") {
				circle.remove();
                circle = paper.circle(width/2, width/2, this.radiusPixels);
			}
            
            circle.attr({
                "stroke": this.color,
                "stroke-opacity": this.opacity,
                "stroke-width": this.lineWidth
            });
            
            if (this.fillColor != "") {
                circle.attr({
                    "fill": this.fillColor,
                    "fill-opacity": this.fillOpacity
                });
            }
        }
    };
    
    /**
    * Redefines the appearance of a Circle by setting new CircleOptions. The definition of CircleOptions can be found in Circle's constructor.</br>
    * 
    * @type Circle
    * @name setOptions
    * @param params: CircleOptions <br/>
    * @return None
    */
    this.setOptions = function (params) {
        var map;
        if (typeof params.managerInst == "object") {
            managerInst = params.managerInst;
            map = managerInst.getMapInst();
        }
        
        if (typeof params.center != "undefined" && typeof params.center.x != "undefined" && typeof params.center.y != "undefined") {
            this.center.x = params.center.x;
            this.center.y = params.center.y;
        }        
        
        params.radius = parseFloat(params.radius);
        if (typeof params.radius != "undefined" && params.radius > 0) {
            //this.radius = params.radius > 1 ? 1 : params.radius;
            if (params.radius <= 100) {
                if (BrowserDetect.browser == 'Chrome' && params.radius > 10) {
                    this.radius = 10;
                } else {
                    this.radius = params.radius;
                }
            } else {
                this.radius = 100;
            }
        }

        if (typeof map != "undefined") {
            this.centerServer = Convert.degreesToServer({geoPoint: this.center, refP: map});
            this.radiusPixels = this.convertRadiusToPixels();
        }
        
        if (typeof params.color != "undefined" && params.color.length !== 0) {
            this.color = params.color;
        }

        params.lineWidth = parseInt(params.lineWidth, 10);
        if (typeof params.lineWidth != "undefined" && params.lineWidth >= 0) {
            this.lineWidth = parseInt(params.lineWidth, 10);
        }

        params.opacity = parseFloat(params.opacity);
        if (typeof params.opacity != "undefined" && params.opacity >= 0 && params.opacity <= 1) {
            this.opacity = params.opacity;
        }
        
        if (typeof params.fillColor == "string" && params.fillColor.length !== 0) {
            this.fillColor = params.fillColor;
        }

        params.fillOpacity = parseFloat(params.fillOpacity);
        if (typeof params.fillOpacity != "undefined" && params.fillOpacity >= 0 && params.fillOpacity <= 1) {
            this.fillOpacity = params.fillOpacity;
        }
        
        if (typeof params.visible == "boolean") {
            visible = params.visible;
        }
        
        if (typeof params.firstTime == "undefined") {
            this.draw("redraw");
        }
    };
    
    
    /**
    * \Internal
    * Converts given radius from kilometers to pixels.
    *
    * @type Circle
    * @name convertRadiusToPixels
    * @return number
    */
    this.convertRadiusToPixels = function() {
        var map = managerInst.getMapInst();
        if (this.radius > 0 && typeof map != "undefined") {
            this.centerServer = Convert.degreesToServer({geoPoint: this.center, refP: map});

            var dest = this.center.computeDestination(this.radius, 0);
            var destServer = Convert.degreesToServer({geoPoint: dest, refP: map});
            
            var destPxy = Math.abs(this.centerServer.y - destServer.y);
          
            return destPxy;
        }
    };
    
    
    /**
	 * Hides the circle from the map.
     *
     * @type Circle
     * @name hide 
     * @return None
     */
    this.hide = function () {
        visible = false;
        $('#canvas_' + managerInst.getId() + "_" + circleId).css({"display": "none"});
    };
    
    
    /**
	 * Shows the circle on the map.
     *
     * @type Circle
     * @name show 
     * @return None
     */
    this.show = function () {
        visible = true;
        $('#canvas_' + managerInst.getId() + "_" + circleId).css({"display": "block"});
    };
    
    
    /**
	 * Returns true if the circle is visible on the map, false otherwise.
     *
     * @type Circle
     * @name isVisible
     * @return Boolean
     */
    
    this.isVisible = function () {
        return visible === true;
    };
    
   
    /**
    * Returns the circle DOM object.
    *
    * @type Circle
    * @name getDomObject
    * @return obj: DOM
    */

    this.getDomObject = function () {
        return $('#'+this.getDomId());
    };
    
    
    /**
    * \Internal;
    * Returns the circle DOM id.
    *
    * @type Circle
    * @name getDomId
    * @return String
    */

    this.getDomId = function() {
        return 'canvas_' + managerInst.getId() + "_" + circleId;
    };
    
    
    /**
    * Erases the circle from the map and DrawManager (it also deletes its container's DOM element).
    *
    * @type Circle
    * @name erase
    * @return None
    */
    this.erase = function(){
		managerInst.removeFromManager(this.getId());
		var obj = this.getDomObject();
		obj.remove();
		obj.empty();
	};
    

    /* START CONSTRUCTOR */
    params.firstTime = true;
    this.setOptions(params);
    /* END CONSTRUCTOR */
}