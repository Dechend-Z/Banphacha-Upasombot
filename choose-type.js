/* ==============================
   choose-type.js — Ordination Type Selection
   ============================== */

document.addEventListener('DOMContentLoaded', () => {
    const nikaya = AppState.get('selectedNikaya');
    if (!nikaya) {
        window.location.href = 'index.html';
        return;
    }

    // Update page title
    const titleEl = document.getElementById('type-page-title');
    if (titleEl) titleEl.textContent = getNikayaLabel(nikaya);

    const subtitleEl = document.getElementById('type-page-subtitle');
    if (subtitleEl) subtitleEl.textContent = 'เลือกประเภทการบวช';

    // Breadcrumb
    renderBreadcrumb([
        { label: '🏠 หน้าแรก', href: 'index.html' },
        { label: getNikayaLabel(nikaya) }
    ]);

    // Card clicks
    document.querySelectorAll('[data-type]').forEach(card => {
        card.addEventListener('click', () => {
            const type = card.dataset.type;
            AppState.set('selectedType', type);
            window.location.href = 'lessons.html';
        });
    });
});
