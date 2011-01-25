/**
 * Class
 * Class CopyrightControl is used to hold and display copyright information
 */

 /**
  * \Internal
  * The parameter is a general object with the following attributes: 
  *
  * @name CopyrightControl
  * @type Constructor
  * @param config: Map Object
  */

function CopyrightControl(config) {
	//Copyright 2009 Wayfinder AB
	this.setElement('<div id="'+this.getId()+'"><span id="copyText">Wayfinder Vodafone Open Source Project</span><span id="copyHead"></span></div>');
	this.setStyle({
			'height': '13px',
			'width' : '1000px',
			'padding': '0 0 5px 0',
			'font-family': 'verdana',
			'font-size': '11px',
			'color': 'black',
			'text-align': 'right'
		});
}

CopyrightControl.prototype = new Control('CopyCtrl');

/**
 * \Internal
 * Sets the copyright text (except head)
 * 
 * @name setText
 * @type CopyrightControl
 * @param text :String
 * @return None
 */

CopyrightControl.prototype.setText = function(txt) {
	$('#copyText').html(txt);
};

/*
 * Refresh copyright with new data (request)
 * 
 * @name resetInfo
 * @type CopyrightControl
 * @return None
 */

CopyrightControl.prototype.resetInfo = function() {
	var scope = this;
	scope.setText("Wayfinder Vodafone Open Source Project");
};

CopyrightControl.prototype.attachEvents = function() {
	var scope = this;
	
	Event.addListener('mapLoaded', function(e) {
		scope.mi.compileOView();
		scope.resetInfo(scope.mi);	
	});
	
	Event.addListener('dragstop', function(e){
		scope.mi.compileOView();
		scope.resetInfo(scope.mi);
	}, { }, this.mi.getDragPort());
	
	Event.addListener('afterZoom', function(e){
		scope.mi.compileOView();
		scope.resetInfo(scope.mi);
	});
	
	Event.addListener('redrawoverlay', function(e){
		scope.mi.compileOView();
		scope.resetInfo(scope.mi);
	});
	
	Event.addListener('panstop', function(e){
		scope.mi.compileOView();
		scope.resetInfo(scope.mi);
	});
	
	//zoom on double click on the copyright
	Event.addListener('dblclick', function (e){
		var relPos = scope.mi.getViewPort().position();
		var mouseX = (e.pageX - relPos.left);
		var mouseY = (e.pageY - relPos.top);
		scope.mi.zoom({'refP': scope.mi, 'x': mouseX, 'y': mouseY, 'delta': 1});
	}, {}, $('#'+scope.getId()));
};
