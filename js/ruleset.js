"use strict";
function RuleSet(gui) {
	this.GUI=gui;  // The graphical unit
	this.pId=0;	   // A counter for the piece ID
	this.polys=[]; // The list of existing pieces
	this.nextPiece=false;
	this.vectors={'u' : {'x' : 0, 'y' :-1},
				  'd' : {'x' : 0, 'y' : 1},
				  'r' : {'x' : 1, 'y' : 0},
				  'l' : {'x' :-1, 'y' : 0}};
	this.matrix=new Array(9);
	for(var i=0;i<9;i++) this.matrix[i]=new Array(9);
}

RuleSet.prototype.newId=function(){
	return this.pId++;
}

RuleSet.prototype.newPiece=function(size, style){
	var that=this;

	var createSquare=function(coords){ 
		//Maybe this shouldn't go here.. too GUI-like. We'll gotta think a work-around.
		//Probably the only "Bad part here is that the Square thing needs the GUI". Maybe
		//we should stop this cycling?
		var result = new Square(coords,data,that.GUI);
		return result;
	}

	var poly=function(size){
		var isTouching=function (x,y, v){
			for(var i=0; i<v.length;i++)
				if(x==v[i].x && y==v[i].y) return 0;
			for(var i=0; i<v.length;i++){
				if(x+1==v[i].x && y==v[i].y) return 1;
				if(x-1==v[i].x && y==v[i].y) return 2;
				if(x==v[i].x && y+1==v[i].y) return 3;
				if(x==v[i].x && y-1==v[i].y) return 4;
			}
			return 0;	
		}

		var x,y;
		x=Math.floor(Math.random()*3+3);
		y=Math.floor(Math.random()*3+3);
		var result=[{"x":x,"y":y}];
		


		for(var i=0; i<size-1;i++){
			while(true){
					//onsole.log(x,y);
					x=Math.floor(Math.random()*3+3);
					y=Math.floor(Math.random()*3+3);
					if(isTouching(x,y,result)) break;
			}
			result.push({"x":x,"y":y});
		}
		return result;
	}
	

	var data={'id': this.newId(), 'style': style};
	var p=poly(size);
	//onsole.log(p);
	var squares=p.map(createSquare);
	var piece = new Piece(squares,data,this);
	this.checkBorders(piece);
	return piece;
}

RuleSet.prototype.addObject=function(x){
	var k=this.checkInterference(x);
	if(k) 
		return 'hit';
	this.polys.push(x);
}

RuleSet.prototype.getMatrix=function(){

	for(var i=0; i<9;i++) 	for(var j=0; j<9;j++)
			this.matrix[i][j]=-1;

	var e;

	for(var i=0; i<this.polys.length;i++){
		for(var j=0; j<this.polys[i].squares.length;j++){
			e=this.polys[i].squares[j];
			this.matrix[e.x+this.polys[i].offsx][e.y+this.polys[i].offsy]=this.polys[i].data.id;
		}                                                 
	}
}

RuleSet.prototype.canMove=function(obj,dir){
	//onsole.log('dir',dir);
	var vec=this.vectors[dir];
	this.getMatrix();
	var fx, fy;
	for(var i=0; i<obj.squares.length;i++){
		//onsole.log('tic');
		//onsole.log(vec, obj.squares[i]);
		fx=obj.squares[i].x+obj.offsx+vec.x;
		fy=obj.squares[i].y+obj.offsy+vec.y;
		//onsole.log('toc');
		if(fx<0 || fy<0 || fx>=9 || fy>=9) return false;
		if( this.matrix[fx][fy]!==-1 && this.matrix[fx][fy]!==obj.data.id ) return false;
		//onsole.log(fx,fy);
	}
	return true;
}

RuleSet.prototype.move=function(dir){
	var vec=this.vectors[dir];
	var k=1;
	var s=0;
	var obj;
	while(k){
		k=0;
		for(var i=0; i<this.polys.length;i++){
			obj=this.polys[i];
			if(this.canMove(obj, dir)) {
				obj.offsx+=vec.x; 
				obj.offsy+=vec.y;
				k++;
				}
		}
		s+=k;
	}
	return s;
}

