/* ==============================
   lesson.js — Lesson View + YouTube Video
   ============================== */

let lessonData = null;

// ---- Toggle State ----
var TOGGLE_DEFAULTS = { pali: true, thai_reading: true, roman: false, thai: false };

function getToggles() {
    return AppState.get('verseToggles', TOGGLE_DEFAULTS);
}

function setToggles(toggles) {
    AppState.set('verseToggles', toggles);
}

// ---- Init ----
document.addEventListener('DOMContentLoaded', async function () {
    var params = new URLSearchParams(window.location.search);

    // Read from URL params first, fall back to localStorage
    var nikaya = params.get('nikaya') || AppState.get('selectedNikaya');
    var type = params.get('type') || AppState.get('selectedType');
    var code = params.get('code');

    if (!nikaya || !type || !code) {
        window.location.href = 'index.html';
        return;
    }

    // Save to localStorage so other pages stay in sync
    AppState.set('selectedNikaya', nikaya);
    AppState.set('selectedType', type);

    // Breadcrumb
    renderBreadcrumb([
        { label: '🏠 หน้าแรก', href: 'index.html' },
        { label: getNikayaLabel(nikaya), href: 'choose-type.html' },
        { label: getTypeLabel(type), href: 'lessons.html' },
        { label: 'กำลังโหลด...' }
    ]);

    // Load lesson JSON
    try {
        var res = await fetch('data/' + nikaya + '/' + type + '/' + code + '.json');
        lessonData = await res.json();

        // Update title
        var titleEl = document.getElementById('lesson-title');
        if (titleEl) titleEl.textContent = lessonData.title;

        // Update breadcrumb last item
        renderBreadcrumb([
            { label: '🏠 หน้าแรก', href: 'index.html' },
            { label: getNikayaLabel(nikaya), href: 'choose-type.html' },
            { label: getTypeLabel(type), href: 'lessons.html' },
            { label: lessonData.title }
        ]);

        renderYouTube();
        renderToggles();
        renderVerses();

    } catch (e) {
        console.error('Failed to load lesson:', e);
        var verseList = document.getElementById('verse-list');
        if (verseList) {
            verseList.innerHTML = '<div class="empty-state"><span class="icon">⚠️</span><p>ไม่สามารถโหลดบทสวดได้</p></div>';
        }
    }
});

// ---- YouTube Embed ----
function renderYouTube() {
    var container = document.getElementById('youtube-container');
    var playerDiv = document.getElementById('youtube-player');
    if (!container || !playerDiv || !lessonData) return;

    if (lessonData.youtube_id) {
        container.style.display = 'block';
        playerDiv.innerHTML = '<iframe width="100%" height="100%" ' +
            'src="https://www.youtube.com/embed/' + lessonData.youtube_id + '?rel=0&modestbranding=1" ' +
            'title="วิดีโอประกอบการสอนสวด" frameborder="0" ' +
            'allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" ' +
            'referrerpolicy="strict-origin-when-cross-origin" allowfullscreen ' +
            'style="width:100%; height:100%; border-radius:12px;"></iframe>';
    } else {
        container.style.display = 'none';
    }
}

// ---- Render Toggles ----
function renderToggles() {
    var bar = document.getElementById('toggle-bar');
    if (!bar) return;

    var toggles = getToggles();
    var labels = {
        pali: 'บาลี',
        thai_reading: 'คำอ่านไทย',
        roman: 'โรมัน',
        thai: 'ความหมายไทย'
    };

    var html = '';
    var keys = Object.keys(labels);
    for (var i = 0; i < keys.length; i++) {
        var key = keys[i];
        var label = labels[key];
        html += '<button class="toggle-chip ' + (toggles[key] ? 'active' : '') + '" data-toggle="' + key + '">';
        html += '<span class="check">✓</span> ' + label;
        html += '</button>';
    }
    bar.innerHTML = html;

    bar.querySelectorAll('.toggle-chip').forEach(function (chip) {
        chip.addEventListener('click', function () {
            var key = chip.dataset.toggle;
            var toggles = getToggles();
            toggles[key] = !toggles[key];
            setToggles(toggles);
            chip.classList.toggle('active', toggles[key]);
            applyToggles();
        });
    });
}

