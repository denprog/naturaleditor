/**
 * @constructor
 */
function Rectangle(left, top, width, height)
{
	this.setRect = function(left, top, width, height)
	{
		this.left = left;
		this.top = top;
		this.width = width;
		this.height = height;
		this.right = this.left + this.width;
		this.bottom = this.top + this.height;
	};

	this.setSize = function(width, height)
	{
		this.width = width;
		this.height = height;
		this.right = this.left + this.width;
		this.bottom = this.top + this.height;
	};

	this.setRectEmpty = function()
	{
		this.left = 0;
		this.top = 0;
		this.width = 0;
		this.height = 0;
		this.right = 0;
		this.bottom = 0;
	};

	this.isEmpty = function()
	{
		return this.width == 0 && this.height == 0;
	};
	
	this.offsetRect = function(cx, cy)
	{
		this.left += cx;
		this.top += cy;
		this.right = this.left + this.width;
		this.bottom = this.top + this.height;
	};
	
	this.dublicate = function()
	{
		return new Rectangle(this.left, this.top, this.width, this.height);
	};

	this.distToPoint = function(x, y)
	{
		var distToSegment = function(x1, y1, x2, y2)
			{
				if (x1 == x2 && y1 == y2)
					return Math.round(Math.sqrt(Math.pow(x - x1, 2) + Math.pow(y - y1, 2)));

				var d1 = Math.sqrt(Math.pow(x - x1, 2) + Math.pow(y - y1, 2));
				var d2 = Math.sqrt(Math.pow(x - x2, 2) + Math.pow(y - y2, 2));
				var r = Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
				var p = (d1 + d2 + r) / 2;
				
				if (p - d1 < 0)
					d1 = p;
				if (p - d2 < 0)
					d2 = p;
				
				var h = 2 * Math.sqrt(p * (p - r) * (p - d1) * (p - d2)) / r;
				var s = Math.sqrt(Math.pow(d1, 2) - Math.pow(h, 2));
				
				if (s > r)
					return Math.round(d2);
				
				s = Math.sqrt(Math.pow(d2, 2) - Math.pow(h, 2));
				
				if (s > r)
					return Math.round(d1);
				
				return Math.round(h);
			};
		
		var minDist = Number.MAX_VALUE, dist;
		
		//calculate distances to each side
		minDist = distToSegment(this.left, this.top, this.left, this.bottom);
		
		dist = distToSegment(this.left, this.top, this.right, this.top);
		if (minDist > dist)
			minDist = dist;

		dist = distToSegment(this.right, this.top, this.right, this.bottom);
		if (minDist > dist)
			minDist = dist;

		dist = distToSegment(this.left, this.bottom, this.right, this.bottom);
		if (minDist > dist)
			minDist = dist;
		
		return minDist;
	};
	
	this.pointInRect = function(x, y)
	{
		return x > this.left && x < this.right && y > this.top && y < this.bottom;
	};
	
	if (typeof(left) == "undefined" || typeof(top) == "undefined" || 
		typeof(width) == "undefined" || typeof(height) == "undefined")
		this.setRectEmpty();
	else
		this.setRect(left, top, width, height);
}

function Point(x, y)
{
	this.x = x;
	this.y = y;
}
