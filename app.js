// Laedt die FAQ-Daten je Sprache, rendert sie mit klickbaren Quellen, filtert per Suche
// und verdrahtet den Rechner (Netto- oder Brutto-Eingabe). Statisch, kein Backend.

const GESETZ_GNR = { AlVG: "10008407", AMSG: "10008905" };

const UI = {
  de: {
    skip: "Zum Inhalt springen",
    langLabel: "Sprache",
    prototyp: "Demo und Prototyp. Keine Rechtsberatung. Im Zweifel beim AMS nachfragen.",
    suche: "Frage eingeben, zum Beispiel: Wie viel Geld bekomme ich?",
    sucheLabel: "Frage suchen",
    treffer: n => n === 1 ? "1 Treffer" : n + " Treffer",
    keinTreffer: "Keine passende Frage gefunden. Bitte beim AMS nachfragen.",
    rechnerTitel: "Wie viel und wie lange? (Schaetzung)",
    rechnerHinweis: "Unverbindliche Schaetzung, nicht der Bescheid. Werte Stand 2026.",
    modus: "Eingabe", modusNetto: "Nettoeinkommen", modusBrutto: "Bruttoeinkommen",
    einkommenNetto: "Monatliches Nettoeinkommen (Euro)",
    einkommenBrutto: "Monatliches Bruttoeinkommen (Euro)",
    bundesland: "Bundesland (fuer die Netto-Berechnung)",
    kinder: "Anzahl Kinder mit Zuschlag",
    partner: "Partner ohne eigenes Einkommen",
    alter: "Alter", wochen: "Versicherungswochen", rechnen: "Berechnen",
    quelle: "Quelle", quelleNeu: "(oeffnet das Gesetz im RIS)",
    footer: "Demo und Prototyp. Kein Ersatz fuer die Beratung durch das AMS. Massgeblich ist die geltende Fassung.",
    resBrutto: "Eingabe Brutto", resNetto: "Berechnetes Netto",
    resAlg: "Arbeitslosengeld", resTag: "pro Tag", resMon: "pro Monat",
    resDauer: "Bezugsdauer", resWochen: "Wochen", resNh: "Notstandshilfe danach", resStand: "Werte Stand"
  },
  en: {
    skip: "Skip to content",
    langLabel: "Language",
    prototyp: "Demo and prototype. Not legal advice. When in doubt, ask the AMS.",
    suche: "Type a question, for example: How much money will I get?",
    sucheLabel: "Search question",
    treffer: n => n === 1 ? "1 result" : n + " results",
    keinTreffer: "No matching question found. Please ask the AMS.",
    rechnerTitel: "How much and how long? (estimate)",
    rechnerHinweis: "Non-binding estimate, not the official decision. Values as of 2026.",
    modus: "Input", modusNetto: "Net income", modusBrutto: "Gross income",
    einkommenNetto: "Monthly net income (euro)",
    einkommenBrutto: "Monthly gross income (euro)",
    bundesland: "Province (for the net calculation)",
    kinder: "Number of children with supplement",
    partner: "Partner without own income",
    alter: "Age", wochen: "Insured weeks", rechnen: "Calculate",
    quelle: "Source", quelleNeu: "(opens the law on RIS)",
    footer: "Demo and prototype. Not a substitute for advice from the AMS. The version in force applies.",
    resBrutto: "Gross input", resNetto: "Calculated net",
    resAlg: "Unemployment benefit", resTag: "per day", resMon: "per month",
    resDauer: "Duration", resWochen: "weeks", resNh: "Emergency assistance after", resStand: "Values as of"
  }
};

let DATEN = null;
let SPRACHE = "de";

function quelleHtml(quelle) {
  const gnr = /AMSG/.test(quelle) ? GESETZ_GNR.AMSG : GESETZ_GNR.AlVG;
  const t = UI[SPRACHE];
  return quelle.replace(/§\s*(\d+[a-zA-Z]?)/g, (treffer, nr) => {
    const url = "https://www.ris.bka.gv.at/NormDokument.wxe?Abfrage=Bundesnormen&Gesetzesnummer=" + gnr + "&Paragraf=" + nr;
    return '<a href="' + url + '" target="_blank" rel="noopener" title="' + t.quelleNeu + '">' + treffer + "</a>";
  });
}

async function ladeSprache(lang) {
  const resp = await fetch("data/faq-" + lang + ".json");
  DATEN = await resp.json();
  SPRACHE = lang;
  document.documentElement.lang = lang;
  rendereChrome();
  rendereFaq(document.getElementById("suche").value);
}

