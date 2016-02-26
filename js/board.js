//squareTetris

function SQT(place, pointPlace, cookies){
	var that=this;
	this.turn=0;
	this.sizeLevel=5/10;
	this.steps=3;
	this.GUI=new GUIstuff(that, place);
	this.cookies= new cookieManager();

	this.level=0;
	this.points=0;
	this.turnPoints=0;
	this.pointPlace=pointPlace;
	this.maxPoints=this.cookies.get("sqt_maxpoints"),

	this.objs=[];

	this.nextObj=this.newObject();

	this.isBusy=false;
	this.isEnded=false;

	this.matrix=new Array(9);	
	for(var i=0; i<9;i++) {
		this.matrix[i]=new Array(9);
		for(var j=0; j<9;j++)
			this.matrix[i][j]=-1;
	}
	this.bonus=[
					function(that){//CLEAR BONUS
						if(that.objs.length!=0 || that.turn<=that.steps) return;
							that.points+=1000;
							that.GUI.cleanBonus();
					}
				];
	this.restart();
}


SQT.prototype.restart=function(){
	var that=this;
	console.log("Game restarted");
	if(this.isBusy && !this.isEnded) { return;}
	this.isBusy=false;
	this.isEnded=false;
	this.objs='a';
	this.objs=[];
	this.points=0;
	this.turnPoints=0;
	this.turn=-1;
	this.nextObj=this.newObject();

	var oldScore=this.cookies.get("sqt_maxpoints");
	if(!oldScore) 	this.cookies.create("sqt_maxpoints", "0", 30);
	oldScore=this.cookies.get("sqt_maxpoints"); 
	this.pointPlace.max.innerText=oldScore;
	this.maxPoints=parseInt(this.maxPoints);

	this.GUI.clearObjects();
	this.GUI.clearForeground();
	this.GUI.drawBg();
	this.sizeLevel=0.5;
	this.makeTurn();
}


SQT.prototype.newObject=function(){

	var isTouching=function (e, v){
		for(var i=0; i<v.length;i++)
			if(e[0]==v[i][0] && e[1]==v[i][1]) return 0;
		for(var i=0; i<v.length;i++){
			if(e[0]+1==v[i][0] && e[1]==v[i][1]) return 1;
			if(e[0]-1==v[i][0] && e[1]==v[i][1]) return 1;
			if(e[0]==v[i][0] && e[1]+1==v[i][1]) return 1;
			if(e[0]==v[i][0] && e[1]-1==v[i][1]) return 1;
		}
		return 0;	
	}

	/*var randomColor=function(){
		var r=Math.floor(Math.random()*70+37);
		var g=Math.floor(Math.random()*90+37);
		var b=Math.floor(Math.random()*90+37);
		return{"bg":"rgb("+r*2+","+g*2+","+b*2+")","line":"rgb("+r+","+g+","+b+")"}
	}	*/
	var randomColor=this.GUI.getColor;

	var r1,r2;
	r1=Math.floor(Math.random()*3+3);
	r2=Math.floor(Math.random()*3+3);
	var k=1;
	while(Math.random()<=this.sizeLevel && k<3)k++;
	var result=[[r1,r2]];
	for(var i=0; i<k;i++){
		while(true){
				r1=Math.floor(Math.random()*3+3);
				r2=Math.floor(Math.random()*3+3);
				if(isTouching([r1,r2],result)==1) break;
		}
		result.push([r1,r2]);
	}
	var colors=randomColor();
	var result={"fillColor":colors.bg,"lineColor":colors.line,"squares":result, "movingProcess": 1, "mvDir":[0,0],"id":this.turn+1}
	return result;
}

SQT.prototype.addObject=function(obj){
	this.getMatrix();
	for(var i=0; i<obj.squares.length;i++){
		if(this.matrix[obj.squares[i][0]][obj.squares[i][1]]!=-1){
			this.loseTheGame(obj);
			return 0;
			break;
		}
	}
	this.objs.push(obj);
	return 1;
}




SQT.prototype.getMatrix=function(){

	for(var i=0; i<9;i++) 	for(var j=0; j<9;j++)
			this.matrix[i][j]=-1;

	var e;

	for(var i=0; i<this.objs.length;i++){
		for(var j=0; j<this.objs[i].squares.length;j++){
			e=this.objs[i].squares[j];
			this.matrix[e[0]][e[1]]=i;
		}
	}
}

