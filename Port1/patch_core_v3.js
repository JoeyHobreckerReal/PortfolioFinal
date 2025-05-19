
// patch.js - Enhancements and feature additions for Fina Task & Project Manager

document.addEventListener('DOMContentLoaded', () => {
    /* ---------------- Utility Helpers ---------------- */
    const $all = (sel, root=document) => Array.from(root.querySelectorAll(sel));

    /* ----------- Remove Focus & Time UI/Logic ----------- */
    // Remove 'Focus' sort option
    $all('#sort-select option[value="focus"]').forEach(o => o.remove());
    // Remove Focus radio groups in task forms
    $all('.focus-options').forEach(el => el.closest('.form-group')?.remove());
    // Remove deadline time inputs/buttons
    $all('.deadline-container .toggle-time-btn, .deadline-container .time-container').forEach(el => el.remove());

    /* ------------- Remove Waiting Reason UI ------------- */
    $all('#waiting-reason-container, #edit-waiting-reason-container, #project-waiting-reason-container, #edit-project-waiting-reason-container').forEach(el => el.remove());
    // Hide waiting reason management section
    const manageReasons = document.querySelector('#manage-reasons')?.closest('.manage-section');
    if (manageReasons) manageReasons.style.display = 'none';

    /* --------------- Remove Project Tags ---------------- */
    $all('[id$="project-tags"]').forEach(el => el.closest('.form-group')?.remove());
    // Remove project tags display in detail
    const projTagsEl = document.getElementById('project-detail-tags');
    if (projTagsEl) projTagsEl.style.display = 'none';

    /* -------- Remove Project Progress Indicator -------- */
    const projProgressSection = document.getElementById('project-progress')?.parentElement;
    if (projProgressSection) projProgressSection.remove();

    /* ---------- Improved Priority Calculation ----------- */
    if (typeof calculatePriority === 'function') {
        window.calculatePriority = function(task) {
            const importanceWeight = { super: 5, high: 3, normal: 1 }[task.importance || 'normal'];
            const energyWeight = { low: 2, medium: 1, high: 0 }[task.energy || 'medium'];
            let deadlineScore = 0;
            if (task.deadline) {
                const days = Math.floor((new Date(task.deadline) - new Date()) / (1000*60*60*24));
                if (days <= 0) deadlineScore = 5;
                else if (days <= 1) deadlineScore = 4;
                else if (days <= 3) deadlineScore = 3;
                else if (days <= 7) deadlineScore = 2;
                else deadlineScore = 1;
            }
            return importanceWeight * 3 + deadlineScore * 2 + energyWeight;
        };
    }

    /* ---------- Task-Project Status Syncing ------------ */
    if (typeof addNewTask === 'function') {
        const originalAddNewTask = addNewTask;
        window.addNewTask = function() {
            const projectSelect = document.getElementById('task-project');
            if (projectSelect && projectSelect.value) {
                const proj = projects.find(p => p.id === projectSelect.value);
                if (proj) {
                    const statusInput = document.querySelector(`input[name="status"][value="${proj.status}"]`);
                    if (statusInput) statusInput.checked = true;
                }
            }
            originalAddNewTask();
        };
    }

    /* ------------- Waiting List Quick Action ------------ */
    if (typeof renderTaskCard === 'function') {
        const originalRenderTaskCard = renderTaskCard;
        window.renderTaskCard = function(task) {
            const card = originalRenderTaskCard(task);
            if (card && !card.querySelector('.wait-btn')) {
                const actions = card.querySelector('.task-actions') || card;
                const waitBtn = document.createElement('button');
                waitBtn.className = 'task-action-btn wait-btn';
                waitBtn.title = 'Move to Waiting';
                waitBtn.innerHTML = '<i class="fas fa-hourglass-half"></i>';
                waitBtn.addEventListener('click', () => {
                    task.status = 'waiting';
                    saveToIndexedDB(STORES.TASKS, tasks);
                    renderTasks();
                });
                actions.appendChild(waitBtn);
            }
            return card;
        };
    }

    /* ---------- Waiting View Aggregation Fix ------------ */
    if (typeof renderTasks === 'function') {
        const originalRenderTasks = renderTasks;
        window.renderTasks = function() {
            if (currentView === 'waiting') {
                const waitingProjectIds = projects.filter(p => p.status === 'waiting').map(p => p.id);
                const combined = tasks.filter(t => (t.status === 'waiting') || (waitingProjectIds.includes(t.projectId) && t.status !== 'completed'));
                const originalTasks = tasks.slice();
                tasks.length = 0;
                tasks.push(...combined);
                originalRenderTasks();
                tasks.length = 0;
                tasks.push(...originalTasks);
            } else {
                originalRenderTasks();
            }
        };
    }

    /* --------------- Project State Toggle --------------- */
    if (typeof renderProjectCard === 'function') {
        const originalRenderProjectCard = renderProjectCard;
        window.renderProjectCard = function(project) {
            const card = originalRenderProjectCard(project);
            if (card && !card.querySelector('.toggle-status-btn')) {
                const toggleBtn = document.createElement('button');
                toggleBtn.className = 'project-toggle-status toggle-status-btn';
                toggleBtn.title = 'Toggle Active/Waiting';
                toggleBtn.innerHTML = '<i class="fas fa-exchange-alt"></i>';
                toggleBtn.addEventListener('click', () => {
                    project.status = project.status === 'waiting' ? 'active' : 'waiting';
                    saveToIndexedDB(STORES.PROJECTS, projects);
                    renderProjects();
                    if (currentProjectId === project.id) {
                        projectDetailStatus.textContent = project.status.charAt(0).toUpperCase() + project.status.slice(1);
                    }
                });
                card.appendChild(toggleBtn);
            }
            return card;
        };
    }

    /* ----- Sidebar: hide completed projects filter ------ */
    if (typeof renderProjectFilters === 'function') {
        const originalRenderProjectFilters = renderProjectFilters;
        window.renderProjectFilters = function() {
            const original = projects.slice();
            const visible = projects.filter(p => p.status !== 'completed');
            projects.length = 0;
            projects.push(...visible);
            originalRenderProjectFilters();
            projects.length = 0;
            projects.push(...original);
        };
    }

    /* ----------- Fullscreen Rich Text Notes ------------- */
    // Inject overlay HTML
    const overlay = document.createElement('div');
    overlay.id = 'note-fullscreen-overlay';
    overlay.style = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,.8);display:none;z-index:1000;';
    overlay.innerHTML = `
       <div style="position:absolute;top:5%;left:50%;transform:translateX(-50%);width:90%;height:90%;background:var(--secondary-color);border-radius:8px;display:flex;flex-direction:column;">
           <div id="note-editor-toolbar"></div>
           <div id="note-editor" style="flex:1;"></div>
           <div style="padding:10px;text-align:right;">
               <button id="note-editor-save" class="save-btn">Save</button>
               <button id="note-editor-cancel" class="cancel-btn">Cancel</button>
           </div>
       </div>`;
    document.body.appendChild(overlay);

    // Load Quill
    const quillLink = document.createElement('link');
    quillLink.rel = 'stylesheet';
    quillLink.href = 'https://cdn.quilljs.com/1.3.6/quill.snow.css';
    document.head.appendChild(quillLink);

    const quillScript = document.createElement('script');
    quillScript.src = 'https://cdn.quilljs.com/1.3.6/quill.min.js';
    quillScript.onload = () => {
        window.quillEditor = new Quill('#note-editor', {
            theme: 'snow',
            modules: {
                toolbar: [
                    ['bold', 'italic', 'underline'],
                    [{ list: 'ordered' }, { list: 'bullet' }]
                ]
            }
        });
    };
    document.body.appendChild(quillScript);

    window.openFullscreenNote = function(note) {
        overlay.style.display = 'block';
        overlay.dataset.noteId = note.id;
        quillEditor.root.innerHTML = note.content || '';
    };

    overlay.querySelector('#note-editor-cancel').addEventListener('click', () => {
        overlay.style.display = 'none';
    });

    overlay.querySelector('#note-editor-save').addEventListener('click', () => {
        const id = overlay.dataset.noteId;
        const note = notes.find(n => n.id === id);
        if (note) {
            note.content = quillEditor.root.innerHTML;
            saveToIndexedDB(STORES.NOTES, notes);
            renderNotes(currentProjectId);
        }
        overlay.style.display = 'none';
    });

    /* --- Capture click on note cards to open editor ---- */
    document.addEventListener('click', (e) => {
        const card = e.target.closest('.note-card');
        if (card && card.dataset.id) {
            const note = notes.find(n => n.id === card.dataset.id);
            if (note) openFullscreenNote(note);
        }
    });
});


/* --- Waiting tab: show only stand‑alone waiting tasks (no project) --- */
if (typeof renderTasks === 'function') {
  const _origRenderTasks_noProjectWaiting = renderTasks;
  window.renderTasks = function () {
    if (currentView === 'waiting') {
      const originalTasks = tasks.slice();                        // backup
      const filtered = tasks.filter(
        t => t.status === 'waiting' && !t.projectId               // no project linked
      );
      tasks.length = 0;
      tasks.push(...filtered);
      _origRenderTasks_noProjectWaiting();                        // render list
      tasks.length = 0;
      tasks.push(...originalTasks);                               // restore
    } else {
      _origRenderTasks_noProjectWaiting();
    }
  };
}

