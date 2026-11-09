// World of Warcraft style movement intent, for the host game's own player controller.
// Call wowMotion(input, memo, blocked) in the body's onInput; it returns
// { x, z, heading, steering, mouseForward, autoRun, turning, faceYaw, blocked } where x/z is a unit
// world direction (multiply by walk speed) and heading is degrees (null = keep facing).
//   W/S             -> forward / back along the way the body faces
//   A/D (axis turn) -> turn the body in place (the camera swings round behind)
//   Q/E (moveX)     -> strafe left / right
//   right held      -> the body turns to face the camera (steer)
//   left held       -> orbit: the walking course holds while the camera swings
//   both held       -> run forward along the camera
//   autoRun         -> toggle autorun (R, Num Lock); autoRunStop (W or S) or any interact/escape cancels it
// input.now (ms) paces the turn. memo is a per-body scratch object you keep (ctx.session is a good home).
export const TURN_RATE = 3.4 // radians a second, A/D
export function wowMotion(input,m,blocked=false){
 const a=input.axes??{},h=input.held??{},p=input.pressed??{};
 const yaw=Math.atan2(a.aimYawSin??0,a.aimYawCos??1),touch=!!a.touchActive;
 const now=input.now??0,dt=Math.min(0.1,Math.max(0,(now-(m.lastNow??now))/1000));m.lastNow=now;
 const rawLeft=!!h.orbit,rawRight=!!h.steer;
 if(!rawLeft&&!rawRight)m.suppressMouse=false;
 if(p.release)m.suppressMouse=true;
 const left=!touch&&!m.suppressMouse&&rawLeft,right=!touch&&!m.suppressMouse&&rawRight;
 if(typeof m.faceYaw!=='number')m.faceYaw=yaw;
 if(blocked){
  m.autoRun=false;m.faceYaw=yaw;m.suppressMouse=true;
  return (m.result={x:0,z:0,heading:null,steering:false,blocked:true,mouseForward:false,autoRun:false,turning:false,faceYaw:m.faceYaw});
 }
 if(!h.autoRunStop)m.suppressForward=false;
 const wasAuto=!!m.autoRun;
 if(p.autoRun)m.autoRun=!m.autoRun;
 if(p.autoRunStop&&(wasAuto||m.autoRun)){m.autoRun=false;m.suppressForward=true;}
 if(p.interact||p.release)m.autoRun=false;
 const turn=touch?0:(a.turn??0);
 if(right||touch)m.faceYaw=yaw;
 else if(turn)m.faceYaw-=turn*TURN_RATE*dt; // D turns right (yaw falls clockwise from above)
 // while autorunning, right + left mouse together also stop it the moment both are down
 // (you keep running on the buttons while they're held, and stop when you let go)
 if(left&&right&&!m.bothDown&&m.autoRun)m.autoRun=false;
 m.bothDown=left&&right;
 const both=left&&right,x=a.moveX??0,manualZ=m.suppressForward&&((a.moveZ??0)>0)?0:(a.moveZ??0),z=both||m.autoRun?1:manualZ,moving=!!(x||z);
 const basis=touch?yaw:m.faceYaw,sin=Math.sin(basis),cos=Math.cos(basis),length=Math.max(1,Math.hypot(x,z));
 const dx=(cos*x-sin*z)/length,dz=-(sin*x+cos*z)/length;
 // touch walks where the stick points; keys and mouse keep her facing her own front (strafe and backpedal included)
 const heading=touch?(moving?Math.atan2(-dx,-dz)*180/Math.PI:null):m.faceYaw*180/Math.PI;
 return (m.result={x:dx,z:dz,heading,steering:right||(!touch&&!!turn),blocked:false,mouseForward:both,autoRun:!!m.autoRun,turning:!!turn&&!right,moving,faceYaw:m.faceYaw,orbiting:left&&!right});
}