RuleSet.prototype.checkBorders=function(piece){
	var x,y,nx,ny,arr;
	for(var i=0; i<piece.squares.length;i++){
		arr=[0,0,0,0];
		x=piece.squares[i].x;
		y=piece.squares[i].y;
		for(var j=0; j<piece.squares.length;j++){
			nx=piece.squares[j].x;
			ny=piece.squares[j].y;
			if(x==nx){
				if(ny==y+1) arr[3]=1  //have sb at the bottom
				if(ny==y-1) arr[1]=1  //have sb at the top
			}	
			if(y==ny){
				if(nx==x+1) arr[0]=1  //have sb at the right
				if(nx==x-1) arr[2]=1  //have sb at the left
			}			
		}
		piece.squares[i].borders=arr;
	}
}

RuleSet.prototype.catchSquares=function(){
	this.getMatrix();
	var result=[];
	for(var i=0; i<3;i++) for(var j=0; j<3;j++){
		var s=0;
		for(var k=0; k<3;k++) for(var l=0; l<3;l++) s+=(this.matrix[3*i+k][3*j+l]==-1)? 0:1;
		if(s==9) result.push([i,j])
	}
	return result;
}

RuleSet.prototype.squaresToDie=function(cx){
	var catched=cx?cx:this.catchSquares();
	var result=[];
	var x, y;
	for(var i=0; i<catched.length;i++){
		for(var j=this.polys.length-1; j>=0;j--)for(var k=this.polys[j].squares.length-1; k>=0; k--){
			x=this.polys[j].squares[k].x+this.polys[j].offsx;
			y=this.polys[j].squares[k].y+this.polys[j].offsy;
			if((x-x%3)/3==catched[i][0] && (y-y%3)/3==catched[i][1]) 
				result.push([j,k]);
		}
	}
	return result;
}

RuleSet.prototype.clean=function(){
	var list=this.squaresToDie();
	this.cleanSquares(list);
	this.break();
	this.cleanEmpties();
}

RuleSet.prototype.cleanSquares=function(list){
	var i,j;
	for(var k=0; k<list.length;k++){
		i=list[k][0];
		j=list[k][1];
		this.polys[i].squares.splice(j,1)
	}
}

RuleSet.prototype.cleanEmpties=function(){
	for(var i=0; i<this.polys.length;i++){
		if(this.polys[i].squares.length==0 && i>=0){
			this.polys.splice(i,1);
			i--;
		}
	}
}

RuleSet.prototype.break=function(){
	var that=this;
	var c, mdata,piece;
	this.getMatrix();
	for(var i=0; i<this.polys.length;i++){
		if(this.polys[i].squares.length<=1) {
	
			continue;
		}
		for(var j=0; j<this.polys[i].squares.length; j++){
			c=this.polys[i].squares[j];
			if(c.x>0 && this.matrix[c.x-1][c.y  ]==this.polys[i].data.id) continue;
			if(c.x<8 && this.matrix[c.x+1][c.y  ]==this.polys[i].data.id) continue;
			if(c.y>0 && this.matrix[c.x  ][c.y-1]==this.polys[i].data.id) continue;
			if(c.y<8 && this.matrix[c.x  ][c.y+1]==this.polys[i].data.id) continue;
			this.polys[i].squares.splice(j,1);
			var mdata=JSON.parse(JSON.stringify(this.polys[i].data));
			mdata.id=this.newId();
			piece=new Piece([c], mdata,that,that.GUI); 
			j--;
			this.polys.push(piece);
		}
	}
}

RuleSet.prototype.checkInterference=function(piece){
	this.getMatrix();
	for(var i=0; i<piece.squares.length;i++){
		if(this.matrix[piece.squares[i].x+piece.offsx][piece.squares[i].y+piece.offsy]!==-1) return 1;
	}
	return 0;
}