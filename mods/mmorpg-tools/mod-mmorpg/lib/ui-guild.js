// Guild Panel UI — MMORPG Tools Mod — standalone overlay showing guild info, members, actions
// Toggled via toggleGuild action (G key or menu button)

export function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function renderGuildPanel(localPlayer, world) {
  if (!localPlayer.state.showGuildPanel) return '';

  var s = localPlayer.state;
  var guildName = s.guildName;
  var guildRole = s.guildRole;

  // ======= NO GUILD STATE =======
  if (!guildName) {
    return '<div style="'
      + 'position:fixed;top:0;left:0;width:100vw;height:100vh;'
      + 'display:flex;align-items:center;justify-content:center;'
      + 'background:rgba(0,0,0,0.5);'
      + 'z-index:9100;pointer-events:auto;'
      + '" data-interactive onclick="sendAction(\'closeGuildPanel\')">'

      + '<div data-interactive onclick="event.stopPropagation()" style="'
        + 'width:420px;padding:40px 36px;'
        + 'background:linear-gradient(160deg, rgba(8,6,12,0.97) 0%, rgba(14,10,22,0.98) 40%, rgba(6,4,10,0.99) 100%);'
        + 'border:2px solid rgba(80,55,100,0.4);'
        + 'border-radius:6px;'
        + 'box-shadow:0 0 50px rgba(0,0,0,0.85),inset 0 0 60px rgba(0,0,0,0.5),0 0 20px rgba(80,40,120,0.2);'
        + 'position:relative;'
        + '">'

        // Corner accents
        + '<div style="position:absolute;top:8px;left:8px;width:18px;height:18px;border-top:1px solid rgba(160,100,220,0.3);border-left:1px solid rgba(160,100,220,0.3);"></div>'
        + '<div style="position:absolute;top:8px;right:8px;width:18px;height:18px;border-top:1px solid rgba(160,100,220,0.3);border-right:1px solid rgba(160,100,220,0.3);"></div>'
        + '<div style="position:absolute;bottom:8px;left:8px;width:18px;height:18px;border-bottom:1px solid rgba(160,100,220,0.3);border-left:1px solid rgba(160,100,220,0.3);"></div>'
        + '<div style="position:absolute;bottom:8px;right:8px;width:18px;height:18px;border-bottom:1px solid rgba(160,100,220,0.3);border-right:1px solid rgba(160,100,220,0.3);"></div>'

        // Top ornamental line
        + '<div style="position:absolute;top:14px;left:50%;transform:translateX(-50%);width:50%;height:1px;'
          + 'background:linear-gradient(to right,transparent,rgba(160,100,220,0.35),transparent);"></div>'

        // Header
        + '<div style="font-family:Cinzel,serif;font-size:22px;font-weight:700;color:rgba(220,180,60,0.95);'
          + 'text-shadow:0 0 10px rgba(220,180,60,0.3),0 1px 4px rgba(0,0,0,0.8);letter-spacing:2px;text-align:center;'
          + 'margin-bottom:20px;">GUILD</div>'

        // Divider
        + '<div style="width:100%;height:1px;background:linear-gradient(to right,transparent,rgba(160,100,220,0.3),transparent);margin-bottom:20px;"></div>'

        // No guild message
        + '<div style="font-family:Times New Roman,serif;font-size:20px;font-style:italic;color:rgba(255,255,255,0.8);'
          + 'text-shadow:0 1px 4px rgba(0,0,0,0.8);text-align:center;line-height:1.6;">'
          + 'You are not part of a guild.<br/>Visit the <span style="color:rgba(220,180,60,0.95);">Tavern</span> to create one.</div>'

        // Close button
        + '<div style="text-align:center;margin-top:24px;">'
          + '<div data-interactive onclick="event.stopPropagation();sendAction(\'closeGuildPanel\')" style="'
            + 'display:inline-block;padding:8px 28px;'
            + 'background:rgba(80,40,120,0.5);border:1px solid rgba(160,100,220,0.4);border-radius:4px;'
            + 'cursor:pointer;font-family:Cinzel,serif;font-size:16px;font-weight:700;'
            + 'color:rgba(255,255,255,0.9);letter-spacing:1px;'
            + 'text-shadow:0 1px 3px rgba(0,0,0,0.7);'
            + 'box-shadow:0 2px 10px rgba(80,40,120,0.3);'
            + 'transition:box-shadow 0.15s;'
            + '" onmouseenter="this.style.boxShadow=\'0 2px 16px rgba(120,60,180,0.5)\';"'
            + ' onmouseleave="this.style.boxShadow=\'0 2px 10px rgba(80,40,120,0.3)\';"'
            + '>Close</div>'
        + '</div>'

        // Bottom ornamental line
        + '<div style="position:absolute;bottom:14px;left:50%;transform:translateX(-50%);width:50%;height:1px;'
          + 'background:linear-gradient(to right,transparent,rgba(160,100,220,0.35),transparent);"></div>'

      + '</div>'
    + '</div>';
  }

  // ======= HAS GUILD =======
  var isLeader = guildRole === 'leader';
  var showInviteInput = !!s.showGuildInviteInput;

  // Get online players in this guild (for online status dots)
  var onlinePlayers = world.query({ tags: ['player'] }).filter(function(p) {
    return p.state && p.state.guildName === guildName;
  });
  if (s.guildRoster) for (var ri = 0; ri < s.guildRoster.length; ri++) if (String(s.guildRoster[ri].id).indexOf('off:') !== 0) onlinePlayers.push({ id: s.guildRoster[ri].id, state: {} });
  var onlineIds = {};
  for (var oi = 0; oi < onlinePlayers.length; oi++) {
    onlineIds[onlinePlayers[oi].id] = true;
  }

  // Get full member list from guild-manager state
  var allMembers = (s.guildRoster || []).slice();
  var guildManagers = world.query({ tags: ['guild-manager'] });
  if (allMembers.length === 0 && guildManagers.length > 0) {
    var gmState = guildManagers[0].state || {};
    var gmGuilds = gmState.guilds || {};
    var thisGuild = gmGuilds[guildName];
    if (thisGuild && thisGuild.members) {
      allMembers = thisGuild.members;
    }
  }
  // Fallback: if guild-manager didn't return members, show online members
  if (allMembers.length === 0) {
    for (var fi = 0; fi < onlinePlayers.length; fi++) {
      var fp = onlinePlayers[fi];
      allMembers.push({
        name: fp.state.characterName || fp.state.charName || 'Unknown',
        id: fp.id,
        role: fp.state.guildRole || 'member'
      });
    }
  }

  // Sort: leader first, then online before offline, then alphabetical
  allMembers.sort(function(a, b) {
    if (a.role === 'leader' && b.role !== 'leader') return -1;
    if (b.role === 'leader' && a.role !== 'leader') return 1;
    var aOnline = onlineIds[a.id] ? 1 : 0;
    var bOnline = onlineIds[b.id] ? 1 : 0;
    if (aOnline !== bOnline) return bOnline - aOnline;
    return (a.name || '').localeCompare(b.name || '');
  });

  var memberListHtml = '';
  for (var i = 0; i < allMembers.length; i++) {
    var m = allMembers[i];
    var mName = m.name || 'Unknown';
    var mRole = m.role || 'member';
    var isOnline = !!onlineIds[m.id];
    var roleLabel = mRole === 'leader' ? '<span style="color:rgba(220,180,60,0.95);font-size:12px;margin-left:6px;">[Leader]</span>' : '';
    var isMe = m.id === localPlayer.id;
    var meLabel = isMe ? '<span style="color:rgba(160,100,220,0.7);font-size:12px;margin-left:4px;">(you)</span>' : '';

    var dotColor = isOnline ? 'rgba(80,220,80,0.8)' : 'rgba(100,100,110,0.5)';
    var dotGlow = isOnline ? 'box-shadow:0 0 6px rgba(80,220,80,0.4);' : '';
    var nameOpacity = isOnline ? '0.9' : '0.45';

    memberListHtml += '<div style="padding:6px 10px;display:flex;align-items:center;gap:8px;'
      + 'border-bottom:1px solid rgba(80,55,100,0.15);">'
      + '<div style="width:8px;height:8px;border-radius:50%;background:' + dotColor + ';' + dotGlow + 'flex-shrink:0;"></div>'
      + '<span style="font-family:Cinzel,serif;font-size:15px;color:rgba(255,255,255,' + nameOpacity + ');'
        + 'text-shadow:0 1px 2px rgba(0,0,0,0.6);">' + escapeHtml(mName) + roleLabel + meLabel + '</span>'
    + '</div>';
  }

  // Build action buttons section
  var actionsHtml = '';

  // Add Member button (leader only) + inline invite input
  if (isLeader) {
  actionsHtml += '<div style="margin-top:12px;">';
  if (!showInviteInput) {
    // Show the Add Member button
    actionsHtml += '<div style="text-align:center;">'
      + '<div data-interactive onclick="event.stopPropagation();sendAction(\'toggleGuildInviteInput\')" style="'
        + 'display:inline-flex;align-items:center;gap:8px;padding:9px 22px;'
        + 'background:linear-gradient(135deg, rgba(100,45,180,0.6), rgba(130,60,210,0.5));'
        + 'border:1px solid rgba(160,100,220,0.5);border-radius:4px;'
        + 'cursor:pointer;font-family:Cinzel,serif;font-size:14px;font-weight:700;'
        + 'color:rgba(220,200,255,0.95);letter-spacing:1px;'
        + 'text-shadow:0 1px 3px rgba(0,0,0,0.7);'
        + 'box-shadow:0 2px 12px rgba(120,60,200,0.3),inset 0 1px 0 rgba(200,160,255,0.1);'
        + 'transition:box-shadow 0.15s,background 0.15s;'
        + '" onmouseenter="this.style.boxShadow=\'0 2px 20px rgba(130,70,220,0.5),inset 0 1px 0 rgba(200,160,255,0.15)\';this.style.background=\'linear-gradient(135deg, rgba(115,50,200,0.7), rgba(145,70,230,0.6))\';"'
        + ' onmouseleave="this.style.boxShadow=\'0 2px 12px rgba(120,60,200,0.3),inset 0 1px 0 rgba(200,160,255,0.1)\';this.style.background=\'linear-gradient(135deg, rgba(100,45,180,0.6), rgba(130,60,210,0.5))\';"'
        + '>'
        + '<span style="font-size:16px;line-height:1;">+</span>'
        + '<span>Add Member</span>'
      + '</div>'
    + '</div>';
  } else {
    // Show the inline invite input
    actionsHtml += '<div style="font-family:Cinzel,serif;font-size:14px;color:rgba(160,100,220,0.9);margin-bottom:6px;letter-spacing:1px;display:flex;align-items:center;justify-content:space-between;">'
      + '<span>INVITE PLAYER</span>'
      + '<span data-interactive onclick="event.stopPropagation();sendAction(\'toggleGuildInviteInput\')" style="cursor:pointer;color:rgba(255,255,255,0.4);font-size:18px;line-height:1;padding:0 2px;" '
        + 'onmouseenter="this.style.color=\'rgba(255,255,255,0.7)\';" onmouseleave="this.style.color=\'rgba(255,255,255,0.4)\';"'
        + '>&times;</span>'
    + '</div>'
    + '<div style="display:flex;gap:6px;">'
      + '<input data-interactive id="fa-guild-invite-input" type="text" maxlength="32" placeholder="Character name..." style="'
        + 'flex:1;background:rgba(10,8,14,0.9);border:1px solid rgba(160,100,220,0.35);border-radius:3px;'
        + 'padding:6px 10px;color:rgba(255,255,255,0.9);font-family:Cinzel,serif;font-size:14px;'
        + 'letter-spacing:0.5px;'
        + '" onkeydown="event.stopPropagation()" onkeyup="event.stopPropagation()" onkeypress="event.stopPropagation()" />'
      + '<div data-interactive onclick="event.stopPropagation();var inp=document.getElementById(\'fa-guild-invite-input\');if(inp&&inp.value.trim()){sendAction(\'guildInvite\',{targetName:inp.value.trim()});inp.value=\'\';}" style="'
        + 'padding:6px 14px;background:rgba(100,45,180,0.6);border:1px solid rgba(160,100,220,0.4);border-radius:3px;'
        + 'cursor:pointer;font-family:Cinzel,serif;font-size:13px;font-weight:700;color:rgba(255,255,255,0.9);'
        + 'white-space:nowrap;letter-spacing:0.5px;'
        + 'transition:background 0.15s;'
        + '" onmouseenter="this.style.background=\'rgba(120,55,200,0.7)\';"'
        + ' onmouseleave="this.style.background=\'rgba(100,45,180,0.6)\';"'
        + '>Send Invite</div>'
    + '</div>';
  }
  actionsHtml += '</div>';
  } // end isLeader (Add Member)

  if (isLeader) {
    // Kick button + input
    actionsHtml += '<div style="margin-top:10px;">'
      + '<div style="font-family:Cinzel,serif;font-size:14px;color:rgba(200,100,100,0.9);margin-bottom:6px;letter-spacing:1px;">KICK MEMBER</div>'
      + '<div style="display:flex;gap:6px;">'
        + '<input data-interactive id="fa-guild-kick-input" type="text" maxlength="32" placeholder="Member name..." style="'
          + 'flex:1;background:rgba(10,8,14,0.9);border:1px solid rgba(160,80,80,0.35);border-radius:3px;'
          + 'padding:6px 10px;color:rgba(255,255,255,0.9);font-family:Cinzel,serif;font-size:14px;'
          + 'letter-spacing:0.5px;'
          + '" onkeydown="event.stopPropagation()" onkeyup="event.stopPropagation()" onkeypress="event.stopPropagation()" />'
        + '<div data-interactive onclick="event.stopPropagation();var inp=document.getElementById(\'fa-guild-kick-input\');if(inp&&inp.value.trim()){sendAction(\'guildKick\',{targetName:inp.value.trim()});inp.value=\'\';}" style="'
          + 'padding:6px 14px;background:rgba(120,40,40,0.6);border:1px solid rgba(200,80,80,0.4);border-radius:3px;'
          + 'cursor:pointer;font-family:Cinzel,serif;font-size:13px;font-weight:700;color:rgba(255,255,255,0.9);'
          + 'white-space:nowrap;letter-spacing:0.5px;'
          + 'transition:background 0.15s;'
          + '" onmouseenter="this.style.background=\'rgba(150,50,50,0.7)\';"'
          + ' onmouseleave="this.style.background=\'rgba(120,40,40,0.6)\';"'
          + '>Kick</div>'
      + '</div>'
    + '</div>';
  }

  // Leave / Disband + Close buttons
  var leaveLabel = isLeader ? 'Disband Guild' : 'Leave Guild';
  var leaveColor = isLeader ? 'rgba(200,60,60,0.9)' : 'rgba(200,120,120,0.9)';
  actionsHtml += '<div style="margin-top:16px;text-align:center;">'
    + '<div data-interactive onclick="event.stopPropagation();if(confirm(\'' + (isLeader ? 'Disband the guild? All members will be removed.' : 'Leave ' + escapeHtml(guildName) + '?') + '\')){sendAction(\'guildLeave\')}" style="'
      + 'display:inline-block;padding:8px 24px;'
      + 'background:rgba(100,30,30,0.5);border:1px solid rgba(200,80,80,0.35);border-radius:4px;'
      + 'cursor:pointer;font-family:Cinzel,serif;font-size:14px;font-weight:700;'
      + 'color:' + leaveColor + ';letter-spacing:1px;'
      + 'text-shadow:0 1px 3px rgba(0,0,0,0.7);'
      + 'transition:background 0.15s;'
      + '" onmouseenter="this.style.background=\'rgba(130,40,40,0.6)\';"'
      + ' onmouseleave="this.style.background=\'rgba(100,30,30,0.5)\';"'
      + '>' + leaveLabel + '</div>'
  + '</div>';

  // ======= FULL PANEL =======
  return '<div style="'
    + 'position:fixed;top:0;left:0;width:100vw;height:100vh;'
    + 'display:flex;align-items:center;justify-content:center;'
    + 'background:rgba(0,0,0,0.5);'
    + 'z-index:9100;pointer-events:auto;'
    + '" data-interactive onclick="sendAction(\'closeGuildPanel\')">'

    + '<div data-interactive onclick="event.stopPropagation()" style="'
      + 'width:460px;max-height:80vh;'
      + 'background:linear-gradient(160deg, rgba(8,6,12,0.97) 0%, rgba(14,10,22,0.98) 40%, rgba(6,4,10,0.99) 100%);'
      + 'border:2px solid rgba(80,55,100,0.4);'
      + 'border-radius:6px;'
      + 'box-shadow:0 0 50px rgba(0,0,0,0.85),inset 0 0 60px rgba(0,0,0,0.5),0 0 20px rgba(80,40,120,0.2);'
      + 'position:relative;overflow:hidden;'
      + 'display:flex;flex-direction:column;'
      + '">'

      // Corner accents
      + '<div style="position:absolute;top:8px;left:8px;width:18px;height:18px;border-top:1px solid rgba(160,100,220,0.3);border-left:1px solid rgba(160,100,220,0.3);z-index:2;"></div>'
      + '<div style="position:absolute;top:8px;right:8px;width:18px;height:18px;border-top:1px solid rgba(160,100,220,0.3);border-right:1px solid rgba(160,100,220,0.3);z-index:2;"></div>'
      + '<div style="position:absolute;bottom:8px;left:8px;width:18px;height:18px;border-bottom:1px solid rgba(160,100,220,0.3);border-left:1px solid rgba(160,100,220,0.3);z-index:2;"></div>'
      + '<div style="position:absolute;bottom:8px;right:8px;width:18px;height:18px;border-bottom:1px solid rgba(160,100,220,0.3);border-right:1px solid rgba(160,100,220,0.3);z-index:2;"></div>'

      // Header area
      + '<div style="padding:24px 28px 12px;flex:0 0 auto;">'

        // Top ornamental line
        + '<div style="position:absolute;top:14px;left:50%;transform:translateX(-50%);width:50%;height:1px;'
          + 'background:linear-gradient(to right,transparent,rgba(160,100,220,0.35),transparent);"></div>'

        // Guild name
        + '<div style="font-family:Cinzel,serif;font-size:22px;font-weight:700;color:rgba(220,180,60,0.95);'
          + 'text-shadow:0 0 10px rgba(220,180,60,0.3),0 1px 4px rgba(0,0,0,0.8);letter-spacing:2px;text-align:center;">'
          + escapeHtml(guildName) + '</div>'

        // Role badge
        + '<div style="text-align:center;margin-top:6px;">'
          + '<span style="font-family:Times New Roman,serif;font-size:15px;font-style:italic;'
            + 'color:' + (isLeader ? 'rgba(220,180,60,0.85)' : 'rgba(160,100,220,0.85)') + ';'
            + 'text-shadow:0 1px 3px rgba(0,0,0,0.6);">'
            + (isLeader ? '&#9733; Guild Leader' : '&#8226; Member') + '</span>'
        + '</div>'

        // Divider
        + '<div style="width:100%;height:1px;background:linear-gradient(to right,transparent,rgba(160,100,220,0.3),transparent);margin-top:12px;"></div>'
      + '</div>'

      // Members section — scrollable
      + '<div style="flex:1 1 0%;min-height:0;overflow-y:auto;padding:0 28px;">'
        + '<div style="font-family:Cinzel,serif;font-size:14px;color:rgba(160,100,220,0.8);letter-spacing:1px;margin-bottom:8px;">'
          + 'MEMBERS (' + allMembers.length + ')</div>'
        + '<div style="background:rgba(10,8,14,0.6);border:1px solid rgba(80,55,100,0.25);border-radius:4px;max-height:220px;overflow-y:auto;">'
          + memberListHtml
        + '</div>'

        // Actions
        + actionsHtml
      + '</div>'

      // Close button at bottom
      + '<div style="padding:16px 28px;flex:0 0 auto;text-align:center;">'
        + '<div data-interactive onclick="event.stopPropagation();sendAction(\'closeGuildPanel\')" style="'
          + 'display:inline-block;padding:8px 28px;'
          + 'background:rgba(80,40,120,0.5);border:1px solid rgba(160,100,220,0.4);border-radius:4px;'
          + 'cursor:pointer;font-family:Cinzel,serif;font-size:16px;font-weight:700;'
          + 'color:rgba(255,255,255,0.9);letter-spacing:1px;'
          + 'text-shadow:0 1px 3px rgba(0,0,0,0.7);'
          + 'box-shadow:0 2px 10px rgba(80,40,120,0.3);'
          + 'transition:box-shadow 0.15s;'
          + '" onmouseenter="this.style.boxShadow=\'0 2px 16px rgba(120,60,180,0.5)\';"'
          + ' onmouseleave="this.style.boxShadow=\'0 2px 10px rgba(80,40,120,0.3)\';"'
          + '>Close</div>'
      + '</div>'

      // Bottom ornamental line
      + '<div style="position:absolute;bottom:14px;left:50%;transform:translateX(-50%);width:50%;height:1px;'
        + 'background:linear-gradient(to right,transparent,rgba(160,100,220,0.35),transparent);"></div>'

    + '</div>'
  + '</div>';
}

