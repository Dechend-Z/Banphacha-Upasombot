/* ==============================
   lessons.js — Lessons List
   ============================== */

document.addEventListener('DOMContentLoaded', async () => {
  const nikaya = AppState.get('selectedNikaya');
  const type = AppState.get('selectedType');

  if (!nikaya || !type) {
    window.location.href = 'index.html';
    return;
  }

  // Update page title
  const titleEl = document.getElementById('lessons-page-title');
  if (titleEl) titleEl.textContent = `${getNikayaLabel(nikaya)} — ${getTypeLabel(type)}`;

  // Breadcrumb
  renderBreadcrumb([
    { label: '🏠 หน้าแรก', href: 'index.html' },
    { label: getNikayaLabel(nikaya), href: 'choose-type.html' },
    { label: getTypeLabel(type) }
  ]);

  // Load lessons
  const listEl = document.getElementById('lessons-list');
  const searchEl = document.getElementById('lessons-search');

  try {
    const res = await fetch(`data/${nikaya}/${type}/lessons.json`);
    const lessons = await res.json();

    function renderLessons(filter) {
      filter = filter || '';
      const filtered = filter
        ? lessons.filter(function (l) { return l.title_th.toLowerCase().indexOf(filter.toLowerCase()) !== -1; })
        : lessons;

      if (!filtered.length) {
        listEl.innerHTML = '<div class="empty-state"><span class="icon">📭</span><p>ไม่พบบทสวดที่ค้นหา</p></div>';
        return;
      }

      var html = '';
      for (var i = 0; i < filtered.length; i++) {
        var lesson = filtered[i];
        html += '<a class="lesson-item" href="lesson?nikaya=' + nikaya + '&type=' + type + '&code=' + lesson.code + '">';
        html += '<span class="lesson-num">' + (i + 1) + '</span>';
        html += '<span class="lesson-title">' + lesson.title_th + '</span>';
        html += '<span class="lesson-arrow">→</span>';
        html += '</a>';
      }
      listEl.innerHTML = html;
    }

    renderLessons();

    if (searchEl) {
      searchEl.addEventListener('input', function (e) {
        renderLessons(e.target.value.trim());
      });
    }

  } catch (e) {
    console.error('Failed to load lessons:', e);
    listEl.innerHTML = '<div class="empty-state"><span class="icon">⚠️</span><p>ไม่สามารถโหลดรายการบทสวดได้</p></div>';
  }
});
