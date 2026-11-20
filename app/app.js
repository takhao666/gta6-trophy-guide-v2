// Leonida Trophy Guide: loads the 55 trophies, renders the checklist, roadmap and
// guide panel, and keeps the reader's progress in localStorage (export/import too).
// No network requests at run time beyond the app's own files.

const STORAGE_KEY = 'leonida-trophy-guide-v1';
const DATA_URL = 'data/trophies.json';

const KIND_LABELS = {
  all: 'All kinds',
  story: 'Story',
  missable: 'Missable',
  collectibles: 'Collectibles',
  activities: 'Activities',
  robbery: 'Robbery',
  questline: 'Side quests',
  misc: 'Everything else',
  online: 'Online',
};

const STAGES = [
  {
    stage: 1,
    title: 'Stage 1 — Story first',
    hours: '60–80 hours',
    text: 'Play the story, do the Chapter 1 meditation before it is gone, and scan vehicles and study animals as you go — both count toward 100% later.',
  },
  {
    stage: 2,
    title: 'Stage 2 — 100% checklist',
    hours: 'About 100 hours',
    text: 'After the story, open Progress > Stats > 100% Completion and work the checklist: robberies, ranges, races, collectibles and any 70 of 80 challenges.',
  },
  {
    stage: 3,
    title: 'Stage 3 — Clean-up',
    hours: 'About 10 hours',
    text: 'Strangers & Freaks, questline finals and the remaining one-offs. The platinum pops with the last one.',
  },
];

let trophies = [];
let earned = loadProgress();
let selectedId = null;
let filters = { kind: 'all', grade: 'all', status: 'all', query: '' };
let spoilersHidden = true;

const listEl = document.getElementById('trophyList');
const detailEl = document.getElementById('detail');
const emptyEl = document.getElementById('emptyState');

function loadProgress() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];
    return new Set(Array.isArray(parsed) ? parsed.filter((n) => typeof n === 'string') : []);
  } catch {
    return new Set();
  }
}

function saveProgress() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...earned].sort()));
}

function trophyById(id) {
  return trophies.find((t) => t.id === id);
}

function isSpoilerHidden(trophy) {
  return spoilersHidden && trophy.kind === 'story' && !earned.has(trophy.name);
}

function displayName(trophy) {
  return isSpoilerHidden(trophy) ? 'Hidden story trophy' : trophy.name;
}

function displayDescription(trophy) {
  return isSpoilerHidden(trophy)
    ? 'A story trophy — earn it to reveal its name and description.'
    : trophy.description;
}

function gradeBadge(trophy) {
  return `<span class="grade-badge grade-${trophy.grade}">${trophy.grade}</span>`;
}

function kindTag(trophy) {
  return `<span class="tag">${KIND_LABELS[trophy.kind] ?? trophy.kind}</span>`;
}

function trophyMatchesFilters(trophy) {
  if (filters.kind === 'online') return false;
  if (filters.kind === 'missable' && !trophy.missable) return false;
  if (filters.kind !== 'all' && filters.kind !== 'missable' && trophy.kind !== filters.kind) return false;
  if (filters.grade !== 'all' && trophy.grade !== filters.grade) return false;
  if (filters.status === 'earned' && !earned.has(trophy.name)) return false;
  if (filters.status === 'unearned' && earned.has(trophy.name)) return false;
  if (filters.query) {
    const q = filters.query.toLowerCase();
    const hay = `${trophy.name} ${trophy.description} ${trophy.guide} ${trophy.kind}`.toLowerCase();
    if (!hay.includes(q)) return false;
  }
  return true;
}

function renderProgress() {
  const total = trophies.length;
  document.getElementById('earnedCount').textContent = String(earned.size);
  document.getElementById('progressFill').style.width = total ? `${(earned.size / total) * 100}%` : '0%';
  const counts = { platinum: [0, 1], gold: [0, 2], silver: [0, 6], bronze: [0, 46] };
  for (const t of trophies) {
    if (earned.has(t.name)) counts[t.grade][0] += 1;
  }
  document.getElementById('gradeCounts').textContent =
    `Platinum ${counts.platinum[0]}/1 · Gold ${counts.gold[0]}/2 · Silver ${counts.silver[0]}/6 · Bronze ${counts.bronze[0]}/46`;
}

function renderRoadmap() {
  const wrap = document.getElementById('stages');
  wrap.replaceChildren();
  for (const stage of STAGES) {
    const card = document.createElement('div');
    card.className = 'stage';
    const members = trophies.filter((t) => t.stage === stage.stage);
    const done = members.filter((t) => earned.has(t.name)).length;
    card.innerHTML = `<h3></h3><p class="hours"></p><p></p><div class="chips"></div>`;
    card.querySelector('h3').textContent = `${stage.title} — ${done}/${members.length}`;
    card.querySelector('.hours').textContent = stage.hours;
    card.querySelectorAll('p')[1].textContent = stage.text;
    const chips = card.querySelector('.chips');
    for (const t of members) {
      const chip = document.createElement('button');
      chip.type = 'button';
      chip.className = `chip${earned.has(t.name) ? ' earned' : ''}`;
      chip.textContent = displayName(t);
      chip.addEventListener('click', () => selectTrophy(t.id, true));
      chips.append(chip);
    }
    wrap.append(card);
  }
}

