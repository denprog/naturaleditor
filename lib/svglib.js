/**
 * SVG library
 * @class
 * @param {NaturalEditor} nte reference to the NaturalEditor object
 */
var SvgLib = Class.extend(
	{
		init : function(nte)
		{
			this.nte = nte;
		}, 
		
		/**
		 * Makes a group SGV object
		 * @public
		 * @param {Object} parentTag
		 * @param {Object} style
		 */
		svg : function(parentTag, style)
		{
			var groupObj = this.createElement("svg", parentTag);
			groupObj.setAttribute("width", 1);
			groupObj.setAttribute("height", 1);
			
			for (var s in style)
				groupObj.style[s] = style[s];
			
			parentTag.appendChild(groupObj);
			
			return groupObj;
		}, 

		createElement : function(tagName, parentTag)
		{
			if (!parentTag)
				return this.nte.document.createElementNS("http://www.w3.org/2000/svg", tagName);
			if (parentTag.ownerDocument)
				return parentTag.ownerDocument.createElementNS("http://www.w3.org/2000/svg", tagName);
			return parentTag.document.createElementNS("http://www.w3.org/2000/svg", tagName);
		}, 

		move : function(x, y, groupTag)
		{
			groupTag.setAttribute("x", x + "px");
			groupTag.setAttribute("y", y + "px");
		}, 
	
		setSize : function(width, height, groupTag)
		{
			groupTag.setAttribute("width", width + "px");
			groupTag.setAttribute("height", height + "px");
		}, 

		group : function(groupTag)
		{
			var obj = this.createElement("g", groupTag);
			groupTag.appendChild(obj);
			
			return obj;
		}, 

		line : function(left, top, right, bottom, color, groupTag)
		{
			var lineObj = this.createElement("line", groupTag);
			lineObj.setAttribute("x1", left);
			lineObj.setAttribute("y1", top);
			lineObj.setAttribute("x2", right);
			lineObj.setAttribute("y2", bottom);
			lineObj.setAttribute("style", "stroke:" + color + "; stroke-width:1");
			
			groupTag.appendChild(lineObj);
			
			return lineObj;
		}, 
		
		rect : function(x, y, width, height, color, parentTag)
		{
			var rectObj = this.createElement("rect", parentTag);
			rectObj.setAttribute("x", x);
			rectObj.setAttribute("y", y);
			rectObj.setAttribute("width", width);
			rectObj.setAttribute("height", height);
			rectObj.setAttribute("style", "stroke:" + color + "; stroke-width:1; fill:none");
	
			parentTag.appendChild(rectObj);
	
			return rectObj;
		}, 
		
		fillRect : function(x, y, width, height, fillColor, parentTag)
		{
			var rectObj = this.createElement("rect", parentTag);
			rectObj.setAttribute("x", x + "px");
			rectObj.setAttribute("y", y + "px");
			rectObj.setAttribute("width", width + "px");
			rectObj.setAttribute("height", height + "px");
			rectObj.setAttribute("style", "stroke:" + fillColor + "; stroke-width:1; fill:" + fillColor);

			parentTag.appendChild(rectObj);
	
			return rectObj;
		}, 

		moveRect : function(rect, x, y, width, height)
		{
			rect.setAttribute("x", x + "px");
			rect.setAttribute("y", y + "px");
			rect.setAttribute("width", width + "px");
			rect.setAttribute("height", height + "px");
		},
		
		fillCircle : function(x, y, radius, fillColor, parentTag)
		{
			var circleObj = this.createElement("circle", parentTag);
			circleObj.setAttribute("cx", x + "px");
			circleObj.setAttribute("cy", y + "px");
			circleObj.setAttribute("r", radius + "px");
			circleObj.setAttribute("style", "stroke:" + fillColor + "; stroke-width:1; fill:" + fillColor);

			parentTag.appendChild(circleObj);
	
			return circleObj;
		},
		
		text : function(x, y, val, parentTag, groupTag, font, textSpan)
		{
			var textObj = this.createElement("text", parentTag);
			textObj.setAttributeNS(null, "x", x);		
			textObj.setAttributeNS(null, "y", y);
			textObj.setAttributeNS(null, "width", 50);
			textObj.setAttributeNS(null, "height", 20);
			textObj.textContent = val;
			
			groupTag.appendChild(textObj);
			
			return textObj;
		}, 

//		animate : function(parentTag, attributeName, values, keyTimes, dur, begin, calcMode, repeatCount, restart, fill, accumulate, additive)
//		{
//			var animateObj = this.createElement("animate", parentTag);
//			
//			animateObj.setAttribute("attributeName", attributeName);
//			animateObj.setAttribute("values", values);
//			animateObj.setAttribute("keyTimes", keyTimes);
//			animateObj.setAttribute("dur", dur);
//			animateObj.setAttribute("begin", begin);
//			animateObj.setAttribute("calcMode", calcMode);
//			animateObj.setAttribute("repeatCount", repeatCount);
//			animateObj.setAttribute("restart", restart);
//			animateObj.setAttribute("fill", fill);
//			animateObj.setAttribute("accumulate", accumulate);
//			animateObj.setAttribute("additive", additive);
//
//			parentTag.appendChild(animateObj);
//	
//			return animateObj;
//		},

		animate : function(attributeName, from, to, dur, repeatCount, parentTag)
		{
			var animateObj = this.createElement("animate", parentTag);
			
			animateObj.setAttribute("attributeName", attributeName);
			//animateObj.setAttribute("begin", "0s");
			//animateObj.setAttribute("restart", "whenNotActive");
			//animateObj.setAttribute("fill", "remove");
			//animateObj.setAttribute("begin", "0");
			animateObj.setAttribute("from", from);
			animateObj.setAttribute("to", to);
			//animateObj.setAttribute("by", 10);
			animateObj.setAttribute("dur", dur);
			animateObj.setAttribute("repeatCount", repeatCount);
			animateObj.setAttribute("restart", "always");
			animateObj.setAttribute("fill", "freeze");
			//animateObj.setAttribute("end", "indefinite");
	
			parentTag.appendChild(animateObj);
	
			return animateObj;
		},

		remove : function(shape, groupTag)
		{
			groupTag.removeChild(shape);
		}
	}
);