// Guild Invite Popup — shown when player has a pending invite
export function renderGuildInvitePopup(localPlayer) {
  var invite = localPlayer.state.pendingGuildInvite;
  if (!invite) return '';

  return '<div style="'
    + 'position:fixed;top:25%;left:50%;transform:translateX(-50%);'
    + 'width:400px;padding:28px 32px;'
    + 'background:linear-gradient(160deg, rgba(8,6,12,0.97) 0%, rgba(14,10,22,0.98) 40%, rgba(6,4,10,0.99) 100%);'
    + 'border:2px solid rgba(160,100,220,0.5);'
    + 'border-radius:6px;'
    + 'box-shadow:0 0 50px rgba(0,0,0,0.85),0 0 30px rgba(80,40,120,0.3);'
    + 'z-index:9200;pointer-events:auto;'
    + 'position:relative;'
    + '">'

    // Corner accents
    + '<div style="position:absolute;top:8px;left:8px;width:16px;height:16px;border-top:1px solid rgba(160,100,220,0.35);border-left:1px solid rgba(160,100,220,0.35);"></div>'
    + '<div style="position:absolute;top:8px;right:8px;width:16px;height:16px;border-top:1px solid rgba(160,100,220,0.35);border-right:1px solid rgba(160,100,220,0.35);"></div>'
    + '<div style="position:absolute;bottom:8px;left:8px;width:16px;height:16px;border-bottom:1px solid rgba(160,100,220,0.35);border-left:1px solid rgba(160,100,220,0.35);"></div>'
    + '<div style="position:absolute;bottom:8px;right:8px;width:16px;height:16px;border-bottom:1px solid rgba(160,100,220,0.35);border-right:1px solid rgba(160,100,220,0.35);"></div>'

    // Top ornament
    + '<div style="position:absolute;top:12px;left:50%;transform:translateX(-50%);width:40%;height:1px;'
      + 'background:linear-gradient(to right,transparent,rgba(160,100,220,0.4),transparent);"></div>'

    // Header
    + '<div style="font-family:Cinzel,serif;font-size:18px;font-weight:700;color:rgba(220,180,60,0.95);'
      + 'text-shadow:0 0 8px rgba(220,180,60,0.3),0 1px 4px rgba(0,0,0,0.8);letter-spacing:1.5px;text-align:center;'
      + 'margin-bottom:14px;">GUILD INVITATION</div>'

    // Divider
    + '<div style="width:100%;height:1px;background:linear-gradient(to right,transparent,rgba(160,100,220,0.3),transparent);margin-bottom:14px;"></div>'

    // Message
    + '<div style="font-family:Times New Roman,serif;font-size:18px;font-style:italic;color:rgba(255,255,255,0.88);'
      + 'text-shadow:0 1px 4px rgba(0,0,0,0.8);text-align:center;line-height:1.6;">'
      + '<span style="color:rgba(160,100,220,0.95);">' + escapeHtml(invite.inviterName) + '</span>'
      + ' has invited you to join<br/>'
      + '<span style="color:rgba(220,180,60,0.95);font-family:Cinzel,serif;font-style:normal;font-weight:700;font-size:20px;letter-spacing:1px;">'
        + escapeHtml(invite.guildName) + '</span>'
    + '</div>'

    // Buttons
    + '<div style="display:flex;gap:12px;justify-content:center;margin-top:20px;">'
      + '<div data-interactive onclick="event.stopPropagation();sendAction(\'guildAcceptInvite\')" style="'
        + 'padding:8px 26px;background:rgba(60,100,40,0.6);border:1px solid rgba(100,180,80,0.5);border-radius:4px;'
        + 'cursor:pointer;font-family:Cinzel,serif;font-size:15px;font-weight:700;color:rgba(180,255,140,0.95);'
        + 'letter-spacing:1px;text-shadow:0 1px 3px rgba(0,0,0,0.7);'
        + 'box-shadow:0 2px 10px rgba(60,120,40,0.3);transition:box-shadow 0.15s;'
        + '" onmouseenter="this.style.boxShadow=\'0 2px 16px rgba(80,160,60,0.5)\';"'
        + ' onmouseleave="this.style.boxShadow=\'0 2px 10px rgba(60,120,40,0.3)\';"'
        + '>Accept</div>'

      + '<div data-interactive onclick="event.stopPropagation();sendAction(\'guildDeclineInvite\')" style="'
        + 'padding:8px 26px;background:rgba(100,30,30,0.5);border:1px solid rgba(200,80,80,0.35);border-radius:4px;'
        + 'cursor:pointer;font-family:Cinzel,serif;font-size:15px;font-weight:700;color:rgba(200,120,120,0.95);'
        + 'letter-spacing:1px;text-shadow:0 1px 3px rgba(0,0,0,0.7);'
        + 'box-shadow:0 2px 10px rgba(100,30,30,0.3);transition:box-shadow 0.15s;'
        + '" onmouseenter="this.style.boxShadow=\'0 2px 16px rgba(140,40,40,0.5)\';"'
        + ' onmouseleave="this.style.boxShadow=\'0 2px 10px rgba(100,30,30,0.3)\';"'
        + '>Decline</div>'
    + '</div>'

    // Bottom ornament
    + '<div style="position:absolute;bottom:12px;left:50%;transform:translateX(-50%);width:40%;height:1px;'
      + 'background:linear-gradient(to right,transparent,rgba(160,100,220,0.4),transparent);"></div>'

  + '</div>';
}

module.exports = { renderGuildPanel, renderGuildInvitePopup };