function renderKindChips() {
  const wrap = document.getElementById('kindChips');
  wrap.replaceChildren();
  for (const [kind, label] of Object.entries(KIND_LABELS)) {
    const count = kind === 'all'
      ? trophies.length
      : kind === 'missable'
        ? trophies.filter((t) => t.missable).length
        : kind === 'online'
          ? 0
          : trophies.filter((t) => t.kind === kind).length;
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `chip-btn${filters.kind === kind ? ' active' : ''}`;
    btn.innerHTML = '';
    btn.append(document.createTextNode(`${label} `));
    const n = document.createElement('span');
    n.className = 'n';
    n.textContent = `(${count})`;
    btn.append(n);
    btn.addEventListener('click', () => {
      filters.kind = kind;
      renderAll();
    });
    wrap.append(btn);
  }
}

function renderTrophyList() {
  listEl.replaceChildren();
  const shown = trophies.filter(trophyMatchesFilters);
  document.getElementById('shownCount').textContent = String(shown.length);
  const onlineNote = filters.kind === 'online';
  emptyEl.hidden = shown.length > 0;
  emptyEl.textContent = onlineNote
    ? 'No online trophies — all 55 are offline and single-player. Nothing here to filter.'
    : 'No trophies match these filters. Try clearing the search or choosing another kind.';
  for (const trophy of shown) {
    const li = document.createElement('li');
    li.className = `trophy-row${earned.has(trophy.name) ? ' earned' : ''}${selectedId === trophy.id ? ' selected' : ''}`;
    const box = document.createElement('input');
    box.type = 'checkbox';
    box.checked = earned.has(trophy.name);
    box.setAttribute('aria-label', `Earned: ${displayName(trophy)}`);
    box.addEventListener('change', (event) => {
      event.stopPropagation();
      toggleEarned(trophy);
    });
    const body = document.createElement('div');
    const name = document.createElement('div');
    name.className = `trophy-name${isSpoilerHidden(trophy) ? ' spoiler-placeholder' : ''}`;
    name.textContent = displayName(trophy);
    const desc = document.createElement('div');
    desc.className = 'trophy-desc';
    desc.textContent = displayDescription(trophy);
    const tags = document.createElement('div');
    tags.className = 'trophy-tags';
    tags.innerHTML = '';
    if (trophy.missable) {
      const m = document.createElement('span');
      m.className = 'tag missable';
      m.textContent = 'Missable';
      tags.append(m);
    }
    const k = document.createElement('span');
    k.className = 'tag';
    k.textContent = KIND_LABELS[trophy.kind] ?? trophy.kind;
    tags.append(k);
    if (trophy.hidden) {
      const h = document.createElement('span');
      h.className = 'tag hidden-t';
      h.textContent = 'Hidden on PS5';
      tags.append(h);
    }
    body.append(name, desc, tags);
    const badge = document.createElement('span');
    badge.innerHTML = gradeBadge(trophy);
    li.append(box, body, badge);
    li.addEventListener('click', (event) => {
      if (event.target !== box) selectTrophy(trophy.id, false);
    });
    listEl.append(li);
  }
}