SQT.prototype.singleMove=function(dir){
	this.getMatrix();
	var ob;
	var canMove;
	var hasMoved=0;
	for(var i=0; i<this.objs.length;i++){
		this.objs[i].movingProcess+=0.25;
		ob=this.objs[i].squares;
		canMove=false;
		if(this.objs[i].movingProcess>=0.99){
			this.objs[i].movingProcess=1;
			for(var j=0; j<ob.length;j++){
				canMove=false;

				switch(dir){
					case 'r':
						if(ob[j][0]<8 && (this.matrix[ob[j][0]+1][ob[j][1]]==-1 || this.matrix[ob[j][0]+1][ob[j][1]]==i) )
							{canMove=true; this.objs[i].mvDir=[1,0]}
					break;
					case 'l':
						if(ob[j][0]>0 && (this.matrix[ob[j][0]-1][ob[j][1]]==-1 || this.matrix[ob[j][0]-1][ob[j][1]]==i) )
							{canMove=true; this.objs[i].mvDir=[-1,0]}
					break;
					case 'd':
						if(ob[j][1]<8 && (this.matrix[ob[j][0]][ob[j][1]+1]==-1 || this.matrix[ob[j][0]][ob[j][1]+1]==i) )
							{canMove=true; this.objs[i].mvDir=[0,1]}
					break;
					case 'u':
						if(ob[j][1]>0 && (this.matrix[ob[j][0]][ob[j][1]-1]==-1 || this.matrix[ob[j][0]][ob[j][1]-1]==i) )
							{canMove=true; this.objs[i].mvDir=[0,-1]}
					break;
					default: break;
				}

				if(canMove==0) break;
			}
		}
		else hasMoved=1;
		if(canMove===false) continue;
		hasMoved=1;
		for(var j=0; j<ob.length;j++) {
			switch(dir){
				case 'r':
					ob[j][0]++;
				break;
				case 'l':
					ob[j][0]--;
				break;
				case 'd':
					ob[j][1]++;
				break;
				case 'u':
					ob[j][1]--;
				break;
				default: break;
			}
		}
			this.objs[i].movingProcess=0;
	}
	this.getMatrix();
	return hasMoved;
}








SQT.prototype.catchColumns=function(x){
	var columns=[];
	var isgood;
	for(var i=0; i<9;i++){
		isgood=1;
		for(var j=0; j<9;j++){
			if(this.matrix[i][j]>=0) continue;
			if(x) console.log([i,j]);
			isgood=0;
			break;
		}
		if(isgood) columns.push(i);
	}

	return columns;
}

SQT.prototype.catchRows=function(x){
	var rows=[];
	var isgood;
	for(var i=0; i<9;i++){
		isgood=1;
		for(var j=0; j<9;j++){
			if(this.matrix[j][i]>=0) continue;
			if(x) console.log([i,j]);
			isgood=0;
			break;
		}
		if(isgood) rows.push(i);
	}

	return rows;
}

SQT.prototype.catchSquares=function(x){
	var squares=[];
	var isgood;
	for(var i=0; i<3;i++) for(var j=0; j<3;j++){
		isgood=1;
		for(var k=0; k<3;k++) for(var l=0; l<3;l++){
			if(this.matrix[3*i+k][3*j+l]>=0) continue;
			if(x) console.log([3*i+k,3*j+l]);
			isgood=0;
			break;			
		}
		if(isgood) squares.push([i,j]);
	}
	return squares;
}




SQT.prototype.cleanEmpties=function(){
	for(var i=0; i<this.objs.length;i++){
		if(this.objs[i].squares.length==0 && i>=0){
			this.objs.splice(i,1);
			i--;
		}
	}
}



SQT.prototype.cleanSquare=function (sq) {
	var c;
	for(var i=0; i<this.objs.length;i++){
		for(var j=0; j<this.objs[i].squares.length;j++){
			c=this.objs[i].squares[j];
			if((c[0]-(c[0]%3))/3==sq[0] && (c[1]-(c[1]%3))/3==sq[1]) {
				this.objs[i].squares.splice(j,1);
				j--;
			}
		}
	}
}

SQT.prototype.cleanSquares=function(sqs){
	for(var i=0; i<sqs.length;i++) 
		this.cleanSquare(sqs[i]);
}

SQT.prototype.cleanRow=function (rw) {
	var c;
	for(var i=0; i<this.objs.length;i++){
		for(var j=0; j<this.objs[i].squares.length;j++){
			c=this.objs[i].squares[j];
			if(c[1]==rw) {
				this.objs[i].squares.splice(j,1);
				j--;
			}
		}
	}
}

SQT.prototype.cleanRows=function(rws){
	for(var i=0; i<rws.length;i++) 
		this.cleanRow(rws[i]);
}

SQT.prototype.cleanCol=function (cl) {
	var c;
	for(var i=0; i<this.objs.length;i++){
		for(var j=0; j<this.objs[i].squares.length;j++){
			c=this.objs[i].squares[j];
			if(c[0]==cl) {
				this.objs[i].squares.splice(j,1);
				j--;
			}
		}
	}
}

SQT.prototype.cleanCols=function(cls){
	for(var i=0; i<cls.length;i++) 
		this.cleanCol(cls[i]);
}




