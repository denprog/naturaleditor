/**
 * @constructor
 */
var HeaderNode = TextBaseNode.extend(
	{
		//util functions

		getFormat : function()
		{
			return this.element.nodeName.toLowerCase();
		}
	}
);

/**
 * @constructor
 */
var Header1Node = HeaderNode.extend(
	{
		init : function(parentNode, pos, nte)
		{
			this._super("h1", null, parentNode, pos, nte);
		}
	}
);

/**
 * @constructor
 */
var Header2Node = HeaderNode.extend(
	{
		init : function(parentNode, pos, nte)
		{
			this._super("h2", null, parentNode, pos, nte);
		}
	}
);

/**
 * @constructor
 */
var Header3Node = HeaderNode.extend(
	{
		init : function(parentNode, pos, nte)
		{
			this._super("h3", null, parentNode, pos, nte);
		}
	}
);
