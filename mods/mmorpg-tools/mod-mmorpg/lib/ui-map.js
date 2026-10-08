// Map — MMORPG Tools Mod
// Empty map placeholder with gothic frame

export function renderMap(localPlayer, world) {
  return ''
    + '<div style="'
    + 'display:flex;flex-direction:column;align-items:center;justify-content:center;'
    + 'min-height:200px;padding:40px 20px;'
    + 'font-family:Cinzel,Palatino,Georgia,serif;'
    + '">'
    + '<div style="font-size:20px;color:rgba(180,155,100,0.6);letter-spacing:2px;text-align:center;margin-bottom:12px;">WORLD MAP</div>'
    + '<div style="height:1px;width:60%;background:linear-gradient(90deg,transparent,rgba(80,65,40,0.4),transparent);margin-bottom:20px;"></div>'
    + '<div style="font-size:18px;color:rgba(150,130,100,0.5);text-align:center;font-style:italic;line-height:1.6;">'
    + 'No map data available.<br/>The cartographer has yet to chart these lands.'
    + '</div>'
    + '</div>';
}

module.exports = { renderMap: renderMap };
