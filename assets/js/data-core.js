/* ============================================================================
 * QA Curriculum — CORE DATA (bilingual EN/AR)
 * L(en, ar) wraps a translatable string. Arrays may hold L() objects or
 * plain strings (plain = shared across languages, e.g. proper nouns/URLs).
 * Phase week data is pushed by data-phase1..4.js into CURRICULUM.WEEKS.
 * ==========================================================================*/
function L(en, ar) { return { en: en, ar: ar }; }

/* day factory: any field may be a string, an L() object, or an array of those */
function d(dayNum, title, time, prereq, objectives, topics, exercise, deliverable, resources) {
  return { dayNum: dayNum, title: title, time: time, prereq: prereq, objectives: objectives,
           topics: topics, exercise: exercise, deliverable: deliverable, resources: resources };
}

const META = {
  title: "QA Automation Engineer Curriculum",
  subtitle: L("16-Week Professional Training Program", "برنامج تدريبي احترافي مدّته 16 أسبوعًا"),
  audience: L("University student → industry-ready QA Automation Engineer",
              "طالب جامعي ← مهندس أتمتة اختبارات جاهز لسوق العمل"),
  weeklyLoad: L("20 hrs/week · 4 hrs/day · 5 days/week (Mon–Fri)",
                "20 ساعة/أسبوع · 4 ساعات/يوم · 5 أيام/أسبوع (الإثنين–الجمعة)"),
  totalHours: 320,
  stack: ["ISTQB FL 2023", "JavaScript (ES6+)", "Cypress", "Postman", "Newman", "Git", "CI/CD (GitHub Actions)"],
  toolsFree: L("Every tool used in this program has a free tier or is open source.",
               "كل أداة مستخدمة في هذا البرنامج مجانية أو مفتوحة المصدر.")
};

