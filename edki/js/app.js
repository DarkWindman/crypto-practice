/* Підготовка до ЄДКІ · односторінковий застосунок без залежностей (окрім KaTeX для формул).
 * Маршрути: #/  #/tests  #/test/<id>  #/train[/<тема>]  #/past  #/program
 */
(function () {
  "use strict";

  const DATA = window.EDKI || { tests: [], past: [] };
  const app = document.getElementById("app");
  const footRight = document.getElementById("foot-right");
  const LETTERS = ["A", "B", "C", "D"];
  const ABC = "АБВГҐДЕЄЖЗИІЇЙКЛМНОПРСТУФХЦЧШЩЬЮЯ";

  /* Розділ 6 програми ЄДКІ (наказ МОН № 980 від 04.11.2022) + де це було на практиках. */
  const PROGRAM = [
    { id: "6.1", name: "Математичні основи криптографії та стеганографії", weight: "1,5–2,5 %", items: [
      { id: "6.1.1", name: "Модулярні обчислення", level: "C", src: "Практичні 5–7, задачі з теорії чисел" },
      { id: "6.1.2", name: "Елементи теорії чисел. Алгоритм Евкліда. Теорема Ейлера. Теореми Ферма. Обчислення у скінченних полях", level: "C", src: "Практичні 5–8, задачі з теорії чисел" },
      { id: "6.1.3", name: "Умови стійкості шифрів", level: "B", src: "Практичні 2–4 (ентропія, відстань однозначності)" },
      { id: "6.1.4", name: "Однонаправлені функції, функції гешування", level: "B", src: "Практичне 8" },
      { id: "6.1.5", name: "Псевдовипадкові послідовності в криптосистемах", level: "B", src: "Практичні 3–4 (ЛРЗ)" },
      { id: "6.1.6", name: "Обчислення в системі чисел з плаваючою точкою", level: "B", src: "—" }
    ] },
    { id: "6.2", name: "Симетричні криптосистеми", weight: "4–6 %", items: [
      { id: "6.2.1", name: "Модель симетричної криптосистеми", level: "B", src: "Практичне 1" },
      { id: "6.2.2", name: "Класичні методи шифрування (Цезаря, Вернама, Полібія, шифр гамування)", level: "C", src: "Практичні 1–2" },
      { id: "6.2.3", name: "Блокові шифри (DES, AES, ДСТУ ГОСТ 28147-2009, ДСТУ 7624:2014)", level: "B", src: "Практичне 4" },
      { id: "6.2.4", name: "Потокові шифри (RC4, STRUMOK)", level: "A", src: "Практичні 3–4 (ЛРЗ як основа потокових шифрів)" }
    ] },
    { id: "6.3", name: "Асиметричні криптосистеми", weight: "3–5 %", items: [
      { id: "6.3.1", name: "Модель асиметричної криптосистеми", level: "B", src: "Практичне 5" },
      { id: "6.3.2", name: "Шифри RSA, Ель-Гамаля (EG)", level: "B", src: "Практичні 6–7" },
      { id: "6.3.3", name: "Генерація спільних секретних ключів Діффі-Геллмана (DH)", level: "C", src: "Практичне 6" },
      { id: "6.3.4", name: "Електронний цифровий підпис DSA", level: "B", src: "Асиметричні протоколи, тема 1" }
    ] },
    { id: "6.4", name: "Цифрова стеганографія", weight: "1,5–2,5 %", items: [
      { id: "6.4.1–6.4.5", name: "Поняття, модель стеганосистеми, ЦВЗ, метод найменшого значущого біта", level: "A–B", src: "поза курсом; на сайті завдань немає" }
    ] }
  ];
  const TOPIC_NAME = {};
  PROGRAM.forEach((s) => { TOPIC_NAME[s.id] = s.name; s.items.forEach((i) => { TOPIC_NAME[i.id] = i.name; }); });

  /* ---------- утиліти ---------- */
  const store = {
    get(key, fallback) {
      try { const v = localStorage.getItem("edki:" + key); return v === null ? fallback : JSON.parse(v); }
      catch (e) { return fallback; }
    },
    set(key, value) { try { localStorage.setItem("edki:" + key, JSON.stringify(value)); } catch (e) { /* приватний режим тощо */ } },
    del(key) { try { localStorage.removeItem("edki:" + key); } catch (e) { /* ignore */ } }
  };

  function abcTable() {
    const top = ABC.split("").map((c) => "<td>" + c + "</td>").join("");
    const bottom = ABC.split("").map((_, i) => "<td>" + i + "</td>").join("");
    return '<table class="tbl"><tr>' + top + '</tr><tr class="idx">' + bottom + "</tr></table>";
  }
  const rich = (s) => String(s).replace("{{ABC}}", abcTable());

  function typeset(root) {
    if (window.renderMathInElement) {
      window.renderMathInElement(root, {
        delimiters: [{ left: "$", right: "$", display: false }],
        throwOnError: false
      });
    }
  }
  function render(html, foot) {
    app.innerHTML = html;
    footRight.textContent = foot || "";
    typeset(app);
  }
  const fmtTime = (sec) => {
    const s = Math.max(0, Math.round(sec));
    return String(Math.floor(s / 60)).padStart(2, "0") + ":" + String(s % 60).padStart(2, "0");
  };
  const block = (title, body, kind, extra) =>
    '<section class="block ' + (kind || "") + '"><div class="bt"><span>' + title + "</span>" + (extra || "") + '</div><div class="bb">' + body + "</div></section>";

  /* Мем для місця slot (налаштовується в data/memes.js). Порожній рядок, якщо мемів немає. */
  function meme(slot) {
    const cfg = DATA.memes;
    if (!cfg || !cfg.enabled) return "";
    const pool = (cfg.items || []).filter((m) => (m.where || []).indexOf(slot) !== -1);
    if (!pool.length) return "";
    const m = pool[Math.floor(Math.random() * pool.length)];
    const esc = (x) => String(x || "").replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;");
    return '<figure class="meme ' + (m.style === "card" || m.style === "plain" ? m.style : "sticker") + '"><img src="' + esc(m.src) + '" alt="' + esc(m.alt) +
      '" loading="lazy" onerror="this.parentNode.remove()">' + (m.caption ? "<figcaption>" + esc(m.caption) + "</figcaption>" : "") + "</figure>";
  }

  const getTest = (id) => DATA.tests.find((t) => t.id === id);
  const isMcq = (q) => Array.isArray(q.o);

  /* Банк для тренування за темами: усі тестові питання з варіантів і збірки. */
  function bank() {
    const out = [];
    DATA.tests.forEach((t) => t.questions.forEach((q, i) => out.push({ q, key: t.id + ":" + i, from: t.variant })));
    DATA.past.forEach((p) => p.items.forEach((q, i) => { if (isMcq(q)) out.push({ q, key: p.id + ":" + i, from: p.year + (q.n ? ", № " + q.n : "") }); }));
    return out;
  }

  /* Вежа ЄДКІ на головній: поверхи = групи пунктів програми. Поверх пройдено, коли правильно розв'язано 80 % його завдань. */
  const FLOORS = [
    { name: "Модулярні обчислення", ids: ["6.1.1"] },
    { name: "Теорія чисел і скінченні поля", ids: ["6.1.2"] },
    { name: "Стійкість шифрів, геші, ЛРЗ", ids: ["6.1.3", "6.1.4", "6.1.5"] },
    { name: "Класичні шифри", ids: ["6.2.1", "6.2.2"] },
    { name: "Блокові та потокові шифри", ids: ["6.2.3", "6.2.4"] },
    { name: "RSA та Ель-Гамаль", ids: ["6.3.1", "6.3.2"] },
    { name: "Діффі-Геллман і DSA", ids: ["6.3.3", "6.3.4"] }
  ];
  const PASS = 0.8;
  function markSolved(keys) {
    if (!keys.length) return;
    const solved = store.get("solved", {});
    keys.forEach((k) => { solved[k] = 1; });
    store.set("solved", solved);
  }
  function floorStats() {
    const all = bank();
    const solved = store.get("solved", {});
    return FLOORS.map((f) => {
      const qs = all.filter((x) => f.ids.indexOf(x.q.t) !== -1);
      const done = qs.filter((x) => solved[x.key]).length;
      return { name: f.name, href: "#/train/" + f.ids.join(","), total: qs.length, done, cleared: qs.length > 0 && done >= Math.ceil(PASS * qs.length) };
    });
  }
  function bossCleared() {
    return DATA.tests.some((t) => { const r = store.get("result:" + t.id, null); return r && r.score / r.total >= PASS; });
  }
  function tower() {
    const stats = floorStats();
    const boss = bossCleared();
    const n = stats.length;
    const cur = stats.findIndex((f) => !f.cleared);
    let html = '<div class="tower" aria-label="Вежа ЄДКІ">' +
      '<a class="floor top' + (boss ? " cleared" : "") + '" href="#/tests" style="--w:52%"><span class="fn">♛</span><span class="fname">Вершина: тренувальний ЄДКІ<small>' +
      (boss ? "бос переможений" : "бос: 80 % у тесті") + "</small></span></a>";
    for (let i = n - 1; i >= 0; i--) {
      const f = stats[i];
      const w = 58 + (n - 1 - i) * 6;
      html += '<a class="floor' + (f.cleared ? " cleared" : "") + (i === cur ? " current" : "") + '" href="' + f.href + '" style="--w:' + w + '%">' +
        '<span class="fn">' + (i + 1) + '</span><span class="fname">' + f.name + "<small>" + (f.cleared ? "пройдено · " : "") + f.done + " / " + f.total +
        '</small></span><i class="fbar"><b style="width:' + (f.total ? 100 * f.done / f.total : 0) + '%"></b></i></a>';
    }
    return html + '<div class="ground"></div></div>';
  }

  /* Картка питання. state: { picked, reveal, locked } */
  function questionCard(q, opts) {
    const o = opts || {};
    const picked = o.picked;
    let html = '<article class="q" data-key="' + (o.key || "") + '"><div class="meta"><span class="num">' + (o.label || "") +
      '</span><span title="' + (TOPIC_NAME[q.t] || "") + '">п. ' + q.t + " програми</span></div>" +
      '<div class="text">' + rich(q.q) + "</div>";
    if (isMcq(q)) {
      html += '<div class="opts">' + q.o.map((text, i) => {
        let cls = "opt";
        if (o.reveal) {
          if (i === q.a) cls += " ok";
          else if (i === picked) cls += " bad";
        } else if (i === picked) cls += " sel";
        return '<button class="' + cls + '" data-opt="' + i + '"' + (o.locked ? " disabled" : "") +
          '><span class="l">' + LETTERS[i] + "</span><span>" + text + "</span></button>";
      }).join("") + "</div>";
      if (o.reveal) html += '<div class="sol">' + block("Розв'язання", "<p>" + q.s + "</p>", "example") + "</div>";
    } else {
      html += '<details class="sol"><summary>Показати відповідь</summary>' + block("Відповідь", "<p>" + q.s + "</p>", "example") + "</details>";
    }
    return html + "</article>";
  }

  /* ---------- сторінки ---------- */
  function home() {
    const nQ = bank().length;
    render(
      '<section class="poster">' +
        '<span class="rune r1">$x^2 \\equiv a \\pmod p$</span><span class="rune r2">$a^{\\varphi(n)} \\equiv 1$</span>' +
        '<span class="rune r3">$g^{ab} \\bmod p$</span><span class="rune r4">$\\sqrt{a}$</span><span class="rune r5">$\\gcd(a, n) = 1$</span>' +
        '<div class="inner"><div class="ptext">' +
          '<p class="tagline">Не просто сесія…<br><b>100 завдань. 120 хвилин.</b></p>' +
          '<h1><span class="h-xl">Підготовка до ЄДКІ</span></h1>' +
          '<p class="psub">Теорія чисел, математичні основи та криптографія</p>' +
          '<p class="pevent">Спеціальність «Кібербезпека та захист інформації», бакалаврський рівень</p>' +
          '<p class="pdate">Тренувальний сезон 2027</p>' +
          '<p class="dedic">Любим котикам від Сенпая</p>' +
          '<div class="actions"><a class="btn gold" href="' + (floorStats().find((f) => !f.cleared) || { href: "#/tests" }).href + '">Піднятися на наступний поверх</a>' +
          '<a class="btn light ghost" href="#/tests">Кинути виклик босу</a></div>' +
          meme("home") +
        "</div>" + tower() + "</div>" +
        '<ul class="perks"><li><b>√a</b>Незвичний герой</li><li><b>✦</b>Магія математики</li><li><b>⚔</b>Шифри та битви</li><li><b>🐾</b>Вірні котики</li><li><b>♛</b>Ціль — скласти ЄДКІ</li></ul>' +
        '<p class="season">Тренувальний сезон з криптографії 2027</p>' +
      "</section>" +
      '<div class="frame">' +
        '<div class="grid">' +
          block("Тести", "<p>Два тренувальні варіанти 2027 року по 30 завдань із таймером, навігацією та розбором кожного розв'язання.</p><a class=\"btn\" href=\"#/tests\">До тестів</a>") +
          block("За темами", "<p>Усі " + nQ + " тестових завдань, згруповані за пунктами програми: відповідь і розв'язання одразу після вибору.</p><a class=\"btn\" href=\"#/train\">Обрати тему</a>", "example") +
          block("Минулі роки", "<p>Завдання ЄДКІ 2023 року за темами курсу — з відповідями та розв'язаннями.</p><a class=\"btn\" href=\"#/past\">До збірки</a>", "alert") +
        "</div><br>" +
        block("Що таке ЄДКІ для нашого курсу",
          "<p>Іспит складається зі 100 тестових завдань із чотирма варіантами відповіді, одна з яких правильна; на роботу відводиться 120 хвилин. " +
          "Розділ 6 програми «Криптографічний захист інформації» займає 11–15 % тесту, тобто приблизно 11–15 завдань.</p>" +
          "<p>Цей сайт охоплює лише ту частину розділу 6, яку ми розбирали на практиках: модулярну арифметику, теорію чисел, симетричні та асиметричні криптосистеми. " +
          'Решту розділів програми готуйте за <a href="https://train.edki.gov.ua/course/view.php?id=2" target="_blank" rel="noopener">офіційним тренажером</a>.</p>') +
        block("Зверніть увагу",
          "<p>Тренувальні варіанти 2027 — авторські завдання за програмою ЄДКІ, а не справжні екзаменаційні питання. Справжні завдання дивіться в розділі «Минулі роки».</p>", "alert") +
      "</div>",
      "1"
    );
  }

  function tests() {
    const cards = DATA.tests.map((t) => {
      const res = store.get("result:" + t.id, null);
      const run = store.get("run:" + t.id, null);
      const last = res ? "<p><b>Останній результат:</b> " + res.score + " із " + res.total + " (" + Math.round(100 * res.score / res.total) + " %)</p>" : "";
      const label = run ? "Продовжити" : res ? "Пройти ще раз" : "Розпочати";
      return block(t.variant,
        "<p>" + t.questions.length + " завдань · " + t.minutes + " хвилин · одна правильна відповідь із чотирьох.</p>" + last +
        '<a class="btn" href="#/test/' + t.id + '">' + label + "</a>", "", '<span class="badge">2027</span>');
    }).join("");
    render('<div class="frame"><h2 class="frametitle">Тести</h2>' +
      '<p class="lead">Темп такий самий, як на іспиті: 1,2 хвилини на завдання. Відповіді й розв\'язання відкриваються після завершення.</p>' +
      '<div class="grid">' + cards + "</div><br>" + meme("tests") + "</div>", "2");
  }

  /* ----- режим іспиту ----- */
  let tick = null;
  function stopTick() { if (tick) { clearInterval(tick); tick = null; } }

  function examPage(id) {
    const t = getTest(id);
    if (!t) return notFound();
    const run = store.get("run:" + id, null);
    if (run && run.finished) return examReview(t, run);
    if (run) return examRun(t, run);
    render('<div class="frame">' + gothic(t) +
      block("Правила",
        "<ul><li>" + t.questions.length + " завдань, на кожне — одна правильна відповідь із чотирьох.</li>" +
        "<li>Час — " + t.minutes + " хвилин; коли він спливе, тест завершиться автоматично.</li>" +
        "<li>До завдань можна повертатися в будь-якому порядку. Клавіші: 1–4 — вибір, ← → — перехід.</li>" +
        "<li>Калькулятор не потрібен: усі обчислення розраховані на аркуш паперу.</li></ul>") + meme("start") +
      '<div class="row"><button class="btn" id="start">Розпочати</button><a class="btn ghost" href="#/tests">Назад</a></div></div>', t.variant);
    document.getElementById("start").onclick = () => {
      const fresh = { start: Date.now(), answers: t.questions.map(() => null), cur: 0, finished: false };
      store.set("run:" + id, fresh);
      examRun(t, fresh);
    };
  }

  function gothic(t) {
    return '<div class="gothic"><div class="g1">Cryptography EDKI</div><div class="g2">' + t.title + " · " + t.variant + "</div></div>";
  }

  function examRun(t, run) {
    stopTick();
    const total = t.questions.length;
    const save = () => store.set("run:" + t.id, run);
    const remaining = () => t.minutes * 60 - (Date.now() - run.start) / 1000;

    function finish() {
      stopTick();
      run.finished = true;
      run.spent = Math.min(t.minutes * 60, (Date.now() - run.start) / 1000);
      save();
      const score = t.questions.reduce((n, q, i) => n + (run.answers[i] === q.a ? 1 : 0), 0);
      store.set("result:" + t.id, { score, total, at: Date.now() });
      markSolved(t.questions.map((q, i) => (run.answers[i] === q.a ? t.id + ":" + i : null)).filter(Boolean));
      examReview(t, run);
      window.scrollTo(0, 0);
    }

    function draw() {
      const i = run.cur;
      const answered = run.answers.filter((a) => a !== null).length;
      const nav = t.questions.map((_, k) =>
        '<button data-go="' + k + '" class="' + (run.answers[k] !== null ? "done " : "") + (k === i ? "cur" : "") + '" aria-label="Завдання ' + (k + 1) + '">' + (k + 1) + "</button>").join("");
      render('<div class="frame">' +
        '<div class="exambar"><div><b>' + t.variant + '</b> <span class="muted">· відповіли на ' + answered + " із " + total + '</span></div><div class="timer" id="timer"></div></div>' +
        questionCard(t.questions[i], { label: "Завдання " + (i + 1) + " із " + total, picked: run.answers[i] }) +
        '<div class="row between"><div class="row"><button class="btn ghost" id="prev"' + (i === 0 ? " disabled" : "") + ">← Назад</button>" +
        '<button class="btn ghost" id="next"' + (i === total - 1 ? " disabled" : "") + ">Далі →</button></div>" +
        '<button class="btn" id="finish">Завершити тест</button></div>' +
        '<div class="navgrid">' + nav + "</div></div>", (i + 1) + " / " + total);
      paintTimer();
      app.querySelectorAll("[data-opt]").forEach((b) => { b.onclick = () => pick(+b.dataset.opt); });
      app.querySelectorAll("[data-go]").forEach((b) => { b.onclick = () => go(+b.dataset.go); });
      document.getElementById("prev").onclick = () => go(i - 1);
      document.getElementById("next").onclick = () => go(i + 1);
      document.getElementById("finish").onclick = () => {
        const left = total - run.answers.filter((a) => a !== null).length;
        const btn = document.getElementById("finish");
        if (left > 0 && !btn.dataset.sure) {
          btn.dataset.sure = "1";
          btn.textContent = "Без відповіді: " + left + ". Завершити?";
          return;
        }
        finish();
      };
    }
    function paintTimer() {
      const el = document.getElementById("timer");
      if (!el) return;
      const r = remaining();
      el.textContent = "⏱ " + fmtTime(r);
      el.classList.toggle("low", r < 300);
    }
    function pick(k) { run.answers[run.cur] = run.answers[run.cur] === k ? null : k; save(); draw(); }
    function go(k) { if (k < 0 || k >= total) return; run.cur = k; save(); draw(); }

    examKeys = (e) => {
      if (e.key >= "1" && e.key <= "4") pick(+e.key - 1);
      else if (e.key === "ArrowRight") go(run.cur + 1);
      else if (e.key === "ArrowLeft") go(run.cur - 1);
    };
    if (remaining() <= 0) return finish();
    draw();
    tick = setInterval(() => { if (remaining() <= 0) finish(); else paintTimer(); }, 1000);
  }
  let examKeys = null;
  document.addEventListener("keydown", (e) => {
    if (examKeys && !e.ctrlKey && !e.metaKey && !e.altKey) examKeys(e);
  });

  function examReview(t, run) {
    stopTick();
    examKeys = null;
    const total = t.questions.length;
    const score = t.questions.reduce((n, q, i) => n + (run.answers[i] === q.a ? 1 : 0), 0);
    const groups = {};
    t.questions.forEach((q, i) => {
      const g = q.t.slice(0, 3);
      groups[g] = groups[g] || { ok: 0, n: 0 };
      groups[g].n++;
      if (run.answers[i] === q.a) groups[g].ok++;
    });
    const breakdown = Object.keys(groups).sort().map((g) =>
      '<div class="r"><span>' + g + " " + TOPIC_NAME[g] + "</span><b>" + groups[g].ok + " / " + groups[g].n + '</b><div class="bar"><i style="width:' + (100 * groups[g].ok / groups[g].n) + '%"></i></div></div>').join("");
    const nav = t.questions.map((q, k) =>
      '<button data-jump="' + k + '" class="' + (run.answers[k] === q.a ? "ok" : "bad") + '">' + (k + 1) + "</button>").join("");
    const cards = t.questions.map((q, i) =>
      '<div id="q' + i + '">' + questionCard(q, {
        label: "Завдання " + (i + 1) + (run.answers[i] === null ? " · без відповіді" : ""),
        picked: run.answers[i], reveal: true, locked: true
      }) + "</div>").join("");
    render('<div class="frame">' + gothic(t) +
      block("Результат",
        '<div class="row between"><div><div class="score">' + score + " / " + total + '</div><div class="muted">' + Math.round(100 * score / total) + " % правильних · витрачено " + fmtTime(run.spent || 0) + "</div></div>" +
        '<div class="row"><button class="btn" id="again">Пройти ще раз</button><button class="btn ghost" id="print">Друк</button></div></div>' +
        '<div class="breakdown">' + breakdown + "</div>") +
      meme(score / total >= 0.8 ? "result-high" : score / total >= 0.5 ? "result-mid" : "result-low") +
      '<div class="navgrid">' + nav + "</div>" + cards + "</div>", t.variant + " · розбір");
    document.getElementById("again").onclick = () => { store.del("run:" + t.id); examPage(t.id); window.scrollTo(0, 0); };
    document.getElementById("print").onclick = () => window.print();
    app.querySelectorAll("[data-jump]").forEach((b) => {
      b.onclick = () => document.getElementById("q" + b.dataset.jump).scrollIntoView({ block: "start" });
    });
  }

  /* ----- тренування за темами ----- */
  function train(topic) {
    const all = bank();
    const sel = topic || "all";
    const ids = sel.split(",");
    const match = (q) => sel === "all" || ids.indexOf(q.t) !== -1 || ids.indexOf(q.t.slice(0, 3)) !== -1;
    const floorIdx = FLOORS.findIndex((f) => f.ids.join(",") === sel);
    const count = (id) => all.filter((x) => x.q.t === id || x.q.t.slice(0, 3) === id).length;
    const chip = (id, label) => '<a class="chip' + (sel === id ? " on" : "") + '" href="#/train' + (id === "all" ? "" : "/" + id) + '">' + label + "</a>";
    let chips = chip("all", "Усі · " + all.length);
    PROGRAM.forEach((s) => {
      if (!count(s.id)) return;
      chips += chip(s.id, s.id + " · " + count(s.id));
      s.items.forEach((it) => { if (count(it.id)) chips += chip(it.id, it.id + " · " + count(it.id)); });
    });
    const list = all.filter((x) => match(x.q));
    const picked = {};
    const head = sel === "all" ? "Усі теми"
      : floorIdx !== -1 && FLOORS[floorIdx].ids.length > 1 ? "Поверх " + (floorIdx + 1) + ". " + FLOORS[floorIdx].name + " (п. " + ids.join(", ") + ")"
      : sel + " " + (TOPIC_NAME[sel] || "");

    function draw(keepScroll) {
      const y = window.scrollY;
      const okN = list.filter((x) => picked[x.key] === x.q.a).length;
      const doneN = list.filter((x) => picked[x.key] !== undefined).length;
      render('<div class="frame"><h2 class="frametitle">Тренування за темами</h2>' +
        '<div class="chips">' + chips + "</div>" +
        '<p class="lead"><b>' + head + "</b></p>" +
        '<p class="muted">Розв\'язано ' + doneN + " із " + list.length + (doneN ? " · правильно " + okN : "") + "</p>" +
        list.map((x, i) => questionCard(x.q, {
          key: x.key, label: "№ " + (i + 1) + " · " + x.from,
          picked: picked[x.key], reveal: picked[x.key] !== undefined, locked: picked[x.key] !== undefined
        })).join("") + "</div>", list.length + " завдань");
      app.querySelectorAll(".q").forEach((card) => {
        card.querySelectorAll("[data-opt]").forEach((b) => {
          b.onclick = () => {
            const key = card.dataset.key;
            picked[key] = +b.dataset.opt;
            const item = list.find((x) => x.key === key);
            if (item && item.q.a === picked[key]) markSolved([key]);
            draw(true);
          };
        });
      });
      if (keepScroll) window.scrollTo(0, y);
    }
    draw(false);
  }

  /* ----- минулі роки ----- */
  const STATUS = {
    official: "офіційний комплект",
    paraphrase: "переказ офіційних зразків",
    course: "матеріали курсу"
  };
  function past() {
    const sets = DATA.past.map((p) => {
      const links = p.links.length
        ? '<ul class="links">' + p.links.map((l) => '<li><a href="' + l.url + '" target="_blank" rel="noopener">' + l.label + "</a></li>").join("") + "</ul>"
        : "";
      const items = p.items.map((q, i) => '<div data-set="' + p.id + '" data-i="' + i + '">' + questionCard(q, { label: "Завдання " + (q.n || i + 1) }) + "</div>").join("");
      const kind = p.status === "empty" ? "plain" : p.status === "course" ? "example" : p.status === "paraphrase" ? "alert" : "";
      return block(p.year + " · " + p.title, "<p>" + p.note + "</p>" + links, kind, '<span class="badge">' + STATUS[p.status] + "</span>") + items;
    }).join("");
    render('<div class="frame"><h2 class="frametitle">Минулі роки</h2>' +
      '<p class="lead">Завдання попередніх років із тем курсу: теорія чисел, симетрична та асиметрична криптографія. Оберіть відповідь, щоб побачити розв\'язання.</p>' +
      sets + meme("past") + "</div>", "збірка");
    app.querySelectorAll("[data-set]").forEach((wrap) => {
      const p = DATA.past.find((x) => x.id === wrap.dataset.set);
      const q = p.items[+wrap.dataset.i];
      if (!isMcq(q)) return;
      wrap.querySelectorAll("[data-opt]").forEach((b) => {
        b.onclick = () => {
          wrap.innerHTML = questionCard(q, { label: "Завдання " + (q.n || +wrap.dataset.i + 1), picked: +b.dataset.opt, reveal: true, locked: true });
          typeset(wrap);
        };
      });
    });
  }

  /* ----- програма ----- */
  function program() {
    const all = bank();
    const count = (id) => all.filter((x) => x.q.t === id).length;
    let rows = "";
    PROGRAM.forEach((s) => {
      rows += '<tr class="sec"><td>' + s.id + "</td><td>" + s.name + '</td><td class="c">' + s.weight + "</td><td></td><td></td></tr>";
      s.items.forEach((it) => {
        const n = count(it.id);
        rows += "<tr><td>" + it.id + "</td><td>" + it.name + '</td><td class="c">' + it.level + "</td><td>" + it.src + '</td><td class="c">' +
          (n ? '<a href="#/train/' + it.id + '">' + n + "</a>" : "—") + "</td></tr>";
      });
    });
    render('<div class="frame"><h2 class="frametitle">Програма: розділ 6</h2>' +
      '<p class="lead">Криптографічний захист інформації — 11–15 % завдань іспиту. Для кожного пункту програма вказує найвищий когнітивний рівень, на якому його треба засвоїти (A, B або C).</p>' +
      '<div style="overflow-x:auto"><table class="prog"><thead><tr><th>Пункт</th><th>Тема</th><th>Вага / рівень</th><th>Де розбирали</th><th>Завдань</th></tr></thead><tbody>' + rows + "</tbody></table></div><br>" +
      block("Джерело", '<p>Програма ЄДКІ зі спеціальності «Кібербезпека» на першому (бакалаврському) рівні, затверджена наказом МОН України № 980 від 04.11.2022. ' +
        '<a href="https://osvita.ua/doc/files/news/934/93407/125_Kiberbezpeka-vid_04_11_2022-980.pdf" target="_blank" rel="noopener">Повний текст (PDF)</a></p>') +
      "</div>", "програма");
  }

  function notFound() {
    render('<div class="frame"><h2 class="frametitle">Сторінку не знайдено</h2><a class="btn" href="#/">На головну</a></div>', "");
  }

  /* ---------- маршрутизація ---------- */
  function route() {
    stopTick();
    examKeys = null;
    const parts = decodeURIComponent(location.hash.replace(/^#\/?/, "")).split("/").filter(Boolean);
    const page = parts[0] || "home";
    document.querySelectorAll("#nav a").forEach((a) => {
      a.classList.toggle("active", a.dataset.nav === page || (page === "test" && a.dataset.nav === "tests"));
    });
    if (page === "home") home();
    else if (page === "tests") tests();
    else if (page === "test") examPage(parts[1]);
    else if (page === "train") train(parts[1]);
    else if (page === "past") past();
    else if (page === "program") program();
    else notFound();
    window.scrollTo(0, 0);
  }
  window.addEventListener("hashchange", route);
  window.addEventListener("load", route);
})();
