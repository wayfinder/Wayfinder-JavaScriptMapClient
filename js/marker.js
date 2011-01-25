/**
* Class
* Marker is used to mark a position on the map. An example of its usage can be found under "Examples". </br>
* <br>
* <b>Events:</b><br/>
* You can listen to all default DOM events on a Marker, for example: 'click', 'dblclick', 'mouseover', 'mouseout', etc.</code><br />
*/

/**
* Marker is created at a given position with specified appearance. In order to use the marker, every Marker object 
* should be added to MarkerManager after it's created.<br/>
* <br>
* <b>Parameters:</b><br>
* MarkerOptions specify the appearance of a marker. It is a generic object with the following properties:</br>
* <br> 
* <li>icon: Icon</li>
* <br>
* <li>useSprites: Boolean (default: true)</li>
* <br>
* <li>visible: Boolean (default: true)</li>
* <br>
* <li>alwaysOnTop: Boolean (default: false)</li>
* 
* @type Constructor
* @name Marker
* @param geoPoint: GeoPoint, options: MarkerOptions
*/

function Marker(params) {
    var id = Math.floor(Math.random() * Math.pow(10, 8));
    var geoPoint = new GeoPoint(0,0);
    var options = {
        icon: '',
        useSprites: true,
        visible: true,
		alwaysOnTop: false
    };

    var infoWindow = {
        title: '',
        body: '',
        address: '',
        image: '',
        isVisible: false
    };

    var managerInst;

    /**
    * Returns the marker's position in geographical coordinates.
    *
    * @type Marker
    * @name getPosition
    * @return obj: GeoPoint
    */
    this.getPosition = function () {
        return geoPoint;
    };
    

    /**
    * Sets the marker's position to a new GeoPoint.
    *
    * @type Marker
    * @name setPosition
    * @param geoPoint: GeoPoint
    * @return None
    */
    this.setPosition = function (newGeoPoint) {
        geoPoint = newGeoPoint;
        this.render();
        if (this.isInfoWindowVisible() && InfoWindow.isVisible()) {
            this.openInfoWindow();
        }
    };

    
    /**
    * Returns the marker's id.
    *
    * @type Marker
    * @name getId
    * @return number
    */
    this.getId = function () {
        return id;
    };


    /**
    * Returns the marker's Icon
    *
    * @type Marker
    * @name getIcon
    * @return obj: Icon
    */
    this.getIcon = function () {
        return options.icon;
    };

    
    /**
    * Sets the marker's icon to a new 'icon'.
    *
    * @type Marker
    * @name setIcon
    * @param icon: obj: Icon
    * @return None
    */
    this.setIcon = function (newIcon) {
        options.icon.setIcon(newIcon);
		this.setMarkerDomObjectProperties();
    };

    
    /**
    * Sets the url of the Icon image to a new 'url'.
    *
    * @type Marker
    * @name setImageUrl
    * @param url: String
    * @return None
    */
    this.setImageUrl = function (url) {
        options.icon.image = url;
		this.setMarkerDomObjectProperties();
    };

    
    /**
    * \Internal
    * Returns true if the marker icon is obtained from sprites rather than just simple from url
    *
    * @type Marker
    * @name useSprites
    * @return Boolean
    */
    this.useSprites = function () {
        return options.useSprites === true;
    };

    
    /**
    * \Internal
    * Returns the marker options
    *
    * @type Marker
    * @name getOptions
    * @return obj: options
    */
    this.getOptions = function () {
        return options;
    };

    
    /**
    * Redefines the appearance of a Marker by setting new MarkerOptions. The definition of MarkerOptions can be found in Marker's constructor.
    *
    * @type Marker
    * @name setOptions
    * @param options: MarkerOptions
    * @return None
    */
    this.setOptions = function (newoptions) {
        if (typeof newoptions.managerInst != 'undefined') {
            managerInst = newoptions.managerInst;
        }

        if (typeof newoptions.useSprites != 'undefined') {
            options.useSprites = newoptions.useSprites;
        }

        if (typeof newoptions.icon != 'undefined') {
            if (this.getIcon() != '') {
                this.setIcon(newoptions.icon);
            } else {
                this.createNewIcon(newoptions.icon);
            }
        }

        if (typeof newoptions.visible != 'undefined') {
            options.visible = newoptions.visible;
        }
		
		if (typeof newoptions.alwaysOnTop != 'undefined') {
            options.alwaysOnTop = newoptions.alwaysOnTop;
        }

        var obj = this.getDomObject();
        var icon = options.icon;

        if (options.visible === true) {
            obj.css("display", "block");
        } else {
            obj.css("display", "none");
        }
		
		if (options.alwaysOnTop === true) {
            obj.css("zIndex", 12);
        } else {
            obj.css("zIndex", 11);
        }

//        obj.hover(
//        function() {
//            $(this).css("cursor", "pointer");
//        },
//        function() {
//            $(this).css("cursor", "default");
//        }
//        );

        if (this.useSprites()) {
            obj.css({"background-position": icon.spriteAnchor.x + "px " + icon.spriteAnchor.y + "px"});
        } else {
            obj.css({"background-position": ""});
        }

        obj.css({"background-image": 'url('+icon.image+')', "width": icon.size.width + "px", "height": icon.size.height + "px"});

    };

    
    /**
    * Hides the marker from the map.
    *
    * @type Marker
    * @name hide
    * @return None
    */
    this.hide = function () {
        options.visible = false;
        this.getDomObject().css({"display": "none"});
        this.closeInfoWindow();
    };
    

    /**
    * Shows the marker on the map.
    *
    * @type Marker
    * @name show
    * @return None
    */
    this.show = function () {
        options.visible = true;
        this.getDomObject().css({"display": "block"});
    };

    
    /**
    * Returns true if the marker is not visible on the map, false otherwise.
    *
    * @type Marker
    * @name isVisible
    * @return Boolean
    */
    this.isVisible = function () {
        return options.visible === true;
    };
    

    /**
    * Erases the marker from map and MarkerManager (it also deletes the DOM element).
    *
    * @type Marker
    * @name erase
    * @return None
    */
    this.erase = function () {
        if (this.isInfoWindowVisible()) {
            this.closeInfoWindow();
        }
        managerInst.remove(id);
        var domobj = this.getDomObject();
        domobj.remove();
	    domobj.empty();
    };


    /**
    * Returns the DOM object holding the marker.
    *
    * @type Marker
    * @name getDomObject
    * @return obj: DOM
    */
    this.getDomObject = function () {
        return $('#marker_'+this.getId());
    };


    /**
    * \Internal
    * Sets properties for the current marker DOM object.
    *
    * @type Marker
    * @name setMarkerDomObjectProperties
    * @param options: markerOptions
    * @return None
    */
    this.setMarkerDomObjectProperties = function () {
        var obj = this.getDomObject();
        var options = this.getOptions();
        var icon = options.icon;

        if (options.visible === true) {
            obj.css("display", "block");
        } else {
            obj.css("display", "none");
        }
		
		if (options.alwaysOnTop) {
            obj.css("zIndex", 12);
        } else {
            obj.css("zIndex", 11);
        }

        obj.hover(
        function() {
            $(this).css("cursor", "pointer");
        },
        function() {
            $(this).css("cursor", "default");
        }
        );

        if (this.useSprites()) {
            obj.css({"background-position": icon.spriteAnchor.x + "px " + icon.spriteAnchor.y + "px"});
        } else {
            obj.css({"background-position": ""});
        }

        obj.css({"background-image": 'url('+icon.image+')', "width": icon.size.width + "px", "height": icon.size.height + "px"});
    };


    /**
    * \Internal
    * Creates new Icon object according to marker options.
    *
    * @type Marker
    * @name createNewIcon
    * @param icon: obj: Icon
    * @return None
    */
    this.createNewIcon = function(icon) {
        options.icon = new Icon(icon);
    };


    /**
    * \Internal
    * Returns the marker position in pixels relative to the map port (has same position as marker port).
    *
    * @type Marker
    * @name getMarkerPositionRelToMapPort
    * @return obj: Object {x,y}
    */
    this.getMarkerPositionRelToMapPort = function() {
        var obj = this.getDomObject();
        var auxX;

        if (typeof options.icon.infoWindowAnchor.x == "number" && options.icon.infoWindowAnchor.x != -1000) {
            auxX = options.icon.infoWindowAnchor.x;
        } else {
            auxX = options.icon.size.width/2;
        }

        var xPos = obj.position().left + auxX;
        var yPos = obj.position().top + 0.1;

        return {x: xPos, y: yPos};
    };


    /**
    * Defines and binds an info window to a marker. It does not make the info window visible. To make it visible, use openInfoWindow after this .<br/></br> 
    * <b>Parameters:</b></br>
    * InfoWindowParams: {title: String, body: String, address: String, image: String}</br>
    *
    * @type Marker
    * @name bindInfoWindow
    * @param infoWindowParams: InfoWindowParams
    * @return None
    */
    this.bindInfoWindow = function(infoWindowParams) {
        if (typeof infoWindowParams.title != 'undefined') {
            infoWindow.title = infoWindowParams.title;
        }
        if (typeof infoWindowParams.body != 'undefined') {
            infoWindow.body = infoWindowParams.body;
        }
        if (typeof infoWindowParams.address != 'undefined') {
            infoWindow.address = infoWindowParams.address;
        }
        if (typeof infoWindowParams.image != 'undefined') {
            infoWindow.image = infoWindowParams.image;
        }
    };
    

    /**
    * This is where the info window is rendered and become visible.
    *
    * @type Marker
    * @name openInfoWindow
    * @return None
    */
    this.openInfoWindow = function() {
        managerInst.setActive(this.getId());

        var pos = this.getMarkerPositionRelToMapPort();
        InfoWindow.setPosition(pos.x, pos.y);

        infoWindow.isVisible = true;

        var infoWindowParams = infoWindow;
        InfoWindow.setTitle(infoWindowParams.title);
        InfoWindow.setBody(infoWindowParams.body);
        InfoWindow.setAddress(infoWindowParams.address);
        InfoWindow.setImage(infoWindowParams.image);

        InfoWindow.render();

        InfoWindow.show();
    };
	
	this.openInfoWindowWithoutTrigger = function() {
        managerInst.setActive(this.getId());

        var pos = this.getMarkerPositionRelToMapPort();
        InfoWindow.setPosition(pos.x, pos.y);

        infoWindow.isVisible = true;

        var infoWindowParams = infoWindow;
        InfoWindow.setTitle(infoWindowParams.title);
        InfoWindow.setBody(infoWindowParams.body);
        InfoWindow.setAddress(infoWindowParams.address);
        InfoWindow.setImage(infoWindowParams.image);

        InfoWindow.render();

        InfoWindow.showWithoutTrigger();
    };
    

    /**
    * Closes the info window.
    *
    * @type Marker
    * @name closeInfoWindow
    * @return None
    */
    this.closeInfoWindow = function() {
        if (this.isInfoWindowVisible()) {
            InfoWindow.hide();
        }
        infoWindow.isVisible = false;
        managerInst.setActive(null);
    };

    
    /**
    * Returns true if the info window binded to the marker is visible.
    *
    * @type Marker
    * @name isInfoWindowVisible
    * @return Boolean
    */
    this.isInfoWindowVisible = function() {
        return infoWindow.isVisible;
    };
    

    /**
    * \Internal
    * Sets the parameters for the marker info window.
    * infoWindowParams: <pre>Object {title:String, body:String, address:String, image:String}</pre>
    *
    * @type Marker
    * @name setInfoWindowParams
    * @param infoWindowParams: Object
    * @return None
    */
    this.setInfoWindowParams = function(infoWindowParams) {
        if (typeof infoWindowParams.title != 'undefined') {
            infoWindow.title = infoWindowParams.title;
        }
        if (typeof infoWindowParams.body != 'undefined') {
            infoWindow.body = infoWindowParams.body;
        }
        if (typeof infoWindowParams.address != 'undefined') {
            infoWindow.address = infoWindowParams.address;
        }
        if (typeof infoWindowParams.image != 'undefined') {
            infoWindow.image = infoWindowParams.image;
        }
    };


    /**
    * \Internal
    * Gets the parameters for the marker info window. The return value is an object of the form <pre>{title:String, body:String, address:String, image:String, isVisible:Boolean}</pre>
    *
    * @type Marker
    * @name getInfoWindowParams
    * @return Object
    */
    this.getInfoWindowParams = function () {
        return infoWindow;
    };
    

    /**
    * \Internal
    * Returns true if the marker is in the visible area (view port), false otherwise.
    *
    * @type Marker
    * @name isMarkerInViewPort
    * @return Boolean
    */
    this.isMarkerInViewPort = function () {
        var mapInstance = managerInst.getMapInst();
        var ggeoPoint = Convert.degreesToServer({geoPoint: this.getPosition(), refP: mapInstance});

        var centerCoord = new GeoPoint(mapInstance.viewPortWidth/2, mapInstance.viewPortHeight/2);
        var moveBy = new GeoPoint(parseInt(centerCoord.x - (ggeoPoint.x - mapInstance.getOView().x), 10), parseInt(centerCoord.y + (ggeoPoint.y - mapInstance.getOView().y), 10));
        if ((Math.abs(moveBy.x) <= mapInstance.viewPortWidth/2) && (Math.abs(moveBy.y) <= mapInstance.viewPortHeight/2)) {
            return true;
        }
        return false;
    };


    /**
    * \Internal
    * Sets the correct position for the marker in the markerPort according to its geographical coordinates.
    *
    * @type Marker
    * @name render
    * @return None
    */
    this.render = function () {
        if (typeof managerInst != "undefined") {
            var map = managerInst.getMapInst();

            var currentDomObj	= this.getDomObject();
            var currentPoint	= this.getPosition();
            var icon			= this.getIcon();
            var mapSize         = 2*(-1)*config.zoomRanges[map.getZoomFactor()][0];
            //var options         = this.getOptions();

            var geoPoint = Convert.degreesToServer({geoPoint: currentPoint, refP: map});

            map.compileOView();
            var oview = map.getOView();
            var aux = geoPoint.x - oview.x - map.getDragPort().position().left - map.getMapPortPosition().x;

            geoPoint.x = geoPoint.x - oview.x - map.getDragPort().position().left - map.getMapPort().position().left;
            geoPoint.y = geoPoint.y - oview.y + map.getDragPort().position().top + map.getMapPort().position().top;

            // calculate the number of times that the map repeated relative to our marker
            var numberOfMapRepetition;
            if (oview.x <= aux) {
                numberOfMapRepetition = parseInt((oview.x-aux)/mapSize, 10);
            } else {
                numberOfMapRepetition = 1+parseInt((oview.x-aux)/mapSize, 10);
            }
            // calculate the marker x coordinate relative to the viewport origin
            var markerXCoordinate = geoPoint.x - icon.mapAnchor.x + mapSize * numberOfMapRepetition;

            currentDomObj.css({"top":  parseInt(-geoPoint.y, 10)  - icon.mapAnchor.y + 'px', "left": parseInt(markerXCoordinate, 10) + 'px'});
        }
    };


    /* START CONSTRUCTOR */
    if (GarbageCollector.markers.length !== 0) {
        id = GarbageCollector.markers.pop().getId();
    }

    if (typeof params.options != 'undefined') {
        this.setOptions(params.options);
    }

    if (typeof params.geoPoint.x != 'undefined' && typeof params.geoPoint.y != 'undefined') {
        this.setPosition(params.geoPoint);
    }
    /* END CONSTRUCTOR */
}