var Paper = Class.extend(
	{
		init : function(lib, parent, style)
		{
			/**
			 * Draw library
			 */
			this.lib = lib;
			/**
			 * Paper's parent element
			 */
			this.parent = parent;
			/**
			 * Paper's group element
			 */
			this.group = lib.svg(this.parent, style);
			this.nodeShapes = new Array();
		}, 
		
		move : function(x, y)
		{
			this.parent.style.left = x + "px";
			this.parent.style.top = y + "px";
		}, 
		
		setSize : function(width, height)
		{
			this.lib.setSize(width, height, this.group);
		}, 
		
		addShape : function(shape)
		{
			this.nodeShapes.push(shape);
		},
		
		removeShape : function(shape)
		{
			for (var i in this.nodeShapes)
			{
				var s = this.nodeShapes[i];
				if (s == shape)
				{
					this.lib.remove(shape, this.group);
					this.shapes.splice(i, 1);
					return;
				}
			}
		},
		
		clearShapes : function()
		{
			for (var i in this.nodeShapes)
			{
				var shape = this.nodeShapes[i];
				this.lib.remove(shape, this.group);
			}
			this.nodeShapes.length = 0;
			
			this.lib.remove(this.group, this.parent);
			this.group = this.lib.svg(this.parent);
		}, 
		
		//draw functions
		
		line : function(left, top, right, bottom, color)
		{
			var shape = this.lib.line(left, top, right, bottom, color, this.group);
			this.addShape(shape);
			return shape;
		}, 
		
		rect : function(left, top, width, height)
		{
			var shape = this.lib.rect(left, top, width, height, this.parent, this.group);
			this.addShape(shape);
			return shape;
		}, 
		
		fillRect : function(left, top, width, height, fillColor)
		{
			var shape = this.lib.fillRect(left, top, width, height, fillColor, this.group);
			this.addShape(shape);
			return shape;
		},
		
		animate : function(attributeName, from, to, dur, repeatCount, parentTag)
		{
			var shape = this.lib.animate(attributeName, from, to, dur, repeatCount, parentTag);
			this.addShape(shape);
			return shape;
		}
	}
);
