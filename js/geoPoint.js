/**
 * Class
 * GeoPoint defines a location with its latitude and longitude coordinates (in WGS84 degrees).
 */

 /**
 * Defines a GeoPoint. </br>
 * <br>
 * <b>Parameters:</b></br>
 * <br>
 * <li>'lon' specifies longitude of the location in WGS84 degrees.</li>
 * <li>'lat' specifies latitude of the location in WGS84 degrees.</li></br>
 * <br>
 * <b>Example:</b></br>
 * <br>
 * The following example defines a location in Copenhagen:</br>
 * <code>var gpt = new GeoPoint(12.590, 55.657));</code>
 * 
 *  
 * @name GeoPoint
 * @type Constructor
 * @param lon: number
 * @param lat: number
 */

function GeoPoint(newLon, newLat, coordSystem, mapInstance) {
	var cSystem;
	var mapInst;

    if (typeof coordSystem != "undefined") {
        var coordString = (coordSystem.toString()).toUpperCase();
        if (coordString == "MC2") {
            cSystem = coordString;
        } else if (coordString == "MAP" && typeof mapInstance != "undefined" && typeof mapInstance.centerMap == "function") {
            cSystem = coordString;
            mapInst = mapInstance;
        } else {
            return false;
        }
    }
 
    this.x = newLon;
	this.y = newLat;
		
	/**
	 * Returns the GeoPoint's latitude in WGS84 degrees.
     *
     * @type GeoPoint
     * @name getLat     
     * @return number
     */
	this.getLat = function() {
	    var lat;
	    if (typeof cSystem != "undefined") {
	        if (cSystem == "MC2") {
	            lat = Convert.mc2ToWgs84(this.y);
	        } else {
	            var mc2coord = Convert.xyCoordToMc2({geoPoint: {x:mapInst.returnRealX(this.x), y:this.y}, refP: mapInst});
	            lat = Convert.mc2ToWgs84(mc2coord.y);
	        }
	    } else {
	        lat = this.y;
	    }
	    
	    return lat;
	};
	
	/**
	 * Returns the GeoPoint's longitude in WGS84 degrees.
     *
     * @type GeoPoint
     * @name getLon     
     * @return number
     */
	this.getLon = function() {
	    var lon;
	    
	    if (typeof cSystem != "undefined") {
	        if (cSystem == "MC2") {
	            lon = Convert.mc2ToWgs84(this.x);
	        } else {
	            var mc2coord = Convert.xyCoordToMc2({geoPoint: {x:mapInst.returnRealX(this.x), y:this.y}, refP: mapInst});
	            lon = Convert.mc2ToWgs84(mc2coord.x);
	        }
	    } else {
	        lon = this.x;
	    }
	    
	    return lon;
	};
}

/**
 * Returns true if the given geoPoint is the same as the calling one and false otherwise
 *
 * @type GeoPoint
 * @name equals
 * @param geoPoint: obj: GeoPoint     
 * @return Boolean
 */

GeoPoint.prototype.equals = function(geoPoint) {
	return (geoPoint.x == this.x && geoPoint.y == this.y);
};

/**
 * Returns the number of kilometers to the given geoPoint
 *
 * @type GeoPoint
 * @name kmTo
 * @param geoPoint: obj:GeoPoint     
 * @return number
 */

GeoPoint.prototype.kmTo = function(geoPoint) {
	var lon1 = this.x,
	    lat1 = this.y,
	    lon2 = geoPoint.x,
	    lat2 = geoPoint.y;
	
	var R = 6371; // km
	var dLat = Convert.wgs84ToRadians(lat2-lat1);
	var dLon = Convert.wgs84ToRadians(lon2-lon1); 
	var a = Math.sin(dLat/2) * Math.sin(dLat/2) +
	        Math.cos(Convert.wgs84ToRadians(lat1)) * Math.cos(Convert.wgs84ToRadians(lat2)) * 
	        Math.sin(dLon/2) * Math.sin(dLon/2); 
	var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)); 
	var d = R * c;
	
	return d;
};

/**
 * Returns the number of miles to the given GeoPoint
 *
 * @type GeoPoint
 * @name milesTo
 * @param geoPoint: obj:GeoPoint     
 * @return number
 */

GeoPoint.prototype.milesTo = function(geoPoint) {
	return this.kmTo(geoPoint) * 0.6;
};

/**
 * Returns the geoPoint of a given distance and bearing to the current GeoPoint.</br>
 * <br>
 * <b>Parameters:</b><br>
 * <li>'distancekm' specifies the geoPoint's distance to the current GeoPoint in kilometers.</li>
 * <li>'bearing' specifies the geoPoint's bearing to the current GeoPoint in degrees.</li>
 *
 * @type GeoPoint
 * @name computeDestination
 * @param distancekm: number
 * @param bearing: number(0, 360)
 * @return obj: GeoPoint
 */

GeoPoint.prototype.computeDestination = function(distancekm, bearing) {
    var R = 6371; // km
    var lon1 = this.x * Math.PI / 180,
	    lat1 = this.y * Math.PI / 180,
	    brng = bearing * Math.PI / 180,
	    d = distancekm;
	    
    var lat2 = Math.asin( Math.sin(lat1)*Math.cos(d/R) + Math.cos(lat1)*Math.sin(d/R)*Math.cos(brng) );
    var lon2 = lon1 + Math.atan2(Math.sin(brng) * Math.sin(d/R) * Math.cos(lat1), Math.cos(d / R) - Math.sin(lat1) * Math.sin(lat2));
    
    return new GeoPoint(lon2 * 180 / Math.PI, lat2 * 180 / Math.PI);
};