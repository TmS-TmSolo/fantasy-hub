// Minimal resolver. Add more rows as you go.
export const ALIASES: Record<string, string> = {
  // last -> full
  henry: 'Derrick Henry',
  gibbs: 'Jahmyr Gibbs',
  cook: 'James Cook',
  hall: 'Breece Hall',
  jefferson: 'Justin Jefferson',
  adams: 'Davante Adams',
  brown: 'A.J. Brown',
  chase: "Ja'Marr Chase",
  waddle: 'Jaylen Waddle',
  ridley: 'Calvin Ridley',
  kittle: 'George Kittle',
  andrews: 'Mark Andrews',
  kelce: 'Travis Kelce',
  nacua: 'Puka Nacua',
  metcalf: 'DK Metcalf',
  // keep extending…
};

// Optional: if multiple players share a last name, prefer the higher-ranked one later.
export const LAST_TO_FULL: Record<string, string[]> = {
  moore: ['DJ Moore','Elijah Moore','Skyy Moore'],
  smith: ['DeVonta Smith','Deebo Samuel'], // example of ambiguous tokens you want to control
};
