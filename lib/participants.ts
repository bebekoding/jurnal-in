export const PARTICIPANTS = [
  "Ivan",
  "Rafa",
  "Fadli",
  "Adhy",
  "Robi",
  "Maul",
  "Rully",
  "Frans",
  "Yogi",
] as const;

export type Participant = (typeof PARTICIPANTS)[number];

export function isParticipant(name: string): name is Participant {
  return (PARTICIPANTS as readonly string[]).includes(name);
}
