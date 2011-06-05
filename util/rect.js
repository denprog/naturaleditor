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
