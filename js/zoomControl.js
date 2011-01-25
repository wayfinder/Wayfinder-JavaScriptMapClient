/**
* Class
* ZoomControl is used to create and manipulate a zoom control on the map.<br/>
* <br>
* <b>Events: </b><br/>
* 
* <code>'sliderZoom'</code> is fired when zooming the map using the zoom slider.
* @name ZoomControl
*/

/**
* Create a ZoomControl.
* @type Constructor
* @name ZoomControl
*/

function ZoomControl() {
    this.setElement('<div id="'+this.getId()+'"">' +
    '<div id="zoomControl" class="zoomControl">'+
    '<div id="zoomPlus" class="zoomPlus" />'+
    '<div id="sliderbg" class="sliderbg">'+
    '<a class="ui-slider-handle"></a>'+
    '</div>'+
    '<div id="zoomMinus" class="zoomMinus" />'+
    '</div>'+
    '</div>');

    this.setStyle({
    'display': 'block',
    'width': '29px',
    'height': '150px'
    });
}

ZoomControl.prototype = new Control('zoomHolder');

/**
* Moves the slider to the position given by 'zoomLevel', which specifies the current zoom level
*
* @type ZoomControl
* @name setSlider
* @param zoomLevel: number
* @return None
*/

ZoomControl.prototype.setSlider = function (zoomLevel) {
    $('#sliderbg').slider('value', zoomLevel);
};