const PHASES = [
  {
    id: 1, color: "phase-1",
    weeks: L("Weeks 1–4", "الأسابيع 1–4"),
    title: L("Manual Testing Fundamentals", "أساسيات الاختبار اليدوي"),
    summary: L(
      "Build the testing mindset on the ISTQB Foundation Level syllabus: principles, the test process, the SDLC, static testing, black/white/experience-based design techniques, test management and the defect lifecycle.",
      "بناء عقلية الاختبار اعتمادًا على منهج ISTQB المستوى التأسيسي: المبادئ، وعملية الاختبار، ودورة حياة تطوير البرمجيات، والاختبار الساكن، وتقنيات تصميم الاختبارات (الصندوق الأسود/الأبيض والقائمة على الخبرة)، وإدارة الاختبار، ودورة حياة العيوب."),
    outcomes: [
      L("Explain the 7 testing principles and the fundamental test process", "شرح مبادئ الاختبار السبعة وعملية الاختبار الأساسية"),
      L("Design test cases with EP, BVA, decision tables and state transition", "تصميم حالات اختبار باستخدام تقسيم التكافؤ وتحليل القيم الحدّية وجداول القرار وانتقال الحالة"),
      L("Write professional defect reports and manage a defect lifecycle", "كتابة تقارير عيوب احترافية وإدارة دورة حياة العيب"),
      L("Read this curriculum at an ISTQB FL exam-ready level", "بلوغ مستوى الجاهزية لامتحان ISTQB FL")
    ]
  },
  {
    id: 2, color: "phase-2",
    weeks: L("Weeks 5–8", "الأسابيع 5–8"),
    title: L("JavaScript & Automation Foundations", "أساسيات JavaScript والأتمتة"),
    summary: L(
      "Acquire the programming and web fundamentals automation depends on: JavaScript through ES6+, async/Promises, the DOM, browser DevTools, Git and Node/npm — then install Cypress and write the first automated tests.",
      "اكتساب أساسيات البرمجة والويب التي تعتمد عليها الأتمتة: لغة JavaScript حتى ES6+، والبرمجة غير المتزامنة والـ Promises، وشجرة DOM، وأدوات مطوّري المتصفح، وGit وNode/npm — ثم تثبيت Cypress وكتابة أولى الاختبارات المؤتمتة."),
    outcomes: [
      L("Write clean ES6+ JavaScript: functions, arrays, objects, async/await", "كتابة JavaScript نظيفة بمعايير ES6+: الدوال والمصفوفات والكائنات وasync/await"),
      L("Inspect the DOM and build robust CSS selectors with DevTools", "فحص شجرة DOM وبناء محدّدات CSS متينة باستخدام أدوات المطوّر"),
      L("Use Git, Node and npm confidently from the command line", "استخدام Git وNode وnpm بثقة من سطر الأوامر"),
      L("Install, configure and run a first Cypress test suite", "تثبيت Cypress وتهيئته وتشغيل أول مجموعة اختبارات")
    ]
  },
  {
    id: 3, color: "phase-3",
    weeks: L("Weeks 9–12", "الأسابيع 9–12"),
    title: L("Advanced Cypress Framework", "إطار عمل Cypress المتقدّم"),
    summary: L(
      "Move from scripts to a maintainable framework: resilient locators, the full assertion vocabulary, custom commands, fixtures, network stubbing, the Page Object Model, data-driven tests, CI/CD and reporting.",
      "الانتقال من السكربتات إلى إطار عمل قابل للصيانة: محدّدات متينة، ومفردات التحقق الكاملة، والأوامر المخصّصة، وملفات البيانات (fixtures)، واعتراض الشبكة، ونمط Page Object Model، والاختبارات المدفوعة بالبيانات، والتكامل المستمر والتقارير."),
    outcomes: [
      L("Engineer a scalable Cypress framework with the Page Object Model", "هندسة إطار عمل Cypress قابل للتوسّع باستخدام نمط Page Object Model"),
      L("Stub and intercept network traffic with cy.intercept()", "اعتراض حركة الشبكة ومحاكاتها عبر cy.intercept()"),
      L("Run tests in CI with GitHub Actions and publish reports", "تشغيل الاختبارات في التكامل المستمر عبر GitHub Actions ونشر التقارير"),
      L("Apply industry best practices for flake-free, fast suites", "تطبيق أفضل الممارسات لمجموعات اختبار سريعة وخالية من التذبذب")
    ]
  },
  {
    id: 4, color: "phase-4",
    weeks: L("Weeks 13–16", "الأسابيع 13–16"),
    title: L("API Testing Mastery & Integration", "إتقان اختبار واجهات API والتكامل"),
    summary: L(
      "Master API testing: HTTP/REST, Postman collections, environments and variables, scripted assertions, Newman in CI, API testing inside Cypress, performance-testing basics — culminating in a full integration capstone.",
      "إتقان اختبار واجهات API: بروتوكول HTTP وREST، ومجموعات Postman، والبيئات والمتغيرات، وعمليات التحقق المكتوبة بالسكربت، وNewman في التكامل المستمر، واختبار API داخل Cypress، وأساسيات اختبار الأداء — وصولًا إلى مشروع تخرّج تكاملي شامل."),
    outcomes: [
      L("Build automated API suites in Postman and run them via Newman in CI", "بناء مجموعات اختبار API مؤتمتة في Postman وتشغيلها عبر Newman في التكامل المستمر"),
      L("Test APIs directly from Cypress with cy.request()", "اختبار واجهات API مباشرة من Cypress عبر cy.request()"),
      L("Run baseline performance checks and interpret the results", "تنفيذ فحوص أداء مرجعية وتفسير نتائجها"),
      L("Deliver a portfolio-grade capstone combining UI + API automation", "تسليم مشروع تخرّج بمستوى احترافي يجمع أتمتة الواجهة وواجهات API")
    ]
  }
];

