SQT.prototype.newObject=

function piece(board){

	
	return result;
}

function poly(size){
	var isTouching=function (x,y, v){
		for(var i=0; i<v.length;i++)
			if(x==v[i].x && y==v[i].y) return 0;
		for(var i=0; i<v.length;i++){
			if(x+1==v[i].x && y==v[i].y) return 1;
			if(x-1==v[i].x && y==v[i].y) return 1;
			if(x==v[i].x && y+1==v[i].y) return 1;
			if(x==v[i].x && y-1==v[i].y) return 1;
		}
		return 0;	
	}

	var x,y;
	x=Math.floor(Math.random()*3+3);
	y=Math.floor(Math.random()*3+3);
	var result=[{"x":x,"y":y}];
	


	for(var i=0; i<size-1;i++){
		while(true){
				x=Math.floor(Math.random()*3+3);
				y=Math.floor(Math.random()*3+3);
				if(isTouching(x,y,result)==1) break;
		}
		result.push({"x":x,"y":y});
	}
	return result;
}