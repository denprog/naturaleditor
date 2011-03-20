var HeaderNode = HtmlNode.extend(
	{
	}
);

var Header1Node = HeaderNode.extend(
	{
		init : function(parentNode, pos, nte)
		{
			this._super("h1", null, parentNode, pos, nte);
		}
	}
);

var Header2Node = HeaderNode.extend(
	{
		init : function(parentNode, pos, nte)
		{
			this._super("h2", null, parentNode, pos, nte);
		}
	}
);

var Header3Node = HeaderNode.extend(
	{
		init : function(parentNode, pos, nte)
		{
			this._super("h3", null, parentNode, pos, nte);
		}
	}
);
