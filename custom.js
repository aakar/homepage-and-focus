/* ==========================================================================
   Momentum-inspired focus view for gethomepage (custom.js)
   --------------------------------------------------------------------------
   Pair this with custom.css. Drop both into your Homepage config folder
   (next to settings.yaml); Homepage loads them automatically.

   - Focus view (default): daily photo, big clock, greeting that swaps with a
     daily mantra, daily quote, weather, links menu, container status.
   - Dashboard view: your normal Homepage, restyled by custom.css.
   - Switch views with the bottom-right button or the ` (backtick) key.

   Data it reuses from your existing Homepage config (no extra setup):
   - Weather: every `openweathermap` widget in widgets.yaml, in order.
     One city, several, or none (the weather area just hides).
   - Links menu: your bookmarks.yaml.
   - Status pill: the Docker status dots on your services (hidden if none).

   Everything you might want to change is in the CONFIG block below, plus
   the PHOTOS / QUOTES / MANTRAS lists. Lines marked  <-- EDIT  are personal.
   ========================================================================== */
(function () {
  "use strict";
  if (window.__momentumHomepage) return;
  window.__momentumHomepage = true;

  // ============================ CONFIG ======================================
  var CONFIG = {
    // Greeting: "Good morning, <name>."  Use "" for just "Good morning."
    name: "Aakar",                                   // <-- EDIT

    // Hour (0-23) when the daily photo / quote / mantra rolls over.
    dayStartsAt: 4,

    // Key that switches between focus and dashboard views.
    toggleKey: "`",

    // Weather comes from the openweathermap widgets in widgets.yaml.
    // Optional: shorter names to show under the temperature, keyed by the
    // widget's `label` in widgets.yaml.
    weatherNames: { "New York City": "New York" },   // <-- EDIT (or {})
    weatherRefreshMinutes: 10,

    // The greeting swaps to today's mantra after a random wait in this
    // range (minutes), then keeps alternating. Clicking it swaps right away.
    mantraSwapMinutes: [4, 9],

    // Homepage only refreshes service cards when the window regains focus;
    // this re-triggers that while the dashboard is open.
    dashboardRefreshSeconds: 15
  };
  // ========================== END CONFIG ====================================

  var NAME = CONFIG.name;
  var DAY_ROLLOVER_HOUR = CONFIG.dayStartsAt;
  var TOGGLE_KEY = CONFIG.toggleKey;
  var WEATHER_REFRESH_MS = CONFIG.weatherRefreshMinutes * 60 * 1000;

  // Daily background photos: [Unsplash photo id, photographer].
  // The id is the "photo-XXXX-XXXX" part of an images.unsplash.com URL.
  // One per day, in order, then repeats. Add, remove or replace freely.
  var PHOTOS = [
    ["1446038202205-1c96430dbdab", "Ian Schneider"],
    ["1559310589-2673bfe16970", "Adam Vradenburg"],
    ["1504621388404-df9adacfe877", "Tiago Muraro"],
    ["1732130318657-c8740c0f5215", "Philipp"],
    ["1473116763249-2faaef81ccda", "Camille Minouflet"],
    ["1433190152045-5a94184895da", "Joseph Barrientos"],
    ["1603979649806-5299879db16b", "Ansgar Scheffold"],
    ["1648191887037-133cc13d2d20", "Daniel Buhat"],
    ["1544039161-b0c20826c6f6", "Marek Szturc"],
    ["1647962431451-d0fdaf1cf21c", "John O'Nelio"],
    ["1433567212640-211efabc03e1", "Greg Jurgajtis"],
    ["1571502297375-0fe3ea2d1d48", "Daniel Jacob"],
    ["1615244896230-8fb51d91c3b6", "Moriah Wolfe"],
    ["1509101758186-479a713d3687", "Haseeb Jamil"],
    ["1563738068154-8d2e9f19ed62", "Richard Pasquarella"],
    ["1515506733362-f6161cbcfbe6", "Samuel Thompson"],
    ["1604440095301-4ec2f9230155", "Seb Zurcher"],
    ["1643110862216-d71ebaf15bb4", "Allyson Beaucourt"],
    ["1601307426703-20d19577e455", "David J. Boozer"],
    ["1616036740257-9449ea1f6605", "Sergio Mena Ferreira"],
    ["1707007785777-9324ce8cf42d", "Phill Brown"],
    ["1623423415485-1d36867376b6", "Annegret Kammer"],
    ["1770225039745-feef2f0c37ef", "Peter Hoogmoed"],
    ["1709676320911-7fee44490743", "Eva Darron"],
    ["1417052800325-788e0eaf22c6", "David Di Veroli"],
    ["1699885846876-85bdb95c6e40", "Mariana Brás"],
    ["1595076590135-e070743b31c5", "Azzedine Rouichi"],
    ["1729799886592-42820707fe53", "Eli Abejo"],
    ["1628841380003-90e0e39b3ba1", "Julian Steenbergen"],
    ["1578349198494-f76d9dcac32a", "Amanda Frank"],
    ["1435783099294-283725c37230", "Luca Bravo"],
    ["1583244685026-d8519b5e3d21", "Claudia Chiavazza"],
    ["1632307941173-5d541ea1d940", "Markos Mant"],
    ["1535338611490-9926ac7e0eaf", "Joe Cook"],
    ["1507864317967-4d1b2ed3c3d1", "Afonso Coutinho"],
    ["1600298882525-1ac025c98b68", "Nathan Dumlao"],
    ["1471922694854-ff1b63b20054", "frank mckenna"],
    ["1683041133509-aab050b20b18", "Sergei Gussev"],
    ["1516655855035-d5215bcb5604", "Mark Koch"],
    ["1695182995875-69d98988c95d", "Hari Perisetla"],
    ["1563985336376-568060942b80", ""],
    ["1541789094913-f3809a8f3ba5", ""]
  ];

  // Daily quotes: [quote, author]. One per day, independent of the photo.
  var QUOTES = [
    ["Change your life today. Don't gamble on the future, act now, without delay.", "Simone de Beauvoir"],
    ["Well done is better than well said.", "Benjamin Franklin"],
    ["Waste no more time arguing what a good man should be. Be one.", "Marcus Aurelius"],
    ["While we are postponing, life speeds by.", "Seneca"],
    ["How we spend our days is, of course, how we spend our lives.", "Annie Dillard"],
    ["The best way out is always through.", "Robert Frost"],
    ["Nothing in life is to be feared, it is only to be understood.", "Marie Curie"],
    ["Real artists ship.", "Steve Jobs"],
    ["Make it work, make it right, make it fast.", "Kent Beck"],
    ["Perfection is achieved, not when there is nothing more to add, but when there is nothing left to take away.", "Antoine de Saint-Exupéry"],
    ["Fall seven times, stand up eight.", "Japanese proverb"],
    ["A journey of a thousand miles begins with a single step.", "Lao Tzu"],
    ["Nature does not hurry, yet everything is accomplished.", "Lao Tzu"],
    ["Energy and persistence conquer all things.", "Benjamin Franklin"],
    ["Lost time is never found again.", "Benjamin Franklin"],
    ["The important thing is not to stop questioning.", "Albert Einstein"],
    ["Life is like riding a bicycle. To keep your balance you must keep moving.", "Albert Einstein"],
    ["Hope is a good breakfast, but it is a bad supper.", "Francis Bacon"],
    ["Write it on your heart that every day is the best day in the year.", "Ralph Waldo Emerson"],
    ["Adopt the pace of nature: her secret is patience.", "Ralph Waldo Emerson"],
    ["Our life is frittered away by detail. Simplify, simplify.", "Henry David Thoreau"],
    ["It is not enough to be busy; so are the ants. The question is: what are we busy about?", "Henry David Thoreau"],
    ["Not until we are lost do we begin to understand ourselves.", "Henry David Thoreau"],
    ["Well begun is half done.", "Aristotle"],
    ["The impediment to action advances action. What stands in the way becomes the way.", "Marcus Aurelius"],
    ["Dwell on the beauty of life. Watch the stars, and see yourself running with them.", "Marcus Aurelius"],
    ["If it is not right, do not do it; if it is not true, do not say it.", "Marcus Aurelius"],
    ["We suffer more often in imagination than in reality.", "Seneca"],
    ["Begin at once to live, and count each separate day as a separate life.", "Seneca"],
    ["It is not that we have a short time to live, but that we waste a lot of it.", "Seneca"],
    ["First say to yourself what you would be; and then do what you have to do.", "Epictetus"],
    ["No man is free who is not master of himself.", "Epictetus"],
    ["A ship in harbor is safe, but that is not what ships are built for.", "John A. Shedd"],
    ["Amateurs sit and wait for inspiration, the rest of us just get up and go to work.", "Stephen King"],
    ["I am not afraid of storms, for I am learning how to sail my ship.", "Louisa May Alcott"],
    ["Not everything that is faced can be changed, but nothing can be changed until it is faced.", "James Baldwin"],
    ["You can't use up creativity. The more you use, the more you have.", "Maya Angelou"],
    ["Tell me, what is it you plan to do with your one wild and precious life?", "Mary Oliver"],
    ["Attention is the beginning of devotion.", "Mary Oliver"],
    ["Simple things should be simple, complex things should be possible.", "Alan Kay"],
    ["The best way to predict the future is to invent it.", "Alan Kay"],
    ["Talk is cheap. Show me the code.", "Linus Torvalds"],
    ["Any sufficiently advanced technology is indistinguishable from magic.", "Arthur C. Clarke"],
    ["Plans are worthless, but planning is everything.", "Dwight D. Eisenhower"],
    ["Courage is grace under pressure.", "Ernest Hemingway"],
    ["Small deeds done are better than great deeds planned.", "Peter Marshall"],
    ["The two most powerful warriors are patience and time.", "Leo Tolstoy"],
    ["There is nothing either good or bad, but thinking makes it so.", "William Shakespeare"],
    ["We know what we are, but know not what we may be.", "William Shakespeare"],
    ["Forever is composed of nows.", "Emily Dickinson"],
    ["The world is full of magic things, patiently waiting for our senses to grow sharper.", "Eden Phillpotts"],
    ["In every walk with nature one receives far more than he seeks.", "John Muir"],
    ["The mountains are calling and I must go.", "John Muir"],
    ["Be not afraid of going slowly; be afraid only of standing still.", "Chinese proverb"],
    ["If you want to go fast, go alone. If you want to go far, go together.", "Proverb"],
    ["Hard choices, easy life. Easy choices, hard life.", "Jerzy Gregorek"],
    ["Focusing is about saying no.", "Steve Jobs"],
    ["Strong opinions, weakly held.", "Paul Saffo"],
    ["If everything seems under control, you're not going fast enough.", "Mario Andretti"],
    ["Skate to where the puck is going, not where it has been.", "Wayne Gretzky"],
    ["Make each day your masterpiece.", "John Wooden"],
    ["Don't let what you cannot do interfere with what you can do.", "John Wooden"],
    ["Either write something worth reading or do something worth writing.", "Benjamin Franklin"],
    ["He who has a why to live can bear almost any how.", "Friedrich Nietzsche"],
    ["If I have seen further it is by standing on the shoulders of giants.", "Isaac Newton"],
    ["Imagination is more important than knowledge.", "Albert Einstein"],
    ["Premature optimization is the root of all evil.", "Donald Knuth"],
    ["The unexamined life is not worth living.", "Socrates"],
    ["We are what we repeatedly do.", "Will Durant"],
    ["Do what you can, with what you have, where you are.", "Theodore Roosevelt"]
  ];

  // Daily mantras: shown in place of the greeting (see mantraSwapMinutes).
  var MANTRA_MIN_MIN = CONFIG.mantraSwapMinutes[0], MANTRA_MAX_MIN = CONFIG.mantraSwapMinutes[1];
  var MANTRAS = [
    "Notice your breath.", "One thing at a time.", "Begin anywhere.", "Stay curious.", "Be here now.",
    "Small steps count.", "Make it simple.", "Do the hard thing first.", "Progress, not perfection.",
    "Trust the process.", "Slow is smooth. Smooth is fast.", "Ship it.", "Keep it light.",
    "Choose kindness.", "Listen more.", "Focus on what matters.", "Less, but better.",
    "You've got this.", "Rest is productive.", "Notice the good.", "Ask better questions.",
    "Finish what you start.", "Be patient with yourself.", "Make someone's day.", "Stay humble.",
    "Clarity over cleverness.", "Say no to say yes.", "Protect your time.", "Lead with curiosity.",
    "Build something good.", "Start where you are.", "Make today count.", "Keep exploring.",
    "Ask for help early.", "Repetition builds skill.", "Listen to your gut.",
    "Stay a beginner.", "Kindness is free.", "Lead with warmth.", "Look for what's working.",
    "Leave it better than you found it.", "Done is a decision.", "Move a little today.",
    "Gratitude first.", "Today counts.", "Keep showing up.", "Let it go.", "Think long term.",
    "Stay hungry. Stay foolish.", "Courage over comfort.", "Write it down.", "Enjoy the work.",
    "Take the stairs.", "Call someone you love.", "Make it fun.", "Learn something new.",
    "Be the calm in the room.", "Good enough is good.", "Play the long game.", "Smile more."
  ];

  // ---------- helpers ----------
  function el(tag, attrs, kids) {
    var n = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      if (k === "text") n.textContent = attrs[k];
      else if (k === "html") n.innerHTML = attrs[k]; // only used for static SVG below
      else n.setAttribute(k, attrs[k]);
    });
    (kids || []).forEach(function (c) { if (c) n.appendChild(c); });
    return n;
  }
  function dayNumber(now) {
    var d = new Date(now.getTime());
    if (d.getHours() < DAY_ROLLOVER_HOUR) d.setDate(d.getDate() - 1);
    return Math.floor(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()) / 86400000);
  }
  function greetingFor(h) {
    if (h >= 5 && h < 12) return "Good morning";
    if (h >= 12 && h < 17) return "Good afternoon";
    return "Good evening";
  }
  function isTyping(t) {
    return t && (t.isContentEditable || /^(INPUT|TEXTAREA|SELECT)$/.test(t.tagName));
  }

  var ICON_LINK = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M12 6H6a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6"/><path d="M11 13l9-9"/><path d="M15 4h5v5"/></svg>';
  var ICON_GRID = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="4" y="4" width="6" height="6" rx="1"/><rect x="14" y="4" width="6" height="6" rx="1"/><rect x="4" y="14" width="6" height="6" rx="1"/><rect x="14" y="14" width="6" height="6" rx="1"/></svg>';
  var ICON_SUN = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';

  // ---------- build the layer ----------
  var bg = el("div", { id: "mf-bg", "class": "mf-loading", "aria-hidden": "true" });
  var shade = el("div", { id: "mf-shade", "aria-hidden": "true" });

  var linksBtn = el("button", { "class": "mf-btn", id: "mf-links-btn", type: "button", "aria-expanded": "false", "aria-controls": "mf-links-menu", html: ICON_LINK + "<span>Links</span>" });
  var linksMenu = el("div", { id: "mf-links-menu", role: "menu", hidden: "" });
  var statusCount = el("span", { id: "mf-status-text", text: "Services" });
  var statusWord = el("span", { "class": "mf-status-word" });
  var statusBtn = el("button", { "class": "mf-btn", id: "mf-status", type: "button", title: "Open dashboard", hidden: "" }, [
    el("span", { "class": "mf-dot", "aria-hidden": "true" }),
    el("span", {}, [statusCount, statusWord])
  ]);
  var clock = el("div", { id: "mf-clock", "aria-live": "off" });
  var greeting = el("div", { id: "mf-greeting", title: "Click to switch between greeting and today's mantra" });
  var credit = el("a", { id: "mf-credit", target: "_blank", rel: "noopener" });
  var quoteText = el("div", { id: "mf-quote-text" });
  var quoteAuthor = el("div", { id: "mf-quote-author" });

  var weatherRow = el("div", { "class": "mf-tr" });
  var weatherCard = el("div", { id: "mf-wx-card", role: "dialog", "aria-label": "Weather details", hidden: "" });

  var focus = el("div", { id: "mf-focus" }, [
    el("div", { "class": "mf-tl" }, [linksBtn, statusBtn, linksMenu]),
    weatherRow, weatherCard,
    el("div", { "class": "mf-center" }, [clock, greeting]),
    el("div", { "class": "mf-bottom" }, [credit, el("div", { "class": "mf-quote" }, [quoteText, quoteAuthor]), el("span")])
  ]);
  var toggle = el("button", { id: "mf-toggle", "class": "mf-btn", type: "button" });

  document.body.insertBefore(shade, document.body.firstChild);
  document.body.insertBefore(bg, document.body.firstChild);
  document.body.appendChild(focus);
  document.body.appendChild(toggle);
  document.body.classList.add("mf-on");

  // ---------- daily photo + quote ----------
  var currentDay = null;
  function applyDay() {
    var day = dayNumber(new Date());
    if (day === currentDay) return;
    currentDay = day;

    var p = PHOTOS[((day % PHOTOS.length) + PHOTOS.length) % PHOTOS.length];
    var w = Math.min(3200, Math.round(window.screen.width * (window.devicePixelRatio || 1)));
    var url = "https://images.unsplash.com/photo-" + p[0] + "?auto=format&fit=crop&q=80&w=" + w;
    var img = new Image();
    img.onload = function () {
      bg.style.backgroundImage = 'url("' + url + '")';
      bg.classList.remove("mf-loading");
    };
    img.onerror = function () { bg.classList.remove("mf-loading"); }; // falls back to solid color
    img.src = url;

    credit.textContent = p[1] ? "Photo by " + p[1] + " · Unsplash" : "Photo · Unsplash";
    credit.href = "https://unsplash.com/?utm_source=homepage_focus_view&utm_medium=referral";

    var q = QUOTES[((day % QUOTES.length) + QUOTES.length) % QUOTES.length];
    quoteText.textContent = "“" + q[0] + "”";
    quoteAuthor.textContent = q[1];

    mantraToday = MANTRAS[((day % MANTRAS.length) + MANTRAS.length) % MANTRAS.length];
    renderHeadline();
  }

  // ---------- greeting / mantra ----------
  var mantraToday = "";
  var showingMantra = false;
  var swapTimer = null;
  function renderHeadline() {
    greeting.textContent = showingMantra && mantraToday
      ? mantraToday
      : greetingFor(new Date().getHours()) + (NAME ? ", " + NAME : "") + ".";
  }
  function swapHeadline() {
    greeting.classList.add("mf-fading");
    setTimeout(function () {
      showingMantra = !showingMantra;
      renderHeadline();
      greeting.classList.remove("mf-fading");
    }, 350);
    scheduleSwap();
  }
  function scheduleSwap() {
    clearTimeout(swapTimer);
    var mins = MANTRA_MIN_MIN + Math.random() * (MANTRA_MAX_MIN - MANTRA_MIN_MIN);
    swapTimer = setTimeout(function () {
      // only swap while you're actually looking at the focus view
      if (document.visibilityState === "visible" && document.body.classList.contains("mf-focus")) swapHeadline();
      else scheduleSwap();
    }, mins * 60000);
  }
  greeting.addEventListener("click", swapHeadline);

  // ---------- clock + greeting ----------
  var lastMinute = -1;
  function tick() {
    var now = new Date();
    if (now.getMinutes() !== lastMinute) {
      lastMinute = now.getMinutes();
      var h = now.getHours();
      clock.textContent = (h % 12 || 12) + ":" + String(now.getMinutes()).padStart(2, "0");
      applyDay();
      renderHeadline();
    }
  }

  // ---------- container status (reads Homepage's own status dots) ----------
  function updateStatus() {
    var all = document.querySelectorAll("#services .docker-status");
    statusBtn.hidden = !all.length;
    // no bookmarks in bookmarks.yaml -> no Links button (checked once the page has rendered)
    if (document.querySelector("#services, #bookmarks")) linksBtn.hidden = !document.querySelector("#bookmarks .bookmark-group");
    if (!all.length) return;
    var up = 0;
    all.forEach(function (n) {
      if (/docker-status-(running|healthy)/.test(n.className)) up++;
    });
    statusCount.textContent = up + "/" + all.length;
    statusWord.textContent = " running"; // hidden on phones to keep one row
    statusBtn.querySelector(".mf-dot").classList.toggle("mf-warn", up < all.length);
  }

  // ---------- links menu (built from bookmarks.yaml via the hidden bookmarks section) ----------
  function buildLinks() {
    linksMenu.textContent = "";
    var groups = document.querySelectorAll("#bookmarks .bookmark-group");
    if (!groups.length) {
      linksMenu.appendChild(el("h3", { text: "No bookmarks found" }));
      return;
    }
    groups.forEach(function (g) {
      var name = g.querySelector(".bookmark-group-name");
      linksMenu.appendChild(el("h3", { text: name ? name.textContent.trim() : "" }));
      g.querySelectorAll("li.bookmark a").forEach(function (a) {
        // bookmarks are display:none in focus view, so read leaf text nodes, not innerText
        var host = "";
        try { host = new URL(a.href).hostname.replace(/^www\./, ""); } catch (e) {}
        var texts = Array.prototype.filter.call(a.querySelectorAll("*"), function (n) {
          return !n.children.length && n.textContent.trim();
        }).map(function (n) { return n.textContent.trim(); });
        var names = texts.filter(function (t) { return t.indexOf(".") === -1; });
        var label = names.sort(function (x, y) { return y.length - x.length; })[0] || host;
        linksMenu.appendChild(el("a", { href: a.href, target: "_blank", rel: "noopener", role: "menuitem" }, [
          document.createTextNode(label), el("span", { text: host })
        ]));
      });
    });
  }
  function setMenu(open) {
    if (open) buildLinks();
    linksMenu.hidden = !open;
    linksBtn.setAttribute("aria-expanded", open ? "true" : "false");
  }
  linksBtn.addEventListener("click", function (e) { e.stopPropagation(); setMenu(linksMenu.hidden); });
  document.addEventListener("click", function (e) {
    if (!linksMenu.hidden && !linksMenu.contains(e.target)) setMenu(false);
  });

  // ---------- weather ----------
  var COMPASS = ["N","NNE","NE","ENE","E","ESE","SE","SSE","S","SSW","SW","WSW","W","WNW","NW","NNW"];
  var weatherData = [];   // latest OpenWeather payload per city
  var weatherButtons = [];
  var openCity = -1;

  var CITIES = null; // filled from widgets.yaml via Homepage's /api/widgets

  function discoverCities() {
    if (CITIES) return Promise.resolve(CITIES);
    return fetch("/api/widgets").then(function (r) { return r.ok ? r.json() : []; })
      .catch(function () { return []; })
      .then(function (widgets) {
        CITIES = (widgets || []).filter(function (w) {
          return w && w.type === "openweathermap" && w.options && w.options.latitude != null;
        }).map(function (w) {
          var o = w.options;
          return {
            name: CONFIG.weatherNames[o.label] || o.label || "Weather",
            lat: o.latitude, lon: o.longitude, index: o.index,
            units: o.units || "metric", provider: o.provider, cache: o.cache || 5,
            href: o.href || ""
          };
        });
        weatherRow.hidden = !CITIES.length;
        return CITIES;
      });
  }
  function weatherUrl(c) {
    var q = { lang: "en", latitude: c.lat, longitude: c.lon, index: c.index, units: c.units, cache: c.cache };
    if (c.provider) q.provider = c.provider;
    return "/api/widgets/openweathermap?" + new URLSearchParams(q).toString();
  }
  function windText(d, c) {
    var speed = d.wind.speed; // OpenWeather: mph for imperial, m/s otherwise
    var dir = COMPASS[Math.round((d.wind.deg || 0) / 22.5) % 16] + " ";
    return c.units === "imperial" ? dir + Math.round(speed) + " mph" : dir + Math.round(speed * 3.6) + " km/h";
  }
  // Borrow the matching icon from Homepage's own (hidden) weather widget
  function iconFor(i) {
    var w = document.querySelectorAll(".information-widget-openweathermap svg")[i];
    return w ? w.cloneNode(true) : null;
  }
  function cap(t) { return t ? t.charAt(0).toUpperCase() + t.slice(1) : ""; }

  function renderWeatherRow() {
    weatherRow.textContent = "";
    if (!CITIES) return;
    weatherButtons = CITIES.map(function (c, i) {
      var d = weatherData[i];
      var b = el("button", { "class": "mf-wx", type: "button", "aria-expanded": "false",
        title: c.name + " weather" }, [
        el("span", { "class": "mf-wx-top" }, [iconFor(i),
          el("span", { "class": "mf-wx-temp", text: d ? Math.round(d.main.temp) + "°" : "–" })]),
        el("span", { "class": "mf-wx-city", text: c.name })
      ]);
      b.addEventListener("click", function (e) { e.stopPropagation(); toggleCard(i === openCity ? -1 : i); });
      weatherRow.appendChild(b);
      return b;
    });
    if (openCity >= 0) toggleCard(openCity);
  }

  function toggleCard(i) {
    openCity = i;
    weatherButtons.forEach(function (b, j) { b.setAttribute("aria-expanded", j === i ? "true" : "false"); });
    var d = weatherData[i];
    if (i < 0 || !d) { weatherCard.hidden = true; openCity = -1; return; }
    var c = CITIES[i];
    var stats = [
      ["Feels like", Math.round(d.main.feels_like) + "°"],
      ["Humidity", d.main.humidity + "%"],
      ["Wind", windText(d, c)]
    ];
    var rain = d.rain && (d.rain["1h"] || d.rain["3h"]);
    if (rain) stats.push(["Recent rain", c.units === "imperial" ? (rain / 25.4).toFixed(2) + " in" : rain.toFixed(1) + " mm"]);
    var dl = el("dl", { "class": "mf-wc-stats" });
    stats.forEach(function (s) { dl.appendChild(el("dt", { text: s[0] })); dl.appendChild(el("dd", { text: s[1] })); });

    weatherCard.textContent = "";
    weatherCard.appendChild(el("div", { "class": "mf-wc-head" }, [iconFor(i), el("span", { text: c.name + " Weather" })]));
    weatherCard.appendChild(el("div", { "class": "mf-wc-cond", text: cap(d.weather && d.weather[0] && d.weather[0].description) }));
    weatherCard.appendChild(el("div", { "class": "mf-wc-body" }, [
      el("div", { "class": "mf-wc-big" }, [iconFor(i), el("span", { text: Math.round(d.main.temp) + "°" })]),
      dl
    ]));
    // forecast link: the widget's href from widgets.yaml, else OpenWeather's city page
    var link = c.href || (d.id ? "https://openweathermap.org/city/" + d.id : "https://openweathermap.org/");
    var host = "";
    try { host = new URL(link).hostname.replace(/^www\./, ""); } catch (e) {}
    weatherCard.appendChild(el("div", { "class": "mf-wc-foot" }, [
      el("a", { href: link, target: "_blank", rel: "noopener", text: "Full forecast on " + host + " \u2192" }),
      el("span", { text: "OpenWeather" })
    ]));
    // point the caret at the clicked city
    var br = weatherButtons[i].getBoundingClientRect();
    weatherCard.hidden = false;
    var cr = weatherCard.getBoundingClientRect();
    weatherCard.style.setProperty("--mf-caret", Math.max(16, cr.right - (br.left + br.width / 2) - 7) + "px");
  }

  function loadWeather() {
    discoverCities().then(function (cities) {
      if (!cities.length) return;
      return Promise.all(cities.map(function (c) {
        return fetch(weatherUrl(c)).then(function (r) { return r.ok ? r.json() : null; }).catch(function () { return null; });
      })).then(function (results) {
        results.forEach(function (d, i) { if (d && d.main) weatherData[i] = d; });
        renderWeatherRow();
      });
    });
  }
  document.addEventListener("click", function (e) {
    if (openCity >= 0 && !weatherCard.contains(e.target)) toggleCard(-1);
  });

  // ---------- views ----------
  var LEAVE_MS = 220; // dashboard -> focus: let the cards sink out first
  var leaving = null;
  var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  function applyView(dash) {
    document.body.classList.toggle("mf-dash", dash);
    document.body.classList.toggle("mf-focus", !dash);
    toggle.innerHTML = (dash ? ICON_SUN + "<span>Focus</span>" : ICON_GRID + "<span>Dashboard</span>") + "<kbd>`</kbd>";
    toggle.title = dash ? "Back to focus view" : "Show dashboard";
    if (dash) { setMenu(false); toggleCard(-1); }
  }
  function setView(view) {
    var dash = view === "dash";
    clearTimeout(leaving);
    document.body.classList.remove("mf-leaving");
    if (!dash && document.body.classList.contains("mf-dash") && !reduceMotion) {
      document.body.classList.add("mf-leaving");
      leaving = setTimeout(function () {
        document.body.classList.remove("mf-leaving");
        applyView(false);
      }, LEAVE_MS);
      return;
    }
    applyView(dash);
  }
  function flip() { setView(document.body.classList.contains("mf-dash") ? "focus" : "dash"); }

  // Homepage only re-fetches service-card data (container stats, widget APIs)
  // when the window regains focus. Send that same signal on entering the
  // dashboard and every REFRESH_MS while it's on screen, so the cards stay live.
  var REFRESH_MS = CONFIG.dashboardRefreshSeconds * 1000;
  function refreshCards() {
    if (document.visibilityState === "visible") window.dispatchEvent(new Event("focus"));
  }
  var refreshTicks = 0;
  setInterval(function () {
    refreshTicks++;
    // dashboard: every 15s; focus view: every 60s, just to keep the status pill honest
    if (document.body.classList.contains("mf-dash") || refreshTicks % 4 === 0) refreshCards();
  }, REFRESH_MS);
  new MutationObserver(function () {
    if (document.body.classList.contains("mf-dash")) refreshCards();
  }).observe(document.body, { attributes: true, attributeFilter: ["class"] });

  toggle.addEventListener("click", flip);
  statusBtn.addEventListener("click", function () { setView("dash"); });

  // capture phase so the backtick never reaches Homepage's quick launch
  window.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && (!linksMenu.hidden || openCity >= 0)) { setMenu(false); toggleCard(-1); return; }
    if (e.key !== TOGGLE_KEY || e.metaKey || e.ctrlKey || e.altKey || isTyping(e.target)) return;
    e.preventDefault();
    e.stopImmediatePropagation();
    flip();
  }, true);

  // ---------- go ----------
  setView("focus"); // always opens in focus view, like Momentum
  tick();
  scheduleSwap();
  updateStatus();
  setInterval(tick, 1000);
  setInterval(updateStatus, 15000);
  setTimeout(updateStatus, 3000); // first container stats arrive after load
  loadWeather();
  setTimeout(renderWeatherRow, 2500); // pick up icons once Homepage's widgets have rendered
  setInterval(loadWeather, WEATHER_REFRESH_MS);
})();
