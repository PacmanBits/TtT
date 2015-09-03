/*
//////////////////////////////////////////////////
//                                              //
//                                              //
//    Title(to)Tooltip       Sanford Gifford    //
//    v1.21                    July 15, 2015    //
//                                              //
//                                              //
//////////////////////////////////////////////////

Small jQuery plug-in which adds a customizable
tool-tip to the selected set.  To use, simply
call the function TtT on a jQuery object
(ie: $("div").TtT()).

There are several options which can be passed to
TtT() as an object:

	fadeTime (number, default 500):
		The time (in milliseconds) that it takes
		for the tool-tip to fade in and out.
	
	delay (float, default 500)
		The time (in milliseconds) to delay
		before opening the tooltip.

	attrName (string, default "title"):
		The name of the attribute to draw the
		tool-tip text from.

	removeAttr (bool, default true):
		If true, the existing attribute will be
		removed after its value has been
		captured.  In the case of "title", this
		keeps the alt-text from popping up.

	className (string, default "TtT"):
		The class name to apply to the tool-tip.

		delay (number, default 500):
		The delay (in milliseconds) before a
		tool-tip is displayed.

	drawPointer (bool, default false):
		If true, a styleable element will be
		drawn at the top of the tool-tip which
		can be used to point to the element in
		question.

	pointerClassName (string, default "TtTpointer"):
		The class name to apply to the pointer.
	
	text (string, default N/A):
		If "text" parameter is provided, tooltip
		content is taken from there and not from
		attribute.  Attribute parameters
		(removeAttr, attrName) are ignored.

Some suggestions:

 - Both the pointer and the tool-tip should have
	their "position" set to "absolute" in your
	CSS.
 - You may want to consider setting
	"pointer-events" to "none" for both the
	pointer and tool-tip.
 - TtT sets position using "left" and "top".  If
	your tooltip is not exactly where you'd like
	it to be, it can be adjusted using "margin".
 - If you're using the "title" attribute to
	source your text, you should probably keep
	"removeAttr" set to true, else both the TtT
	tool-tip, and the alt-text will be displayed.
 - You can use HTML in your tooltips!  Just write
	it into the attribute you're using.  Remember
	to escape any reserved XML characters which
	you do want to keep!
*/


