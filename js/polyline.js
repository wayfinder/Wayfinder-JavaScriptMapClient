/**
 * Class
 * Polyline is used to draw polylines on the map. After being created, it should be added to the map via DrawManager. An 
 * example of its usage can be found under "Examples". <br/> 
 * <br>
 * <b>Events:</b><br/>
 * You can listen to all default DOM events on a Polyline, for example: 'click', 'dblclick', 'mouseover', 'mouseout', etc.</code><br />
 */

 /**
  * Create a Polyline. </br>
  * <br>
  * <b>Parameters:</b></br>
  * <br>
  * PolylineOptions specify the appearance of a polyline. It is a generic object with the following properties: </br>
  * <br>
  * <li>lats: {lat1, lat2, lat3} </br> 
  * It's an object that contains an array of WGS84 latitude coordinates. </li>
  * <br>
  * <li>lons: {lon1, lon2, lon3} </br> 
  * It's an object that contains an array of WGS84 longitude coordinates. </li>
  * <br> 
  * <li>style: {lineWidth: number, color: String, opacity: number(0,1)} </li>
  *
  * @name Polyline
  * @type Constructor
  * @param params: PolylineOptions
  */

function Polyline(params) {
	//PRIVATE	
	var lineId = Math.floor(Math.random() * Math.pow(10, 8));
	var color, lineWidth, opacity;	
	var paper;
	var path;
	//var scope = this;
	//var fillColor, fillOpacity;
		
	//PUBLIC
	this.mapPoints = [];
	this.canvasObj = null;
	this.map = null;
	this.lineCanvas = null;
	this.initialStyle = params;
	this.visible = true;

	/** 
	 * Checks if the polyline is visible.
	 * 
	 * @name isVisible
	 * @type Polyline
	 * @return Boolean
	 */
	
	this.isVisible = function(){
		return this.visible;
	};	

	/**
	 * \Internal
	 * Set parameters to bind to a map instance and a draw manager
	 * 
	 * @param options :Object { map: mapInstance, managerInst: drawManager }
	 */

	this.setOptions = function(options) {
		this.map = options.map;
		this.canvasObj = options.managerInst;
	};

	/** 
	 * \Internal
	 * Sets the styling of the line
	 * 
	 * @name setStyles
	 * @type Polyline
	 * @param params :Object { color: String, lineWidth: number, opacity: number}
	 * @return None
	 */
	
	this.setStyles = function(params) {
		var style;
		if(typeof params.style != 'undefined') {
			style = params.style;
		} else {
			style = [];
		}

		color = typeof style.color != 'undefined' ? style.color : '#0033DD';
		lineWidth = typeof style.lineWidth != 'undefined' ? style.lineWidth : 4;
		opacity = typeof style.opacity != 'undefined' ? style.opacity : 0.4;
		
		this.draw("redraw");
	};
	
	/**
	 * Shows the polyline
	 * 
	 * @name show
	 * @type Polyline
	 * @return None
	 */
	
	this.show = function() {
		$('#canvas_' + this.canvasObj.getId() + "_" + this.getId()).show();
		this.visible = true;
	};
	
	/**
	 * Hides the polyline
	 * 
	 * @name hide
	 * @type Polyline
	 * @return None
	 */
	
	
	this.hide = function() {
		$('#canvas_' + this.canvasObj.getId() + "_" + this.getId()).hide();
		this.visible = false;
	};
	
	/**
	 * Gets the polyline JQuery DOM Object
	 * 
	 * @name getDomObject
	 * @type Polyline
	 * @return None
	 */
	
	this.getDomObject = function() {
		return $('#canvas_' + this.canvasObj.getId() + "_" + this.getId());
	};
	
	/**
	 * Deletes the polyline from DOM
	 * 
	 * @name erase
	 * @type Polyline
	 * @return None
	 */
	
	this.erase = function(){
		$('#canvas_' + this.canvasObj.getId() + "_" + this.getId()).remove();
		$('#canvas_' + this.canvasObj.getId() + "_" + this.getId()).empty();
	};
	
	
	/** 
	 * \Internal
	 * Builds the canvas container according to zoom level and location of drawing
	 * 
	 * @name buildContainer
	 * @type Polyline
	 * @return None
	 */
	
	this.buildContainer = function() {
		var drawPort = this.map.getDrawPort();
		
		var c = document.createElement('div');
        c.style.position = 'absolute';
        c.id = 'canvas_' + this.canvasObj.getId() + "_" + this.getId();
        drawPort.append(c); 
        
        paper = Raphael(c.id, 100, 100);		
        
		return c;  
	};
	
	/** 
	 * Returns the DOM element ID of the polyline's container
	 * 
	 * @name getId
	 * @type Polyline
	 * @return String
	 */
	
	this.getId = function() {
		return lineId;
	};
	
	/** 
	 * \Internal
	 * Draws the figure on the canvas and positions it according to zoom level and location
	 * 
	 * @name draw
	 * @type Polyline
	 * @return None
	 */
	
	this.draw = function(param) {
		var canvasTop, canvasLeft, canvasWidth, canvasHeight;
		var minLeft, minTop, maxLeft, maxTop;		
		var maxLon = params.lons[0];
		var maxLat = params.lats[0];
		var maxPairCoords = Convert.degreesToServer({geoPoint: {x: maxLon, y: maxLat}, refP: this.map, zoom: this.map.getZoomFactor()});
		var gp;
		var i;
		
		for(i=0; i<params.lons.length; i++) {
			gp = new GeoPoint(params.lons[i], params.lats[i]);
			this.mapPoints[i] = Convert.wgsToMap({geoPoint: gp, map: this.map, path: true });
			
			if (maxLon < params.lons[i]) {
			    maxLon = params.lons[i];
			    maxLat = params.lats[i];
			}
			
			if(i===0) {
				maxLeft = minLeft = this.mapPoints[i].left;
				maxTop  = minTop  = this.mapPoints[i].top;
			} else {
				minLeft = (this.mapPoints[i].left < minLeft) ? this.mapPoints[i].left : minLeft;
				minTop  = (this.mapPoints[i].top  < minTop)  ? this.mapPoints[i].top  : minTop;
				
				maxLeft = (this.mapPoints[i].left > maxLeft) ? this.mapPoints[i].left : maxLeft;
				maxTop  = (this.mapPoints[i].top  > maxTop)  ? this.mapPoints[i].top  : maxTop;
			}
		}
		
		maxPairCoords = Convert.degreesToServer({geoPoint: {x: maxLon, y: maxLat}, refP: this.map, zoom: this.map.getZoomFactor()});
		
		this.map.compileOView();
		
		//var oview = this.map.getOView();
		//var coord = Convert.mapCoordToTopLeft({geoPoint: oview, map:this.map, path: true });
		
		var pathDraw = Convert.mapCoordToTopLeft({geoPoint: maxPairCoords, map:this.map});
		
		var newWidth = Math.abs(maxLeft - minLeft) + (lineWidth*2);
		var newHeight = Math.abs(maxTop  - minTop) + (lineWidth*2);

	    canvasTop = minTop - (lineWidth);
	    canvasLeft = minLeft - (lineWidth);
	    canvasWidth  = newWidth;
	    canvasHeight = newHeight;

		var offset = this.map.getZoomFactor() < 3 ? (pathDraw.repetitions*pathDraw.size) : 0;

		canvasLeft = canvasLeft + offset;

		var c = this.lineCanvas;

		c.style.top = canvasTop;
		c.style.left = canvasLeft;
        c.width = canvasWidth;
        c.height = canvasHeight;
        
        paper.setSize(canvasWidth, canvasHeight);

        if(param == "redraw") {
            if (typeof path != "undefined") {
                path.remove();
            }

            var pathCoords = "M"+(this.mapPoints[0].left + offset - canvasLeft) + " " + (this.mapPoints[0].top - canvasTop);

            for(i=1;i<this.mapPoints.length;i++) {
                pathCoords += "L" + (this.mapPoints[i].left + offset - canvasLeft) + " " + (this.mapPoints[i].top - canvasTop);
            }

            path = paper.path(pathCoords);
        }

        path.attr({
		    "stroke": color,
		    "stroke-opacity": opacity,
		    "stroke-width": lineWidth,
		    "stroke-linecap": "round",
		    "stroke-linejoin": "round"
		});	
	};
	
	/**START CONSTRUCTOR*/

//    Event.addListener('dragstop', function() { scope.draw(); }, {}, map.getDragPort());
//    Event.addListener('afterZoom', function() { scope.draw(); });
//    Event.addListener('centerMap', function() { scope.draw(); });
	
	/**END CONSTRUCTOR*/
}
