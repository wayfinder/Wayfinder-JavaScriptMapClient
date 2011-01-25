/**
 * Class
 * ContextMenu can be used to add a Right Click menu on the map. An example of its usage can be found under "Examples". </br>
 */

 /**
 * Creates an empty Right Click menu.
 *
 * @type Constructor
 * @name ContextMenu
 */

function ContextMenu() {
	this.opts = 0;
	this.position = { x: 0, y: 0};
	
	this.setElement('<div id="'+this.getId()+'"">' +
                    '<ul id="cMenuItems"></ul>'+
					'</div>');
					
	this.setStyle({
			'display': 'none',
			'border': '1px solid #999999',
			'background': 'white',
			'filter': 'alpha(opacity=90)',
			'opacity': '0.9'
		});
}

ContextMenu.prototype = new Control('contextMenu');

/**
* Inserts an option to the menu.<br/>
* <br>
* <b>Parameters:</b></br>
* <li>'name' defines the option's label.<br/></li>
* <br>
* <li>'handler' defines the function to be called when the option is clicked. </br>
* <br>
* When a right click occurs on the map, the screen coordinates 
* (relative to the map's container) and geographic coordinates (in WGS84 degrees) of the location clicked will be captured, in the form of 
* <code>pixel:{x, y}</code> and <code>wsg:{lon, lat}</code>. They can be retrieved by the handler as: <code>p.pixel.x, p.pixel.y, p.wsg.lon, 
* p.wsg.lat.</br></li>
* <br>
* <li>'icon'(optional) defines the URL to an image that shows in front of the option's label. Maximum size is 16x16 pixel.</li>
*
* @type ContextMenu
* @name addOption
* @param name: String
* @param handler: Function
* @param icon: String
* @return None
*/

ContextMenu.prototype.addOption = function(name, handler, icon) {
	var scope = this;
	
	this.opts++;
	
	$('#cMenuItems').append('<li><a id="opt'+this.opts+'" class="menuNormal">'+name+'</a></li>');
	$('#cMenuItems a:last')
		.mouseover(function() { $(this).addClass('menuHover'); })
		.mouseout(function() { $(this).removeClass('menuHover'); });
	
	if(typeof icon != 'undefined') {
		var img = new Image(),
			item = $('#opt'+this.opts);
		img.src = icon;
		
		$(img).load(function() {
			//Dynamicly calculate background-position according to image size (15x15 max)
			var offsetX = parseInt((18 - img.width)/2, 10);
			var offsetY = parseInt((23 - img.height)/2, 10);

			item.css({
				'background-image': 'url('+icon+')',
				'background-repeat': 'no-repeat',
				'background-position': offsetX+'px '+offsetY+'px'
			});
		});
	}
	
	$('#opt'+this.opts).click(function() {
		handler({ pixel: scope.getPosition(), wgs: scope.getLatLon() });
	});
};

/**
* Adds the following options with default functionalities: Zoom In, Zoom Out, Center Map.
*
* @type ContextMenu
* @name addBasicFunctionality
* @return None
*/


ContextMenu.prototype.addBasicFunctionality = function() {
	var scope = this;
	
	this.addOption('Zoom In', function(p) {
		scope.mi.zoom({ 'refP': scope.mi, 'delta': 1, 'x': p.pixel.x, 'y': p.pixel.y});
	}, '../plus_small.png');
	
	this.addOption('Zoom Out', function(p) {
		scope.mi.zoom({ 'refP': scope.mi, 'delta': -1, 'x': p.pixel.x, 'y': p.pixel.y});
	}, '../minus_small.png');
	
	this.addOption('Center Map', function(p) {
		scope.mi.panAndCenter(new GeoPoint(p.wgs.lon, p.wgs.lat), scope.mi.getZoomFactor());
	});
};

/**
* Adds a break in the menu list
*
* @type ContextMenu
* @name addBreak
* @return None
*/

ContextMenu.prototype.addBreak = function() {
	$('#cMenuItems').append('<li class="break"><hr /></li>');
};

/**
* \Internal
* Sets the position of the menu in pixels on viewport
*
* @type ContextMenu
* @name setPosition
* @param x: Integer
* @param y: Integer
* @return None
*/

ContextMenu.prototype.setPosition = function(x,y) {
	var viewportHeight = this.mi.viewPortHeight,
		viewportWidth = this.mi.viewPortWidth,
		menuHeight = $('#'+this.getId()).height(),
		menuWidth = $('#'+this.getId()).width(),
		menuX = x,
		menuY = y;

	if(menuX > (viewportWidth - menuWidth - 2)) {
	    menuX = menuX - menuWidth - 7;
	}
	if(menuY > (viewportHeight - menuHeight - 2)) {
	    menuY = menuY - menuHeight - 2;
	}

	this.position.x = x;
	this.position.y = y;

	$('#'+ this.getId()).css({
		'left': menuX,
		'top' : menuY
	});
};

/**
* \Internal
* Get the position in pixels for the menu
*
* @type ContextMenu
* @name getPosition
* @return obj: Object {x,y}
*/

ContextMenu.prototype.getPosition = function() {
	return this.position;
};

/**
* \Internal
* Returns the WSG84 latitude/longitude position of the menu
*
* @type ContextMenu
* @name getLatLon
* @return obj: Object {lon, lat}
*/

ContextMenu.prototype.getLatLon = function() {
	var xy = this.getPosition();
	var mc2;
	
	this.mi.compileOView();
	var coords = {'x': (this.mi.getOView().x + xy.x), 'y': (this.mi.getOView().y - xy.y)};
	mc2 = Convert.xyCoordToMc2({geoPoint: coords, refP: this.mi});
	
	
	return { lon: Convert.mc2ToWgs84(mc2.x), lat: Convert.mc2ToWgs84(mc2.y) };
};

/**
* \Internal
* Shows the menu
*
* @type ContextMenu
* @name showMenu
* @return None
*/

ContextMenu.prototype.showMenu = function() {
	$('#'+ this.getId())
		.hide()
		.fadeIn('fast');
};

/**
* \Internal
* Hides the menu
*
* @type ContextMenu
* @name hideMenu
* @return None
*/

ContextMenu.prototype.hideMenu = function() {
	$('#'+ this.getId()).fadeOut('fast');
};

ContextMenu.prototype.attachEvents = function() {
	var scope = this;

	Event.addListener("contextClick", function(params) {
		scope.setPosition(params.edata.mx, params.edata.my);
		scope.showMenu();
	});
	
	this.mi.getViewPort().click(function() {scope.hideMenu();});
	
	Event.addListener('onDrag', function(params){ scope.hideMenu(); });
	Event.addListener('panMap', function(params){ scope.hideMenu(); });
	Event.addListener('zoom', function(params){ scope.hideMenu(); });
};