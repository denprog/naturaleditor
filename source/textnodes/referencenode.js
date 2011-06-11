/**
 * @constructor
 */
var ReferenceNode = TextBaseNode.extend(
	{
		init : function(parentNode, pos, nte, element)
		{
			this._super("a", element, parentNode, pos, nte);
		}
	}
	);
