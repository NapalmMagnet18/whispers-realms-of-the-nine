// Dark Gothic RPG HUD — MMORPG Tools Mod
const { RACES } = require('./races.js');
const { ATTACK_SPELL, RACIAL_ABILITIES, CLASS_SPELLS, CLASS_EXTRA_SPELLS } = require('./racial-abilities.js');
const { TRACKS } = require('./music-tracks.js');
const { getRaceDamageMultiplier } = require('./race-damage.js');
const { frame: _frame } = require('./ui-art.js');

export function renderTargetDisplay(s) {
  if (!s.targetId) return '';
  var name = s.targetName || 'Unknown';
  var th = s.targetHealth;
  var tmh = s.targetMaxHealth;
  var hasHealth = th !== undefined && th !== null && tmh !== undefined && tmh !== null && tmh > 0;
  var hpPct = hasHealth ? Math.min(100, Math.round((th / tmh) * 100)) : 0;

  var healthBarHtml = '';
  if (hasHealth) {
    healthBarHtml = ''
      + '<div style="width:154px;height:9px;position:relative;margin-top:3px;">'
      +   '<div style="position:absolute;inset:0;border-radius:4px;border:2px solid rgba(90,70,35,0.8);background:rgba(10,8,5,0.85);box-shadow:inset 0 1px 3px rgba(0,0,0,0.8);overflow:hidden;">'
      +     '<div style="height:100%;width:' + hpPct + '%;background:linear-gradient(90deg,rgba(140,15,15,0.95),rgba(190,30,30,0.95));transition:width 0.3s;border-radius:3px;"></div>'
      +   '</div>'
      + '</div>'
      + '<div style="font-family:Cinzel,serif;font-size:13px;font-weight:bold;color:rgba(255,210,210,0.85);text-shadow:0 1px 2px rgba(0,0,0,0.9);margin-top:1px;letter-spacing:0.5px;">' + th + ' / ' + tmh + '</div>';
  }

  var lname = String(name).toLowerCase();
  var tPortrait = /wolf|hound|cat/.test(lname) ? '/cdn/icon-bigcatwhite-u36ftl15e.webp'
    : /dragon|drake|wyrm/.test(lname) ? '/cdn/icon-dragon-u7aezrayn.webp'
    : /orc|brute|scaveng/.test(lname) ? '/cdn/icon-orc-u3xe7yu0d.webp'
    : /bird|crow|raven|harpy/.test(lname) ? '/cdn/icon-birdblue-u3gqn02ts.webp'
    : /warden|elite|boss|hollow/.test(lname) ? '/cdn/icon-aurared-u1ui80s8e.webp'
    : null;
  var portraitHtml = tPortrait ? '<div style="width:52px;height:52px;flex:none;border:2px solid rgba(200,170,80,0.6);border-radius:4px;overflow:hidden;box-shadow:0 2px 6px rgba(0,0,0,0.7);background:#0a0805;"><img src="' + tPortrait + '" style="width:100%;height:100%;object-fit:cover;" /></div>' : '';
  return ''
    + '<div style="'
    +   'position:fixed; top:140px; left:9px; z-index:90; display:flex; gap:6px; align-items:flex-start;'
    +   'pointer-events:none;'
    +   'font-family:Cinzel,Palatino,Georgia,serif;'
    + '">' + portraitHtml
    +   '<div style="'
    +     'background:linear-gradient(135deg,rgba(10,8,5,0.92),rgba(18,14,10,0.88));'
    +     'border:2px solid rgba(200,170,80,0.5);'
    +     'border-radius:4px;'
    +     'padding:6px 14px;'
    +     'box-shadow:0 2px 8px rgba(0,0,0,0.6),inset 0 1px 3px rgba(0,0,0,0.4);'
    +     'min-width:130px;'
    +   '">'
    +     '<div style="'
    +       'font-size:18px;'
    +       'color:rgba(220,190,100,0.95);'
    +       'text-shadow:0 0 8px rgba(200,170,80,0.35),0 1px 3px rgba(0,0,0,0.9);'
    +       'letter-spacing:1px;'
    +       'white-space:nowrap;'
    +     '">'
    +       '<span style="color:rgba(200,170,80,0.6);margin-right:6px;">⚔</span>'
    +       name
    +     '</div>'
    +     healthBarHtml
    +   '</div>'
    + '</div>';
}

