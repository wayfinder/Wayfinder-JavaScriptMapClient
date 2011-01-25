/**
 * Class
 * ScaleControl is used to show the current scale of the map.
 * @name ScaleControl 
*/

 /**
 * Create a scale control.
 *
 * @type Constructor
 * @name ScaleControl
 */

function ScaleControl() {
	this.setElement('<div id="'+this.getId()+'">'+
						'<div id="kmScale">'+
							'<div id="distanceInfoKm">?? Km</div>'+
							'<div style="height:14px;float:left;">'+
								'<div id="distanceKmStart"> </div>'+
								'<div id="distanceKmRepeat"> </div>'+
								'<div id="distanceKmStop"> </div>'+
							'</div>'+
						'</div>'+
						'<div id="miScale" style="float:left;">'+
							'<div id="distanceMiStart"> </div>'+
							'<div id="distanceMiRepeat"> </div>'+
							'<div id="distanceMiStop"> </div>'+
							'<div id="distanceInfoMiles">?? Mi</div>'+
						'</div>'+
					'</div>');
					
	this.setStyle({
			'width': '155px',
			'height': '65px',
			'padding': '10px 0 0 0'
		});
}

ScaleControl.prototype = new Control('distanceHolder');

/**
* \Internal
* Resets the scale according to the new position of the map.
* It is triggered by map events like 'endDrag', 'panMap', 'afterZoom'
*
* @type ScaleControl
* @name resetScale
* @return None
*/

ScaleControl.prototype.resetScale = function () {	
	var pos = $('#'+this.getId()).position(),
		scaleKm = [2000, 1000, 600, 300, 200, 80, 40, 20, 10, 2, 2,/*meters*/ 1, 500, 200, 100],
		scaleMi = [1000, 1000, 400, 200, 100, 50, 20, 10,  5, 2, 1,/*feet  */ 3000, 2000, 500, 200],
		vp = this.mi.getViewPort().position(),
		referenceDistance = 1000, //pixels
		zoom = this.mi.getZoomFactor()-1,
		meters = false, feet = false;
	
	var geoSt = Convert.mousePositionToMc2({ geoPoint: { x:(pos.left + vp.left), y:(pos.top + vp.top)},
	                                   refP: this.mi
	                                   });
	                                   
	var geoFn = Convert.mousePositionToMc2({ geoPoint: { x:(pos.left + vp.left + referenceDistance), y:(pos.top + vp.top)},
	                                   refP: this.mi
	                                   });
	
	var geoStart = new GeoPoint(Convert.mc2ToWgs84(geoSt.x), Convert.mc2ToWgs84(geoSt.y));
	var geoEnd = new GeoPoint(Convert.mc2ToWgs84(geoFn.x), Convert.mc2ToWgs84(geoFn.y));
	
	var km = scaleKm[zoom];
	var mi = scaleMi[zoom];
	
	var km10px = geoStart.kmTo(geoEnd);
	var mi10px = km10px*0.6;

	if((zoom) > 11) { // convert distance to feet/meters if zoom level is high
		km10px = km10px * 1000;
		mi10px = mi10px * 5280;
		meters = feet = true;
	}
	
	var wKm = ((km / km10px) * referenceDistance);
	var wMi = ((mi / mi10px) * referenceDistance);
	
	while(wKm > 150) {
		wKm = parseInt(wKm/2, 10);
		km  = (km/2);
	}
	
	while(wMi > 150) {
		wMi = parseInt(wMi/2, 10);
		mi  = (mi/2);
	}
	
	if (mi < 1) {
		mi = parseInt(mi * 5280, 10);
		feet = true;
	}
	
	if (km < 1) {
		km = parseInt(km * 1000, 10);
		meters = true;
	}
	
	km = meters ? km+' m' : km+' Km';
	mi = feet ? mi+' ft' : mi+ ' Mi';
	
	$('#distanceHolder').css('width', (wKm > wMi) ? wKm+10 : wMi+10);
	$('#distanceKmRepeat').width(wKm);
	$('#distanceMiRepeat').width(wMi);
	$('#distanceInfoKm').html(km);
	$('#distanceInfoMiles').html(mi);	
};

ScaleControl.prototype.attachEvents = function() {
	var scope = this;
	
	scope.resetScale();

	Event.addListener('onDrag', function(params){ scope.resetScale(); }, { refP: this.mi });
	Event.addListener('redrawoverlay', function(params){ scope.resetScale(); }, { refP: this.mi });
	Event.addListener('panMap', function(params){ scope.resetScale(); }, { refP: this.mi });
	Event.addListener('afterZoom', function(params){ scope.resetScale(); }, { refP: this.mi });
	Event.addListener('centerMap', function(params){ scope.resetScale(); }, { refP: this.mi });
	Event.addListener('panstop', function(params){ scope.resetScale(); }, { refP: this.mi });
	
	//zoom on double click on the distance scale
	Event.addListener('dblclick', function (e){
		var relPos = scope.mi.getViewPort().position();
		var mouseX = (e.pageX - relPos.left);
		var mouseY = (e.pageY - relPos.top);
		scope.mi.zoom({'refP': scope.mi, 'x': mouseX, 'y': mouseY, 'delta': 1});
	}, {}, $('#'+scope.getId()));
	
	return true;
};