SQT.prototype.break=function(){
	var c;
	this.getMatrix();
	for(var i=0; i<this.objs.length;i++){
		if(this.objs[i].squares.length<=1) continue;
		for(var j=0; j<this.objs[i].squares.length; j++){
			c=this.objs[i].squares[j];
			if(c[0]>0 && this.matrix[c[0]-1][c[1]  ]==i) continue;
			if(c[0]<8 && this.matrix[c[0]+1][c[1]  ]==i) continue;
			if(c[1]>0 && this.matrix[c[0]  ][c[1]-1]==i) continue;
			if(c[1]<8 && this.matrix[c[0]  ][c[1]+1]==i) continue;
			c=[c[0],c[1]];
			this.objs[i].squares.splice(j,1);
			j--;
			this.objs.push({"fillColor":this.objs[i].fillColor,
							"lineColor":this.objs[i].lineColor,
							"squares":[c], 
							"mvDir":this.objs[i].mvDir,
							"movingProcess":this.objs[i].movingProcess});
		}
	}
}



SQT.prototype.move=function(dir,theTurn,oneMore,callback){
	var that=this;
	this.GUI.clearObjects();
	this.GUI.drawObjects();
	if(theTurn%this.steps!=0)	this.GUI.drawObject(this.nextObj,theTurn%this.steps/4+0.05);
	else this.GUI.drawObject(this.nextObj,0.75);

	if(this.singleMove(dir)) window.setTimeout(function(dashit,y,z,t,u){dashit.move(y,t,z,u)},1,that,dir,true ,theTurn,callback);
	else if(oneMore)	     window.setTimeout(function(dashit,y,z,t,u){dashit.move(y,t,z,u)},1,that,dir,false,theTurn,callback);
	else this.physics(dir, theTurn, false, callback);
}


SQT.prototype.physics=function(dir,theTurn,firstTime, callback){
	var that=this;
	var cols=this.catchColumns();
	var rows=this.catchRows();
	var sqs=this.catchSquares();
	this.cleanSquares(sqs);
	this.cleanRows(rows);
	this.cleanCols(cols);
	this.cleanEmpties();
	this.break();

	for(var i=0; i<sqs.length; i++)
		this.GUI.destroySquare(sqs[i],"+"+(1+i)*500);

	var ag=cols.length+rows.length+sqs.length;
	if(ag!=0){
		this.turnPoints+=ag;
		this.showPoints(this.points+this.turnPoints*(this.turnPoints+1)*250)
	}
	if(firstTime) this.move(dir, theTurn, true, callback);
	else if (ag) window.setTimeout(function(a,x,y,z,t){a.move(x,y,z,t)},750, that,dir, theTurn, true,callback)
	else {
		callback(that);
	}
}



SQT.prototype.afterMove=function(){
		this.points+=this.turnPoints*(this.turnPoints+1)*250;
		this.sizeLevel+=this.turnPoints*0.02;
		if(this.turnPoints>0) console.log(this.sizeLevel);
		var that=this;
		for(var i=0; i<this.bonus.length; i++) this.bonus[i](that);
		if(this.turn%this.steps==0) {
			this.points+=5*this.nextObj.squares.length*(this.nextObj.squares.length+1) /2;
			this.showPoints;
	    	if(this.addObject(this.nextObj) ) this.isBusy=false;
	    	this.nextObj=this.newObject();
	    } 
	    else this.isBusy=false;

		this.showPoints();
		this.GUI.clearObjects();
		this.GUI.drawObjects();

	    if(this.turn%this.steps!=0)	
	    	this.GUI.drawObject(this.nextObj,(this.turn%this.steps)/4+0.01);

		this.turn++;	
}

SQT.prototype.showPoints=function(x){
	if(!x) x=this.points;
	this.pointPlace.now.innerText=x;
	if(this.maxPoints<x) {
		this.cookies.create("sqt_maxpoints", ''+x, 30);
		this.pointPlace.max.innerText=x;
		this.maxPoints=x;
	}

}

SQT.prototype.loseTheGame=function(cause){
	var that=this;

	cause.lineColor="#D22";
	cause.fillColor="rgba(255,0,0,0.5)"
	this.objs.push(cause);
	this.GUI.clearObjects();
	this.GUI.drawObjects();
	//cause.squares=[];
	window.setTimeout(function(t){t.GUI.end();}, 300, that);  
	//window.setTimeout(function(t){t.GUI.clearObjects();	t.restart();},1350,that);

}




SQT.prototype.makeTurn=function(dir){
	if(this.isBusy) return;
	this.turnPoints=0;
	this.isBusy=true;
    this.physics(dir, this.turn,1, function(that){that.afterMove()});
}



'[{"fillColor":"rgb(146,234,188)","lineColor":"rgb(73,117,94)","squares":[[0,1],[0,0]],"movingProcess":1,"mvDir":[0,-1]},{"fillColor":"rgb(134,186,162)","lineColor":"rgb(67,93,81)","squares":[[0,2],[1,2],[1,1],[1,0]],"movingProcess":1,"mvDir":[0,-1]},{"fillColor":"rgb(172,246,102)","lineColor":"rgb(86,123,51)","squares":[[3,1],[3,0],[3,2]],"movingProcess":1,"mvDir":[-1,0]}]'