/* Reference resources (names/URLs shared; category + note translated). */
const RESOURCES = [
  { cat: L("Standards & Theory", "المعايير والنظريات"), items: [
    { name: "ISTQB Foundation Level Syllabus v4.0", url: "https://www.istqb.org/certifications/certified-tester-foundation-level", note: L("The backbone of Phase 1. Free PDF.", "العمود الفقري للمرحلة الأولى. ملف PDF مجاني.") },
    { name: "ISTQB Glossary", url: "https://glossary.istqb.org/", note: L("Authoritative testing terminology.", "مصطلحات الاختبار المعتمدة.") },
    { name: "Foundations of Software Testing (Black, Veenendaal, Graham)", url: "", note: L("Companion book to the ISTQB syllabus.", "كتاب مرافق لمنهج ISTQB.") }
  ]},
  { cat: L("JavaScript", "JavaScript"), items: [
    { name: "MDN Web Docs — JavaScript", url: "https://developer.mozilla.org/en-US/docs/Web/JavaScript", note: L("Primary reference for all JS topics.", "المرجع الأساسي لكل موضوعات JavaScript.") },
    { name: "javascript.info", url: "https://javascript.info/", note: L("Modern JS tutorial, beginner→advanced.", "دليل JavaScript الحديث من المبتدئ إلى المتقدّم.") },
    { name: "Codewars", url: "https://www.codewars.com/", note: L("Kata practice for Weeks 5–6.", "تمارين برمجية للأسبوعين 5–6.") }
  ]},
  { cat: L("Cypress", "Cypress"), items: [
    { name: "Cypress Documentation", url: "https://docs.cypress.io/", note: L("Guides, API, best practices — used throughout Phase 3.", "أدلة وواجهات وأفضل ممارسات — تُستخدم طوال المرحلة الثالثة.") },
    { name: "Cypress Best Practices", url: "https://docs.cypress.io/guides/references/best-practices", note: L("Selectors, waiting, test independence.", "المحدّدات والانتظار واستقلالية الاختبارات.") },
    { name: "Cypress RealWorld App", url: "https://github.com/cypress-io/cypress-realworld-app", note: L("Reference framework & practice target.", "إطار مرجعي وتطبيق للتدرّب عليه.") }
  ]},
  { cat: L("API & Postman", "API وPostman"), items: [
    { name: "Postman Learning Center", url: "https://learning.postman.com/", note: L("Requests, collections, variables, Newman.", "الطلبات والمجموعات والمتغيرات وNewman.") },
    { name: "Newman", url: "https://www.npmjs.com/package/newman", note: L("Run Postman collections in CI.", "تشغيل مجموعات Postman في التكامل المستمر.") },
    { name: "ReqRes / JSONPlaceholder", url: "https://reqres.in/", note: L("Free public APIs for practice.", "واجهات API عامة مجانية للتدرّب.") }
  ]},
  { cat: L("Performance & CI", "الأداء والتكامل المستمر"), items: [
    { name: "k6 Documentation", url: "https://grafana.com/docs/k6/latest/", note: L("Script-based load testing (Week 15).", "اختبار حِمل قائم على السكربت (الأسبوع 15).") },
    { name: "Apache JMeter", url: "https://jmeter.apache.org/usermanual/", note: L("GUI-based performance testing alternative.", "بديل لاختبار الأداء بواجهة رسومية.") },
    { name: "GitHub Actions", url: "https://docs.github.com/actions", note: L("CI/CD for Cypress & Newman.", "تكامل مستمر لـ Cypress وNewman.") }
  ]},
  { cat: L("Practice Targets", "تطبيقات للتدرّب"), items: [
    { name: "the-internet (Heroku)", url: "https://the-internet.herokuapp.com/", note: L("Widgets & tricky UI for selector/interaction practice.", "عناصر واجهة متنوّعة للتدرّب على المحدّدات والتفاعل.") },
    { name: "RealWorld / Conduit", url: "https://github.com/gothinkster/realworld", note: L("Full app with UI + API for capstones.", "تطبيق كامل بواجهة وAPI لمشاريع التخرّج.") },
    { name: "Swagger Petstore", url: "https://petstore.swagger.io/", note: L("OpenAPI docs reading practice.", "تدرّب على قراءة توثيق OpenAPI.") }
  ]}
];

