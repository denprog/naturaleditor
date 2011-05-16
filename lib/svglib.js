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
			//groupObj.setAttribute("xmlns", "http://www.w3.org/2000/svg");
			
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
			if (groupTag.nodeName == "g")
				groupTag.setAttribute("transform", "translate(" + x + " " + y + ")");
			else
			{
				groupTag.setAttribute("x", x + "px");
				groupTag.setAttribute("y", y + "px");
			}
			//groupTag.setAttribute("style", "x='" + x + "px' y='" + y + "px'");
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
			lineObj.setAttribute("style", "shape-rendering:crispedges; stroke:" + color + "; stroke-width:1");
			
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
			rectObj.setAttribute("style", "shape-rendering:crispedges; stroke:" + color + "; stroke-width:1px; fill:none");
	
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
			rectObj.setAttribute("style", "shape-rendering:crispedges; stroke:" + fillColor + "; stroke-width:1px; fill:" + fillColor);

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

		polygon : function(points, fillColor, parentTag)
		{
			var polygonObj = this.createElement("polygon", parentTag);
			polygonObj.setAttribute("points", points);
			polygonObj.setAttribute("style", "stroke:" + fillColor + "; stroke-width:1; fill:" + fillColor);

			parentTag.appendChild(polygonObj);
			
			return polygonObj;
		},

		bezier : function(path, fillColor, parentTag)
		{
			var bezierObj = this.createElement("path", parentTag);
			bezierObj.setAttribute("d", path);
			bezierObj.setAttribute("style", "stroke:" + fillColor + "; stroke-width:1; fill:" + fillColor);

			parentTag.appendChild(bezierObj);
			
			return bezierObj;
		},
		
		animate : function(attributeName, from, to, dur, repeatCount, parentTag)
		{
			var animateObj = this.createElement("animate", parentTag);
			
			animateObj.setAttribute("attributeName", attributeName);
			animateObj.setAttribute("from", from);
			animateObj.setAttribute("to", to);
			animateObj.setAttribute("dur", dur);
			animateObj.setAttribute("repeatCount", repeatCount);
			animateObj.setAttribute("restart", "always");
			animateObj.setAttribute("fill", "freeze");

//			animateObj.setAttribute("attributeName", "x");
//			//animateObj.setAttribute("attributeType", "XML");
//			animateObj.setAttribute("begin", "0s");
//			//animateObj.setAttribute("from", "-30");
//			//animateObj.setAttribute("to", "0");
//			animateObj.setAttribute("dur", "5s");
//			animateObj.setAttribute("from", "100");
//			animateObj.setAttribute("to", "300");
//			//animateObj.setAttribute("repeatCount", repeatCount);
//			//animateObj.setAttribute("restart", "always");
//			animateObj.setAttribute("fill", "freeze");

			parentTag.appendChild(animateObj);
	
			return animateObj;
		},

		remove : function(shape, groupTag)
		{
			groupTag.removeChild(shape);
		}
	}
);
