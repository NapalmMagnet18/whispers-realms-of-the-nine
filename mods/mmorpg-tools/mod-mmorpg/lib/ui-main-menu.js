// Main Menu UI — Dark gothic "Final Abyss" title screen
// Shows when player is in main-menu-land (inMainMenu state flag)
// Logo image → separator → Continue (if character exists) → Create a Character

var { RACES, CLASS_COLORS } = require('mod-mmorpg/lib/races.js');

export function renderMainMenu(localPlayer) {
  var characters = localPlayer.state.characters || [];
  var selectedIdx = localPlayer.state.selectedCharIdx ?? 0;
  var dataLoaded = localPlayer.state._dataLoaded === true;
  var hasCharacter = characters.length > 0 && dataLoaded;

  // CRITICAL: While roster data is loading from storage, hide ALL buttons
  // and show a loading indicator. This prevents the "Create a Character" button
  // from flashing before the roster finishes loading on refresh (Cmd-R).
  var stillLoading = !dataLoaded;

  // Continue is shown ONLY if the player has at least one character AND data is loaded
  var showContinue = hasCharacter;

  // Build rich Continue subtitle from the selected character
  var continueSubtitle = '';
  if (showContinue && characters[selectedIdx]) {
    var selChar = characters[selectedIdx];
    var _cName = selChar.charName || 'Unnamed';
    var _race = RACES[selChar.raceIndex ?? 0];
    var _raceName = _race ? _race.name : '?';
    var _clsIdx = selChar.classIndex ?? 0;
    if (_race && _clsIdx >= _race.classes.length) _clsIdx = 0;
    var _clsName = _race ? _race.classes[_clsIdx] : '?';
    var _clsColor = (CLASS_COLORS && CLASS_COLORS[_clsName]) || 'rgba(180,160,120,0.5)';
    continueSubtitle = '<div style="font-family:Cinzel,Palatino,Georgia,serif;font-size:12px;letter-spacing:2px;margin-top:5px;display:flex;align-items:center;justify-content:center;gap:8px;">'
      + '<span style="color:rgba(230,210,255,0.7);font-weight:700;letter-spacing:1.5px;">' + _cName + '</span>'
      + '<span style="color:rgba(120,80,180,0.35);font-size:10px;">│</span>'
      + '<span style="color:rgba(160,140,190,0.5);letter-spacing:1px;">' + _raceName + '</span>'
      + '<span style="color:rgba(120,80,180,0.3);font-size:8px;">•</span>'
      + '<span style="color:' + _clsColor + ';opacity:0.6;letter-spacing:1px;">' + _clsName + '</span>'
      + '</div>';
  }

  return '<style>'
    + '@keyframes fa-menu-fadein{0%{opacity:1;transform:none;}100%{opacity:1;transform:none;}}'
    + '@keyframes fa-title-fadein{0%{opacity:1;transform:none;}100%{opacity:1;transform:none;}}'
    + '@keyframes fa-separator-draw{0%{width:220px;opacity:1;}100%{width:220px;opacity:1;}}'
    + '@keyframes fa-ornament-spin{0%{transform:rotate(0deg);}100%{transform:rotate(360deg);}}'
    + '@keyframes fa-ember-float{0%{transform:translateY(0) scale(1);opacity:0.6;}50%{opacity:1;}100%{transform:translateY(-80px) scale(0.3);opacity:0;}}'
    + '</style>'

    // Full-screen overlay — pointer-events:none on container, auto on buttons
    + '<div style="position:fixed;top:0;left:0;width:100vw;height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;pointer-events:none;z-index:50;">'

    // Semi-transparent dark background — lets the 3D scene show through
    + '<div style="position:absolute;top:0;left:0;width:100%;height:100%;background:radial-gradient(ellipse at 50% 40%,rgba(12,18,10,0.45) 0%,rgba(4,6,3,0.55) 60%,rgba(0,0,0,0.65) 100%);pointer-events:none;"></div>'
    // Vignette overlay
    + '<div style="position:absolute;top:0;left:0;width:100%;height:100%;background:radial-gradient(ellipse at center,rgba(0,0,0,0) 0%,rgba(0,0,0,0.55) 100%);pointer-events:none;"></div>'

    // Top vignette
    + '<div style="position:absolute;top:0;left:0;width:100%;height:30%;background:linear-gradient(to bottom,rgba(0,0,0,0.6),transparent);pointer-events:none;"></div>'

    // Bottom vignette
    + '<div style="position:absolute;bottom:0;left:0;width:100%;height:30%;background:linear-gradient(to top,rgba(0,0,0,0.7),transparent);pointer-events:none;"></div>'

    // Content container
    + '<div style="position:relative;display:flex;flex-direction:column;align-items:center;gap:0;z-index:2;">'

    // ═══════════ LOGO ═══════════
    + '<div style="opacity:1;">'
      + '<img src="/cdn/logo-dark-fantasy-rpg-ornate-placeholder.webp" style="'
      + 'width:420px;height:auto;pointer-events:none;-webkit-user-drag:none;user-select:none;'
      + 'filter:drop-shadow(0 0 30px rgba(140,80,200,0.25)) drop-shadow(0 4px 20px rgba(0,0,0,0.7));'
      + '" />'
    + '</div>'

    // Decorative separator line
    + '<div style="width:220px;height:1px;margin:16px auto 12px auto;background:linear-gradient(90deg,transparent,rgba(160,100,220,0.4),rgba(180,160,200,0.3),rgba(160,100,220,0.4),transparent);animation:fa-separator-draw 1s ease-out both;animation-delay:0.8s;"></div>'

    // Spacer
    + '<div style="height:60px;"></div>'

    // ═══════════ BUTTONS ═══════════
    + '<div style="display:flex;flex-direction:column;align-items:center;gap:16px;animation:fa-menu-fadein 0.8s ease-out both;animation-delay:1.4s;">'

      // ─── LOADING INDICATOR (shown while roster loads from storage) ───
      + (stillLoading
        ? '<div style="display:flex;flex-direction:column;align-items:center;gap:12px;padding:20px 0;">'
          + '<style>@keyframes fa-menu-loading-pulse{0%,100%{opacity:0.4;}50%{opacity:0.9;}}@keyframes fa-menu-loading-spin{0%{transform:rotate(0deg);}100%{transform:rotate(360deg);}}</style>'
          + '<svg width="28" height="28" viewBox="0 0 28 28" style="animation:fa-menu-loading-spin 1.5s linear infinite;">'
            + '<circle cx="14" cy="14" r="11" fill="none" stroke="rgba(80,40,140,0.3)" stroke-width="2"/>'
            + '<path d="M14 3 A11 11 0 0 1 25 14" fill="none" stroke="rgba(180,120,255,0.7)" stroke-width="2" stroke-linecap="round"/>'
          + '</svg>'
          + '<div style="font-family:Cinzel,Palatino,Georgia,serif;font-size:13px;color:rgba(180,150,220,0.6);letter-spacing:4px;text-transform:uppercase;animation:fa-menu-loading-pulse 2s ease-in-out infinite;">Loading...</div>'
        + '</div>'
        : '')

      // ─── CONTINUE (only shown if player has a character) ───
      + (!stillLoading && showContinue
        ? '<div data-interactive onclick="sendAction(\'continueGame\')" style="'
          + 'position:relative;width:340px;padding:18px 40px;'
          + 'background:linear-gradient(180deg,rgba(40,20,60,0.85),rgba(25,10,45,0.95));'
          + 'border:1px solid rgba(160,100,220,0.5);'
          + 'box-shadow:0 0 25px rgba(140,80,200,0.25),inset 0 1px 0 rgba(255,255,255,0.06);'
          + 'text-align:center;cursor:pointer;pointer-events:auto;'
          + 'transition:all 0.3s ease;"'
          + ' onmouseenter="this.style.borderColor=\'rgba(180,120,240,0.8)\';this.style.boxShadow=\'0 0 40px rgba(140,80,200,0.4),inset 0 1px 0 rgba(255,255,255,0.1)\';this.style.background=\'linear-gradient(180deg,rgba(55,30,80,0.9),rgba(35,15,60,0.95))\'"'
          + ' onmouseleave="this.style.borderColor=\'rgba(160,100,220,0.5)\';this.style.boxShadow=\'0 0 25px rgba(140,80,200,0.25),inset 0 1px 0 rgba(255,255,255,0.06)\';this.style.background=\'linear-gradient(180deg,rgba(40,20,60,0.85),rgba(25,10,45,0.95))\'"'
        + '>'
          // Corner ornaments
          + '<svg style="position:absolute;top:-1px;left:-1px;width:16px;height:16px;pointer-events:none;" viewBox="0 0 16 16"><path d="M0,16 L0,0 L16,0" fill="none" stroke="rgba(160,100,220,0.6)" stroke-width="1.5"/></svg>'
          + '<svg style="position:absolute;top:-1px;right:-1px;width:16px;height:16px;pointer-events:none;" viewBox="0 0 16 16"><path d="M16,16 L16,0 L0,0" fill="none" stroke="rgba(160,100,220,0.6)" stroke-width="1.5"/></svg>'
          + '<svg style="position:absolute;bottom:-1px;left:-1px;width:16px;height:16px;pointer-events:none;" viewBox="0 0 16 16"><path d="M0,0 L0,16 L16,16" fill="none" stroke="rgba(160,100,220,0.6)" stroke-width="1.5"/></svg>'
          + '<svg style="position:absolute;bottom:-1px;right:-1px;width:16px;height:16px;pointer-events:none;" viewBox="0 0 16 16"><path d="M16,0 L16,16 L0,16" fill="none" stroke="rgba(160,100,220,0.6)" stroke-width="1.5"/></svg>'
          + '<div style="font-family:Cinzel,Palatino,Georgia,serif;font-weight:700;font-size:18px;color:rgba(230,210,255,0.9);letter-spacing:4px;text-transform:uppercase;text-shadow:0 0 12px rgba(140,80,200,0.3);">Continue</div>'
          + continueSubtitle
        + '</div>'
        : '')
      + (!stillLoading
        ? '<div data-interactive onclick="sendAction(\'startCharacterCreation\')" style="'
        + 'position:relative;width:340px;padding:18px 40px;'
        + 'background:linear-gradient(180deg,rgba(40,20,60,0.85),rgba(25,10,45,0.95));'
        + 'border:1px solid rgba(160,100,220,0.5);'
        + 'box-shadow:0 0 25px rgba(140,80,200,0.25),inset 0 1px 0 rgba(255,255,255,0.06);'
        + 'text-align:center;cursor:pointer;pointer-events:auto;'
        + 'transition:all 0.3s ease;"'
        + ' onmouseenter="this.style.borderColor=\'rgba(180,120,240,0.8)\';this.style.boxShadow=\'0 0 40px rgba(140,80,200,0.4),inset 0 1px 0 rgba(255,255,255,0.1)\';this.style.background=\'linear-gradient(180deg,rgba(55,30,80,0.9),rgba(35,15,60,0.95))\'"'
        + ' onmouseleave="this.style.borderColor=\'rgba(160,100,220,0.5)\';this.style.boxShadow=\'0 0 25px rgba(140,80,200,0.25),inset 0 1px 0 rgba(255,255,255,0.06)\';this.style.background=\'linear-gradient(180deg,rgba(40,20,60,0.85),rgba(25,10,45,0.95))\'"'
      + '>'
        // Corner ornaments (SVG)
        + '<svg style="position:absolute;top:-1px;left:-1px;width:16px;height:16px;pointer-events:none;" viewBox="0 0 16 16"><path d="M0,16 L0,0 L16,0" fill="none" stroke="rgba(160,100,220,0.6)" stroke-width="1.5"/></svg>'
        + '<svg style="position:absolute;top:-1px;right:-1px;width:16px;height:16px;pointer-events:none;" viewBox="0 0 16 16"><path d="M16,16 L16,0 L0,0" fill="none" stroke="rgba(160,100,220,0.6)" stroke-width="1.5"/></svg>'
        + '<svg style="position:absolute;bottom:-1px;left:-1px;width:16px;height:16px;pointer-events:none;" viewBox="0 0 16 16"><path d="M0,0 L0,16 L16,16" fill="none" stroke="rgba(160,100,220,0.6)" stroke-width="1.5"/></svg>'
        + '<svg style="position:absolute;bottom:-1px;right:-1px;width:16px;height:16px;pointer-events:none;" viewBox="0 0 16 16"><path d="M16,0 L16,16 L0,16" fill="none" stroke="rgba(160,100,220,0.6)" stroke-width="1.5"/></svg>'
        + '<div style="font-family:Cinzel,Palatino,Georgia,serif;font-weight:700;font-size:18px;color:rgba(230,210,255,0.9);letter-spacing:4px;text-transform:uppercase;text-shadow:0 0 12px rgba(140,80,200,0.3);">Create a Character</div>'
        + '<div style="font-family:Cinzel,Palatino,Georgia,serif;font-size:11px;color:rgba(180,150,220,0.5);letter-spacing:3px;margin-top:5px;text-transform:uppercase;">Begin Your Descent</div>'
      + '</div>'
        : '')

    + '</div>' // end buttons

    // ═══════════ TIP SECTION (below buttons) ═══════════
    + '<div style="margin-top:28px;display:flex;flex-direction:column;align-items:center;gap:4px;animation:fa-menu-fadein 0.8s ease-out both;animation-delay:1.8s;">'
      + '<div data-interactive onclick="sendAction(\'toggleTipModal\')" style="'
        + 'width:56px;height:56px;cursor:pointer;pointer-events:auto;position:relative;'
      + '">'
        + '<div style="'
          + 'width:56px;height:56px;border-radius:50%;overflow:hidden;'
          + 'border:2px solid rgba(40,200,80,0.7);'
          + 'animation:gnomeGlow 3s ease-in-out infinite;'
        + '">'
          + '<img src="https://github.com/rooibosteadrinker/gifs/blob/main/gnome_male.gif?raw=true" style="'
            + 'width:100%;height:100%;object-fit:cover;'
            + '-webkit-user-drag:none;user-select:none;pointer-events:none;'
          + '" />'
        + '</div>'
      + '</div>'
      + '<div style="'
        + 'font-family:Cinzel,Palatino,Georgia,serif;font-size:10px;font-weight:bold;'
        + 'color:rgba(40,200,80,0.9);letter-spacing:2px;'
        + 'text-shadow:0 0 6px rgba(40,200,80,0.5),0 1px 2px rgba(0,0,0,0.9);'
        + 'pointer-events:none;cursor:default;'
      + '">TIP</div>'
    + '</div>'

    // ═══════════ BOTTOM DECORATION ═══════════

    + '</div>' // end content container

    // ═══════════ HIDE STANDALONE GNOME ON MAIN MENU ═══════════
    + '<style>'
    + '@keyframes gnomeGlow {'
    + '  0%, 100% { box-shadow: 0 0 8px rgba(40,200,80,0.5), 0 0 16px rgba(40,200,80,0.2), inset 0 0 6px rgba(0,0,0,0.4); }'
    + '  50% { box-shadow: 0 0 8px rgba(40,200,80,0.5), 0 0 16px rgba(40,200,80,0.2), inset 0 0 6px rgba(0,0,0,0.4); }'
    + '}'
    + 'div[onclick*="toggleTipModal"][style*="top:150px"] { display:none !important; }'
    + '</style>'

    // ═══════════ BUY SPOINS BUTTON (bottom-left) — liquid gold ═══════════
    + '<style>'
    + '@keyframes fa-gold-shimmer{0%{background-position:200% center;}100%{background-position:-200% center;}}'
    + '@keyframes fa-gold-pulse{0%,100%{box-shadow:0 0 14px rgba(212,175,55,0.15),0 4px 16px rgba(0,0,0,0.5),inset 0 1px 0 rgba(255,235,170,0.12);}}'
    + '@keyframes fa-modal-fadein{0%{opacity:1;transform:none;}100%{opacity:1;transform:none;}}'
    + '@keyframes fa-modal-bg-fadein{0%{opacity:1;}100%{opacity:1;}}'
    + '@keyframes fa-gold-text-shimmer{0%{background-position:0% center;}100%{background-position:200% center;}}'
    + '</style>'

    + '<div data-interactive onclick="sendAction(\'toggleSpoinsShop\')" style="'
      + 'position:fixed;bottom:28px;left:28px;z-index:60;'
      + 'padding:12px 28px;'
      + 'background:linear-gradient(135deg, rgba(45,32,8,0.88), rgba(30,22,6,0.94));'
      + 'border:1px solid rgba(212,175,55,0.45);'
      + 'border-radius:6px;'
      + 'box-shadow:0 0 14px rgba(212,175,55,0.15), 0 4px 16px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,235,170,0.12);'
      + 'cursor:pointer;pointer-events:auto;'
      + 'display:inline-flex;align-items:center;justify-content:center;'
      + 'font-family:Cinzel,Palatino,Georgia,serif;font-weight:700;font-size:15px;'
      + 'color:rgba(235,210,150,0.92);letter-spacing:3px;text-transform:uppercase;'
      + 'text-shadow:0 0 10px rgba(212,175,55,0.25), 0 1px 3px rgba(0,0,0,0.9);'
      + 'transition:all 0.3s ease;'
      + 'animation:fa-menu-fadein 0.6s ease-out both 2.2s, fa-gold-pulse 3s ease-in-out infinite 2.8s;'
    + '"'
    + ' onmouseenter="this.style.borderColor=\'rgba(235,200,80,0.7)\';this.style.boxShadow=\'0 0 30px rgba(212,175,55,0.35), 0 4px 20px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,235,170,0.2)\';this.style.color=\'rgba(255,235,170,0.98)\';this.style.background=\'linear-gradient(135deg, rgba(60,44,12,0.92), rgba(40,30,8,0.96))\'"'
    + ' onmouseleave="this.style.borderColor=\'rgba(212,175,55,0.45)\';this.style.boxShadow=\'0 0 14px rgba(212,175,55,0.15), 0 4px 16px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,235,170,0.12)\';this.style.color=\'rgba(235,210,150,0.92)\';this.style.background=\'linear-gradient(135deg, rgba(45,32,8,0.88), rgba(30,22,6,0.94))\'"'
    + '>'
      // Gold Spoin icosahedron icon
      + '<img src="/cdn/sprite-gold-spoin-icon.png" style="width:20px;height:20px;margin-right:8px;vertical-align:middle;filter:drop-shadow(0 0 6px rgba(212,175,55,0.5));" />'
      + 'Buy Spoins'
    + '</div>'

    // ═══════════ SPOINS PURCHASE MODAL ═══════════
    + (localPlayer.state.showSpoinsShop ? (function() {
      var packages = [
        { id: 'spoins-100',  amount: 100,  price: '$1.00',  label: 'Handful',  accent: 'rgba(212,175,55,0.6)' },
        { id: 'spoins-500',  amount: 500,  price: '$5.00',  label: 'Pouch',    accent: 'rgba(225,190,70,0.7)' },
        { id: 'spoins-1000', amount: 1000, price: '$10.00', label: 'Coffer',   accent: 'rgba(240,205,80,0.8)' },
        { id: 'spoins-5000', amount: 5000, price: '$50.00', label: 'Treasury', accent: 'rgba(255,220,100,0.9)' }
      ];

      var cards = packages.map(function(pkg, i) {
        var isBest = i === 3;
        var bestBadge = isBest
          ? '<div style="position:absolute;top:-12px;right:-8px;padding:3px 10px;'
            + 'background:linear-gradient(135deg,rgba(180,140,30,0.95),rgba(140,100,15,0.95));'
            + 'border:1px solid rgba(235,200,80,0.6);border-radius:4px;'
            + 'font-family:Cinzel,Palatino,Georgia,serif;font-size:9px;font-weight:700;'
            + 'color:rgba(255,240,180,0.95);letter-spacing:2px;text-transform:uppercase;'
            + 'text-shadow:0 0 6px rgba(212,175,55,0.4);">'
            + 'Best Value</div>'
          : '';

        return '<div data-interactive onclick="sendAction(\'purchaseSpoins\', { packageId: \'' + pkg.id + '\', amount: ' + pkg.amount + ' })" style="'
          + 'position:relative;display:flex;flex-direction:column;align-items:center;'
          + 'padding:20px 16px 16px;min-width:140px;'
          + 'background:linear-gradient(180deg, rgba(35,28,10,0.9), rgba(20,16,6,0.95));'
          + 'border:1px solid ' + pkg.accent + ';'
          + 'border-radius:4px;cursor:pointer;pointer-events:auto;'
          + 'box-shadow:0 0 12px rgba(212,175,55,0.08), inset 0 1px 0 rgba(255,235,170,0.06);'
          + 'transition:all 0.25s ease;'
        + '"'
        + ' onmouseenter="this.style.borderColor=\'rgba(255,220,100,0.85)\';this.style.boxShadow=\'0 0 24px rgba(212,175,55,0.25), inset 0 1px 0 rgba(255,235,170,0.12)\';this.style.background=\'linear-gradient(180deg, rgba(50,40,15,0.92), rgba(28,22,8,0.96))\';this.style.transform=\'translateY(-2px)\'"'
        + ' onmouseleave="this.style.borderColor=\'' + pkg.accent + '\';this.style.boxShadow=\'0 0 12px rgba(212,175,55,0.08), inset 0 1px 0 rgba(255,235,170,0.06)\';this.style.background=\'linear-gradient(180deg, rgba(35,28,10,0.9), rgba(20,16,6,0.95))\';this.style.transform=\'translateY(0)\'"'
        + '>'
          + bestBadge

          // Corner ornaments
          + '<svg style="position:absolute;top:-1px;left:-1px;width:10px;height:10px;pointer-events:none;" viewBox="0 0 10 10"><path d="M0,10 L0,0 L10,0" fill="none" stroke="' + pkg.accent + '" stroke-width="1.5"/></svg>'
          + '<svg style="position:absolute;top:-1px;right:-1px;width:10px;height:10px;pointer-events:none;" viewBox="0 0 10 10"><path d="M10,10 L10,0 L0,0" fill="none" stroke="' + pkg.accent + '" stroke-width="1.5"/></svg>'
          + '<svg style="position:absolute;bottom:-1px;left:-1px;width:10px;height:10px;pointer-events:none;" viewBox="0 0 10 10"><path d="M0,0 L0,10 L10,10" fill="none" stroke="' + pkg.accent + '" stroke-width="1.5"/></svg>'
          + '<svg style="position:absolute;bottom:-1px;right:-1px;width:10px;height:10px;pointer-events:none;" viewBox="0 0 10 10"><path d="M10,0 L10,10 L0,10" fill="none" stroke="' + pkg.accent + '" stroke-width="1.5"/></svg>'

          // Spoin icon
          + '<div style="font-size:28px;color:rgba(235,200,80,0.9);filter:drop-shadow(0 0 8px rgba(212,175,55,0.4));margin-bottom:8px;">✦</div>'

          // Amount
          + '<div style="font-family:Cinzel,Palatino,Georgia,serif;font-weight:700;font-size:20px;'
            + 'color:rgba(255,235,170,0.95);letter-spacing:1px;'
            + 'text-shadow:0 0 10px rgba(212,175,55,0.3), 0 1px 2px rgba(0,0,0,0.8);">'
            + pkg.amount.toLocaleString()
          + '</div>'

          // Label
          + '<div style="font-family:Cinzel,Palatino,Georgia,serif;font-size:10px;'
            + 'color:rgba(200,175,110,0.5);letter-spacing:3px;text-transform:uppercase;margin-top:2px;">'
            + pkg.label
          + '</div>'

          // Separator
          + '<div style="width:60%;height:1px;margin:10px 0 8px;'
            + 'background:linear-gradient(90deg,transparent,' + pkg.accent + ',transparent);"></div>'

          // Price
          + '<div style="font-family:Cinzel,Palatino,Georgia,serif;font-weight:700;font-size:16px;'
            + 'color:rgba(235,210,150,0.9);letter-spacing:1px;'
            + 'text-shadow:0 0 6px rgba(212,175,55,0.2), 0 1px 2px rgba(0,0,0,0.8);">'
            + pkg.price
          + '</div>'

        + '</div>';
      }).join('');

      return ''
        // Backdrop
        + '<div data-interactive onclick="sendAction(\'toggleSpoinsShop\')" style="'
          + 'position:fixed;top:0;left:0;width:100vw;height:100vh;z-index:100;'
          + 'background:radial-gradient(ellipse at 50% 40%, rgba(20,16,6,0.75), rgba(0,0,0,0.88));'
          + 'display:flex;align-items:center;justify-content:center;'
          + 'pointer-events:auto;animation:fa-modal-bg-fadein 0.25s ease-out both;'
        + '">'

          // Panel (stop click propagation)
          + '<div onclick="event.stopPropagation()" style="'
            + 'position:relative;max-width:720px;width:90%;padding:36px 32px 32px;'
            + 'background:linear-gradient(180deg, rgba(22,18,8,0.96), rgba(12,10,4,0.98));'
            + 'border:1px solid rgba(212,175,55,0.35);'
            + 'border-radius:4px;'
            + 'box-shadow:0 0 60px rgba(212,175,55,0.08), 0 0 120px rgba(0,0,0,0.6), inset 0 1px 0 rgba(255,235,170,0.06);'
            + 'animation:fa-modal-fadein 0.35s ease-out both;'
          + '">'

            // Corner ornaments on panel
            + '<svg style="position:absolute;top:-1px;left:-1px;width:20px;height:20px;pointer-events:none;" viewBox="0 0 20 20"><path d="M0,20 L0,0 L20,0" fill="none" stroke="rgba(212,175,55,0.5)" stroke-width="1.5"/></svg>'
            + '<svg style="position:absolute;top:-1px;right:-1px;width:20px;height:20px;pointer-events:none;" viewBox="0 0 20 20"><path d="M20,20 L20,0 L0,0" fill="none" stroke="rgba(212,175,55,0.5)" stroke-width="1.5"/></svg>'
            + '<svg style="position:absolute;bottom:-1px;left:-1px;width:20px;height:20px;pointer-events:none;" viewBox="0 0 20 20"><path d="M0,0 L0,20 L20,20" fill="none" stroke="rgba(212,175,55,0.5)" stroke-width="1.5"/></svg>'
            + '<svg style="position:absolute;bottom:-1px;right:-1px;width:20px;height:20px;pointer-events:none;" viewBox="0 0 20 20"><path d="M20,0 L20,20 L0,20" fill="none" stroke="rgba(212,175,55,0.5)" stroke-width="1.5"/></svg>'

            // Close button
            + '<div data-interactive onclick="sendAction(\'toggleSpoinsShop\')" style="'
              + 'position:absolute;top:12px;right:16px;'
              + 'width:28px;height:28px;display:flex;align-items:center;justify-content:center;'
              + 'cursor:pointer;pointer-events:auto;'
              + 'font-family:Cinzel,Palatino,Georgia,serif;font-size:18px;font-weight:700;'
              + 'color:rgba(200,175,110,0.4);'
              + 'transition:color 0.2s ease;'
            + '"'
            + ' onmouseenter="this.style.color=\'rgba(235,200,80,0.9)\'"'
            + ' onmouseleave="this.style.color=\'rgba(200,175,110,0.4)\'"'
            + '>✕</div>'

            // Title — shimmer gold text
            + '<div style="text-align:center;margin-bottom:8px;">'
              + '<div style="'
                + 'font-family:Cinzel,Palatino,Georgia,serif;font-weight:700;font-size:24px;'
                + 'letter-spacing:6px;text-transform:uppercase;'
                + 'background:linear-gradient(90deg, rgba(200,170,80,0.8), rgba(255,235,160,1), rgba(220,185,70,0.9), rgba(255,240,180,1), rgba(200,170,80,0.8));'
                + 'background-size:200% auto;'
                + '-webkit-background-clip:text;-webkit-text-fill-color:transparent;'
                + 'background-clip:text;'
                + 'animation:fa-gold-text-shimmer 4s linear infinite;'
                + 'filter:drop-shadow(0 0 8px rgba(212,175,55,0.3));'
              + '">Buy Spoins</div>'
            + '</div>'

            // Subtitle
            + '<div style="text-align:center;margin-bottom:24px;">'
              + '<div style="font-family:Cinzel,Palatino,Georgia,serif;font-size:11px;'
                + 'color:rgba(180,155,90,0.45);letter-spacing:4px;text-transform:uppercase;">'
                + 'Premium Currency'
              + '</div>'
              // Decorative separator
              + '<div style="width:180px;height:1px;margin:10px auto 0;'
                + 'background:linear-gradient(90deg,transparent,rgba(212,175,55,0.3),transparent);"></div>'
            + '</div>'

            // Package cards
            + '<div style="display:flex;gap:14px;justify-content:center;flex-wrap:wrap;">'
              + cards
            + '</div>'

            // Footer note
            + '<div style="text-align:center;margin-top:20px;">'
              + '<div style="font-family:Cinzel,Palatino,Georgia,serif;font-size:9px;'
                + 'color:rgba(160,140,90,0.3);letter-spacing:2px;text-transform:uppercase;">'
                + '1 Spoin = $0.01 USD'
              + '</div>'
            + '</div>'

          + '</div>' // end panel
        + '</div>'; // end backdrop
    })() : '')

    + '</div>'; // end full-screen overlay
}

module.exports = { renderMainMenu };
