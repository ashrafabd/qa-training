/* ============================================================================
 * QA Curriculum — application logic (bilingual EN/AR + light/dark themes)
 * Renders all views from window.CURRICULUM, handles routing, search, language,
 * theme, and localStorage-backed progress tracking.
 * ==========================================================================*/
(function () {
  "use strict";

  var C = window.CURRICULUM;
  var META = C.META, PHASES = C.PHASES, WEEKS = C.WEEKS, RESOURCES = C.RESOURCES, ASSESSMENTS = C.ASSESSMENTS, UI = C.UI;
  var BRANDS = C.BRANDS, CHANNELS = C.CHANNELS, VIDEOS = C.VIDEOS;

  /* phase → brand-icon slug, and resource category → slug, for visual polish */
  var PHASE_ICON = { 1: "istqb", 2: "javascript", 3: "cypress", 4: "postman" };
  var RES_ICON = ["istqb", "javascript", "cypress", "postman", "githubactions", "k6"];

  var STORE_KEY = "qa-curriculum-progress-v1";
  var LANG_KEY = "qa-curriculum-lang";
  var THEME_KEY = "qa-curriculum-theme";
  var NAV_KEY = "qa-curriculum-nav-collapsed";

  /* ---------- language + theme state ---------- */
  var lang = localStorage.getItem(LANG_KEY) || "en";
  var theme = localStorage.getItem(THEME_KEY) || "light";

  /* tr(): resolve a translatable value. string → as-is; {en,ar} → current lang;
     array → map tr over each element. */
  function tr(v) {
    if (v == null) return "";
    if (typeof v === "string" || typeof v === "number") return v;
    if (Array.isArray(v)) return v.map(tr);
    if (typeof v === "object" && ("en" in v || "ar" in v)) return v[lang] != null ? v[lang] : v.en;
    return v;
  }
  /* fill {name} placeholders */
  function fmt(template, vars) {
    return String(template).replace(/\{(\w+)\}/g, function (_, k) { return vars[k] != null ? vars[k] : ""; });
  }
  /* localize a "4 hrs" style time string */
  function fmtTime(t) {
    if (lang !== "ar") return t;
    return String(t).replace(/\bhrs\b/, "ساعات").replace(/\bhr\b/, "ساعة");
  }

  function applyLang() {
    document.documentElement.setAttribute("lang", lang);
    document.documentElement.setAttribute("dir", lang === "ar" ? "rtl" : "ltr");
  }
  function applyTheme() {
    document.documentElement.setAttribute("data-theme", theme);
  }

  /* ---------- progress (localStorage) ---------- */
  var progress = {
    data: load(),
    keyFor: function (w, d) { return "w" + w + "d" + d; },
    isDone: function (w, d) { return !!this.data[this.keyFor(w, d)]; },
    toggle: function (w, d) {
      var k = this.keyFor(w, d);
      if (this.data[k]) delete this.data[k]; else this.data[k] = true;
      save(this.data);
    },
    countDone: function () { return Object.keys(this.data).length; },
    reset: function () { this.data = {}; save(this.data); }
  };
  function load() { try { return JSON.parse(localStorage.getItem(STORE_KEY)) || {}; } catch (e) { return {}; } }
  function save(d) { try { localStorage.setItem(STORE_KEY, JSON.stringify(d)); } catch (e) {} }

  var TOTAL_DAYS = WEEKS.reduce(function (n, w) { return n + w.days.length; }, 0);

  /* ---------- tiny DOM helpers ---------- */
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $$(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function el(tag, attrs) {
    var node = document.createElement(tag);
    if (attrs) for (var k in attrs) {
      if (attrs[k] == null) continue;
      if (k === "class") node.className = attrs[k];
      else if (k === "html") node.innerHTML = attrs[k];
      else if (k.indexOf("on") === 0 && typeof attrs[k] === "function") node.addEventListener(k.slice(2), attrs[k]);
      else node.setAttribute(k, attrs[k]);
    }
    var kids = Array.prototype.slice.call(arguments, 2);
    flatten(kids).forEach(function (c) {
      if (c == null || c === false) return;
      node.appendChild(typeof c === "string" || typeof c === "number" ? document.createTextNode(String(c)) : c);
    });
    return node;
  }
  function flatten(a) { return a.reduce(function (f, x) { return f.concat(Array.isArray(x) ? flatten(x) : x); }, []); }

  function ul(items, cls) {
    return el("ul", { class: cls || "" }, tr(items).map(function (i) { return el("li", null, i); }));
  }

  /* ---------- imagery helpers ---------- */
  /* Brand logo from the Simple Icons CDN, on a white tile so it shows in any theme.
     Hides itself on load error so a missing icon never breaks the layout. */
  function logo(slug, size) {
    size = size || 22;
    if (slug === "istqb") return istqbMark(size);
    var img = el("img", { class: "logo-img", alt: slug, loading: "lazy", width: size, height: size,
      src: "https://cdn.simpleicons.org/" + slug });
    img.addEventListener("error", function () { img.style.display = "none"; });
    return img;
  }
  function logoTile(slug, label, size) {
    return el("span", { class: "logo-tile" }, logo(slug, size || 18), label ? el("span", null, label) : null);
  }
  /* Hand-drawn ISTQB badge (no brand icon exists in Simple Icons). */
  function istqbMark(size) {
    var s = size || 18;
    return el("span", { class: "istqb-mark", style: "width:" + s + "px;height:" + s + "px",
      html: '<svg viewBox="0 0 24 24" width="' + s + '" height="' + s + '" aria-label="ISTQB">' +
            '<path fill="#1f6feb" d="M5 2h14a2 2 0 0 1 2 2v13l-9 5-9-5V4a2 2 0 0 1 2-2z"/>' +
            '<path fill="#fff" d="M10.3 15.2 7.1 12l1.4-1.4 1.8 1.8 4-4.2L15.8 9.6z"/></svg>' });
  }
  function ytSearch(q) { return "https://www.youtube.com/results?search_query=" + encodeURIComponent(q); }
  function langBadge(l) {
    var txt = l === "ar" ? "AR" : l === "en" ? "EN" : "EN·AR";
    return el("span", { class: "vid-lang vid-" + (l || "both") }, txt);
  }

  /* ============================ VIEWS ============================ */

  function renderOverview() {
    var main = $("#main");
    main.innerHTML = "";

    main.appendChild(el("section", { class: "hero" },
      el("p", { class: "eyebrow" }, tr(UI.hero_eyebrow)),
      el("h1", null, tr(UI.hero_h1)),
      el("p", { class: "lead" }, tr(UI.hero_lead)),
      el("div", { class: "hero-meta" },
        metaChip(tr(UI.meta_schedule), tr(META.weeklyLoad)),
        metaChip(tr(UI.meta_total), META.totalHours + " " + tr(UI.hours_word)),
        metaChip(tr(UI.meta_audience), tr(META.audience)),
        metaChip(tr(UI.meta_cost), tr(META.toolsFree))
      ),
      el("div", { class: "stack-row" }, BRANDS.map(function (b) { return logoTile(b.slug, b.name); }))
    ));

    var done = progress.countDone();
    var pct = Math.round((done / TOTAL_DAYS) * 100);
    main.appendChild(el("section", { class: "card progress-card" },
      el("div", { class: "progress-head" },
        el("h2", null, tr(UI.progress_title)),
        el("button", { class: "btn-ghost", onclick: function () { if (confirm(tr(UI.reset_confirm))) { progress.reset(); route(); } } }, tr(UI.reset))
      ),
      bar(pct),
      el("p", { class: "muted" }, fmt(tr(UI.progress_note), { done: done, total: TOTAL_DAYS, pct: pct }))
    ));

    var grid = el("div", { class: "phase-grid" });
    PHASES.forEach(function (p) {
      var pw = WEEKS.filter(function (w) { return w.phase === p.id; });
      var pd = pw.reduce(function (n, w) { return n + w.days.length; }, 0);
      var pdone = pw.reduce(function (n, w) { return n + w.days.filter(function (dy) { return progress.isDone(w.num, dy.dayNum); }).length; }, 0);
      grid.appendChild(el("a", { class: "phase-card " + p.color, href: "#/phase/" + p.id },
        el("div", { class: "phase-card-head" },
          el("div", { class: "phase-badge" }, tr(UI.phase_word) + " " + p.id),
          el("span", { class: "phase-logo" }, logo(PHASE_ICON[p.id], 26))),
        el("span", { class: "phase-weeks" }, tr(p.weeks)),
        el("h3", null, tr(p.title)),
        el("p", { class: "muted" }, tr(p.summary)),
        el("div", { class: "mini-bar-wrap" }, bar(Math.round((pdone / pd) * 100), true)),
        el("span", { class: "phase-link" }, pdone + "/" + pd + " " + arrow())
      ));
    });
    main.appendChild(el("section", null, el("h2", { class: "section-title" }, tr(UI.four_phases)), grid));

    var tbody = el("tbody", null, WEEKS.map(function (w) {
      return el("tr", { class: "row-link", onclick: function () { location.hash = "#/week/" + w.num; } },
        el("td", null, el("span", { class: "wk-pill phase-dot-" + w.phase }, String(w.num))),
        el("td", null, el("strong", null, tr(w.title)), el("div", { class: "muted small" }, tr(w.theme))),
        el("td", null, el("span", { class: "ms-type" }, tr(w.milestone.type)), el("div", { class: "small" }, tr(w.milestone.title)))
      );
    }));
    var tbl = el("table", { class: "week-table" },
      el("thead", null, el("tr", null, el("th", null, tr(UI.col_wk)), el("th", null, tr(UI.col_focus)), el("th", null, tr(UI.col_milestone)))),
      tbody);
    main.appendChild(el("section", null, el("h2", { class: "section-title" }, tr(UI.glance)), el("div", { class: "card table-wrap" }, tbl)));

    main.appendChild(el("section", null,
      el("h2", { class: "section-title" }, tr(UI.assess_phil)),
      el("div", { class: "card" },
        el("p", null, tr(ASSESSMENTS.cadence)),
        el("p", { class: "muted" }, tr(ASSESSMENTS.grading)),
        el("h4", null, tr(UI.rubric_title)),
        ul(ASSESSMENTS.rubricDimensions, "checklist")
      )
    ));
    window.scrollTo(0, 0);
  }

  function arrow() { return lang === "ar" ? "←" : "→"; }
  function metaChip(label, val) {
    return el("div", { class: "meta-chip" }, el("span", { class: "mc-label" }, label), el("span", { class: "mc-val" }, val));
  }
  function bar(pct, mini) {
    pct = Math.max(0, Math.min(100, pct || 0));
    return el("div", { class: "bar " + (mini ? "bar-mini" : "") },
      el("div", { class: "bar-fill", style: "width:" + pct + "%" }),
      mini ? null : el("span", { class: "bar-label" }, pct + "%"));
  }

  function renderPhase(id) {
    var p = PHASES.filter(function (x) { return x.id === +id; })[0];
    if (!p) return renderOverview();
    var main = $("#main");
    main.innerHTML = "";
    main.appendChild(breadcrumb([[tr(UI.nav_overview), "#/"], [tr(UI.phase_word) + " " + p.id, null]]));
    main.appendChild(el("section", { class: "phase-header " + p.color },
      el("span", { class: "phase-header-logo" }, logo(PHASE_ICON[p.id], 40)),
      el("span", { class: "phase-weeks" }, tr(p.weeks)),
      el("h1", null, tr(UI.phase_word) + " " + p.id + " · " + tr(p.title)),
      el("p", { class: "lead" }, tr(p.summary)),
      el("h4", null, tr(UI.by_end_phase)),
      ul(p.outcomes, "checklist")
    ));
    var weeks = WEEKS.filter(function (w) { return w.phase === p.id; });
    main.appendChild(el("div", { class: "week-cards" }, weeks.map(weekCard)));
    window.scrollTo(0, 0);
  }

  function weekCard(w) {
    var days = w.days.length;
    var doneN = w.days.filter(function (dy) { return progress.isDone(w.num, dy.dayNum); }).length;
    return el("a", { class: "week-card", href: "#/week/" + w.num },
      el("div", { class: "wc-top" },
        el("span", { class: "wk-pill phase-dot-" + w.phase }, tr(UI.week_word) + " " + w.num),
        el("span", { class: "small muted" }, doneN + "/" + days + " " + tr(UI.done_short))),
      el("h3", null, tr(w.title)),
      el("p", { class: "muted small" }, tr(w.theme)),
      w.istqb ? el("p", { class: "istqb-tag" }, tr(w.istqb)) : null,
      el("div", { class: "ms-mini" }, el("strong", null, tr(UI.col_milestone) + ": "), tr(w.milestone.title))
    );
  }

  function renderWeek(num) {
    var w = WEEKS.filter(function (x) { return x.num === +num; })[0];
    if (!w) return renderOverview();
    var p = PHASES.filter(function (x) { return x.id === w.phase; })[0];
    var main = $("#main");
    main.innerHTML = "";
    main.appendChild(breadcrumb([[tr(UI.nav_overview), "#/"], [tr(UI.phase_word) + " " + p.id, "#/phase/" + p.id], [tr(UI.week_word) + " " + w.num, null]]));

    main.appendChild(el("section", { class: "week-header " + p.color },
      el("span", { class: "phase-weeks" }, tr(UI.phase_word) + " " + p.id + " · " + tr(p.title)),
      el("h1", null, tr(UI.week_word) + " " + w.num + " · " + tr(w.title)),
      el("p", { class: "lead" }, tr(w.theme)),
      w.istqb ? el("p", { class: "istqb-tag light" }, arrow() + " " + tr(w.istqb)) : null,
      el("div", { class: "wk-obj" }, el("h4", null, tr(UI.weekly_obj)), ul(w.objectives, "checklist"))
    ));

    main.appendChild(el("section", { class: "milestone-box" },
      el("div", { class: "ms-flag" }, tr(UI.ms_flag)),
      el("h3", null, tr(w.milestone.title)),
      el("div", { class: "ms-tags" },
        el("span", { class: "tag" }, tr(w.milestone.type)),
        el("span", { class: "tag tag-pass" }, tr(UI.pass_label) + tr(w.milestone.pass))),
      el("p", null, tr(w.milestone.description))
    ));

    main.appendChild(el("h2", { class: "section-title" }, tr(UI.daily_plan)));
    w.days.forEach(function (dy) { main.appendChild(dayCard(w, dy)); });
    main.appendChild(weekNav(w.num));
    window.scrollTo(0, 0);
  }

  function dayCard(w, dy) {
    var done = progress.isDone(w.num, dy.dayNum);
    var card = el("section", { class: "day-card" + (done ? " is-done" : ""), id: "day-" + w.num + "-" + dy.dayNum });
    var cb = el("input", { type: "checkbox" });
    cb.checked = done;
    cb.addEventListener("change", function () { progress.toggle(w.num, dy.dayNum); card.classList.toggle("is-done"); updateSidebarProgress(); });
    var dow = tr(UI.dow[dy.dayNum - 1]) || "";
    card.appendChild(el("div", { class: "day-head" },
      el("div", { class: "day-id" },
        el("span", { class: "day-num" }, tr(UI.day_word) + " " + dy.dayNum),
        el("span", { class: "day-dow" }, dow)),
      el("h3", null, tr(dy.title)),
      el("div", { class: "day-head-right" },
        el("span", { class: "time-chip" }, "⏱ " + fmtTime(dy.time)),
        el("label", { class: "done-toggle" }, cb, el("span", null, tr(UI.done_word))))
    ));
    card.appendChild(el("div", { class: "day-body" },
      block(tr(UI.block_prereq), el("p", { class: "prereq" }, tr(dy.prereq))),
      block(tr(UI.block_obj), ul(dy.objectives, "checklist")),
      block(tr(UI.block_topics), ul(dy.topics, "topics")),
      block(tr(UI.block_exercise), el("p", null, tr(dy.exercise))),
      block(tr(UI.block_deliverable), el("p", { class: "deliverable" }, "📦 " + tr(dy.deliverable))),
      block(tr(UI.block_resources), ul(dy.resources, "resources"))
    ));
    return card;
  }
  function block(title, content) { return el("div", { class: "day-block" }, el("h4", null, title), content); }

  function weekNav(num) {
    var prev = WEEKS.filter(function (w) { return w.num === num - 1; })[0];
    var next = WEEKS.filter(function (w) { return w.num === num + 1; })[0];
    var a = arrow(), back = lang === "ar" ? "→" : "←";
    return el("nav", { class: "week-nav" },
      prev ? el("a", { class: "btn", href: "#/week/" + prev.num }, back + " " + tr(UI.week_word) + " " + prev.num + ": " + tr(prev.title)) : el("span"),
      next ? el("a", { class: "btn", href: "#/week/" + next.num }, tr(UI.week_word) + " " + next.num + ": " + tr(next.title) + " " + a) : el("span"));
  }

  function renderResources() {
    var main = $("#main");
    main.innerHTML = "";
    main.appendChild(breadcrumb([[tr(UI.nav_overview), "#/"], [tr(UI.nav_resources), null]]));
    main.appendChild(el("section", { class: "page-header" },
      el("h1", null, tr(UI.nav_resources)),
      el("p", { class: "lead" }, tr(UI.resources_lead)),
      el("p", { class: "muted small" }, tr(UI.resources_note))));
    var grid = el("div", { class: "res-grid" });
    RESOURCES.forEach(function (group, gi) {
      grid.appendChild(el("div", { class: "card res-card" },
        el("h3", null, el("span", { class: "res-icon" }, logo(RES_ICON[gi] || "youtube", 20)), tr(group.cat)),
        el("ul", { class: "res-list" }, group.items.map(function (it) {
          return el("li", null,
            it.url ? el("a", { href: it.url, target: "_blank", rel: "noopener" }, it.name) : el("strong", null, it.name),
            el("div", { class: "muted small" }, tr(it.note)));
        }))));
    });
    main.appendChild(grid);
    window.scrollTo(0, 0);
  }

  function renderVideos() {
    var main = $("#main");
    main.innerHTML = "";
    main.appendChild(breadcrumb([[tr(UI.nav_overview), "#/"], [tr(UI.nav_videos), null]]));
    main.appendChild(el("section", { class: "page-header" },
      el("h1", null, "🎬 " + tr(UI.nav_videos)),
      el("p", { class: "lead" }, tr(UI.videos_lead)),
      el("p", { class: "muted small" }, tr(UI.videos_note))));

    var chans = el("div", { class: "channel-grid" }, CHANNELS.map(function (ch) {
      return el("a", { class: "channel-card", href: ch.url, target: "_blank", rel: "noopener" },
        el("span", { class: "logo-tile" }, logo(ch.slug, 20)),
        el("div", { class: "channel-meta" }, el("strong", null, ch.name), el("div", { class: "muted small" }, tr(ch.note))),
        langBadge(ch.lang));
    }));
    main.appendChild(el("section", null, el("h2", { class: "section-title" }, tr(UI.trusted_channels)), chans));

    main.appendChild(el("h2", { class: "section-title" }, tr(UI.by_phase)));
    VIDEOS.forEach(function (group) {
      var p = PHASES.filter(function (x) { return x.id === group.phase; })[0];
      var list = el("div", { class: "video-list" }, group.items.map(function (v) {
        return el("a", { class: "video-card", href: v.url || ytSearch(v.q), target: "_blank", rel: "noopener", title: tr(UI.watch_yt) },
          el("span", { class: "yt-badge", html: '<svg viewBox="0 0 24 24" width="22" height="22"><path fill="#FF0000" d="M23 7.5a3 3 0 0 0-2.1-2.1C19 4.9 12 4.9 12 4.9s-7 0-8.9.5A3 3 0 0 0 1 7.5 31 31 0 0 0 .5 12 31 31 0 0 0 1 16.5a3 3 0 0 0 2.1 2.1c1.9.5 8.9.5 8.9.5s7 0 8.9-.5A3 3 0 0 0 23 16.5 31 31 0 0 0 23.5 12 31 31 0 0 0 23 7.5z"/><path fill="#fff" d="M9.8 15.3 15.5 12 9.8 8.7z"/></svg>' }),
          el("div", { class: "video-meta" }, el("strong", null, tr(v.name)), el("span", { class: "muted small" }, v.url ? "YouTube" : tr(UI.watch_yt))),
          langBadge(v.lang));
      }));
      main.appendChild(el("section", { class: "video-phase" },
        el("div", { class: "video-phase-head " + p.color },
          el("span", { class: "phase-logo sm" }, logo(PHASE_ICON[p.id], 22)),
          el("h3", null, tr(UI.phase_word) + " " + p.id + " · " + tr(p.title))),
        list));
    });
    window.scrollTo(0, 0);
  }

  function renderAssessments() {
    var main = $("#main");
    main.innerHTML = "";
    main.appendChild(breadcrumb([[tr(UI.nav_overview), "#/"], [tr(UI.nav_assessments), null]]));
    main.appendChild(el("section", { class: "page-header" },
      el("h1", null, tr(UI.nav_assessments)),
      el("p", { class: "lead" }, tr(ASSESSMENTS.cadence))));
    main.appendChild(el("section", { class: "card" },
      el("h3", null, tr(UI.grading_title)), el("p", { class: "muted" }, tr(ASSESSMENTS.grading)),
      el("h4", null, tr(UI.rubric_title)), ul(ASSESSMENTS.rubricDimensions, "checklist")));

    var tbody = el("tbody", null, WEEKS.map(function (w) {
      return el("tr", { class: "row-link", onclick: function () { location.hash = "#/week/" + w.num; } },
        el("td", null, el("span", { class: "wk-pill phase-dot-" + w.phase }, String(w.num))),
        el("td", null, el("strong", null, tr(w.milestone.title)), el("div", { class: "muted small" }, tr(w.milestone.description))),
        el("td", null, tr(w.milestone.type)),
        el("td", null, el("span", { class: "tag tag-pass" }, tr(w.milestone.pass))));
    }));
    var tbl = el("table", { class: "week-table" },
      el("thead", null, el("tr", null, el("th", null, tr(UI.col_wk)), el("th", null, tr(UI.col_milestone)), el("th", null, tr(UI.col_type)), el("th", null, tr(UI.col_pass)))),
      tbody);
    main.appendChild(el("section", null, el("h2", { class: "section-title" }, tr(UI.ms_schedule)), el("div", { class: "card table-wrap" }, tbl)));
    window.scrollTo(0, 0);
  }

  function renderSearch(q) {
    var main = $("#main");
    main.innerHTML = "";
    main.appendChild(breadcrumb([[tr(UI.nav_overview), "#/"], [tr(UI.search_results) + ': "' + q + '"', null]]));
    var needle = q.toLowerCase();
    var hits = [];
    WEEKS.forEach(function (w) {
      w.days.forEach(function (dy) {
        var parts = [dy.title, dy.exercise, dy.deliverable, dy.prereq].concat(dy.objectives, dy.topics, dy.resources, [w.title, w.theme]);
        var hay = parts.map(function (x) {
          if (typeof x === "string") return x;
          if (x && (x.en || x.ar)) return (x.en || "") + " " + (x.ar || "");
          return "";
        }).join(" ").toLowerCase();
        if (hay.indexOf(needle) !== -1) hits.push({ w: w, dy: dy });
      });
    });
    main.appendChild(el("section", { class: "page-header" }, el("h1", null, tr(UI.search_results)),
      el("p", { class: "lead" }, fmt(tr(UI.search_matching), { n: hits.length, q: q }))));
    if (!hits.length) { main.appendChild(el("p", { class: "muted" }, tr(UI.search_none))); return; }
    var list = el("div", { class: "search-list" });
    hits.forEach(function (h) {
      list.appendChild(el("a", { class: "search-hit", href: "#/week/" + h.w.num },
        el("span", { class: "wk-pill phase-dot-" + h.w.phase }, "W" + h.w.num + " D" + h.dy.dayNum),
        el("div", null, el("strong", null, tr(h.dy.title)), el("div", { class: "muted small" }, tr(h.w.title) + " — " + fmtTime(h.dy.time)))));
    });
    main.appendChild(list);
    window.scrollTo(0, 0);
  }

  function breadcrumb(parts) {
    var nodes = [];
    parts.forEach(function (p, i) {
      if (i < parts.length - 1) { nodes.push(el("a", { href: p[1] }, p[0])); nodes.push(el("span", { class: "sep" }, "/")); }
      else nodes.push(el("span", { class: "current" }, p[0]));
    });
    return el("nav", { class: "crumbs" }, nodes);
  }

  /* ============================ SIDEBAR ============================ */
  function buildSidebar() {
    var nav = $("#sidebar-nav");
    nav.innerHTML = "";
    nav.appendChild(el("a", { class: "side-link side-top", href: "#/" }, "🏠 " + tr(UI.nav_overview)));
    PHASES.forEach(function (p) {
      var group = el("div", { class: "side-group" });
      group.appendChild(el("a", { class: "side-phase " + p.color, href: "#/phase/" + p.id }, tr(UI.phase_word) + " " + p.id + " · " + tr(p.title)));
      WEEKS.filter(function (w) { return w.phase === p.id; }).forEach(function (w) {
        group.appendChild(el("a", { class: "side-week", href: "#/week/" + w.num, "data-week": w.num },
          el("span", { class: "sw-num" }, "W" + w.num),
          el("span", { class: "sw-title" }, tr(w.title)),
          el("span", { class: "sw-prog", "data-week-prog": w.num }, "")));
      });
      nav.appendChild(group);
    });
    nav.appendChild(el("a", { class: "side-link", href: "#/assessments" }, "★ " + tr(UI.nav_assessments)));
    nav.appendChild(el("a", { class: "side-link", href: "#/videos" }, "🎬 " + tr(UI.nav_videos)));
    nav.appendChild(el("a", { class: "side-link", href: "#/resources" }, "📚 " + tr(UI.nav_resources)));
    updateSidebarProgress();
  }

  function updateSidebarProgress() {
    WEEKS.forEach(function (w) {
      var total = w.days.length;
      var done = w.days.filter(function (dy) { return progress.isDone(w.num, dy.dayNum); }).length;
      var node = document.querySelector('[data-week-prog="' + w.num + '"]');
      if (node) { node.textContent = done + "/" + total; node.classList.toggle("complete", done === total); }
    });
    var head = $("#header-progress");
    if (head) head.textContent = Math.round((progress.countDone() / TOTAL_DAYS) * 100) + "%";
  }

  function highlightActive() {
    $$(".side-week, .side-phase, .side-link").forEach(function (a) { a.classList.remove("active"); });
    var h = location.hash || "#/";
    var m = h.match(/#\/week\/(\d+)/);
    if (m) { var a = document.querySelector('.side-week[data-week="' + m[1] + '"]'); if (a) a.classList.add("active"); }
    else { $$(".side-link, .side-phase").forEach(function (x) { if (x.getAttribute("href") === h) x.classList.add("active"); }); }
  }

  /* ============================ CHROME (labels that live outside #main) ============================ */
  function applyChrome() {
    $("#brand-title").textContent = tr(UI.brand_title);
    $("#brand-sub").textContent = tr(UI.brand_sub);
    $("#search-input").setAttribute("placeholder", tr(UI.search_placeholder));
    $("#print-btn").setAttribute("title", tr(UI.print_title));
    $("#footer-text").textContent = tr(UI.footer);
    $("#lang-btn").textContent = tr(UI.lang_btn);
    $("#theme-btn").textContent = (theme === "dark" ? "☀ " : "🌙 ") + (theme === "dark" ? tr(UI.theme_light) : tr(UI.theme_dark));
  }

  /* ============================ ROUTER ============================ */
  function route() {
    var h = location.hash || "#/";
    if (h.indexOf("#/phase/") === 0) renderPhase(h.split("/")[2]);
    else if (h.indexOf("#/week/") === 0) renderWeek(h.split("/")[2]);
    else if (h === "#/resources") renderResources();
    else if (h === "#/videos") renderVideos();
    else if (h === "#/assessments") renderAssessments();
    else if (h.indexOf("#/search/") === 0) renderSearch(decodeURIComponent(h.split("/")[2] || ""));
    else renderOverview();
    highlightActive();
    closeNav();
  }

  function rerenderAll() { buildSidebar(); applyChrome(); route(); }

  /* ============================ NAV / SIDE MENU ============================ */
  /* Mobile (<=980px): hamburger opens a slide-over drawer (body.nav-open).
     Desktop (>980px): hamburger collapses the docked sidebar (body.nav-collapsed),
     and the choice is remembered across visits. */
  function isMobile() { return window.matchMedia("(max-width: 980px)").matches; }

  function syncToggleAria() {
    var t = $("#nav-toggle");
    if (!t) return;
    var expanded = isMobile()
      ? document.body.classList.contains("nav-open")
      : !document.body.classList.contains("nav-collapsed");
    t.setAttribute("aria-expanded", expanded ? "true" : "false");
  }
  function setNav(open) { document.body.classList.toggle("nav-open", open); syncToggleAria(); }
  function closeNav() { setNav(false); }
  function toggleSidebar() {
    if (isMobile()) {
      setNav(!document.body.classList.contains("nav-open"));
    } else {
      var collapsed = document.body.classList.toggle("nav-collapsed");
      try { localStorage.setItem(NAV_KEY, collapsed ? "1" : "0"); } catch (e) {}
      syncToggleAria();
    }
  }

  /* ============================ INIT ============================ */
  document.addEventListener("DOMContentLoaded", function () {
    applyLang(); applyTheme();
    if (localStorage.getItem(NAV_KEY) === "1") document.body.classList.add("nav-collapsed");
    buildSidebar(); applyChrome();
    syncToggleAria();

    $("#search-input").addEventListener("keydown", function (e) {
      if (e.key === "Enter" && e.target.value.trim()) location.hash = "#/search/" + encodeURIComponent(e.target.value.trim());
    });
    $("#nav-toggle").addEventListener("click", toggleSidebar);
    $("#nav-backdrop").addEventListener("click", closeNav);
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && document.body.classList.contains("nav-open")) closeNav();
    });
    $("#print-btn").addEventListener("click", function () { window.print(); });
    $("#lang-btn").addEventListener("click", function () {
      lang = (lang === "en") ? "ar" : "en";
      localStorage.setItem(LANG_KEY, lang);
      applyLang(); rerenderAll();
    });
    $("#theme-btn").addEventListener("click", function () {
      theme = (theme === "light") ? "dark" : "light";
      localStorage.setItem(THEME_KEY, theme);
      applyTheme(); applyChrome();
    });

    window.addEventListener("hashchange", route);
    window.addEventListener("resize", function () {
      if (window.innerWidth > 980 && document.body.classList.contains("nav-open")) closeNav();
      syncToggleAria();
    });
    route();
  });
})();
