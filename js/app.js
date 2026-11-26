/*
 * МАИ Вики · демо SPA без фреймворков.
 * ВАЖНО: предложения, решения, файлы и отзывы хранятся только в ЭТОМ браузере.
 * Для общей работы пользователей необходимо подключить сервер/API и авторизацию модератора.
 */
(() => {
  'use strict';
  const DATA = window.MAI_DATA;
  if (!DATA) throw new Error('Не загружен js/data.js');

  const main = document.getElementById('content');
  const nav = document.querySelector('.bottom-nav');
  const themeButton = document.getElementById('theme-toggle');
  const toastNode = document.getElementById('toast');
  const KEYS = { proposals: 'mai-wiki-proposals-v1', tasks: 'mai-wiki-tasks-v1', feedback: 'mai-wiki-feedback-v1', theme: 'mai-wiki-theme-v1' };
  const MAX_DEMO_FILE_BYTES = 5 * 1024 * 1024;
  let toastTimeout;

  const PATHS = {
    home: 'M3 10.5 12 3l9 7.5V21h-6v-6H9v6H3z',
    book: 'M4 5.5c2.7-1.3 5.3-1.3 8 0v15c-2.7-1.3-5.3-1.3-8 0V5.5Zm16 0c-2.7-1.3-5.3-1.3-8 0v15c2.7-1.3 5.3-1.3 8 0V5.5Z',
    plus: 'M12 5v14M5 12h14',
    calendar: 'M6 3v4m12-4v4M3 9h18M5 5h14a2 2 0 0 1 2 2v13a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V7a2 2 0 0 1 2-2Z',
    info: 'M12 17v-5m0-4h.01M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z',
    search: 'M20 20l-4.3-4.3m2-5.2a7.2 7.2 0 1 1-14.4 0 7.2 7.2 0 0 1 14.4 0Z',
    arrow: 'M4 12h16m-6-6 6 6-6 6',
    chevron: 'm6 9 6 6 6-6',
    left: 'm15 18-6-6 6-6',
    clock: 'M12 7v5l3 2m7-2a10 10 0 1 1-20 0 10 10 0 0 1 20 0Z',
    shield: 'M12 2 4 5v6c0 5.3 3.3 9.1 8 11 4.7-1.9 8-5.7 8-11V5l-8-3Zm-4 10 3 3 5-6',
    link: 'M9 15l6-6M7 17H6a4 4 0 0 1 0-8h4m4 0h4a4 4 0 0 1 0 8h-4',
    document: 'M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8l-6-6Zm0 0v6h6M8 13h8M8 17h8',
    check: 'm5 12 4 4L19 6',
    alert: 'M12 9v4m0 4h.01M10.3 3.5 2 19a2 2 0 0 0 1.8 3h16.4a2 2 0 0 0 1.8-3L13.7 3.5a2 2 0 0 0-3.4 0Z',
    sun: 'M12 3v2m0 14v2M3 12h2m14 0h2M5.6 5.6 7 7m10 10 1.4 1.4M18.4 5.6 17 7M7 17l-1.4 1.4M16 12a4 4 0 1 1-8 0 4 4 0 0 1 8 0Z',
    moon: 'M20.5 14A8.5 8.5 0 0 1 10 3.5 9 9 0 1 0 20.5 14Z',
    trash: 'M4 7h16M10 3h4m-8 4 1 14h10l1-14M10 11v6m4-6v6',
    users: 'M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2m10-12a4 4 0 1 1-8 0 4 4 0 0 1 8 0Zm10 12v-2a4 4 0 0 0-3-3.9M16 5.1a4 4 0 0 1 0 7.8',
    filter: 'M4 6h16M7 12h10m-7 6h4',
    inbox: 'M4 4h16l2 11v5H2v-5L4 4Zm-2 11h7l2 3h2l2-3h7',
    upload: 'M12 16V3m-5 5 5-5 5 5M3 17v4h18v-4',
    clipboard: 'M9 4h6m-7 0H6a2 2 0 0 0-2 2v14h16V6a2 2 0 0 0-2-2h-2M9 2h6v4H9V2Zm0 10h7m-7 4h7',
    message: 'M21 11.5a8.5 8.5 0 0 1-8.5 8.5 9 9 0 0 1-4-.95L3 21l1.95-5.5A8.5 8.5 0 1 1 21 11.5Z',
    external: 'M13 5h6v6m0-6-9 9M19 14v5H5V5h5',
    spark: 'm12 2 1.9 7.1L21 11l-7.1 1.9L12 20l-1.9-7.1L3 11l7.1-1.9L12 2Z',
    rotate: 'M3 11a9 9 0 1 1 3 7M3 5v6h6',
    download: 'M12 3v12m-5-5 5 5 5-5M4 17v4h16v-4',
    layers: 'm12 2 9 5-9 5-9-5 9-5Zm-9 10 9 5 9-5m-18 5 9 5 9-5'
  };

  function icon(name, cls='') {
    return `<svg ${cls ? `class="${esc(cls)}"` : ''} viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="${PATHS[name] || PATHS.info}"/></svg>`;
  }
  function esc(value) {
    return String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  }
  function norm(value) {
    return String(value ?? '').toLocaleLowerCase('ru-RU').replaceAll('ё','е').normalize('NFKC').trim();
  }
  function safeUrl(value) {
    try { const u = new URL(String(value), location.href); return /^https?:$/.test(u.protocol) ? u.href : ''; } catch (_) { return ''; }
  }
  function externalLink(raw, title) {
    const url = safeUrl(raw);
    return url ? `<a href="${esc(url)}" target="_blank" rel="noopener noreferrer">${esc(title || url)} <span class="icon-inline">${icon('external')}</span></a>` : `<span class="anchor-small">${esc(title || '[ссылка не добавлена]')}</span>`;
  }
  function dateText(iso, missing='Не проверялось') {
    if (!iso) return missing;
    const [y,m,d] = String(iso).slice(0,10).split('-');
    if (!y || !m || !d) return missing;
    return `${d}.${m}.${y}`;
  }
  function dtText(iso) {
    try { return new Date(iso).toLocaleString('ru-RU',{dateStyle:'short',timeStyle:'short'}); } catch (_) {return 'Дата неизвестна';}
  }
  function statusBadge(key, lookup=DATA.statuses) {
    const entry = lookup[key] || lookup['needs-clarification'] || lookup.pending;
    return `<span class="status ${esc(entry.tone)}">${esc(entry.label)}</span>`;
  }
  function readJson(key, fallback=[]) {
    try {const value = localStorage.getItem(key); return value ? JSON.parse(value) : fallback;} catch (_) {return fallback;}
  }
  function saveJson(key, value) { try { localStorage.setItem(key, JSON.stringify(value)); return true; } catch (_) { return false; } }
  function notify(text) {
    clearTimeout(toastTimeout);
    toastNode.textContent=text;
    toastNode.classList.add('show');
    toastTimeout=setTimeout(() => toastNode.classList.remove('show'), 4000);
  }
  function heading(kicker,title,subtitle='') { return `<div class="page-heading"><span class="eyebrow">${esc(kicker)}</span><h1>${esc(title)}</h1>${subtitle?`<p>${esc(subtitle)}</p>`:''}</div>`; }
  function field(label,name,body,hint='') { return `<div class="field"><label for="${esc(name)}">${label}</label>${body}${hint?`<p class="field-hint">${hint}</p>`:''}</div>`; }
  function emptyState(title,message,actionText='Предложить материал',href='#suggest') {
    return `<div class="empty-state"><span class="empty-icon">${icon('search')}</span><h3>${esc(title)}</h3><p>${esc(message)}</p><a class="btn secondary" href="${esc(href)}">${esc(actionText)} ${icon('arrow')}</a></div>`;
  }
  function disciplineOptions(includeEmpty=true) {
    return `${includeEmpty ? '<option value="">Выберите карточку</option>' : ''}${DATA.disciplines.map(d=>`<option value="${esc(d.id)}">Карточка ${String(d.cardNumber).padStart(2,'0')} · ${esc(d.name)}</option>`).join('')}`;
  }
  function cardHtml(d) {
    return `<article class="discipline-card">
      <div class="card-top"><span class="card-symbol">${icon('book')}</span><span class="card-number">КАРТОЧКА ${String(d.cardNumber).padStart(2,'0')}</span></div>
      <div><h3>${esc(d.name)}</h3><p class="card-muted">${esc(d.direction)} · ${esc(d.semester)} · ${esc(d.groups.join(', '))}</p></div>
      <div class="card-footer">${statusBadge(d.status)}${d.demo?'<span class="demo-tag">Демо-данные</span>':''}</div>
      <div class="card-meta">${icon('clock')} Проверено: ${esc(dateText(d.lastCheckedAt))}<a class="card-open" href="#discipline/${encodeURIComponent(d.id)}" aria-label="Открыть карточку ${String(d.cardNumber).padStart(2,'0')}">Открыть ${icon('arrow')}</a></div>
    </article>`;
  }
  function searchable(d) {
    const values=[d.name,d.id,d.cardNumber,d.description,d.semester,d.course,d.direction,d.teacher,d.groups.join(' '),d.admission,d.grading,d.deadlines,d.officialSource?.title,d.officialSource?.url,d.publicationBasis,(d.keywords||[]).join(' ')];
    (d.resources||[]).forEach(r=>values.push(r.title,r.author,r.url));
    (d.requiredWorks||[]).forEach(r=>values.push(r.name,r.source,r.sourceUrl));
    return norm(values.filter(Boolean).join(' '));
  }
  function search(q) {
    const parts=norm(q).split(/\s+/).filter(Boolean);
    return parts.length ? DATA.disciplines.filter(d=>parts.every(part=>searchable(d).includes(part))) : [];
  }
  function faqHtml(limit=DATA.faq.length) {
    return `<div class="faq-list">${DATA.faq.slice(0,limit).map(item=>`<details class="faq-item"><summary>${esc(item.question)} ${icon('chevron')}</summary><p>${esc(item.answer)}</p></details>`).join('')}</div>`;
  }
  function localNotice(){ return `<div class="notice warning">${icon('alert')}<div><strong>Демо-режим, только этот браузер.</strong> Без сервера предложения, решения модератора, отзывы и задачи не синхронизируются между пользователями или устройствами. Это не рабочая общая очередь.</div></div>`; }

  function renderHome() {
    const recent=DATA.disciplines.filter(d=>d.lastCheckedAt).sort((a,b)=>String(b.lastCheckedAt).localeCompare(String(a.lastCheckedAt))).slice(0,3);
    const show=recent.length?recent:DATA.disciplines.slice(0,3);
    return `<section class="hero" aria-labelledby="hero-title">
      <div class="hero-grid"><div>
        <span class="eyebrow">СТУДЕНЧЕСКИЙ ПРОЕКТ · ИНСТИТУТ №8</span>
        <h1 id="hero-title">Учебные материалы.<br><span>В одном месте.</span></h1>
        <p class="hero-lead">Ищите материалы по дисциплинам и проверяйте источник, актуальность и статус. База пока наполняется.</p>
        <div class="search-shell">${icon('search')}<input id="home-search" type="search" inputmode="search" autocomplete="off" aria-label="Поиск по базе знаний" placeholder="Поиск по дисциплинам, ссылкам, ключевым словам…"><span class="search-kbd">Поиск</span></div>
        <div class="hero-help"><div class="hero-help-label">Быстрые подсказки</div><div class="chip-row">${['Сроки','Требования к работам','Учебники и ссылки','Конспекты'].map(v=>`<button type="button" class="chip" data-quick-search="${esc(v)}">${esc(v)}</button>`).join('')}</div></div>
      </div><aside class="hero-aside" aria-hidden="true"><div class="preview-card"><small>ПРОВЕРЯЙТЕ ИСТОЧНИКИ</small><strong>Карточка дисциплины</strong><div class="preview-row">${icon('link')} Источник материала</div><div class="preview-row">${icon('calendar')} Дата проверки</div><div class="preview-row">${icon('shield')} Статус достоверности</div></div></aside></div>
    </section>
    <section class="section" id="home-results-section" hidden aria-live="polite"><div class="section-heading"><div><h2>Результаты поиска</h2><p id="search-summary"></p></div><button class="btn ghost" id="clear-search" type="button">Очистить</button></div><div class="grid-cards" id="home-results"></div></section>
    <section class="section" id="recent-section"><div class="section-heading"><div><h2>Недавно обновлённые</h2><p>${recent.length?'Карточки с указанной датой проверки':'Подтверждённых обновлений ещё нет. Ниже — карточки-заготовки.'}</p></div><a class="section-link" href="#catalog">Вся база ${icon('arrow')}</a></div><div class="grid-cards">${show.map(cardHtml).join('')}</div></section>
    <section class="section"><div class="section-heading"><div><h2>Как пользоваться базой</h2><p>Три ориентира, чтобы не принять черновик за правило</p></div></div><div class="mini-steps"><div class="step"><span class="step-index">01 / НАЙТИ</span><h3>Выберите дисциплину</h3><p>Убедитесь, что карточка относится к вашей группе и семестру.</p></div><div class="step"><span class="step-index">02 / ПРОВЕРИТЬ</span><h3>Посмотрите источник</h3><p>Дата проверки и статус помогают оценить актуальность материала.</p></div><div class="step"><span class="step-index">03 / УТОЧНИТЬ</span><h3>Сообщите о неточности</h3><p>Предложите материал или оставьте обратную связь для модерации.</p></div></div></section>
    <section class="section"><div class="section-heading"><div><h2>Частые вопросы</h2><p>Коротко о расписании, статусах и материалах</p></div></div>${faqHtml()}</section>
    <section class="section"><div class="cta-panel"><div><h3>Нашли ошибку или хотите оставить отзыв?</h3><p>Расскажите, что искали и насколько полезна база. Без ФИО, телефонов и почты.</p></div><a class="btn" href="#feedback">Оставить отзыв ${icon('arrow')}</a></div></section>`;
  }

  function renderCatalog() {
    const semesters=[...new Set(DATA.disciplines.map(d=>d.semester))];
    return `${heading('БАЗА ЗНАНИЙ','Каталог дисциплин','Проверяйте статус и дату: заготовки не являются подтверждёнными требованиями.')}
      <div class="notice warning">${icon('alert')}<div><strong>Пока только демо-данные.</strong> Все 10 карточек требуют уточнения. Названия, ссылки, сроки и требования будут добавлены после проверки источников.</div></div>
      <div class="filters" role="search" aria-label="Фильтры дисциплин">
        ${field('По названию или материалам','catalog-q','<input id="catalog-q" type="search" placeholder="Найти карточку…" autocomplete="off">')}
        ${field('Семестр','catalog-semester',`<select id="catalog-semester"><option value="">Все семестры</option>${semesters.map(s=>`<option value="${esc(s)}">${esc(s)}</option>`).join('')}</select>`)}
        ${field('Статус','catalog-status',`<select id="catalog-status"><option value="">Все статусы</option>${Object.entries(DATA.statuses).map(([v,st])=>`<option value="${esc(v)}">${esc(st.label)}</option>`).join('')}</select>`)}
      </div><p class="results-note" id="catalog-count" role="status"></p><div class="grid-cards" id="catalog-results"></div>`;
  }

  function infoRow(label, content, muted=false) { return `<div class="info-row"><dt>${esc(label)}</dt><dd ${muted?'class="muted"':''}>${content}</dd></div>`; }
  function renderDiscipline(id) {
    const d=DATA.disciplines.find(x=>x.id===id);
    if (!d) return `${heading('БАЗА ЗНАНИЙ','Карточка не найдена')} ${emptyState('Нет такой карточки','Вернитесь в каталог и выберите существующую запись.','Перейти в каталог','#catalog')}`;
    const resources=(d.resources||[]).map(r=>`<div class="record"><strong>${esc(r.author)} · ${esc(r.title)}</strong><p>Ссылка: ${externalLink(r.url,'Открыть ресурс')}</p><small>Проверка ссылки: ${esc(dateText(r.linkCheckedAt))}</small></div>`).join('') || '<p>Ресурсы ещё не внесены.</p>';
    const works=(d.requiredWorks||[]).map(w=>`<div class="record"><strong>${esc(w.name)}</strong><p>Основание: ${esc(w.source)}</p><small>${w.sourceUrl?externalLink(w.sourceUrl,'Открыть источник'):'Подтверждённая ссылка не указана'}</small></div>`).join('')||'<p>Работы ещё не указаны.</p>';
    const history=(d.history||[]).map(e=>`<li>${esc(dateText(e.date,'Дата не указана'))} · ${esc(e.change)}<small>Основание: ${esc(e.reason)} · Ответственный: ${esc(e.editor)}</small></li>`).join('')||'<li>Изменений пока нет. История начнётся после внесения подтверждённых данных.</li>';
    const localAccepted=readJson(KEYS.proposals).filter(p=>p.disciplineId===d.id&&p.status==='accepted');
    const localAcceptedHtml=localAccepted.length ? `<section class="panel section"><h2>${icon('check')} Принятые локальные предложения</h2><p>Эти записи приняты только в браузерной демо-очереди и не изменяют js/data.js или официальные требования.</p>${localAccepted.map(p=>`<div class="record"><strong>${esc(p.type)} · № ${esc(p.id)}</strong><p>${esc(p.description)}</p><p>Источник: ${esc(p.source)}</p><small>${p.link?externalLink(p.link,'Перейти по предложенной ссылке'):p.fileName?'Файл доступен только через локальную панель модератора':'Библиографическое описание без вложения'}</small></div>`).join('')}</section>` : '';
    const verificationMessage=d.status==='verified' ? '<strong>Статус требований: проверены.</strong> Всё равно сверяйте дату, источник и принадлежность к своей группе. Это не официальный ресурс МАИ.' : d.status==='general' ? '<strong>Здесь размещены общие ресурсы.</strong> Этот статус не подтверждает требования по работам или оцениванию.' : d.status==='outdated' ? '<strong>Карточка нуждается в обновлении.</strong> Сведения могут устареть; уточняйте требования через официальные каналы.' : '<strong>Эти сведения нельзя считать подтверждёнными.</strong> При противоречиях обращайтесь к официальным каналам МАИ и преподавателю.';
    return `<div class="breadcrumbs"><a href="#catalog">База знаний</a>${icon('chevron')}<span>Карточка ${String(d.cardNumber).padStart(2,'0')}</span></div>
      ${heading(`КАРТОЧКА ${String(d.cardNumber).padStart(2,'0')}`,d.name,'Ниже показаны источники, требования и сведения о проверке.')}
      <div class="detail-top">${statusBadge(d.status)}${d.demo?'<span class="demo-tag">Демо-данные</span>':''}<span class="card-meta">${icon('clock')} Проверка: ${esc(dateText(d.lastCheckedAt))}</span></div>
      <div class="notice ${d.status==='needs-clarification'||d.status==='outdated'?'warning':''}">${icon(d.status==='verified'?'check':'alert')}<div>${verificationMessage}</div></div>
      <div class="detail-layout section">
      <div><section class="panel"><h2>${icon('book')} Паспорт дисциплины</h2><dl class="info-list">
        ${infoRow('Название',esc(d.name))}${infoRow('Курс',esc(d.course))}${infoRow('Семестр',esc(d.semester))}${infoRow('Направление',esc(d.direction))}${infoRow('Целевые группы',esc(d.groups.join(', ')))}${infoRow('Преподаватель',esc(d.teacher||'Не указан; добавляется для различающихся требований'),!d.teacher)}
        </dl></section>
        <section class="panel section"><h2>${icon('document')} Учебные ресурсы</h2>${resources}</section>
        ${localAcceptedHtml}
        <section class="panel section"><h2>${icon('clipboard')} Обязательные работы</h2>${works}</section>
        <section class="panel section"><h2>${icon('calendar')} Допуск, оценка, сроки</h2><dl class="info-list">${infoRow('Допуск',esc(d.admission))}${infoRow('Критерии оценки',esc(d.grading))}${infoRow('Сроки',esc(d.deadlines))}</dl></section></div>
      <aside><section class="panel"><h2>${icon('shield')} Проверка достоверности</h2><dl class="info-list">
        ${infoRow('Статус',statusBadge(d.status))}${infoRow('Источник требований',externalLink(d.officialSource?.url,d.officialSource?.title||'[официальный источник]'))}${infoRow('Дата проверки',esc(dateText(d.lastCheckedAt)))}${infoRow('Проверяющий',esc(d.checkedBy||'Не назначен'))}${infoRow('Следующая проверка',esc(dateText(d.nextCheckAt,'Не назначена')))}${infoRow('Основание размещения',esc(d.publicationBasis))}
        </dl></section>
        <section class="panel section"><h2>${icon('rotate')} История изменений</h2><ol class="activity">${history}</ol></section>
        <section class="section"><a class="btn secondary" href="#suggest">Предложить уточнение ${icon('arrow')}</a></section></aside></div>`;
  }

  function renderSuggest() {
    const proposals=readJson(KEYS.proposals);
    return `${heading('ВКЛАД В БАЗУ','Предложить материал','Ссылка, конспект или замечание сначала проходят проверку. Контактные данные не нужны.')}
      ${localNotice()}
      <div class="form-layout section"><form class="panel form-card" id="proposal-form">
        <h2>${icon('upload')} Новое предложение</h2>
        <div class="form-two">
          ${field('Дисциплина <span class="required">*</span>','proposal-discipline',`<select id="proposal-discipline" name="disciplineId" required>${disciplineOptions()}</select>`)}
          ${field('Тип материала <span class="required">*</span>','proposal-type','<select id="proposal-type" name="type" required><option value="">Выберите тип</option><option value="Ссылка">Ссылка</option><option value="Конспект">Конспект</option><option value="Требование">Требование</option><option value="Другое">Другое</option></select>')}
        </div>
        ${field('Описание <span class="required">*</span>','proposal-description','<textarea id="proposal-description" name="description" required minlength="10" maxlength="1800" placeholder="Что содержится в материале? Для кого он подходит?" rows="4"></textarea>')}
        <div class="form-two">
          ${field('Ссылка на материал','proposal-link','<input id="proposal-link" type="url" name="link" maxlength="1200" placeholder="https://…" inputmode="url">','Ссылка, файл или только библиографическое описание.')}
          ${field('Файл для локальной демонстрации','proposal-file','<input id="proposal-file" type="file" name="file" aria-describedby="file-hint">','<span id="file-hint">До 5 МБ; сохраняется только в этом браузере через IndexedDB.</span>')}
        </div>
        <div class="notice">${icon('info')}<div>Если файл нельзя распространять, отправьте допустимую ссылку или одно библиографическое описание без вложения. Не загружайте материалы без достаточных прав.</div></div>
        ${field('Источник материала <span class="required">*</span>','proposal-source','<input id="proposal-source" name="source" required maxlength="500" placeholder="Откуда сведения: документ, издание или автор">')}
        ${field('Основание размещения <span class="required">*</span>','proposal-basis','<textarea id="proposal-basis" name="basis" rows="2" maxlength="600" required placeholder="Лицензия, разрешение автора или допустимая ссылка"></textarea>')}
        <label class="agree" for="proposal-consent"><input type="checkbox" id="proposal-consent" name="consent" required><span>Согласен(-на), что предложение будет проверено модератором до принятия. Не передаю персональные данные и материалы без права размещения.</span></label>
        <div id="proposal-error" class="inline-alert" role="alert"></div>
        <button type="submit" class="btn" id="proposal-submit">Отправить на локальную модерацию ${icon('arrow')}</button>
        <p class="field-hint">После отправки появятся номер, дата и статус. Целевой срок первого решения — 2 рабочих дня (в демо нет автоматической обработки).</p>
      </form>
      <aside class="form-aside">
        <div class="aside-card"><h3>${icon('shield')} Как проходит проверка</h3><ul><li>Проверяем источник и основание размещения.</li><li>Сверяем целевую группу и актуальность.</li><li>Принимаем решение с обязательным объяснением.</li></ul></div>
        <div class="aside-card"><h3>${icon('clock')} Статусы предложения</h3><div style="display:flex;flex-wrap:wrap;gap:7px">${Object.keys(DATA.proposalStatuses).map(s=>statusBadge(s,DATA.proposalStatuses)).join('')}</div><p>Решение появляется в очереди только этого браузера.</p></div>
        <div class="aside-card"><h3>${icon('info')} Без персональных данных</h3><p>Не запрашиваем ФИО, телефоны и почту. Пожалуйста, не указывайте их самостоятельно в описании или файлах.</p></div>
      </aside></div>
      <section class="section"><div class="section-heading"><div><h2>Предложения в этом браузере</h2><p>Другие участники не видят эти записи без общего сервера.</p></div></div><div id="my-proposals" class="proposal-list">${proposalSummary(proposals)}</div></section>`;
  }

  function proposalSummary(list) {
    if (!Array.isArray(list) || list.length===0) return `<div class="empty-state"><span class="empty-icon">${icon('inbox')}</span><h3>Пока нет предложений</h3><p>Отправленные материалы появятся здесь с номером, датой и статусом.</p></div>`;
    return [...list].reverse().map(p=>`<article class="proposal-item"><div class="proposal-head"><strong>№ ${esc(p.id)}</strong>${statusBadge(p.status,DATA.proposalStatuses)}</div><h3>${esc(p.type)} · карточка ${esc(p.cardNumber)}</h3><p>${esc(p.description)}</p><div class="proposal-meta"><span>${icon('calendar')} ${esc(dtText(p.createdAt))}</span><span>${icon('clock')} Первое решение: ориентир до ${esc(dateText(p.firstDueAt))}</span></div>${p.decisions?.length?`<p><strong>Последнее решение:</strong> ${esc(p.decisions[p.decisions.length-1].reason)}</p>`:''}</article>`).join('');
  }

  function renderPlanner() {
    const tasks=readJson(KEYS.tasks);
    return `${heading('ЛИЧНОЕ ПРОСТРАНСТВО','Планировщик','Небольшой список дел по учебным материалам. Работает без регистрации.')}
      <div class="notice warning">${icon('calendar')}<div><strong>Планировщик не заменяет официальное расписание.</strong> Сроки здесь устанавливает сам пользователь. Задачи сохраняются только в этом браузере.</div></div>
      <div class="form-layout section"><form id="task-form" class="panel form-card"><h2>${icon('plus')} Добавить задачу</h2>
        ${field('Что нужно сделать? <span class="required">*</span>','task-name','<input id="task-name" name="title" maxlength="180" required placeholder="Например: проверить список работ">')}
        <div class="form-two">
          ${field('Дисциплина','task-discipline',`<select id="task-discipline" name="disciplineId"><option value="">Без привязки</option>${disciplineOptions(false)}</select>`)}
          ${field('Срок <span class="required">*</span>','task-due','<input id="task-due" name="due" type="date" required>')}
        </div><button type="submit" class="btn">Сохранить задачу ${icon('plus')}</button></form>
        <aside class="aside-card"><h3>${icon('shield')} Только у вас</h3><p>Список хранится локально через localStorage. Он не синхронизируется между устройствами и может исчезнуть при очистке данных браузера.</p><p>Не используйте его как подтверждение официального срока сдачи.</p></aside></div>
      <section class="section"><div class="section-heading"><div><h2>Мои задачи</h2><p id="task-count">${esc(taskCount(tasks))}</p></div></div><div id="task-list" class="task-list">${tasksHtml(tasks)}</div></section>`;
  }
  function taskCount(tasks) { return `${tasks.filter(t=>!t.done).length} активных · ${tasks.filter(t=>t.done).length} выполненных`; }
  function tasksHtml(tasks) {
    if (!tasks.length) return emptyState('Список пока пуст','Добавьте первую задачу и её срок.','Добавить задачу','#planner');
    const sorted=[...tasks].sort((a,b)=>Number(a.done)-Number(b.done)||a.due.localeCompare(b.due));
    return sorted.map(t=>`<article class="task ${t.done?'done':''}"><input class="task-checkbox" type="checkbox" data-task-toggle="${esc(t.id)}" ${t.done?'checked':''} aria-label="${t.done?'Отметить невыполненной':'Отметить выполненной'}: ${esc(t.title)}"><div class="task-main"><strong>${esc(t.title)}</strong><p>Срок: ${esc(dateText(t.due))} · ${esc(t.disciplineId?`Карточка ${String(DATA.disciplines.find(d=>d.id===t.disciplineId)?.cardNumber||'').padStart(2,'0')}`:'Без дисциплины')}</p></div><button type="button" class="icon-button" data-task-delete="${esc(t.id)}" aria-label="Удалить задачу: ${esc(t.title)}" title="Удалить">${icon('trash')}</button></article>`).join('');
  }

  function renderFeedback() {
    return `${heading('ОБРАТНАЯ СВЯЗЬ','Расскажите о своём опыте','Нам важно понять, что удобно, а что требует улучшения. Оценка не является доказательством эффективности проекта.')}
      ${localNotice()}
      <div class="form-layout section"><form class="panel form-card" id="feedback-form">
        <h2>${icon('message')} Оценка полезности</h2>
        <fieldset style="border:0;padding:0;margin:0"><legend class="field-label" style="margin-bottom:10px">Насколько база оказалась полезной? <span style="color:var(--red-fg)">*</span></legend><div class="radio-stack">
          ${[['useful','Полезна'],['mostly-useful','Скорее полезна'],['mostly-not','Скорее бесполезна'],['not-useful','Бесполезна'],['insufficient','Недостаточно опыта']].map(([v,label])=>`<label class="radio-option"><input type="radio" name="rating" value="${esc(v)}" required>${esc(label)}</label>`).join('')}
        </div></fieldset>
        ${field('Что искали и по какой дисциплине?','feedback-context','<textarea id="feedback-context" name="context" rows="3" maxlength="650" placeholder="Например: информацию о сдаче работ по [дисциплине]"></textarea>')}
        ${field('Отзыв или предложение','feedback-message','<textarea id="feedback-message" name="message" rows="4" maxlength="1800" placeholder="Что было понятно, что не нашлось, что стоит изменить?"></textarea>')}
        <button class="btn" type="submit">Сохранить отзыв в этом браузере ${icon('check')}</button>
        <p class="field-hint">Без ФИО, телефонов и почты. Для сбора отзывов всех участников нужен общий сервер или подключённая форма.</p>
      </form><aside class="form-aside"><div class="aside-card"><h3>${icon('shield')} Что происходит с отзывом</h3><p>В этой демо-версии он сохраняется в локальной памяти браузера. Администратор другого устройства его не увидит.</p><p>После подключения общего хранения отзыв может использоваться для анализа пилота без персональных данных.</p></div><a class="btn ghost" href="#home">${icon('left')} Вернуться на главную</a></aside></div>`;
  }

  function renderAbout() {
    return `${heading('О ПРОЕКТЕ','Учебная информация должна быть понятной','МАИ Вики — общественный проект по дисциплине «Обучение служением», кафедра №515, 2026.')}
      <div class="about-hero"><span class="eyebrow">НАША ИДЕЯ</span><h2>Собрать разрозненные материалы в проверяемую студенческую базу.</h2><p>Первокурсники ищут сведения в чатах, личных конспектах и образовательных системах. Наша цель — дать им единый ориентир с привязкой к дисциплине, группе, источнику и дате проверки. Этот сайт не заменяет официальные каналы университета.</p><div class="btn-row"><a href="#catalog" class="btn">Открыть базу знаний ${icon('arrow')}</a><a href="#feedback" class="btn secondary">Оставить отзыв</a></div></div>
      <section class="section"><div class="section-heading"><div><h2>Как мы проверяем информацию</h2><p>Правило для каждой карточки</p></div></div><div class="mini-steps"><div class="step"><span class="step-index">01 / ИСТОЧНИК</span><h3>Откуда сведения?</h3><p>Указываем подтверждённый материал и основание размещения.</p></div><div class="step"><span class="step-index">02 / ДАТА</span><h3>Когда проверили?</h3><p>Фиксируем проверку ссылки, ответственного и дату следующей проверки.</p></div><div class="step"><span class="step-index">03 / СТАТУС</span><h3>Можно ли полагаться?</h3><p>Неподтверждённые требования маркируются как требующие уточнения.</p></div></div></section>
      <section class="section two-col"><div class="panel"><h2>${icon('users')} Границы пилота</h2><dl class="info-list">${infoRow('Участники','Первый курс, институт №8, ФИИТ')}${infoRow('Основная группа','М8О-111БВ-26')}${infoRow('Период','26.10.2026 – 28.11.2026')}${infoRow('Участие','Добровольное')}${infoRow('Выводы','Только по участникам пилота; контрольной группы нет')}</dl></div>
      <div class="panel"><h2>${icon('clipboard')} Как устроена модерация</h2><p>Материал попадает в очередь, затем проверяется источник, право размещения и соответствие группе. Решение фиксируется с датой и обоснованием. Целевой срок первого решения — 2 рабочих дня.</p><p>Если требования различаются у преподавателей, нужны отдельные записи. Спорные сведения не публикуются как подтверждённые.</p><p><strong>Сейчас это локальная демонстрация:</strong> общей очереди и защищённых аккаунтов модераторов нет.</p></div></section>
      <section class="section"><div class="section-heading"><div><h2>Команда проекта</h2><p>Курсовая работа по дисциплине «Общественный проект. Обучение служением»</p></div></div><div class="team-grid">${DATA.team.map(t=>`<div class="team-item"><span class="avatar" aria-hidden="true">${esc(t.name[0])}</span><div><strong>${esc(t.name)}</strong><small>${esc(t.role)}</small></div></div>`).join('')}</div></section>
      <section class="section"><div class="cta-panel"><div><h3>Опросы участников пилота</h3><p>Адреса форм ещё не добавлены. После согласования команда заменит заглушки настоящими ссылками.</p></div><div class="btn-row"><a class="btn secondary survey-placeholder" href="#" data-survey="initial">Пройти первичную анкету</a><a class="btn ghost survey-placeholder" href="#" data-survey="final">Пройти итоговую анкету</a></div></div></section>
      <section class="section"><div class="notice warning">${icon('alert')}<div><strong>Неофициальный студенческий прототип.</strong> Проект не представляет позицию МАИ и не подтверждает, что его польза уже доказана. Результаты проверяются в пилоте на добровольной выборке.</div></div><p class="anchor-small">Для демонстрации локальной очереди: <a href="#moderator">страница модератора</a>. Ссылка не входит в основную навигацию; в демо она не защищена авторизацией.</p></section>`;
  }

  function addWorkdays(raw, count) {
    const date=new Date(raw);
    date.setHours(12,0,0,0);
    let added=0;
    while(added<count) {date.setDate(date.getDate()+1);if(date.getDay()!==0&&date.getDay()!==6) added++;}
    return `${date.getFullYear()}-${String(date.getMonth()+1).padStart(2,'0')}-${String(date.getDate()).padStart(2,'0')}`;
  }
  function makeId(prefix) {
    const day=new Date().toISOString().slice(0,10).replaceAll('-','');
    const rnd=typeof crypto!=='undefined'&&crypto.getRandomValues?crypto.getRandomValues(new Uint32Array(1))[0].toString(36).slice(0,6):Math.random().toString(36).slice(2,8);
    return `${prefix}-${day}-${rnd.toUpperCase()}`;
  }
  function renderModerator() {
    const proposals=readJson(KEYS.proposals);
    const feedback=readJson(KEYS.feedback);
    return `${heading('ЛОКАЛЬНЫЙ РЕЖИМ','Панель модератора','Скрыта из основной навигации. Без сервера и авторизации эта страница не является защищённой.')}
      <div class="local-banner"><strong>Внимание: учебная демонстрация.</strong> Решения здесь видны только в данном браузере. Любой, кто откроет эту страницу на устройстве, может поменять локальные статусы. Для реального проекта нужны аккаунты модераторов, сервер и контроль доступа. Целевой срок первого решения — 2 рабочих дня (пн–пт, без учёта праздников).</div>
      <div class="filters" style="margin-top:18px">${field('Показать предложения','moderator-filter',`<select id="moderator-filter"><option value="">Все статусы</option>${Object.entries(DATA.proposalStatuses).map(([k,v])=>`<option value="${esc(k)}">${esc(v.label)}</option>`).join('')}</select>`)}</div>
      <div id="moderator-list" class="proposal-list">${modList(proposals)}</div>
      <section class="section"><div class="section-heading"><div><h2>Журнал решений</h2><p>Все изменения статусов в этом браузере</p></div></div><div class="panel" id="decision-log">${decisionLog(proposals)}</div></section>
      <section class="section"><div class="section-heading"><div><h2>Отзывы в этом браузере</h2><p>Локальная обратная связь без контактных данных</p></div></div><div class="proposal-list" id="feedback-list">${feedbackList(feedback)}</div></section>`;
  }
  function modList(proposals, filter='') {
    const visible=filter?proposals.filter(p=>p.status===filter):proposals;
    if(!visible.length) return `<div class="empty-state"><span class="empty-icon">${icon('inbox')}</span><h3>Нет предложений</h3><p>Записи появляются после отправки через форму «Предложить» в этом же браузере.</p></div>`;
    return [...visible].reverse().map(p=>`<article class="proposal-item" id="proposal-${esc(p.id)}"><div class="proposal-head"><strong>№ ${esc(p.id)}</strong>${statusBadge(p.status,DATA.proposalStatuses)}</div>
      <h3>${esc(p.type)} · карточка ${esc(p.cardNumber)} · ${esc(p.disciplineName)}</h3>
      <p><strong>Описание:</strong> ${esc(p.description)}</p><p><strong>Источник:</strong> ${esc(p.source)}</p><p><strong>Основание:</strong> ${esc(p.basis)}</p>
      ${p.link?`<p><strong>Ссылка:</strong> ${externalLink(p.link,p.link)}</p>`:''}
      ${p.fileName?`<p><strong>Файл:</strong> ${esc(p.fileName)} <button class="btn ghost" type="button" data-download-file="${esc(p.id)}">${icon('download')} Сохранить локальный файл</button></p>`:''}
      <div class="proposal-meta"><span>${icon('calendar')} ${esc(dtText(p.createdAt))}</span><span>${icon('clock')} Первое решение до: ${esc(dateText(p.firstDueAt))}</span></div>
      <form class="moderator-actions" data-moderate="${esc(p.id)}"><div class="form-two">${field('Решение','decision-'+p.id,`<select id="decision-${esc(p.id)}" name="decision" required><option value="">Выберите решение</option><option value="accepted">Принять</option><option value="clarification">Запросить уточнение</option><option value="rejected">Отклонить</option></select>`)}
      ${field('Обоснование <span class="required">*</span>','reason-'+p.id,`<textarea id="reason-${esc(p.id)}" name="reason" required minlength="10" maxlength="1000" placeholder="Почему принято такое решение?"></textarea>`)}</div><div><button class="btn secondary" type="submit">Сохранить решение ${icon('check')}</button></div></form></article>`).join('');
  }
  function decisionLog(proposals) {
    const log=proposals.flatMap(p=>(p.decisions||[]).map(d=>({...d,id:p.id}))).sort((a,b)=>b.date.localeCompare(a.date));
    if(!log.length) return '<p>Решений пока нет. После модерации здесь появятся дата, статус и обоснование.</p>';
    return `<ol class="activity">${log.map(d=>`<li><strong>№ ${esc(d.id)}</strong> · ${esc(DATA.proposalStatuses[d.status]?.label||d.status)} <small>${esc(dtText(d.date))} · ${esc(d.reason)}</small></li>`).join('')}</ol>`;
  }
  function feedbackList(feedback) {
    if(!feedback.length) return `<div class="empty-state"><span class="empty-icon">${icon('message')}</span><h3>Нет отзывов</h3><p>Отзывы появятся здесь после отправки формы обратной связи в этом браузере.</p></div>`;
    const labels={'useful':'Полезна','mostly-useful':'Скорее полезна','mostly-not':'Скорее бесполезна','not-useful':'Бесполезна','insufficient':'Недостаточно опыта'};
    return [...feedback].reverse().map(f=>`<article class="proposal-item"><div class="proposal-head"><strong>${esc(labels[f.rating]||'Без оценки')}</strong><span class="card-meta">${esc(dtText(f.createdAt))}</span></div><p><strong>Искали:</strong> ${esc(f.context||'Не указано')}</p><p><strong>Отзыв:</strong> ${esc(f.message||'Не оставлен')}</p></article>`).join('');
  }

  // Бинарные вложения храним отдельно от localStorage: только локальный IndexedDB.
  function openFileDatabase() {
    return new Promise((resolve,reject)=>{
      if (!('indexedDB' in window)) return reject(new Error('IndexedDB недоступен'));
      const request=indexedDB.open('mai-wiki-demo-files-v1',1);
      request.onupgradeneeded=()=>{if(!request.result.objectStoreNames.contains('attachments')) request.result.createObjectStore('attachments',{keyPath:'id'});};
      request.onsuccess=()=>resolve(request.result);
      request.onerror=()=>reject(request.error||new Error('Не удалось открыть IndexedDB'));
    });
  }
  async function saveDemoFile(id,file) {
    const db=await openFileDatabase();
    return new Promise((resolve,reject)=>{
      const tx=db.transaction('attachments','readwrite');
      tx.objectStore('attachments').put({id,file,name:file.name,type:file.type});
      tx.oncomplete=()=>{db.close();resolve();};
      tx.onerror=()=>{db.close();reject(tx.error||new Error('Ошибка сохранения файла'));};
      tx.onabort=()=>{db.close();reject(tx.error||new Error('Сохранение отменено'));};
    });
  }
  async function getDemoFile(id) {
    const db=await openFileDatabase();
    return new Promise((resolve,reject)=>{
      const tx=db.transaction('attachments','readonly');
      const req=tx.objectStore('attachments').get(id);
      req.onsuccess=()=>resolve(req.result||null);
      req.onerror=()=>reject(req.error||new Error('Ошибка чтения файла'));
      tx.oncomplete=()=>db.close();
      tx.onerror=()=>db.close();
    });
  }

  function bindHome() {
    const input=document.getElementById('home-search');
    const searchSection=document.getElementById('home-results-section');
    const recentSection=document.getElementById('recent-section');
    const output=document.getElementById('home-results');
    const summary=document.getElementById('search-summary');
    const update=()=>{
      const q=input.value.trim();
      searchSection.hidden=!q;
      recentSection.hidden=!!q;
      if (!q) {output.innerHTML='';return;}
      const matches=search(q);
      summary.textContent=`Найдено карточек: ${matches.length}. Демо-данные не подтверждены.`;
      output.innerHTML=matches.length?matches.map(cardHtml).join(''):emptyState('Ничего не найдено','Пока в базе нет материалов по этому запросу. Вы можете предложить новую ссылку или материал.');
    };
    input.addEventListener('input',update);
    document.querySelectorAll('[data-quick-search]').forEach(b=>b.addEventListener('click',()=>{input.value=b.dataset.quickSearch;update();input.focus();searchSection.scrollIntoView({behavior:'smooth',block:'start'});}));
    document.getElementById('clear-search').addEventListener('click',()=>{input.value='';update();input.focus();});
  }
  function bindCatalog() {
    const q=document.getElementById('catalog-q');
    const sem=document.getElementById('catalog-semester');
    const status=document.getElementById('catalog-status');
    const render=()=>{
      const parts=norm(q.value).split(/\s+/).filter(Boolean);
      const results=DATA.disciplines.filter(d=>(!sem.value||d.semester===sem.value)&&(!status.value||d.status===status.value)&&parts.every(v=>searchable(d).includes(v)));
      document.getElementById('catalog-count').textContent=`Показано ${results.length} из ${DATA.disciplines.length} карточек`;
      document.getElementById('catalog-results').innerHTML=results.length?results.map(cardHtml).join(''):emptyState('Нет карточек по фильтрам','Попробуйте другой семестр или статус. Можно предложить новый материал.');
    };
    [q,sem,status].forEach(el=>el.addEventListener('input',render));
    render();
  }
  function bindSuggest() {
    document.getElementById('proposal-form').addEventListener('submit',async e=>{
      e.preventDefault();
      const form=e.currentTarget;
      if(!form.reportValidity()) return;
      const data=new FormData(form);
      const discipline=DATA.disciplines.find(d=>d.id===data.get('disciplineId'));
      const file=document.getElementById('proposal-file').files[0];
      const link=String(data.get('link')||'').trim();
      const error=document.getElementById('proposal-error');
      function fail(text){error.textContent=text;error.classList.add('show');notify('Проверьте заполнение формы');}
      error.classList.remove('show');
      if(!discipline) return fail('Выберите дисциплину.');
      if(link&&!safeUrl(link)) return fail('Допустимы только ссылки http:// или https://.');
      if(file&&file.size>MAX_DEMO_FILE_BYTES) return fail('Для локального демо файл должен быть не больше 5 МБ.');
      if(!data.get('consent')) return fail('Нужно согласие на модерацию.');
      const now=new Date();
      const id=makeId('MW');
      const row={id,createdAt:now.toISOString(),firstDueAt:addWorkdays(now,2),disciplineId:discipline.id,disciplineName:discipline.name,cardNumber:String(discipline.cardNumber).padStart(2,'0'),type:String(data.get('type')),description:String(data.get('description')).trim(),link,source:String(data.get('source')).trim(),basis:String(data.get('basis')).trim(),fileName:file?file.name:'',fileSize:file?file.size:0,status:'pending',decisions:[]};
      const button=document.getElementById('proposal-submit');
      button.disabled=true;
      try {
        if(file) await saveDemoFile(id,file);
        const list=readJson(KEYS.proposals);
        if(!saveJson(KEYS.proposals,[...list,row])) throw new Error('Браузер не разрешил локальное сохранение.');
        form.reset();
        document.getElementById('my-proposals').innerHTML=proposalSummary(readJson(KEYS.proposals));
        notify(`Предложение № ${id} записано в локальную очередь`);
        document.getElementById('my-proposals').scrollIntoView({behavior:'smooth',block:'start'});
      } catch(err) { fail(`${err.message||'Ошибка сохранения'}. Если локальное хранилище выключено, предложение не создано.`); }
      finally {button.disabled=false;}
    });
  }
  function bindPlanner() {
    const form=document.getElementById('task-form');
    const list=document.getElementById('task-list');
    function update(){const tasks=readJson(KEYS.tasks);list.innerHTML=tasksHtml(tasks);document.getElementById('task-count').textContent=taskCount(tasks);}
    form.addEventListener('submit',e=>{
      e.preventDefault();
      if(!form.reportValidity())return;
      const d=new FormData(form);
      const all=readJson(KEYS.tasks);
      const next=[...all,{id:makeId('TASK'),title:String(d.get('title')).trim(),due:String(d.get('due')),disciplineId:String(d.get('disciplineId')||''),done:false}];
      if(!saveJson(KEYS.tasks,next)) return notify('Не удалось сохранить задачу: хранилище браузера недоступно');
      form.reset();update();notify('Задача сохранена в этом браузере');
    });
    list.addEventListener('change',e=>{
      const el=e.target.closest('[data-task-toggle]');
      if(!el)return;
      const tasks=readJson(KEYS.tasks);
      const item=tasks.find(t=>t.id===el.dataset.taskToggle);
      if(item){item.done=el.checked;if(!saveJson(KEYS.tasks,tasks))return notify('Не удалось сохранить изменение');update();}
    });
    list.addEventListener('click',e=>{
      const el=e.target.closest('[data-task-delete]');
      if(!el)return;
      const newList=readJson(KEYS.tasks).filter(t=>t.id!==el.dataset.taskDelete);
      if(!saveJson(KEYS.tasks,newList))return notify('Не удалось удалить задачу');
      update();notify('Задача удалена');
    });
  }
  function bindFeedback() {
    const form=document.getElementById('feedback-form');
    form.addEventListener('submit',e=>{
      e.preventDefault();
      if(!form.reportValidity())return;
      const d=new FormData(form);
      const all=readJson(KEYS.feedback);
      const record={id:makeId('FB'),createdAt:new Date().toISOString(),rating:String(d.get('rating')),context:String(d.get('context')||'').trim(),message:String(d.get('message')||'').trim()};
      if(!saveJson(KEYS.feedback,[...all,record]))return notify('Локальное хранение недоступно; отзыв не сохранён');
      form.reset();notify('Отзыв сохранён только в этом браузере');
    });
  }
  function bindAbout() {
    document.querySelectorAll('.survey-placeholder').forEach(a=>a.addEventListener('click',e=>{e.preventDefault();notify('Адрес этой анкеты пока не добавлен командой проекта');}));
  }
  function bindModerator() {
    const filter=document.getElementById('moderator-filter');
    const list=document.getElementById('moderator-list');
    filter.addEventListener('input',()=>{list.innerHTML=modList(readJson(KEYS.proposals),filter.value);});
    list.addEventListener('submit',e=>{
      const form=e.target.closest('form[data-moderate]');
      if(!form)return;
      e.preventDefault();
      if(!form.reportValidity())return;
      const id=form.dataset.moderate;
      const d=new FormData(form);
      const reason=String(d.get('reason')||'').trim();
      const status=String(d.get('decision')||'');
      if(reason.length<10||!['accepted','clarification','rejected'].includes(status))return notify('Нужны решение и обоснование от 10 символов');
      const proposals=readJson(KEYS.proposals);
      const proposal=proposals.find(p=>p.id===id);
      if(!proposal)return notify('Предложение больше не найдено');
      proposal.status=status;
      proposal.decisions.push({date:new Date().toISOString(),status,reason});
      if(!saveJson(KEYS.proposals,proposals))return notify('Не удалось сохранить решение');
      list.innerHTML=modList(proposals,filter.value);
      document.getElementById('decision-log').innerHTML=decisionLog(proposals);
      notify('Локальное решение записано в журнал');
    });
    list.addEventListener('click',async e=>{
      const btn=e.target.closest('[data-download-file]');
      if(!btn)return;
      try {
        const attachment=await getDemoFile(btn.dataset.downloadFile);
        if(!attachment||!attachment.file)return notify('Файл не найден в этом браузере');
        const blobUrl=URL.createObjectURL(attachment.file);
        const download=document.createElement('a');
        download.href=blobUrl;download.download=attachment.name||'attachment';
        document.body.append(download);download.click();download.remove();
        setTimeout(()=>URL.revokeObjectURL(blobUrl),10000);
      } catch(err) {notify('Не удалось прочитать локальный файл');}
    });
  }
  function currentRoute() { return decodeURIComponent((location.hash||'#home').slice(1)).split('?')[0]||'home'; }
  function render() {
    const route=currentRoute();
    let navKey=route;
    if(route==='home')main.innerHTML=renderHome();
    else if(route==='catalog')main.innerHTML=renderCatalog();
    else if(route.startsWith('discipline/')) {main.innerHTML=renderDiscipline(route.slice('discipline/'.length));navKey='catalog';}
    else if(route==='suggest')main.innerHTML=renderSuggest();
    else if(route==='planner')main.innerHTML=renderPlanner();
    else if(route==='about')main.innerHTML=renderAbout();
    else if(route==='feedback') {main.innerHTML=renderFeedback();navKey='home';}
    else if(route==='moderator') {main.innerHTML=renderModerator();navKey='';}
    else {main.innerHTML=heading('404','Страница не найдена')+emptyState('Такого раздела нет','Вернитесь на главную.','На главную','#home');navKey='';}
    nav.querySelectorAll('a').forEach(a=>{if(a.dataset.nav===navKey)a.setAttribute('aria-current','page');else a.removeAttribute('aria-current');});
    const firstHeading=main.querySelector('h1');
    document.title=`${firstHeading?.textContent||'МАИ Вики'} · МАИ Вики`;
    if(route==='home')bindHome();
    if(route==='catalog')bindCatalog();
    if(route==='suggest')bindSuggest();
    if(route==='planner')bindPlanner();
    if(route==='about')bindAbout();
    if(route==='feedback')bindFeedback();
    if(route==='moderator')bindModerator();
    window.scrollTo({top:0,behavior:'instant'});
  }
  function setTheme(theme) {
    const next=theme==='dark'?'dark':'light';
    document.documentElement.dataset.theme=next;
    themeButton.innerHTML=icon(next==='dark'?'sun':'moon');
    themeButton.title=next==='dark'?'Включить светлую тему':'Включить тёмную тему';
    themeButton.setAttribute('aria-label',themeButton.title);
    themeButton.setAttribute('aria-pressed',String(next==='dark'));
    const meta=document.querySelector('meta[name="theme-color"]');
    if(meta)meta.content=next==='dark'?'#0b1524':'#f5f7fb';
  }
  nav.querySelectorAll('[data-icon]').forEach(node=>{node.innerHTML=icon(node.dataset.icon);});
  const initialTheme=readJson(KEYS.theme,null)||((window.matchMedia&&matchMedia('(prefers-color-scheme: dark)').matches)?'dark':'light');
  setTheme(initialTheme);
  themeButton.addEventListener('click',()=>{const next=document.documentElement.dataset.theme==='dark'?'light':'dark';setTheme(next);if(!saveJson(KEYS.theme,next)) notify('Тема изменена, но сохранить её не удалось');});
  window.addEventListener('hashchange',()=>{render();main.focus({preventScroll:true});});
  render();
})();
