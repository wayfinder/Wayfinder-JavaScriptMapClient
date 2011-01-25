/**
 * Class
 * Map handles all map-related operations.</br>
 * <br>
 * <b>Events: </b><br/>
 * <li><code>'windowResized'</code> with parameters <code>{'width', 'height'}</code> is fired when the view port resizes<br/></li>
 * <br>
 * <li><code>'centerMap'</code> with parameter <code>{'zoom'}</code> is fired when centering the map on a certain position at the given 'zoom' level<br/></li>
 * <br>
 * <li><code>'zoom'</code> with parameter <code>{'delta'}</code> is fired when the map zooms in or out by 'delta' zoom levels (delta can be either positiove or negative)<br/></li> 
 * <br>
 * <li><code>'afterZoom'</code> with parameter <code>{'delta'}</code> is fired when the map finishes zooming in or out by 'delta' zoom levels<br/></li>
 * <br>
 * <li><code>'drag'</code> is fired when the map is being dragged or panned continuously <br/></li>
 * <br>
 * <li><code>'dragstop'</code> is fired when the dragging of the map stops <br/></li>
 * <br>
 * <li><code>'panstop'</code> is fired when the panning of the map stops <br/></li>
 * <br>
 * <li><code>'mapLoaded'</code> is fired when all the map tiles finish loading<br/></li>
 * <br>
 * <li><code>'contextClick'</code> with parameters <code>{'mx', 'my'}</code> is fired when right click on the map, with the mouse's coordinates as parameters<br/></li>
 * <br>
 * <li><code>'dblrightclick'</code> with parameters <code>{'mx', 'my'}</code> is fired when double right click on the map, with the mouse's coordinates as parameters</li>
 * <br>
 */

 /**
 * The 'el' parameter represents the ID of the DOM element the map will be loaded in (for now this DOM element should be placed directly in the 'body' tag).<br/>
 *
 * @type Constructor
 * @name Map    
 * @param el: String
 */
