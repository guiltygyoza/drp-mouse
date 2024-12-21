(()=>{"use strict";var t={6645:(t,e,s)=>{s.r(e),s.d(e,{PerfectCursor:()=>a});var r=class{static clamp(t,e,s){return Math.max(e,void 0!==s?Math.min(t,s):t)}static clampV(t,e,s){return t.map((t=>s?r.clamp(t,e,s):r.clamp(t,e)))}static cross(t,e,s){return(e[0]-t[0])*(s[1]-t[1])-(s[0]-t[0])*(e[1]-t[1])}static snap(t,e=1){return[Math.round(t[0]/e)*e,Math.round(t[1]/e)*e]}},i=r;i.neg=t=>[-t[0],-t[1]],i.add=(t,e)=>[t[0]+e[0],t[1]+e[1]],i.addScalar=(t,e)=>[t[0]+e,t[1]+e],i.sub=(t,e)=>[t[0]-e[0],t[1]-e[1]],i.subScalar=(t,e)=>[t[0]-e,t[1]-e],i.vec=(t,e)=>[e[0]-t[0],e[1]-t[1]],i.mul=(t,e)=>[t[0]*e,t[1]*e],i.mulV=(t,e)=>[t[0]*e[0],t[1]*e[1]],i.div=(t,e)=>[t[0]/e,t[1]/e],i.divV=(t,e)=>[t[0]/e[0],t[1]/e[1]],i.per=t=>[t[1],-t[0]],i.dpr=(t,e)=>t[0]*e[0]+t[1]*e[1],i.cpr=(t,e)=>t[0]*e[1]-e[0]*t[1],i.len2=t=>t[0]*t[0]+t[1]*t[1],i.len=t=>Math.hypot(t[0],t[1]),i.pry=(t,e)=>r.dpr(t,e)/r.len(e),i.uni=t=>r.div(t,r.len(t)),i.normalize=t=>r.uni(t),i.tangent=(t,e)=>r.uni(r.sub(t,e)),i.dist2=(t,e)=>r.len2(r.sub(t,e)),i.dist=(t,e)=>Math.hypot(t[1]-e[1],t[0]-e[0]),i.fastDist=(t,e)=>{const s=[e[0]-t[0],e[1]-t[1]],r=[Math.abs(s[0]),Math.abs(s[1])];let i=1/Math.max(r[0],r[1]);return i*=1.29289-(r[0]+r[1])*i*.29289,[s[0]*i,s[1]*i]},i.ang=(t,e)=>Math.atan2(r.cpr(t,e),r.dpr(t,e)),i.angle=(t,e)=>Math.atan2(e[1]-t[1],e[0]-t[0]),i.med=(t,e)=>r.mul(r.add(t,e),.5),i.rot=(t,e=0)=>[t[0]*Math.cos(e)-t[1]*Math.sin(e),t[0]*Math.sin(e)+t[1]*Math.cos(e)],i.rotWith=(t,e,s=0)=>{if(0===s)return t;const r=Math.sin(s),i=Math.cos(s),n=t[0]-e[0],o=t[1]-e[1],a=n*r+o*i;return[n*i-o*r+e[0],a+e[1]]},i.isEqual=(t,e)=>t[0]===e[0]&&t[1]===e[1],i.lrp=(t,e,s)=>r.add(t,r.mul(r.sub(e,t),s)),i.int=(t,e,s,i,n=1)=>{const o=(r.clamp(s,i)-s)/(i-s);return r.add(r.mul(t,1-o),r.mul(e,n))},i.ang3=(t,e,s)=>{const i=r.vec(e,t),n=r.vec(e,s);return r.ang(i,n)},i.abs=t=>[Math.abs(t[0]),Math.abs(t[1])],i.rescale=(t,e)=>{const s=r.len(t);return[e*t[0]/s,e*t[1]/s]},i.isLeft=(t,e,s)=>(e[0]-t[0])*(s[1]-t[1])-(s[0]-t[0])*(e[1]-t[1]),i.clockwise=(t,e,s)=>r.isLeft(t,e,s)>0,i.toFixed=(t,e=2)=>t.map((t=>+t.toFixed(e))),i.nearestPointOnLineThroughPoint=(t,e,s)=>r.add(t,r.mul(e,r.pry(r.sub(s,t),e))),i.distanceToLineThroughPoint=(t,e,s)=>r.dist(s,r.nearestPointOnLineThroughPoint(t,e,s)),i.nearestPointOnLineSegment=(t,e,s,i=!0)=>{const n=r.uni(r.sub(e,t)),o=r.add(t,r.mul(n,r.pry(r.sub(s,t),n)));if(i){if(o[0]<Math.min(t[0],e[0]))return t[0]<e[0]?t:e;if(o[0]>Math.max(t[0],e[0]))return t[0]>e[0]?t:e;if(o[1]<Math.min(t[1],e[1]))return t[1]<e[1]?t:e;if(o[1]>Math.max(t[1],e[1]))return t[1]>e[1]?t:e}return o},i.distanceToLineSegment=(t,e,s,i=!0)=>r.dist(s,r.nearestPointOnLineSegment(t,e,s,i)),i.nudge=(t,e,s)=>r.isEqual(t,e)?t:r.add(t,r.mul(r.uni(r.sub(e,t)),s)),i.nudgeAtAngle=(t,e,s)=>[Math.cos(e)*s+t[0],Math.sin(e)*s+t[1]],i.toPrecision=(t,e=4)=>[+t[0].toPrecision(e),+t[1].toPrecision(e)],i.pointsBetween=(t,e,s=6)=>Array.from(Array(s)).map(((i,n)=>{const o=n/(s-1),a=Math.min(1,.5+Math.abs(.5-o));return[...r.lrp(t,e,o),a]})),i.slope=(t,e)=>t[0]===e[0]?NaN:(t[1]-e[1])/(t[0]-e[0]),i.max=(...t)=>[Math.max(...t.map((t=>t[0]))),Math.max(...t.map((t=>t[1])))],i.min=(...t)=>[Math.max(...t.map((t=>t[0]))),Math.max(...t.map((t=>t[1])))];var n=class{constructor(t=[]){this.points=[],this.lengths=[],this.totalLength=0,this.addPoint=t=>{if(this.prev){const e=i.dist(this.prev,t);this.lengths.push(e),this.totalLength+=e,this.points.push(t)}this.prev=t},this.clear=()=>{this.points=this.prev?[this.prev]:[],this.totalLength=0},this.getSplinePoint=t=>{const{points:e}=this,s=e.length-1,r=Math.trunc(t),i=Math.min(r+1,s),n=Math.min(i+1,s),o=Math.min(n+1,s),a=i-1,h=t-r,u=h*h,c=u*h,d=2*u-c-h,p=3*c-5*u+2,m=-3*c+4*u+h,l=c-u;return[(e[a][0]*d+e[i][0]*p+e[n][0]*m+e[o][0]*l)/2,(e[a][1]*d+e[i][1]*p+e[n][1]*m+e[o][1]*l)/2]},this.points=t,this.lengths=t.map(((t,e,s)=>0===e?0:i.dist(t,s[e-1]))),this.totalLength=this.lengths.reduce(((t,e)=>t+e),0)}},o=class{constructor(t){this.state="idle",this.queue=[],this.timestamp=performance.now(),this.lastRequestId=0,this.timeoutId=0,this.spline=new n,this.addPoint=t=>{clearTimeout(this.timeoutId);const e=performance.now(),s=Math.min(e-this.timestamp,o.MAX_INTERVAL);if(!this.prevPoint)return this.spline.clear(),this.prevPoint=t,this.spline.addPoint(t),this.cb(t),void(this.state="stopped");if("stopped"===this.state){if(i.dist(this.prevPoint,t)<4)return void this.cb(t);this.spline.clear(),this.spline.addPoint(this.prevPoint),this.spline.addPoint(this.prevPoint),this.spline.addPoint(t),this.state="idle"}else this.spline.addPoint(t);if(s<16)return this.prevPoint=t,this.timestamp=e,void this.cb(t);const r={start:this.spline.points.length-3,from:this.prevPoint,to:t,duration:s};switch(this.prevPoint=t,this.timestamp=e,this.state){case"idle":this.state="animating",this.animateNext(r);break;case"animating":this.queue.push(r)}},this.animateNext=t=>{const e=performance.now(),s=()=>{const r=(performance.now()-e)/t.duration;if(r<=1&&this.spline.points.length>0){try{this.cb(this.spline.getSplinePoint(r+t.start))}catch(t){console.warn(t)}return void(this.lastRequestId=requestAnimationFrame(s))}const i=this.queue.shift();i?(this.state="animating",this.animateNext(i)):(this.state="idle",this.timeoutId=setTimeout((()=>{this.state="stopped"}),o.MAX_INTERVAL))};s()},this.dispose=()=>{clearTimeout(this.timeoutId)},this.cb=t}},a=o;a.MAX_INTERVAL=300},4868:(t,e,s)=>{Object.defineProperty(e,"__esModule",{value:!0}),e.CursorManager=void 0;const r=s(6645),i=s(5433);e.CursorManager=class{constructor(){this.cursors=new Map}hasCursor(t){return this.cursors.has(t)}createCursor(t){const e=document.createElement("div");e.className="remote-cursor",e.style.position="fixed",e.style.pointerEvents="none",e.style.width="24px",e.style.height="24px",e.style.backgroundImage=`url(${(0,i.getEmojiForNodeId)(t)})`,e.style.backgroundSize="contain",document.body.appendChild(e);const s=new r.PerfectCursor((t=>{e.style.transform=`translate(${t[0]}px, ${t[1]}px)`}));this.cursors.set(t,{element:e,perfectCursor:s})}updateCursor(t,e){console.log("updateCursor",t,e);const s=this.cursors.get(t);s&&s.perfectCursor.addPoint(e)}removeCursor(t){const e=this.cursors.get(t);e&&(e.perfectCursor.dispose(),e.element.remove(),this.cursors.delete(t))}dispose(){this.cursors.forEach((t=>{t.perfectCursor.dispose(),t.element.remove()})),this.cursors.clear()}}},5433:(t,e)=>{Object.defineProperty(e,"__esModule",{value:!0}),e.getEmojiForNodeId=function(t){return`https://api.dicebear.com/7.x/bottts/svg?seed=${t.split("").reduce(((t,e)=>t+e.charCodeAt(0)),0)}`}}},e={};function s(r){var i=e[r];if(void 0!==i)return i.exports;var n=e[r]={exports:{}};return t[r](n,n.exports,s),n.exports}s.d=(t,e)=>{for(var r in e)s.o(e,r)&&!s.o(t,r)&&Object.defineProperty(t,r,{enumerable:!0,get:e[r]})},s.o=(t,e)=>Object.prototype.hasOwnProperty.call(t,e),s.r=t=>{"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})},(()=>{const t=new(s(4868).CursorManager);let e=!1;function r(t){if(!e)return;const s={x:t.clientX,y:t.clientY};chrome.runtime.sendMessage({type:"UPDATE_CURSOR_POSITION",position:s})}function i(){for(const[e,s]of t.cursors)s.element.remove(),s.perfectCursor.dispose();t.cursors.clear()}chrome.runtime.onMessage.addListener(((s,n,o)=>{switch(s.type){case"GET_STATE":return chrome.runtime.sendMessage({type:"GET_NODE_STATE"},o),!0;case"GO_LIVE":e=!0;const n=`cursor-presence-${window.location.host}`;chrome.runtime.sendMessage({type:"CREATE_DRP_OBJECT",drpId:n}),document.addEventListener("mousemove",r);break;case"LEAVE_ROOM":e=!1,chrome.runtime.sendMessage({type:"LEAVE_DRP_OBJECT"}),i(),document.removeEventListener("mousemove",r);break;case"CURSOR_UPDATE":e&&s.userId!==s.currentPeerId&&(t.hasCursor(s.userId)||t.createCursor(s.userId),t.updateCursor(s.userId,[s.position.x,s.position.y]));break;case"PEER_LEFT":t.hasCursor(s.peerId)&&function(e){if(t.hasCursor(e)){const s=t.cursors.get(e);s&&(s.element.remove(),s.perfectCursor.dispose(),t.cursors.delete(e))}}(s.peerId);break;case"URL_CHANGED":if(e&&(i(),s.autoJoin)){const t=`cursor-presence-${new URL(s.url).host}`;chrome.runtime.sendMessage({type:"CREATE_DRP_OBJECT",drpId:t})}}})),window.addEventListener("unload",(()=>{e&&chrome.runtime.sendMessage({type:"LEAVE_DRP_OBJECT"}),i()}))})()})();