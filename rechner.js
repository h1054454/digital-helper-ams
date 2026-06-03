// AMS-Rechner als JavaScript fuer die statische Webseite. Unverbindliche Schaetzung.
// Rechtsgrundlage AMS: Hoehe Paragraf 21, Familienzuschlag Paragraf 20, Dauer Paragraf 18,
// Notstandshilfe Paragraf 36 AlVG. Brutto-zu-Netto nach der Lohnverrechnungs-Engine portiert.
//
// Alle Jahreswerte kommen aus window.WEB_RATES (Datei rechner-rates.js), die per
// gen_web_rates.py aus den Python-Satztabellen erzeugt wird. Eine Quelle der Wahrheit.

const _W = (typeof window !== "undefined" && window.WEB_RATES) ? window.WEB_RATES : null;
const AMS_RATES = _W ? _W.ams : {};
const LV_RATES = _W ? _W.lv : {};
const STAND = _W ? _W.stand : "?";

function r2(x) { return Math.round(x * 100) / 100; }

function bezugsdauerWochen(alter, wochen, reha) {
  if (reha) return 78;
  if (alter >= 50 && wochen >= 468) return 52;
  if (alter >= 40 && wochen >= 312) return 39;
  if (wochen >= 156) return 30;
  return 20;
}

// --- Brutto zu Netto (Lohnverrechnung) ---
function alvSatz(bruttoMonat) {
  for (const [grenze, satz] of LV_RATES.alv_gleitzone) { if (bruttoMonat <= grenze) return satz; }
  return 0.0295;
}
function svDnLaufend(bruttoMonat, bundesland) {
  const bg = Math.min(bruttoMonat, LV_RATES.hbgl_monatlich);
  const wbf = (bundesland === "W") ? LV_RATES.wbf_dn_wien : LV_RATES.wbf_dn_std;
  const satz = LV_RATES.sv_basis_ohne_alv_wbf + wbf + alvSatz(bruttoMonat);
  return r2(bg * satz);
}
function tarifJahr(eink) {
  let t = 0, low = 0;
  for (const [grenze, satz] of LV_RATES.brackets) {
    if (eink > low) { t += (Math.min(eink, grenze) - low) * satz; low = grenze; } else break;
  }
  return t;
}
function lstLaufend(bmgMonat) {
  const faktor = 12.0;
  const e = bmgMonat * faktor - LV_RATES.wkp;
  const lstJahr = tarifJahr(e) - LV_RATES.vab;
  return r2(Math.max(0, lstJahr / faktor));
}
function bruttoZuNetto(bruttoMonat, bundesland) {
  const sv = svDnLaufend(bruttoMonat, bundesland);
  const bmg = r2(bruttoMonat - sv);
  const lst = lstLaufend(bmg);
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
  const nhFaktor = grundTag <= richtTag ? r.notstandshilfe_hoch : r.notstandshilfe_nieder;
  const nhTag = nhFaktor * grundTag + famTag;
  return {
    algTaeglich: r2(algTag),
    algMonatlich: r2(algTag * TAGE_MONAT),
    grundMonatlich: r2(grundTag * TAGE_MONAT),
    ergMonatlich: r2(ergTag * TAGE_MONAT),
    famMonatlich: r2(famTag * TAGE_MONAT),
    nhMonatlich: r2(nhTag * TAGE_MONAT),
    dauerWochen: bezugsdauerWochen(alter, wochen, reha),
    stand: STAND
  };
}

// --- Arbeitslosengeld aus Brutto (mit Netto-Umrechnung + Hoechstbeitragsgrundlage) ---
function arbeitslosengeldAusBrutto(bruttoMonat, bundesland, kinder, partner, alter, wochen, reha) {
  const bruttoFuerAms = Math.min(bruttoMonat, LV_RATES.hbgl_monatlich);
  const netto = bruttoZuNetto(bruttoFuerAms, bundesland);
  const z = arbeitslosengeld(netto, kinder, partner, alter, wochen, reha);
  z.eingabeBrutto = r2(bruttoMonat);
  z.berechnetesNetto = r2(netto);
  return z;
}