const ASSESSMENTS = {
  cadence: L("Weekly milestone (end of each week) + one capstone per phase + a comprehensive final exam.",
             "إنجاز أسبوعي في نهاية كل أسبوع + مشروع تخرّج لكل مرحلة + امتحان نهائي شامل."),
  grading: L("Quizzes graded automatically/by key (pass ≥ 80%). Practical work and capstones graded against published rubrics (pass ≥ 80%, final capstone ≥ 85%). Code reviews are formative.",
             "تُصحّح الاختبارات القصيرة آليًا أو بمفتاح إجابة (النجاح ≥ 80%). تُقيّم الأعمال العملية ومشاريع التخرّج وفق معايير منشورة (النجاح ≥ 80%، ومشروع التخرّج النهائي ≥ 85%). أما مراجعات الكود فهي تكوينية."),
  rubricDimensions: [
    L("Correctness — tests/assertions actually verify the intended behaviour", "الصحّة — أن تتحقّق الاختبارات فعليًا من السلوك المقصود"),
    L("Coverage — appropriate breadth and depth for the risk", "التغطية — اتّساع وعمق مناسبان لمستوى المخاطرة"),
    L("Design — clean structure (POM, reuse, no duplication)", "التصميم — بنية نظيفة (POM وإعادة الاستخدام ودون تكرار)"),
    L("Reliability — no flake, no hard-coded waits, test independence", "الموثوقية — دون تذبذب ولا انتظار ثابت واستقلالية الاختبارات"),
    L("Readability — naming, comments, README, commit hygiene", "الوضوح — التسمية والتعليقات وملف README ونظافة الـ commits"),
    L("Professionalism — defect reports, communication, on-time delivery", "الاحترافية — تقارير العيوب والتواصل والتسليم في الموعد")
  ]
};