function rendereChrome() {
  const t = UI[SPRACHE];
  document.getElementById("skip-link").textContent = t.skip;
  document.getElementById("lang-label").textContent = t.langLabel;
  document.getElementById("prototyp").textContent = t.prototyp;
  document.getElementById("titel").textContent = DATEN.titel;
  document.getElementById("hinweis").textContent = DATEN.hinweis;
  document.getElementById("suche-label").textContent = t.sucheLabel;
  document.getElementById("suche").placeholder = t.suche;
  document.getElementById("rechner-titel").textContent = t.rechnerTitel;
  document.getElementById("rechner-hinweis").textContent = t.rechnerHinweis;
  document.getElementById("footer").textContent = t.footer;
  document.querySelectorAll("[data-l]").forEach(el => { el.textContent = t[el.dataset.l]; });
  aktualisiereEinkommenLabel();
}

function aktualisiereEinkommenLabel() {
  const t = UI[SPRACHE];
  const brutto = document.getElementById("r-modus").value === "brutto";
  document.getElementById("r-einkommen-label").textContent = brutto ? t.einkommenBrutto : t.einkommenNetto;
  document.getElementById("r-bundesland-row").hidden = !brutto;
}

function rendereFaq(filter) {
  const t = UI[SPRACHE];
  const q = (filter || "").trim().toLowerCase();
  const box = document.getElementById("faq");
  box.innerHTML = "";
  const treffer = DATEN.eintraege.filter(e => {
    if (!q) return true;
    const heuhaufen = (e.antwort + " " + e.formulierungen.join(" ") + " " + e.kategorie).toLowerCase();
    return heuhaufen.includes(q);
  });
  document.getElementById("suche-status").textContent =
    q ? (treffer.length ? t.treffer(treffer.length) : t.keinTreffer) : "";
  let aktuelleKat = null;
  treffer.forEach(e => {
    if (e.kategorie !== aktuelleKat) {
      aktuelleKat = e.kategorie;
      const h = document.createElement("h3");
      h.textContent = e.kategorie;
      box.appendChild(h);
    }
    const d = document.createElement("div");
    d.className = "eintrag";
    d.innerHTML =
      '<div class="frage"></div>' +
      '<div class="formulierungen"></div>' +
      '<p class="antwort"></p>' +
      '<span class="quelle"></span>';
    d.querySelector(".frage").textContent = e.formulierungen[0] || "";
    d.querySelector(".formulierungen").textContent = e.formulierungen.slice(1).join("  /  ");
    d.querySelector(".antwort").textContent = e.antwort;
    d.querySelector(".quelle").innerHTML = t.quelle + ": " + quelleHtml(e.quelle);
    box.appendChild(d);
  });
}

function rechne(ev) {
  ev.preventDefault();
  const t = UI[SPRACHE];
  const modus = document.getElementById("r-modus").value;
  const einkommen = parseFloat(document.getElementById("r-einkommen").value) || 0;
  const kinder = parseInt(document.getElementById("r-kinder").value) || 0;
  const partner = document.getElementById("r-partner").checked;
  const alter = parseInt(document.getElementById("r-alter").value) || 0;
  const wochen = parseInt(document.getElementById("r-wochen").value) || 0;
  if (einkommen <= 0) return;
  const eur = x => x.toFixed(2) + " EUR";
  let z, kopf = "";
  if (modus === "brutto") {
    const bl = document.getElementById("r-bundesland").value;
    z = arbeitslosengeldAusBrutto(einkommen, bl, kinder, partner, alter, wochen, false);
    kopf = t.resBrutto + ": " + eur(z.eingabeBrutto) + " " + t.resMon + "\n" +
           t.resNetto + ": " + eur(z.berechnetesNetto) + " " + t.resMon + "\n";
  } else {
    z = arbeitslosengeld(einkommen, kinder, partner, alter, wochen, false);
  }
  document.getElementById("rechner-out").textContent =
    kopf +
    t.resAlg + ": " + eur(z.algTaeglich) + " " + t.resTag + " / " + eur(z.algMonatlich) + " " + t.resMon + "\n" +
    t.resDauer + ": " + z.dauerWochen + " " + t.resWochen + "\n" +
    t.resNh + ": " + eur(z.nhMonatlich) + " " + t.resMon + "\n" +
    t.resStand + " " + z.stand + ".";
}

document.getElementById("lang").addEventListener("change", e => ladeSprache(e.target.value));
document.getElementById("suche").addEventListener("input", e => rendereFaq(e.target.value));
document.getElementById("r-modus").addEventListener("change", aktualisiereEinkommenLabel);
document.getElementById("rechner-form").addEventListener("submit", rechne);
ladeSprache("de");
