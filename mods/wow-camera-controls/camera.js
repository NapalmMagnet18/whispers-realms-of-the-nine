import {CAMERA as C} from './lib/config.js';
// World of Warcraft style camera rig.
// Hold LEFT mouse: orbit the camera around your character (your walking course holds).
// Hold RIGHT mouse: turn the camera and (with lib/motion.js wired) steer the body.
// Both buttons: the drag counts once. Wheel / pinch: eased zoom from 16 m to first person.
// Escape releases a held drag until the buttons are let go. Touch drag orbits.
// A game locks the look (menus, dialogs) by setting target.state.wowCameraLocked = true.
// The rig owns both look axes and eases them; the engine still casts the collision arm.
function softState(rig){
 const s=rig.state;
 if(!s.wowReady){
  s.yaw=rig.view?.yaw??s.yaw??0;s.pitch=rig.view?.pitch??s.pitch??C.defaultPitch;
  s.wowYawGoal=s.yaw;s.wowPitchGoal=s.pitch;s.wowReady=true;
 }
 if(typeof s.wowZoomGoal!=='number')s.wowZoomGoal=s.desiredDist??C.distance;
 return s;
}
function locked(rig){return !!rig.target?.state?.wowCameraLocked;}
function stop(s){s.wowYawGoal=s.yaw;s.wowPitchGoal=s.pitch;s.wowZoomGoal=s.desiredDist??C.distance;}
function ease(value,goal,dt,response=C.lookResponse,settle=C.lookSettle){
 const next=value+(goal-value)*(1-Math.exp(-response*Math.max(0,dt)));
 return Math.abs(goal-next)<settle?goal:next;
}
export function onSpawn(ctx){const rig=ctx.self;rig.pointerLock=false;rig.orientation={source:'look'};}
export function onInput(ctx,input){
 const rig=ctx.self,s=softState(rig),a=input.axes??{},h=input.held??{},p=input.pressed??{};
 if(!h.orbit&&!h.steer)s.wowSuppressed=false;
 if(locked(rig)||p.release){stop(s);s.wowSuppressed=true;return;}
 if(!s.wowSuppressed&&(h.orbit||h.steer||a.touchActive)){
  // Accumulate the whole drag into one goal; unwrapped yaw crosses north smoothly.
  if(a.lookX)s.wowYawGoal-=a.lookX*C.lookSensitivity;
  if(a.lookY)s.wowPitchGoal=Math.max(C.minPitch,Math.min(C.maxPitch,s.wowPitchGoal-a.lookY*C.lookSensitivity));
 }
 const z=a.zoom??a.zoomIn;
 if(z)s.wowZoomGoal=Math.max(C.minDistance,Math.min(C.maxDistance,s.wowZoomGoal-z*C.zoomRate));
}
export function update(ctx,dt=0){
 const rig=ctx.self,t=rig.target;if(!t)return;
 const k=t.effectiveScale?.y??1,s=softState(rig);
 if(!s.wowInit){s.desiredDist=C.distance;rig.pointerLock=false;s.wowInit=true;}
 if(locked(rig))stop(s);
 // Written every tick: the rig owns yaw and pitch, so the engine's own drag is never added twice.
 s.yaw=ease(s.yaw,s.wowYawGoal,dt);s.pitch=ease(s.pitch,s.wowPitchGoal,dt);
 s.desiredDist=ease(s.desiredDist??C.distance,s.wowZoomGoal,dt,C.zoomResponse,C.zoomSettle);
 const yaw=s.yaw,pitch=s.pitch,raw=s.desiredDist,first=raw<=C.firstPersonEnterDistance;
 const mode=first?'first':'orbit';
 if(s.wowLens!==mode){rig.orientation={source:first?'script':'look'};s.wowLens=mode;}
 rig.hideLocalPlayer=raw<=C.firstPersonAt;
 const f=t.feetPosition;
 if(first){
  rig.feetPosition={x:f.x,y:f.y+C.eyeHeight*k,z:f.z};
  rig.rotation={yaw:yaw*180/Math.PI,pitch:pitch*180/Math.PI};
 }else{
  const blend=Math.max(0,Math.min(1,(raw-C.firstPersonAt)/C.nearBlendDistance)),height=C.eyeHeight+(C.height-C.eyeHeight)*blend,aim=C.eyeHeight+(C.aim-C.eyeHeight)*blend,d=raw*k,cp=Math.cos(pitch);
  s.heightOffset=height;s.lookOffsetY=aim;
  rig.feetPosition={x:f.x+Math.sin(yaw)*cp*d,y:f.y+height*k-Math.sin(pitch)*d,z:f.z+Math.cos(yaw)*cp*d};
  rig.rotation={lookAt:{x:f.x,y:f.y+aim*k,z:f.z},include:['yaw','pitch']};
 }
}
