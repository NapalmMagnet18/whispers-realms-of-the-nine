// World of Warcraft style movement intent, for the host game's own player controller.
// Call wowMotion(input, memo, blocked) in the body's onInput; it returns
// { x, z, heading, steering, mouseForward, autoRun, blocked } where x/z is a unit
// world direction (multiply by walk speed) and heading is degrees (null = keep facing).
//   right held      -> the body turns to face the camera (steer); A/D strafe
//   left held       -> free look: the walking course holds while the camera orbits
//   both held       -> run forward along the camera
//   Q               -> toggle autorun; W or any interact/escape cancels it
// memo is a per-body scratch object you keep (ctx.session is a good home).
export function wowMotion(input,m,blocked=false){
 const a=input.axes??{},h=input.held??{},p=input.pressed??{};
 const yaw=Math.atan2(a.aimYawSin??0,a.aimYawCos??1),touch=!!a.touchActive;
 const rawLeft=!!h.orbit,rawRight=!!h.steer;
 if(!rawLeft&&!rawRight)m.suppressMouse=false;
 if(p.release)m.suppressMouse=true;
 const left=!touch&&!m.suppressMouse&&rawLeft,right=!touch&&!m.suppressMouse&&rawRight;
 if(blocked){
  m.autoRun=false;m.basisYaw=yaw;m.lastViewYaw=yaw;m.freeLook=false;m.keepCourse=false;m.wasMoving=false;m.suppressMouse=true;
  return (m.result={x:0,z:0,heading:null,steering:false,blocked:true,mouseForward:false,autoRun:false});
 }
 if(!h.autoRunStop)m.suppressForward=false;
 const wasAuto=!!m.autoRun;
 if(p.autoRun)m.autoRun=!m.autoRun;
 if(p.autoRunStop&&(wasAuto||m.autoRun)){m.autoRun=false;m.suppressForward=true;}
 if(p.interact||p.release)m.autoRun=false;
 const both=left&&right,x=a.moveX??0,manualZ=m.suppressForward&&((a.moveZ??0)>0)?0:(a.moveZ??0),z=both||m.autoRun?1:manualZ,moving=!!(x||z);
 if(right||touch){m.basisYaw=yaw;m.freeLook=false;m.keepCourse=false;}
 else if(left){
  if(!m.freeLook)m.basisYaw=m.wasMoving?(m.basisYaw??m.lastViewYaw??yaw):(m.lastViewYaw??yaw);
  m.freeLook=true;
 }else{
  if(m.freeLook){m.freeLook=false;m.keepCourse=moving;}
  if(!m.keepCourse||!moving){m.basisYaw=yaw;m.keepCourse=false;}
 }
 const basis=m.basisYaw??yaw,sin=Math.sin(basis),cos=Math.cos(basis),length=Math.max(1,Math.hypot(x,z));
 const dx=(cos*x-sin*z)/length,dz=-(sin*x+cos*z)/length;
 m.lastViewYaw=yaw;m.wasMoving=moving;
 return (m.result={x:dx,z:dz,heading:right?yaw*180/Math.PI:moving?Math.atan2(-dx,-dz)*180/Math.PI:null,steering:right,blocked:false,mouseForward:both,autoRun:!!m.autoRun});
}