ZoomControl.prototype.attachEvents = function() {
    var refP = this;
    //focusPoint = {};
    //time = 0;
    
    var marker;
    var currentPoint;
    var markerManagerInstance;
    var active;
    var coords;

    $('#sliderbg').slider({ orientation: 'vertical',
    min: 1,
    max: 15,
    range: 'max',

    stop: function(event, ui) {
        $(refP.mi.getZoomPort()).css({'visibility' : 'hidden'});
        
        var newZoom;
        var newPos;
        var mouseToMc2;
        
        if (Event.getLastUsedObj() !== null || InfoWindow.isVisible()) {
            if (InfoWindow.isVisible() && refP.mi.getActiveMarkerManager() !== null && typeof refP.mi.getActiveMarkerManager().getActive != "undefined") {
                markerManagerInstance = refP.mi.getActiveMarkerManager();

                active = markerManagerInstance.getActive();
                marker = markerManagerInstance.get(active);
                currentPoint = marker.getPosition();
            }else{
                marker = Event.getLastUsedObj();
                currentPoint = marker.getPosition();
            }
            
            if (marker.isMarkerInViewPort()) {
                newZoom = ui.value;
                var ggeoPoint = Convert.degreesToServer({geoPoint: currentPoint, refP: refP.mi});

                var mapSize = (-1)*config.zoomRanges[newZoom][0];
                refP.mi.compileOView();
                var oview = refP.mi.getOView();
                var aux = ggeoPoint.x - oview.x - refP.mi.getDragPort().position().left - refP.mi.getMapPortPosition().x;

                // calculate the number of times that the map repeated relative to our marker
                var numberOfMapRepetition;
                if (oview.x < aux) {
                    numberOfMapRepetition = parseInt((oview.x-aux)/mapSize, 10);
                } else {
                    numberOfMapRepetition = 1+parseInt((oview.x-aux)/mapSize, 10);
                }
                // calculate the marker x coordinate relative to the viewport origin
                var markerXCoordinate = ggeoPoint.x - oview.x+ mapSize * numberOfMapRepetition;
                //var position = new GeoPoint(markerXCoordinate, refP.mi.getTileSize() - ggeoPoint.y );
                refP.mi.zoom({'refP': refP.mi, 'x': markerXCoordinate, 'y': oview.y-ggeoPoint.y, 'delta': (ui.value - refP.mi.getZoomFactor())});
                refP.setSlider(refP.mi.getZoomFactor());
            }else{
                newZoom = ui.value;
                refP.mi.compileOView();
                coords = {'x': (refP.mi.getOView().x + refP.mi.viewPortWidth / 2), 'y': (refP.mi.getOView().y - refP.mi.viewPortHeight / 2)};
                mouseToMc2 = Convert.xyCoordToMc2({geoPoint: coords, refP: refP.mi});

                newPos = {'x': 0, 'y': 0};
                newPos.x = Convert.mc2ToWgs84(mouseToMc2.x);
                newPos.y = Convert.mc2ToWgs84(mouseToMc2.y);

                refP.mi.focusPoint = newPos;
                refP.mi.centerMap( newPos, newZoom);

                Event.triggerEvent('afterZoom', {'delta': (ui.value - refP.mi.getZoomFactor())});
            }
        }else{
            newZoom = ui.value;
            refP.mi.compileOView();
            coords = {'x': (refP.mi.getOView().x + refP.mi.viewPortWidth / 2), 'y': (refP.mi.getOView().y - refP.mi.viewPortHeight / 2)};
            mouseToMc2 = Convert.xyCoordToMc2({geoPoint: coords, refP: refP.mi});

            newPos = {'x': 0, 'y': 0};
            newPos.x = Convert.mc2ToWgs84(mouseToMc2.x);
            newPos.y = Convert.mc2ToWgs84(mouseToMc2.y);

            refP.mi.focusPoint = newPos;
            refP.mi.centerMap( newPos, newZoom);

            Event.triggerEvent('afterZoom', {'delta': (ui.value - refP.mi.getZoomFactor())});
            //Event.triggerEvent('sliderZoom');
        }
        refP.mi.resetZoomMatrix();
    }
    });

    this.setSlider(this.mi.getZoomFactor()); // set initial position

    Event.addListener('afterZoom', function(params){ refP.setSlider(refP.mi.getZoomFactor()); });
    Event.addListener('centerMap', function(params) { refP.setSlider(params.data.zoom); });

    $('#zoomPlus').click(function() {
        $(refP.mi.getZoomPort()).css({'visibility' : 'hidden'});
        if (Event.getLastUsedObj() !== null || InfoWindow.isVisible()){
            if (InfoWindow.isVisible() && refP.mi.getActiveMarkerManager() !== null && typeof refP.mi.getActiveMarkerManager().getActive != "undefined") {
                markerManagerInstance = refP.mi.getActiveMarkerManager();

                active = markerManagerInstance.getActive();
                marker = markerManagerInstance.get(active);
                currentPoint = marker.getPosition();
            }else{
                marker = Event.getLastUsedObj();
                currentPoint = marker.getPosition();
            }
            if (marker.isMarkerInViewPort()) {
                var newZoom = refP.mi.getZoomFactor() + 1;
                if (newZoom > 15) {
                    return;
                }

                var ggeoPoint = Convert.degreesToServer({geoPoint: currentPoint, refP: refP.mi});

                var mapSize = (-1)*config.zoomRanges[newZoom][0];
                refP.mi.compileOView();
                var oview = refP.mi.getOView();
                var aux = ggeoPoint.x - oview.x - refP.mi.getDragPort().position().left - refP.mi.getMapPortPosition().x;

                // calculate the number of times that the map repeated relative to our marker
                var numberOfMapRepetition;
                if (oview.x < aux) {
                    numberOfMapRepetition = parseInt((oview.x-aux)/mapSize, 10);
                } else {
                    numberOfMapRepetition = 1+parseInt((oview.x-aux)/mapSize, 10);
                }
                // calculate the marker x coordinate relative to the viewport origin
                var markerXCoordinate = ggeoPoint.x - oview.x+ mapSize * numberOfMapRepetition;
                refP.mi.zoom({'refP': refP.mi, 'x': markerXCoordinate, 'y': oview.y-ggeoPoint.y, 'delta': 1});
            }else{
                coords = {'x': (refP.mi.viewPortWidth / 2), 'y': (refP.mi.viewPortHeight / 2)};
                refP.mi.zoom({'refP': refP.mi, 'x': coords.x, 'y': coords.y, 'delta': 1});
            }

        }else{
            coords = {'x': (refP.mi.viewPortWidth / 2), 'y': (refP.mi.viewPortHeight / 2)};
            refP.mi.zoom({'refP': refP.mi, 'x': coords.x, 'y': coords.y, 'delta': 1});
        }
        //refP.mi.resetZoomMatrix();
        Event.triggerEvent('zoom', {'delta': 1});
        Event.triggerEvent('afterZoom', {'delta': 1});
        Event.triggerEvent('sliderZoom');
    })
    .mouseover(function() { $(this).addClass('zoomPlusHover'); })
    .mouseout(function() { $(this).removeClass('zoomPlusHover'); });

    $('#zoomMinus').click(function() {

        $(refP.mi.getZoomPort()).css({'visibility' : 'hidden'});
        if (Event.getLastUsedObj() !== null || InfoWindow.isVisible()){
            if (InfoWindow.isVisible() && refP.mi.getActiveMarkerManager() !== null && typeof refP.mi.getActiveMarkerManager().getActive != "undefined") {
                markerManagerInstance = refP.mi.getActiveMarkerManager();

                active = markerManagerInstance.getActive();
                marker = markerManagerInstance.get(active);
                currentPoint = marker.getPosition();
            }else{
                marker = Event.getLastUsedObj();
                currentPoint = marker.getPosition();
            }
            if (marker.isMarkerInViewPort()) {
                var newZoom = refP.mi.getZoomFactor() - 1;
                if (newZoom < 1) {
                    return;
                }

                var ggeoPoint = Convert.degreesToServer({geoPoint: currentPoint, refP: refP.mi});

                var mapSize = (-1)*config.zoomRanges[newZoom][0];
                refP.mi.compileOView();
                var oview = refP.mi.getOView();
                var aux = ggeoPoint.x - oview.x - refP.mi.getDragPort().position().left - refP.mi.getMapPortPosition().x;

                // calculate the number of times that the map repeated relative to our marker
                var numberOfMapRepetition;
                if (oview.x < aux) {
                    numberOfMapRepetition = parseInt((oview.x-aux)/mapSize, 10);
                } else {
                    numberOfMapRepetition = 1+parseInt((oview.x-aux)/mapSize, 10);
                }
                // calculate the marker x coordinate relative to the viewport origin
                var markerXCoordinate = ggeoPoint.x - oview.x+ mapSize * numberOfMapRepetition;
                refP.mi.zoom({'refP': refP.mi, 'x': markerXCoordinate, 'y': oview.y-ggeoPoint.y, 'delta': -1});
            }else{
                coords = {'x': (refP.mi.viewPortWidth / 2), 'y': (refP.mi.viewPortHeight / 2)};
                refP.mi.zoom({'refP': refP.mi, 'x': coords.x, 'y': coords.y, 'delta': -1});
            }
        }else{
            coords = {'x': (refP.mi.viewPortWidth / 2), 'y': (refP.mi.viewPortHeight / 2)};
            refP.mi.zoom({'refP': refP.mi, 'x': coords.x, 'y': coords.y, 'delta': -1});

        }
        //refP.mi.resetZoomMatrix();
        Event.triggerEvent('zoom', {'delta': -1});
        Event.triggerEvent('afterZoom', {'delta': -1});
        Event.triggerEvent('sliderZoom');
    })
    .mouseover(function() { $(this).addClass('zoomMinusHover'); })
    .mouseout(function() { $(this).removeClass('zoomMinusHover'); });

    //so slider doesn't become selected on double click on minus button on safari, chrome
    Event.addListener('mousedown', function (e){
        return false;
    }, {}, $('#'+refP.getId()));
};