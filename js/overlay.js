/**
 * \Internal
 * Class
 * Deals with manipulating map controls.<br/>
 * The 'map' parameter is a reference to the Map instance the overlay should be placed on.<br/>
 * Example:<br/>
 * <span>The Overlay class is already instantiated in the map class.<br/>
 * Adding a new control to the overlay:<br/>
 * 
 * map.overlay.addControl(new Control, 'bottom-left');<br/>
 * 
 * </span>
 *
 * @name Overlay
 * @param map: obj: Map
 */

function Overlay(map) {
	this.mi = map; // Map instance
	this.controls = []; // Collection of all the controls on the Overlay and their init. params; controls[n] = [ ControlInstance, params ]
	this.mi.getViewPort().prepend('<div id="overlayContainer"></div>');
	
	var scope = this;
	
	this.overlayContainer = $('#overlayContainer');
	this.overlayContainer.css({
		'z-index': '11',
		'width'  : 1,
		'height' : 1
	});
	
	Event.addListener('windowResized', function(p) { scope.repositionControls(); });
}

Overlay.prototype.constructor = Overlay;


/**
* \Internal
* Repositions the controls in the overlay which weren't positioned with a fixed (x,y) pair
* Handler for window resize.
*
* @type Overlay
* @name repositionControls
* @return None
*/
Overlay.prototype.repositionControls = function () {
	var i;
	for(i=0; i<this.controls.length; i++) {
		var el = $('#'+this.controls[i][0].getId());
		var newPos= this.validatePosition(this.controls[i][1], el);
		
		el.css({ 'left': newPos.x, 'top': newPos.y });
	}
};

/**
* \Internal
* Adds a control to the overlay.
*
* The control is an object sent through 'obj'. It must respect a certain Control "interface".<br/> 
* 'params' is optional and can be used to place the control. It can be: 
* <pre>'upper-left', 'upper-right', 'bottom-left', 'bottom-right'</pre> or 
* an object of type <pre>{ x: &lt;PixelsFromLeft&gt;, y: &lt;PixelsFromTop&gt; }</pre>
*
* The availeble controls are: <br />
* <pre> copyright: always visible </pre>
* <pre> distance scale: always visible  </pre>
* <pre> zoom controls: customizable</pre>
*
* @type Overlay
* @name addControl
* @param obj: obj: Control
* @param params?: Obj
* @return None
*/
Overlay.prototype.addControl = function(obj, params) {

	this.overlayContainer.append(obj.getElement());
	
	var controlContainer = $('#'+obj.getId());	
	controlContainer.css(obj.getStyle());
	
	var pos = this.validatePosition(params, controlContainer);
	
	controlContainer.css({
			'z-index': '12',
			'position': 'absolute',
			'top': pos.y,
			'left': pos.x
		});
	
	obj.setMapInstance(this.mi);
	obj.attachEvents();
	
	this.controls[this.controls.length] = [obj,params];
};


/**
* \Internal
* Validates a String type position and converts it to a pixel position
*
* @type Overlay
* @name validatePosition
* @param pos: Object
* @param item: obj: Control
* @return None
*/
Overlay.prototype.validatePosition = function (pos, item) {
	
	if (typeof(pos) == 'undefined') {
	    return { x: 40, y: 40};
	}

	switch(pos) {
		case 'upper-left':
			return { x: 10, y: 10 };
		
		case 'upper-right':
			return { x: this.mi.viewPortWidth - item.width() - 10, 
		             y: 10 };
		                              
		case 'bottom-left':  
			return { x: 10, 
		             y: this.mi.viewPortHeight - item.height() - 10 };
		                              
		case 'bottom-right':
			return { x: this.mi.viewPortWidth - item.width() - 10,
			         y: this.mi.viewPortHeight - item.height() - 10 };
									  
		case 'left':         
			return { x: 10, 
				     y: this.mi.viewPortHeight - item.height() / 2 };
									  
		case 'right':
			return { x: this.mi.viewPortWidth - item.width() - 10, 
					 y: (this.mi.viewPortHeight - item.height()) / 2 };
									  
		case 'top':
			return { x: (this.mi.viewPortWidth - item.width()) / 2, 
					 y: 10 };
									  
		case 'bottom':
			return { x: (this.mi.viewPortWidth - item.width()) / 2, 
				     y: this.mi.viewPortHeight - item.height() - 10 };
		
		default:
			return {
					x : typeof(pos.x)!='undefined' ? pos.x.toString() : 40,
					y : typeof(pos.y)!='undefined' ? pos.y.toString() : 40
				   };
	}
		
	return { x: 40, y: 40};
};