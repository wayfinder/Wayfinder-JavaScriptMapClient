/**
 * Class
 * It is a utility class used to convert coordinates between different formats.
 *
 * @name Convert
 */

var Convert = {

    /**
     * \Internal
     * Returns a string formatted as 'degrees minutes seconds type'. <br/>
     * 'params' is a general object with the following attributes: <pre>{value: Float, type: String}</pre> 
     * Type can be either 'lat' or 'lon'.
     *
     * @type Convert
     * @name mc2ToDegreesMinutesSeconds
     * @params: Object
     * @return String
     */
    
    mc2ToDegreesMinutesSeconds: function (params) {        
        var lat;
        var lon;
        
        if (params.value < 0 && params.type == "lat") {
            lat = "S"; 
		} else {
			lat = "N";
        }
        if (params.value < 0 && params.type == "lon") {
            lon = "V"; 
	    } else {
			lon = "E";
        }
        
        var degrees = Math.abs(params.value) / config.mc2factor;
        var coords = [];
        
        coords.d = parseInt(degrees, 10);        
        var minutes = Math.abs(((degrees - coords.d)*60)).toString();        
        if (minutes.substring(0,1) > 6) {
            coords.m = minutes.substring(0,1);
        } else {
            coords.m = minutes.substring(0,2);        
        }
        var seconds = Math.abs(((minutes - parseInt(minutes, 10))*60)).toString();
        if (seconds.substring(0,1) > 6) {
            coords.s = seconds.substring(0,1); 
        } else {
            coords.s = seconds.substring(0,2);
        }

        if (params.type == "lat") {
            return coords.d+"&#176; "+parseInt(coords.m, 10)+"\" "+parseInt(coords.s, 10)+"' "+lat;
        } else if (params.type == "lon") {
            return coords.d+"&#176; "+parseInt(coords.m, 10)+"\" "+parseInt(coords.s, 10)+"' "+lon;
        }

    },

    /**
     * \Internal
     * Returns the mc2 Float value obtained by converting from degrees minutes seconds format. 
     * 'params' is a general object with the following attributes: <pre>{deg: Integer, min: Integer, sec: Integer}</pre>
     *
     * @type Convert 
     * @name degreesMinutesSecondsToMc2
     * @param params: Object
     * @return Float
     */
    
    degreesMinutesSecondsToMc2: function (params) {
        var valDeg = parseInt(Math.abs(params.deg) * config.mc2factor, 10);
        var valMin = parseInt(Math.abs(params.min) * config.mc2factor / 60, 10);
        var valSec = parseInt(Math.abs(params.sec) * config.mc2factor / 3600, 10);

        var value = valDeg + valMin + valSec;

        if (params.deg < 0) {
            value = -value;
        }

        return value;
    },
    
    /**
     * \Internal
     * Returns the radians Float value obtained by converting from mc2 format.
     *
     * @type Convert
     * @name mc2ToRadians
     * @param mc2Value: Float
     * @return Float
     */
    
    mc2ToRadians: function (mc2Value) {
        //alert("MC2 to Rad");
		return mc2Value * config.mc2RadianFactor;
	},
	
	/**
	 * \Internal
     * Converts coordinates from WGS84 degrees format(World Geodetic System - standard format) to WGS84 radians.
     *
     * @type Convert 
     * @name wgs84ToRadians
     * @param wgs84Value
     * @return Float
     */
	
	wgs84ToRadians: function(wgs84Value) {
		return Convert.mc2ToRadians(Convert.wgs84ToMc2(wgs84Value));
	},
	
	/**
	 * \Internal
     * Returns the mc2 Float value obtained by converting from radians format.
     *
     * @type Convert
     * @name radiansToMc2    
     * @param radianValue: Float
     * @return Float
     */
	
	radiansToMc2: function (radianValue) {
	    //alert("Rad to MC2");
		return radianValue * (1/config.mc2RadianFactor);
	},
		
	/**
	 * \Internal
     * Converts WGS84 degrees (World Geodetic System - standard format) to mc2 coordinates.
     *
     * @type Convert 
     * @name wgs84ToMc2    
     * @param degreeValue: Float
     * @return Integer
     */
	
	wgs84ToMc2: function (wgs84Degree) {
	    var mc2Value = wgs84Degree * config.mc2factor;
	    return Math.round(mc2Value);
	},

	/**
	 * \Internal
     * Returns the WGS84 (World Geodetic System - standard format) degrees value obtained by converting from mc2 format.
     *
     * @type Convert 
     * @name mc2ToWgs84    
     * @param mc2Coordinate: Float
     * @return Float
     */

	mc2ToWgs84: function (mc2Coordinate) {
	    var wgs84 = mc2Coordinate / config.mc2factor;
	    return wgs84.toFixed(10);
	},
		
	/**
	 * \Internal
     * Returns the mc2 pair of coordinates of type GeoPoint obtained by converting from server pair of coordinates. 
     * 'params' is a general object with the following attributes: <pre>{geoPoint: obj: GeoPoint, refP: obj: Map}</pre>
     * 
     * @name xyCoordToMc2
     * @type Convert
     * @param params: Object
     * @return obj: GeoPoint
     */
	
	xyCoordToMc2: function (params) {
		params.geoPoint.x = params.refP.returnRealX(params.geoPoint.x);
		
		var tempLon = params.geoPoint.x * 2 * Math.PI / (params.refP.getTotalTiles().x * params.refP.getTileSize());
		var tempLat = Math.atan(Math.sinh(params.geoPoint.y * 2 * Math.PI / (params.refP.getTotalTiles().x * params.refP.getTileSize())));
				
		var mc2Lat = tempLat * config.mc2factor * 180 / Math.PI ; //must be 180 here - not tileSize
		var mc2Lon = tempLon * config.mc2factor * 180 / Math.PI ; //must be 180 here - not tileSize
		
		return new GeoPoint(mc2Lon, mc2Lat, "mc2");
	},
	
	/**
	 * \Internal
     * Returns the server pair of coordinates of type GeoPoint obtained by converting from mc2 pair of coordinates.</br>
     * 'params' is a general object with the following attributes: <pre>{geoPoint: obj: geoPoint, refP: obj: Map, zoom: Integer - optional}</pre>
     * 
     * @name mc2ToXyCoord
     * @type Convert     
     * @param params: Object
     * @return obj: GeoPoint
     */
	
	mc2ToXyCoord: function (params) {
		var lonXRad = Convert.mc2ToRadians(params.geoPoint.x);
		var latYRad = Convert.mc2ToRadians(params.geoPoint.y);
		var totalTiles;
		
		if(typeof params.zoom != 'undefined') {
			totalTiles = params.refP.returnTotalTiles(params.zoom);
		} else {
			totalTiles = params.refP.returnTotalTiles(params.refP.getZoomFactor());
		}
		
		var posLon = ( lonXRad * totalTiles.x * params.refP.getTileSize() ) / ( 2 * Math.PI);
		var posLat = Math.log( Math.abs(Math.tan(latYRad) + 1/Math.cos(latYRad)) ) * totalTiles.x * params.refP.getTileSize() / (2 * Math.PI);
		
		return new GeoPoint(posLon, posLat, "map", params.refP);
	},
	
	
	/**
	 * \Internal
     * Returns the mc2 pair of coordinates of type GeoPoint obtained by converting from viewPort pair of coordinates. 
     *
     * 'params' is a general object with the following attributes: 
     * <pre>{geoPoint: obj: GeoPoint, refP: obj: Map}</pre>
     *
     * @type Convert 
     * @name mousePositionToMc2    
     * @param params: Object
     * @return obj: GeoPoint
     */

	mousePositionToMc2: function (params) {
		params.refP.compileOView();
		var newX = params.geoPoint.x - params.refP.viewPortLeft;
		var newY = params.geoPoint.y - params.refP.viewPortTop;
		
		params.geoPoint.x = newX + params.refP.getOView().x;
		params.geoPoint.y = (-1)*newY + params.refP.getOView().y;

		return Convert.xyCoordToMc2({geoPoint: params.geoPoint, refP: params.refP});
	},
	
	
	/**
	 * \Internal
	 * Converts from WGS84 to server set of coordinates.<br/>
	 * 'params' is a general object with the following attributes:
	 * <pre>{geoPoint: obj: GeoPoint, zoom: Integer - optional, refP: obj: Map}</pre>
	 *
	 * @type Convert 
     * @name degreesToServer 
     * @param params: Object
     * @return obj: GeoPoint
	 */	
	degreesToServer: function (params) {
	    var degreesToServer = Convert.mc2ToXyCoord({geoPoint: ({x: Convert.wgs84ToMc2(params.geoPoint.x), y: Convert.wgs84ToMc2(params.geoPoint.y)}), refP: params.refP, zoom: params.zoom});
	    
	    return new GeoPoint(degreesToServer.x, degreesToServer.y, "map", params.refP);
	},
	
	
	/**
	 * \Internal
	 * Returns the top and left positions in the mapPort for the given geopoint (wgs84 degrees). 
	 * The params.distance parameter is measured in pixels and can be used if for example other elements on the map depend on the geoPoint. 
	 * For instance, if the geoPoint is the center of a circle the circle shouldn't be moved into the next world if the 
	 * geoPoint is out of the view port, but should still be displayed until the whole circle is out of the view port. 
	 * Here the distance should be equal to the circle radius (converted to pixels).
	 * 'params' is a general object with the following attributes:
	 * <pre>{geoPoint: obj: GeoPoint in wgs84, map: obj: Map, zoom: Integer - optional, distance: Integer - optional}</pre>
	 *
	 * @type Convert 
     * @name wgsToMap 
     * @param params: Object
     * @return obj: Object {top, left}
	 */	
	wgsToMap: function(params) {
	    var map = params.map;
	    var extraDist = (typeof params.distance == 'undefined') ? 0 : params.distance;
	    var numberOfMapRepetition;
	    
		// Convert traditional lat/lon to server (x,y) pair
		var serverPair = Convert.degreesToServer({ geoPoint: { x: params.geoPoint.x, y: params.geoPoint.y }, refP: params.map, zoom: map.getZoomFactor()  });
		
		var zoomLevel = (typeof params.zoom == 'undefined') ? map.getZoomFactor() : params.zoom;
		
		// Bring (x,y) server pair to Map Port pixel pair
		var mapSize = 2*(-1)*config.zoomRanges[zoomLevel][0];
        //var geoPoint = Convert.degreesToServer({geoPoint: this.center, refP: map});

        map.compileOView();
        var oview = map.getOView();
        
        var aux = serverPair.x + extraDist - oview.x - map.getDragPort().position().left - map.getMapPortPosition().x;

        serverPair.x = serverPair.x - oview.x - map.getDragPort().position().left - map.getMapPort().position().left;
        serverPair.y = serverPair.y - oview.y + map.getDragPort().position().top + map.getMapPort().position().top;

        var xCoordinate;
        
        if (params.path != "undefined" && params.path) {
            xCoordinate = serverPair.x;
        } else {
            // calculate the number of times that the map repeated relative to our marker
            if (oview.x <= aux) {
                numberOfMapRepetition = parseInt((oview.x-aux)/mapSize, 10);
            } else {
                numberOfMapRepetition = 1+parseInt((oview.x-aux)/mapSize, 10);
            }

            // calculate the x coordinate relative to the viewport origin
            //xCoordinate = map.returnRealX(serverPair.x);
            xCoordinate = serverPair.x + mapSize * numberOfMapRepetition;
        }

        var ytop =  parseInt(-serverPair.y, 10);
        var xleft = parseInt(xCoordinate, 10);

        return {top:ytop, left:xleft};
	},
	
	
	/**
	 * \Internal
	 * Returns the top and left positions in the mapPort for the given geopoint in map coordinates. 
	 * The params.distance parameter is measured in pixels and can be used if for example other elements on the map depend on the geoPoint. 
	 * For instance, if the geoPoint is the center of a circle the circle shouldn't be moved into the next world if the 
	 * geoPoint is out of the view port, but should still be displayed until the whole circle is out of the view port. 
	 * Here the distance should be equal to the circle radius (converted to pixels).
	 * 'params' is a general object with the following attributes:
	 * <pre>{geoPoint: obj: GeoPoint in map coordinates, map: obj: Map, zoom: Integer - optional, distance: Integer - optional}</pre>
	 *
	 * @type Convert 
     * @name mapCoordToTopLeft 
     * @param params: Object
     * @return obj: Object {top, left}
	 */	
	mapCoordToTopLeft: function(params) {
	    var map = params.map;
	    var extraDist = (typeof params.distance == 'undefined') ? 0 : params.distance;
	    var numberOfMapRepetition;
	    
		// Convert traditional lat/lon to server (x,y) pair
		var serverPair = new GeoPoint(params.geoPoint.x, params.geoPoint.y);
		
		var zoomLevel = (typeof params.zoom == 'undefined') ? map.getZoomFactor() : params.zoom;
		
		// Bring (x,y) server pair to Map Port pixel pair
		var mapSize = 2*(-1)*config.zoomRanges[zoomLevel][0];

        map.compileOView();
        var oview = map.getOView();
        
        var aux = serverPair.x + extraDist - oview.x - map.getDragPort().position().left - map.getMapPortPosition().x;

        serverPair.x = serverPair.x - oview.x - map.getDragPort().position().left - map.getMapPort().position().left;
        serverPair.y = serverPair.y - oview.y + map.getDragPort().position().top + map.getMapPort().position().top;
        
        // calculate the number of times that the map repeated relative to our marker
        if (oview.x <= aux) {
            numberOfMapRepetition = parseInt((oview.x-aux)/mapSize, 10);
        } else {
            numberOfMapRepetition = 1+parseInt((oview.x-aux)/mapSize, 10);
        }

        var xCoordinate;
        if (params.path != "undefined" && params.path) {
            xCoordinate = serverPair.x;
        } else {
            // calculate the x coordinate relative to the viewport origin
            xCoordinate = serverPair.x + mapSize * numberOfMapRepetition;
        }

        var ytop =  parseInt(-serverPair.y, 10);
        var xleft = parseInt(xCoordinate, 10);

        return {top:ytop, left:xleft, repetitions: numberOfMapRepetition, size: mapSize };
	}

};


/**
* \Internal
* Computes the hyperbolic sine
*
* @type Math
* @name sinh
* @param val: Number
* @return Float
*/

Math.sinh = function(val){
    var res;
    
    res = Math.exp(val);
    res = (res - 1 / res) / 2;
    return res;
};
