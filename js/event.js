(function($){

        jQuery.fn.equals = function(selector) {
                return $(this).get(0)==$(selector).get(0);
        };

})(jQuery); 

/**
* Class
* Events handles DOM/custom events (add/remove listeners, trigger events). There are many built-in events triggered by map, info window, controls and 
* other objects, which are described in those classes in detail.<br/>
* <br>
*
* @name Event
*/
var Event = {
    events: [],
    lastUsedObj: null,
    /**
    * Adds an event listener for the given element and adds the event to event array. When the 'event' is fired on 'elem', 'handler' function will be called and 'params' will serve as its parameters.<br />
    * <br>
    * <b>Parameters:</b><br/>
    * <li>'params' is a generic object of type {'paramID1': param1, 'paramID2': param2, ...}. It can be used to pass in parameters 
    * to handlers. Each element in it can be retrieved as 'params.data.paramIDi'. It should be specified as an empty object as '{}' if it's not needed.<br/></li>
    * <br>
    * <li>'elem' defines the target to which the listener is added and it will respond to the event. It should be left out if not needed. If 'elem' is a JavaScript object, the object needs to provide getDomObject() 
    * method (e.g. it should be a Marker, Circle, etc.).<br/></li>
    * <br>
    * <li>If both 'params' and 'elem' are not needed, they can be left out together.<br/></li>
    * <br>
    * <b>Example:</b><br/>
    * <br>
    *  <code>
    *   	 Event.addListener('event', someHandler, {'param1': param1, 'param2': param2 ...}, element);<br />
    *    	 function someHandler(params){<br />
    *        var foo1 = params.data.param1;<br />
    *      	 var foo2 = params.data.param2;<br />
    *        ...
    *   }
    *  </code>
    *     
    * @type Event
    * @name addListener
    * @param eventName: String
    * @param handler: Function
    * @param params: Object
    * @param elem: DOM element or Object
    * @return None
    */
    addListener: function (eventName, handler, params, elem) {
	if (typeof elem != 'undefined'){
		if (!$(elem).exists()) {
			if(typeof elem.getDomObject == 'function') {
				elem = elem.getDomObject();	
				if (!$(elem).exists()){
					return false;
				}
			} else return false;
		}
	}else{
		this.events[this.events.length] = {'eventName': eventName,'elem': null, 'handler': handler, 'params': {'data': params}};
		return false;
	}

	if (typeof params == 'undefined') {
		$(elem).bind(eventName, handler);
	} else {
		$(elem).bind(eventName, params, handler);
	}
	this.events[this.events.length] = {'eventName': eventName,'elem': elem, 'handler': handler, 'params': {'data': params}};
    },

    /**
    * Triggers an event from the event array (launches the handler and sends the defined parameters). It is also used to trigger custom events.<br/>
    * <br>
    * <b>Parameters:</b><br/>
    * <li>'params' is a generic object of type {'paramID1': param1, 'paramID2': param2, ...}. It can be used to pass in parameters 
    * to event listeners. Each element in it can be retrieved as 'params.edata.paramIDi'. It should be specified as an empty object 
    * as '{}' if it's not needed.<br/></li> 
    * <br>
    * <li>'elem' should be left out if one doesn't want to trigger the event on a specific element. If 'elem' is a JavaScript 
    * object, the object needs to provide getDomObject() method (e.g. it should be a Marker, Circle, etc.).<br/></li>   
	* <br>
    * <b>Example:</b><br/>
    * <br>
    * <code>
	* Event.triggerEvent('event', {'text': 'Event was triggered',...}, element); <br/>
    * Event.addListener('event', function(params){ <br/>
    *   // Please note the different when retrieving parameters from an event trigger and addListener. <br />
    *   var text  = params.edata.text;<br />
    *   var param = params.data.param1;}, 
    * {'param1': param1});<br/>
    * </code>
    * 
    * @type Event
    * @name triggerEvent
    * @param eventName: String
    * @param params: Object
    * @param elem: DOM element or Object
    * @return None
    */
    triggerEvent: function (eventName, params, elem) {
		if (typeof elem != 'undefined'){
			if (!$(elem).exists()) {
				if(typeof elem.getDomObject == 'function') {
					elem = elem.getDomObject();
				}
			}
		}
		
    	for (var i=0; i<this.events.length; i++){
    		if (this.events[i].eventName == eventName){	
			if (typeof elem != 'undefined') {
				if ($(this.events[i].elem).equals(elem)) {
					var edata = {};
					var key;
					if (typeof params != 'undefined') {
						for (key in params) {
							if (typeof params[key] != "undefined") {
								edata[key] = params[key];
							}
						}
					}
					if (typeof this.events[i].params == 'undefined') {
						this.events[i].params = {};
					}
					this.events[i].params.edata = edata;
					this.events[i].handler(this.events[i].params);
					//$(elem).trigger(eventName, this.events[i].params);
				}
			}else{
				
				//console.log('ddd');
				var edata = {};
				var key;
				if (typeof params != 'undefined') {
					for (key in params) {
						if (typeof params[key] != "undefined") {
							edata[key] = params[key];
						}
					}
				}
				if (typeof this.events[i].params == 'undefined') {
					this.events[i].params = {};
				}
				this.events[i].params.edata = edata;
				this.events[i].handler(this.events[i].params);
			}
    	}
    	}
    },

    /**
    * \Internal
    * Returns the JS Obj that was assigned to the last triggered event
    *
    * @type Event
    * @name getLastUsedObj
    * @param none
    * @return Obj
    */
    getLastUsedObj: function (){
        return Event.lastUsedObj;
    },

    /**
    * \Internal
    * Sets the JS Obj that was assigned to the last triggered event to null.
    *
    * @type Event
    * @name clearLastUsedObj
    * @return None
    */
    clearLastUsedObj: function (){
        Event.lastUsedObj = null;
    },

    /**
    * Deletes an event from the events array and removes the specified listener from an element.<br/>
    * <br>
    * <b>Parameters:</b><br/>
    * <br>
    * <li>'elem' should be specified as an empty object as '{}' if the listener was not added to a specific element. If 'elem' 
    * is a JavaScript object, the object needs to provide getDomObject() method (e.g. it should be a Marker, Circle, etc.).<br/></li>
    * <br>
    * <li>If 'handler' is not specified, all listeners to the event will be removed from the element.<br/></li>
    * 
    * <br>
	* <b>Example:</b><br/>
	* <br>
	* <li>This will remove the listener 'someHandler' to 'eventName' from 'element'. <br/>
    * <code>
	* Event.removeListener('eventName', element, someHandler); <br /><br/>
    * </code></li>
    * <li>This will remove all the listeners to 'eventName' from 'element'. <br/>
    * <code>
	* Event.removeListener('eventName', element); <br /><br/>
    * </code></li>    
    * 
    * @type Event
    * @name removeListener
    * @param eventName: String
    * @param elem: DOM element or Object
    * @param handler: Function
    * @return None
    */
    removeListener: function (eventName, elem, handler){
		if (typeof elem == "undefined") {
			return;
		}
		
		if(typeof elem.getDomObject == 'function') {						
        	elem = elem.getDomObject();
        }
		var flag_found = 0;
				
        for (var i=0; i<this.events.length; i++){
			if (this.events[i].eventName == eventName) {
				//if the listener was added on an element and listener element is the same as elem
				if (this.events[i].elem !== null && elem.get(0) == this.events[i].elem.get(0)) {
                	if ((typeof handler != "undefined" && this.events[i].handler == handler) || typeof handler == "undefined") {
							flag_found = 1;
							$(this.events[i].elem).unbind(this.events[i].eventName, this.events[i].handler);
							this.events.splice(i, 1);					
					}
				//if the listener was not added on an element and elem is {}
        	    } else if (this.events[i].elem === null && typeof elem == "object" && elem !== null && this.isEmpty(elem)) {
					if ((typeof handler != "undefined" && this.events[i].handler == handler) || typeof handler == "undefined") {
						flag_found = 1;
						this.events.splice(i, 1);
					}
				}
			}
        }
		
		//if event is not custom - was not in the events array
		if (flag_found == 0) {
			if (typeof handler != "undefined") {
            	$(elem).unbind(eventName, handler);
            } else {
				$(elem).unbind(eventName);
			}
		}
    },

    /**
    * Removes all event listeners from the given element.<br/>
    * <br>
    * <b>Parameters:</b></br>
    * <br>
    * If 'elem' is a JavaScript object, the object needs to provide getDomObject() method (e.g. it should be a Marker, Circle, etc.).<br/>
    * <br>
    * <b>Example:</b><br />
    * <br>
    * <code>
	* Event.removeAllListeners(element); <br/><br/>
    * </code>
    * 
    * @type Event
    * @name removeAllListeners
    * @param elem: DOM element or Object
    * @return None
    */
    removeAllListeners: function(elem){
        if(typeof elem.getDomObject == 'function'){
            elem = elem.getDomObject();
            elem.unbind();
        } else if (elem.length > 0) {
            elem.unbind();
        }
    },
	
	isEmpty: function(obj) {		
		for(var prop in obj) {
			if(obj.hasOwnProperty(prop))
				return false;
		}
		return true;
	}
};