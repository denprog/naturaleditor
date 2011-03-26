/**
 * Bold html node
 * @class
 * @extends HtmlNode
 * @param {} parentNode parent node
 * @param {} nodePos node insert position
 * @param {} textPos text insert position
 * @param {} nte reference to nte
*/
var BoldNode = HtmlNode.extend(
	{
		init : function(parentNode, pos, nte)
		{
			this._super("b", null, parentNode, pos, nte);
		}
	}
);
