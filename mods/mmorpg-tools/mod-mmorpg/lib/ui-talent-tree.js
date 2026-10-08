// Talent Tree — MMORPG Tools Mod
// Empty placeholder with gothic frame

export function renderTalentTree(localPlayer) {
  return ''
    + '<div style="'
    + 'display:flex;flex-direction:column;align-items:center;justify-content:center;'
    + 'min-height:200px;padding:40px 20px;'
    + 'font-family:Cinzel,Palatino,Georgia,serif;'
    + '">'
    + '<div style="font-size:20px;color:rgba(180,155,100,0.6);letter-spacing:2px;text-align:center;margin-bottom:12px;">TALENTS</div>'
    + '<div style="height:1px;width:60%;background:linear-gradient(90deg,transparent,rgba(80,65,40,0.4),transparent);margin-bottom:20px;"></div>'
    + '<div style="font-size:18px;color:rgba(150,130,100,0.5);text-align:center;font-style:italic;line-height:1.6;">'
    + 'No talents available.<br/>The path to mastery has not yet been revealed.'
    + '</div>'
    + '</div>';
}

module.exports = { renderTalentTree: renderTalentTree };
