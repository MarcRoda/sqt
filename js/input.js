"use strict";
function Input(handler){
	this.handler=handler;
	this.events={};
}

Input.prototype.listenMovement = function (func) {
  var self = this;
  var map = {
    38: {'dir':'u', order:'move'}, // Up
    39: {'dir':'r', order:'move'}, // Right
    40: {'dir':'d', order:'move'}, // Down
    37: {'dir':'l', order:'move'}, // Left
    75: {'dir':'u', order:'move'}, // Vim up
    76: {'dir':'r', order:'move'}, // Vim right
    74: {'dir':'d', order:'move'}, // Vim down
    72: {'dir':'l', order:'move'}, // Vim left
    87: {'dir':'u', order:'move'}, // W
    68: {'dir':'r', order:'move'}, // D
    83: {'dir':'d', order:'move'}, // S
    65: {'dir':'l', order:'move'},  // A
    80: {order:'pause'},  // P

  };
  if (window.navigator.msPointerEnabled) {
    //Internet Explorer 10 style
    this.eventTouchstart    = "MSPointerDown";
    this.eventTouchmove     = "MSPointerMove";
    this.eventTouchend      = "MSPointerUp";
  } else {
    this.eventTouchstart    = "touchstart";
    this.eventTouchmove     = "touchmove";
    this.eventTouchend      = "touchend";
  }
  // Respond to direction keys
  document.addEventListener("keydown", function (event) {
    var modifiers = event.altKey || event.ctrlKey || event.metaKey ||
                    event.shiftKey;
    var mapped    = map[event.which];
    if (!modifiers) {
      if (mapped !== undefined) {
        event.preventDefault();
        func(mapped);
      }
    }

    if (!modifiers && event.which === 82) {
      func({order:'doubleTap'})
    }

  });

  var touchStartClientX, touchStartClientY;
  var gameContainer = this.handler;
  console.log(gameContainer);

  gameContainer.addEventListener(this.eventTouchstart, function (event) {
    if ((!window.navigator.msPointerEnabled && event.touches.length > 1) ||
        event.targetTouches > 1) {
      return; // Ignore if touching with more than 1 finger
    }

    if (window.navigator.msPointerEnabled) {
      touchStartClientX = event.pageX;
      touchStartClientY = event.pageY;
    } else {
      touchStartClientX = event.touches[0].clientX;
      touchStartClientY = event.touches[0].clientY;
    }

    event.preventDefault();
  });

  gameContainer.addEventListener(this.eventTouchmove, function (event) {
    event.preventDefault();
  });

  gameContainer.addEventListener(this.eventTouchend, function (event) {
    if ((!window.navigator.msPointerEnabled && event.touches.length > 0) ||
        event.targetTouches > 0) {
      return; // Ignore if still touching with one or more fingers
    }

    var touchEndClientX, touchEndClientY;

    if (window.navigator.msPointerEnabled) {
      touchEndClientX = event.pageX;
      touchEndClientY = event.pageY;
    } else {
      touchEndClientX = event.changedTouches[0].clientX;
      touchEndClientY = event.changedTouches[0].clientY;
    }

    var dx = touchEndClientX - touchStartClientX;
    var absDx = Math.abs(dx);

    var dy = touchEndClientY - touchStartClientY;
    var absDy = Math.abs(dy);

    if (Math.max(absDx, absDy) > 10) {
      // (right : left) : (down : up)
      func( {order:'move', dir:absDx > absDy ? (dx > 0 ? 'r' : 'l') : (dy > 0 ? 'd' : 'u')});
    }

    else{ //double tap to restart;
      if(self.isInTap){
        func({order:'pause'});
        self.isInTap=false;
      }
      else{
        self.isInTap=true;
        window.setTimeout(function(x){x.isInTap=false}, 250, self);
      }
    }
  });
};