//"use strict";
//document.addEventListener("DOMContentLoaded",createTable, false);

var browsers=["-webkit-", "-ms-", "-moz-", "-o-", "-khtml-",""];
function toggleClass(SQ,c){
	if(SQ.className && SQ.className.indexOf(c)!==-1) SQ.className=SQ.className.replece(new RegExp(c,'g'),'');
	else SQ.className=(SQ.className?SQ.className+' ':"")+c;
}
function setProperty(place,propName,propValue,needsPrefix) {
	if(needsPrefix==false) place.style.setProperty(propName,propValue);
	else
	browsers.forEach(function(prefix){place.style.setProperty(prefix+propName,(needsPrefix?prefix:'')+propValue)})
}


/*The GUI itself, has prototypes

	- createTable :		 		->	creates table in the handler
	- createSquareGUI:	square	->	creates html square in the handler, over the table (to do: ensure with z-indexes)
	- translateSquare:	square	->	translates the square to the [x,y] (base 9) position in the table
	- setSquareDelay:  square,t	->	sets the time the transition will have to move (probabily won't be accessed publicly)
	- hideSquare:		square  ->	hides the square
	- showSquare:		square  ->  shows the square
	- updateSquareStyle:square  ->  it sends square.data.style to square.squareObj.style
	- translatePiece: 	piece	->	like the 'square' one but with foreach, and traspasses the offset (maybe this should be improved)
	- randomStyle: 				->	that's it, sets the style for a random piece
	- setPieceDelay:   piece,t	->	No comments
	- hidePiece:		piece	->  "         "
	- showPiece:		piece	->  "         "
	- updatePieceStyle: piece	->  Sets every square style to the piece.data.style, and then updates their style
	- createPieceGUI:	piece	->  Iteration of the aforementioned
	- animatePiece:			piece	->  setPieceDelay+translate alltogether with the micro-delay;
	*/



var GUI=function(handler, screenDiv){
	this.GameHandler=handler;
	this.screenDiv=screenDiv;
	this.pointsHandler=false;
	this.handler=false;
	this.effectsHandler=false;
	this.isBusy=0;
	this.dt=0.025;
	this.destroyTime=0.5;
	this.styles={
		"appear-1":{"background-color":"rgba(255,40,40,0.2)", "border-color":"rgba(155,0,0,0.3)", 'border-radius':'25px'},
		"appear-2":{"background-color":"rgba(255,40,40,0.3)", "border-color":"rgba(155,0,0,0.5)", 'border-radius':'17px'},
		"appear-3":{"background-color":"rgba(255,40,40,0.4)", "border-color":"rgba(155,0,0,0.7)", 'border-radius':'10px'},
	}
	this.squareSize=75;
}



GUI.prototype.createTable=function(){
	this.handler=document.createElement('div');
	this.GameHandler.appendChild(this.handler);
	toggleClass(this.handler,'handler')

	var boilerPlate=document.createElement('div');
	boilerPlate.innerHTML="<table ><tbody><tr> <td name='0,0'></td> <td name='1,0'></td> <td name='2,0'></td> </tr><tr><td name='0,1'></td><td name='1,1'></td><td name='2,1'></td></tr><tr><td name='0,2'></td><td name='1,2'></td><td name='2,2'></td></tr></tbody></table>"
	var Table=boilerPlate.childNodes[0];
		
	var T=Table.cloneNode(true);
	toggleClass(T,'smallTable');
	var d=T.getElementsByTagName('td')
	for(var i=0; i<9;i++) toggleClass(d[i],'smallCell');
	
	var SQ=Table.cloneNode(true);
	toggleClass(SQ,'Abs-Center bigTable');	
	d=SQ.getElementsByTagName('td');
	var t;
	for(var i=8; i>=0;i--) {
		
		toggleClass(d[i], 'bigCell');
		t=T.cloneNode(true);
		if(i==4) {
			toggleClass(t, 'centerCell');
			toggleClass(d[i], 'centerRegion');
		}
		else if(i%2) {
			toggleClass(t, 'sideCell');
			toggleClass(d[i], 'sideRegion');
		}
		else {
			toggleClass(t, 'cornerCell');
			toggleClass(d[i], 'cornerRegion');
		}
		d[i].appendChild(t);
	}
	
	
	this.handler.appendChild(SQ);

	//for(var i=0; i<9;i++)createSquare(i,i);
	//for(var i=0; i<9;i++)createSquare(i,0);
}

