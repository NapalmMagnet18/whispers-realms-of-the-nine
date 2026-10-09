// Character creation screen (split out of ui.js 2026-10-08 so the menu boot does not carry it; ui.js imports it after standing).
const { RACES, CLASSES, CLASS_LORE, CLASS_ICONS, CLASS_COLORS, RACE_DESCRIPTIONS } = require('./races.js');
const { RACIAL_ABILITIES } = require('./racial-abilities.js');
export function renderCharacterCreation(localPlayer) {
  var s = localPlayer.state;
  var raceIndex = s.raceIndex ?? 0;
  if (!RACES[raceIndex]) raceIndex = 0;
  var genderIndex = s.genderIndex ?? 0;
  var skinColor = s.skinColor ?? 0;
  var hairColor = s.hairColor ?? 0;
  var faceIndex = s.faceIndex ?? 0;
  var hairStyleIndex = s.hairStyleIndex ?? 0;
  var facialHairIndex = s.facialHairIndex ?? 0;

  var race = RACES[raceIndex];
  var raceClasses = race.classes;
  var rawClassIndex = s.classIndex ?? 0;
  var classIndex = (rawClassIndex >= 0 && rawClassIndex < raceClasses.length) ? rawClassIndex : 0;
  var className = raceClasses[classIndex];
  var lore = CLASS_LORE[className] || '';
  var raceLore = RACE_DESCRIPTIONS[race.name] || '';

  var isLight = raceIndex < 8;
  var allegiance = '\u2694 WAYFARER';

  // --- SELECTION STYLES ---
  var selBorder = 'border:4px solid rgba(170,110,230,1);box-shadow:0 0 12px rgba(160,100,220,0.8),0 0 24px rgba(140,80,200,0.5),0 0 40px rgba(120,60,180,0.25);';
  var unselBorder = 'border:4px solid transparent;';

  // --- RACE ICON GRID ---
  function raceIcon(i) {
    var r = RACES[i];
    var sel = i === raceIndex;
    var p = genderIndex === 1 ? r.femalePortrait : r.malePortrait;
    var iconSize = '77px';
    return '<div data-interactive onclick="sendAction(\'selectRace\',{index:' + i + '})" style="cursor:pointer;pointer-events:auto;">'
      + '<img src="' + p + '" style="width:' + iconSize + ';height:' + iconSize + ';border-radius:4px;object-fit:cover;display:block;'
      + (sel ? selBorder + 'filter:saturate(0.7) brightness(0.9);' : 'border:3px solid rgba(20,15,10,0.9);' + 'filter:saturate(0.6) brightness(0.8);')
      + 'transition:all 0.15s;" />'
      + '</div>';
  }

  var lightIcons = [];
  for (var i = 0; i < RACES.length; i++) { lightIcons.push(raceIcon(i)); }
  var darkIcons = [];
  

  // --- GENDER TOGGLE (ornate icons) ---
  function genderBtn(idx) {
    var sel = idx === genderIndex;
    var iconUrl = idx === 0 ? '/cdn/icon-black-male-gender-symbol-ornate-9yukoeui.webp' : '/cdn/icon-female-gender-symbol-ornate-jr58be33.webp';
    var borderStyle = sel
      ? 'border:4px solid rgba(170,110,230,1);box-shadow:0 0 12px rgba(160,100,220,0.8),0 0 24px rgba(140,80,200,0.5);'
      : 'border:2px solid rgba(60,40,20,0.5);';
    var imgFilter = sel ? 'filter:invert(1) brightness(1);' : 'filter:invert(1) brightness(0.5);';
    return '<div data-interactive onclick="sendAction(\'selectGender\',{index:' + idx + '})" style="'
      + 'width:48px;height:48px;display:flex;align-items:center;justify-content:center;'
      + 'border-radius:4px;cursor:pointer;pointer-events:auto;transition:all 0.15s;'
      + 'background:linear-gradient(180deg,rgba(12,12,14,0.98),rgba(5,5,7,0.98));'
      + 'box-shadow:inset 0 1px 0 rgba(180,140,60,0.1),0 2px 8px rgba(0,0,0,0.5);'
      + borderStyle + '">'
      + '<img src="' + iconUrl + '" style="width:32px;height:32px;object-fit:contain;' + imgFilter + '-webkit-user-drag:none;user-select:none;" />'
      + '</div>';
  }

  // --- CLASS HIGHLIGHT COLORS ---
  var CLASS_HIGHLIGHT = {
    'Engineer': { border: 'rgba(184,115,51,1)', glow1: 'rgba(184,115,51,0.8)', glow2: 'rgba(160,100,40,0.5)', glow3: 'rgba(140,85,30,0.25)' },
    'Necromancer': { border: 'rgba(30,120,50,1)', glow1: 'rgba(30,120,50,0.8)', glow2: 'rgba(20,100,40,0.5)', glow3: 'rgba(15,80,30,0.25)' },
    'Wizard': { border: 'rgba(0,127,255,1)', glow1: 'rgba(0,127,255,0.8)', glow2: 'rgba(0,110,220,0.5)', glow3: 'rgba(0,90,180,0.25)' },
    'Blood Knight': { border: 'rgba(140,20,20,1)', glow1: 'rgba(140,20,20,0.8)', glow2: 'rgba(110,10,10,0.5)', glow3: 'rgba(80,5,5,0.25)' },
    'Ravager': { border: 'rgba(180,20,30,1)', glow1: 'rgba(180,20,30,0.8)', glow2: 'rgba(150,15,25,0.5)', glow3: 'rgba(120,10,20,0.25)' },
    'Assassin': { border: 'rgba(100,200,80,1)', glow1: 'rgba(100,200,80,0.8)', glow2: 'rgba(80,180,60,0.5)', glow3: 'rgba(60,150,45,0.25)' },
    'Thief': { border: 'rgba(100,50,150,1)', glow1: 'rgba(100,50,150,0.8)', glow2: 'rgba(80,40,130,0.5)', glow3: 'rgba(60,30,110,0.25)' },
    'Cleric': { border: 'rgba(220,185,50,1)', glow1: 'rgba(220,185,50,0.8)', glow2: 'rgba(200,165,40,0.5)', glow3: 'rgba(180,145,30,0.25)' },
    'Witch': { border: 'rgba(50,160,50,1)', glow1: 'rgba(50,160,50,0.8)', glow2: 'rgba(40,140,40,0.5)', glow3: 'rgba(30,120,30,0.25)' },
    'Inquisitor': { border: 'rgba(230,210,40,1)', glow1: 'rgba(230,210,40,0.8)', glow2: 'rgba(210,190,30,0.5)', glow3: 'rgba(190,170,20,0.25)' },
    'Runemaster': { border: 'rgba(100,180,240,1)', glow1: 'rgba(100,180,240,0.8)', glow2: 'rgba(80,160,220,0.5)', glow3: 'rgba(60,140,200,0.25)' },
    'Cultist': { border: 'rgba(180,80,255,1)', glow1: 'rgba(180,80,255,0.8)', glow2: 'rgba(150,50,230,0.5)', glow3: 'rgba(120,30,200,0.25)' },
    'Swashbuckler': { border: 'rgba(210,40,40,1)', glow1: 'rgba(210,40,40,0.8)', glow2: 'rgba(190,30,30,0.5)', glow3: 'rgba(160,20,20,0.25)' },
    'Druid': { border: 'rgba(50,160,50,1)', glow1: 'rgba(50,160,50,0.8)', glow2: 'rgba(40,140,40,0.5)', glow3: 'rgba(30,120,30,0.25)' },
    'Warlock': { border: 'rgba(220,80,160,1)', glow1: 'rgba(220,80,160,0.8)', glow2: 'rgba(200,60,140,0.5)', glow3: 'rgba(180,40,120,0.25)' },
    'Shaman': { border: 'rgba(40,100,220,1)', glow1: 'rgba(40,100,220,0.8)', glow2: 'rgba(30,80,200,0.5)', glow3: 'rgba(20,60,180,0.25)' },
  };

  // --- CLASS CARDS (all 16, grey out unavailable) ---
  var HIDDEN_CLASSES = ['Wizard','Thief','Swashbuckler','Shaman'];
  var classCardsHtml = CLASSES.filter(function(c){ return HIDDEN_CLASSES.indexOf(c) === -1; }).map(function(cName) {
    var isAvailable = raceClasses.indexOf(cName) !== -1;
    var raceIdx = isAvailable ? raceClasses.indexOf(cName) : -1;
    var sel = isAvailable && raceIdx === classIndex;
    var iconUrl = (CLASS_ICONS && CLASS_ICONS[cName]) ? CLASS_ICONS[cName] : '';
    var cColor = (CLASS_COLORS && CLASS_COLORS[cName]) ? CLASS_COLORS[cName] : '#222';

    if (!isAvailable) {
      return '<div style="'
        + 'display:flex;align-items:center;justify-content:center;'
        + 'width:58px;height:58px;border-radius:4px;overflow:hidden;'
        + 'background:rgba(30,30,30,0.6);'
        + 'filter:grayscale(1);opacity:0.15;'
        + 'transition:all 0.15s;">'
        + (iconUrl ? '<img src="' + iconUrl + '" style="width:58px;height:58px;object-fit:cover;" />' : '')
        + '</div>';
    }

    var hi = CLASS_HIGHLIGHT[cName] || { border: 'rgba(170,110,230,1)', glow1: 'rgba(160,100,220,0.8)', glow2: 'rgba(140,80,200,0.5)', glow3: 'rgba(120,60,180,0.25)' };
    var selBorderStyle = sel
      ? 'border:4px solid ' + hi.border + ';box-shadow:0 0 12px ' + hi.glow1 + ',0 0 24px ' + hi.glow2 + ',0 0 40px ' + hi.glow3 + ';'
      : 'border:2px solid rgba(160,140,80,0.4);box-shadow:0 0 4px rgba(140,120,60,0.15);';
    return '<div data-interactive onclick="sendAction(\'selectClass\',{index:' + raceIdx + '})" style="'
      + 'display:flex;align-items:center;justify-content:center;'
      + 'width:58px;height:58px;border-radius:4px;overflow:hidden;'
      + 'background:linear-gradient(135deg,' + cColor + '33,' + cColor + '66);'
      + selBorderStyle
      + 'cursor:pointer;pointer-events:auto;'
      + 'transition:all 0.15s;">'
      + (iconUrl ? '<img src="' + iconUrl + '" style="width:54px;height:54px;object-fit:cover;filter:saturate(0.7) brightness(0.85);" />' : '')
      + '</div>';
  }).join('');

  // --- APPEARANCE CYCLER HELPERS ---
  var gothicArrowLeft = '/cdn/icon-dark-gothic-wrought-iron-arrowhead-pointing-left-ornate-black-background-transparent.png';
  var gothicArrowRight = '/cdn/icon-dark-gothic-wrought-iron-arrowhead-pointing-right-ornate-black-background-transparent.png';

  var bigArrowStyle = 'width:38px;height:38px;display:flex;align-items:center;justify-content:center;'
    + 'background:linear-gradient(180deg,rgba(30,30,32,0.95),rgba(15,15,17,0.95));'
    + 'border:2px solid rgba(80,80,85,0.5);border-radius:4px;'
    + 'cursor:pointer;pointer-events:auto;'
    + 'transition:all 0.12s;'
    + 'box-shadow:inset 0 1px 0 rgba(120,120,130,0.1),0 2px 8px rgba(0,0,0,0.5);flex-shrink:0;';

  function simpleCycler(label, category) {
    return '<div style="display:flex;align-items:center;gap:6px;margin-bottom:6px;">'
      + '<div data-interactive onclick="sendAction(\'cycleOption\',{category:\'' + category + '\',direction:-1})" style="' + bigArrowStyle + '"><img src="' + gothicArrowLeft + '" style="width:24px;height:24px;object-fit:contain;filter:brightness(1.8) saturate(0);" /></div>'
      + '<div style="flex:1;text-align:center;font-size:15px;color:rgba(220,195,140,0.9);font-family:Cinzel,\'Palatino\',Georgia,serif;font-weight:bold;letter-spacing:2px;text-transform:uppercase;">' + label + '</div>'
      + '<div data-interactive onclick="sendAction(\'cycleOption\',{category:\'' + category + '\',direction:1})" style="' + bigArrowStyle + '"><img src="' + gothicArrowRight + '" style="width:24px;height:24px;object-fit:contain;filter:brightness(1.8) saturate(0);" /></div>'
      + '</div>';
  }

  // --- SECTION HEADER helpers ---
  function sectionHeader(text) {
    return '<div class="fa-title" data-font="title" style="font-family:Cinzel,Palatino,Georgia,serif !important;font-size:15px;color:rgba(190,165,115,0.7);text-transform:uppercase;letter-spacing:2px;margin-bottom:5px;font-weight:bold;">' + text + '</div>';
  }

  function subLabel(text) {
    return '<div class="fa-title" data-font="title" style="font-family:Cinzel,Palatino,Georgia,serif !important;font-size:16px;color:rgba(200,170,120,0.7);text-transform:uppercase;letter-spacing:2px;margin-bottom:6px;font-weight:bold;">' + text + '</div>';
  }

  function goldDivider() {
    return '<div style="display:flex;align-items:center;gap:8px;margin:12px 0;">'
      + '<div style="flex:1;height:1px;background:linear-gradient(90deg,transparent,rgba(90,75,50,0.5));"></div>'
      + '<div style="width:6px;height:6px;transform:rotate(45deg);border:1px solid rgba(90,75,50,0.5);background:rgba(90,75,50,0.2);"></div>'
      + '<div style="flex:1;height:1px;background:linear-gradient(270deg,transparent,rgba(90,75,50,0.5));"></div>'
      + '</div>';
  }

  function thinLine() {
    return '<div style="height:1px;background:rgba(80,65,45,0.3);margin:4px 0;"></div>';
  }

  // --- CLASS COLOR / ICON ---
  var classColor = (CLASS_COLORS && CLASS_COLORS[className]) ? CLASS_COLORS[className] : '#c9a832';
  var classIcon = (CLASS_ICONS && CLASS_ICONS[className]) ? CLASS_ICONS[className] : '';

  // --- ALLEGIANCE ---
  var allegianceColor = 'color:rgba(242,176,74,0.9);';
  var allegianceText = 'Wayfarer of the March';

  // --- BANNER STYLES ---
  var goldTopBar = 'height:4px;background:linear-gradient(90deg,rgba(60,50,35,0.5),rgba(90,75,50,0.8),rgba(75,60,40,0.6),rgba(90,75,50,0.8),rgba(60,50,35,0.5));border-radius:4px 4px 0 0;flex-shrink:0;';
  var rightTopBar = isLight
    ? 'height:4px;background:linear-gradient(90deg,rgba(35,20,55,0.5),rgba(140,80,200,0.7),rgba(110,60,170,0.5),rgba(140,80,200,0.7),rgba(35,20,55,0.5));border-radius:4px 4px 0 0;flex-shrink:0;'
    : 'height:4px;background:linear-gradient(90deg,rgba(10,35,15,0.5),rgba(35,120,50,0.7),rgba(25,90,40,0.5),rgba(35,120,50,0.7),rgba(10,35,15,0.5));border-radius:4px 4px 0 0;flex-shrink:0;';

  var lightFactionIcon = '/cdn/image-gothic-golden-sun-radiant-light-faction-symbol-transparent-background.png';
  var darkFactionIcon = '/cdn/image-gothic-dark-crescent-moon-skull-dark-faction-symbol-transparent-background.png';

  var leftBannerStyle = 'position:fixed;top:12px;left:12px;bottom:12px;width:420px;z-index:100;'
    + 'background:linear-gradient(rgba(5,5,8,0.92),rgba(5,5,8,0.92)),url(/cdn/texture-very-dark-almost-black-gothic-marble-stone-subtle-veins-seamless.png) center/cover;'
    + 'border:2px solid rgba(80,70,60,0.5);border-radius:8px;'
    + 'overflow:hidden;overflow-y:auto;pointer-events:auto;'
    + 'animation:ccBannerLeft 0.5s ease both;'
    + 'box-shadow:4px 0 30px rgba(0,0,0,0.5),inset 0 0 30px rgba(40,35,30,0.1),0 0 15px rgba(60,50,40,0.15);'
    + 'display:flex;flex-direction:column;';

  var rightBannerBorder = isLight
    ? 'border:2px solid rgba(160,140,80,0.4);'
    : 'border:2px solid rgba(30,120,50,0.4);';
  var rightBannerGlow = isLight
    ? 'box-shadow:-4px 0 30px rgba(0,0,0,0.5),inset 0 0 40px rgba(180,160,100,0.06),0 0 20px rgba(200,170,80,0.1);'
    : 'box-shadow:-4px 0 30px rgba(0,0,0,0.5),inset 0 0 40px rgba(15,100,30,0.08),0 0 20px rgba(20,120,35,0.1);';
  var rightBannerStyle = 'position:fixed;top:12px;right:12px;bottom:12px;width:420px;z-index:100;'
    + 'background:linear-gradient(rgba(5,5,8,0.92),rgba(5,5,8,0.92)),url(/cdn/texture-very-dark-almost-black-gothic-marble-stone-subtle-veins-seamless.png) center/cover;'
    + rightBannerBorder
    + 'border-radius:8px;'
    + 'overflow-y:auto;pointer-events:auto;'
    + 'animation:ccBannerRight 0.5s ease both;'
    + rightBannerGlow
    + 'display:flex;flex-direction:column;';

  // --- RANDOMIZE BUTTON ---
  var randomizeBtnStyle = 'display:block;width:100%;box-sizing:border-box;padding:8px 14px;'
    + 'background:linear-gradient(180deg,rgba(55,38,20,0.95),rgba(35,22,12,0.95));'
    + 'border:2px solid rgba(120,85,40,0.5);border-radius:4px;'
    + 'color:rgba(220,190,130,0.9);'
    + 'font-size:12px;font-weight:bold;letter-spacing:1.5px;text-transform:uppercase;'
    + 'cursor:pointer;pointer-events:auto;text-align:center;'
    + 'box-shadow:inset 0 1px 0 rgba(180,140,60,0.1),0 2px 8px rgba(0,0,0,0.5);'
    + 'transition:all 0.15s;';

  return `
    <style>
      *, *::before, *::after { font-family: "Times New Roman", Georgia, serif !important; }
      [data-font="title"], [data-font="title"] * { font-family: Cinzel, Palatino, Georgia, serif; }
      div[data-font="title"] { font-family: Cinzel, Palatino, Georgia, serif; }
      .fa-title, .fa-title * { font-family: Cinzel, Palatino, Georgia, serif; }
      .fa-chat, .fa-chat *, [data-chat], [data-chat] * { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; }
      @font-face {
        font-family: 'Cinzel';
        src: url('/cdn/font-cinzel-regular.woff2') format('woff2');
        font-weight: 400;
        font-display: swap;
      }
      @font-face {
        font-family: 'Cinzel';
        src: url('/cdn/font-cinzel-bold.woff2') format('woff2');
        font-weight: 700;
        font-display: swap;
      }
      @keyframes ccBannerLeft {
        from { opacity: 0; transform: translateX(-60px); }
        to { opacity: 1; transform: translateX(0); }
      }
      @keyframes ccBannerRight {
        from { opacity: 0; transform: translateX(60px); }
        to { opacity: 1; transform: translateX(0); }
      }
      @keyframes smokeFloat {
        0% { transform: translateY(0) scale(1); opacity: 0.3; }
        33% { transform: translateY(-8px) scale(1.05); opacity: 0.5; }
        66% { transform: translateY(-4px) scale(0.98); opacity: 0.35; }
        100% { transform: translateY(0) scale(1); opacity: 0.3; }
      }
      @keyframes smokeFloat2 {
        0% { transform: translateY(0) scale(1.02); opacity: 0.25; }
        50% { transform: translateY(-12px) scale(1.08); opacity: 0.45; }
        100% { transform: translateY(0) scale(1.02); opacity: 0.25; }
      }
      @keyframes smokePulse {
        0% { box-shadow: 0 0 40px rgba(40,35,30,0.2), 0 0 80px rgba(20,18,15,0.1); }
        50% { box-shadow: 0 0 60px rgba(50,45,35,0.3), 0 0 120px rgba(30,25,20,0.15); }
        100% { box-shadow: 0 0 40px rgba(40,35,30,0.2), 0 0 80px rgba(20,18,15,0.1); }
      }
      .cc-smoke-panel {
        animation: smokePulse 4s ease-in-out infinite;
      }
      .cc-smoke-panel::before {
        content: '';
        position: absolute;
        inset: -20px;
        border-radius: 16px;
        background: radial-gradient(ellipse at 50% 100%, rgba(50,45,40,0.25) 0%, rgba(30,28,25,0.1) 40%, transparent 70%);
        animation: smokeFloat 6s ease-in-out infinite;
        pointer-events: none;
        z-index: -1;
      }
      .cc-smoke-panel::after {
        content: '';
        position: absolute;
        inset: -30px;
        border-radius: 20px;
        background: radial-gradient(ellipse at 50% 0%, rgba(45,40,35,0.2) 0%, rgba(25,22,18,0.08) 35%, transparent 65%);
        animation: smokeFloat2 8s ease-in-out infinite;
        pointer-events: none;
        z-index: -1;
      }
      @keyframes portraitBreathe {
        0%, 100% { transform: scale(1.0) translateY(0px); }
        20% { transform: scale(1.025) translateY(-1.5px); }
        40% { transform: scale(1.04) translateY(-2.5px); }
        60% { transform: scale(1.02) translateY(-1px); }
        80% { transform: scale(1.01) translateY(0.5px); }
      }
      @keyframes portraitShift {
        0%, 100% { transform: translateX(0) rotate(0deg); }
        15% { transform: translateX(1px) rotate(0.2deg); }
        35% { transform: translateX(2px) rotate(0.4deg); }
        50% { transform: translateX(-1.5px) rotate(-0.3deg); }
        70% { transform: translateX(-0.5px) rotate(-0.1deg); }
        85% { transform: translateX(0.8px) rotate(0.15deg); }
      }
      @keyframes portraitGlow {
        0%, 100% { box-shadow: inset 0 0 25px rgba(0,0,0,0.7), 0 0 12px rgba(120,90,40,0.15); }
        30% { box-shadow: inset 0 0 18px rgba(0,0,0,0.5), 0 0 18px rgba(140,100,50,0.25); }
        60% { box-shadow: inset 0 0 22px rgba(0,0,0,0.6), 0 0 25px rgba(160,110,60,0.3); }
      }
      @keyframes portraitEyeGlow {
        0%, 70%, 100% { opacity: 0; }
        75% { opacity: 0.25; }
        80% { opacity: 0.1; }
        85% { opacity: 0.3; }
        90% { opacity: 0.05; }
      }
      @keyframes portraitFlicker {
        0%, 100% { filter: saturate(0.85) brightness(0.85); }
        25% { filter: saturate(0.9) brightness(0.88); }
        50% { filter: saturate(0.8) brightness(0.82); }
        75% { filter: saturate(0.88) brightness(0.9); }
      }
      .cc-enter-btn:hover {
        filter: brightness(1.35) !important;
        transform: scale(1.03);
      }
      .cc-enter-btn:active {
        transform: scale(0.98);
      }
      .cc-name-input::placeholder {
        color: rgba(120,100,70,0.35);
        font-style: italic;
        font-family: Cinzel, Palatino, Georgia, serif !important;
      }
      .cc-name-input:focus {
        border-color: rgba(180,150,80,0.5);
      }
      .cc-rand-btn:hover {
        border-color: rgba(200,160,80,0.8) !important;
        box-shadow: 0 0 12px rgba(200,160,80,0.3), inset 0 1px 0 rgba(255,230,150,0.15) !important;
      }
      .cc-banner-scroll::-webkit-scrollbar { width: 0px; display: none; }
      .cc-banner-scroll { -ms-overflow-style: none; scrollbar-width: none; }
      /* custom cursor removed — using default */
      .cc-smoke-panel img, .cc-banner-scroll img {
        -webkit-user-drag: none;
        user-drag: none;
        pointer-events: none;
        -webkit-user-select: none;
        user-select: none;
      }
    </style>

    <!-- LEFT PANEL -->
    <div class="cc-banner-scroll cc-smoke-panel" style="${leftBannerStyle}">
      <!-- Gold top bar -->
      <div style="${goldTopBar}"></div>

      <!-- Content -->
      <div style="padding:8px 14px;flex:1;">

        <!-- RACE SELECTION -->
        <div class="fa-title" data-font="title" style="font-family:Cinzel,Palatino,Georgia,serif !important;font-size:24px;font-weight:bold;color:rgba(200,175,120,0.9);letter-spacing:2px;text-align:center;margin-bottom:4px;text-shadow:0 0 10px rgba(180,140,60,0.25);">${race.name}</div>
        ${sectionHeader('Race')}

        <div style="display:flex;align-items:center;justify-content:center;gap:8px;margin-bottom:4px;">
          <div class="fa-title" data-font="title" style="font-family:Cinzel,Palatino,Georgia,serif !important;font-size:16px;color:rgba(220,190,120,0.95);text-transform:uppercase;letter-spacing:2px;margin-bottom:6px;margin-top:8px;font-weight:bold;text-shadow:0 0 6px rgba(242,176,74,0.3);">Wayfarers</div>
          <img src="${lightFactionIcon}" style="width:32px;height:32px;object-fit:contain;opacity:0.8;filter:drop-shadow(0 0 4px rgba(140,80,200,0.3));" />
        </div>
        <div style="display:grid;grid-template-columns:repeat(4,77px);gap:8px;margin-bottom:10px;justify-content:center;">
          ${lightIcons.join('')}
        </div>

        <!-- GENDER TOGGLE -->
        <div style="display:flex;justify-content:center;gap:10px;margin:20px 0 16px 0;">
          ${genderBtn(0)}
          ${genderBtn(1)}
        </div>

        <!-- CLASS SELECTION -->
        <div class="fa-title" data-font="title" style="font-family:Cinzel,Palatino,Georgia,serif !important;font-size:24px;font-weight:bold;color:rgba(200,175,120,0.9);letter-spacing:2px;text-align:left;margin-bottom:4px;text-shadow:0 0 10px rgba(180,140,60,0.25);">${className}</div>
        ${sectionHeader('Class')}
        <div style="display:grid;grid-template-columns:repeat(6,58px);gap:6px;margin-bottom:10px;justify-content:center;">
          ${classCardsHtml}
        </div>

        <!-- RANDOMIZE RACE+CLASS -->
        <div style="display:flex;justify-content:center;margin-top:18px;">
          <div data-interactive onclick="sendAction('randomizeAppearance')" style="
            width:72px;height:72px;display:flex;align-items:center;justify-content:center;
            background:linear-gradient(180deg,rgba(35,25,15,0.95),rgba(20,14,8,0.95));
            border:2px solid rgba(80,60,30,0.5);border-radius:4px;
            cursor:pointer;pointer-events:auto;transition:all 0.15s;
            box-shadow:inset 0 1px 0 rgba(180,140,60,0.1),0 2px 8px rgba(0,0,0,0.5);
          ">
            <img src="/cdn/image-single-six-sided-dice-d6-showing-white-dots-pips-on-faces-dark-iron-metal-gothic-style-black-background-square.png" style="width:58px;height:58px;object-fit:contain;filter:brightness(0.85);" />
          </div>
        </div>

        <!-- RACIAL ABILITY -->
        ${(function(){
          var ra = RACIAL_ABILITIES[raceIndex];
          if (!ra) return '';
          var raLight = raceIndex < 8;
          var raBg = raLight
            ? 'background:linear-gradient(180deg,rgba(30,15,45,0.7),rgba(15,8,25,0.8));border:1px solid rgba(120,60,180,0.35);'
            : 'background:linear-gradient(180deg,rgba(12,40,18,0.7),rgba(8,25,12,0.8));border:1px solid rgba(40,130,55,0.4);';
          var raLabelColor = raLight ? 'color:rgba(160,100,220,0.8);' : 'color:rgba(50,170,70,0.85);';
          var raNameColor = raLight ? 'color:rgba(220,180,255,0.95);' : 'color:rgba(170,255,180,0.95);';
          var raIconBorder = raLight ? 'border:1px solid rgba(120,60,180,0.4);' : 'border:1px solid rgba(40,130,55,0.4);';
          return '<div style="margin-top:16px;padding:14px 16px;' + raBg + 'border-radius:4px;">'
            + '<div data-font="title" style="font-family:Cinzel,Palatino,Georgia,serif !important;font-size:14px;' + raLabelColor + 'text-transform:uppercase;letter-spacing:2px;margin-bottom:4px;">Racial Ability</div>'
            + '<div style="display:flex;align-items:center;gap:14px;margin-bottom:10px;">'
            + '<img src="' + ra.icon + '" style="width:80px;height:80px;object-fit:contain;' + raIconBorder + 'border-radius:3px;background:rgba(10,8,6,0.6);flex-shrink:0;" />'
            + '<div data-font="title" style="font-family:Cinzel,Palatino,Georgia,serif !important;font-size:26px;' + raNameColor + 'letter-spacing:0.5px;">' + ra.name + '</div>'
            + '</div>'
            + '<div style="font-family:\'Times New Roman\',Georgia,serif !important;font-size:18px;color:rgba(180,165,140,0.75);line-height:1.5;">' + ra.description + '</div>'
            + '</div>';
        })()}

      </div>
    </div>

    <!-- RIGHT PANEL -->
    <div class="cc-banner-scroll cc-smoke-panel" style="${rightBannerStyle}">
      <!-- Faction top bar -->
      <div style="${rightTopBar}"></div>

      <!-- Content -->
      <div style="padding:12px 14px;flex:1;">

        <!-- FACTION ICON -->
        <div style="text-align:center;margin-bottom:8px;">
          <img src="${isLight ? lightFactionIcon : darkFactionIcon}" style="width:48px;height:48px;object-fit:contain;opacity:0.85;filter:drop-shadow(0 0 8px rgba(180,140,60,0.3));" />
        </div>

        <!-- ANIMATED RACE PORTRAIT -->
        <div style="text-align:center;margin-bottom:10px;">
          <div style="
            position:relative;
            display:inline-block;
            border:3px solid rgba(10,10,10,0.9);
            overflow:hidden;
          ">
            <!-- Portrait image -->
            <img src="${genderIndex === 1 ? (race.femaleAnimatedPortrait || race.femalePortrait) : (race.maleAnimatedPortrait || race.malePortrait)}" style="
              display:block;max-width:280px;height:auto;
            " />
            <!-- Soft edge vignette -->
            <div style="position:absolute;inset:0;box-shadow:inset 0 0 40px rgba(0,0,0,0.6);pointer-events:none;"></div>
            <!-- Subtle eye glow flicker -->
            <div style="position:absolute;inset:0;background:radial-gradient(ellipse at 50% 40%,rgba(200,160,80,0.15),transparent 60%);animation:portraitEyeGlow 8s ease-in-out infinite;pointer-events:none;"></div>
          </div>
        </div>

        <!-- RACE NAME -->
        <div data-font="title" style="font-family:Cinzel,Palatino,Georgia,serif !important;font-size:28px;font-weight:bold;color:rgba(200,175,120,0.9);letter-spacing:2px;margin-bottom:4px;text-shadow:0 0 14px rgba(180,140,60,0.25),0 2px 4px rgba(0,0,0,0.7);text-align:center;">
          ${race.name}
        </div>

        <!-- ALLEGIANCE BADGE -->
        <div data-font="title" style="font-family:Cinzel,Palatino,Georgia,serif !important;text-align:center;font-size:18px;letter-spacing:2px;margin-bottom:8px;font-weight:bold;text-shadow:0 0 8px ${isLight ? 'rgba(140,80,200,0.3)' : 'rgba(40,140,55,0.3)'};${allegianceColor}">
          ${allegianceText}
        </div>

        <!-- FACTION LORE -->
        <div style="font-family:'Times New Roman',Georgia,serif !important;text-align:center;font-size:16px;color:rgba(200,180,140,0.65);line-height:1.5;margin-bottom:10px;padding:0 8px;">
          ${isLight
            ? 'The borders between the Nine are breaking. Wayfarers gather where the lanterns still burn.'
            : 'The Dark embraces shadow, hunger, and ancient fury. Its children do not seek redemption \u2014 they seek dominion.'
          }
        </div>

        ${goldDivider()}

        <!-- RACE SECTION -->
        ${sectionHeader('Race')}
        <div style="font-family:'Times New Roman',Georgia,serif !important;font-size:16px;color:rgba(215,195,155,0.9);line-height:1.5;margin-bottom:10px;">
          ${raceLore}
        </div>

        ${goldDivider()}

        <!-- CLASS INFO -->
        <div style="display:flex;align-items:center;gap:12px;margin-bottom:10px;">
          ${classIcon
            ? '<img src="' + classIcon + '" style="width:52px;height:52px;border-radius:5px;object-fit:cover;border:2px solid rgba(100,80,50,0.5);box-shadow:0 0 10px rgba(0,0,0,0.5);filter:saturate(0.6) brightness(0.8);" />'
            : '<div style="width:52px;height:52px;border-radius:5px;background:rgba(60,40,20,0.5);border:2px solid rgba(100,80,50,0.5);"></div>'
          }
          <div data-font="title" style="font-family:Cinzel,Palatino,Georgia,serif !important;font-size:26px;font-weight:bold;color:rgba(200,175,120,0.9);letter-spacing:2px;text-shadow:0 0 10px rgba(180,140,60,0.25);">
            ${className}
          </div>
        </div>

        <!-- CLASS LORE -->
        <div style="font-family:'Times New Roman',Georgia,serif !important;font-size:16px;color:rgba(205,185,145,0.85);line-height:1.5;margin-bottom:14px;">
          \u201C${lore}\u201D
        </div>

        <!-- CLASS COLOR ACCENT BAR -->
        <div style="height:4px;border-radius:2px;background:${classColor};opacity:0.7;margin-top:6px;"></div>

        <!-- ENTER BUTTON (inside right panel bottom) — demon skull panel -->
        <div style="margin-top:16px;display:flex;justify-content:center;">
          <div class="cc-enter-btn" data-interactive onclick="if(window.__faCharName){sendAction('setCharName',{name:window.__faCharName})};sendAction('confirmCharacter')" style="
            position:relative;display:flex;align-items:center;justify-content:center;
            width:100%;max-width:380px;height:100px;cursor:pointer;pointer-events:auto;
            background:url('/cdn/ui-gothic-demon-skull-panel-yqhuzkk2.webp') center/contain no-repeat;
            border:none;border-radius:4px;
            transition:all 0.2s ease;
            filter:brightness(1.1);
          ">
            <span style="
              color:rgba(255,220,160,0.95);font-family:Cinzel,'Palatino',Georgia,serif !important;
              font-size:15px;font-weight:bold;letter-spacing:5px;text-transform:uppercase;
              text-shadow:0 0 14px rgba(255,160,40,0.6),0 2px 4px rgba(0,0,0,0.8),0 0 30px rgba(200,100,0,0.3);
              position:relative;z-index:2;padding-top:8px;
            ">Enter the March</span>
          </div>
        </div>

      </div>
      <!-- Faction atmosphere overlay -->
      ${isLight
        ? '<div style="position:absolute;inset:0;pointer-events:none;border-radius:8px;background:radial-gradient(ellipse at 50% 20%,rgba(130,70,180,0.04),transparent 60%);"></div>'
        : '<div style="position:absolute;inset:0;pointer-events:none;border-radius:8px;background:radial-gradient(ellipse at 50% 80%,rgba(15,90,30,0.06),transparent 55%);"></div>'
      }
    </div>

    <!-- NAME INPUT (bottom centre) — persistent input on body -->
    <div style="position:fixed;bottom:24px;left:50%;transform:translateX(-50%);z-index:110;pointer-events:none;display:flex;flex-direction:column;align-items:center;">
      <!-- Name error message (above the panel) -->
      ${localPlayer.state.nameError ? `<div style="margin-bottom:8px;font-family:Cinzel,Palatino,Georgia,serif;font-size:13px;color:rgba(220,60,60,0.95);text-shadow:0 0 8px rgba(180,30,30,0.4),0 1px 2px rgba(0,0,0,0.8);letter-spacing:1px;text-align:center;max-width:280px;line-height:1.4;">${localPlayer.state.nameError}</div>` : ''}
      <!-- Name panel wrapper (relative so the button can be absolutely positioned) -->
      <div style="position:relative;">
        <!-- Main Menu Button (absolutely positioned to the left of name panel) -->
        <div data-interactive onclick="sendAction('goToMainMenu')" style="
          pointer-events:auto;cursor:pointer;position:absolute;
          right:calc(100% + 14px);bottom:0;
          display:flex;flex-direction:column;align-items:center;justify-content:center;
          padding:14px 18px;
          background:linear-gradient(180deg, rgba(45,20,60,0.92) 0%, rgba(25,10,38,0.96) 100%);
          border:1px solid rgba(140,80,180,0.35);border-radius:4px;
          box-shadow:0 0 25px rgba(80,30,120,0.3),inset 0 1px 0 rgba(160,100,220,0.15),0 0 50px rgba(60,20,90,0.15);
          transition:all 0.2s ease;
          min-width:90px;
        " onmouseenter="this.style.borderColor='rgba(180,120,240,0.55)';this.style.boxShadow='0 0 35px rgba(120,50,180,0.45),inset 0 1px 0 rgba(180,130,240,0.2),0 0 60px rgba(80,30,140,0.25)';" onmouseleave="this.style.borderColor='rgba(140,80,180,0.35)';this.style.boxShadow='0 0 25px rgba(80,30,120,0.3),inset 0 1px 0 rgba(160,100,220,0.15),0 0 50px rgba(60,20,90,0.15)';">
          <!-- Decorative top line (purple) -->
          <div style="position:absolute;top:-1px;left:15%;right:15%;height:1px;background:linear-gradient(90deg,transparent,rgba(160,100,220,0.6),transparent);"></div>
          <!-- Corner accents (purple) -->
          <div style="position:absolute;top:5px;left:8px;width:10px;height:10px;border-top:1px solid rgba(140,80,180,0.45);border-left:1px solid rgba(140,80,180,0.45);"></div>
          <div style="position:absolute;top:5px;right:8px;width:10px;height:10px;border-top:1px solid rgba(140,80,180,0.45);border-right:1px solid rgba(140,80,180,0.45);"></div>
          <div style="position:absolute;bottom:5px;left:8px;width:10px;height:10px;border-bottom:1px solid rgba(140,80,180,0.45);border-left:1px solid rgba(140,80,180,0.45);"></div>
          <div style="position:absolute;bottom:5px;right:8px;width:10px;height:10px;border-bottom:1px solid rgba(140,80,180,0.45);border-right:1px solid rgba(140,80,180,0.45);"></div>
          <!-- Button text -->
          <div style="font-family:Cinzel,Palatino,Georgia,serif;font-size:11px;font-weight:700;color:rgba(190,150,230,0.95);text-transform:uppercase;letter-spacing:3px;text-shadow:0 0 10px rgba(140,80,200,0.4),0 1px 3px rgba(0,0,0,0.9);white-space:nowrap;">Main Menu</div>
        </div>
        <!-- Ornate backing plate (Name panel) -->
        <div style="position:relative;display:flex;flex-direction:column;align-items:center;padding:16px 24px 24px 24px;
          background:linear-gradient(180deg, rgba(18,14,22,0.92) 0%, rgba(10,8,14,0.96) 100%);
          border:1px solid rgba(140,110,50,0.3);border-radius:4px;
          box-shadow:0 0 30px rgba(0,0,0,0.7),inset 0 1px 0 rgba(140,110,50,0.12),0 0 60px rgba(80,50,20,0.1);
        ">
          <!-- Decorative top line -->
          <div style="position:absolute;top:-1px;left:20%;right:20%;height:1px;background:linear-gradient(90deg,transparent,rgba(200,170,80,0.5),transparent);"></div>
          <!-- Corner accents -->
          <div style="position:absolute;top:6px;left:10px;width:14px;height:14px;border-top:1px solid rgba(160,130,60,0.4);border-left:1px solid rgba(160,130,60,0.4);"></div>
          <div style="position:absolute;top:6px;right:10px;width:14px;height:14px;border-top:1px solid rgba(160,130,60,0.4);border-right:1px solid rgba(160,130,60,0.4);"></div>
          <div style="position:absolute;bottom:6px;left:10px;width:14px;height:14px;border-bottom:1px solid rgba(160,130,60,0.4);border-left:1px solid rgba(160,130,60,0.4);"></div>
          <div style="position:absolute;bottom:6px;right:10px;width:14px;height:14px;border-bottom:1px solid rgba(160,130,60,0.4);border-right:1px solid rgba(160,130,60,0.4);"></div>
          <!-- Label -->
          <div data-font="title" style="font-family:Cinzel,Palatino,Georgia,serif !important;font-size:18px;font-weight:700;color:rgba(210,185,120,0.95);text-transform:uppercase;letter-spacing:8px;margin-bottom:6px;text-shadow:0 0 10px rgba(180,150,60,0.35),0 1px 3px rgba(0,0,0,0.9);">Name</div>
          <!-- Decorative divider under label -->
          <div style="width:60px;height:1px;background:linear-gradient(90deg,transparent,rgba(180,150,70,0.45),transparent);margin-bottom:8px;"></div>
          <!-- Spacer for the real input that gets injected on top -->
          <div style="width:260px;height:36px;"></div>
        </div>
      </div>
    </div>
    <img src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==" data-initname="${(localPlayer.state.charName || '').replace(/"/g, '&quot;')}" onload="(function(img){var inp=document.getElementById('fa-name-persist');if(inp&&inp.dataset.ver==='6')return;if(inp)inp.remove();inp=document.createElement('input');inp.id='fa-name-persist';inp.dataset.ver='6';['pointerdown','mousedown','pointerup','mouseup','click'].forEach(function(ev){inp.addEventListener(ev,function(e){e.stopPropagation();if(ev==='pointerdown'||ev==='mousedown'){setTimeout(function(){inp.focus();},0);}});});inp.type='text';inp.setAttribute('data-interactive','true');inp.className='cc-name-input';inp.placeholder='Enter thy name...';inp.style.cssText='position:fixed;bottom:49px;left:50%;transform:translateX(-50%);z-index:115;width:260px;height:36px;background:rgba(12,10,18,0.95);border:1px solid rgba(140,115,55,0.3);border-radius:2px;color:rgba(210,190,140,0.95);font-family:Cinzel,Palatino,Georgia,serif;font-size:16px;text-align:center;letter-spacing:4px;outline:none;box-shadow:inset 0 2px 6px rgba(0,0,0,0.7),0 0 15px rgba(40,30,15,0.15);pointer-events:auto;';inp.addEventListener('input',function(){if(this.value.length>0){var cp=this.selectionStart;this.value=this.value.charAt(0).toUpperCase()+this.value.slice(1);this.selectionStart=this.selectionEnd=cp;}window.__faCharName=this.value;sendAction('setCharName',{name:this.value});});inp.addEventListener('keydown',function(e){e.stopPropagation();if(e.key==='Enter'&&this.value.trim()){sendAction('setCharName',{name:this.value});sendAction('confirmCharacter');}});inp.addEventListener('keyup',function(e){e.stopPropagation();});inp.addEventListener('keypress',function(e){e.stopPropagation();});inp.addEventListener('focus',function(){this.style.borderColor='rgba(180,150,80,0.5)';this.style.boxShadow='inset 0 1px 4px rgba(0,0,0,0.6),0 0 15px rgba(160,130,50,0.15),0 1px 0 rgba(120,100,60,0.08)';});inp.addEventListener('blur',function(){this.style.borderColor='rgba(120,100,60,0.35)';this.style.boxShadow='inset 0 1px 4px rgba(0,0,0,0.6),0 0 12px rgba(40,30,15,0.2),0 1px 0 rgba(120,100,60,0.08)';});var sv=window.__faCharName||img.dataset.initname||'';if(sv)inp.value=sv;document.body.appendChild(inp);setTimeout(function(){inp.focus();},100);var iv=setInterval(function(){if(!document.querySelector('.cc-banner-scroll')){inp.remove();clearInterval(iv);}},400);})(this)" style="display:none" />
  `;
}
module.exports = { renderCharacterCreation: renderCharacterCreation };