(function($)
{
	var JQ_DATA_KEY_NAME = "TtTID";
	var DEFAULT_OPTIONS  = {
		fadeTime         : 500          ,
		attrName         : "title"      ,
		removeAttr       : true         ,
		className        : "TtT"        ,
		delay            : 500          ,
		drawPointer      : false        ,
		pointerClassName : "TtTpointer"
	};
	
	var elementID   = 0    ;
	var toolTipData = {}   ;
	var active      = true ;
	var $body              ;
	var $window            ;
	
	$(function()
	{
		$body   = $("body") ;
		$window = $(window) ;
	});
	
	function checkExistingTooltips()
	{
		for(var t in toolTipData)
		{
			var tip = toolTipData[t].tipBox ;
			var el  = toolTipData[t].el     ;
			
			if(el)
			{
//				if(!jQuery.contains(document, el[0]) && tip) // is the el which this started on still attached to the DOM?
					
			}
		}
	}
	
	$.TtT = {};
	
	$.TtT.TurnOn = function()
	{
		active = true;
	};
	
	$.TtT.TurnOff = function()
	{
		active = false;
	};
	
	$.TtT.Toggle = function()
	{
		active = !active;
	};
	
	// TODO: This function is not complete and does not work.  Finish it.
	$.fn.removeTtT = function()
	{
		this
			.each(function(fadeOut)
			{
				var me   = $(this)                   ;
				var myID = me.data(JQ_DATA_KEY_NAME) ;
				
				if(typeof myID !== "undefined")
				{
					var myData = toolTipData[myID] ;
				}
			});
	};
	
	$.fn.addTtT = function(options)
	{
		var opts = $.extend({}, DEFAULT_OPTIONS, options);
		
		this
			.each(function(fadeOut)
			{
				var el = $(this)                   ;
				var ID = el.data(JQ_DATA_KEY_NAME) ;
				
				if(typeof ID !== "undefined")
				{
					var tip      = toolTipData[ID] ;
					    tip.opts = opts            ;
					
					if(opts.text)
						tip.text = opts.text;
					else
						tip.text = el.attr(opts.attrName);
				}
				else
				{
					new Tip(el, opts);
				}
			});
		
		if(opts.removeAttr && !opts.text)
			this.removeAttr(opts.attrName);
		
		return this;
	}
	
	function Tip(el, opts)
	{
		var tip    = this                  ;
		this.el    = el                    ; // the element that the tip box is attached to
		this.opts  = opts                  ; // the options used to instantiate the tip box
		var tipBox = null                  ; // the element that we'll be creating for the tip box
		var ID     = this.ID = elementID++ ; // keep a non-modifiable copy of ID private inside of object
		
		toolTipData[ID] = this; // include this tip  box in the registry
		el.data(JQ_DATA_KEY_NAME, ID); // Attach the ID of this tip box to the element we're attaching it to for look ups
		
		if(opts.text)
			this.text = opts.text;
		else
			this.text = el.attr(opts.attrName);
		
		var funcDelay = null;
		var mouseOver = false;
		
		// Event handlers.  Most of these are just calling removeTipBox, but by keeping them in separate functions we can easily tweak their behavior.
		
		function WindowBlurred(e)
		{
			tip.removeTipBox(false);
		}
		
		function MouseScrolled(e)
		{
			tip.removeTipBox(true);
		}
		
		function DOMNodeRemoved(e)
		{
			console.log("DOMNodeRemoved: " + e.target.outerHTML);
			console.log(e.target === el[0]);
			// TODO:  MAKE SURE THIS IF STATEMENT IS VALID!!!!  I really think this could be our hanging tip problem
			if(e.target === el[0])
			{
				tip.removeTipBox();
			}
		}
		
		this.removeTipBox = function(fadeOut)
		{
			if(funcDelay != null)
				clearTimeout(funcDelay);
			
			funcDelay = null;
			
			if(tipBox == null)
				return;
			
			tipBox.stop();
			
			if(fadeOut)
			{
				tipBox.fadeOut(opts.fadeTime, function()
				{
					tipBox.remove();
					tipBox = null;
				});
			}
			else
			{
				tipBox.remove();
				tipBox  = null;
			}
			
			$window.off( "blur",                      WindowBlurred  );
			$window.off( "mousewheel DOMMouseScroll", MouseScrolled  );
			$body.off(   "DOMNodeRemoved",            DOMNodeRemoved );
		}
		
		this.revealTipBox = function()
		{
			if(funcDelay != null)
				clearTimeout(funcDelay);
			
			funcDelay = setTimeout(function()
			{
				if(!mouseOver)
					return;
				
				if(tipBox == null)
				{
					tipBox = $("<div>")
						.appendTo($body)
						.addClass(opts.className)
						.html(tip.text)
						.hide();
				}
				
				var itemPos = el.offset();
				
				var targetPos = {
					x : ( (el.outerWidth() / 2) - (tipBox.outerWidth() / 2) + itemPos.left ) ,
					y : ( el.outerHeight()                                  + itemPos.top  )
				};
				
				if(targetPos.x < 0)
					targetPos.x = 0;
				else if(targetPos.x + tipBox.outerWidth() > $window.width())
					targetPos.x = $window.width() - tipBox.outerWidth();
				
				if(targetPos.y < 0)
					targetPos.y = 0;
				else if(targetPos.y + tipBox.outerHeight() > $window.height())
					targetPos.y = $window.height() - tipBox.outerHeight();
				
				tipBox.css({
					"left" : targetPos.x + "px",
					"top"  : targetPos.y + "px"
				});
				
				if(opts.drawPointer && targetPos.y > itemPos.top)
				{
					var pointer = $("<div>")
						.addClass(opts.pointerClassName)
						.appendTo(tipBox);
						
					pointer.css({
						"left" : (itemPos.left - targetPos.x) + (el.outerWidth() / 2) - (pointer.outerWidth() / 2) + "px",
						"top"  : "0px"
					});
				}
				
				tipBox.stop().fadeIn(opts.fadeTime);
				
				$window.blur(WindowBlurred);
				$window.on("mousewheel DOMMouseScroll", MouseScrolled);
				$body.on("DOMNodeRemoved", DOMNodeRemoved);
			}, opts.delay);
		}
		
		el
			.mouseover(function(e)
			{
				mouseOver = true;
				
				if(!active)
					return;
				
				e.stopPropagation();
				
				tip.revealTipBox();
			})
			.mouseout(  function() { mouseOver = false; tip.removeTipBox(true);  } )
			.mousedown( function() {                    tip.removeTipBox(false); } )
		;
	}
})(jQuery);