GUI.prototype.createPointsEnv=function(){
	return;
	var pointsParent=document.createElement('div');
	this.GameHandler.appendChild(pointsParent);
	toggleClass(pointsParent,'pointsParent');
	pointsParent.appendChild(document.createElement('span'));

	var pointsBefore=document.createElement('div');
	pointsParent.appendChild(pointsBefore);
	toggleClass(pointsBefore,'pointsBefore');
	pointsBefore.appendChild(document.createTextNode('Record: '));
	pointsBefore.appendChild(document.createElement('span'));
	var pointsNow=document.createElement('div');
	pointsParent.appendChild(pointsNow);
	toggleClass(pointsNow,'pointsNow');
	pointsNow.appendChild(document.createElement('span'));
	this.pointsHandler={'now':pointsNow.getElementsByTagName('span')[0],
						'ever':pointsBefore.getElementsByTagName('span')[0] ,
						'parent':pointsParent.getElementsByTagName('span')[0] };
}

GUI.prototype.updatePoints=function(type, amount){
	return;
	this.pointsHandler[type].innerText=amount;
	this.pointsHandler[type].textContent=amount;
}

GUI.prototype.createButtons=function(){
	var buttonsParent=document.createElement('div');
	this.GameHandler.appendChild(buttonsParent);
	toggleClass(pointsParent,'buttonsParent');

	pointsParent.appendChild(button);
}


GUI.prototype.showPauseEnv=function(){
	this.screenDiv.className=("playing paused");
}

GUI.prototype.hideMenus=function(){
	this.screenDiv.className=("playing");
}


GUI.prototype.showEndEnv=function(){
	this.screenDiv.className=("playing ended");
}

GUI.prototype.createSquareGUI=function(squareObj) {
	var data=squareObj.data;
	var square=	document.createElement('div');
	square.style.display='none';
	this.handler.appendChild(square);
	toggleClass(square, 'square');
	square.style.top='-0.05px'; ///heeeeey
	square.style.left='-0.05px'; //what's this???
	console.log('marco');
	setProperty(square,'transition', "border-radius "+this.destroyTime/4+"s ease-out, background-color "+this.destroyTime/4+"s");
	console.log('polo');
	squareObj.graphicObject=square;
	return square;
}

GUI.prototype.updateSquareStyle=function(square) {
	for(var property in square.data.style) 
		if(typeof(square.data.style[property])=='string') 
			square.graphicObject.style.setProperty(property,square.data.style[property]);
	var borderProps=["border-right-color"     ,"border-top-color", "border-left-color", "border-bottom-color"]
	var radiusProps=["border-top-right-radius","border-top-left-radius", 'border-bottom-left-radius','border-bottom-right-radius' ]
	var radii=["0px","5%"]
	if(square.data.style.borderData)
		for(var i=0; i<square.borders.length;i++){
			square.graphicObject.style.setProperty(borderProps[i],square.data.style.borderData[square.borders[i]]);
			square.graphicObject.style.setProperty(radiusProps[i],radii[(1-square.borders[i])*(1-square.borders[(i+1)%4])]);			
		}

}

GUI.prototype.translateSquare=function (square){
	var order="transform";
	var sqs=this.squareSize;
	var str="translate("+ (100*square.x) +"% ,"+ (100*square.y) +"%)";
	setProperty(square.graphicObject, order, str);
	this.isBusy+=1;
	var that=this;
	window.setTimeout(function(){that.isBusy--},square.animationTime*1000)
}

GUI.prototype.setSquareDelay=function(square,t){
	var order="transition";
	var str="transform "+t+"s ease-in, opacity "+this.destroyTime+"s, border-radius "+this.destroyTime/4+"s ease";
	square.animationTime=t;
	setProperty(square.graphicObject, order, str,true);
}

