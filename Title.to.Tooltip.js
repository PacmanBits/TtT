/*
//////////////////////////////////////////////////
//                                              //
//                                              //
//    Title(to)Tooltip       Sanford Gifford    //
//    v1.1                      June 5, 2015    //
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

/*
	Changes:
	
	1.2 - May 18, 2015
		- Removed "deep" option, wasn't in the spirit of jQuery and complicated code needlessly
		- Simplified architecture without sacrificing function
		- Lowered memory footprint by limiting scope of several variables
	
	1.1 - May 5, 2015
		Added "text" parameter.
	
	1.0 - Initial
		fadeTime, delay, attrName, removeAttr,
		deep, className, drawPointer,
		pointerClassName
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
	
	var elementID = 0;
	var toolTipData = {};
	var active = true;
	
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
		
		var body = $("body");
		
		this
			.each(function(fadeOut)
			{
				var me   = $(this)                   ;
				var myID = me.data(JQ_DATA_KEY_NAME) ;
				
				if(typeof myID !== "undefined")
				{
					var myData         = toolTipData[myID] ;
					    myData.options = opts              ;
					
					if(opts.text)
						myData.text = opts.text;
					else
						myData.text = me.attr(opts.attrName);
				}
				else
				{
					myID = elementID++;
					me.data(JQ_DATA_KEY_NAME, myID);
					
					var myData = toolTipData[myID] = {
						ID      : myID ,
						text    : ""   ,
						options : opts ,
						tipBox  : null
					};
					
					if(opts.text)
						myData.text = opts.text;
					else
						myData.text = me.attr(opts.attrName);
					
					var funcDelay = null;
					var mouseOver = false;
					
					// Event handlers.  Most of these are just calling removeTipBox, but by keeping them in separate functions we can easily tweak their behavior.
					
					function WindowBlurred(e)
					{
						removeTipBox(false);
					}
					
					function MouseScrolled(e)
					{
						removeTipBox(true);
					}
					
					function DOMNodeRemoved(e)
					{
						if(e.target === me[0])
						{
							removeTipBox();
						}
					}
					
					function removeTipBox(fadeOut)
					{
						if(funcDelay != null)
							clearTimeout(funcDelay);
						
						funcDelay = null;
						
						if(myData.tipBox == null)
							return;
						
						myData.tipBox.stop();
						
						if(fadeOut)
						{
							myData.tipBox.fadeOut(opts.fadeTime, function()
							{
								myData.tipBox.remove();
								myData.tipBox = null;
							});
						}
						else
						{
							myData.tipBox.remove();
							myData.tipBox  = null;
						}
						
						$(window).off("blur", WindowBlurred);
						$(window).off("mousewheel DOMMouseScroll", MouseScrolled);
						$(body).off("DOMNodeRemoved", DOMNodeRemoved);
					}
					
					function revealTipBox()
					{
						if(funcDelay != null)
							clearTimeout(funcDelay);
						
						funcDelay = setTimeout(function()
						{
							if(!mouseOver)
								return;
							
							if(myData.tipBox == null)
							{
								myData.tipBox = $("<div>")
									.appendTo(body)
									.addClass(opts.className)
									.html(myData.text)
									.hide();
							}
							
							var itemPos = me.offset();
							
							var targetPos = {
								x : ( (me.outerWidth() / 2) - (myData.tipBox.outerWidth() / 2) + itemPos.left ),
								y : ( me.outerHeight()                                         + itemPos.top  )
							};
							
							if(targetPos.x < 0)
								targetPos.x = 0;
							else if(targetPos.x + myData.tipBox.outerWidth() > body.width())
								targetPos.x = body.width() - myData.tipBox.outerWidth();
							
							if(targetPos.y < 0)
								targetPos.y = 0;
							else if(targetPos.y + myData.tipBox.outerHeight() > body.height())
								targetPos.y = body.height() - myData.tipBox.outerHeight();
							
							myData.tipBox.css({
								"left" : targetPos.x + "px",
								"top"  : targetPos.y + "px"
							});
							
							if(opts.drawPointer && targetPos.y > itemPos.top)
							{
								var pointer = $("<div>")
									.addClass(opts.pointerClassName)
									.appendTo(myData.tipBox);
									
								pointer.css({
									"left" : (itemPos.left - targetPos.x) + (me.outerWidth() / 2) - (pointer.outerWidth() / 2) + "px",
									"top"  : "0px"
								});
							}
							
							myData.tipBox.stop().fadeIn(opts.fadeTime);
							
							$(window).blur(WindowBlurred);
							$(window).on("mousewheel DOMMouseScroll", MouseScrolled);
							$(body).on("DOMNodeRemoved", DOMNodeRemoved);
						}, opts.delay);
					}
					
					me
						.mouseover(function(e)
						{
							mouseOver = true;
							
							if(!active)
								return;
							
							e.stopPropagation();
							
							revealTipBox();
						})
						.mouseout(  function() { mouseOver = false; removeTipBox(true);  } )
						.mousedown( function() {                    removeTipBox(false); } )
					;
					
					
				}
			});
		
		if(opts.removeAttr && !opts.text)
			this.removeAttr(opts.attrName);
		
		return this;
	}
})(jQuery);