/* UI chrome strings. {N} placeholders are filled in app.js. */
const UI = {
  brand_title: L("QA Automation Engineer", "مهندس أتمتة الاختبارات"),
  brand_sub: L("16-Week Professional Curriculum", "منهج احترافي لـ 16 أسبوعًا"),
  search_placeholder: L("Search sessions…", "ابحث في الجلسات…"),
  print_title: L("Print / Save as PDF", "طباعة / حفظ بصيغة PDF"),
  lang_btn: L("العربية", "English"),
  theme_light: L("Light", "فاتح"),
  theme_dark: L("Dark", "داكن"),
  nav_overview: L("Overview", "نظرة عامة"),
  nav_assessments: L("Assessments", "التقييمات"),
  nav_resources: L("Resources", "المصادر"),
  footer: L("Designed by a Senior Cypress Automation Engineer · Phase 1 anchored to the ISTQB Foundation Level syllabus (v4.0). Progress is stored locally in your browser.",
            "صُمّم بإشراف مهندس أتمتة Cypress أوّل · تستند المرحلة الأولى إلى منهج ISTQB المستوى التأسيسي (v4.0). يُحفظ تقدّمك محليًا في متصفحك."),
  hero_eyebrow: L("16-Week Professional Training Program", "برنامج تدريبي احترافي لـ 16 أسبوعًا"),
  hero_h1: L("From University Student to Industry-Ready QA Automation Engineer",
             "من طالب جامعي إلى مهندس أتمتة اختبارات جاهز لسوق العمل"),
  hero_lead: L("A 16-week, 320-hour program that builds manual-testing rigor, JavaScript fluency, a production-grade Cypress framework, and full API-testing mastery — anchored to the ISTQB Foundation Level syllabus.",
               "برنامج من 16 أسبوعًا و320 ساعة يبني صرامة الاختبار اليدوي، وإتقان JavaScript، وإطار عمل Cypress بمستوى إنتاجي، وإتقانًا كاملًا لاختبار واجهات API — مستندًا إلى منهج ISTQB المستوى التأسيسي."),
  meta_schedule: L("Schedule", "الجدول"),
  meta_total: L("Total", "الإجمالي"),
  meta_audience: L("Audience", "الفئة المستهدفة"),
  meta_cost: L("Cost", "التكلفة"),
  hours_word: L("hours", "ساعة"),
  progress_title: L("Your progress", "تقدّمك"),
  reset: L("Reset", "إعادة ضبط"),
  reset_confirm: L("Reset all progress?", "إعادة ضبط كل التقدّم؟"),
  progress_note: L("{done} of {total} daily sessions complete ({pct}%). Progress is saved in this browser.",
                   "أكملت {done} من {total} جلسة يومية ({pct}%). يُحفظ التقدّم في هذا المتصفح."),
  four_phases: L("The four phases", "المراحل الأربع"),
  glance: L("16 weeks at a glance", "نظرة سريعة على 16 أسبوعًا"),
  assess_phil: L("Assessment philosophy", "فلسفة التقييم"),
  rubric_title: L("Rubric dimensions", "أبعاد معايير التقييم"),
  grading_title: L("Grading", "التقدير"),
  ms_schedule: L("Milestone schedule", "جدول الإنجازات"),
  col_wk: L("Wk", "أسبوع"),
  col_focus: L("Focus", "التركيز"),
  col_milestone: L("Milestone", "الإنجاز"),
  col_type: L("Type", "النوع"),
  col_pass: L("Pass", "النجاح"),
  by_end_phase: L("By the end of this phase you can:", "بنهاية هذه المرحلة ستكون قادرًا على:"),
  weekly_obj: L("Weekly learning objectives", "أهداف التعلّم الأسبوعية"),
  ms_flag: L("★ Milestone", "★ إنجاز"),
  pass_label: L("Pass: ", "النجاح: "),
  daily_plan: L("Daily plan (Monday–Friday)", "الخطة اليومية (الإثنين–الجمعة)"),
  day_word: L("Day", "اليوم"),
  week_word: L("Week", "الأسبوع"),
  phase_word: L("Phase", "المرحلة"),
  done_word: L("Done", "تمّ"),
  done_short: L("done", "مُنجز"),
  block_prereq: L("Prerequisite check", "التحقّق من المتطلّبات المسبقة"),
  block_obj: L("Learning objectives", "أهداف التعلّم"),
  block_topics: L("Topics covered", "الموضوعات المغطّاة"),
  block_exercise: L("Hands-on exercise", "تمرين تطبيقي"),
  block_deliverable: L("Deliverable", "المُخرَج"),
  block_resources: L("Recommended resources", "مصادر مقترحة"),
  resources_lead: L("Curated, mostly-free resources backing every session. Standards anchor Phase 1; official docs anchor Phases 2–4.",
                    "مصادر مختارة ومجانية في معظمها تدعم كل جلسة. تستند المرحلة الأولى إلى المعايير، والمراحل 2–4 إلى التوثيق الرسمي."),
  search_results: L("Search results", "نتائج البحث"),
  search_matching: L('{n} session(s) matching "{q}"', 'عدد {n} جلسة مطابقة لـ "{q}"'),
  search_none: L("No matches. Try a topic like 'intercept', 'boundary', 'Newman', or 'POM'.",
                 "لا توجد نتائج. جرّب موضوعًا مثل intercept أو boundary أو Newman أو POM."),
  resources_note: L("Reference resources are in English (the source documentation is English).",
                    "المصادر المرجعية باللغة الإنجليزية (لأن التوثيق الأصلي بالإنجليزية)."),
  nav_videos: L("Video Library", "مكتبة الفيديو"),
  videos_lead: L("Curated YouTube learning in Arabic and English, mapped to the four phases.",
                 "تعلّم منتقى من يوتيوب بالعربية والإنجليزية، مرتّب على المراحل الأربع."),
  videos_note: L("Channel links open trusted creators. Topic links are pre-filled YouTube searches that surface the current top tutorials — so they never go stale.",
                 "روابط القنوات تفتح صنّاع محتوى موثوقين. وروابط المواضيع هي عمليات بحث جاهزة في يوتيوب تُظهر أحدث وأفضل الدروس — فلا تتقادم أبدًا."),
  trusted_channels: L("Trusted channels", "قنوات موثوقة"),
  watch_yt: L("Open on YouTube", "افتح في يوتيوب"),
  by_phase: L("By phase", "حسب المرحلة"),
  dow: [ L("Monday","الإثنين"), L("Tuesday","الثلاثاء"), L("Wednesday","الأربعاء"), L("Thursday","الخميس"), L("Friday","الجمعة") ]
};