GUI.prototype.showSquare=function(square){
	square.graphicObject.style.display='block';
}

GUI.prototype.hideSquare=function(square){
	square.graphicObject.style.display='none';
}

GUI.prototype.killSquare=function(x){
	x.graphicObject.style.opacity='0';
	window.setTimeout(function(x){
		if(x.graphicObject)
			x.graphicObject.parentNode.removeChild(x.graphicObject);
			x.graphicObject=false;
	},1000*this.destroyTime+1,x)

}

GUI.prototype.translatePiece=function(piece){
	for(var i=0; i<piece.squares.length;i++){
		piece.squares[i].x+=piece.offsx;
		piece.squares[i].y+=piece.offsy;
		this.translateSquare(piece.squares[i]);
	}
	piece.offsx=0;  // shouldn't be here in a final form
	piece.offsy=0;
}

GUI.prototype.randomStyle=function(){
	var a=Math.floor(Math.random()*255);
	var b=(50+Math.floor(Math.random()*50));
	var c=(17+Math.floor(Math.random()*15))
	return {"background-color": "hsl("+a+", "+b+"% ,"+2*c+"%)", 
			'borderData':["hsl("+a+", "+b+"% ,"+0.8*c+"%)", "hsl("+a+", "+b+"% ,"+1.4*c+"%)"] };
}

GUI.prototype.setPieceDelay=function(piece,t){
	for(var i=0; i<piece.squares.length;i++) this.setSquareDelay(piece.squares[i],t);
}

GUI.prototype.showPiece=function(piece){
	for(var i=0; i<piece.squares.length;i++) this.showSquare(piece.squares[i]);
}

GUI.prototype.hidePiece=function(piece){
	for(var i=0; i<piece.squares.length;i++) this.hideSquare(piece.squares[i]);
}

GUI.prototype.updatePieceStyle=function(piece) {
	if(piece.data.style=='random') piece.data.style=this.randomStyle();
	if(this.styles[piece.data.style]) piece.data.style=this.styles[piece.data.style];
	for(var i=0; i<piece.squares.length;i++) {
		piece.squares[i].data.style=piece.data.style;
		this.updateSquareStyle(piece.squares[i]);
	}
}

GUI.prototype.createPieceGUI=function(piece){
	for(var i=0; i<piece.squares.length;i++) this.createSquareGUI(piece.squares[i]);
}

GUI.prototype.animatePiece=function(piece){
	var t=Math.abs(piece.offsx)+Math.abs(piece.offsy);
	this.setPieceDelay(piece,this.dt*t*(18-t)/9);
	var that=this;
	window.setTimeout((function(gui,piece){return function(){gui.translatePiece(piece)} })(that,piece),1);
	return this.dt*t;
}

GUI.prototype.showScore=function(message){
	var h=document.createElement('div');
	h.innerText=message.text;
	h.textContent=message.text;
	if(message.class) toggleClass(h, message.class);
	toggleClass(h,'scoreBanner');
	this.showMessage(message.x,message.y,h);

	setTimeout(function(h){
		var time=((!message.time && message.time!==0)? 0.3:message.time);
		console.log('time:','all '+((!message.time && message.time!==0)? 0.3:message.time)+'s ease-in')
		setProperty(h,'transition','all '+time+'s ease-in')
		setTimeout(function(h){h.parentNode.removeChild(h)},time*1000+100,h)
		setTimeout(function(h) {
			var fact=(!message.fact && message.fact!==0) ?1.3:message.fact;
			fact+=','+fact;
			setProperty(h,'transform','scale('+fact+')')},5,h);
			setProperty(h,'z-index', 30)
			h.style.opacity=0;
	},5,h)
}


GUI.prototype.showMessage=function(i,j,node){


	this.handler.appendChild(node);
	node.style.position='absolute'
	var w=node.clientWidth;
	var h=node.clientHeight;
	node.style.left=(this.handler.clientWidth*(i+0.5)/3-w/2)+"px";
	node.style.top=(this.handler.clientHeight*(j+0.5)/3-h/2)+"px";

}