/**
* Class
* DrawManager is used to draw overlays (e.g. circles, polylines, etc.) on the map.
*/

/**
* The map parameter represents the Map object corresponding to the draw manager.
*
* @type Constructor
* @name DrawManager
* @param map: Map
*/

function DrawManager(mapInst) {
    var map;
    var drawPort;
    var figures = []; // Holds everything drawn on the canvas
    
    this.style = {  // Styling for all containers
        'z-index': 10,
        'position': 'absolute'
    };

    var id = Math.floor(Math.random() * Math.pow(10, 5));

    /**
    * \Internal
    * Repositions the canvas (useful after zoom).
    *
    * @type DrawManager
    * @name repositionCanvas
    * @return None
    */
    this.repositionCanvas = function() {
        var mapPort = map.getMapPort();
        drawPort.css({"top": mapPort.css("top"), "left": mapPort.css("left")});
        this.drawAll("redraw");
    };

    this.drawAll = function(param) {
		if(figures.length === 0) {
		    return false;
		}
        var i;
        for (i in figures) {
            if(typeof figures[i].draw != 'undefined') {
                figures[i].draw(param);
            }
        }
    };

    /**
    * \Internal
    * Attaches events from the map to Canvas functions.
    *
    * @type DrawManager
    * @name attachEvents
    * @return None
    */

    this.attachEvents = function() {
        var refParent = this;
        var refPMap = map;
        
        Event.addListener('afterZoom', function() {
            refParent.repositionCanvas();
        });
        
		Event.addListener('redrawoverlay', function() {
            refParent.drawAll();
        });
        
        Event.addListener('dragstop', function() {
            refParent.drawAll();
        }, {}, refPMap.getDragPort());
        
        Event.addListener('centerMap', function() {
            refParent.drawAll('redraw');
        });

		Event.addListener('mousedown', function (e) { if (refPMap.getDragStatus()) { refPMap.enableDragFeatures(); }}, {}, refPMap.getDrawPort());
		Event.addListener('mouseup', function (e) { if (refPMap.getDragStatus()) { setTimeout(function() { refPMap.disableDragFeatures(); }, 100); }}, {}, refPMap.getDrawPort());
    };

	/**
	 * Adds a Circle or Polyline object to the DrawManager and draws it.
	 *
	 * @type DrawManager
	 * @name add
	 * @param obj: Object (Circle or Polyline)
	 * @return None
	 */

	this.add = function(obj) {
	    var getClassName = function(obj) {
	        if (typeof obj != "object" || obj === null) {
	            return false;
	        }
	        return (/(\w+)\(/).exec(obj.constructor.toString())[1];
	    };

	    if(getClassName(obj) == 'Circle' || getClassName(obj) == 'Polyline') {
	        figures.push(obj);
			
            obj.setOptions({managerInst: this, map: map });

			if(getClassName(obj) == 'Polyline') {
				obj.lineCanvas = obj.buildContainer();
				obj.setStyles(obj.initialStyle);
			}
			
//	        obj.draw();
	    }
	};
    
    
	/**
	 * Function that returns a drawing by ID (an object of type Polyline or Circle).
	 * 
	 * @type DrawManager
	 * @name get
	 * @param id: Integer
	 * @return Object: Circle or Polyline
	 */
	
	this.get = function(id) {
	    var i;
	    for (i in figures) {
	        if (figures[i].getId() == id) {
	            return figures[i];
	        }
	    }
	};
	
	this.getId = function() {
        return id;	    
	};
     
    
    /**
    * Shows all drawn objects belonging to the current instance.
    *
    * @type DrawManager
    * @name showAll
    * @return None
    */
    
    this.showAll = function() {
        var i;
        for(i in figures) {
            if (typeof figures[i].show != 'undefined') {
                figures[i].show();
            }
        }
    };
    
    
    /**
    * Hides all drawn objects belonging to the current instance.
    *
    * @type DrawManager
    * @name hideAll
    * @return None
    */
    
    this.hideAll = function() {
        var i;
        for(i in figures) {
            if (typeof figures[i].hide != 'undefined') {
                figures[i].hide();
            }
        }
    };
    
    
    /**
    * Removes all drawn objects and their corresponding event handlers.
    *
    * @type DrawManager
    * @name removeAll
    * @return None
    */
    
    this.removeAll = function() {
        var i;
        for(i in figures) {
            if (typeof figures[i].getDomObject != 'undefined') {
                var domobj = figures[i].getDomObject();
                domobj.remove();
                domobj.empty();
                //GarbageCollector.canvases.push(figures[i]);
            }
        }
        figures.length = 0;
    };
    
    /**
    * Removes the object (drawing) having ID equal to 'id'.
    *
    * @type DrawManager
    * @name remove
    * @param id: Integer
    * @return None
    */

    this.remove = function(index) {
        var i;
        for (i in figures) {
            if (figures[i].getId() == index) {
                //GarbageCollector.canvases.push(figures[i]);
                var domObj = figures[i].getDomObject();
                domObj.remove();
                domObj.empty();
                figures.splice(i, 1);
                break;
	        }
	    }	    
    };
    
    this.removeFromManager = function(index) {
        var i;
        for (i in figures) {
            if (figures[i].getId() == index) {
                figures.splice(i, 1);
                break;
	        }
	    }	    
    };
    
    this.getMapInst = function() {
        return map;    
    };


    /* START CONSTRUCTOR */
    if (typeof mapInst != "undefined" && typeof mapInst.centerMap == "function") {
        map = mapInst;

        var dragPort = map.getDragPort();
        var mapPort = map.getMapPort();

        if (!$('#drawPort').length) {
            dragPort.append('<div id="drawPort" style="top: '+mapPort.css("top")+'; left: '+mapPort.css("left")+';"></div>');
        }

        drawPort = map.getDrawPort();
        drawPort.css(this.style);

        this.repositionCanvas();
        this.attachEvents();
    }
    /* END CONSTRUCTOR */
}