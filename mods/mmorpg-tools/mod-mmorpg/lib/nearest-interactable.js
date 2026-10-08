// Shared utility: checks if the calling object is the closest interactable to a given player.
// All interactable objects must be tagged 'interactable' to participate in the check.

export function distSq(a, b) {
  var dx = a.x - b.x;
  var dy = (a.y || 0) - (b.y || 0);
  var dz = a.z - b.z;
  return dx * dx + dy * dy + dz * dz;
}

export function isNearestInteractable(api, myId, myPos, playerPos, searchRadius) {
  var radius = searchRadius || 50;
  var myDist = distSq(myPos, playerPos);
  var allInteractables = api.query({ tags: ['interactable'], radius: radius, center: playerPos });

  for (var j = 0; j < allInteractables.length; j++) {
    var other = allInteractables[j];
    if (other.id === myId) continue;
    var otherPos = other.feetPosition;
    var otherDist = distSq(otherPos, playerPos);
    var otherState = api.getObjectState(other.id);
    var otherPromptRadius = otherState && otherState.promptRadius;
    if (otherPromptRadius) {
      var actualDist = Math.sqrt(otherDist);
      if (actualDist > otherPromptRadius) continue;
    }
    if (otherDist < myDist) return false;
    if (otherDist === myDist && other.id < myId) return false;
  }
  return true;
}

module.exports = { isNearestInteractable: isNearestInteractable };