/* Brand logos for the hero strip (Simple Icons slugs; 'istqb' rendered as inline SVG). */
const BRANDS = [
  { name: "ISTQB FL", slug: "istqb" },
  { name: "JavaScript", slug: "javascript" },
  { name: "Cypress", slug: "cypress" },
  { name: "Postman", slug: "postman" },
  { name: "Node.js", slug: "nodedotjs" },
  { name: "Git", slug: "git" },
  { name: "GitHub Actions", slug: "githubactions" },
  { name: "k6", slug: "k6" }
];

/* Trusted YouTube channels (confident direct links). slug = Simple Icons logo, else 'youtube'. */
const CHANNELS = [
  { name: "Cypress.io", url: "https://www.youtube.com/@Cypressio", slug: "cypress", lang: "en", note: L("Official Cypress channel", "قناة Cypress الرسمية") },
  { name: "Postman", url: "https://www.youtube.com/@postman", slug: "postman", lang: "en", note: L("Official Postman channel", "قناة Postman الرسمية") },
  { name: "freeCodeCamp", url: "https://www.youtube.com/@freecodecamp", slug: "freecodecamp", lang: "en", note: L("Free full-length courses", "دورات كاملة مجانية") },
  { name: "Traversy Media", url: "https://www.youtube.com/@TraversyMedia", slug: "youtube", lang: "en", note: L("Web dev & JavaScript", "تطوير الويب وJavaScript") },
  { name: "Programming with Mosh", url: "https://www.youtube.com/@programmingwithmosh", slug: "youtube", lang: "en", note: L("JavaScript & fundamentals", "JavaScript والأساسيات") },
  { name: "The Net Ninja", url: "https://www.youtube.com/@NetNinja", slug: "youtube", lang: "en", note: L("Modern JS & web playlists", "قوائم JavaScript والويب الحديثة") },
  { name: "Academind", url: "https://www.youtube.com/@academind", slug: "youtube", lang: "en", note: L("JS, testing & tooling", "JavaScript والاختبار والأدوات") },
  { name: "Elzero Web School", url: "https://www.youtube.com/@ElzeroWebSchool", slug: "youtube", lang: "ar", note: L("Arabic web dev & JavaScript", "تطوير الويب وJavaScript بالعربية") }
];

