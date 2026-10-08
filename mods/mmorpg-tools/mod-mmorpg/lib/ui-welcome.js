// Welcome Window — MMORPG Tools Mod
// Generic welcome text, same gothic styling

export function renderWelcomeWindow() {
  var style = '<style>'
    + '@keyframes welcome-glow-pulse{'
    +   '0%,100%{box-shadow:0 0 30px rgba(120,40,180,0.1),0 0 60px rgba(0,0,0,0.55),inset 0 0 40px rgba(120,40,180,0.04);border-color:rgba(120,40,180,0.35)}'
    +   '50%{box-shadow:0 0 40px rgba(40,180,80,0.12),0 0 60px rgba(0,0,0,0.55),inset 0 0 50px rgba(40,180,80,0.05);border-color:rgba(40,180,80,0.35)}'
    + '}'
    + '.welcome-decree{opacity:1;transform:translateY(0) scale(1);animation:welcome-glow-pulse 4s ease-in-out infinite;}'
    + '.welcome-divider{width:80%;opacity:1;}'
    + '.welcome-title{opacity:1;transform:translateY(0);}'
    + '.welcome-body-1{opacity:1;transform:translateY(0);}'
    + '.welcome-body-2{opacity:1;transform:translateY(0);}'
    + '.welcome-btn{opacity:1;transform:translateY(0);}'
    + '</style>';

  var ornamentSVG = '<svg width="100%" height="16" viewBox="0 0 400 16" preserveAspectRatio="xMidYMid meet" style="display:block;margin:0 auto;">'
    + '<defs>'
    +   '<linearGradient id="wlc-arcane-line" x1="0" y1="0" x2="1" y2="0">'
    +     '<stop offset="0%" stop-color="transparent"/>'
    +     '<stop offset="15%" stop-color="rgba(140,60,200,0.7)"/>'
    +     '<stop offset="50%" stop-color="rgba(80,220,120,0.9)"/>'
    +     '<stop offset="85%" stop-color="rgba(140,60,200,0.7)"/>'
    +     '<stop offset="100%" stop-color="transparent"/>'
    +   '</linearGradient>'
    + '</defs>'
    + '<line x1="30" y1="8" x2="370" y2="8" stroke="url(#wlc-arcane-line)" stroke-width="1.5"/>'
    + '<polygon points="200,2 206,8 200,14 194,8" fill="rgba(80,220,120,0.8)" stroke="rgba(40,180,80,0.4)" stroke-width="0.5"/>'
    + '<polygon points="140,6 143,8 140,10 137,8" fill="rgba(140,60,200,0.5)"/>'
    + '<polygon points="260,6 263,8 260,10 257,8" fill="rgba(140,60,200,0.5)"/>'
    + '</svg>';

  var lowerOrnament = '<svg width="100%" height="12" viewBox="0 0 400 12" preserveAspectRatio="xMidYMid meet" style="display:block;margin:0 auto;">'
    + '<line x1="60" y1="6" x2="340" y2="6" stroke="url(#wlc-arcane-line)" stroke-width="1"/>'
    + '<circle cx="200" cy="6" r="2.5" fill="rgba(80,220,120,0.6)"/>'
    + '</svg>';

  var panel = '<div class="welcome-decree" style="'
    + 'position:relative;'
    + 'background:radial-gradient(ellipse at 50% 40%, rgba(18,8,28,0.97) 0%, rgba(8,5,12,0.98) 50%, rgba(12,8,18,0.97) 100%);'
    + 'border:2px solid rgba(120,40,180,0.35);'
    + 'max-width:560px;width:90%;'
    + 'padding:44px 48px 40px;'
    + 'text-align:center;'
    + 'font-family:Cinzel,\'Times New Roman\',serif;'
    + 'box-shadow:0 0 30px rgba(120,40,180,0.1),0 0 60px rgba(0,0,0,0.55),inset 0 0 40px rgba(120,40,180,0.04);'
    + '">'
    + '<div style="position:absolute;top:8px;left:8px;width:20px;height:20px;border-top:2px solid rgba(140,60,200,0.4);border-left:2px solid rgba(140,60,200,0.4);"></div>'
    + '<div style="position:absolute;top:8px;right:8px;width:20px;height:20px;border-top:2px solid rgba(140,60,200,0.4);border-right:2px solid rgba(140,60,200,0.4);"></div>'
    + '<div style="position:absolute;bottom:8px;left:8px;width:20px;height:20px;border-bottom:2px solid rgba(40,180,80,0.4);border-left:2px solid rgba(40,180,80,0.4);"></div>'
    + '<div style="position:absolute;bottom:8px;right:8px;width:20px;height:20px;border-bottom:2px solid rgba(40,180,80,0.4);border-right:2px solid rgba(40,180,80,0.4);"></div>'
    + '<div class="welcome-title" style="'
    +   'font-size:38px;font-weight:700;color:rgba(80,220,120,1);letter-spacing:4px;margin-bottom:12px;'
    +   'text-shadow:0 0 20px rgba(140,60,200,0.45),0 0 40px rgba(120,40,180,0.2),0 0 8px rgba(80,220,120,0.3),0 2px 4px rgba(0,0,0,0.8);'
    + '">Welcome</div>'
    + '<div class="welcome-divider" style="margin:0 auto 28px;overflow:hidden;">' + ornamentSVG + '</div>'
    + '<p class="welcome-body-1" style="font-size:18px;color:rgba(210,215,225,0.92);line-height:1.75;margin-bottom:16px;text-shadow:0 1px 3px rgba(60,20,80,0.7);">'
    + 'Welcome to the world! Press <span style="color:rgba(80,220,120,1);font-weight:bold;text-shadow:0 0 8px rgba(40,180,80,0.4);">TAB</span> for your menu. Use <span style="color:rgba(80,220,120,1);font-weight:bold;text-shadow:0 0 8px rgba(40,180,80,0.4);">1-9</span> for abilities.</p>'
    + '<p class="welcome-body-2" style="font-size:18px;color:rgba(210,215,225,0.92);line-height:1.75;margin-bottom:16px;text-shadow:0 1px 3px rgba(60,20,80,0.7);">'
    + 'If your camera doesn\'t orbit, double-tap <span style="color:rgba(80,220,120,1);font-weight:bold;text-shadow:0 0 8px rgba(40,180,80,0.4);">TAB</span></p>'
    + '<div class="welcome-divider" style="margin:20px auto 24px;overflow:hidden;">' + lowerOrnament + '</div>'
    + '<div class="welcome-btn">'
    + '<div data-interactive onclick="sendAction(\'dismissWelcome\')" style="'
    +   'cursor:pointer;display:inline-block;padding:12px 44px;'
    +   'border:1px solid rgba(120,40,180,0.4);'
    +   'color:rgba(80,220,120,0.95);font-family:Cinzel,\'Times New Roman\',serif;'
    +   'font-size:20px;font-weight:700;letter-spacing:3px;'
    +   'text-shadow:0 0 12px rgba(80,220,120,0.25),0 0 6px rgba(140,60,200,0.2),0 1px 2px rgba(0,0,0,0.8);'
    +   'transition:all 0.35s ease;background:transparent;position:relative;'
    + '" '
    + 'onmouseover="this.style.background=\'rgba(80,220,120,0.06)\';this.style.borderColor=\'rgba(80,220,120,0.6)\';this.style.color=\'rgba(100,235,140,1)\'" '
    + 'onmouseout="this.style.background=\'transparent\';this.style.borderColor=\'rgba(120,40,180,0.4)\';this.style.color=\'rgba(80,220,120,0.95)\'"'
    + '>Continue</div>'
    + '</div>'
    + '</div>';

  return style
    + '<div class="welcome-backdrop" style="position:fixed;top:0;left:0;width:100vw;height:100vh;display:flex;align-items:center;justify-content:center;z-index:10000;background:radial-gradient(ellipse at center,rgba(6,3,10,0.9),rgba(0,0,0,0.95));opacity:1;">'
    + panel
    + '</div>';
}

module.exports = { renderWelcomeWindow };
