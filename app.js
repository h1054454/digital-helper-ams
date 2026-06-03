// Laedt die FAQ-Daten je Sprache, rendert sie, filtert per Suche und verdrahtet den Rechner.
// Statisch, kein Backend. Daten: data/faq-<sprache>.json.

const UI = {
  de: {
    langLabel: "Sprache",
    prototyp: "Demo und Prototyp. Keine Rechtsberatung. Im Zweifel beim AMS nachfragen.",
    suche: "Frage eingeben, zum Beispiel: Wie viel Geld bekomme ich?",
    rechnerTitel: "Wie viel und wie lange? (Schaetzung)",
    rechnerHinweis: "Unverbindliche Schaetzung, nicht der Bescheid. Werte Stand 2026.",
    netto: "Monatliches Nettoeinkommen (Euro)",
    kinder: "Anzahl Kinder mit Zuschlag",
    partner: "Partner ohne eigenes Einkommen",
    alter: "Alter",
    wochen: "Versicherungswochen",
    rechnen: "Berechnen",
    quelle: "Quelle",
    footer: "Demo und Prototyp. Kein Ersatz fuer die Beratung durch das AMS. Massgeblich ist die geltende Fassung.",
    resAlg: "Arbeitslosengeld", resTag: "pro Tag", resMon: "pro Monat",
    resDauer: "Bezugsdauer", resWochen: "Wochen", resNh: "Notstandshilfe danach", resStand: "Werte Stand"
  },
  en: {
    langLabel: "Language",
    prototyp: "Demo and prototype. Not legal advice. When in doubt, ask the AMS.",
    suche: "Type a question, for example: How much money will I get?",
    rechnerTitel: "How much and how long? (estimate)",
    rechnerHinweis: "Non-binding estimate, not the official decision. Values as of 2026.",
    netto: "Monthly net income (euro)",
    kinder: "Number of children with supplement",
    partner: "Partner without own income",
    alter: "Age",
    wochen: "Insured weeks",
    rechnen: "Calculate",
    quelle: "Source",
    footer: "Demo and prototype. Not a substitute for advice from the AMS. The version in force applies.",
    resAlg: "Unemployment benefit", resTag: "per day", resMon: "per month",
    resDauer: "Duration", resWochen: "weeks", resNh: "Emergency assistance after", resStand: "Values as of"
  }
};

let DATEN = null;
let SPRACHE = "de";

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
  document.getElementById("lang-label").textContent = t.langLabel;
  document.getElementById("prototyp").textContent = t.prototyp;
  document.getElementById("titel").textContent = DATEN.titel;
  document.getElementById("hinweis").textContent = DATEN.hinweis;
  document.getElementById("suche").placeholder = t.suche;
  document.getElementById("rechner-titel").textContent = t.rechnerTitel;
  document.getElementById("rechner-hinweis").textContent = t.rechnerHinweis;
  document.getElementById("footer").textContent = t.footer;
  document.querySelectorAll("[data-l]").forEach(el => { el.textContent = t[el.dataset.l]; });
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
    const frage = e.formulierungen[0] || "";
    d.innerHTML =
      '<div class="frage"></div>' +
      '<div class="formulierungen"></div>' +
      '<p class="antwort"></p>' +
      '<span class="quelle"></span>';
    d.querySelector(".frage").textContent = frage;
    d.querySelector(".formulierungen").textContent = e.formulierungen.slice(1).join("  /  ");
    d.querySelector(".antwort").textContent = e.antwort;
    d.querySelector(".quelle").textContent = t.quelle + ": " + e.quelle;
    box.appendChild(d);
  });
}

function rechne(ev) {
  ev.preventDefault();
  const t = UI[SPRACHE];
  const netto = parseFloat(document.getElementById("r-netto").value) || 0;
  const kinder = parseInt(document.getElementById("r-kinder").value) || 0;
  const partner = document.getElementById("r-partner").checked;
  const alter = parseInt(document.getElementById("r-alter").value) || 0;
  const wochen = parseInt(document.getElementById("r-wochen").value) || 0;
  if (netto <= 0) return;
  const z = arbeitslosengeld(netto, kinder, partner, alter, wochen, false);
  const eur = x => x.toFixed(2) + " EUR";
  document.getElementById("rechner-out").textContent =
    t.resAlg + ": " + eur(z.algTaeglich) + " " + t.resTag + " / " + eur(z.algMonatlich) + " " + t.resMon + "\n" +
    t.resDauer + ": " + z.dauerWochen + " " + t.resWochen + "\n" +
    t.resNh + ": " + eur(z.nhMonatlich) + " " + t.resMon + "\n" +
    t.resStand + " " + z.stand + ".";
}

document.getElementById("lang").addEventListener("change", e => ladeSprache(e.target.value));
document.getElementById("suche").addEventListener("input", e => rendereFaq(e.target.value));
document.getElementById("rechner-form").addEventListener("submit", rechne);
ladeSprache("de");
