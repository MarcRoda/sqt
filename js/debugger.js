Debugger=function(){}

Debugger.post=function(what){
	parent=document.getElementById('errorConsole');
	if(parent.childNodes.length>10)
		while(parent.childNodes.length>9)
			parent.removeChild(
				parent.childNodes[9]);
	parent.insertBefore(what,parent.firstChild);
		
	
}

Debugger.log=function(str){
	var x=document.createElement('div');
	toggleClass(x,'debug');
	x.innerText=str;
	x.textValue=str;
	Debugger.post(x);
}

Debugger.warn=function(str){
	var x=document.createElement('div');
		toggleClass(x,'debug warning');
	x.innerText=str;
	x.textValue=str;
	Debugger.post(x);
}

Debugger.error=function(str){
	var x=document.createElement('div');
	toggleClass(x,'debug error');
	x.innerText=str;
	x.textValue=str;
	Debugger.post(x);
}