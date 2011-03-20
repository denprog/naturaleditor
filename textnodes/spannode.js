var SpanNode = HtmlNode.extend(
	/**
	 @lends HtmlNode
	 */
	{
		init : function(parentNode, pos, nte)
		{
			this._super("span", null, parentNode, pos, nte);
		}
	}
);
