/**
* Class
* KeyboardHandler is used to control the map (panning and zooming) using the keyboard. An example of its usage 
* can be found under "Examples".</br>
* <br>
* <b>Events: </b><br/>
* <li><code>'pluskeypressed'</code> is fired when zooming in the map by pressing the plus key</br></li>
* <br>
* <li><code>'minuskeypressed'</code> is fired when zooming out the map by pressing the minus key</br></li>
* <br>
* <li><code>'leftkeypressed'</code> is fired when panning the map to the left by pressing the left arrow key</br></li>
* <br>
* <li><code>'rightkeypressed'</code> is fired when panning the map to the right by pressing the right arrow key</br></li>
* <br>
* <li><code>'upkeypressed'</code> is fired when panning the map up by pressing the up arrow key</br></li>
* <br>
* <li><code>'downkeypressed'</code> is fired when panning the map down by pressing the down arrow key</br></li>
* 
*/

/**
* The map parameter represents the Map on which the keyboard control is enabled.
* After instantiated, the following controls become available: arrow keys for left/right/up/down panning and +/- keys for zooming in/out.<br/>
*
* @type Constructor
* @name KeyboardHandler
* @param map: Map
*/
function KeyboardHandler(mapInstParam) {
    var mapInst = mapInstParam;
    var enabled;

	/**
	* \Internal
	* Sets the keys to be controlled by the keyboard handler.
	* 
	* @type KeyboardHandler
	* @name setControls
	* @return None
	*/
    this.setControls = function() {
        var map = mapInst;

        if (enabled) {
            $(document).keydown(function (e) {
                var code = (e.keyCode ? e.keyCode : e.which);

                if (code == 107 || code == 109 || code == 187 || code == 189) {
                    //map.compileOView();
                    var coords = {'x': (map.getOView().x + map.viewPortWidth / 2), 'y': (map.getOView().y - map.viewPortHeight / 2)};
                    var markerManagerInstance;
                    var marker;
                    var currentPoint;
                    var active;
                    var newZoom;
                    var ggeoPoint;
                    var mapSize;
                    var oview;
                    var aux;
                    var numberOfMapRepetition;
                    var markerXCoordinate;

                    if (code == 107 || code == 187) {
                        e.preventDefault();
                        Event.triggerEvent('pluskeypressed', map.getViewPort());

                        $(map.getZoomPort()).css({'visibility' : 'hidden'});
                        if (Event.getLastUsedObj() !== null || InfoWindow.isVisible()) {
                            if (InfoWindow.isVisible() && map.getActiveMarkerManager() !== null && typeof map.getActiveMarkerManager().getActive != "undefined") {
                                markerManagerInstance = map.getActiveMarkerManager();
                                active = markerManagerInstance.getActive();
                                marker = markerManagerInstance.get(active);
                                currentPoint = marker.getPosition();
                            } else {
                                marker = Event.getLastUsedObj();
                                currentPoint = marker.getPosition();
                            }
                            if (marker.isMarkerInViewPort()) {
                                newZoom = map.getZoomFactor() + 1;
                                if (newZoom > 15) {
                                    return;
                                }

                                ggeoPoint = Convert.degreesToServer({geoPoint: currentPoint, refP: map});

                                mapSize = (-1)*config.zoomRanges[newZoom][0];
                                map.compileOView();
                                oview = map.getOView();
                                aux = ggeoPoint.x - oview.x - map.getDragPort().position().left - map.getMapPortPosition().x;

                                // calculate the number of times that the map repeated relative to our marker
                                if (oview.x < aux) {
                                    numberOfMapRepetition = parseInt((oview.x-aux)/mapSize, 10);
                                } else {
                                    numberOfMapRepetition = 1+parseInt((oview.x-aux)/mapSize, 10);
                                }
                                // calculate the marker x coordinate relative to the viewport origin
                                markerXCoordinate = ggeoPoint.x - oview.x+ mapSize * numberOfMapRepetition;
                                map.zoom({'refP': map, 'x': markerXCoordinate, 'y': oview.y-ggeoPoint.y, 'delta': 1});
                            } else {
                                coords = {'x': (map.viewPortWidth / 2), 'y': (map.viewPortHeight / 2)};
                                map.zoom({'refP': map, 'x': coords.x, 'y': coords.y, 'delta': 1});
                            }

                        } else {
                            coords = {'x': (map.viewPortWidth / 2), 'y': (map.viewPortHeight / 2)};
                            map.zoom({'refP': map, 'x': coords.x, 'y': coords.y, 'delta': 1});
                        }

                        Event.triggerEvent('zoom', {'delta': 1});
                        Event.triggerEvent('afterZoom', {'delta': 1});
                        Event.triggerEvent('sliderZoom');

                    } else if (code == 109 || code == 189) {
                        e.preventDefault();
                        Event.triggerEvent('minuskeypressed', map.getViewPort());

                        $(map.getZoomPort()).css({'visibility' : 'hidden'});
                        if (Event.getLastUsedObj() !== null || InfoWindow.isVisible()){
                            if (InfoWindow.isVisible() && map.getActiveMarkerManager() !== null && typeof map.getActiveMarkerManager().getActive != "undefined") {
                                markerManagerInstance = map.getActiveMarkerManager();

                                active = markerManagerInstance.getActive();
                                marker = markerManagerInstance.get(active);
                                currentPoint = marker.getPosition();
                            }else{
                                marker = Event.getLastUsedObj();
                                currentPoint = marker.getPosition();
                            }
                            if (marker.isMarkerInViewPort()) {
                                newZoom = map.getZoomFactor() - 1;
                                if (newZoom < 1) {
                                    return;
                                }

                                ggeoPoint = Convert.degreesToServer({geoPoint: currentPoint, refP: map});

                                mapSize = (-1)*config.zoomRanges[newZoom][0];
                                map.compileOView();
                                oview = map.getOView();
                                aux = ggeoPoint.x - oview.x - map.getDragPort().position().left - map.getMapPortPosition().x;

                                // calculate the number of times that the map repeated relative to our marker
                                if (oview.x < aux) {
                                    numberOfMapRepetition = parseInt((oview.x-aux)/mapSize, 10);
                                } else {
                                    numberOfMapRepetition = 1+parseInt((oview.x-aux)/mapSize, 10);
                                }
                                // calculate the marker x coordinate relative to the viewport origin
                                markerXCoordinate = ggeoPoint.x - oview.x+ mapSize * numberOfMapRepetition;
                                map.zoom({'refP': map, 'x': markerXCoordinate, 'y': oview.y-ggeoPoint.y, 'delta': -1});
                            }else{
                                coords = {'x': (map.viewPortWidth / 2), 'y': (map.viewPortHeight / 2)};
                                map.zoom({'refP': map, 'x': coords.x, 'y': coords.y, 'delta': -1});
                            }
                        }else{
                            coords = {'x': (map.viewPortWidth / 2), 'y': (map.viewPortHeight / 2)};
                            map.zoom({'refP': map, 'x': coords.x, 'y': coords.y, 'delta': -1});
                        }

                        Event.triggerEvent('zoom', {'delta': -1});
                        Event.triggerEvent('afterZoom', {'delta': -1});
                        Event.triggerEvent('sliderZoom');

                    }
                } else if (code == 37 || code == 38 || code == 39 || code == 40) {
                    e.preventDefault();
                    //$('#sliderbg').slider('disable');
                    switch (code) {
                        case 37:
                        map.performPan({x:100000000, y: 0}, 200000000);
                        Event.triggerEvent('leftkeypressed', map.getViewPort());
                        break;
                        case 38:
                        map.performPan({x:0, y: 100000000}, 200000000);
                        Event.triggerEvent('upkeypressed', map.getViewPort());
                        break;
                        case 39:
                        map.performPan({x:-100000000, y: 0}, 200000000);
                        Event.triggerEvent('rightkeypressed', map.getViewPort());
                        break;
                        case 40:
                        map.performPan({x:0, y: -100000000}, 200000000);
                        Event.triggerEvent('downkeypressed', map.getViewPort());
                        break;
                    }

                }
            });


            $(document).keyup(function (e) {
                var code = (e.keyCode ? e.keyCode : e.which);

                if (code == 37 || code == 38 || code == 39 || code == 40) {
                    map.getDragPort().stop(true);
                    map.panning = false;
                    Event.triggerEvent('redrawoverlay');
					Event.triggerEvent('panstop');
                }
            });
        } else {
            $(document).unbind("keydown");
            $(document).unbind("keyup");
        }
    };

	/**
	* Enables the keyboard handler if it had been disabled.
	*
	* @type KeyboardHandler
	* @name enableHandler
	* @return None
	*/
    this.enableHandler = function() {
        if (!enabled) {
            enabled = true;
            this.setControls();
        }
    };

	/**
	* Disables the keyboard handler if it had been enabled.
	*
	* @type KeyboardHandler
	* @name disableHandler
	* @return None
	*/
    this.disableHandler = function() {
        if (enabled) {
            enabled = false;
            this.setControls();
        }
    };

    this.enableHandler();

}