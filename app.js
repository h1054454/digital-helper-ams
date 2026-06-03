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
    rechnerTitel: "Wie viel und wie lange? (Schätzung)",
    rechnerHinweis: "Unverbindliche Schätzung, nicht der Bescheid. Werte Stand 2026.",
    modus: "Eingabe", modusNetto: "Nettoeinkommen", modusBrutto: "Bruttoeinkommen",
    einkommenNetto: "Monatliches Nettoeinkommen (Euro)",
    einkommenBrutto: "Monatliches Bruttoeinkommen (Euro)",
    bundesland: "Bundesland (für die Netto-Berechnung)",
    kinder: "Anzahl Kinder mit Zuschlag",
    partner: "Partner ohne eigenes Einkommen",
    alter: "Alter", wochen: "Versicherungswochen", rechnen: "Berechnen",
    quelle: "Quelle", quelleNeu: "(öffnet das Gesetz im RIS)",
    footer: "Demo und Prototyp. Kein Ersatz für die Beratung durch das AMS. Maßgeblich ist die geltende Fassung.",
    resBrutto: "Eingabe Brutto", resNetto: "Berechnetes Netto",
    resAlg: "Arbeitslosengeld", resTag: "pro Tag", resMon: "pro Monat",
    resDauer: "Bezugsdauer", resWochen: "Wochen", resNh: "Notstandshilfe danach", resStand: "Werte Stand",
    infoTitel: "So funktioniert dieser Helfer",
    transparenz: "Die Antworten sind aus dem Gesetzestext zusammengefasst, jede mit Quelle zum Nachlesen im RIS, und gegen RIS und AMS geprüft. Stand 2026. Dies ist ein Prototyp und ersetzt keine Beratung durch das AMS.",
    datenschutz: "Datenschutz: Diese Seite setzt keine Cookies, bindet keine Tracker oder Analyse-Dienste ein und sammelt keine personenbezogenen Daten. Alles läuft in Ihrem Browser. Erst wenn Sie auf eine Quelle klicken, öffnet sich das RIS.",
    kontakt: "Für verbindliche Auskünfte und Anträge wenden Sie sich an das AMS, persönlich oder über das eAMS-Konto.",
    amsLink: "Zum AMS (ams.at)",
    bfLink: "Barrierefreiheitserklärung",
    vorlesen: "Vorlesen"
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
    resDauer: "Duration", resWochen: "weeks", resNh: "Emergency assistance after", resStand: "Values as of",
    infoTitel: "How this helper works",
    transparenz: "The answers are summarised from the law, each with a source to look up on RIS, and checked against RIS and the AMS. As of 2026. This is a prototype and does not replace advice from the AMS.",
    datenschutz: "Privacy: this site sets no cookies, embeds no trackers or analytics, and collects no personal data. Everything runs in your browser. Only when you click a source does RIS open.",
    kontakt: "For binding information and applications, contact the AMS, in person or via the eAMS account.",
    amsLink: "Go to the AMS (ams.at)",
    bfLink: "Accessibility statement",
    vorlesen: "Read aloud"
  },
  tr: {
    skip: "İçeriğe geç",
    langLabel: "Dil",
    prototyp: "Demo ve prototip. Hukuki danışmanlık değildir. Şüphe halinde AMS'ye danışın.",
    suche: "Bir soru yazın, örneğin: Ne kadar para alırım?",
    sucheLabel: "Soru ara",
    treffer: n => n === 1 ? "1 sonuç" : n + " sonuç",
    keinTreffer: "Uygun soru bulunamadı. Lütfen AMS'ye danışın.",
    rechnerTitel: "Ne kadar ve ne kadar süre? (tahmin)",
    rechnerHinweis: "Bağlayıcı olmayan tahmin, resmi karar değil. Değerler 2026 itibarıyla.",
    modus: "Giriş", modusNetto: "Net gelir", modusBrutto: "Brüt gelir",
    einkommenNetto: "Aylık net gelir (Euro)",
    einkommenBrutto: "Aylık brüt gelir (Euro)",
    bundesland: "Eyalet (net hesaplama için)",
    kinder: "Zamlı çocuk sayısı",
    partner: "Kendi geliri olmayan eş",
    alter: "Yaş", wochen: "Sigortalı haftalar", rechnen: "Hesapla",
    quelle: "Kaynak", quelleNeu: "(yasayı RIS'te açar)",
    footer: "Demo ve prototip. AMS danışmanlığının yerini tutmaz. Yürürlükteki sürüm geçerlidir.",
    resBrutto: "Girilen brüt", resNetto: "Hesaplanan net",
    resAlg: "İşsizlik parası", resTag: "günlük", resMon: "aylık",
    resDauer: "Süre", resWochen: "hafta", resNh: "Sonrasında acil yardım", resStand: "Değerler itibarıyla",
    infoTitel: "Bu yardımcı nasıl çalışır",
    transparenz: "Cevaplar yasa metninden özetlenmiştir, her biri RIS'te incelenebilecek bir kaynakla, ve RIS ile AMS'ye karşı kontrol edilmiştir. 2026 itibarıyla. Bu bir prototiptir ve AMS danışmanlığının yerini tutmaz.",
    datenschutz: "Veri koruma: Bu site çerez kullanmaz, izleyici veya analiz hizmeti içermez ve kişisel veri toplamaz. Her şey tarayıcınızda çalışır. Yalnızca bir kaynağa tıkladığınızda RIS açılır.",
    kontakt: "Bağlayıcı bilgi ve başvurular için AMS'ye şahsen veya eAMS hesabı üzerinden başvurun.",
    amsLink: "AMS'ye git (ams.at)",
    bfLink: "Erişilebilirlik beyanı",
    vorlesen: "Sesli oku"
  }
};

// Sprachen mit Rechts-nach-links-Schrift (für kuenftiges Arabisch usw.)
const RTL_SPRACHEN = new Set(["ar", "he", "fa", "ur"]);

// Sprachen mit vorab erzeugtem Vorlese-Audio (lokale MP3, kein Datenabfluss)
const AUDIO_SPRACHEN = new Set(["de"]);
let audioPlayer = null;

function spieleAudio(id) {
  if (audioPlayer) { audioPlayer.pause(); }
  audioPlayer = new Audio("audio/" + SPRACHE + "/" + id + ".mp3");
  audioPlayer.play();
}

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
  document.documentElement.dir = RTL_SPRACHEN.has(lang) ? "rtl" : "ltr";
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
  document.getElementById("info-titel").textContent = t.infoTitel;
  document.getElementById("transparenz").textContent = t.transparenz;
  document.getElementById("datenschutz").textContent = t.datenschutz;
  document.getElementById("kontakt").textContent = t.kontakt;
  document.getElementById("ams-link").textContent = t.amsLink;
  document.getElementById("bf-link").textContent = t.bfLink;
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
    if (AUDIO_SPRACHEN.has(SPRACHE)) {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "vorlesen";
      btn.textContent = "🔊 " + t.vorlesen;
      btn.setAttribute("aria-label", t.vorlesen);
      btn.addEventListener("click", () => spieleAudio(e.id));
      d.appendChild(btn);
    }
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
