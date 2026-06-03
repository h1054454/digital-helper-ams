// AMS-Rechner als JavaScript fuer die statische Webseite. Unverbindliche Schaetzung.
// Rechtsgrundlage AMS: Hoehe Paragraf 21, Familienzuschlag Paragraf 20, Dauer Paragraf 18,
// Notstandshilfe Paragraf 36 AlVG. Jahreswerte Stand 2026.
//
// Die Brutto-zu-Netto-Umrechnung ist nach der Lohnverrechnungs-Engine portiert
// (accounting-agent/lohnverrechnung, gegen echte Lohnzettel und AK-Rechner geeicht).
// Die Werte unten spiegeln rates.py (Jahr 2026) und gehoeren jaehrlich aktualisiert.

const AMS_RATES = {
  stand: "2026",
  ausgleichszulagenrichtsatz_monatlich: 1308.39,
  familienzuschlag_taeglich: 0.97,
  nettoersatzrate: 0.55,
  deckel_ohne_familie: 0.60,
  deckel_mit_familie: 0.80,
  nh_hoch: 0.95,
  nh_nieder: 0.92
};

// Lohnverrechnung 2026 (aus rates.py, Jahr 2026)
const LV_RATES_2026 = {
  wkp: 132.0,                         // Werbungskostenpauschale, Paragraf 16 EStG
  sv_basis_ohne_alv_wbf: 0.1462,      // KV 3,87 + PV 10,25 + AK 0,5
  wbf_dn_std: 0.005,
  wbf_dn_wien: 0.0075,                // Wien ab 2026
  alv_gleitzone: [[2225, 0.0], [2427, 0.01], [2630, 0.02], [Infinity, 0.0295]],
  hbgl_monatlich: 6930.0,
  vab: 496.0,                         // Verkehrsabsetzbetrag
  brackets: [[13539, 0.0], [21992, 0.20], [36458, 0.30], [70365, 0.40], [104859, 0.48], [1000000, 0.50], [Infinity, 0.55]]
};

function r2(x) { return Math.round(x * 100) / 100; }

function bezugsdauerWochen(alter, wochen, reha) {
  if (reha) return 78;
  if (alter >= 50 && wochen >= 468) return 52;
  if (alter >= 40 && wochen >= 312) return 39;
  if (wochen >= 156) return 30;
  return 20;
}

// --- Brutto zu Netto (Lohnverrechnung) ---
function alvSatz(bruttoMonat, R) {
  for (const [grenze, satz] of R.alv_gleitzone) { if (bruttoMonat <= grenze) return satz; }
  return 0.0295;
}
function svDnLaufend(bruttoMonat, bundesland, R) {
  const bg = Math.min(bruttoMonat, R.hbgl_monatlich);
  const wbf = (bundesland === "W") ? R.wbf_dn_wien : R.wbf_dn_std;
  const satz = R.sv_basis_ohne_alv_wbf + wbf + alvSatz(bruttoMonat, R);
  return r2(bg * satz);
}
function tarifJahr(eink, R) {
  let t = 0, low = 0;
  for (const [grenze, satz] of R.brackets) {
    if (eink > low) { t += (Math.min(eink, grenze) - low) * satz; low = grenze; } else break;
  }
  return t;
}
function lstLaufend(bmgMonat, R) {
  const faktor = 12.0;
  const e = bmgMonat * faktor - R.wkp;
  const lstJahr = tarifJahr(e, R) - R.vab;
  return r2(Math.max(0, lstJahr / faktor));
}
function bruttoZuNetto(bruttoMonat, bundesland) {
  const R = LV_RATES_2026;
  const sv = svDnLaufend(bruttoMonat, bundesland, R);
  const bmg = r2(bruttoMonat - sv);
  const lst = lstLaufend(bmg, R);
  return r2(bruttoMonat - sv - lst);
}

// --- Arbeitslosengeld aus Netto ---
function arbeitslosengeld(nettoMonatlich, kinder, partner, alter, wochen, reha) {
  const r = AMS_RATES;
  const TAGE_MONAT = 30, TAGE_JAHR = 365;
  const netTag = nettoMonatlich * 12 / TAGE_JAHR;
  const grundTag = r.nettoersatzrate * netTag;
  const richtTag = r.ausgleichszulagenrichtsatz_monatlich * 12 / TAGE_JAHR;
  const angehoerige = (kinder || 0) + (partner ? 1 : 0);
  const hatFamilie = angehoerige > 0;
  const deckelTag = (hatFamilie ? r.deckel_mit_familie : r.deckel_ohne_familie) * netTag;
  let gpeTag = Math.min(Math.max(grundTag, richtTag), deckelTag);
  if (gpeTag < grundTag) gpeTag = grundTag;
  const ergTag = gpeTag - grundTag;
  const famTag = r.familienzuschlag_taeglich * angehoerige;
  const algTag = gpeTag + famTag;
  const nhFaktor = grundTag <= richtTag ? r.nh_hoch : r.nh_nieder;
  const nhTag = nhFaktor * grundTag + famTag;
  return {
    algTaeglich: r2(algTag),
    algMonatlich: r2(algTag * TAGE_MONAT),
    grundMonatlich: r2(grundTag * TAGE_MONAT),
    ergMonatlich: r2(ergTag * TAGE_MONAT),
    famMonatlich: r2(famTag * TAGE_MONAT),
    nhMonatlich: r2(nhTag * TAGE_MONAT),
    dauerWochen: bezugsdauerWochen(alter, wochen, reha),
    stand: r.stand
  };
}

// --- Arbeitslosengeld aus Brutto (mit Netto-Umrechnung + Hoechstbeitragsgrundlage) ---
function arbeitslosengeldAusBrutto(bruttoMonat, bundesland, kinder, partner, alter, wochen, reha) {
  const bruttoFuerAms = Math.min(bruttoMonat, LV_RATES_2026.hbgl_monatlich);
  const netto = bruttoZuNetto(bruttoFuerAms, bundesland);
  const z = arbeitslosengeld(netto, kinder, partner, alter, wochen, reha);
  z.eingabeBrutto = r2(bruttoMonat);
  z.berechnetesNetto = r2(netto);
  return z;
}