export function renderHUD(localPlayer, world, rightHudLayout) {
  var rhScale = (rightHudLayout && rightHudLayout.rightHudScale) || 1;
  var leftScaleStyle = rhScale < 1 ? 'transform:scale(' + rhScale + ');transform-origin:top left;' : '';
  var bottomCenterScale = rhScale < 1 ? 'transform:translateX(-50%) scale(' + rhScale + ');transform-origin:bottom center;' : 'transform:translateX(-50%);';
  const s = localPlayer.state;
  const level = s.level ?? 1;
  const health = s.health ?? 1000;
  const maxHealth = s.maxHealth ?? 1000;
  const mana = s.mana ?? 500;
  const maxMana = s.maxMana ?? 500;
  const raceIndex = s.raceIndex ?? 0;
  const genderIndex = s.genderIndex ?? 0;
  const race = RACES[raceIndex];
  const portrait = race
    ? (genderIndex === 1
      ? (race.femaleAnimatedPortrait || race.femalePortrait)
      : (race.maleAnimatedPortrait || race.malePortrait))
    : '';

  const healthPct = Math.min(100, Math.round((health / maxHealth) * 100));
  const manaPct = Math.min(100, Math.round((mana / maxMana) * 100));

  const hudStyles = `
    <style>
      @keyframes hudSmokePulse {
        0%, 100% { opacity: 0.25; transform: scale(1); }
        50% { opacity: 0.45; transform: scale(1.08); }
      }
      @keyframes hudPlayerPulse {
        0%, 100% { box-shadow: 0 0 6px rgba(200,175,120,0.6), 0 0 12px rgba(200,175,120,0.3); }
        50% { box-shadow: 0 0 10px rgba(200,175,120,0.9), 0 0 20px rgba(200,175,120,0.5); }
      }
      @keyframes buffGlow {
        0%, 100% { box-shadow: 0 0 4px rgba(200,175,120,0.3), inset 0 0 3px rgba(0,0,0,0.5); }
        50% { box-shadow: 0 0 10px rgba(200,175,120,0.6), inset 0 0 3px rgba(0,0,0,0.5); }
      }
      @keyframes slotFlash {
        0% { opacity: 1; }
        100% { opacity: 0; }
      }
      [data-interactive]:hover > .buff-tooltip { display:block !important; }
      .spell-slot-wrap { position:relative; }
      .spell-slot-wrap .spell-tt {
        display:none; position:absolute; bottom:calc(100% + 12px); left:50%;
        transform:translateX(-50%); z-index:200; pointer-events:none; white-space:nowrap;
      }
      .spell-slot-wrap:hover .spell-tt { display:flex; }
      .spell-slot-wrap.dragging-active .spell-tt { display:none !important; }
      body.spell-dragging .spell-tt { display:none !important; }
      .spell-tt-inner {
        ${_frame('tooltip', 6, 'rgba(8,7,10,0.96)')}
        padding:4px 8px;
        font-family:Geist,Arial,sans-serif;
        display:flex; flex-direction:column; gap:3px;
        box-shadow:0 0 18px rgba(0,0,0,0.8), 0 0 6px rgba(160,140,80,0.15), inset 0 1px 0 rgba(200,175,120,0.08);
        min-width:180px; max-width:260px; white-space:normal; text-align:left;
      }
      .spell-tt-arrow {
        position:absolute; bottom:-6px; left:50%; transform:translateX(-50%);
        width:0; height:0;
        border-left:7px solid transparent; border-right:7px solid transparent;
        border-top:7px solid rgba(220,215,200,0.55);
      }
      .spell-tt-arrow-inner {
        position:absolute; bottom:-4px; left:50%; transform:translateX(-50%);
        width:0; height:0;
        border-left:6px solid transparent; border-right:6px solid transparent;
        border-top:6px solid rgba(0,0,0,0.95);
      }
      .spell-tt-name {
        font:600 14px/1.25 Cinzel,serif; letter-spacing:0.3px;
        color:#ffffff;
        text-shadow:0 0 8px rgba(200,170,80,0.3), 0 1px 2px rgba(0,0,0,0.9);
      }
      .spell-tt-desc {
        font-size:12px; color:#f2b04a; line-height:1.35; font-style:italic;
        letter-spacing:0.3px;
      }
      .spell-tt-cd {
        font-size:12px; color:#9a958c; margin-top:1px;
        letter-spacing:0.4px;
      }
      .slot-flash-overlay {
        position:absolute;inset:0;border-radius:4px;
        background:radial-gradient(circle,rgba(255,40,40,0.95),rgba(180,20,20,0.6));
        pointer-events:none;z-index:5;
        opacity:0;
      }
      @keyframes kitcd { from { height:100% } to { height:0% } }
      .slot-flash-red {
        background:radial-gradient(circle,rgba(255,40,40,0.95),rgba(180,20,20,0.6)) !important;
      }
      .hud-menu-btn {
        width: 48px; height: 48px;
        background: linear-gradient(135deg, rgba(15,12,10,0.95), rgba(25,20,16,0.9));
        border: 2px solid rgba(60,45,25,0.6);
        border-radius: 3px;
        position: relative;
        display: flex; align-items: center; justify-content: center;
        box-shadow: inset 0 1px 4px rgba(0,0,0,0.7), 0 1px 3px rgba(0,0,0,0.4);
        cursor: pointer; pointer-events: auto;
        transition: all 0.15s;
        flex-shrink: 0;
      }
      .hud-menu-btn:hover {
        border-color: rgba(200,175,120,0.7);
        box-shadow: inset 0 1px 4px rgba(0,0,0,0.7), 0 0 12px rgba(200,175,120,0.3);
        transform: translateY(-1px);
      }
      .hud-menu-btn img {
        width: 32px; height: 32px; object-fit: contain;
        filter: brightness(0.95);
        pointer-events: none; -webkit-user-drag: none; user-select: none;
      }
      .hud-menu-btn:hover img { filter: sepia(0.1) brightness(1.1); }
    </style>
  `;

  // --- SPELL BAR (8 slots reading from s.spellBar) ---
  // the class kit rides slots 1-3 (keys 1, 2, 3) unless the hero dragged something there: icon, name, a cooldown sweep keyed off state.cd
  const KIT = {
    vanguard: [{ id: 'kit-strike', cd: 'strike', name: 'Strike', icon: '/cdn/icon-sword-u16jp5yx9.webp', shortDesc: 'A quick blade cut. 8 damage.', cooldown: 0.6 },
      { id: 'kit-heavy', cd: 'heavy', name: 'Heavy Strike', icon: '/cdn/icon-hammerheavy-u5ndnaxuu.webp', shortDesc: 'A slow two-handed blow. 22 damage.', cooldown: 3 },
      { id: 'kit-guard', cd: 'guard', name: 'Guard', icon: '/cdn/icon-shield-u3qgy9lfm.webp', shortDesc: 'Raise your shield: 70% less damage for 1.5 s.', cooldown: 4 }],
    arcanist: [{ id: 'kit-firebolt', cd: 'firebolt', name: 'Firebolt', icon: '/cdn/icon-fireball-u1ns0jvs9.webp', shortDesc: 'A bolt of flame at your target.', cooldown: 1.2 },
      { id: 'kit-frost', cd: 'frost', name: 'Frost Shard', icon: '/cdn/icon-frostball-u6cleszd4.webp', shortDesc: 'A shard of ice that slows.', cooldown: 4 },
      { id: 'kit-ward', cd: 'ward', name: 'Ward', icon: '/cdn/icon-shield2-u7ym8ql7u.webp', shortDesc: 'A shimmering ward that drinks damage.', cooldown: 15 }],
    pathfinder: [{ id: 'kit-arrow', cd: 'arrow', name: 'Arrow', icon: '/cdn/icon-crossbow-u18wj7tj2.webp', shortDesc: 'Loose an arrow at your target.', cooldown: 0.8 },
      { id: 'kit-volley', cd: 'volley', name: 'Volley', icon: '/cdn/icon-crossbow-u18wj7tj2.webp', shortDesc: 'A fan of arrows.', cooldown: 4 },
      { id: 'kit-roll', cd: 'roll', name: 'Dodge Roll', icon: '/cdn/icon-go-u3btdaqbv.webp', shortDesc: 'Roll 6 m clear, untouchable while you roll.', cooldown: 5 }],
    shade: [{ id: 'kit-sstrike', cd: 'strike', name: 'Strike', icon: '/cdn/value.9c52728aae3cf14f8d2c1f2d59949f329d47d274d7d5b8cb76ea1d91ce2fe472.png', shortDesc: 'A dagger cut. 7 damage, triple as an Ambush: from the Veil, from behind, or just after a Shadowstep.', cooldown: 0.55 },
      { id: 'kit-step', cd: 'step', name: 'Shadowstep', icon: '/cdn/value.ff172f4b040b18df67e514e44cfad7f237bfb90c014d873026c38e62e06c530e.png', shortDesc: 'Step through shadow behind the foe in front of you, or 8 m ahead.', cooldown: 7 },
      { id: 'kit-veil', cd: 'veil', name: 'Veil', icon: '/cdn/value.dc44ac58361f8269804138d77434825528ebd3caeb9edfe85daa813f388dab5c.png', shortDesc: 'Vanish for 6 s. Beasts and wardens lose you. Striking breaks it.', cooldown: 12 }],
  };
  const _kit = KIT[String(s.className || 'vanguard').toLowerCase()] || null;
  const spellBar = (s.spellBar && s.spellBar.length ? s.spellBar : [null, null, null, null, null, null, null, null]).slice();
  if (_kit) for (let k = 0; k < 3; k++) if (!spellBar[k] || !spellBar[k].id || spellBar[k].id === 'attack') spellBar[k] = _kit[k];
  const _kitCd = s.cd || {};
  const racialCdStr = s.racialCooldownRemaining || '';
  const classCdRemaining = s.classCooldownRemaining || {};
  const flashIndex = s.slotFlashIndex ?? -1;
  const flashTick = s.slotFlashTick ?? 0;

  function formatCooldown(seconds) {
    if (!seconds || seconds <= 0) return null;
    // Guard: if value is unreasonably large, assume milliseconds (e.g. 86400000)
    if (seconds > 86400) seconds = Math.round(seconds / 1000);
    if (seconds < 60) return seconds + 's';
    if (seconds < 3600) {
      var m = Math.floor(seconds / 60);
      var s2 = seconds % 60;
      return s2 > 0 ? m + 'm ' + s2 + 's' : m + 'm';
    }
    var h = Math.floor(seconds / 3600);
    var rm = Math.floor((seconds % 3600) / 60);
    return rm > 0 ? h + 'h ' + rm + 'm' : h + 'h';
  }

  // Helper: scale numeric damage values in shortDesc for racial multiplier
  const raceDmgMult = getRaceDamageMultiplier(raceIndex);
  function scaleShortDesc(desc) {
    if (!desc || raceDmgMult <= 1) return desc;
    // Match patterns like "10 Death Damage", "5 Shadow Damage", "Arcane Bolt 10 dmg", "10 dmg"
    return desc.replace(/(\d+)(\s*(?:Death|Shadow|Nature|Curse|Piercing|Arcane|Spirit|Fire|Ice|Lightning|Poison)?\s*(?:Damage|dmg|damage))/gi, function(m, num, rest) {
      return '' + Math.floor(parseInt(num, 10) * raceDmgMult) + rest;
    });
  }

  function getSpellInfo(slot) {
    if (!slot || !slot.id) return null;
    if (slot.id === 'attack') return { icon: ATTACK_SPELL.icon, name: ATTACK_SPELL.name, shortDesc: ATTACK_SPELL.shortDesc || '', cooldown: ATTACK_SPELL.cooldown || 0 };
    // Racial abilities: id like 'racial_5' or matching by raceIndex
    const racialMatch = slot.id.match(/^racial[_-]?(\d+)$/);
    if (racialMatch) {
      const ri = parseInt(racialMatch[1], 10);
      const ra = RACIAL_ABILITIES[ri];
      if (ra) return { icon: ra.icon, name: ra.name, shortDesc: ra.shortDesc || '', isRacial: true, cooldown: ra.cooldown || 0 };
    }
    // Try to find by id in RACIAL_ABILITIES values
    for (const key in RACIAL_ABILITIES) {
      if (RACIAL_ABILITIES[key].id === slot.id) return { icon: RACIAL_ABILITIES[key].icon, name: RACIAL_ABILITIES[key].name, shortDesc: RACIAL_ABILITIES[key].shortDesc || '', isRacial: true, cooldown: RACIAL_ABILITIES[key].cooldown || 0 };
    }
    // Check class spells
    for (const key in CLASS_SPELLS) {
      var cs = CLASS_SPELLS[key];
      if (cs && cs.id === slot.id) return { icon: cs.icon, name: cs.name, shortDesc: cs.shortDesc || '', isRacial: false, isClassSpell: true, spellId: cs.id, cooldown: cs.cooldown || 0, manaCost: cs.manaCost || 0 };
    }
    // Check extra class spells (e.g. Crimson Flurry, Blood Siphon, Crimson Covenant)
    for (const ck in CLASS_EXTRA_SPELLS) {
      var extras = CLASS_EXTRA_SPELLS[ck];
      if (!extras) continue;
      for (var ei = 0; ei < extras.length; ei++) {
        var ex = extras[ei];
        if (ex && ex.id === slot.id) return { icon: ex.icon, name: ex.name, shortDesc: ex.shortDesc || '', isRacial: false, isClassSpell: true, spellId: ex.id, cooldown: ex.cooldown || 0, manaCost: ex.manaCost || 0 };
      }
    }
    // Fallback: use slot's own icon if present
    if (slot.icon) return { icon: slot.icon, name: slot.name || slot.id, shortDesc: slot.shortDesc || '', isRacial: false, isClassSpell: false, cooldown: slot.cooldown || 0 };
    return null;
  }

  const barLocked = s.spellBarLocked === true; // unlocked by default (undefined = unlocked)

  let spellSlotsHtml = '';
  for (let i = 0; i < 12; i++) {
    const info = getSpellInfo(spellBar[i]);
    const slotNum = i + 1;
    const slotLabel = slotNum <= 9 ? '' + slotNum : (slotNum === 10 ? '0' : (slotNum === 11 ? 'X' : 'Z'));
    const castAction = (i === 0 ? "sendAction('attack')" : "sendAction('castSlot" + slotNum + "')");
    const showCooldown = info && info.isRacial && racialCdStr;
    // Class spell cooldown (e.g. Heart Stab)
    const classSpellCdSec = (info && info.isClassSpell && info.spellId && classCdRemaining[info.spellId]) ? classCdRemaining[info.spellId] : 0;
    const showClassCooldown = classSpellCdSec > 0;
    const classCdDisplay = showClassCooldown ? (classSpellCdSec >= 60 ? Math.floor(classSpellCdSec / 60) + ':' + ('0' + (classSpellCdSec % 60)).slice(-2) : '' + classSpellCdSec) : '';
    const anyCooldown = showCooldown || showClassCooldown;

    const dragAttrs = (!barLocked && info)
      ? 'draggable="true" ondragstart="window._spellDragActive=true;window._spellDragDropped=false;window._spellDragSrc=' + i + ';window._dragSpellId=\'spellbar-remove:' + i + '\';event.dataTransfer.setData(\'text/plain\',\'spellbar-remove:' + i + '\');event.dataTransfer.effectAllowed=\'move\';this.style.opacity=\'0.5\';document.body.classList.add(\'spell-dragging\');sendAction(\'spellDragStart\');" ondragend="window._dragSpellId=null;window._spellDragSrc=-1;window._spellDragActive=false;this.style.opacity=\'\';document.body.classList.remove(\'spell-dragging\');delete window._spellDragDropped;sendAction(\'spellDragEnd\');"'
      : '';
    // Right-click to remove spell from bar (replaces drag-off-to-remove)
    const contextMenu = (!barLocked && info)
      ? 'oncontextmenu="event.preventDefault();event.stopPropagation();sendAction(\'spellbarRemove\',{slotIndex:' + i + '});return false;"'
      : '';

    // Drop target handlers — read window._dragSpellId first, fall back to dataTransfer
    const dropHandlers = ''
      + 'ondragover="event.preventDefault();window._dragOverSlot=' + i + ';" '
      + 'ondragenter="event.preventDefault();window._dragOverSlot=' + i + ';this.style.boxShadow=\'0 0 16px rgba(120,255,60,0.6),inset 0 0 8px rgba(120,255,60,0.2)\';this.style.borderColor=\'rgba(120,255,60,0.8)\';" '
      + 'ondragleave="if(window._dragOverSlot===' + i + ')window._dragOverSlot=-1;this.style.boxShadow=\'\';this.style.borderColor=\'\';" '
      + 'ondrop="event.preventDefault();window._spellDragDropped=true;var sid=window._dragSpellId||event.dataTransfer.getData(\'text/plain\');window._dragOverSlot=-1;this.style.boxShadow=\'\';this.style.borderColor=\'\';if(sid)sendAction(\'spellbarDrop\',{slotIndex:' + i + ',spellId:sid});" ';

    if (info) {
      const cdText = formatCooldown(info.cooldown);
      const manaText = info.manaCost ? info.manaCost + ' Mana' : '';
      const tooltipHtml = '<div class="spell-tt"><div class="spell-tt-inner" style="position:relative;">'
        + '<div class="spell-tt-name">' + info.name + '</div>'
        + (info.shortDesc ? '<div class="spell-tt-desc">' + scaleShortDesc(info.shortDesc) + '</div>' : '')
        + (cdText ? '<div class="spell-tt-cd">Cooldown: ' + cdText + '</div>' : '')
        + (manaText ? '<div class="spell-tt-cd" style="color:rgba(120,140,200,0.7);">' + manaText + '</div>' : '')
        + '<div class="spell-tt-arrow"></div>'
        + '<div class="spell-tt-arrow-inner"></div>'
        + '</div></div>';
      const shortDescHtml = '';
      spellSlotsHtml += '<div class="spell-slot-wrap spell-slot-' + i + '" style="position:relative;">'
        + '<div id="spell-slot-' + i + '" data-interactive onclick="if(window._spellDragActive)return;' + castAction + '" '
        + dragAttrs + ' '
        + contextMenu + ' '
        + dropHandlers
        + 'style="'
        + 'width:40px;height:40px;box-sizing:border-box;position:relative;cursor:pointer;pointer-events:auto;'
        + _frame('actionSlot', 3, 'rgba(15,12,10,0.95)')
        + 'box-shadow:0 1px 3px rgba(0,0,0,0.8);'
        + 'transition:all 0.15s;'
        + (anyCooldown ? 'opacity:0.7;' : '')
        + '">'
        + '<img src="' + info.icon + '" style="width:100%;height:100%;object-fit:contain;pointer-events:none;-webkit-user-drag:none;user-select:none;'
        + 'filter:brightness(1.1) sepia(0.2);'
        + (anyCooldown ? 'filter:brightness(0.55) saturate(0.4);' : '')
        + '" />'
        + '<div style="position:absolute;top:0px;left:2px;font:700 10px/1.1 Arial,sans-serif;color:#e8d9b5;text-shadow:1px 1px 0 #000,-1px -1px 0 #000,1px -1px 0 #000,-1px 1px 0 #000;pointer-events:none;z-index:6;">' + slotLabel + '</div>'
        + (showCooldown ? '<div style="position:absolute;inset:0;border-radius:3px;display:flex;align-items:center;justify-content:center;pointer-events:none;">'
          + '<span style="font-size:14px;font-family:Cinzel,serif;color:rgba(255,50,50,0.95);font-weight:bold;text-shadow:0 0 10px rgba(255,0,0,0.8),0 0 20px rgba(255,0,0,0.4),0 2px 4px black;letter-spacing:0.5px;">' + racialCdStr + '</span>'
          + '</div>' : '')
        + (spellBar[i] && spellBar[i].cd && _kitCd[spellBar[i].cd] && (spellBar[i].cooldown || 0) >= 1 ? '<div id="kcd' + i + '-' + Math.round(_kitCd[spellBar[i].cd]) + '" style="position:absolute;left:0;right:0;bottom:0;height:100%;background:rgba(5,3,2,0.72);pointer-events:none;animation:kitcd ' + spellBar[i].cooldown + 's linear forwards"></div>' : '')
        + (showClassCooldown ? '<div style="position:absolute;inset:0;border-radius:3px;background:rgba(5,3,2,0.7);display:flex;align-items:center;justify-content:center;pointer-events:none;">'
          + '<span style="font-size:18px;font-family:Cinzel,serif;color:rgba(220,180,80,0.95);font-weight:bold;text-shadow:0 0 8px rgba(180,30,30,0.6),0 2px 4px black;letter-spacing:0.5px;">' + classCdDisplay + '</span>'
          + '</div>' : '')
        + '<div id="sf' + i + 't' + flashTick + '" class="slot-flash-overlay" style="' + (flashIndex === i ? 'animation:slotFlash 0.1s ease-out 1 forwards;' : '') + '"></div>'
        + shortDescHtml
        + '</div>'
        + tooltipHtml
        + '</div>';
    } else {
      // Empty slot
      spellSlotsHtml += '<div id="spell-slot-' + i + '" data-interactive '
        + dropHandlers
        + 'style="'
        + 'width:40px;height:40px;box-sizing:border-box;position:relative;pointer-events:auto;cursor:default;'
        + 'border:1px solid rgba(201,164,106,0.28);border-radius:3px;background:radial-gradient(circle at 50% 40%,rgba(42,30,22,0.92),rgba(10,8,6,0.95));'
        + 'box-shadow:inset 0 2px 6px rgba(0,0,0,0.9);opacity:0.9;'
        + 'transition:all 0.15s;'
        + '">'
        + '<div style="position:absolute;top:0px;left:2px;font:700 10px/1.1 Arial,sans-serif;color:#e8d9b5;text-shadow:1px 1px 0 #000,-1px -1px 0 #000,1px -1px 0 #000,-1px 1px 0 #000;pointer-events:none;z-index:6;">' + slotLabel + '</div>'
        + '<div id="sf' + i + 't' + flashTick + '" class="slot-flash-overlay" style="' + (flashIndex === i ? 'animation:slotFlash 0.1s ease-out 1 forwards;' : '') + '"></div>'
        + '</div>';
    }
  }

  // Lock/unlock button — rendered as its own fixed element for reliable clicks
  const lockTitle = barLocked ? 'Spellbar Locked — click to unlock' : 'Spellbar Unlocked — click to lock';
  const lockSvg = barLocked
    ? '<svg viewBox="0 0 24 24" width="16" height="16" style="pointer-events:none;filter:drop-shadow(0 0 2px rgba(180,155,100,0.4));"><path d="M6 10V7a6 6 0 0112 0v3" fill="none" stroke="rgba(200,175,120,0.9)" stroke-width="2" stroke-linecap="round"/><rect x="4" y="10" width="16" height="12" rx="2" fill="rgba(30,25,18,0.95)" stroke="rgba(160,140,80,0.7)" stroke-width="1.5"/><circle cx="12" cy="16" r="1.5" fill="rgba(200,175,120,0.8)"/></svg>'
    : '<svg viewBox="0 0 24 24" width="16" height="16" style="pointer-events:none;filter:drop-shadow(0 0 4px rgba(220,50,50,0.6));"><path d="M6 10V7a6 6 0 0112 0" fill="none" stroke="rgba(220,60,40,0.9)" stroke-width="2" stroke-linecap="round" transform="translate(4,-1)"/><rect x="4" y="10" width="16" height="12" rx="2" fill="rgba(50,15,10,0.95)" stroke="rgba(220,60,40,0.7)" stroke-width="1.5"/><circle cx="12" cy="16" r="1.5" fill="rgba(220,80,50,0.9)"/></svg>';
  const lockBtn = '';

  var spellScaleStyle = 'transform:translateX(-50%);';
  const spellSlot = `
    <div style="
      position:fixed; bottom:22px; left:50%; ${spellScaleStyle}
      z-index:93; pointer-events:none; display:flex; gap:3px; align-items:flex-end;
      border:1px solid #c9a46a; outline:1px solid #2a1e16; border-radius:4px; background:linear-gradient(#2a1e16,#14100b); padding:4px 5px; box-shadow:inset 0 0 0 1px #6b4a2f,0 2px 10px rgba(0,0,0,0.7);
    ">
      ${spellSlotsHtml}
    </div>
  `;

  var lockScaleStyle = 'transform:translateX(-310px);';
  // Separate lock button — own fixed container so nothing blocks clicks
  const lockBtnEl = `
    <div id="spellbar-lock-btn" data-interactive onclick="sendAction('toggleSpellBarLock')" title="${lockTitle}" style="
      position:fixed; bottom:32px; left:50%; z-index:98;
      ${lockScaleStyle}
      width:29px; height:29px; cursor:pointer; pointer-events:auto;
      background:${barLocked
        ? 'linear-gradient(135deg,rgba(20,16,12,0.95),rgba(30,24,18,0.9))'
        : 'linear-gradient(135deg,rgba(50,12,8,0.95),rgba(70,18,12,0.9))'};
      border:1px solid ${barLocked ? 'rgba(160,140,80,0.6)' : 'rgba(220,60,40,0.8)'};
      border-radius:3px;
      display:flex; align-items:center; justify-content:center;
      box-shadow:${barLocked
        ? '0 0 6px rgba(180,155,100,0.15), inset 0 1px 3px rgba(0,0,0,0.6)'
        : '0 0 10px rgba(220,50,40,0.4), 0 0 20px rgba(220,50,40,0.15), inset 0 1px 3px rgba(0,0,0,0.6)'};
      transition:all 0.2s;
    ">
      ${lockSvg}
    </div>
  `;

  // Menu buttons removed — now integrated into always-visible side panel tabs
  const menuBar = '';

  // --- CASTING BAR (shown above art bar when casting) ---
  const isCasting = s.casting === true;
  const castProg = s.castProgress || 0;
  const castDur = s.castDuration || 1;
  const castPct = isCasting ? Math.min(100, Math.round((castProg / castDur) * 100)) : 0;
  const castName = s.castSpellName || 'Casting...';

  var castScaleStyle = 'transform:translateX(-50%);';
  const castingBar = isCasting ? `
    <div style="
      position:fixed; bottom:140px; left:50%; ${castScaleStyle}
      z-index:96; pointer-events:none;
      display:flex; flex-direction:column; align-items:center; gap:2px;
    ">
      <div style="
        font-family:Cinzel,'Palatino',Georgia,serif;
        font-size:14px; font-weight:bold;
        color:rgba(220,190,100,0.95);
        text-shadow:0 0 8px rgba(200,170,80,0.35),0 1px 3px rgba(0,0,0,0.9);
        letter-spacing:1.5px;
      ">${castName}</div>
      <div style="
        width:300px; height:16px; position:relative;
        background:rgba(8,6,4,0.92);
        border:2px solid rgba(90,70,35,0.8);
        border-radius:3px;
        box-shadow:inset 0 1px 4px rgba(0,0,0,0.8),0 0 10px rgba(0,0,0,0.5);
        overflow:hidden;
      ">
        <div style="
          height:100%; width:${castPct}%;
          background:linear-gradient(90deg,rgba(160,20,20,0.95),rgba(220,50,30,0.95));
          box-shadow:0 0 8px rgba(200,30,30,0.4);
          border-radius:2px;
          transition:width 0.1s linear;
        "></div>
        <div style="
          position:absolute;inset:0;
          background:linear-gradient(180deg,rgba(255,255,255,0.08) 0%,transparent 50%);
          border-radius:2px;
        "></div>
      </div>
    </div>
  ` : '';

  // --- GOTHIC ART BAR (bottom center, pushed down) ---
  const artBar = `
    <div style="
      position:fixed; bottom:-220px; left:50%; transform:translateX(-50%);
      z-index:91; pointer-events:none;
    ">
      <img src="/cdn/ui-gothic-ornate-progress-artbar-wpvc-spg.webp" style="
        height:560px;
        -webkit-user-drag:none; user-select:none;
        filter: drop-shadow(0 2px 8px rgba(0,0,0,0.6));
      " />
    </div>
  `;

  // --- RACE PORTRAIT + HEALTH/MANA (top-left) ---
  const racePortrait = `
    <div style="
      position:fixed; top:20px; left:1px; z-index:90;
      display:flex; align-items:center; gap:14px;
      pointer-events:none;
      font-family: Cinzel, 'Palatino', Georgia, serif;
    ">
      <div style="position:relative;width:108px;height:108px;">
        <!-- Spiked gothic frame behind portrait -->
        <img src="/cdn/frame-gothic-circular-bronze-thorns-i5clatx1.webp" style="position:absolute;top:-12px;bottom:-12px;left:-4px;right:-20px;width:calc(100% + 24px);height:calc(100% + 24px);object-fit:contain;pointer-events:none;-webkit-user-drag:none;user-select:none;filter:drop-shadow(0 2px 10px rgba(0,0,0,0.7));" />
        <!-- Portrait circle -->
        <div style="position:absolute;top:50%;left:calc(50% - 4px);transform:translate(-50%,-50%);width:82px;height:82px;border-radius:50%;overflow:hidden;box-shadow:inset 0 0 10px rgba(0,0,0,0.5);">
          ${portrait ? '<img src="' + portrait + '" style="width:100%;height:100%;object-fit:cover;-webkit-user-drag:none;user-select:none;" />' : ''}
        </div>
        <!-- Level badge -->
        <div style="position:absolute;bottom:6px;right:6px;width:36px;height:36px;border-radius:50%;background:linear-gradient(135deg,rgba(30,25,18,0.95),rgba(15,12,8,0.95));border:2px solid rgba(160,140,80,0.5);display:flex;align-items:center;justify-content:center;font-family:Cinzel,Palatino,Georgia,serif;font-size:16px;font-weight:bold;color:rgba(200,175,120,0.95);text-shadow:0 0 6px rgba(200,170,80,0.3),0 1px 2px rgba(0,0,0,0.9);box-shadow:0 0 6px rgba(0,0,0,0.5);z-index:2;">${level}</div>
      </div>
      <div style="display:flex;flex-direction:column;gap:0;">
        <!-- Health number ABOVE the bar -->
        <div style="font-family:Cinzel,serif;font-size:18px;font-weight:bold;color:rgba(255,210,210,0.95);text-shadow:0 1px 3px rgba(0,0,0,0.9),0 0 8px rgba(180,30,30,0.3);margin-bottom:2px;letter-spacing:1px;">${health} / ${maxHealth}</div>
        <!-- Health bar (no text overlay) -->
        <div style="width:154px;height:11px;position:relative;">
          <div style="position:absolute;inset:0;border-radius:5px;border:2px solid rgba(90,70,35,0.8);background:rgba(10,8,5,0.85);box-shadow:inset 0 1px 3px rgba(0,0,0,0.8),0 1px 3px rgba(0,0,0,0.4);overflow:hidden;z-index:1;">
            <div style="height:100%;width:${healthPct}%;background:linear-gradient(90deg,rgba(140,15,15,0.95),rgba(190,30,30,0.95));transition:width 0.3s;box-shadow:0 0 6px rgba(200,30,30,0.4);border-radius:3px;"></div>
          </div>
        </div>
        <!-- Mana bar (no text overlay) -->
        <div style="width:154px;height:11px;position:relative;margin-top:4px;">
          <div style="position:absolute;inset:0;border-radius:5px;border:2px solid rgba(90,70,35,0.8);background:rgba(10,8,5,0.85);box-shadow:inset 0 1px 3px rgba(0,0,0,0.8),0 1px 3px rgba(0,0,0,0.4);overflow:hidden;z-index:1;">
            <div style="height:100%;width:${manaPct}%;background:linear-gradient(90deg,rgba(100,35,180,0.95),rgba(155,60,235,0.95));transition:width 0.3s;box-shadow:0 0 6px rgba(140,50,220,0.4);border-radius:3px;"></div>
          </div>
        </div>
        <!-- Mana number BELOW the bar -->
        <div style="font-family:Cinzel,serif;font-size:18px;font-weight:bold;color:rgba(220,200,240,0.95);text-shadow:0 1px 3px rgba(0,0,0,0.9),0 0 8px rgba(120,50,200,0.3);margin-top:2px;letter-spacing:1px;">${mana} / ${maxMana}</div>
      </div>
    </div>
    ${renderTargetDisplay(s, rhScale)}
  `;

  // --- MINIMAP (top-right) — radar-style with contour lines and landmarks ---
  const currentPlace = (world.getEntityPlace ? world.getEntityPlace(localPlayer.id) : null) || s._musicPlace || 'main';

  // Overworld landmarks (synced with actual building positions)
  const LANDMARKS_MAIN = [
    { x: 0, z: 0, label: 'Well', icon: '/cdn/icon-minimap-village-houses-dark.png' },
    { x: 0, z: -24, label: 'Inn', icon: '/cdn/icon-minimap-village-houses-dark.png' },
    { x: 24, z: 2, label: 'Smithy', icon: '/cdn/icon-minimap-weapon-rack-dark.png' },
    { x: -24, z: 4, label: 'Merchant', icon: '/cdn/icon-minimap-village-houses-dark.png' },
    { x: -16, z: 24, label: 'Bank', icon: '/cdn/icon-minimap-watchtower-dark.png' },
    { x: 8, z: -12, label: 'Quest Board', icon: '/cdn/icon-minimap-gate-archway-dark.png' },
    { x: -50, z: -9, label: 'Old Bridge', icon: '/cdn/icon-minimap-ruins-archway-dark.png' },
    { x: -100, z: 5, label: 'Briarwild', icon: '/cdn/icon-minimap-thorny-tree-dark.png' },
    { x: 140, z: 20, label: 'Emberstone Quarry', icon: '/cdn/icon-minimap-watchtower-dark.png' },
  ];

  // Dojo landmarks (training hall ~40x50m, origin-centered)
  const LANDMARKS_DOJO = [
    { x: 0, z: 0, label: 'Center Ring', icon: '/cdn/icon-minimap-combat-ring-dark.png' },
    { x: -16, z: -20, label: 'Weapon Rack', icon: '/cdn/icon-minimap-weapon-rack-dark.png' },
    { x: 16, z: -20, label: 'Weapon Rack', icon: '/cdn/icon-minimap-weapon-rack-dark.png' },
    { x: -16, z: 18, label: 'Training Post', icon: '/cdn/icon-minimap-training-dummy-dark.png' },
    { x: 16, z: 18, label: 'Training Post', icon: '/cdn/icon-minimap-training-dummy-dark.png' },
    { x: 0, z: 25, label: 'Entrance', icon: '/cdn/icon-minimap-gate-archway-dark.png' },
  ];

  // Sanctum landmarks (ritual chamber, origin-centered)
  const LANDMARKS_SANCTUM = [
    { x: 0, z: 0, label: 'Central Altar', icon: '/cdn/icon-minimap-altar-dark.png' },
    { x: 0, z: -10, label: 'Ritual Circle', icon: '/cdn/icon-minimap-magic-circle-dark.png' },
    { x: -12, z: 8, label: 'Soul Font', icon: '/cdn/icon-minimap-soul-font-dark.png' },
    { x: 12, z: 8, label: 'Offering Pyre', icon: '/cdn/icon-minimap-pyre-dark.png' },
    { x: 0, z: 20, label: 'Entrance', icon: '/cdn/icon-minimap-gate-archway-dark.png' },
  ];

  const LANDMARKS_BY_PLACE = { main: LANDMARKS_MAIN, dojo: LANDMARKS_DOJO, sanctum: LANDMARKS_SANCTUM };
  const LANDMARKS = LANDMARKS_BY_PLACE[currentPlace] ?? LANDMARKS_MAIN;

  // Contours per place
  const CONTOURS_MAIN = [
    { cx: 115, cz: -115, r: 25 },
    { cx: 115, cz: -115, r: 38 },
    { cx: 115, cz: -115, r: 52 },
    { cx: 100, cz: -100, r: 18 },
  ];
  const CONTOURS_DOJO = [
    { cx: 0, cz: 0, r: 12 },
    { cx: 0, cz: 0, r: 18 },
  ];
  const CONTOURS_SANCTUM = [
    { cx: 0, cz: -10, r: 8 },
    { cx: 0, cz: -10, r: 14 },
  ];
  const CONTOURS_BY_PLACE = { main: CONTOURS_MAIN, dojo: CONTOURS_DOJO, sanctum: CONTOURS_SANCTUM };

  // Mountain contour arcs (place-aware)
  const MOUNTAIN_CONTOURS = CONTOURS_BY_PLACE[currentPlace] ?? CONTOURS_MAIN;
  // Temple plateau contour (overworld only — near Crypt Chapel)
  const TEMPLE_CONTOUR = currentPlace === 'main' ? { cx: -115, cz: 131, r: 16 } : null;

  const px = localPlayer.feetPosition?.x ?? 0;
  const pz = localPlayer.feetPosition?.z ?? 0;
  const SCALE = 0.667; // 160px / 240m
  const CENTER = 80;   // half of 160px
  const RADIUS = 78;   // clip radius (slightly inside edge)

  // Convert world pos to minimap SVG coords
  function toMini(wx, wz) {
    const mx = CENTER + (wx - px) * SCALE;
    const my = CENTER + (wz - pz) * SCALE;
    return { mx, my };
  }

  function inCircle(mx, my) {
    const dx = mx - CENTER;
    const dy = my - CENTER;
    return (dx * dx + dy * dy) <= (RADIUS * RADIUS);
  }

  // Build contour SVG paths (circles translated relative to player)
  let contourSvg = '';
  for (const c of MOUNTAIN_CONTOURS) {
    const { mx, my } = toMini(c.cx, c.cz);
    const sr = c.r * SCALE;
    // Only draw if any part might be visible
    const distFromCenter = Math.sqrt((mx - CENTER) * (mx - CENTER) + (my - CENTER) * (my - CENTER));
    if (distFromCenter - sr < RADIUS + 10) {
      contourSvg += '<circle cx="' + mx.toFixed(1) + '" cy="' + my.toFixed(1) + '" r="' + sr.toFixed(1) + '" fill="none" stroke="rgba(180,155,80,0.18)" stroke-width="1" />';
    }
  }
  // Temple plateau contour (overworld only)
  if (TEMPLE_CONTOUR) {
    const { mx, my } = toMini(TEMPLE_CONTOUR.cx, TEMPLE_CONTOUR.cz);
    const sr = TEMPLE_CONTOUR.r * SCALE;
    const distFromCenter = Math.sqrt((mx - CENTER) * (mx - CENTER) + (my - CENTER) * (my - CENTER));
    if (distFromCenter - sr < RADIUS + 10) {
      contourSvg += '<circle cx="' + mx.toFixed(1) + '" cy="' + my.toFixed(1) + '" r="' + sr.toFixed(1) + '" fill="none" stroke="rgba(180,155,80,0.15)" stroke-width="1" stroke-dasharray="3,3" />';
    }
  }

  // Landmark icons, then names: nearest first, a name drawn only where it covers no other icon and no other name
  let landmarkSvg = '';
  const _vis = [];
  for (const lm of LANDMARKS) {
    const { mx, my } = toMini(lm.x, lm.z);
    if (!inCircle(mx, my)) continue;
    _vis.push({ lm, mx, my, d: (mx - CENTER) * (mx - CENTER) + (my - CENTER) * (my - CENTER) });
    landmarkSvg += '<foreignObject x="' + (mx - 12).toFixed(1) + '" y="' + (my - 12).toFixed(1) + '" width="24" height="24" style="overflow:visible;">'
      + '<img xmlns="http://www.w3.org/1999/xhtml" src="' + lm.icon + '" style="width:24px;height:24px;display:block;filter:drop-shadow(0 0 3px rgba(200,175,120,0.6));pointer-events:none;" />'
      + '</foreignObject>';
  }
  _vis.sort(function (a, b) { return a.d - b.d; });
  const _boxes = _vis.map(function (v) { return { x0: v.mx - 10, x1: v.mx + 10, y0: v.my - 10, y1: v.my + 10, own: v }; });
  const _hit = function (r, skip) { return _boxes.some(function (bx) { return bx.own !== skip && r.x0 < bx.x1 && r.x1 > bx.x0 && r.y0 < bx.y1 && r.y1 > bx.y0; }); };
  for (const v of _vis) {
    const _w = v.lm.label.length * 7 + 6;
    const r = { x0: v.mx - _w / 2, x1: v.mx + _w / 2, y0: v.my + 11, y1: v.my + 24 };
    if (!inCircle(r.x0, r.y1) || !inCircle(r.x1, r.y1)) continue; // the ring would cut it
    if (_hit(r, v)) continue;
    _boxes.push({ x0: r.x0, x1: r.x1, y0: r.y0, y1: r.y1, own: null });
    landmarkSvg += '<text x="' + v.mx.toFixed(1) + '" y="' + (v.my + 21).toFixed(1) + '" fill="rgba(232,217,181,0.95)" font-size="11" font-family="Cinzel,serif" text-anchor="middle" font-weight="bold" stroke="rgba(0,0,0,0.95)" stroke-width="3" paint-order="stroke fill">' + v.lm.label + '</text>';
  }

  var rhScale = (rightHudLayout && rightHudLayout.rightHudScale) || 1;
  var scaleStyle = rhScale < 1 ? 'transform:scale(' + rhScale + ');transform-origin:top right;' : '';

  const minimap = `
    <div data-minimap-wrap style="position:fixed;top:20px;right:16px;z-index:90;display:flex;flex-direction:column;align-items:center;pointer-events:none;font-family:Cinzel,'Palatino',Georgia,serif;${scaleStyle}">
      <div style="position:relative;width:220px;height:220px;">
        <!-- Minimap content circle -->
        <div style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:160px;height:160px;border-radius:50%;overflow:hidden;background:radial-gradient(circle at 30% 30%,rgba(30,20,38,0.95),rgba(14,8,22,0.98) 70%);">
          ${currentPlace === 'dojo' || currentPlace === 'sanctum' ? `
          <!-- Simplified interior minimap: place name + player dot only -->
          <svg viewBox="0 0 160 160" width="160" height="160" style="position:absolute;top:0;left:0;">
            <defs>
              <clipPath id="minimap-clip"><circle cx="80" cy="80" r="${RADIUS}" /></clipPath>
            </defs>
            <g clip-path="url(#minimap-clip)">
              <!-- Place name centered -->
              <text x="80" y="72" fill="rgba(210,180,100,0.95)" font-size="16" font-family="Cinzel,Palatino,Georgia,serif" text-anchor="middle" font-weight="bold" letter-spacing="1">${currentPlace === 'dojo' ? 'The Dojo' : 'The Sanctum'}</text>
              <!-- Subtle decorative line -->
              <line x1="45" y1="78" x2="115" y2="78" stroke="rgba(200,170,80,0.2)" stroke-width="0.5" />
              <!-- Player marker (center, always) -->
              <circle cx="80" cy="92" r="4" fill="rgba(120,255,60,0.95)" stroke="rgba(160,255,100,0.8)" stroke-width="1">
                <animate attributeName="r" values="4;5;4" dur="2s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="1;0.7;1" dur="2s" repeatCount="indefinite" />
              </circle>
              <circle cx="80" cy="92" r="8" fill="none" stroke="rgba(200,175,120,0.25)" stroke-width="0.5">
                <animate attributeName="r" values="8;12;8" dur="2s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.25;0;0.25" dur="2s" repeatCount="indefinite" />
              </circle>
            </g>
          </svg>
          ` : `
          <!-- Grid overlay -->
          <div style="position:absolute;inset:0;background-image:linear-gradient(rgba(200,175,120,0.03) 1px,transparent 1px),linear-gradient(90deg,rgba(200,175,120,0.03) 1px,transparent 1px);background-size:18px 18px;pointer-events:none;"></div>
          <!-- SVG radar layer: contours, landmarks, player -->
          <svg viewBox="0 0 160 160" width="160" height="160" style="position:absolute;top:0;left:0;">
            <defs>
              <clipPath id="minimap-clip"><circle cx="80" cy="80" r="${RADIUS}" /></clipPath>
              <filter id="landmark-glow"><feGaussianBlur stdDeviation="1.5" /><feMerge><feMergeNode /><feMergeNode in="SourceGraphic" /></feMerge></filter>
            </defs>
            <g clip-path="url(#minimap-clip)">
              <!-- Range rings -->
              <circle cx="80" cy="80" r="26.7" fill="none" stroke="rgba(200,175,120,0.06)" stroke-width="0.5" />
              <circle cx="80" cy="80" r="53.4" fill="none" stroke="rgba(200,175,120,0.06)" stroke-width="0.5" />
              <!-- Crosshair lines -->
              <line x1="80" y1="2" x2="80" y2="158" stroke="rgba(200,175,120,0.04)" stroke-width="0.5" />
              <line x1="2" y1="80" x2="158" y2="80" stroke="rgba(200,175,120,0.04)" stroke-width="0.5" />
              <!-- Contour lines -->
              ${contourSvg}
              <!-- Landmark dots -->
              <g filter="url(#landmark-glow)">
                ${landmarkSvg}
              </g>
              <!-- Player marker (center, always) -->
              <circle cx="80" cy="80" r="4" fill="rgba(120,255,60,0.95)" stroke="rgba(160,255,100,0.8)" stroke-width="1">
                <animate attributeName="r" values="4;5;4" dur="2s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="1;0.7;1" dur="2s" repeatCount="indefinite" />
              </circle>
              <circle cx="80" cy="80" r="8" fill="none" stroke="rgba(200,175,120,0.25)" stroke-width="0.5">
                <animate attributeName="r" values="8;12;8" dur="2s" repeatCount="indefinite" />
                <animate attributeName="opacity" values="0.25;0;0.25" dur="2s" repeatCount="indefinite" />
              </circle>
            </g>
          </svg>
          <!-- Compass labels (fixed, HTML layer above SVG) -->
          <div style="position:absolute;top:6px;left:50%;transform:translateX(-50%);font-size:11px;font-weight:bold;color:rgba(200,175,120,0.7);text-shadow:0 1px 3px rgba(0,0,0,0.8);">N</div>
          <div style="position:absolute;bottom:6px;left:50%;transform:translateX(-50%);font-size:10px;color:rgba(200,175,120,0.3);">S</div>
          <div style="position:absolute;left:6px;top:50%;transform:translateY(-50%);font-size:10px;color:rgba(200,175,120,0.3);">W</div>
          <div style="position:absolute;right:6px;top:50%;transform:translateY(-50%);font-size:10px;color:rgba(200,175,120,0.3);">E</div>
          `}
        </div>
        <!-- Gothic thorned circular frame overlay -->
        <img src="/cdn/ui-gothic-thorned-circular-frame-bronze-gdbzvhoy.webp" style="position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:220px;height:220px;object-fit:contain;pointer-events:none;-webkit-user-drag:none;user-select:none;" />
      </div>
      <!-- Place Name (above minimap) -->
      ${(() => {
        const PLACE_NAMES = {
          'main': "Lantern's Reach",
          'sanctum': 'The Sanctum',
          'dojo': 'The Dojo',
          'crucible': 'The Crucible',
          'tutorial': 'The Tutorial',
          'demonic-hall': 'The Demonic Hall',
          'gothic-temple': 'The Gothic Temple',
          'main-menu-land': '',
          'main-menu': '',
          'character-creation-land': '',
        };
        const placeId = currentPlace || 'main';
        let placeName = PLACE_NAMES[placeId] !== undefined ? PLACE_NAMES[placeId] : placeId;
        if (placeId === 'main') {
          // regions of the Lantern March (mirror of scripts/lib/regions.js)
          const X = localPlayer.feetPosition?.x ?? 0, Z = localPlayer.feetPosition?.z ?? 0, d = (a, b) => Math.hypot(X - a, Z - b);
          placeName = d(0, 0) < 70 ? "Lantern's Reach" : d(-720, 70) < 60 ? 'Thornhollow' : d(900, -170) < 60 ? 'Cinderhold' : d(250, 1430) < 60 ? 'Gullrest' : d(-18, 52) < 26 ? 'Windmill Farm' : d(135, 30) < 80 ? 'Emberstone Quarry'
            : d(30, -360) < 90 ? 'The Old Spire' : d(1350, -700) < 330 ? 'Hollowcrypt Vale' : d(-1000, 1920) < 340 ? 'Tideglass Coast' : d(-1300, 950) < 520 ? 'Sorrowfen'
            : d(300, 1650) < 420 ? 'Saltmere Coast' : d(-3540, -20) < 320 ? 'Velthraen Reach' : d(-10, -3760) < 320 ? 'Glassmere Archive' : d(7560, -170) < 260 ? 'Emberstone Bastion' : (() => { const ss = (a, b, v) => { const t = Math.min(1, Math.max(0, (v - a) / (b - a))); return t * t * (3 - 2 * t); }; const rz = Z > 0 ? 2050 + 1650 * ss(1300, 2800, Math.abs(X)) : 9200; return Math.hypot(X / 9600, Z / rz) > 1; })() ? 'The Shrouded Sea'
            : Z < -6400 ? 'The Ninth Veil' : X > 6400 ? 'Ashfall Reaches' : Z < -3000 ? 'Frostveil Tundra' : X > 3000 ? 'Sunscar Expanse' : X < -3000 ? 'Elderveil Wilds'
            : Z < -800 ? 'Greyspine Mountains' : X > 650 ? 'Emberstone Highlands' : X < -500 ? 'Briarwild Deepwood'
            : (X < -60 && Math.abs(Z) < 420) ? 'Briarwild' : 'The Lantern March';
        }
        // Never render any meta place ID (menu, creation, etc.)
        if (!placeName || placeId.indexOf('menu') !== -1 || placeId.indexOf('creation') !== -1) return '';
        // zone banner: the creator's sword dividers flank the region's name for a few seconds on entry
        const _zs = globalThis.__zoneBanner || (globalThis.__zoneBanner = { name: null, at: 0, n: 0 });
        if (_zs.name !== placeName) { _zs.first = _zs.name === null; _zs.name = placeName; _zs.at = Date.now(); _zs.n++; }
        const _zoneBanner = (Date.now() - _zs.at < 4500)
          ? '<style>@keyframes zoneIn{0%{opacity:0;transform:translate(-50%,8px)}12%{opacity:1;transform:translate(-50%,0)}78%{opacity:1}100%{opacity:0}}</style>'
            + '<div id="zone-banner-' + _zs.n + '" style="position:fixed;top:17vh;left:50%;transform:translateX(-50%);display:flex;align-items:center;gap:14px;pointer-events:none;z-index:50;animation:zoneIn 4.5s ease-out forwards;filter:sepia(1) saturate(2.4) brightness(1.1) drop-shadow(0 2px 4px rgba(0,0,0,.9));">'
            + '<img src="/cdn/divider-fade-004-u0lc3elr5.webp" style="width:190px;height:28px;image-rendering:pixelated">'
            + '<div style="text-align:center;white-space:nowrap"><div style="font-family:Cinzel,Palatino,Georgia,serif;font-size:13px;letter-spacing:3px;color:#e8d9b5;text-transform:uppercase">' + (_zs.first ? 'You stand in' : 'Entering') + '</div>'
            + '<div style="font-family:Cinzel,Palatino,Georgia,serif;font-size:34px;font-weight:700;color:#f2d38a;letter-spacing:2px;line-height:1.1">' + placeName + '</div></div>'
            + '<img src="/cdn/divider-fade-004-u0lc3elr5.webp" style="width:190px;height:28px;image-rendering:pixelated;transform:scaleX(-1)">'
            + '</div>'
          : '';
        return _zoneBanner + '<div style="position:absolute;top:-14px;left:50%;transform:translateX(-50%);background:rgba(8,6,12,0.9);border:1px solid rgba(90,70,35,0.5);border-radius:3px;padding:2px 10px;white-space:nowrap;z-index:1;"><span style="font-family:Cinzel,Palatino,Georgia,serif;font-size:18px;color:rgba(210,180,100,0.95);text-shadow:0 0 6px rgba(200,170,80,0.25),0 1px 2px rgba(0,0,0,0.9);letter-spacing:1px;">' + placeName + '</span></div>';
      })()}
      <!-- Realm Clock (below minimap) -->
      ${(s.realmTime) ? '<div style="position:absolute;bottom:-14px;left:50%;transform:translateX(-50%);background:rgba(8,6,12,0.9);border:1px solid rgba(90,70,35,0.5);border-radius:3px;padding:2px 10px;white-space:nowrap;"><span style="font-family:Cinzel,Palatino,Georgia,serif;font-size:18px;color:rgba(210,180,100,0.95);text-shadow:0 0 6px rgba(200,170,80,0.25),0 1px 2px rgba(0,0,0,0.9);letter-spacing:1px;">' + s.realmTime + '</span></div>' : ''}
    </div>
  `;

  // --- REPUTATION BAR (segmented, gold-toned, above XP bar) ---
  const { getProgressInTier, getTierName: _getRepTierName } = require('./reputation.js');
  const reputation = s.reputation ?? 0;
  const repProgress = getProgressInTier(reputation);
  const repPct = Math.min(1, repProgress.current / repProgress.max);
  const REP_SEGMENTS = 20;
  const repFilledSegs = Math.floor(repPct * REP_SEGMENTS);
  const repPartialPct = (repPct * REP_SEGMENTS - repFilledSegs) * 100;
  const _repTierLabel = _getRepTierName(reputation);

  let repSegments = '';
  for (let i = 0; i < REP_SEGMENTS; i++) {
    let fill;
    if (i < repFilledSegs) {
      fill = 'background:linear-gradient(180deg,rgba(200,170,80,0.9),rgba(160,140,50,0.85));box-shadow:inset 0 1px 2px rgba(255,255,255,0.15),0 0 4px rgba(200,170,80,0.3);';
    } else if (i === repFilledSegs) {
      fill = 'background:linear-gradient(90deg,rgba(200,170,80,0.8) ' + repPartialPct + '%,rgba(15,12,10,0.6) ' + repPartialPct + '%);';
    } else {
      fill = 'background:rgba(15,12,10,0.6);';
    }
    repSegments += '<div style="flex:1;height:100%;' + fill + 'border-right:1px solid rgba(90,70,35,0.5);"></div>';
  }

  const repBar = `
    <div style="
      position:fixed; bottom:14px; left:0; right:0; height:12px; z-index:95;
      pointer-events:none;
      background:rgba(8,6,4,0.9);
      border-top:1px solid rgba(120,100,50,0.5);
      border-bottom:1px solid rgba(90,70,35,0.4);
      box-shadow:inset 0 1px 4px rgba(0,0,0,0.7);
    ">
      <div style="display:flex;height:100%;padding:1px 0;">
        ${repSegments}
      </div>
      <div style="
        position:absolute;inset:0;display:flex;align-items:center;justify-content:center;
        font-family:Cinzel,'Palatino',Georgia,serif;
        font-size:8px;font-weight:700;
        color:rgba(200,170,80,0.7);
        text-shadow:0 1px 2px black;
        letter-spacing:2px;
        color:#22c55e;
      ">${_repTierLabel.toUpperCase()} — ${repProgress.current} / ${repProgress.max}</div>
      <div style="
        position:absolute;right:6px;top:0;bottom:0;display:flex;align-items:center;
        font-family:Cinzel,'Palatino',Georgia,serif;
        font-size:9px;font-weight:700;
        color:rgba(200,220,200,0.75);
        text-shadow:0 1px 2px rgba(0,0,0,0.9);
        letter-spacing:0.5px;
        white-space:nowrap;
      ">${repProgress.current} / ${repProgress.max}</div>
    </div>
  `;

  // --- XP BAR (full-width segmented bar across entire bottom) ---
  const xp = s.xpInto ?? s.xp ?? 0;
  const xpToLevel = s.xpToLevel || 1;
  const xpPct = Math.min(1, xp / xpToLevel);
  const totalSegments = 20;
  const filledSegments = Math.floor(xpPct * totalSegments);
  const partialFill = (xpPct * totalSegments) - filledSegments;

  let segmentsHtml = '';
  for (let i = 0; i < totalSegments; i++) {
    let fillWidth = '0%';
    let glowStyle = '';
    if (i < filledSegments) {
      fillWidth = '100%';
    } else if (i === filledSegments) {
      fillWidth = Math.round(partialFill * 100) + '%';
    }
    if (i < filledSegments || (i === filledSegments && partialFill > 0)) {
      glowStyle = 'box-shadow:0 0 4px rgba(160,80,220,0.5);';
    }
    segmentsHtml += `
      <div style="
        flex:1; height:100%;
        background:rgba(10,10,15,0.85);
        border:1px solid rgba(160,140,80,0.35);
        border-radius:2px;
        overflow:hidden;
        position:relative;
        box-shadow:inset 0 1px 3px rgba(0,0,0,0.6);
      ">
        <div style="
          height:100%; width:${fillWidth};
          background:linear-gradient(90deg,oklch(0.45 0.25 300),oklch(0.60 0.28 290));
          ${glowStyle}
          border-radius:1px;
          transition:width 0.3s;
        "></div>
        <div style="
          position:absolute;inset:0;
          background:linear-gradient(180deg,rgba(255,255,255,0.08) 0%,transparent 50%);
          pointer-events:none;
        "></div>
      </div>
    `;
  }

  const xpBar = `
    <div style="
      position:fixed; bottom:0; left:0; right:0;
      z-index:95; pointer-events:none;
      height:16px;
      padding:0 4px;
      display:flex;
      align-items:center;
      gap:2px;
      background:rgba(5,5,8,0.6);
      border-top:1px solid rgba(160,140,80,0.25);
    ">
      <!-- Level badge -->
      <div style="
        width:26px; height:26px; border-radius:50%;
        flex-shrink:0;
        background:linear-gradient(135deg,rgba(30,25,18,0.95),rgba(15,12,8,0.95));
        border:1px solid rgba(160,140,80,0.5);
        display:flex; align-items:center; justify-content:center;
        font-family:Cinzel,'Palatino',Georgia,serif;
        font-size:11px; font-weight:bold;
        color:rgba(200,175,120,0.95);
        text-shadow:0 0 6px rgba(200,170,80,0.3),0 1px 2px rgba(0,0,0,0.9);
        box-shadow:0 0 6px rgba(0,0,0,0.5);
        margin-right:4px;
        margin-top:-6px;
      ">${level}</div>
      <!-- Segmented bar -->
      <div style="
        flex:1; height:10px;
        display:flex; gap:2px;
      ">
        ${segmentsHtml}
      </div>
      <!-- XP text -->
      <div style="
        flex-shrink:0;
        font-family:Cinzel,'Palatino',Georgia,serif;
        font-size:9px; font-weight:700;
        color:rgba(200,220,200,0.75);
        text-shadow:0 1px 2px rgba(0,0,0,0.9);
        letter-spacing:0.5px;
        margin-left:6px;
        white-space:nowrap;
      ">${xp} / ${xpToLevel}</div>
    </div>
  `;

  // --- ACTIVE BUFF ICONS (to the left of minimap) ---
  const buffs = s.buffs || [];
  let buffIconsHtml = '';
  for (let bi = 0; bi < buffs.length; bi++) {
    const buff = buffs[bi];
    if (!buff) continue;
    // Skip War Banner — rendered by dedicated ui-buff-icons.js component
    if (buff.name === 'War Banner') continue;
    const bIcon = buff.icon || '/cdn/icon-dark-gothic-mystery-rune.png';
    const bName = buff.name || 'Buff';
    const bStat = buff.stat && buff.stat[0] !== '_' ? ('+' + buff.amount + ' ' + buff.stat.charAt(0).toUpperCase() + buff.stat.slice(1)) : '';

    buffIconsHtml += '<div data-interactive oncontextmenu="event.preventDefault();sendAction(\'removeBuff\',{buffIndex:' + bi + '})" style="'
      + 'width:36px;height:36px;position:relative;pointer-events:auto;cursor:context-menu;'
      + 'background:linear-gradient(135deg,rgba(15,12,10,0.95),rgba(25,20,16,0.9));'
      + 'border:2px solid rgba(160,130,60,0.7);border-radius:3px;'
      + 'animation:buffGlow 2s ease-in-out infinite;'
      + '">'
      + '<img src="' + bIcon + '" style="width:100%;height:100%;object-fit:contain;pointer-events:none;-webkit-user-drag:none;user-select:none;filter:brightness(1.0) sepia(0.15);" />'
      + (buff.remainingSec && buff.remainingSec > 0 ? '<div style="position:absolute;bottom:0;left:0;right:0;text-align:center;font-family:Cinzel,serif;font-size:12px;line-height:1;color:#fff;text-shadow:0 1px 2px #000,0 0 4px #000;pointer-events:none;">' + (buff.remainingSec >= 60 ? Math.floor(buff.remainingSec / 60) + 'm' : '' + Math.round(buff.remainingSec)) + '</div>' : '')
      + '<div class="buff-tooltip" style="'
      + 'display:none;position:absolute;top:100%;right:0;margin-top:4px;'
      + 'padding:5px 8px;pointer-events:none;z-index:200;white-space:nowrap;'
      + 'background:linear-gradient(135deg,rgba(8,5,12,0.95),rgba(20,12,28,0.95));'
      + 'border:1px solid rgba(160,130,60,0.6);border-radius:3px;'
      + 'box-shadow:0 2px 8px rgba(0,0,0,0.8);'
      + '">'
      + '<div style="font-family:Cinzel,serif;font-size:13px;color:rgba(220,195,120,0.95);line-height:1.2;">' + bName + '</div>'
      + (bStat ? '<div style="font-family:Cinzel,serif;font-size:12px;color:rgba(120,255,120,0.9);line-height:1.2;margin-top:2px;">' + bStat + '</div>' : '')
      + '</div>'
      + '</div>';
  }

  var buffRight = rhScale < 1 ? Math.round(220 * rhScale + 24) : 240;

  const buffDisplay = buffs.length > 0 ? `
    <div style="
      position:fixed; top:20px; right:${buffRight}px; z-index:90;
      display:flex; flex-direction:column; gap:4px; align-items:flex-end;
      pointer-events:none;
    ">
      ${buffIconsHtml}
    </div>
  ` : '';

  // --- INTERACT HINT (above art bar, green glow, 25% bigger) ---
  const interactHint = s.interactHint ? `
    <style>
      @keyframes hintPulse {
        0%, 100% { opacity: 0.85; text-shadow: 0 0 12px rgba(60,220,80,0.5), 0 0 24px rgba(60,220,80,0.2), 0 2px 4px rgba(0,0,0,0.8); }
        50% { opacity: 1; text-shadow: 0 0 18px rgba(60,220,80,0.7), 0 0 36px rgba(60,220,80,0.35), 0 2px 4px rgba(0,0,0,0.8); }
      }
    </style>
    <div style="
      position:fixed; bottom:240px; left:50%; transform:translateX(-50%);
      z-index:120; pointer-events:none; text-align:center;
    ">
      <div style="
        font-family: Cinzel, Palatino, Georgia, serif;
        font-size: 20px;
        color: rgba(120,255,100,0.95);
        text-shadow: 0 0 12px rgba(60,220,80,0.5), 0 0 24px rgba(60,220,80,0.2), 0 2px 4px rgba(0,0,0,0.8);
        letter-spacing: 2px;
        animation: hintPulse 2s ease-in-out infinite;
        padding: 10px 30px;
        background: rgba(10,8,6,0.85);
        border: 2px solid rgba(40,120,50,0.5);
        border-radius: 4px;
        box-shadow: inset 0 2px 6px rgba(0,0,0,0.5), 0 0 14px rgba(40,180,60,0.2);
      ">${s.interactHint}</div>
    </div>
  ` : '';

  // portrait/target, XP strip: ui-frames.js (unit frames, dock); the old art bar and rep strip retire under the new action bar
  return hudStyles + castingBar + spellSlot + lockBtnEl + menuBar + interactHint + minimap + buffDisplay;
}

module.exports = { renderHUD };

