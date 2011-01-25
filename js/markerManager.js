/**
* Class
* MarkerManager is used to manage markers on the map. An example of its usage can be found under "Examples".</br>
*/

/**
* The 'map' parameter represents the Map object for which the markers are being managed.
*
* @type Constructor
* @name MarkerManager
* @param map: Map
*/


function MarkerManager(mapObj) {
    var map = mapObj;
    var markers = []; // array of Marker objects being managed for mapObj
	var activeMarker = null;
    
    /**
    * Adds a marker to the marker manager and places it on the map.
    *
    * @type MarkerManager
    * @name add
    * @param marker: obj: Marker
    * @return None
    */

    this.add = function(marker) {
        var icon = marker.getIcon();
        var options = marker.getOptions();
        var id = marker.getId();

        marker.setOptions({managerInst: this});
        markers.push(marker);

        if (!($("#marker_" + id).length)) {

            var obj = document.createElement('div');
            obj.id = 'marker_' + id;            
            obj.style.position = 'absolute';
            obj.style.backgroundImage = 'url('+icon.image+')';
            obj.style.backgroundRepeat = 'no-repeat';
            obj.style.width = icon.size.width + "px";
            obj.style.height = icon.size.height + "px";
			
			if (options.alwaysOnTop) {				
                obj.style.zIndex = '12';
            } else {
                obj.style.zIndex = '11';
            }
			
            if (options.visible) {
                obj.style.display = 'block';
            } else {
                obj.style.display = 'none';
            }

            if (marker.useSprites()) {
                obj.style.backgroundPosition = icon.spriteAnchor.x + "px " + icon.spriteAnchor.y + "px";
            }

            map.getMarkerPort().append(obj);
            
            obj = marker.getDomObject();
            obj.hover(
            function() {
                $(this).css("cursor", "pointer");
            },
            function() {
                $(this).css("cursor", "default");
            }
            );
        } else {
            marker.setMarkerDomObjectProperties(options);
        }

        marker.render();
    };


    /**
    * Removes a marker from the marker manager according to 'markerId'.
    *
    * @type MarkerManager
    * @name remove
    * @param markerId: Integer
    * @return None
    */

    this.remove = function(idIndex) {
        var i;
        var currentMarker;
        for (i in markers) {
            if (markers[i].getId() == idIndex) {
                currentMarker = markers[i];
                break;
            }
        }
        if (typeof currentMarker != "undefined") {
            currentMarker.hide();
            if (currentMarker.isInfoWindowVisible()) {
                currentMarker.closeInfoWindow();
            }

            Event.removeAllListeners(currentMarker);
            GarbageCollector.markers.push(currentMarker);
            markers.splice(i, 1);
        }
    };   

    /**
	 * Returns the marker object having id equal to 'markerId'.
     *
     * @type MarkerManager
     * @name get
     * @param markerId: Integer
     * @return obj: Marker
     */
    
    this.get = function(markerId) {
        var i;
        for (i in markers) {
            if (markers[i].getId() == markerId) {
                return markers[i];
            }
        }
    };


    /**
    * Returns the total number of markers from the marker manager.
    *
    * @type MarkerManager
    * @name getCount
    * @return Integer
    */

    this.getCount = function() {        
        return markers.length;
    };
    
    
    /**
    * Displays all the markers from the marker manager on the map.
    *
    * @type MarkerManager
    * @name showAll
    * @return None
    */

    this.showAll = function() {
        var i;
        for(i in markers) {
            if (typeof markers[i].show != "undefined") {
                markers[i].show();
            }
        }
    };


    /**
    * Hides all the markers from the marker manager.
    *
    * @type MarkerManager
    * @name hideAll
    * @return None
    */

    this.hideAll = function() {
        var i;
        for(i in markers) {
            if (typeof markers[i].hide != "undefined") {
                markers[i].hide();
            }
        }
    };


    /**
    * Removes all markers from the marker manager.
    *
    * @type MarkerManager
    * @name removeAll
    * @return None
    */

    this.removeAll = function() {
        var i;
        for(i=0; i<markers.length; i++) {
            markers[i].hide();
            if (markers[i].isInfoWindowVisible()) {
                markers[i].closeInfoWindow();
            }

            Event.removeAllListeners(markers[i]);
            GarbageCollector.markers.push(markers[i]);
        }
        markers = [];
        this.setActive(null);
    };


    /**
    * \Internal
    * Places all markers belonging to the current map instance on the map.
    *
    * @type MarkerManager
    * @name renderAll
    * @return None
    */

    this.renderAll = function() {
		if(this.getCount() === 0) {
		    return false;
		}
        var i;
        for(i in markers) {
            if(typeof markers[i].render != 'undefined') {
                markers[i].render();
            }
        }
    };

    this.setActive = function(id) {
        if (id === null || this.getCount() === 0) {
            return false;
        }
        var i;
        for(i in markers) {
            if (typeof markers[i] == 'object') {
                if (id == markers[i].getId() && markers[i].isInfoWindowVisible() && markers[i].getId() != id) {
                    markers[i].closeInfoWindow();
                    break;
                }
            }
		}
		activeMarker = id;
		map.setActiveMarkerManager(this);
	};
	
	this.getActive = function() {
	    if (activeMarker === null) {
	        return null;
	    }
		return activeMarker;
	};  
    
    this.repositionMarkerPort = function() {
        var mapPort = map.getMapPort();
        map.getMarkerPort().css({"top": mapPort.position().top+'px', "left": mapPort.position().left+'px'});
        this.renderAll();
    };
    
    this.getMapInst = function() {
        return map;
    };
    
    /**
    * \Internal
    * Attaches events from the map to MarkerManager functions.
    *
    * @type MarkerManager
    * @name attachEvents
    * @return None
    */

    this.attachEvents = function() {
        var refParent = this;
        
		Event.addListener('wndClose', function() {
			refParent.setActive(null);
		});
		
        Event.addListener('afterZoom', function() {
			refParent.repositionMarkerPort();
			var id = refParent.getActive();
			if(id !== null && InfoWindow.isVisible() && map.getActiveMarkerManager() == refParent) {
			    refParent.get(id).openInfoWindowWithoutTrigger();
			}
		});
		
        Event.addListener('centerMap', function() {
			refParent.renderAll();
			var id = refParent.getActive();
			if(id !== null && InfoWindow.isVisible() && map.getActiveMarkerManager() == refParent) {
			    refParent.get(id).openInfoWindowWithoutTrigger();
			}
		});
        
		Event.addListener('dragstop', function() {
		    refParent.renderAll();
		    var id = refParent.getActive();
		    if(id !== null && InfoWindow.isVisible() && map.getActiveMarkerManager() == refParent) {
			    refParent.get(id).openInfoWindowWithoutTrigger();
			}
		}, {}, map.getDragPort());
		
		Event.addListener('redrawoverlay', function() {
            refParent.renderAll();
        });

		var refPMap = map;

		Event.addListener('mousedown', function (e){ if (refPMap.getDragStatus()) { refPMap.enableDragFeatures(); }}, {}, refPMap.getMarkerPort());
		Event.addListener('mouseup', function (e){ if (refPMap.getDragStatus()) { setTimeout(function() { refPMap.disableDragFeatures(); }, 100); }}, {}, refPMap.getMarkerPort());

		return true;
    };
    
 
    /* START CONSTRUCTOR */
    var dragPort = map.getDragPort();
    var mapPort = map.getMapPort();
    
    if (!($('#markerPort').length)) {
        dragPort.append('<div id="markerPort" style="position: absolute; top: '+mapPort.position().top+'px; left: '+mapPort.position().left+'px; z-index: 11;"></div>');
        map.setMarkerPort($('#markerPort'));
    }
    
    map.getMarkerPort().css({"top" : mapPort.position().top+'px', "left": mapPort.position().left+'px'});	
		
    InfoWindow.bindTo(map);
    this.attachEvents();
    /* END CONSTRUCTOR */
}