/**
 * Class
 * Control is an interface. It should be inherited when creating custom map controls, which could be added to the map afterwards. An 
 * example of its usage can be found under "Examples".<br/>
 */

/**
 *<b>Example: </b><br/>
 * Create a custom control: CopyrightControl.</br>
 * <br>
 * <li>Step 1: Inherits Control and sets a DOM ID for it</li>
 * <code>CopyrightControl.prototype = new Control('CopyCtrl');</code><br/>
 * <br>
 * <li>Step 2: Constructs the CopyrightControl, where its content and style are defined (mandatory)</li>
 * <code>function CopyrightControl() {<br/>
 *    this.setElement('&lt;div id="'+this.getId()+'"&gt;Copyright 2009 Wayfinder AB&lt;/div&gt;');<br/>
 *    this.setStyle({'height': '16px', 'width' : '250px'});}<br/></code>
 * <br>
 * <li>Step 3: Overrides Control's abstract method </li>
 * <code>CopyrightControl.prototype.attachEvents = function () {<br/>
 *       this.setText('bla'); }</code><br/>
 * <br>
 * <li>Step 4: Defines CopyrightControl's own method...</li>
 * <code>CopyrightControl.prototype.setText = function (text) { ... }</code></br>
 * 
 * @type Constructor
 * @name Control
 * @param ID: String
 */

function Control(id) {
	if(typeof(id) == 'undefined') {
	    alert('Please pass a DOM ID to the new Control Class instance.');
	}
	this.mi = null; // Map Instance - inherited by all controls
	this.idControl = id;
	this.styling = null;
	this.html = null;
}

/**
* \Internal
* Set the Map Instance which the Overlay is bound to.
*
* @type Control
* @name setMapInstance
* @param m: obj: Map
* @return None
*/
Control.prototype.setMapInstance = function (m) {
	this.mi = m;
};

/**
* Sets the HTML content for the new Control. This method is mandatory.
*
* @type Control
* @name setElement
* @param html: String
* @return None
*/
Control.prototype.setElement = function (html) { 
    this.html = html;
};

/**
* Sets the style of the control's container with a CSS object of type { property: value, ... }. Properties for Height and Width 
* are mandatory to set.
*
* @type Control
* @name setStyle
* @param s: Object
* @return None
*/
Control.prototype.setStyle = function (s) {
    this.styling = s;
};

/**
* Returns the DOM element ID of the control's container
*
* @type Control
* @name getId
* @return String
*/
Control.prototype.getId = function() {
    return this.idControl;
};

/**
* \Internal
* Return the HTML to be added to the Overlay
*
* @type Control
* @name getElement
* @return String
*/
Control.prototype.getElement = function() {
    if(this.html !== null) {
        return this.html;
    }  else {
        alert('Please use setElement to set your elements content!'); 
    }
};

/**
* \Internal
* Return a CSS object of type { property: value, ... } for any extra styling to the main container
* Must contain the height and width of the control.
*
* @type Control
* @name getStyle
* @return Object
*/
Control.prototype.getStyle = function() {
	if(this.styling !== null) { 
		return this.styling;
	} else {
		alert('Please use setStyle to set your elements style (width and height)!');
	}
};


/**
* An abstract method, which should be overriden by the custom control. It will be called after the control is added to the map.
*
* @type Control
* @name attachEvents
* @return None
*/
Control.prototype.attachEvents = function() {};