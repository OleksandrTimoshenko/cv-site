(() => {
  'use strict';

  const STORAGE_THEME = 'site.theme';
  const STORAGE_LANG = 'site.lang';

  const UI_STRINGS = {
    en: {
      brand: 'oleksandr@career:~$',
      summaryStatus: '● active (loaded)',
      experienceTitle: 'Experience',
      skillsTitle: 'Skills',
      hardSkillsLabel: 'hard skills',
      softSkillsLabel: 'soft skills',
      educationTitle: 'Education',
      eduExtraLabel: 'additional education',
      languagesLabel: 'languages',
      hobbiesLabel: 'hobbies',
      contactsTitle: 'Contacts',
      botNote: '# email / phone are decoded client-side on click — not present as plain text in the page source.',
      revealEmail: 'reveal email',
      revealPhone: 'reveal phone',
      copied: 'copied',
      linkedin: 'LinkedIn',
      github: 'GitHub',
      salesforce: 'Salesforce Trailhead',
      email: 'email',
      phone: 'phone',
      uptimePrefix: 'career.uptime:',
      yearsSuffix: 'yrs'
    },
    ua: {
      brand: 'oleksandr@career:~$',
      summaryStatus: '● active (loaded)',
      experienceTitle: 'Досвід',
      skillsTitle: 'Навички',
      hardSkillsLabel: 'технічні навички',
      softSkillsLabel: "м'які навички",
      educationTitle: 'Освіта',
      eduExtraLabel: 'додаткова освіта',
      languagesLabel: 'мови',
      hobbiesLabel: 'хобі',
      contactsTitle: 'Контакти',
      botNote: '# email і телефон декодуються на стороні браузера по кліку — у вихідному коді сторінки їх немає у відкритому вигляді.',
      revealEmail: 'показати email',
      revealPhone: 'показати телефон',
      copied: 'скопійовано',
      linkedin: 'LinkedIn',
      github: 'GitHub',
      salesforce: 'Salesforce Trailhead',
      email: 'email',
      phone: 'телефон',
      uptimePrefix: 'career.uptime:',
      yearsSuffix: 'р.'
    }
  };

  const state = {
    lang: localStorage.getItem(STORAGE_LANG) || 'en',
    theme: localStorage.getItem(STORAGE_THEME) || 'dark',
    data: null
  };

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    document.getElementById('themeValue').textContent = theme;
    document.getElementById('themeToggle').setAttribute('aria-pressed', theme === 'dark');
    localStorage.setItem(STORAGE_THEME, theme);
  }

  function applyLangAttr(lang) {
    document.documentElement.setAttribute('lang', lang === 'ua' ? 'uk' : 'en');
    document.getElementById('langValue').textContent = lang;
    document.getElementById('langToggle').setAttribute('aria-pressed', lang === 'ua');
    localStorage.setItem(STORAGE_LANG, lang);
  }

  async function loadContent(lang) {
    const res = await fetch(`content/content.${lang}.json`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`Failed to load content.${lang}.json`);
    return res.json();
  }

  function b64decode(b64) {
    try {
      return decodeURIComponent(escape(atob(b64)));
    } catch (e) {
      return atob(b64);
    }
  }

  function el(tag, opts = {}) {
    const node = document.createElement(tag);
    if (opts.class) node.className = opts.class;
    if (opts.text) node.textContent = opts.text;
    if (opts.html) node.innerHTML = opts.html;
    if (opts.attrs) Object.entries(opts.attrs).forEach(([k, v]) => node.setAttribute(k, v));
    return node;
  }

  function typeHero(lines) {
    const container = document.getElementById('typedBody');
    container.innerHTML = '';
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      lines.forEach((line, i) => {
        const p = el('p', { class: 'terminal__line' });
        p.innerHTML = (i === 0 ? '<span class="terminal__prompt">$</span> ' : '') + escapeHtml(line);
        container.appendChild(p);
      });
      return;
    }

    let lineIndex = 0;
    let charIndex = 0;
    let currentP = null;

    function step() {
      if (lineIndex >= lines.length) {
        const cursor = el('span', { class: 'terminal__cursor' });
        if (currentP) currentP.appendChild(cursor);
        return;
      }
      if (charIndex === 0) {
        currentP = el('p', { class: 'terminal__line' });
        if (lineIndex === 0 || lineIndex === 2) {
          const prompt = el('span', { class: 'terminal__prompt', text: '$ ' });
          currentP.appendChild(prompt);
        }
        container.appendChild(currentP);
      }
      const line = lines[lineIndex];
      if (charIndex < line.length) {
        currentP.appendChild(document.createTextNode(line[charIndex]));
        charIndex += 1;
        setTimeout(step, 14 + Math.random() * 22);
      } else {
        lineIndex += 1;
        charIndex = 0;
        setTimeout(step, 260);
      }
    }
    step();
  }

  function escapeHtml(str) {
    const d = document.createElement('div');
    d.textContent = str;
    return d.innerHTML;
  }

  function renderSummary(data, ui) {
    document.getElementById('summaryUnitLabel').textContent = data.summary.unit;
    document.getElementById('summaryUnitName').textContent = data.summary.unit;
    document.getElementById('summaryStatus').textContent = ui.summaryStatus;
    document.getElementById('summaryText').textContent = data.summary.text;
  }

  function renderExperience(data, ui) {
    document.getElementById('experienceTitle').textContent = ui.experienceTitle;
    const listEl = document.getElementById('experienceList');
    listEl.innerHTML = '';
    data.experience.forEach((job) => {
      const unit = el('div', { class: 'unit' });

      const head = el('div', { class: 'unit__head' });
      const name = el('span', { class: 'unit__name' });
      name.appendChild(el('span', { class: 'dot' }));
      name.appendChild(document.createTextNode(' ' + job.company.toLowerCase().replace(/\s+/g, '-') + '.service'));
      const status = el('span', { class: 'unit__status', text: '● active (exited)' });
      head.appendChild(name);
      head.appendChild(status);
      unit.appendChild(head);

      const body = el('div', { class: 'unit__body' });
      const exp = el('div', { class: 'exp' });
      const row = el('div', { class: 'exp__row' });
      const roleWrap = el('span');
      roleWrap.appendChild(el('span', { class: 'exp__role', text: job.role + ' ' }));
      roleWrap.appendChild(el('span', { class: 'exp__company', text: '@ ' + job.company }));
      row.appendChild(roleWrap);
      row.appendChild(el('span', { class: 'exp__period mono', text: job.period }));
      exp.appendChild(row);

      const log = el('ul', { class: 'exp__log' });
      job.log.forEach((entry) => log.appendChild(el('li', { text: entry })));
      exp.appendChild(log);

      body.appendChild(exp);
      unit.appendChild(body);
      listEl.appendChild(unit);
    });
  }

  function renderSkills(data, ui) {
    document.getElementById('skillsTitle').textContent = ui.skillsTitle;
    document.getElementById('skillsUnitName').textContent = data.skills.unit;
    document.getElementById('skillsStatus').textContent = ui.summaryStatus;
    document.getElementById('hardSkillsLabel').textContent = ui.hardSkillsLabel;
    document.getElementById('softSkillsLabel').textContent = ui.softSkillsLabel;

    const hardGrid = document.getElementById('hardSkillsGrid');
    hardGrid.innerHTML = '';
    data.skills.hard.forEach((s) => hardGrid.appendChild(el('span', { class: 'pill', text: s })));

    const softList = document.getElementById('softSkillsList');
    softList.innerHTML = '';
    data.skills.soft.forEach((s) => softList.appendChild(el('li', { text: s })));
  }

  function renderEducation(data, ui) {
    document.getElementById('educationTitle').textContent = ui.educationTitle;
    document.getElementById('educationUnitName').textContent = data.education.unit;
    document.getElementById('educationStatus').textContent = ui.summaryStatus;
    document.getElementById('eduUni').textContent = data.education.university;
    document.getElementById('eduPeriod').textContent = data.education.period;

    const degrees = document.getElementById('eduDegrees');
    degrees.innerHTML = '';
    data.education.degrees.forEach((d) => {
      const li = el('li');
      const strong = el('strong', { text: d.level + ': ' });
      li.appendChild(strong);
      li.appendChild(document.createTextNode(d.field));
      degrees.appendChild(li);
    });

    document.getElementById('eduExtraLabel').textContent = ui.eduExtraLabel;
    const extra = document.getElementById('eduExtraList');
    extra.innerHTML = '';
    data.education.additional.forEach((item) => extra.appendChild(el('li', { text: item })));

    document.getElementById('languagesLabel').textContent = ui.languagesLabel;
    const langs = document.getElementById('languagesList');
    langs.innerHTML = '';
    data.languages.forEach((l) => langs.appendChild(el('li', { text: `${l.name} — ${l.level}` })));

    document.getElementById('hobbiesLabel').textContent = ui.hobbiesLabel;
    const hobbies = document.getElementById('hobbiesList');
    hobbies.innerHTML = '';
    data.hobbies.forEach((h) => hobbies.appendChild(el('li', { text: h })));
  }

  function makeRevealRow(label, decodedValue, buttonLabel, ui, kind) {
    const row = el('div', { class: 'contactrow' });
    row.appendChild(el('span', { class: 'contactrow__label mono', text: label }));

    const valueWrap = el('span', { class: 'contactrow__value' });
    const btn = el('button', { class: 'revealbtn', text: buttonLabel, attrs: { type: 'button' } });

    btn.addEventListener('click', () => {
      valueWrap.innerHTML = '';
      const link = el('a', {
        text: decodedValue,
        attrs: {
          href: kind === 'email' ? `mailto:${decodedValue}` : `tel:${decodedValue.replace(/\s+/g, '')}`
        }
      });
      valueWrap.appendChild(link);

      const copyBtn = el('button', { class: 'revealbtn', text: '⧉', attrs: { type: 'button', 'aria-label': 'copy' } });
      copyBtn.style.padding = '2px 8px';
      copyBtn.style.marginLeft = '8px';
      copyBtn.addEventListener('click', () => {
        navigator.clipboard?.writeText(decodedValue).then(() => {
          copyBtn.textContent = '✓';
          setTimeout(() => (copyBtn.textContent = '⧉'), 1200);
        });
      });
      valueWrap.appendChild(copyBtn);
    }, { once: true });

    valueWrap.appendChild(btn);
    row.appendChild(valueWrap);
    return row;
  }

  function renderContacts(data, ui) {
    document.getElementById('contactsTitle').textContent = ui.contactsTitle;
    document.getElementById('contactsUnitName').textContent = data.contacts.unit;
    document.getElementById('contactsStatus').textContent = ui.summaryStatus;
    document.getElementById('botNote').textContent = ui.botNote;

    const grid = document.getElementById('contactGrid');
    grid.innerHTML = '';

    grid.appendChild(makeRevealRow(ui.email, b64decode(data.contacts.email_b64), ui.revealEmail, ui, 'email'));
    grid.appendChild(makeRevealRow(ui.phone, b64decode(data.contacts.phone_b64), ui.revealPhone, ui, 'tel'));

    const linkedinRow = el('div', { class: 'contactrow' });
    linkedinRow.appendChild(el('span', { class: 'contactrow__label mono', text: ui.linkedin }));
    const linkedinVal = el('span', { class: 'contactrow__value' });
    linkedinVal.appendChild(el('a', { text: data.contacts.linkedin.replace('https://', ''), attrs: { href: data.contacts.linkedin, target: '_blank', rel: 'noopener' } }));
    linkedinRow.appendChild(linkedinVal);
    grid.appendChild(linkedinRow);

    const githubRow = el('div', { class: 'contactrow' });
    githubRow.appendChild(el('span', { class: 'contactrow__label mono', text: ui.github }));
    const githubVal = el('span', { class: 'contactrow__value' });
    githubVal.appendChild(el('a', { text: data.contacts.github.replace('https://', ''), attrs: { href: data.contacts.github, target: '_blank', rel: 'noopener' } }));
    githubRow.appendChild(githubVal);
    grid.appendChild(githubRow);

    const sfRow = el('div', { class: 'contactrow' });
    sfRow.appendChild(el('span', { class: 'contactrow__label mono', text: ui.salesforce }));
    const sfVal = el('span', { class: 'contactrow__value' });
    sfVal.appendChild(el('a', { text: data.contacts.salesforce.replace('https://', ''), attrs: { href: data.contacts.salesforce, target: '_blank', rel: 'noopener' } }));
    sfRow.appendChild(sfVal);
    grid.appendChild(sfRow);
  }

  function renderFooter(data, ui) {
    const since = data.footer.since;
    const now = new Date();
    const years = (now.getFullYear() - since) + (now.getMonth() >= 8 ? 0 : 0); // simple year diff
    document.getElementById('uptimeLine').textContent = `${ui.uptimePrefix} ${years}${ui.yearsSuffix} (since ${since})`;
    document.getElementById('builtWithLine').textContent = data.footer.builtWith;
  }

  function render(data, lang) {
    const ui = UI_STRINGS[lang];
    document.getElementById('brandText').textContent = ui.brand;
    document.getElementById('heroName').textContent = data.meta.name;
    document.getElementById('heroRole').textContent = data.meta.role;
    document.title = `${data.meta.name} — ${data.meta.role}`;

    renderSummary(data, ui);
    renderExperience(data, ui);
    renderSkills(data, ui);
    renderEducation(data, ui);
    renderContacts(data, ui);
    renderFooter(data, ui);

    typeHero(data.meta.typedLines);
  }

  async function switchLang(lang) {
    state.lang = lang;
    applyLangAttr(lang);
    try {
      state.data = await loadContent(lang);
      render(state.data, lang);
    } catch (e) {
      console.error(e);
    }
  }

  function switchTheme(theme) {
    state.theme = theme;
    applyTheme(theme);
  }

  function initControls() {
    document.getElementById('langToggle').addEventListener('click', () => {
      switchLang(state.lang === 'en' ? 'ua' : 'en');
    });
    document.getElementById('themeToggle').addEventListener('click', () => {
      switchTheme(state.theme === 'dark' ? 'light' : 'dark');
    });
  }

  async function init() {
    applyTheme(state.theme);
    applyLangAttr(state.lang);
    initControls();
    try {
      state.data = await loadContent(state.lang);
      render(state.data, state.lang);
    } catch (e) {
      console.error(e);
      document.getElementById('typedBody').textContent = 'error: failed to load content.json';
    }
  }

  document.addEventListener('DOMContentLoaded', init);
})();