function applyToggles() {
    var toggles = getToggles();
    document.querySelectorAll('.verse-field').forEach(function (field) {
        var type = field.dataset.field;
        if (type && toggles.hasOwnProperty(type)) {
            field.classList.toggle('hidden', !toggles[type]);
        }
    });
}

// ---- Render Verses ----
function renderVerses() {
    var list = document.getElementById('verse-list');
    if (!list || !lessonData) return;

    var toggles = getToggles();
    var html = '';

    for (var i = 0; i < lessonData.verses.length; i++) {
        var v = lessonData.verses[i];

        const renderPlaceholder = (text) => {
            text = text.replace(/\[__MY_NAME__\]/g, '<input type="text" class="inline-input my-name-input" placeholder="ฉายาตนเอง">');
            text = text.replace(/\[__UPAJJHAYA_NAME__\]/g, '<input type="text" class="inline-input upajjhaya-input" placeholder="ฉายาอุปัชฌาย์">');
            return text;
        };

        // Convert newlines (\n) to <br> for display
        var paliText = renderPlaceholder((v.pali || '').replace(/\n/g, '<br>'));
        var thaiReadingText = renderPlaceholder((v.thai_reading || '').replace(/\n/g, '<br>'));
        var romanText = renderPlaceholder((v.roman || '').replace(/\n/g, '<br>'));
        var thaiText = renderPlaceholder((v.thai || '').replace(/\n/g, '<br>'));

        html += '<div class="verse-card" id="verse-' + i + '" data-index="' + i + '">';
        html += '<div class="verse-header">';
        html += '<span class="verse-num">' + v.order + '</span>';
        html += '<span class="verse-section">' + v.section + '</span>';
        html += '</div>';

        html += '<div class="verse-field pali ' + (toggles.pali ? '' : 'hidden') + '" data-field="pali">';
        html += '<div class="verse-field-label">บาลี (Pāli)</div>';
        html += '<div class="verse-field-text">' + paliText + '</div>';
        html += '</div>';

        html += '<div class="verse-field thai-reading ' + (toggles.thai_reading ? '' : 'hidden') + '" data-field="thai_reading">';
        html += '<div class="verse-field-label">คำอ่านไทย</div>';
        html += '<div class="verse-field-text">' + thaiReadingText + '</div>';
        html += '</div>';

        html += '<div class="verse-field roman ' + (toggles.roman ? '' : 'hidden') + '" data-field="roman">';
        html += '<div class="verse-field-label">Romanization</div>';
        html += '<div class="verse-field-text">' + romanText + '</div>';
        html += '</div>';

        html += '<div class="verse-field thai-meaning ' + (toggles.thai ? '' : 'hidden') + '" data-field="thai">';
        html += '<div class="verse-field-label">ความหมายไทย</div>';
        html += '<div class="verse-field-text">' + thaiText + '</div>';
        html += '</div>';

        html += '</div>';
    }

    list.innerHTML = html;

    // Sync inline inputs with persistent state
    var savedMyName = AppState.get('myName', '');
    var savedUpajjhaya = AppState.get('upajjhayaName', '');

    document.querySelectorAll('.my-name-input').forEach(function (input) {
        input.value = savedMyName;
        input.addEventListener('input', function (e) {
            AppState.set('myName', e.target.value);
            document.querySelectorAll('.my-name-input').forEach(function (el) {
                if (el !== e.target) el.value = e.target.value;
            });
        });
    });

    document.querySelectorAll('.upajjhaya-input').forEach(function (input) {
        input.value = savedUpajjhaya;
        input.addEventListener('input', function (e) {
            AppState.set('upajjhayaName', e.target.value);
            document.querySelectorAll('.upajjhaya-input').forEach(function (el) {
                if (el !== e.target) el.value = e.target.value;
            });
        });
    });
}
