import weaponBat from "@/assets/e67775d4-9413-4a2f-9f8e-c4d69f878851.png";
export const team = [
  { name: "RUNITBACK", role: "OWNER" },
  { name: "NEXI", role: "OWNER" },
  { name: "MYSOUL", role: "COMUNITY LEADER" },
  { name: "ALBERT", role: "DC LEADER" },
  { name: "Null", role: "STAFF MANAGER" },
  { name: "....", role: "" },
  { name: "....", role: "" },
  { name: "....", role: "" },
];

export type Update = { version: string; date: string; title: string; body: string; image?: string };

export const updates: Update[] = [
  {
    version: "sneak peek",
    date: "nov 03",
    title: "First weapon in game",
    body: "A first look at the very first weapon coming to SBR: a spiked, burlap-wrapped bat — with a little bird riding along.",
    image: weaponBat,
  },
];
