"use strict";
/* General square type handler, with no mandatory prototypes. If GUI was passed as a variable (possibility), some
gui methods might be transferred here, therefore ommiting the 'square' argument. The passed functions are:

setDelay : 	t		-> see GUI.prototype.setSquareDelay
translate:	void	-> see GUI.prototype.translateSquare
hide:		void	-> ...
show:		void	-> ...
The data in square can have properties like
		style: a key-value map of the form css-property css-value. A saco!
*/

function Square(coords,data,gui){
	this.x=coords.x;
	this.y=coords.y;
	this.d=0;
	this.data=data;
	this.graphicObject=false;
	this.gui=gui?gui:undefined;
	this.animationTime=0;
	this.borders=[0,0,0,0];
}
Square.prototype.hide=function(){
	var str="Attempting to access GUI from square when access wasn't given.";
	return this.gui?this.gui.hideSquare(this):console.error(str);
}
Square.prototype.show=function(){
	var str="Attempting to access GUI from square when access wasn't given.";
	return this.gui?this.gui.showSquare(this):console.error(str);
}

Square.prototype.translate=function(){
	var str="Attempting to access GUI from square when access wasn't given.";
	return this.gui?this.gui.translateSquare(this):console.error(str);
}

Square.prototype.setDelay=function(t){
	var str="Attempting to access GUI from square when access wasn't given.";
	return this.gui?this.gui.setSquareDelay(this,t):console.error(str);
}
/*
General piece handler, pretty much like the one in the squares. May extend the GUI methods here, such as:
- translate
- setDelay
- show
- hide
- updateStyle
- animate
*/

function Piece(squares, data, ruleSet, gui) {
	this.squares=squares;
	this.data=data;
	this.offsx=0;
	this.offsy=0;
	this.ruleSet=ruleSet?ruleSet:undefined;
	this.gui=gui?gui:undefined;
}

Piece.prototype.translate=function(){
	var str="Attempting to access GUI from piece when access wasn't given.";
	if(this.gui) return this.gui.translatePiece(this);
	if(this.squares[0] && this.squares[0].gui) return this.squares[0].gui.translatePiece(this);
	return console.error(str)
}

Piece.prototype.setDelay=function(t){
	var str="Attempting to access GUI from piece when access wasn't given.";
	if(this.gui) return this.gui.setPieceDelay(this,t);
	if(this.squares[0] && this.squares[0].gui) return this.squares[0].gui.setPieceDelay(this,t);
	return console.error(str)
}

Piece.prototype.show=function(){
	var str="Attempting to access GUI from piece when access wasn't given.";
	if(this.gui) return this.gui.showPiece(this);
	if(this.squares[0] && this.squares[0].gui) return this.squares[0].gui.showPiece(this);
	return console.error(str)
}

Piece.prototype.hide=function(){
	var str="Attempting to access GUI from piece when access wasn't given.";
	if(this.gui) return this.gui.hidePiece(this);
	if(this.squares[0] && this.squares[0].gui) return this.squares[0].gui.hidePiece(this);
	return console.error(str)
}

Piece.prototype.updateStyle=function(){
	var str="Attempting to access GUI from piece when access wasn't given.";
	if(this.gui) return this.gui.updatePieceStyle(this);
	if(this.squares[0] && this.squares[0].gui) return this.squares[0].gui.updatePieceStyle(this);
	return console.error(str)
}

Piece.prototype.createGUI=function(){
	var str="Attempting to access GUI from piece when access wasn't given.";
	if(this.gui) return this.gui.createPieceGUI(this);
	if(this.squares[0] && this.squares[0].gui) return this.squares[0].gui.createPieceGUI(this);
	return console.error(str)
}

Piece.prototype.animate=function(){
	var str="Attempting to access GUI from piece when access wasn't given.";
	if(this.gui) return this.gui.animatePiece(this);
	if(this.squares[0] && this.squares[0].gui) return this.squares[0].gui.animatePiece(this);
	return console.error(str)
}

//those two should be standardized

Piece.prototype.canMove=function(dir){
	return this.ruleSet.canMove(this,dir);
}

///// this goes with ruleSet;
