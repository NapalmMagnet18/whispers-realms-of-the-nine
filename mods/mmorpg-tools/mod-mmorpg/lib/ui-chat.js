// Chat UI component — MMORPG Tools Mod
// Returns HTML string for the chat panel (bottom-left)

// Place ID → display name lookup (mirrors portal-check.js / player.js)
var PLACE_NAMES = {
  'main': 'The World',
  'dojo': 'The Dojo',
  'sanctum': 'The Sanctum',
  'crucible': 'The Crucible',
  'gothic-temple': 'The Gothic Temple',
  'demonic-hall': 'The Demonic Hall',
  'main-menu-land': '',
  'main-menu': '',
  'character-creation-land': '',
};

export function getPlaceName(localPlayer, world) {
  // 1. Try currentPlaceName from state (set by portal-check.js)
  if (localPlayer.state.currentPlaceName) return localPlayer.state.currentPlaceName;
  // 2. Try resolving place ID via world.getEntityPlace if available
  var placeId = null;
  if (world.getEntityPlace) {
    placeId = world.getEntityPlace(localPlayer.id);
  }
  if (!placeId) placeId = localPlayer.state._musicPlace || 'main';
  // Never show meta place names
  if (placeId.indexOf('menu') !== -1 || placeId.indexOf('creation') !== -1) return 'The World';
  if (PLACE_NAMES[placeId]) return PLACE_NAMES[placeId];
  // 3. Capitalize unknown place IDs
  return placeId.charAt(0).toUpperCase() + placeId.slice(1);
}

export function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

