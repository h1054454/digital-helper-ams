// AMS-Rechner (Netto-Variante) als JavaScript, fuer die statische Webseite.
// Spiegelt die Python-Logik in ams-alvg/rechner. Unverbindliche Schaetzung, nicht der Bescheid.
// Rechtsgrundlage: Hoehe Paragraf 21, Familienzuschlag Paragraf 20, Dauer Paragraf 18,
// Notstandshilfe Paragraf 36 AlVG. Jahreswerte Stand 2026.

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

function bezugsdauerWochen(alter, wochen, reha) {
  if (reha) return 78;
  if (alter >= 50 && wochen >= 468) return 52;
  if (alter >= 40 && wochen >= 312) return 39;
  if (wochen >= 156) return 30;
  return 20;
}

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
  const r2 = x => Math.round(x * 100) / 100;
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