function Map(el){
	//global variables
	this.overlay		= null;
	this.markers        = null;
	this.loadedTiles     = 0;
	this.panning		 = false;
	this.viewPortTop     = 0;
	this.viewPortLeft    = 0;
	this.viewPortWidth   = 0;
	this.viewPortHeight  = 0;
	this.focusPoint		 = {'x': 0, 'y': 0}; //Relative to ViewPort
	
	//local variables
	var wigleFix		= (BrowserDetect.browser == 'Chrome')? 0.1 : 0;
	var oView			= null;
	var oTiles			= {'imgCoords': 0, 'posCoords': 0};
	var viewPort		= null;
	var dragPort		= null;
	var zoomPort		= null;
	var mapPort			= null;
	var markerPort      = null;
	var drawPort        = null;
	
	var dragObj			= null;
	var fill			= null;
	var matrixView		= [];
	var matrixZoom		= [];
	var panFactor		= {x: 0, y: 0};
	var totalTiles		= {x: 0, y: 0};	  
	var tileSize		= config.tileSize;
	var zoomFactor		= 1;	
	var dragStatus      = true;
	var panStatus      = true;
	var mapMode         = 'normal';	
	
	var mapPortPosition = null;
	var firstLoad		= false;	
	var activeMarkerManager = null;
	var percent;
	
	/**
	* Adds a control to the map.</br></br>
	* <b>Parameters:</b></br>
	* <li>'control' can be any customized object that implements the Control interface. This API comes with two predefined controls: <code>'ZoomControl'</code > and <code>'ScaleControl'</code><br/></li>
	* <br>
	* <li>'position' is optional and can be used to place the control. There are four predefined values to choose from: <code>'upper-left', 'upper-right', 'bottom-left', 'bottom-right'</code>. You can also 
	* define a customized Position by <code>{ x: &lt;PixelsFromLeft&gt;, y: &lt;PixelsFromTop&gt; }</code></li>
	*
	*
	* @type Map
	* @name addControl
	* @param control: Control
	* @param position: Position
	*/
	
	this.addControl = function(control, position) {
		this.overlay.addControl(control, position);
	};
		
	/**
	* \Internal
	* Returns the total number of tiles x,y needed for the view port to be filled with tiles
	*
	* @type Map
	* @name getFill     
	* @return obj
	*/
	this.getFill = function() {
		return fill;
	};
	this.getMapPortPosition = function() {
		return mapPortPosition;
	};
	
	/**
	* \Internal
	* Sets the path to the .cur images
	*
	* @type Map
	* @name getFill     
	* @return none
	*/
	this.setCursors = function() {
		config.cursorOpenHand = "url('img/grab.cur'), default";
		config.cursorCloseHand = "url('img/grabbing.cur'), default";
	};
	
	/**
	* \Internal
	* Sets upper-left GeoPoint in the Map relative to the ViewPort (used on RenderMap)
	*
	* @type Map
	* @name setOView     
	* @return None
	*/
	this.setOView = function() {
		oView = { x: (-this.config.x) , y: (-tileSize-this.config.y)};
	};
	
	/**
	* \Internal
	* Calculates the upper-left Point in Map(server XY coords) relative to the ViewPort(upper-left corner) and sets oView attribute
	*
	* @type Map
	* @name compileOView     
	* @return None
	*/
	this.compileOView = function() {
		oView.x = (-mapPortPosition.x - dragPort.position().left);
		oView.y = (mapPortPosition.y + dragPort.position().top) + 256;
	};
	
	/**
	* \Internal
	* Sets the coordinates of the upper-left tile
	*
	* @type Map
	* @name setOTiles     
	* @return None
	*/
	this.setOTiles = function() {
		oTiles.imgCoords = {x: parseInt(parseInt(-oView.x/tileSize, 10)-1, 10) * tileSize , y: parseInt(parseInt(-oView.y/tileSize, 10)-1, 10) * tileSize};
		oTiles.posCoords = {x:-Math.round(oView.x/256 + 256 - (oView.x % 256)), y:-Math.round(oView.y/256 + 256 - (oView.y % 256)) };
	};
	
	/**
	* \Internal
	* Calculates number of tiles needed to fill the ViewPort and sets the fill attribute
	*
	* @type Map
	* @name compileFill
	* @return None
	*/
	this.compileFill = function() {
		fill = { x: parseInt(this.viewPortWidth/tileSize+3, 10), y: parseInt(this.viewPortHeight/tileSize+3, 10)};
	};
	
	/**
	* \Internal
	* Used for zoom effects. Calculates the exact percent that a tile size represents from the total size of the map.
	*
	* @type Map
	* @name compilePercent
	* @return obj: GeoPoint
	*/
	this.compilePercent = function() {
		return {x: 100/(fill.x), y: 100/(fill.y)};
	};
	
	/**
	* \Internal
	* Calculates the total no. of tiles for a specific zoom level
	*
	* @type Map
	* @name returnTotalTiles
	* @param zoom: Integer
	* @return obj: Object {x,y}
	*/
	this.returnTotalTiles = function(zoom) {
		zoomRanges = config.zoomRanges[zoom];
		return {'x': (zoomRanges[2] - zoomRanges[0]) / tileSize + 1, 'y': (zoomRanges[3] - zoomRanges[1]) / tileSize + 1};
	};
	
	/**
	* \Internal
	* Sets the totalTiles attribute by callsing the returnTotalTiles method
	*
	* @type Map
	* @name compileTotalTiles     
	* @return None
	*/
	this.compileTotalTiles = function (){
		totalTiles = this.returnTotalTiles(zoomFactor);
	};
	
	/**
	* \Internal
	* Sets the drag limits for the Y axis depending on the current zoom level
	*
	* @type Map
	* @name setDragLimits     
	* @return None
	*/
	this.setDragLimits = function() {
		zoomRanges = config.zoomRanges[zoomFactor];
	};
	
	/**
	* Enables the drag functionality and sets drag status to true.
	*
	* @type Map
	* @name enableDrag
	* @return None
	*/
	this.enableDrag = function() {	 
	    this.setDragStatus(true);	    
	    this.enableDragFeatures();
	};
	
	/**
	* \Internal
	* Enables the drag functionality.
	*
	* @type Map
	* @name enableDrag
	* @return None
	*/
	this.enableDragFeatures = function() {	 
		dragObj = $(dragPort).draggable({ handle: $(viewPort)});
		$(dragPort).draggable('enable');
		dragObj.ref = this;
		Event.addListener('drag', this.onDrag, {'refP': this}, viewPort);
		Event.addListener('dragstop', this.onDrag, {'refP': this}, viewPort);
		zoomRanges = config.zoomRanges[zoomFactor];
	};
	
	/**
	* Disables the drag functionality and sets drag status to false.
	*
	* @type Map
	* @name disableDrag
	* @return None
	*/
	this.disableDrag = function() {
		this.setDragStatus(false);
		this.disableDragFeatures();
	};
	
	/**
	* \Internal
	* Disables the drag functionality.
	*
	* @type Map
	* @name disableDrag
	* @return None
	*/
	this.disableDragFeatures = function() {
		Event.removeListener('drag', viewPort, this.onDrag);
		Event.removeListener('dragstop', viewPort, this.onDrag);
		$(dragPort).draggable('disable');
	};
	
	/**
	* Toggles the drag functionality (enables it if it's disabled and vice versa)
	*
	* @type Map
	* @name toggleDrag
	* @return None
	*/
	this.toggleDrag = function() {	   
		if (this.getDragStatus()) {
			this.disableDrag();
		} else {
			this.enableDrag();
		} 
	};

	/**
	* Returns true if the drag functionality is enabled and false when disabled
	*
	* @type Map
	* @name getDragStatus
	* @return Boolean
	*/
	this.getDragStatus = function() {
		return (dragStatus === true);
	};	
	
	/**
	* \Internal
	* Sets drag status according to the given boolean parameter.
	*
	* @type Map
	* @name setDragStatus
	* @param Boolean
	* @return None
	*/
	this.setDragStatus = function(status) {
		if (typeof status == "boolean") {
			dragStatus = status;
		}
	};
	
	/**
	* \Internal
	* Reloads the map tiles
	*
	* @type Map
	* @name reloadTilesSrc    
	* @return None
	*/
	this.reloadTilesSrc = function() {
		for(var i = 0; i<fill.y; i++) {	        
			for(var j = 0;j<fill.x;j++) {
				this.loadImage(matrixView[i][j], this.getX(j),-this.getY(i), 'reload');
			}
		}
	};
	
	/**
	* Enables the pan functionality
	*
	* @type Map
	* @name enablePan
	* @return None
	*/
	this.enablePan = function() {
		panStatus = true;
	};
	
	/**
	* Disables the pan functionality
	*
	* @type Map
	* @name disablePan
	* @return None
	*/
	this.disablePan = function() {
		panStatus = false;
	};

	/**
	* Returns true if the pan functionality is enabled and false when disabled
	*
	* @type Map
	* @name getPanStatus
	* @return Boolean
	*/
	this.getPanStatus = function() {
		return (panStatus === true);
	};
	
	/**
	* Toggles the pan functionality (enables it if it's disabled and vice versa)
	*
	* @type Map
	* @name togglePan
	* @return None
	*/
	this.togglePan = function() {
		if (this.getPanStatus()) {
			this.disablePan();
		} else {
			this.enablePan();
		}
	};

	/**
	* \Internal
	* Returns an object containing the current number of tiles on x and y axes
	*
	* @type Map
	* @name getTotalTiles
	* @return obj: {x,y}
	*/
	this.getTotalTiles = function () {
		return totalTiles;
	};
	
	/**
	* \Internal
	* Returns the dimension of a tile
	*
	* @type Map
	* @name getTileSize
	* @return Integer
	*/
	this.getTileSize = function () {
		return tileSize;
	};
	
	/**
	* Returns the zoom level
	*
	* @type Map
	* @name getZoomFactor
	* @return Integer
	*/
	this.getZoomFactor = function () {
		return zoomFactor;
	};
	
	/**
	*\Internal
	* Sets the zoom level
	*
	* @type Map
	* @name setZoomFactor
	* @return None
	*/
	this.setZoomFactor = function (newZoomLVL) {
		zoomFactor = newZoomLVL;
	};
	
	/**
	* Returns the view port DOM element.
	*
	* @type Map
	* @name getViewPort
	* @return DOM Element
	*/
	this.getViewPort = function() {
		return viewPort;
	};
	
	/**
	* \Internal
	* Returns the map coordinates for the top left corner in the viewport.
	*
	* @type Map
	* @name getOView
	* @return obj: GeoPoint
	*/
	this.getOView = function() {
		return new GeoPoint(oView.x, oView.y, "map", this);
	};
	
	/**
	* \Internal
	* Returns the dragPort
	*
	* @type Map
	* @name getDragPort
	* @return DOMElem
	*/
	this.getDragPort = function() {
		return dragPort;
	};
	
	this.getZoomPort = function() {
		return zoomPort;
	};
	
	/**
	* \Internal
	* Returns the mapPort
	*
	* @type Map
	* @name getMapPort
	* @return DOMElem
	*/
	this.getMapPort = function() {
		return mapPort;
	};
	
	/**
	* If 'mode' is set to 'fullscreen', the map will adjust its size to the window's full screen size.
	*
	* @type Map
	* @name setMapMode
	* @param mode: String
	* @param bottomHeight: Integer
	* @return None
	*/
	this.setMapMode = function(mode, bottomHeight) {
		mapMode = mode;
		var refP = this;
		
		var bottom = 0;
		if (typeof bottomHeight != 'undefined') {
		    bottom = bottomHeight;
		}
		
		if (mode == 'fullScreen'){
			$(viewPort).css({'height': ($(window).height()-refP.viewPortTop- parseInt(bottom, 10)) + 'px', 'width': ($(window).width()-refP.viewPortLeft) + 'px'});
			
			refP.viewPortWidth = viewPort.width();
			refP.viewPortHeight = viewPort.height();
			
			var prevFill = refP.getFill();
			refP.compileFill();
			percent = refP.compilePercent();
			refP.overlay.repositionControls();
			
			Event.addListener('resize', function(e) {
				$(viewPort).css({'height': ($(window).height()-refP.viewPortTop- parseInt(bottom, 10)) + 'px', 'width': ($(window).width()-refP.viewPortLeft) + 'px'});
				
				refP.viewPortWidth = viewPort.width();
				refP.viewPortHeight = viewPort.height();
				
				prevFill = refP.getFill();
				refP.compileFill();
				refP.recalculateMatrix(refP, prevFill, refP.getFill());
				Event.triggerEvent('windowResized', {'width': refP.viewPortWidth + 'px', 'height': refP.viewPortHeight + 'px'});
			}, {'refP': this}, $(window));
		}
	};
	
	/**
	* \Internal
	* Returns the url for the tile having coordinates x and y
	*
	* @type Map
	* @name getMapUrl
	* @param x: Integer
	* @param y: Integer
	* @return String
	*/
	this.getMapUrl = function(x, y) {
		var seed = parseInt(((Math.abs(x)/tileSize) + (Math.abs(y)/tileSize) - 1 )%config.tileServers.length, 10);
		if (x === 0 && y === 0) {
			return 'http://'+config.tileServers[0];
		} else {
			return 'http://'+config.tileServers[seed];
		}
	};
	
	/**
	* \Internal 
	* Adjust the X coordinate after you go pass the "end of the world (of Warcraft)"
	*
	* @type Map
	* @name returnRealX
	* @param x: Integer
	* @return Integer
	*/
	this.returnRealX = function(x){
		zoomRanges = config.zoomRanges[zoomFactor];
		var xLeft  = zoomRanges[0]; 
		var xRight = zoomRanges[2];
		if(x<0) {
			x = parseInt((x - xRight)/(totalTiles.x*tileSize), 10)*totalTiles.x*tileSize*(-1) + x;
		} else { 
			x = parseInt((x - xLeft)/(totalTiles.x*tileSize), 10)*totalTiles.x*tileSize*(-1) + x;
		}
		return x;
	};	
	
	/**
	* \Internal 
	* Loads tile image. The "pre-load" image is different depending on the event status
	*
	* @type Map
	* @name loadImageStartup     
	* @param obj: tileObj
	* @param x: Integer
	* @param y: Integer
	* @param status: string
	* @return None
	*/
	this.loadImage = function(obj,x,y, status) {
		obj.tile.src = 'img/transparent.png';
		var tileUrl = this.getMapUrl(this.returnRealX(x), y);
		obj.temp.src = tileUrl + "/LMMap?x="+this.returnRealX(x)+"&y="+y+"&zoom="+zoomFactor;	
	};
	
	/**
	* \Internal 
	* Used for corelating X matrix coordinates to X server coordinates
	*
	* @type Map
	* @name getX     
	* @param jj: Integer
	* @return Integer
	*/
	this.getX = function (jj) {
		return jj*tileSize+oTiles.x;
	};
	
	/**
	* \Internal 
	* Used for corelating Y matrix coordinates to Y server coordinates
	*
	* @type Map
	* @name getY     
	* @param ii: Integer
	* @return Integer
	*/
	this.getY = function (ii) {
		return ii*tileSize+oTiles.y;
	};

	this.getXY = function (i, j) {
		var _ret = {'posCoords': null, 'imgCoords': null};
		_ret.posCoords = {'x': (i*tileSize+oTiles.posCoords.x), 'y': (j*tileSize+oTiles.posCoords.y)};
		_ret.imgCoords = {'x': (i*tileSize+oTiles.imgCoords.x), 'y': -(j*tileSize+oTiles.imgCoords.y)};
		return _ret;
	};
	
	this.getOTiles = function () {
		return oTiles;
	};
	/**
	* \Internal
	* Used for rendering the map with the right tiles from the server.
	* 
	* @type Map
	* @name renderMap     
	* @param config: Obj
	* @return None
	*/
	this.renderMap = function(status) {
		this.compileTotalTiles();
		this.config.x = this.returnRealX(this.config.x);
		this.config = {'x': this.config.x, 'y': this.config.y};
		this.setOView();
		
		//very important if statement!!!
		if (typeof status == "undefined") {
			status = 'zoomIn';
		}

		//OK la render Center Map
		mapPort.css({'left': Math.round(oView.x/256 - dragPort.position().left) + 'px'});
		mapPort.css({'top':  Math.round(oView.y/256 - dragPort.position().top) + 'px'});
		mapPortPosition = {'x': (oView.x - dragPort.position().left), 'y': (oView.y - dragPort.position().top)};
		this.setOTiles();
		markerPort.css({'left' : mapPort.position().left});
		markerPort.css({'top':   mapPort.position().top});
		
		drawPort.css({'left' : mapPort.position().left});
		drawPort.css({'top':   mapPort.position().top});
		for(var i = 0; i<fill.y; i++) {
			for(var j = 0;j<fill.x;j++) {
				matrixView[i][j].tile.style.top         = (i*tileSize + oTiles.posCoords.y) +'px';
				matrixView[i][j].tile.style.left        = (j*tileSize + oTiles.posCoords.x) +'px';
	
				matrixView[i][j].tile.style.height      = tileSize+'px';
				matrixView[i][j].tile.style.width       = tileSize+'px';
				matrixView[i][j].tile.style.position    = 'absolute';
				matrixView[i][j].posCoords              = {'x': (j*tileSize + oTiles.posCoords.x), 'y': (i*tileSize + oTiles.posCoords.y)};
				matrixView[i][j].imgCoords              = {'x': (j*tileSize + oTiles.imgCoords.x), 'y': (-(i*tileSize + oTiles.imgCoords.y))};
				
				if (matrixView[i][j].imgCoords.y > config.zoomRanges[zoomFactor][3] || matrixView[i][j].imgCoords.y <= config.zoomRanges[zoomFactor][1]) {
				    matrixView[i][j].tile.src = 'img/transparent.png';
				    matrixView[i][j].temp.src = 'img/transparent.png';
				} else {
				    this.loadImage(matrixView[i][j],(j*tileSize + oTiles.imgCoords.x),-(i*tileSize + oTiles.imgCoords.y), status);
				}		
			}
		}
	};
	
	this.resetZoomMatrix = function() {
		for(var i = 0; i<fill.y; i++) {
			for(var j = 0;j<fill.x;j++) {
				matrixZoom[i][j].style.top      = (i*percent.y + wigleFix)+'%';
				matrixZoom[i][j].style.left     = (j*percent.x + wigleFix)+'%';
				matrixZoom[i][j].style.width    = (percent.x + wigleFix)+'%';
				matrixZoom[i][j].style.height   = (percent.y + wigleFix)+'%';
				matrixZoom[i][j].src            = 'img/transparent.png';
			}
		}
	};
	/**
	* Pans the map by distance.x and distance.y pixels.
	*
	* @type Map
	* @name performPan
	* @param distance: Object{x, y}
	* @return None
	*/
	this.performPan = function(geoPoint, time) {
		if (this.panning === true) {
			return false;
		} else {
			this.panning = true;        
			if (this.getPanStatus()) {
				var refP = this;
				if (typeof time == 'undefined') {
					$(dragPort).animate(
						{
						left: "+="+geoPoint.x+"px", 
						top: "+="+geoPoint.y+"px"}, 
						{
						easing: 'linear',
						step: function(now, fx) {
							if (fx.prop == "left") {
								refP.onDrag({'data': {'refP': refP}});
							}},
						complete: function() {
							refP.panning = false;
							Event.triggerEvent("panstop");
						}
					});
				} else {
					$(dragPort).animate({"left": "+="+geoPoint.x+"px", "top": "+="+geoPoint.y+"px"},
					{
						duration: time,
						step: function(now, fx) {
							if (fx.prop == "left") {
								refP.onDrag({'data': {'refP': refP}});
							}},
						complete: function() {
							refP.panning = false;
							Event.triggerEvent("panstop");
						}
					}
					);
				}
			}
		}
	};
		
	
	/**
	* Pans the map to a new point which also becomes the map center.
	*
	* @type Map
	* @name panAndCenter
	* @param geoPoint: GeoPoint
	* @return None
	*/
	this.panAndCenter = function(geoPoint1) {
		var geoPoint;
		if (this.getPanStatus()) {
			geoPoint = Convert.degreesToServer({geoPoint: geoPoint1, refP: this});
			geoPoint.x = geoPoint.x - oView.x; 
			geoPoint.y = geoPoint.y - oView.y;
		    
			var centerCoord = new GeoPoint(this.viewPortWidth/2, this.viewPortHeight/2);
			var moveBy = new GeoPoint(parseInt(centerCoord.x - geoPoint.x, 10), parseInt(centerCoord.y + geoPoint.y, 10));
			if ((Math.abs(moveBy.x) <= this.viewPortWidth/2) && (Math.abs(moveBy.y) <= this.viewPortHeight/2)) {
				this.performPan(moveBy);
			} else {
				this.centerMap(geoPoint1, zoomFactor);
			}
		} else {
			this.centerMap(geoPoint1, zoomFactor);
		}
		
	};
	
	
	/**
	* Centers map at 'geoPoint' at given 'zoomLevel'. The zoom level can be any Integer between 1 and 15.
	*
	* @type Map
	* @name centerMap
	* @param geoPoint: GeoPoint
	* @param zoomLevel: Integer
	* @return None
	*/
	this.centerMap = function(newGeoPoint, zoomLevel) {
		this.focusPoint = newGeoPoint;
		var geoPoint = Convert.degreesToServer({geoPoint: newGeoPoint, refP: this, zoom: zoomLevel});   
		geoPoint = {x: geoPoint.x, y: geoPoint.y};
		zoomFactor = parseInt(zoomLevel, 10);
		
		if (matrixView.length === 0) {
		    firstLoad = true;
		} else {
		    firstLoad = false;
		}
		
		this.compileInitialMatrix();
		this.compileTotalTiles();
		
		geoPoint.y = -geoPoint.y;
		this.config.x = (geoPoint.x)- this.viewPortWidth/2;
		this.config.y = (geoPoint.y) - this.viewPortHeight/2;
		
		this.renderMap('centerMap');
		Event.triggerEvent('centerMap', { zoom: zoomFactor });	
	};
	
	
	/**
	* Centers map on the 'boundingBox' defined by four WGS84 coordinates (in degrees): east/west longitudes and north/south latitudes.
	*
	* @type Map
	* @name centerBoundingBox
	* @param boundingBox: Object {eastLon, westLon, northLat, southLat}
	* @return None
	*/
	this.centerBoundingBox = function(box){
		box.eastLon = Convert.wgs84ToMc2(box.eastLon);
		box.northLat = Convert.wgs84ToMc2(box.northLat);
		box.westLon = Convert.wgs84ToMc2(box.westLon);
		box.southLat = Convert.wgs84ToMc2(box.southLat);
		
		this.centerBoundingBoxMc2(box);
	};
	
	
	/**
	* \Internal
	* Centers the map on a boundingBox using four points: east and west longitudes and north and south latitudes.
	*
	* @type Map
	* @name centerBoundingBoxMc2
	* @param box: Object{eastLon, westLon, northLat, southLat}
	* @return None
	*/
	this.centerBoundingBoxMc2= function(box){
		var upper = Convert.mc2ToXyCoord({'geoPoint': {'x':box.eastLon,'y': box.northLat}, 'refP': this, 'zoom': 15});
		var lower = Convert.mc2ToXyCoord({'geoPoint': {'x':box.westLon,'y': box.southLat}, 'refP': this, 'zoom': 15});
		var deltaLon = upper.x - lower.x + 200;
		var deltaLat = upper.y - lower.y + 200;
		var sizeViewX = this.viewPortWidth;
		var sizeViewY = this.viewPortHeight;
		var zoomX = parseInt(deltaLon/sizeViewX, 10);
		var zoomY = parseInt(deltaLat/sizeViewY, 10);
		var i;
		var zoom;
		
		for(i=1;zoomX>1;i++) {
			zoomX = zoomX/2;
		}
		zoomX = 15 -i;
		for(i=1;zoomY>1;i++) {
			zoomY = zoomY/2;
		}
		
		zoomY = 15 -i;       
		zoom = zoomX>zoomY? zoomY: zoomX;
		zoom=zoom<1? 1: zoom;
		zoom= zoom+1;
		
		var lon = (box.eastLon - box.westLon)/2 + box.westLon;
		var lat = (box.northLat - box.southLat)/2 + box.southLat;
		
		zoomFactor = zoom;
		this.setDragLimits();
		this.compileTotalTiles();
		
		this.config = Convert.mc2ToXyCoord({'geoPoint': {x: lon, y: -lat}, 'refP': this});
		this.config.x = this.config.x - sizeViewX/2;
		this.config.y = this.config.y - sizeViewY/2;
		
		this.resetZoomMatrix();
		this.renderMap('centerMap');
		Event.triggerEvent('centerMap', { zoom: zoomFactor });
	};
	   
	/**
	* \Internal
	* Performs zoom in or zoom out by config.delta according to its sign</br>
	* <br>
	* <b>Parameters:</b></br>
	* config param: an Object that contains configuration elements [x,y: from the focus of the zoom, delta: how much to zoom]
	*
	* @type Map
	* @name zoom
	* @param config: Obj
	* @return Boolean
	*/
	 this.zoom = function(config) {
		var refP = config.refP;
		var delta = config.delta;
		//validate delta
		if(delta > 0) {
			if(zoomFactor == 15) {
			    return false;
			}
			if(delta + zoomFactor > 15) {
			    delta = delta - (delta + zoomFactor - 15);
			}
		} else {
			if(zoomFactor == 1) {
			    return false;
			}
			if(zoomFactor + delta < 1) {
			    delta = delta + Math.abs(1 + delta); 
			}
		}
		Event.triggerEvent('zoom', {'delta': delta});
		zoomFactor = zoomFactor + delta;
		
		var zoomDelta = Math.pow(2, delta);
		//Calculate Point position relative to dragPort
		var auxX = -(dragPort.position().left - config.x);
		var auxY = -(dragPort.position().top - config.y);
		//Calculate Point position relative to mapPort
		var aux2X = auxX - mapPortPosition.x;
		var aux2Y = auxY - mapPortPosition.y;
		
		this.config.x = zoomDelta*aux2X - config.x;
		this.config.y = zoomDelta*(aux2Y - tileSize)- config.y;

		//Calculate Point position relative to oTiles(oTiles = upper-left Tile from the matrix)
		//it's used to calculate the upper-left corner of the zoomMatrix when doing the zoom Effect
		var aux3X = -oTiles.posCoords.x + auxX - mapPort.position().left;
		var aux3Y = -oTiles.posCoords.y + auxY - mapPort.position().top;

		zoomPort.css({'visibility' : 'hidden'});
		if(Math.abs(delta) <= 3) {
			 for(var i = 0; i<fill.y; i++) {
				for(var j = 0;j<fill.x;j++) {
					matrixZoom[i][j].src = matrixView[i][j].tile.src;
					$(matrixView[i][j].tile).removeAttr("src");
					$(matrixView[i][j].temp).removeAttr("src");
				} 
			}

			//Preparing the zoomPort for the zoom effect
		    zoomPort.css({'top'   : mapPort.position().top  + oTiles.posCoords.y+'px'});
			zoomPort.css({'left'  : mapPort.position().left + oTiles.posCoords.x+'px'});
			zoomPort.css({'width' : fill.x*tileSize + 'px'});
			zoomPort.css({'height': fill.y*tileSize +'px'});
			zoomPort.css({'visibility' : 'visible'});
		
			if (delta > 0){
				mapPort.css('visibility', 'hidden');
				markerPort.css('visibility', 'hidden');
				drawPort.css('visibility', 'hidden');
				zoomPort.animate({
						width: ((zoomDelta)*fill.x*(tileSize+wigleFix))+'px',
						height: ((zoomDelta)*fill.y*(tileSize+wigleFix))+'px',
						top: (zoomPort.position().top   - (zoomDelta - 1)*aux3Y) - (fill.y*(wigleFix)) + 'px', 
						left: (zoomPort.position().left - (zoomDelta - 1)*aux3X) - (fill.x*(wigleFix)) + 'px'
					}, 250, "linear", function() {
											mapPort.css('visibility', 'visible');
											markerPort.css('visibility', 'visible');
											drawPort.css('visibility', 'visible');
										}
				);
			} else {
				mapPort.css('visibility', 'visible');
				markerPort.css('visibility', 'visible');
				drawPort.css('visibility', 'visible');
				//labelPort.css('visibility', 'visible');
				
				zoomPort.css({'z-index' : '12'});
				zoomPort.animate({ 
						width: fill.x*tileSize*(zoomDelta),
						height: fill.y*tileSize*(zoomDelta),
						top:  zoomPort.position().top +   aux3Y*(1-zoomDelta)+ 'px', 
						left: zoomPort.position().left +  aux3X*(1-zoomDelta)+ 'px'
					}, 250, "linear", function() {
											zoomPort.css({'z-index': '7'});
										}
				);
			}
		}
		refP.renderMap();
		Event.triggerEvent('afterZoom', {'delta': delta});
		this.setDragLimits();
		
	};
	
	
	
	/**
	* \Internal
	* Rotates array a by p
	*
	* @type Map
	* @name rotateArray
	* @param a: Array
	* @param p: Integer
	* @return None
	*/
	this.rotateArray =  function(a , p ) {
	    var l, i, x;
		for(l = a.length, p = ((Math.abs(p) >= l && (p %= l)) || (p < 0 && (p += l)) || p); p; p = (Math.ceil(l / p) - 1) * p - l + (l = p)) {
			for(i = l; i > p; x = a[--i], a[i] = a[i - p], a[i - p] = x) {}
		}
	};
	
	/**
	* \Internal
	* Rotates the tiles matrix by 'byX' and 'byY' 
	*
	* @type Map
	* @name rotateMatrix
	* @param byX: Integer
	* @param byY: Integer
	* @return None
	*/
	this.rotateMatrix = function(byX,byY) {
		this.rotateArray(matrixView,byY);    
		for(var ii=0;ii<fill.y;ii++) {
			this.rotateArray(matrixView[ii],byX);        
		}
	};
	
	/**
	* \Internal
	* Loads the correct tiles when you pan the map.
	*
	* @type Map
	* @name compileMatrix
	* @param byX: Integer
	* @param byY: Integer
	* @return None
	*/
	this.compileMatrix = function (byX,byY) {
		var elem;
		var wich;
		var j;
		var i;
		
		if (byX !== 0) {
			for(j=1; j<= Math.abs(byX); j++){
				wich = (byX>0)? fill.x-(j): j-1;
				for(i=0;i<fill.y;i++) {
					elem = matrixView[i][wich];
					var newx = elem.posCoords.x-tileSize*(fill.x)*((byX>0)? 1: -1);
					var imgnewx = elem.imgCoords.x-tileSize*(fill.x)*((byX>0)? 1: -1);
					
					var sX = this.returnRealX(imgnewx);
					
					$(elem.tile).attr({'src': 'img/transparent.png'});
					$(elem.tile).one("load",{'x': newx}, this.moveImagesX);
					
					elem.posCoords.x = newx;
					elem.imgCoords.x = imgnewx;
					
					this.loadImage(elem, sX,elem.imgCoords.y, 'noEffect');
				}
			}
		}
		if (byY !== 0) {
			for(j=1; j<= Math.abs(byY); j++){
				wich = (byY>0)? fill.y-(j): j-1;
				for(i=0;i<fill.x;i++) {
					elem = matrixView[wich][i];
					
					var newy = elem.posCoords.y-tileSize*(fill.y)*((byY>0)? 1: -1);
					var imgnewy = elem.imgCoords.y+tileSize*(fill.y)*((byY>0)? 1: -1);
					
					$(elem.tile).attr({'src': 'img/transparent.png'});
					$(elem.tile).one("load",{'y': newy}, this.moveImagesY);
					
					elem.posCoords.y = newy;
					elem.imgCoords.y = imgnewy;
					this.loadImage(elem, this.returnRealX(elem.imgCoords.x),imgnewy, 'noEffect'); 

				}
			}
		}
	};
	
	this.moveImagesX = function (event) {
		var x = event.data.x;
		$(this).css({'left': x+'px'});
	};
	
	this.moveImagesY = function (event) {
		var y = event.data.y;
		$(this).css({'top': y+'px'});
	};
	
	/**
	* \Internal
	* Changes the mouse cursor icon according to 'type' or a default cursor
	*
	* @type Map
	* @name setCursor
	* @param type: String
	* @return None
	*/
	this.setCursor = function(type) {
		type = type || 'open';
		if(type == 'open') {
			viewPort.css({'cursor': config.cursorOpenHand});
		} else {
			viewPort.css({'cursor': config.cursorCloseHand});
		}
	};
	
	/**
	* \Internal
	* Starts the drag, triggered by 'event'
	*
	* @type Map
	* @name onDrag
	* @param event: String
	* @return None
	*/
	this.onDrag = function(event) {
		var obj = event.data.refP;
		var time = new Date();
		obj.lastCallOnDrag = time.getTime();
		Event.triggerEvent('onDrag');
		var panFactorX = 0;
		var panFactorY = 0;
		var half = tileSize/2;
		
		var byX = dragPort.position().left + oTiles.posCoords.x + mapPort.position().left;
		var byY = dragPort.position().top + oTiles.posCoords.y + mapPort.position().top;
		
		if(byX+half>0 ) {
			panFactorX = parseInt((byX+half)/tileSize+1, 10);
		}
		if(byX+3*half<0) {
			panFactorX = parseInt((byX+3*half)/tileSize-1, 10);               
		}
		if(byY+half>0 ) {
			panFactorY = parseInt((byY+half)/tileSize+1, 10);
		}
		if(byY+3*half<0) {
			panFactorY = parseInt((byY+3*half)/tileSize-1, 10);
		}
		
		oTiles.posCoords.x = oTiles.posCoords.x - panFactorX*tileSize;
		oTiles.posCoords.y = oTiles.posCoords.y - panFactorY*tileSize;  
		
		oTiles.imgCoords.x = oTiles.imgCoords.x - panFactorX*tileSize;
		oTiles.imgCoords.y = oTiles.imgCoords.y - panFactorY*tileSize; 
		
		panFactor.x += panFactorX;
		panFactor.y += panFactorY;
		
		if (panFactorX > fill.x || panFactorY > fill.y ) {
			obj.config.x = oTiles.x;
			obj.config.y = oTiles.y;
			obj.renderMap();
			return;
		}
		if (panFactorX !== 0 || panFactorY !== 0 ) {
			try {
				obj.compileMatrix(panFactorX,panFactorY);
				obj.rotateMatrix(panFactorX,panFactorY);
			} catch(err) {
				obj.config.x = oView.x;
				obj.config.y = oView.y;
				obj.renderMap();
				return;
			}
		}
	};
	
	/**
	* \Internal
	* Creates the initial matrix needed for the map. It also renders the Tile DomElements
	*
	* @type Map
	* @name compileInitialMatrix
	* @return none
	*/
	this.compileInitialMatrix = function(){
		var initialLoad = 'img/transparent.png';
		var img = null;
		var scope = this;
		var load = {};
		
		for(var i = 0; i<fill.y; i++) {
			if (firstLoad){
				matrixView[i] = [];
				matrixZoom[i] = [];
			}
			for(var j = 0;j<fill.x;j++) {
				//creating the zoom matrix
				if (!firstLoad){
					matrixZoom[i][j].src           = initialLoad;
					matrixZoom[i][j].style.top     = (i*percent.y + wigleFix)+'%';
					matrixZoom[i][j].style.left    = (j*percent.x + wigleFix)+'%';
					matrixZoom[i][j].style.width   = (percent.x + wigleFix)+'%';
					matrixZoom[i][j].style.height  = (percent.y + wigleFix)+'%';
				}else{
					img = new Image();
					img.src = initialLoad;
					img.style.position = 'absolute';
					
					img.style.border   = '0px solid';
					img.style.top      = (i*percent.y + wigleFix)+'%';
					img.style.left     = (j*percent.x + wigleFix)+'%';
					img.style.width    = (percent.x + wigleFix)+'%';
					img.style.height   = (percent.y + wigleFix)+'%';
					
					zoomPort.append(img);
					matrixZoom[i][j] = img;
				}
				
				//creating the view matrix (the matrix that contains the visible tiles)
				if (!firstLoad) {
					matrixView[i][j].src = initialLoad;
				} else {
					img = new Image();
					img.src = initialLoad;
					img.style.position = 'absolute';
					
					img.style.border   = '0px solid';
					img.style.left     = '0px';
					img.style.top      = '0px';
					img.style.height   = tileSize+'px';
					img.style.width    = tileSize+'px';
					//img.style.opacity = '1';
					mapPort.append(img);
					
					load = {};
					load.temp = new Image();
					load.temp.src = initialLoad;
					load.tile = img;
					load.posCoords = {'x': 0, 'y': 0};
					load.imgCoords = {'x': 0, 'y': 0};
					
					//$(img).disableTextSelect();
					img.onmousedown = scope.imgOnMouseDown;
					
					matrixView[i][j] = load;
					Event.addListener('load', scope.imgLaodListenerCompile, {'tile': matrixView[i][j].tile, 'totalTiles': (fill.x * fill.y), 'scope': scope}, matrixView[i][j].temp);
				}
				
			}
		}
	};
	
	/**
	* \Internal
	* Represents the listener for each tile image while compiling the tiles matrix.
	*
	* @type Map
	* @name imgLaodListenerCompile
	* @return none
	*/
	this.imgLaodListenerCompile = function(event) {
		var scope = event.data.scope;
		
		try{
			var tile = event.data.tile;
			tile.src = this.src;
		
			//Map load event
			if (scope.loadedTiles < event.data.totalTiles) {
				scope.loadedTiles++; 
				if (scope.loadedTiles == event.data.totalTiles) {
					Event.triggerEvent('mapLoaded');
				}
			}
		}catch(error){
		
		}
	};	
	
	this.disableSelectionDefault = function(target){
		if (typeof target.onselectstart != "undefined") {//IE route
			target.onselectstart = function() {return false;};
		}
		else if (typeof target.style.MozUserSelect != "undefined") {//Firefox route
			target.style.MozUserSelect="none";
		}
		else {//All other route (ie: Opera)
			target.onmousedown=function(){return false;};
		}
		//target.style.cursor = "default";
	};

	/**
	* \Internal
	* Recreates the matrix needed for the map after the window has been resized
	*
	* @type Map
	* @name recalculateMatrix
	* @return none
	*/
	this.recalculateMatrix = function(refP, prevFill, fill){
		percent = refP.compilePercent();
		var i;
		var j;
		var scope = this;
		
		if (prevFill.x < fill.x || prevFill.y < fill.y){
			//If window is resized to a bigger one, we need to add the extra DOM elements
			var img = new Image();
			
			for(i = 0;i<fill.y;i++) {
				if (i >= prevFill.y){
					matrixZoom[i] = [];
					matrixView[i] = [];
			    }
				for(j = 0,img = null;j<fill.x;j++) {
					if (j >= prevFill.x || i >= prevFill.y){
						//creating the zoom matrix
						var newElem = refP.getXY(j,i);
						
						img = new Image();
						img.style.position = 'absolute';
						zoomPort.append(img);
						matrixZoom[i][j] = img;
						
						//creating the view matrix (the matrix that contains the visible tiles)
						img                = new Image();
						img.style.border   = '0px solid';
						img.style.left     = newElem.posCoords.x +'px';
						img.style.top      = newElem.posCoords.y +'px';
						img.style.height   = tileSize+'px';
						img.style.width    = tileSize+'px';
						img.style.position = 'absolute';
						img.onmousedown    = scope.imgOnMouseDown;
						mapPort.append(img);
						
						var load = {};
						load.temp = new Image();
						load.temp.src = 'img/transparent.png';
						load.tile = img;
						
						load.posCoords = newElem.posCoords;
						load.imgCoords = newElem.imgCoords;
						
						if (newElem.imgCoords.y > config.zoomRanges[zoomFactor][3] || newElem.imgCoords.y <= config.zoomRanges[zoomFactor][1]) {
							load.tile.src = 'img/transparent.png';
						} else {
							refP.loadImage(load, newElem.imgCoords.x,newElem.imgCoords.y, 'reload');
						}
						
						matrixView[i][j] = load;
						
						Event.addListener('load', function(event){
							var tile = event.data.tile;
							tile.src = this.src;
						}, {'tile': matrixView[i][j].tile}, matrixView[i][j].temp);
						
					}
			    }
			}
		} else if (prevFill.y > fill.y || prevFill.x > fill.x) {
			//If window is resized to a smaller one, we need to delete the extra DOM elements
			for(i = 0;i<prevFill.y;i++) {
				if (typeof matrixView[i] != 'undefined'){
					for(j = 0;j<prevFill.x;j++) {
						if (typeof matrixView[i][j] != 'undefined'){
							if ((-matrixView[i][j].imgCoords.y) > (oTiles.imgCoords.y + (fill.y-1) * tileSize) || (matrixView[i][j].imgCoords.x) > (oTiles.imgCoords.x + (fill.x-1) * tileSize)){
								$(matrixView[i][j].tile).remove();
								$(matrixView[i][j].tile).empty();
								$(matrixView[i][j].temp).remove();
								$(matrixView[i][j].temp).empty();
								$(matrixZoom[i][j]).remove();
								$(matrixZoom[i][j]).empty();
								matrixView[i].splice(j, 1);
								matrixZoom[i].splice(j, 1);
								j--;
							}
						} else {
						    break;
						}
					}
					
					if (matrixView[i].length === 0) {
						matrixView.splice(i, 1);
						matrixZoom.splice(i, 1);
						i--;
					}
				}
			}
		}
		
		this.setDragLimits();
		
		for(i = 0; i < fill.y; i++) {
			for(j = 0; j < fill.x; j++) {
				if (typeof matrixZoom[i] != "undefined" && typeof matrixZoom[i][j] != "undefined") {
					matrixZoom[i][j].style.border   = '0px solid';
					matrixZoom[i][j].style.top     = (i*percent.y + wigleFix)+'%';
					matrixZoom[i][j].style.left    = (j*percent.x + wigleFix)+'%';
					matrixZoom[i][j].style.width   = (percent.x + wigleFix)+'%'; //+0.1
					matrixZoom[i][j].style.height  = (percent.y+wigleFix)+'%';
					matrixZoom[i][j].src           = 'img/transparent.png';
				}
			}
		}
	};
	
	/**
	* \Internal
	* Used to attach behaviour to the tile image on mousedown.
	*
	* @type Map
	* @name imgOnMouseDown
	* @return none
	*/
	this.imgOnMouseDown = function() {
		return false;
	};
	
	/**
	* \Internal
	* Sets map center in geoPoint + offset at the given zoomLevel
	*
	* @type Map
	* @name centerMapWithOffset
	* @param geoPoint: obj: GeoPoint
	* @param zoomLevel: Integer
	* @param offset: obj: GeoPoint
	* @return None
	*/
	this.centerMapWithOffset = function(newGeoPoint, zoomLevel, offset) {
	var geoPoint = Convert.degreesToServer({geoPoint: newGeoPoint, refP: this, zoom: zoomLevel});        
	zoomFactor = zoomLevel;
	this.setDragLimits();
	this.compileInitialMatrix();
	this.compileTotalTiles();
	
	geoPoint.y = -geoPoint.y;
	this.config.x = (geoPoint.x + offset.x)- this.viewPortWidth/2; // 
	this.config.y = (geoPoint.y + offset.y) - this.viewPortHeight/2; // 
	
	Event.triggerEvent('centerMap', { zoom: zoomFactor });
	this.renderMap();
	};
	
	
	/**
	* \Internal
	* Sets the marker port to newMarkerPort.
	*
	* @type Map
	* @name setMarkerPort
	* @param newMarkerPort: obj: DOM
	* @return None
	*/
	this.setMarkerPort = function(newMarkerPort) {
		markerPort = newMarkerPort;
	};
	
	
	/**
	* \Internal
	* Returns the marker port. 
	*
	* @type Map
	* @name getMarkerPort
	* @return obj: DOM
	*/
	this.getMarkerPort = function() {
	    return markerPort;
	};
	
	
	/**
	* \Internal
	* Sets the draw port to newDrawPort.
	*
	* @type Map
	* @name setDrawPort
	* @param newDrawPort: obj: DOM
	* @return None
	*/
	this.setDrawPort = function(newDrawPort) {
		drawPort = newDrawPort;
	};
	
	
	/**
	* \Internal
	* Returns the draw port. 
	*
	* @type Map
	* @name getDrawPort
	* @return obj: DOM
	*/
	this.getDrawPort = function() {
		return drawPort;
	};
	
	/**
	* \Internal
	* Returns the center of the map in geographical (WGS84) coordinates.
	*
	* @type Map
	* @name getCenter
	* @return obj: GeoPoint
	*/
	this.getCenter = function() {
		this.compileOView();
		var coords = {'x': (this.getOView().x + this.viewPortWidth / 2), 'y': (this.getOView().y - this.viewPortHeight / 2)};
		var mouseToMc2 = Convert.xyCoordToMc2({geoPoint: coords, refP: this});
		
		var newPos = {'x': 0, 'y': 0};
		newPos.x = Convert.mc2ToWgs84(mouseToMc2.x);
		newPos.y = Convert.mc2ToWgs84(mouseToMc2.y);
		
		return new GeoPoint(newPos.x, newPos.y);
	};
	
	
	/**
	* \Internal
	* Sets the active marker manager instance.
	*
	* @type Map
	* @name setActiveMarkerManager
	* @return None
	*/
	this.setActiveMarkerManager = function(markerManagerInst) {
		activeMarkerManager = markerManagerInst;
	};
	
	
	/**
	* \Internal
	* Returns the active marker manager instance.
	*
	* @type Map
	* @name getActiveMarkerManager
	* @return obj: MarkerManager
	*/
	this.getActiveMarkerManager = function() {
	    return activeMarkerManager;
	};
	
	
	/**
	* \Internal
	* Returns the number of map repetitions for the given geopoint (in map coordinates), at the current zoom level.
	* (For a geopoint that is only known in WGS standard coordinates, use Convert.degreesToServer(geopoint) to convert to map coordinates.)
	*
	* @type Map
	* @name getNumberOfMapRepetitions
	* @param obj: GeoPoint
	* @return Integer
	*/
	this.getNumberOfMapRepetitions = function(geoPoint) {
		var serverPair = new GeoPoint(geoPoint.x, geoPoint.y);
		var zoomLevel = this.getZoomFactor();
		
		// Bring (x,y) server pair to Map Port pixel pair
		var mapSize = 2*(-1)*config.zoomRanges[zoomLevel][0];
		
		this.compileOView();
		var oview = this.getOView();
		
		var aux = serverPair.x - oview.x - this.getDragPort().position().left - this.getMapPortPosition().x;
		serverPair.x = serverPair.x - oview.x - this.getDragPort().position().left - this.getMapPort().position().left;
		
		// calculate the number of times that the map repeated relative to our marker
		var numberOfMapRepetition;
		if (oview.x <= aux) {
			numberOfMapRepetition = parseInt((oview.x-aux)/mapSize, 10);
		} else {
			numberOfMapRepetition = 1+parseInt((oview.x-aux)/mapSize, 10);
		}
		
		return numberOfMapRepetition;
	};
	
	
	/*START CONSTRUCTOR*/	
	//The part of the map that is visible to the user
	viewPort = $('#'+el);
	viewPort.css({"zIndex" :"11", "background-color":"#EFEFE6", "-moz-user-select":"none", "overflow": "hidden", "position": "absolute"});
	
	this.viewPortTop    = viewPort.position().top;
	this.viewPortLeft   = viewPort.position().left;
	this.viewPortWidth  = viewPort.width();
	this.viewPortHeight = viewPort.height();
	
	this.config = {x: this.viewPortLeft, y: this.viewPortTop};
	var refP = this; // class scope (for events below)
	
	Event.addListener('mouseover', function (e){refP.setCursor('open');}, {}, viewPort);
	Event.addListener('mousedown', function (e){refP.setCursor('closed'); }, {}, viewPort);
	Event.addListener('mouseup', function (e){refP.setCursor('open');}, {}, viewPort);
	
	
	
	
	viewPort.append('<div id="dragPort" style="position: absolute; top: 0px; left: 0px; z-index: 10; border: 0px solid;"> </div>');
	//The draggable div in wich the map is placed
	dragPort = $('#dragPort');
	
	dragPort.append('<div id="mapPort" style="position: absolute; top: 0px; left: 0px; z-index: 8; border: 0px solid;"> </div>');
	//The div that contains the actual map tiles
	mapPort = $('#mapPort');

	// Single and Double right-click listener
	var clickTimer = {
			firstClick: false,
			time: null,
			x: null,
			y: null
		},
		timeOut;

	//Scroll handler
	var lastScroll = 0,
	    maxDelta = 0;

	Event.addListener("mousewheel", function (e, delta) {
		e.preventDefault();
		var relPos = viewPort.position(),
		mouseX = (e.pageX - relPos.left),
		mouseY = (e.pageY - relPos.top),
		currScroll = e.timeStamp,
		interval = 100,
		t=null;
		
		if(Math.abs(delta) > maxDelta) {
		    maxDelta = (Math.abs(delta) > 3 ? 3 : Math.abs(delta)); // get top speed instead of last tick's speed
		}
		
		var handleScr = function () {
			if(delta > 0) {
				refP.zoom({'refP': refP, 'x': mouseX, 'y': mouseY, 'delta': Math.round(maxDelta) });
				//Event.triggerEvent('scrollZoom');
			} else {
				refP.zoom({'refP': refP, 'x': mouseX, 'y': mouseY, 'delta': -Math.round(maxDelta) });
				//Event.triggerEvent('scrollZoom');
			}
			
			maxDelta = 0;
		};
		if((currScroll - lastScroll) < interval) {
			 clearTimeout(t);
		} else {
		    t = setTimeout(handleScr, interval); 
		}
	    lastScroll = currScroll;
	}, {}, viewPort);
	
	
	Event.addListener('dblclick', function (e){
		var relPos = viewPort.position();
		var mouseX = (e.pageX - relPos.left);
		var mouseY = (e.pageY - relPos.top);
		refP.zoom({'refP': refP, 'x': mouseX, 'y': mouseY, 'delta': 1});
	}, {}, dragPort);
	
	viewPort.rightMouseUp(function (e){
		e.preventDefault();
	});
	
	viewPort.rightMouseUp(function (e){
		Event.triggerEvent('mouseup', {}, refP.getViewPort());
		e.preventDefault();
		var relPos = viewPort.position(),
		mouseX = (e.pageX - relPos.left),
		mouseY = (e.pageY - relPos.top),
		interval = 300, // click interval
		entryTime = new Date().getTime();
		
		if(entryTime-clickTimer.time > interval) {
		    clickTimer.firstClick=false;
		}
		
		if(!clickTimer.firstClick) { // First right click - initiates timers
			clickTimer.firstClick = true;
			clickTimer.time = entryTime;
			clickTimer.x = mouseX;
			clickTimer.y = mouseY;
			
			var triggerContext = function() {
				Event.triggerEvent("contextClick", { mx: mouseX, my: mouseY});
			};
			
			timeOut = setTimeout(triggerContext, interval);
			
		} else {
		    clickTimer.firstClick = false;
		    if((entryTime-clickTimer.time <= interval) && (clickTimer.x == mouseX) && (clickTimer.y == mouseY)) {
				clearTimeout(timeOut);
				Event.triggerEvent("dblrightclick", { mx: mouseX, my: mouseY});
				refP.zoom({'refP': refP, 'x': mouseX, 'y': mouseY, 'delta': -1});
		    }
			
		    clickTimer.time = null;
		}
	});
	
	dragPort.append('<div id="zoomPort" style="position: absolute; top: 0px;width: 0px; height: 0px; left: 0px; z-index: 7; border: 0px solid;"> </div>');
	zoomPort = $('#zoomPort');	

	this.setOView();
	this.compileFill();
	
	mapPort.css({'top': oView.y +'px', 'left' : oView.x +'px'});
	percent = this.compilePercent();
	
	dragPort.append('<div id="markerPort" style="position: absolute; top: '+mapPort.position().top+'px; left: '+mapPort.position().left+'px; z-index: 11; border: 0px solid;"></div>');
	this.setMarkerPort($('#markerPort'));
	
	dragPort.append('<div id="drawPort" style="position: absolute; top: '+mapPort.position().top+'px; left: '+mapPort.position().left+'px; border: 0px solid;"></div>');
	this.setDrawPort($('#drawPort'));

	this.enablePan();
	
	Event.addListener('mousedown', function (e){ if (refP.getDragStatus()) {refP.enableDragFeatures();}}, {}, mapPort);
	Event.addListener('mouseup', function (e){ if (refP.getDragStatus()) {setTimeout(function(){refP.disableDragFeatures();}, 100);}}, {}, mapPort);
	
	this.lastCallOnDrag = 0;
	
	this.overlay = new Overlay(this);
	this.markers = new MarkerManager(this);
	this.overlay.addControl(new CopyrightControl(), 'bottom-right');
	this.setCursors();
/*
END CONSTRUCTOR
*/
}

jQuery.fn.exists = function(){
	if (typeof $(this).attr('Window')!= "undefined" || typeof $(this).attr('documentElement') == 'html'){		
		return true;
	} else {	
		if ($(this).html() === null) {
			return false;
		}
	}
	return true;
}
