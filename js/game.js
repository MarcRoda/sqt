"use strict";
function Game(handler, screenDiv) {
	var that=this;
	this.GUI=new GUI(handler, screenDiv);
	this.ruleSet=new RuleSet(this.GUI);
	this.polys=this.ruleSet.polys;

	this.input=new Input(handler);
	this.inputFunction=function(msg){ 
		if(that.isBusy)
			return;
		if(msg.order=='move')
			that.makeTurn(msg.dir);
		if(msg.order=='pause')
			that.pause();
	}
	this.input.listenMovement(this.inputFunction);
	this.destructionPoints={'center':2000, 'border':750, 'corner': 500}
	this.turn=0;
	this.turnCombo=0;
	this.sizeFact=0.01;
	this.sizeZero=0.2;
	this.points=0;
	this.isBusy=false;
	this.isEnded=false;
	this.screenDiv=screenDiv;
}

Game.prototype.start=function(){
	this.GUI.createPointsEnv();
	this.GUI.createTable();
	this.ruleSet.nextPiece=this.createPiece(2);
	this.nextPiece();
	this.updatePoints();
}

Game.prototype.restart=function(x){
	if(this.isBusy & !x) return;
	this.isEnded=false;

	for(var i=0; i<this.polys.length;i++) 
		for(var j=0; j<this.polys[i].squares.length;j++) 
			this.GUI.killSquare(this.polys[i].squares[j]);
	this.ruleSet.polys=[]; 

	this.turn=0; 
	this.turnCombo=0;
	this.points=0; 
	this.polys=this.ruleSet.polys;

	this.nextPiece();
	this.updatePoints();
}



Game.prototype.pause=function(){
	this.GUI.showPauseEnv();
	this.isBusy=true;

}

Game.prototype.createPiece=function(size,style){ 
	console.log('size', size);
	var obj=this.ruleSet.newPiece(size,style?style:'random');
	this.ruleSet.checkBorders(obj);
	this.GUI.createPieceGUI(obj);
	return obj;
	//this.GUI.updatePieceStyle(obj);
	//this.GUI.showPiece(obj);
	//
}

Game.prototype.nextPiece=function(){
	if(!this.ruleSet.nextPiece) this.ruleSet.nextPiece=this.createPiece();
	var keepon=this.addPiece(this.ruleSet.nextPiece);
	if(!keepon) return this.lose();
	var k=0;
	console.log('sizeRandom',this.turn*this.sizeFact+this.sizeZero)
	while(k<2 && Math.random()<=this.turn*this.sizeFact+this.sizeZero)k++;

	this.ruleSet.nextPiece=this.createPiece(k+2,'appear-1');

	this.GUI.translatePiece(this.ruleSet.nextPiece);
	this.GUI.updatePieceStyle(this.ruleSet.nextPiece);
	this.GUI.showPiece(this.ruleSet.nextPiece);
	this.checkAndClean();
}

Game.prototype.lose=function(){
	//this.GUI.explodePiece(this.ruleSet.nextPiece)
}

Game.prototype.addPiece=function(piece){
	piece.data.style='random';
	var pts=piece.squares.length*(piece.squares.length-1)*10
	this.points+=pts;
	this.GUI.showScore({'text':"+"+pts, 'class':'piecePoints', 'x':1,'y':1});
	var cons=this.ruleSet.addObject(piece);
	if(cons=='hit') {return !(this.isEnded=true);}
	this.GUI.updatePieceStyle(piece);
	this.GUI.translatePiece(piece);
	this.GUI.showPiece(piece);
	return true;
}



Game.prototype.makeTurn=function(dir){
	var that=this;
	if(this.isBusy || this.isEnded) return;
	this.isBusy=true;
	this.turn++;
	var time=0;
	if(this.turn%3+1!=1)
	this.ruleSet.nextPiece.data.style='appear-'+(this.turn%3+1);
	this.GUI.updatePieceStyle(this.ruleSet.nextPiece);
	window.setTimeout(function(t,dir){t.faceTurn(dir)},time, that,dir);
	console.log('points',this.points);
}


Game.prototype.faceTurn=function(dir){
	var that=this;
	var time=this.makeMovement(dir);
	window.setTimeout(function(that,time,dir){that.checkAndClean(dir)},time*1000,that,time,dir)
}

Game.prototype.makeMovement=function(dir){
	var max=0;
	var that=this;
	this.ruleSet.move(dir);
	this.polys.forEach(function(x){var t=that.GUI.animatePiece(x); if(t>max) max=t});
	return max;
}

Game.prototype.checkAndClean=function(dir){
	console.log('pene');
	var that=this;
	var blocks=this.ruleSet.catchSquares();
	var toKill=this.ruleSet.squaresToDie(blocks);
	toKill.forEach(function(arr){that.GUI.killSquare(that.polys[arr[0]].squares[arr[1]])});
	this.ruleSet.clean(toKill);
	this.polys.forEach(function(x){that.ruleSet.checkBorders(x); that.GUI.updatePieceStyle(x)});
	if(toKill.length>0) {
		this.points+=blocks.reduce(function(x,y){return x+that.addPoints(y);},0);
		this.updatePoints();
		if(dir) window.setTimeout(function(that,dir){that.faceTurn(dir)},this.GUI.destroyTime*1000,that,dir);
		return this.GUI.destroyTime;
	}
	else if(dir) this.endTurn();
	return 0;
}


Game.prototype.addPoints=function(sq){
	var that=this;
	var type=(sq[0]==1 && sq[1]==1)?'center':( (sq[0]+sq[1])%2==1? 'border':'corner' );
	var points=this.destructionPoints[type];
	console.log(type+'Destruction');
	if(this.turnCombo==1) this.GUI.showScore({'text':"Combo!", 'class':'combo', 'x':1,'y':1, 'time': 0.7, 'fact':3})
	that.GUI.showScore({'text':"+"+points*(++this.turnCombo)+"!", 'class':type+'Destruction', 'x':sq[0],'y':sq[1], 'time': 0.5, 'fact':2})

	return points*(this.turnCombo); 
}

Game.prototype.endTurn=function(){
	var time;
	if(this.polys.length==0 && !this.noPieces){
		this.noPieces=true;
		this.points+=1000;
		this.GUI.showScore({'text':"Empty Box! \n +1000!", 'class':'emptyBox', 'x':1,'y':1, 'time': 0.5, 'fact':2})	
	}
	else{
		this.noPieces=false;
	}
	if(this.turn%3==0) {
		time=this.nextPiece();
	}
	this.updatePoints();
	this.isBusy=false;
	this.turnCombo=0;
}

Game.prototype.updatePoints=function(){
	this.GUI.updatePoints('now' , this.points+" points");
	this.GUI.updatePoints('ever', this.points+" points");
}