/* Per-phase video recommendations. Items use a direct url OR a YouTube search query (q). */
const VIDEOS = [
  { phase: 1, items: [
    { name: L("ISTQB Foundation Level — full course", "ISTQB المستوى التأسيسي — دورة كاملة"), lang: "en", q: "ISTQB CTFL foundation level full course 2023 syllabus" },
    { name: L("Manual software testing for beginners", "الاختبار اليدوي للبرمجيات للمبتدئين"), lang: "en", q: "manual software testing tutorial for beginners full course" },
    { name: L("Defect / bug life cycle explained", "شرح دورة حياة العيب/الخطأ"), lang: "en", q: "defect bug life cycle in software testing explained" },
    { name: L("Software testing course (Arabic)", "كورس اختبار البرمجيات (عربي)"), lang: "ar", q: "كورس اختبار البرمجيات للمبتدئين Software Testing بالعربي" },
    { name: L("ISTQB explained in Arabic", "شرح ISTQB بالعربي"), lang: "ar", q: "شرح ISTQB مبادئ اختبار البرمجيات بالعربي" },
    { name: L("Test case design techniques (Arabic)", "تقنيات تصميم حالات الاختبار (عربي)"), lang: "ar", q: "تصميم حالات الاختبار equivalence boundary بالعربي" }
  ]},
  { phase: 2, items: [
    { name: L("JavaScript full course for beginners", "دورة JavaScript كاملة للمبتدئين"), lang: "en", q: "JavaScript full course for beginners freeCodeCamp" },
    { name: L("Modern JavaScript (async/await, ES6)", "JavaScript الحديثة (async/await وES6)"), lang: "en", q: "modern javascript async await promises es6 tutorial" },
    { name: L("Git & GitHub for beginners", "Git وGitHub للمبتدئين"), lang: "en", q: "git and github tutorial for beginners full course" },
    { name: L("JavaScript Bootcamp (Arabic)", "بوتكامب JavaScript (عربي)"), lang: "ar", q: "دورة جافا سكريبت كاملة Elzero JavaScript Bootcamp بالعربي" },
    { name: L("HTML & CSS course (Arabic)", "كورس HTML وCSS (عربي)"), lang: "ar", q: "كورس HTML CSS بالعربي Elzero" },
    { name: L("DOM & CSS selectors (Arabic)", "DOM ومحدّدات CSS (عربي)"), lang: "ar", q: "شرح DOM و CSS selectors بالعربي" }
  ]},
  { phase: 3, items: [
    { name: L("Cypress full course for beginners", "Cypress دورة كاملة للمبتدئين"), lang: "en", q: "Cypress tutorial for beginners full course end to end" },
    { name: L("Cypress Page Object Model & best practices", "Cypress نمط POM وأفضل الممارسات"), lang: "en", q: "Cypress page object model best practices tutorial" },
    { name: L("Cypress + GitHub Actions CI", "Cypress + GitHub Actions للتكامل المستمر"), lang: "en", q: "Cypress GitHub Actions CI tutorial reports" },
    { name: L("cy.intercept network stubbing", "اعتراض الشبكة cy.intercept"), lang: "en", q: "Cypress cy.intercept network stubbing tutorial" },
    { name: L("Cypress automation course (Arabic)", "كورس أتمتة Cypress (عربي)"), lang: "ar", q: "كورس Cypress automation testing بالعربي" },
    { name: L("Cypress practical examples (Arabic)", "أمثلة عملية على Cypress (عربي)"), lang: "ar", q: "شرح Cypress اوتوميشن اختبار الويب بالعربي" }
  ]},
  { phase: 4, items: [
    { name: L("Postman API testing — full course", "Postman لاختبار API — دورة كاملة"), lang: "en", q: "Postman API testing tutorial for beginners full course" },
    { name: L("Newman: run collections in CI", "Newman: تشغيل المجموعات في CI"), lang: "en", q: "Newman postman CLI CI tutorial html report" },
    { name: L("API testing with Cypress (cy.request)", "اختبار API بـ Cypress (cy.request)"), lang: "en", q: "API testing with Cypress cy.request tutorial" },
    { name: L("k6 load/performance testing", "اختبار الحِمل والأداء k6"), lang: "en", q: "k6 load testing tutorial getting started" },
    { name: L("Postman & API testing (Arabic)", "Postman واختبار API (عربي)"), lang: "ar", q: "شرح Postman اختبار API بالعربي كامل" },
    { name: L("Performance testing JMeter/k6 (Arabic)", "اختبار الأداء JMeter/k6 (عربي)"), lang: "ar", q: "اختبار الاداء performance testing JMeter بالعربي" }
  ]}
];

window.CURRICULUM = { META: META, PHASES: PHASES, WEEKS: [], RESOURCES: RESOURCES, ASSESSMENTS: ASSESSMENTS, UI: UI, BRANDS: BRANDS, CHANNELS: CHANNELS, VIDEOS: VIDEOS };
window.__L = L; window.__d = d;