export function renderChat(localPlayer, world, rightHudLayout) {
  var chatScale = (rightHudLayout && rightHudLayout.rightHudScale) || 1;
  var chatScaleStyle = chatScale < 1 ? 'transform:scale(' + chatScale + ');transform-origin:bottom left;' : '';
  const messages = localPlayer.state.chatMessages || [];
  const guildMessages = localPlayer.state.guildMessages || [];
  const friendsMessages = localPlayer.state.friendsMessages || [];
  const chatLocked = !!localPlayer.state.chatLocked;
  const showChat = !!localPlayer.state.showChat;
  const chatTab = localPlayer.state.chatTab || 'zone'; // 'zone' or 'guild'
  const hasGuild = !!localPlayer.state.guildName;
  const placeName = getPlaceName(localPlayer, world);

  // Inline SVG padlock icons
  const lockedSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(220,190,120,0.9)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>';
  const unlockedSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="rgba(220,190,120,0.9)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 9.9-1"/></svg>';

  // Determine which messages to show based on active tab
  var activeMessages = chatTab === 'guild' ? guildMessages : chatTab === 'friends' ? friendsMessages : messages;

  // Build message list HTML
  let msgsHtml = '';
  for (let i = 0; i < activeMessages.length; i++) {
    const m = activeMessages[i];
    var msgColor;
    var usernameColor;
    if (chatTab === 'guild') {
      msgColor = 'rgba(180,130,240,0.95)';
      usernameColor = 'rgba(160,100,220,0.9)';
    } else if (chatTab === 'friends') {
      msgColor = 'rgba(80,200,200,0.95)';
      usernameColor = 'rgba(60,180,180,0.9)';
    } else {
      msgColor = m.color === 'white' ? 'rgba(255,255,255,0.95)' : m.color === 'gold' ? 'rgba(230,195,60,0.95)' : 'rgba(120,255,60,0.95)';
      usernameColor = 'rgba(220,190,120,0.9)';
    }
    msgsHtml += '<div style="padding:2px 0;">'
      + '<span style="color:' + usernameColor + ';font-weight:bold;">' + escapeHtml(m.username) + '</span>'
      + ' <span style="color:rgba(120,100,70,0.5);">:</span> '
      + '<span style="color:' + msgColor + ';">' + escapeHtml(m.message) + '</span>'
      + '</div>';
  }

  // Tab buttons
  var zoneTabActive = chatTab !== 'guild';
  var guildTabActive = chatTab === 'guild';
  var tabsHtml = '<div style="display:flex;gap:0;border-bottom:1px solid rgba(80,60,40,0.3);">'
    + '<div data-interactive onclick="sendAction(\'setChatTab\',{tab:\'zone\'})" style="'
      + 'flex:1;padding:4px 0;text-align:center;cursor:pointer;'
      + 'font-size:12px;font-weight:bold;letter-spacing:1px;text-transform:uppercase;'
      + 'color:' + (zoneTabActive ? 'rgba(210,180,100,0.95)' : 'rgba(120,100,70,0.5)') + ';'
      + 'border-bottom:2px solid ' + (zoneTabActive ? 'rgba(210,180,100,0.7)' : 'transparent') + ';'
      + 'text-shadow:' + (zoneTabActive ? '0 0 6px rgba(200,170,80,0.2)' : 'none') + ';'
      + 'transition:color 0.15s,border-color 0.15s;'
      + '">Zone</div>';

  if (hasGuild) {
    tabsHtml += '<div data-interactive onclick="sendAction(\'setChatTab\',{tab:\'guild\'})" style="'
      + 'flex:1;padding:4px 0;text-align:center;cursor:pointer;'
      + 'font-size:12px;font-weight:bold;letter-spacing:1px;text-transform:uppercase;'
      + 'color:' + (guildTabActive ? 'rgba(180,130,240,0.95)' : 'rgba(120,80,160,0.5)') + ';'
      + 'border-bottom:2px solid ' + (guildTabActive ? 'rgba(160,100,220,0.7)' : 'transparent') + ';'
      + 'text-shadow:' + (guildTabActive ? '0 0 6px rgba(160,100,220,0.3)' : 'none') + ';'
      + 'transition:color 0.15s,border-color 0.15s;'
      + '">Guild</div>';
  }
  tabsHtml += '</div>';

  // Input area: changes sendAction based on active tab
  var sendAction_chat = chatTab === 'guild' ? 'guildChatSend' : chatTab === 'friends' ? 'friendsChatSend' : 'sendChat';
  var inputPlaceholder = chatTab === 'guild' ? 'Guild message...' : chatTab === 'friends' ? 'Friends message...' : 'Say something...';
  var inputColor = chatTab === 'guild' ? 'rgba(180,130,240,0.95)' : chatTab === 'friends' ? 'rgba(80,200,200,0.95)' : 'rgba(120,255,60,0.95)';
  var inputBorderColor = chatTab === 'guild' ? 'rgba(120,80,160,0.4)' : chatTab === 'friends' ? 'rgba(50,140,140,0.4)' : 'rgba(80,60,40,0.4)';
  var inputFocusBorder = chatTab === 'guild' ? 'rgba(160,100,220,0.6)' : chatTab === 'friends' ? 'rgba(60,180,180,0.6)' : 'rgba(220,190,120,0.6)';

  const inputArea = showChat ? `
      <div style="
        flex:0 0 auto;
        padding:6px 8px;
        border-top:1px solid rgba(80,60,40,0.3);
        background:rgba(8,6,12,0.95);
        display:flex;
        gap:6px;
        align-items:center;
      ">
        <input
          class="fa-chat-input"
          id="fa-chat-input"
          data-interactive
          tabindex="-1"
          type="text"
          placeholder="${inputPlaceholder}"
          maxlength="200"
          style="
            flex:1;
            background:rgba(12,10,8,0.9);
            border:1px solid ${inputBorderColor};
            border-radius:4px;
            padding:6px 8px;
            color:${inputColor};
            font-family:Cinzel,'Palatino',Georgia,serif;
            font-size:16px;
            letter-spacing:0.3px;
          "
          onkeydown="event.stopPropagation();if(event.key==='Enter'){sendAction('${sendAction_chat}',{text:this.value});this.value='';window._faChatShouldFocus=false;this.blur();event.preventDefault()}if(event.key==='Escape'){window._faChatShouldFocus=false;this.blur();sendAction('closeChat');event.preventDefault()}"
          onkeyup="event.stopPropagation()"
          onkeypress="event.stopPropagation()"
          onfocus="if(!window._faChatShouldFocus){this.blur();return}event.stopPropagation()"
          onblur="window._faChatShouldFocus=false;window._faChatFocused=false;sendAction('closeChat')"
        />
      </div>` : `
      <div style="
        flex:0 0 auto;
        padding:5px 8px;
        border-top:1px solid rgba(80,60,40,0.2);
        background:rgba(8,6,12,0.8);
      ">
        <span style="color:rgba(120,100,70,0.35);font-size:13px;font-style:italic;">Press Enter to chat</span>
      </div>`;

  return `
    <style>
      .fa-chat-scroll::-webkit-scrollbar { width: 4px; }
      .fa-chat-scroll::-webkit-scrollbar-track { background: rgba(10,8,6,0.3); }
      .fa-chat-scroll::-webkit-scrollbar-thumb { background: rgba(80,60,40,0.5); border-radius: 2px; }
      .fa-chat-input::placeholder { color: rgba(140,130,120,0.4); }
      .fa-chat-input:focus { outline: none; border-color: ${chatTab === 'guild' ? 'rgba(160,100,220,0.6)' : chatTab === 'friends' ? 'rgba(60,180,180,0.6)' : 'rgba(220,190,120,0.6)'} !important; }
      @keyframes fa-chat-pop {
        0%, 60% { opacity:1; background:rgba(8,8,10,0.92); border-color:rgba(80,60,40,0.5); box-shadow:0 4px 30px rgba(0,0,0,0.7),0 0 4px rgba(40,30,20,0.15),inset 0 1px 0 rgba(60,50,40,0.05); }
        100% { opacity:0.35; background:rgba(8,8,10,0.92); border-color:rgba(80,60,40,0.3); box-shadow:none; }
      }
      .fa-chat { opacity:0.35; transition:opacity 0.3s; }
      .fa-chat.fa-chat-flash { animation: fa-chat-pop 5s ease forwards; }
      .fa-chat.fa-chat-active { opacity:1 !important; animation:none !important; }
      .fa-chat:hover { opacity:1 !important; background:rgba(8,8,10,0.92) !important; border-color:rgba(80,60,40,0.5) !important; box-shadow:0 4px 30px rgba(0,0,0,0.7),0 0 4px rgba(40,30,20,0.15),inset 0 1px 0 rgba(60,50,40,0.05) !important; }
    </style>
    <div class="fa-chat${showChat ? ' fa-chat-active' : ''}" style="
      position:fixed; bottom:30px; left:12px; width:520px; z-index:94; ${chatScaleStyle}
      background:rgba(8,8,10,0.92);
      border:2px solid rgba(80,60,40,0.5);
      border-radius:6px;
      font-family:Cinzel,'Palatino',Georgia,serif;
      font-size:16px;
      box-shadow:0 4px 30px rgba(0,0,0,0.7),0 0 4px rgba(40,35,30,0.1),inset 0 1px 0 rgba(60,55,50,0.04);
      pointer-events:auto;
      ${chatLocked ? 'resize:none;' : 'resize:both;'}
      overflow:hidden;
      min-width:300px; min-height:120px;
      height:180px;
    display:flex; flex-direction:column;
    ">
      <!-- Header: lock button -->
      <div style="
        flex:0 0 auto;
        padding:4px 10px;
        background:rgba(8,6,12,0.95);
        display:flex;
        align-items:center;
        justify-content:space-between;
        gap:6px;
      ">
        <span style="
          color:rgba(210,180,100,0.9);
          font-size:13px;
          font-weight:bold;
          letter-spacing:1.2px;
          text-transform:uppercase;
          text-shadow:0 0 6px rgba(200,170,80,0.2),0 1px 2px rgba(0,0,0,0.8);
        ">Chat</span>
        <div
          data-interactive
          onclick="sendAction('toggleChatLock')"
          style="
            width:22px; height:22px;
            background:rgba(8,6,12,0.85);
            border:1px solid rgba(120,100,60,0.4);
            border-radius:4px;
            display:flex; align-items:center; justify-content:center;
            cursor:pointer;
          "
          title="${chatLocked ? 'Unlock resize' : 'Lock resize'}"
        >${chatLocked ? lockedSvg : unlockedSvg}</div>
      </div>

      <!-- Messages area (flex-grow, scrollable, sits above input) -->
      <div class="fa-chat-scroll" id="fa-chat-messages" style="
        flex:1 1 0%;
        min-height:0;
        overflow-y:auto;
        padding:8px 10px 4px 10px;
        display:flex;
        flex-direction:column;
        gap:2px;
      ">
        ${msgsHtml || '<div style="color:rgba(120,100,70,0.4);font-style:italic;font-size:12px;">Press Enter to chat...</div>'}
      </div>

      <!-- Input area: shown only when chat is active -->
      ${inputArea}
    </div>
    <img src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==" onload="(function(){var el=document.getElementById('fa-chat-messages');if(el)el.scrollTop=el.scrollHeight;var mc=${messages.length + friendsMessages.length + guildMessages.length};if(window._faChatMsgCount!==mc){window._faChatMsgCount=mc;var box=el?el.closest('.fa-chat'):null;if(box){box.classList.remove('fa-chat-flash');void box.offsetWidth;box.classList.add('fa-chat-flash');}}${showChat ? "if(!window._faChatFocused){window._faChatFocused=true;window._faChatShouldFocus=true;var inp=document.getElementById('fa-chat-input');if(inp){inp.focus();}}" : "window._faChatFocused=false;window._faChatShouldFocus=false;"}})()" style="display:none" />
  `;
}

module.exports = { renderChat };
