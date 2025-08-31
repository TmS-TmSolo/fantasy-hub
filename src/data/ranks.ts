export const RANKS: Record<string, number> = {
  // Elite
  'christian mccaffrey': 100, 'ja\'marr chase': 98, 'justin jefferson': 98, 'tyreek hill': 98,
  'ceedeelamb': 97, 'lamar jackson': 96, 'jalen hurts': 96,
  'amon-ra st. brown': 95, 'bijan robinson': 95, 'travis kelce': 93, 'puka nacua': 93,
  'saquon barkley': 93, 'breece hall': 94, 'davante adams': 92, 'mark andrews': 90,

  // QBs on rosters
  'dak prescott': 87, 'kyler murray': 85, 'bo nix': 78, 'joe burrow': 90, 'josh allen': 98,
  'jalen hurts qb': 96, 'patrick mahomes': 99, 'brock purdy': 87, 'jayden daniels': 82, 'baker mayfield': 80,
  'drake maye': 70, 'lamar jackson qb': 96,

  // RBs core
  'bucky irving': 78, 'james conner': 83, 'brian robinson jr': 80, 'bhayshul tuten': 68,
  'bijan robinson rb': 95, 'treveyon henderson': 74, 'd\'andre swift': 83, 'rhamondre stevenson': 84,
  'javonte williams': 79, 'deebo samuel rb?': 0, // ignore typo slot
  'kyren williams': 92, 'aaron jones': 86, 'j.k. dobbins': 75, 'jaylen wright': 72,
  'james cook': 83, 'jaydon blue': 66, 'quinshon judkins': 70, 'dameon pierce': 73, 'joe mixon': 86,
  'kenneth walker iii': 85, 'isiah pacheco': 86, 'zach charbonnet': 77, 'cam skattebo': 68,
  'dylan sampson': 66, 'najee harris': 79,
  'rj harvey': 70, 'chase brown': 76, 'braelon allen': 72, 'woody marks': 68, 'chris rodriguez jr': 64,
  'derrick henry': 90, 'tony pollard': 86, 'tyler allgeier': 74, 'jerome ford': 78,
  'saquon barkley rb': 93, 'breece hall rb': 94, 'jaylen warren': 78, 'tank bigsby': 70, 'will shipley': 69,
  'kaleb johnson': 67, 'ray davis': 74, 'travis etienne jr': 90, 'ashton jeanty': 85, 'jonathan taylor': 91,
  'omarion hampton': 74, 'jordan mason': 72, 'trey benson': 76, 'ollie gordon ii': 74, 'jacory croskey-merritt': 70,
  'jahmyr gibbs': 90, 'de\'von achane': 88, 'nick chubb': 88, 'tyrone tracy jr': 73, 'alvin kamara': 88,
  'chuba hubbard': 77, 'david montgomery': 84, 'rachaad white': 84, 'jaylen reed rb?': 0,

  // WRs core
  'tyreek hill wr': 98, 'george pickens': 82, 'rashee rice': 84, 'matthew golden': 64, 'josh downs': 77,
  'chris godwin jr': 82, 'garrett wilson': 91, 'malik nabers': 86, 'jaylen waddle': 90, 'khalil shakir': 78,
  'hollywood brown': 82, 'ladd mcconkey': 85, 'terry mclaurin': 85, 'jaiden addison?': 0,
  'jordan addison': 84, 'kyle williams': 62, 'adam thielen': 78,
  'amon-ra st brown': 95, 'nico collins': 88, 'stefon diggs': 89, 'keon coleman': 82, 'rashid shaheed': 78,
  'darnell mooney': 72,
  'puka nacua wr': 93, 'drake london': 88, 'michael pittman jr': 86, 'marvin mims jr': 72,
  'emeka egbuka': 80, 'brian thomas jr': 84, 'tetairoa mcmillan': 82,
  'aj brown': 96, 'dk metcalf': 90, 'dj moore': 87, 'travis hunter': 70, 'austin ekeler wr?': 0, 'jauan jennings': 70,
  'tee higgins': 86, 'jameson williams': 80, 'rome odunze': 85, 'cooper kupp': 90, 'xavier legette': 78,
  'jayden higgins': 70, 'cedric tillman': 74, 'marvin harrison jr': 90, 'zay flowers': 84,
  'jaxon smith-njigba': 82, 'jerry jeudy': 79, 'jalen mcmillan': 76,
  'mike evans': 89, 'ricky pearsall': 79, 'davante adams wr': 92, 'brandon aiyuk': 92, 'donte thornton jr': 66,
  'xavier worthy': 84, 'calvin ridley': 86, 'chris olave': 90, 'jakobi meyers': 82, 'keenan allen': 90,
  'christian kirk': 82, 'devonta smith': 90, 'jayden reed': 83, 'tre harris': 76, 'courtland sutton': 83,

  // TEs
  'evan engram': 85, 'tj hockenson': 90, 'trey mcbride': 92, 'brock bowers': 82, 'dalton kincaid': 86,
  'travis kelce te': 93, 'mark andrews te': 90, 'sam laporta': 94, 'kyle pitts sr': 80, 'colston loveland': 70,
  'david njoku': 84, 'tyler warren': 70, 'jake ferguson': 80,

  // Kickers (minimal impact for chat; kept for completeness)
  'wil lutz': 70, 'jake elliott': 73, 'jake bates': 66, 'tyler bass': 74, 'matt gay': 70, 'cameron dicker': 72,
  'ka\'imi fairbairn': 74, 'harrison butker': 78, 'tyler loop': 60, 'cam little': 64, 'chase mclaughlin': 68,
  'brandon aubrey': 80,

  // D/ST placeholders
  'cardinals dst': 60, 'texans dst': 75, 'bills dst': 80, 'commanders dst': 62, 'broncos dst': 68,
  'eagles dst': 78, 'giants dst': 62, 'steelers dst': 82, 'seahawks dst': 70, 'patriots dst': 72,
};

export function baseScore(map: Record<string, number>, name: string) {
  const k1 = norm(name);
  if (map[k1] != null) return map[k1];
  // loose match: drop jr/suffix and spaces
  const k2 = k1.replace(/\b(jr|sr)\b/g, '').replace(/\s+/g, ' ').trim();
  for (const k of Object.keys(map)) {
    if (k === k2) return map[k];
    if (k.replace(/\s+/g, '') === k2.replace(/\s+/g, '')) return map[k];
  }
  return 70;
}
function norm(s: string){ return s.toLowerCase().replace(/[^a-z0-9\s'-]/g,'').trim(); }
