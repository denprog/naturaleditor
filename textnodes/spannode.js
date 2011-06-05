/**
 * @constructor
 */
var SpanNode = HtmlNode.extend(
	/**
	 @lends HtmlNode
	 */
	{
		init : function(parentNode, pos, nte, element)
		{
			this._super("span", element, parentNode, pos, nte);
		}
	}
);
