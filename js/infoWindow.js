/**
 * Class
 * InfoWindow is a singleton object used to manipulate the info window. There can be only one info window opened on the map
 * at any time. It can be binded to a Marker and opened on the map. An example of its usage can be found under "Examples".<br/>
 * <br>
 * <b>Events: </b><br/>
 * <li><code>'wndopen'</code> is fired when InfoWindow opens</li>
 * <li><code>'wndclose'</code> is fired when InfoWindow closes</li>
 *
 * @name InfoWindow
 */
 
var InfoWindow = {
	
	SIZE_NORMAL: 0, // default
	SIZE_MEDIUM: 1, // 350px
	SIZE_BIG: 2,    // 380px
	
	el: null,					// Container Element
	html: '',					// Content Html (if set by setHtml)
	header: '',					// Title
	subHeader: '',				// Address
	body: '',					// Body
	mi: null,				    // Map Instance
	txtClose: 'Close',			// Close Button Text
	defaultImage: 'img/transparent.gif',
	imgUrl: '',
	closeButton: true,
	position: { x: 40, y: 40 },
	anchorPoint: { x: 127, y: 0}, // tip of the InfoWindow
	
	style: {
		'width': '288px',
		'position': 'absolute',
		'display': 'none',
		'z-index': '13',
		'font-family': 'Arial',
		'font-size': '11',
		'color': '#666666',
		'padding': '0px 0px 18px 0px',
		'background': 'url(img/iw.png) center bottom no-repeat'
	},
	
	/**
	 * \Internal
	* Sets the innerHTML for the InfoWindow
	*
	* @type InfoWindow
	* @name setHtml
	* @return None
	*/
	
	setHtml: function(html) {
		this.html = html;
	},

	/**
	 * \Internal
	* Sets the URL of the image in the InfoWindow
	*
	* @type InfoWindow
	* @name setImage
	* @return None
	*/
	
	setImage: function(url) {
		if(typeof url == 'undefined' || url.length === 0) {
		    this.imgUrl = this.defaultImage;
		} else {
		    this.imgUrl = url;
		}
	},
	
	/**
	 * \Internal
	* Sets the title of the InfoWindow
	*
	* @type InfoWindow
	* @name setTitle
	* @return None
	*/
	
	setTitle: function(txt) {
		this.header = txt;
		this.html = null;
	},
	
	/**
	 * \Internal
	* Sets the subheader of the InfoWindow
	*
	* @type InfoWindow
	* @name setAddress
	* @return None
	*/
	
	setAddress: function(txt) {
		this.subHeader = txt;
		this.html = null;
	},
	
	/**
	 * \Internal
	* Sets the body of the InfoWindow
	*
	* @type InfoWindow
	* @name setBody
	* @return None
	*/
	
	setBody: function(txt) {
		this.body = txt;
		this.html = null;
		
		
	},
	
	/**
	* Returns the JQuery element holding the InfoWindow
	*
	* @type InfoWindow
	* @name getElement
	* @return JQuery
	*/
	
	getElement: function() {
		return this.el;
	},
	
	/**
	 * \Internal
	* Binds the InfoWindow to your map instance
	*
	* @type InfoWindow
	* @name bindTo
	* @param map: obj: Map
	* @return None
	*/
	
	bindTo: function(m) {
		this.mi = m;
				
		this.style = {
		'width': '287px',
		'position': 'absolute',
		'display': 'none',
		'z-index': '13',
		'font-family': 'Arial',
		'font-size': '11',
		'color': '#666666',
		'padding': '0px 0px 18px 0px',
		'background': 'url(img/iw.png) center bottom no-repeat'
	   };
	},
	
	/**
	 * \Internal
	* Sets the position of the InfoWindow
	*
	* @type InfoWindow
	* @name setPosition
	* @param px: Integer
	* @param py: Integer
	* @return None
	*/
	
	setPosition: function(px,py) {
		this.position = { x: px, y: py };
	},
	
	/**
	 * \Internal
	 * Get the position of the window's anchor point in the ViewPort.<br/>
	 * Returns an object with the structure <pre>{ x: &lt;Integer&gt;, y: &lt;Integer&gt; }</pre>
	 * 
	 * @type InfoWindow
	 * @name getViewportPosition
	 * @return Object
	 */
	
	getViewportPosition: function() {
		return {
			x: parseInt(this.mi.getViewPort().css('borderTopWidth'), 10) + 
			   (InfoWindow.position.x + InfoWindow.mi.getMarkerPort().position().left + InfoWindow.mi.getDragPort().position().left),
			y: parseInt(this.mi.getViewPort().css('borderLeftWidth'), 10) + 
			   (InfoWindow.position.y + InfoWindow.mi.getMarkerPort().position().top + InfoWindow.mi.getDragPort().position().top)
		};
	},
	
	/**
	 * \Internal
	* Shows the InfoWindow container
	*
	* @type InfoWindow
	* @name show
	* @return None
	*/
	
	show: function() {
		if(this.el !== null) {
			this.el.css('display', 'block');
			Event.triggerEvent('wndopen');
		} 
	},
	
	showWithoutTrigger: function() {
		if(this.el !== null) {
			this.el.css('display', 'block');
		} 
	},
	
	/**
	 * \Internal
	* Hides the InfoWindow container
	*
	* @type InfoWindow
	* @name hide
	* @return None
	*/
	
	hide: function() {
		if(this.el !== null) {
		    this.el.css('display', 'none');
		}
	},
	
	/**
	 * \Internal
	 * Check if the InfoWindow is visible.
	 * 
	 * @type InfoWindow
	 * @name isVisible
	 * @return Boolean
	 */
	
	isVisible: function() {
		if(this.el !== null) {
		    return this.el.css('display') == 'none' ? false : true;
		} else {
		    return false;
		}
	},
	
	/**
	 * \Internal
	* Renders the image and resizes it keeping proportions.
	*
	* @type InfoWindow
	* @name renderImage
	* @return None
	*/
	
	renderImage: function() {
//		var img = $('#wndImg'),
//			tempImg = new Image(),
//			maxh = 75,
//			maxw = 75;
			
		var img = $('#wndImg');

		if(this.imgUrl == this.defaultImage) {
		    img.hide();
		} else {
		    img.attr('src', this.imgUrl);
		}
	},
	
	/**
	 * \Internal
	* Renders the element. Use this when you modify the contents or position of the InfoWindow.
	*
	* @type InfoWindow
	* @name render
	* @return None
	*/
	
	render: function() {
		
		if(this.mi === null) {
		    alert('Please bind window to map instance, ie: InfoWindow.bindTo(map)');
		}
		
		if((this.el === null) && ($('#wndContainer').length === 0)) {
		    this.createWindow();
		}

		$('#wndHeader').html(this.header);
		$('#wndSubHeader').html(this.subHeader);
		$('#wndBody').html(this.body);
//		this.renderImage();
		
		this.anchorPoint.y = this.el.height() + 17;
		
		this.el.css({ 
			'left': this.position.x - this.anchorPoint.x,
			'top' : this.position.y - this.anchorPoint.y
		}); 
		
		this.renderCustomHtml();
	},
	
	/**
	* Rounds the corners of the info window. This method must be called after the info window is rendered, 
	* i.e. after Marker.openInfoWindow() is called.</br>
	* <br>
	* <b>Parameters:</b></br>
	* 'pixels' defines the radius of the round corner by pixel. The default value is 20 pixel. 
	*
	* @type InfoWindow
	* @name roundCorners
	* @param pixels :String
	* @return None
	*/	
	
	roundCorners: function(pixels) {
		if(typeof pixels == 'undefined') {
		    pixels = "20px";
		}
		
		$('#infoWindowTop').corner({
			  tl: { radius: 16 },
			  tr: { radius: 16 },
			  bl: { radius: 16 },
			  br: { radius: 16 },
			  antiAlias: false,
			  autoPad: false,
			  validTags: ["div"] })
		.css({
			'bottom': '15px',
			'width': ($('#infoWindowTop').width() + 33).toString() + 'px'
		});

		$('#wndHeader').css('padding-left', '10px');
		$('#wndSubHeader').css('padding-left', '10px');
		$('#wndBody').css('padding-left', '10px');
		$('#wndContainer').css('background-image', 'url('+this.mi.getApiPath()+'img/iw_r.png)');
		
		$('#wndClose').css({
			'right': '8px',
			'top': '0px'
		});
		
		this.render();
	},

	/**
	* Set the width of the Info Window
	* <br>
	* <b>Parameters:</b></br>
	* 'size' can be InfoWindow.SIZE_NORMAL, InfoWindow.SIZE_MEDIUM, InfoWindow.SIZE_BIG (or 0, 1, 2)
	*
	* @type InfoWindow
	* @name setSize
	* @param size :Integer
	* @return None
	*/	
	
	setSize: function(size) {
		var containerWidth = 287;
		var topWidth = 230;
		
		switch(size) {
			case InfoWindow.SIZE_NORMAL:
				this.anchorPoint.x = 127;
				break;
				
			case InfoWindow.SIZE_MEDIUM:
				topWidth = 350;
				containerWidth = 410;
				this.anchorPoint.x = 187;
				break;
				
			case InfoWindow.SIZE_BIG:
				topWidth = 380;
				containerWidth = 425;
				this.anchorPoint.x = 195;
				break;
		}
		
		$('#wndContainer').css('width', containerWidth.toString() + 'px');
		$('#infoWindowTop').css('width', topWidth.toString() + 'px');
		
		this.render();
	},
	
	/**
	 * \Internal
	* Renders the element. Use this when you modify the layout and structure of the InfoWindow using setHtml()
	*
	* @type InfoWindow
	* @name renderCustom Html
	* @return None
	*/
	
	
	renderCustomHtml: function() {
		if((this.el === null) && ($('#wndContainer').length === 0)) {
		    this.createWindow();
		}

		if (this.html !== null) {
		    
		    this.el.html(this.html);
		    this.anchorPoint.y = this.el.height() + 17;

		    this.el.css({
		    'left': this.position.x - this.anchorPoint.x,
		    'top' : this.position.y - this.anchorPoint.y
		    });
		}
	},
	
	/**
	* \Internal
	* Creates and initializes the DOM element
	*
	* @type InfoWindow
	* @name createWindow
	* @return None
	*/
	
	createWindow: function() {
		var referrer = this;
		var dp = this.mi.getMarkerPort();
		dp.append('<div id="wndContainer"></div>');
		this.el = $('#wndContainer');
		this.el.css(this.style);
		this.el.append('<div id="infoWindowTop">' +
		                  '<div id="wndHeader"></div>'+
		                  '<div id="wndSubHeader"></div>' +
                          '<div id="wndBody"></div>'+
                          '<div id="wndClose">&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;</div>'+
                      '</div>');
		
		// attach events
        Event.addListener('dblclick', function(params){ referrer.hide(); }, {}, referrer.mi.getDragPort());
        Event.addListener('dblrightclick', function(params){ referrer.hide(); });
		
		$('#wndClose').click(function() {
			Event.triggerEvent('wndclose');
			referrer.hide();
		});
	}	
};