function renderDetail() {
  const trophy = selectedId === null ? null : trophyById(selectedId);
  if (!trophy) {
    detailEl.innerHTML = '<p class="detail-empty">Pick a trophy from the list to see its guide, its steps and its sources. The guide for every trophy names where its facts come from.</p>';
    return;
  }
  const hidden = isSpoilerHidden(trophy);
  const isEarned = earned.has(trophy.name);
  detailEl.replaceChildren();
  const title = document.createElement('h3');
  title.textContent = displayName(trophy);
  const desc = document.createElement('p');
  desc.className = 'detail-desc';
  desc.textContent = displayDescription(trophy);
  const meta = document.createElement('div');
  meta.className = 'detail-meta';
  meta.innerHTML = gradeBadge(trophy);
  if (trophy.missable) {
    const m = document.createElement('span');
    m.className = 'tag missable';
    m.textContent = 'Missable';
    meta.append(m);
  }
  const k = document.createElement('span');
  k.className = 'tag';
  k.textContent = KIND_LABELS[trophy.kind] ?? trophy.kind;
  meta.append(k);
  const stageTag = document.createElement('span');
  stageTag.className = 'tag';
  stageTag.textContent = `Roadmap stage ${trophy.stage}`;
  meta.append(stageTag);
  detailEl.append(title, desc, meta);

  if (hidden) {
    const callout = document.createElement('p');
    callout.className = 'callout info';
    callout.textContent = 'Spoiler mode is on. This is a story trophy you have not earned yet, so its name, description and guide stay hidden. Turn spoiler mode off above, or tick it earned, to reveal it.';
    detailEl.append(callout);
  } else {
    const guide = document.createElement('p');
    guide.className = 'guide-text';
    guide.textContent = trophy.guide;
    detailEl.append(guide);
    if (trophy.missable) {
      const callout = document.createElement('p');
      callout.className = 'callout';
      callout.textContent = 'Missable: do the Chapter 1 step before the chapter ends. Everything else in this guide can be done after the story.';
      detailEl.append(callout);
    }
    const stepsTitle = document.createElement('h4');
    stepsTitle.textContent = 'Steps';
    const steps = document.createElement('ol');
    steps.className = 'steps';
    for (const step of trophy.steps ?? []) {
      const li = document.createElement('li');
      li.textContent = step;
      steps.append(li);
    }
    detailEl.append(stepsTitle, steps);
    const srcTitle = document.createElement('h4');
    srcTitle.textContent = 'Sources — where this guide’s facts come from';
    const srcList = document.createElement('ul');
    srcList.className = 'sources';
    for (const source of trophy.sources ?? []) {
      const li = document.createElement('li');
      const a = document.createElement('a');
      a.href = source.url;
      a.target = '_blank';
      a.rel = 'noopener';
      a.textContent = source.name;
      li.append(a);
      srcList.append(li);
    }
    detailEl.append(srcTitle, srcList);
  }

  const checkRow = document.createElement('div');
  checkRow.className = 'detail-check';
  const btn = document.createElement('button');
  btn.type = 'button';
  btn.textContent = isEarned ? 'Mark as not earned' : 'Mark as earned';
  btn.addEventListener('click', () => toggleEarned(trophy));
  checkRow.append(btn);
  detailEl.append(checkRow);
}

function renderAll() {
  renderProgress();
  renderRoadmap();
  renderKindChips();
  renderTrophyList();
  renderDetail();
  document.getElementById('spoilerNote').textContent = spoilersHidden
    ? 'Spoiler mode on: story trophies stay hidden until earned.'
    : 'Spoiler mode off: every trophy name and description is shown.';
}

function selectTrophy(id, scrollToDetail) {
  selectedId = id;
  renderTrophyList();
  renderDetail();
  if (scrollToDetail) {
    detailEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }
  history.replaceState(null, '', `#trophy-${id}`);
}

function toggleEarned(trophy) {
  if (earned.has(trophy.name)) earned.delete(trophy.name);
  else earned.add(trophy.name);
  saveProgress();
  renderAll();
}

function exportProgress() {
  const payload = {
    app: 'leonida-trophy-guide',
    exportedAt: new Date().toISOString(),
    earned: [...earned].sort(),
  };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'leonida-trophy-progress.json';
  a.click();
  URL.revokeObjectURL(a.href);
}

async function importProgress(file) {
  if (!file) return;
  try {
    const parsed = JSON.parse(await file.text());
    const names = Array.isArray(parsed) ? parsed : parsed.earned;
    if (!Array.isArray(names)) throw new Error('no earned list');
    const known = new Set(trophies.map((t) => t.name));
    earned = new Set(names.filter((n) => typeof n === 'string' && known.has(n)));
    saveProgress();
    renderAll();
  } catch {
    alert('That file is not a Leonida Trophy Guide progress export.');
  }
}

async function loadTrophies() {
  const response = await fetch(DATA_URL);
  const doc = await response.json();
  trophies = doc.trophies ?? doc;
  const hash = location.hash.match(/^#trophy-(\d+)$/);
  if (hash && trophyById(Number(hash[1]))) selectedId = Number(hash[1]);
  else if (trophies.length > 0) selectedId = trophies[0].id;
  renderAll();
  if (location.hash === '#roadmap') {
    document.getElementById('roadmap').scrollIntoView();
  }
}

document.getElementById('search').addEventListener('input', (event) => {
  filters.query = event.target.value.trim();
  renderTrophyList();
});
document.getElementById('gradeFilter').addEventListener('change', (event) => {
  filters.grade = event.target.value;
  renderAll();
});
document.getElementById('statusFilter').addEventListener('change', (event) => {
  filters.status = event.target.value;
  renderAll();
});
document.getElementById('spoilerToggle').addEventListener('change', (event) => {
  spoilersHidden = event.target.checked;
  renderAll();
});
document.getElementById('exportBtn').addEventListener('click', exportProgress);
document.getElementById('importFile').addEventListener('change', (event) => {
  importProgress(event.target.files[0]);
  event.target.value = '';
});
document.getElementById('resetBtn').addEventListener('click', () => {
  if (confirm('Clear all earned trophies?')) {
    earned = new Set();
    saveProgress();
    renderAll();
  }
});

loadTrophies();
