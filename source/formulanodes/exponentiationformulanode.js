/**
 * Exponentiation formula node.
 * @class ExponentiationFormulaNode
 * @constructor
 */
var ExponentiationFormulaNode = SuperscriptFormulaNode.extend(
	{
		init : function(parentNode, pos, nte)
		{
			this.drawLib = nte.drawLib;
			
			this.levelClasses = {};
			this.levelClasses[NodeLevel.NORMAL] = "normalExponentationFormulaNode";
			this.levelClasses[NodeLevel.LESS] = "lessExponentationFormulaNode";
			this.levelClasses[NodeLevel.STILL_LESS] = "stillLessExponentationFormulaNode";

			this._super(parentNode, pos, nte);
			this.className = "ExponentiationFormulaNode";
		}, 
		
		//editing
		
		dublicate : function(parent)
		{
			var resNode = new ExponentiationFormulaNode(parent, 
				this.parentNode == null ? 0 : this.parentNode.getChildPos(this), this.nte);
			
			resNode.caretState = this.caretState;
			this.base.dublicate(resNode);
			this.exponent.dublicate(resNode);
			
			resNode.groupNode = this.groupNode;
			
			return resNode;
		}
	}
);
