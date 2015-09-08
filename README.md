#TtT
Title to Tooltip - a tooltip plugin for jQuery

Small jQuery plug-in which adds a customizable
tool-tip to the selected set.  To use, simply
call the function TtT on a jQuery object
(ie: $("div").TtT()).


###Options
There are several options which can be passed to
TtT() as an object:

**fadeTime** (number, default 500):
The time (in milliseconds) that it takes
for the tool-tip to fade in and out.

**delay** (float, default 500)
The time (in milliseconds) to delay
before opening the tooltip.

**attrName** (string, default "title"):
The name of the attribute to draw the
tool-tip text from.

**removeAttr** (bool, default true):
If true, the existing attribute will be
removed after its value has been
captured.  In the case of "title", this
keeps the alt-text from popping up.

**className** (string, default "TtT"):
The class name to apply to the tool-tip.

**delay** (number, default 500):
The delay (in milliseconds) before a
tool-tip is displayed.

**drawPointer** (bool, default false):
If true, a styleable element will be
drawn at the top of the tool-tip which
can be used to point to the element in
question.

**pointerClassName** (string, default "TtTpointer"):
The class name to apply to the pointer.

**text** (string, default N/A):
If "text" parameter is provided, tooltip
content is taken from there and not from
attribute.  Attribute parameters
(removeAttr, attrName) are ignored.

Some suggestions:

- Both the pointer and the tool-tip should have their "position" set to "absolute" in your CSS.
- You may want to consider setting "pointer-events" to "none" for both the pointer and tool-tip.
- TtT sets position using "left" and "top".  If your tooltip is not exactly where you'd like it to be, it can be adjusted using "margin".
- If you're using the "title" attribute to source your text, you should probably keep "removeAttr" set to true, else both the TtT tool-tip, and the alt-text will be displayed.
- You can use HTML in your tooltips!  Just write it into the attribute you're using.  Remember to escape any reserved XML characters which you do want to keep!