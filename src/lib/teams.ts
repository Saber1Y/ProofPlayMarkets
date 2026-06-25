const teamToCode: Record<string, string> = {
  Paraguay: "py",
  Australia: "au",
  Norway: "no",
  France: "fr",
  Tunisia: "tn",
  Netherlands: "nl",
  Croatia: "hr",
  Ghana: "gh",
  Ecuador: "ec",
  Germany: "de",
  Egypt: "eg",
  Iran: "ir",
  "Cape Verde": "cv",
  "Saudi Arabia": "sa",
  Curacao: "cw",
  "Ivory Coast": "ci",
  "New Zealand": "nz",
  Belgium: "be",
  Jordan: "jo",
  Argentina: "ar",
  Algeria: "dz",
  Austria: "at",
  Colombia: "co",
  Portugal: "pt",
  "South Africa": "za",
  "South Korea": "kr",
  Switzerland: "ch",
  Panama: "pa",
  England: "gb-eng",
  Uruguay: "uy",
  Spain: "es",
  Turkey: "tr",
  USA: "us",
  Japan: "jp",
  Sweden: "se",
  "Congo DR": "cd",
  Uzbekistan: "uz",
  Senegal: "sn",
  Iraq: "iq",
  "Czech Republic": "cz",
  Mexico: "mx",
  Vietnam: "vn",
  Myanmar: "mm",
  Canada: "ca",
};

export function teamCode(name: string): string {
  const code = teamToCode[name];
  if (code) return code;
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}
