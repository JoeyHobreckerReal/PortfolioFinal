
// patch.js v5 - Hide energy/focus/waiting reason UI everywhere + waiting view fix
document.addEventListener('DOMContentLoaded', () => {
    /* ------------------- Hide Elements via CSS ------------------- */
    const style = document.createElement('style');
    style.textContent = `
        .task-energy, .task-focus,
        .task-meta-item.task-energy,
        .task-meta-item.task-focus,
        .task-waiting-reason,
        .task-waiting,
        .next-action-meta .energy-low,
        .next-action-meta .energy-medium,
        .next-action-meta .energy-high,
        .next-action-meta .focus-low,
        .next-action-meta .focus-medium,
        .next-action-meta .focus-high,
        .energy-low, .energy-medium, .energy-high,
        .focus-low, .focus-medium, .focus-high,
        .waiting-next-action
        { display:none !important; }
    `;
    document.head.appendChild(style);

    /* ------------------ Waiting view aggregation fix -------------- */
    if (typeof renderTasks === 'function') {
        const originalRenderTasks = renderTasks;
        window.renderTasks = function() {
            if (currentView === 'waiting') {
                // clone tasks
                const waitingProjectIds = projects.filter(p => p.status === 'waiting').map(p => p.id);
                const combined = tasks.map(t => {
                    if (waitingProjectIds.includes(t.projectId) && t.status === 'active') {
                        return { ...t, status: 'waiting' };
                    }
                    return t;
                });
                const backup = tasks.slice();
                tasks.length = 0;
                tasks.push(...combined);
                originalRenderTasks();
                tasks.length = 0;
                tasks.push(...backup);
            } else {
                originalRenderTasks();
            }
        };
    }

    /* ------------------ Re‑hide form groups ----------------------- */
    const hideSelectors = [
        '.energy-options', '.focus-options',
        '#waiting-reason-container', '#edit-waiting-reason-container',
        '#project-waiting-reason-container', '#edit-project-waiting-reason-container'
    ];
    hideSelectors.forEach(sel => {
        document.querySelectorAll(sel).forEach(el => {
            el.closest('.form-group') ? el.closest('.form-group').style.display='none' : el.style.display='none';
        });
    });

    /* ------------------ Load previous feature patch --------------- */
    const core = document.createElement('script');
    core.src = 'patch_core_v3.js';
    document.body.appendChild(core);
});
