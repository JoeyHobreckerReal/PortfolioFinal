// Task and Project Manager Application

// Global variables
let tasks = [];
let quickTasks = [];
let tags = [];
let waitingReasons = [];
let projects = [];
let concepts = [];
let notes = [];
let files = {}

// Add suggested tag element
function addSuggestedTag(tag, container, inputElement, value = tag) {
    const tagElement = document.createElement('div');
    tagElement.className = 'suggested-tag';
    tagElement.textContent = tag;
    
    tagElement.addEventListener('click', () => {
        // Get current input value
        const currentValue = inputElement.value.trim();
        
        // Split by commas
        const parts = currentValue.split(',');
        
        // Replace last part with selected tag
        if (parts.length > 0) {
            parts[parts.length - 1] = value;
        } else {
            parts.push(value);
        }
        
        // Join back with commas and add trailing comma and space
        inputElement.value = parts.join(',') + ', ';
        
        // Focus back on input
        inputElement.focus();
        
        // Render suggested tags again
        if (container === suggestedTags) {
            renderSuggestedTags();
        } else if (container === editSuggestedTags) {
            renderEditSuggestedTags();
        } else if (container.id === 'project-suggested-tags') {
            renderProjectSuggestedTags();
        } else if (container.id === 'edit-project-suggested-tags') {
            renderEditProjectSuggestedTags();
        }
    });
    
    container.appendChild(tagElement);
}

// Render suggested waiting reasons
function renderSuggestedWaitingReasons() {
    const reasonInput = document.getElementById('waiting-reason');
    const currentInput = reasonInput.value.trim().toLowerCase();
    
    // Clear suggested reasons
    suggestedReasons.innerHTML = '';
    
    // If no input, show all reasons
    if (!currentInput) {
        waitingReasons.slice(0, 5).forEach(reason => {
            addSuggestedReason(reason, suggestedReasons, reasonInput);
        });
        return;
    }
    
    // Filter reasons that match current input
    const matchingReasons = waitingReasons.filter(reason => 
        reason.toLowerCase().includes(currentInput) && 
        reason.toLowerCase() !== currentInput
    );
    
    // Add current reason if it's new
    if (!waitingReasons.includes(currentInput) && currentInput.length > 0) {
        addSuggestedReason(currentInput + ' (new)', suggestedReasons, reasonInput, currentInput);
    }
    
    // Add matching reasons
    matchingReasons.slice(0, 5).forEach(reason => {
        addSuggestedReason(reason, suggestedReasons, reasonInput);
    });
}

// Render edit suggested waiting reasons
function renderEditSuggestedWaitingReasons() {
    const reasonInput = document.getElementById('edit-waiting-reason');
    const currentInput = reasonInput.value.trim().toLowerCase();
    
    // Clear suggested reasons
    editSuggestedReasons.innerHTML = '';
    
    // If no input, show all reasons
    if (!currentInput) {
        waitingReasons.slice(0, 5).forEach(reason => {
            addSuggestedReason(reason, editSuggestedReasons, reasonInput);
        });
        return;
    }
    
    // Filter reasons that match current input
    const matchingReasons = waitingReasons.filter(reason => 
        reason.toLowerCase().includes(currentInput) && 
        reason.toLowerCase() !== currentInput
    );
    
    // Add current reason if it's new
    if (!waitingReasons.includes(currentInput) && currentInput.length > 0) {
        addSuggestedReason(currentInput + ' (new)', editSuggestedReasons, reasonInput, currentInput);
    }
    
    // Add matching reasons
    matchingReasons.slice(0, 5).forEach(reason => {
        addSuggestedReason(reason, editSuggestedReasons, reasonInput);
    });
}

// Render project suggested waiting reasons
function renderProjectSuggestedWaitingReasons() {
    const reasonInput = document.getElementById('project-waiting-reason');
    const currentInput = reasonInput.value.trim().toLowerCase();
    const suggestedReasonsContainer = document.getElementById('project-suggested-reasons');
    
    // Clear suggested reasons
    suggestedReasonsContainer.innerHTML = '';
    
    // If no input, show all reasons
    if (!currentInput) {
        waitingReasons.slice(0, 5).forEach(reason => {
            addSuggestedReason(reason, suggestedReasonsContainer, reasonInput);
        });
        return;
    }
    
    // Filter reasons that match current input
    const matchingReasons = waitingReasons.filter(reason => 
        reason.toLowerCase().includes(currentInput) && 
        reason.toLowerCase() !== currentInput
    );
    
    // Add current reason if it's new
    if (!waitingReasons.includes(currentInput) && currentInput.length > 0) {
        addSuggestedReason(currentInput + ' (new)', suggestedReasonsContainer, reasonInput, currentInput);
    }
    
    // Add matching reasons
    matchingReasons.slice(0, 5).forEach(reason => {
        addSuggestedReason(reason, suggestedReasonsContainer, reasonInput);
    });
}

// Render edit project suggested waiting reasons
function renderEditProjectSuggestedWaitingReasons() {
    const reasonInput = document.getElementById('edit-project-waiting-reason');
    const currentInput = reasonInput.value.trim().toLowerCase();
    const suggestedReasonsContainer = document.getElementById('edit-project-suggested-reasons');
    
    // Clear suggested reasons
    suggestedReasonsContainer.innerHTML = '';
    
    // If no input, show all reasons
    if (!currentInput) {
        waitingReasons.slice(0, 5).forEach(reason => {
            addSuggestedReason(reason, suggestedReasonsContainer, reasonInput);
        });
        return;
    }
    
    // Filter reasons that match current input
    const matchingReasons = waitingReasons.filter(reason => 
        reason.toLowerCase().includes(currentInput) && 
        reason.toLowerCase() !== currentInput
    );
    
    // Add current reason if it's new
    if (!waitingReasons.includes(currentInput) && currentInput.length > 0) {
        addSuggestedReason(currentInput + ' (new)', suggestedReasonsContainer, reasonInput, currentInput);
    }
    
    // Add matching reasons
    matchingReasons.slice(0, 5).forEach(reason => {
        addSuggestedReason(reason, suggestedReasonsContainer, reasonInput);
    });
}

// Add suggested reason element
function addSuggestedReason(reason, container, inputElement, value = reason) {
    const reasonElement = document.createElement('div');
    reasonElement.className = 'suggested-tag';
    reasonElement.textContent = reason;
    
    reasonElement.addEventListener('click', () => {
        inputElement.value = value;
        inputElement.focus();
        
        // Render suggested reasons again
        if (container === suggestedReasons) {
            renderSuggestedWaitingReasons();
        } else if (container === editSuggestedReasons) {
            renderEditSuggestedWaitingReasons();
        } else if (container.id === 'project-suggested-reasons') {
            renderProjectSuggestedWaitingReasons();
        } else if (container.id === 'edit-project-suggested-reasons') {
            renderEditProjectSuggestedWaitingReasons();
        }
    });
    
    container.appendChild(reasonElement);
}

// Update priorities for all tasks
function updateAllPriorities() {
    let changed = false;
    
    tasks.forEach(task => {
        const newPriority = calculatePriority(task);
        if (task.priority !== newPriority) {
            task.priority = newPriority;
            changed = true;
        }
    });
    
    if (changed) {
        saveToIndexedDB(STORES.TASKS, tasks);
        if (currentSort === 'priority') {
            renderTasks();
        }
    }
}

// Show toast message
function showToast(message, type = 'info') {
    // Create toast element
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    // Add icon based on type
    let icon = 'info-circle';
    if (type === 'success') icon = 'check-circle';
    if (type === 'error') icon = 'exclamation-circle';
    if (type === 'warning') icon = 'exclamation-triangle';
    
    toast.innerHTML = `
        <div class="toast-content">
            <i class="fas fa-${icon}"></i>
            <span>${message}</span>
        </div>
        <button class="toast-close"><i class="fas fa-times"></i></button>
    `;
    
    // Add close button functionality
    const closeButton = toast.querySelector('.toast-close');
    closeButton.addEventListener('click', () => {
        document.body.removeChild(toast);
    });
    
    // Add to body
    document.body.appendChild(toast);
    
    // Position the toast
    toast.style.bottom = '20px';
    toast.style.right = '20px';
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        if (document.body.contains(toast)) {
            toast.style.opacity = '0';
            setTimeout(() => {
                if (document.body.contains(toast)) {
                    document.body.removeChild(toast);
                }
            }, 300);
        }
    }, 3000);
}

// Helper Functions

// Format date
function formatDate(date) {
    return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
    });
}

// Truncate text with ellipsis
function truncateText(text, maxLength) {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
}

// Capitalize first letter
function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
}

// Initialize the application
document.addEventListener('DOMContentLoaded', init);;
let currentView = 'active'; // 'active', 'waiting', 'completed', 'quick', 'projects', 'concepts'
let currentSort = 'priority'; // 'priority', 'deadline', 'importance', 'energy', 'focus', 'created'
let activeFilters = [];
let noteActiveFilters = [];
let projectFilters = [];
let currentProjectId = null;
let currentConceptId = null;
let projectsViewMode = 'grid'; // 'grid' or 'list'
let notesSort = 'date'; // 'date', 'title', 'tags'

// IndexedDB variables
let db;
const DB_NAME = 'finaTaskManager';
const DB_VERSION = 1;
const STORES = {
    TASKS: 'tasks',
    QUICK_TASKS: 'quickTasks',
    TAGS: 'tags',
    WAITING_REASONS: 'waitingReasons',
    PROJECTS: 'projects',
    CONCEPTS: 'concepts',
    NOTES: 'notes',
    FILES: 'files',
    SETTINGS: 'settings'
};

// DOM Elements - Main UI Elements
const addTaskBtn = document.getElementById('add-task-btn');
const quickAddBtn = document.getElementById('quick-add-btn');
const newProjectBtn = document.getElementById('new-project-btn');
const newConceptBtn = document.getElementById('new-concept-btn');
const clearCompletedBtn = document.getElementById('clear-completed-btn');
const addTaskModal = document.getElementById('add-task-modal');
const editTaskModal = document.getElementById('edit-task-modal');
const addProjectModal = document.getElementById('add-project-modal');
const editProjectModal = document.getElementById('edit-project-modal');
const addNoteModal = document.getElementById('add-note-modal');
const editNoteModal = document.getElementById('edit-note-modal');
const taskForm = document.getElementById('task-form');
const editTaskForm = document.getElementById('edit-task-form');
const projectForm = document.getElementById('project-form');
const editProjectForm = document.getElementById('edit-project-form');
const noteForm = document.getElementById('note-form');
const editNoteForm = document.getElementById('edit-note-form');
const tasksList = document.getElementById('tasks-list');
const quickTaskArea = document.getElementById('quick-task-area');
const conceptArea = document.getElementById('concept-area');
const projectsArea = document.getElementById('projects-area');
const projectDetail = document.getElementById('project-detail');
const conceptDetail = document.getElementById('concept-detail');
const quickTaskInput = document.getElementById('quick-task-input');
const conceptTitleInput = document.getElementById('concept-title-input');
const conceptInput = document.getElementById('concept-input');
const quickTasksList = document.getElementById('quick-tasks-list');
const conceptsList = document.getElementById('concepts-list');
const projectsGrid = document.getElementById('projects-grid');
const projectsList = document.getElementById('projects-list');
const notesGrid = document.getElementById('notes-grid');
const closeQuickTaskBtn = document.getElementById('close-quick-task-btn');
const closeConceptBtn = document.getElementById('close-concept-btn');
const sortSelect = document.getElementById('sort-select');
const tagFilters = document.getElementById('tag-filters');
const projectFiltersElement = document.getElementById('project-filters');
const noteTagFilters = document.getElementById('note-tag-filters');
const manageTags = document.getElementById('manage-tags');
const manageReasons = document.getElementById('manage-reasons');
const suggestedTags = document.getElementById('suggested-tags');
const suggestedReasons = document.getElementById('suggested-reasons');
const editSuggestedTags = document.getElementById('edit-suggested-tags');
const editSuggestedReasons = document.getElementById('edit-suggested-reasons');
const filesList = document.getElementById('files-list');
const fileUpload = document.getElementById('file-upload');

// DOM Elements - View Buttons
const activeViewBtn = document.getElementById('active-view-btn');
const waitingViewBtn = document.getElementById('waiting-view-btn');
const completedViewBtn = document.getElementById('completed-view-btn');
const quickTasksViewBtn = document.getElementById('quick-tasks-view-btn');
const projectsViewBtn = document.getElementById('projects-view-btn');
const conceptsViewBtn = document.getElementById('concepts-view-btn');

// DOM Elements - Project Detail Elements
const backToProjectsBtn = document.getElementById('back-to-projects-btn');
const editProjectBtn = document.getElementById('edit-project-btn');
const deleteProjectBtn = document.getElementById('delete-project-btn');
const projectDetailTitle = document.getElementById('project-detail-title');
const projectDetailStatus = document.getElementById('project-detail-status');
const projectDetailDates = document.getElementById('project-detail-dates');
const projectDetailTags = document.getElementById('project-detail-tags');
const projectDescription = document.getElementById('project-description');
const nextAction = document.getElementById('next-action');
const projectProgress = document.getElementById('project-progress');
const projectTasksList = document.getElementById('project-tasks-list');
const addProjectTaskBtn = document.getElementById('add-project-task-btn');
const overviewTab = document.getElementById('overview-tab');
const tasksTab = document.getElementById('tasks-tab');
const notesTab = document.getElementById('notes-tab');
const filesTab = document.getElementById('files-tab');
const overviewContent = document.getElementById('overview-content');
const tasksContent = document.getElementById('tasks-content');
const notesContent = document.getElementById('notes-content');
const filesContent = document.getElementById('files-content');
const addNoteBtn = document.getElementById('add-note-btn');
const notesSortSelect = document.getElementById('notes-sort-select');

// DOM Elements - Concept Detail Elements
const backToConceptsBtn = document.getElementById('back-to-concepts-btn');
const editConceptBtn = document.getElementById('edit-concept-btn');
const deleteConceptBtn = document.getElementById('delete-concept-btn');
const conceptToProjectBtn = document.getElementById('concept-to-project-btn');
const conceptDetailTitle = document.getElementById('concept-detail-title');
const conceptDetailDate = document.getElementById('concept-detail-date');
const conceptDetailText = document.getElementById('concept-detail-text');
const saveConceptDetailBtn = document.getElementById('save-concept-detail-btn');

// DOM Elements - Projects View
const gridViewBtn = document.getElementById('grid-view-btn');
const listViewBtn = document.getElementById('list-view-btn');
const projectSearch = document.getElementById('project-search');
const projectStatusFilter = document.getElementById('project-status-filter');

// DOM Elements - Deadline Time Toggle
const toggleTimeBtn = document.getElementById('toggle-time-btn');
const timeContainer = document.getElementById('time-container');
const editToggleTimeBtn = document.getElementById('edit-toggle-time-btn');
const editTimeContainer = document.getElementById('edit-time-container');
const projectToggleTimeBtn = document.getElementById('project-toggle-time-btn');
const projectTimeContainer = document.getElementById('project-time-container');
const editProjectToggleTimeBtn = document.getElementById('edit-project-toggle-time-btn');
const editProjectTimeContainer = document.getElementById('edit-project-time-container');

// Initialize IndexedDB
function initIndexedDB() {
    return new Promise((resolve, reject) => {
        const request = window.indexedDB.open(DB_NAME, DB_VERSION);
        
        request.onerror = event => {
            console.error('IndexedDB error:', event.target.error);
            reject('Error opening database');
        };
        
        request.onsuccess = event => {
            db = event.target.result;
            console.log('Database opened successfully');
            resolve(db);
        };
        
        request.onupgradeneeded = event => {
            const db = event.target.result;
            
            // Create object stores if they don't exist
            if (!db.objectStoreNames.contains(STORES.TASKS)) {
                db.createObjectStore(STORES.TASKS, { keyPath: 'id' });
            }
            
            if (!db.objectStoreNames.contains(STORES.QUICK_TASKS)) {
                db.createObjectStore(STORES.QUICK_TASKS, { keyPath: 'id' });
            }
            
            if (!db.objectStoreNames.contains(STORES.TAGS)) {
                db.createObjectStore(STORES.TAGS, { keyPath: 'tag' });
            }
            
            if (!db.objectStoreNames.contains(STORES.WAITING_REASONS)) {
                db.createObjectStore(STORES.WAITING_REASONS, { keyPath: 'reason' });
            }
            
            if (!db.objectStoreNames.contains(STORES.PROJECTS)) {
                db.createObjectStore(STORES.PROJECTS, { keyPath: 'id' });
            }
            
            if (!db.objectStoreNames.contains(STORES.CONCEPTS)) {
                db.createObjectStore(STORES.CONCEPTS, { keyPath: 'id' });
            }
            
            if (!db.objectStoreNames.contains(STORES.NOTES)) {
                db.createObjectStore(STORES.NOTES, { keyPath: 'id' });
            }
            
            if (!db.objectStoreNames.contains(STORES.FILES)) {
                db.createObjectStore(STORES.FILES, { keyPath: 'id' });
            }
            
            if (!db.objectStoreNames.contains(STORES.SETTINGS)) {
                db.createObjectStore(STORES.SETTINGS, { keyPath: 'key' });
            }
        };
    });
}

// Load data from IndexedDB
async function loadFromIndexedDB() {
    try {
        tasks = await getAll(STORES.TASKS) || [];
        quickTasks = await getAll(STORES.QUICK_TASKS) || [];
        
        // Convert array of tag objects to array of strings
        const tagObjects = await getAll(STORES.TAGS) || [];
        tags = tagObjects.map(tagObj => tagObj.tag);
        
        // Convert array of reason objects to array of strings
        const reasonObjects = await getAll(STORES.WAITING_REASONS) || [];
        waitingReasons = reasonObjects.map(reasonObj => reasonObj.reason);
        
        projects = await getAll(STORES.PROJECTS) || [];
        concepts = await getAll(STORES.CONCEPTS) || [];
        notes = await getAll(STORES.NOTES) || [];
        
        // Load files
        const fileObjects = await getAll(STORES.FILES) || [];
        fileObjects.forEach(fileObj => {
            files[fileObj.id] = fileObj;
        });
        
        // Load settings
        const currentViewSetting = await get(STORES.SETTINGS, 'currentView');
        if (currentViewSetting) currentView = currentViewSetting.value;
        
        const currentSortSetting = await get(STORES.SETTINGS, 'currentSort');
        if (currentSortSetting) currentSort = currentSortSetting.value;
        
        const projectsViewModeSetting = await get(STORES.SETTINGS, 'projectsViewMode');
        if (projectsViewModeSetting) projectsViewMode = projectsViewModeSetting.value;
        
        const notesSortSetting = await get(STORES.SETTINGS, 'notesSort');
        if (notesSortSetting) notesSort = notesSortSetting.value;
        
    } catch (error) {
        console.error('Error loading data from IndexedDB:', error);
    }
}

// Save data to IndexedDB
async function saveToIndexedDB(storeName, data) {
    try {
        if (Array.isArray(data)) {
            // Clear store and add all items
            await clearStore(storeName);
            
            // If it's tags or waiting reasons, convert to objects first
            if (storeName === STORES.TAGS) {
                await Promise.all(data.map(tag => {
                    return add(storeName, { tag });
                }));
            } else if (storeName === STORES.WAITING_REASONS) {
                await Promise.all(data.map(reason => {
                    return add(storeName, { reason });
                }));
            } else {
                await Promise.all(data.map(item => {
                    return add(storeName, item);
                }));
            }
        } else {
            // Add or update a single item
            await put(storeName, data);
        }
    } catch (error) {
        console.error(`Error saving to ${storeName}:`, error);
    }
}

// Save settings to IndexedDB
async function saveSettings(key, value) {
    try {
        await put(STORES.SETTINGS, { key, value });
    } catch (error) {
        console.error(`Error saving setting ${key}:`, error);
    }
}

// IndexedDB helper functions
function getAll(storeName) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, 'readonly');
        const store = transaction.objectStore(storeName);
        const request = store.getAll();
        
        request.onsuccess = event => {
            resolve(event.target.result);
        };
        
        request.onerror = event => {
            reject(event.target.error);
        };
    });
}

function get(storeName, key) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, 'readonly');
        const store = transaction.objectStore(storeName);
        const request = store.get(key);
        
        request.onsuccess = event => {
            resolve(event.target.result);
        };
        
        request.onerror = event => {
            reject(event.target.error);
        };
    });
}

function add(storeName, item) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.add(item);
        
        request.onsuccess = event => {
            resolve(event.target.result);
        };
        
        request.onerror = event => {
            reject(event.target.error);
        };
    });
}

function put(storeName, item) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.put(item);
        
        request.onsuccess = event => {
            resolve(event.target.result);
        };
        
        request.onerror = event => {
            reject(event.target.error);
        };
    });
}

function deleteItem(storeName, key) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.delete(key);
        
        request.onsuccess = event => {
            resolve(event.target.result);
        };
        
        request.onerror = event => {
            reject(event.target.error);
        };
    });
}

function clearStore(storeName) {
    return new Promise((resolve, reject) => {
        const transaction = db.transaction(storeName, 'readwrite');
        const store = transaction.objectStore(storeName);
        const request = store.clear();
        
        request.onsuccess = event => {
            resolve(event.target.result);
        };
        
        request.onerror = event => {
            reject(event.target.error);
        };
    });
}

// Initialize the application
async function init() {
    try {
        await initIndexedDB();
        await loadFromIndexedDB();
        renderTasks();
        renderTagFilters();
        renderProjectFilters();
        renderManageTags();
        renderManageReasons();
        setupEventListeners();
        
        // Apply current view from settings
        setCurrentView(currentView, true);
        
        // Apply current sort from settings
        sortSelect.value = currentSort;
        
        // Apply projects view mode from settings
        setProjectsViewMode(projectsViewMode);
        
        // Apply notes sort from settings
        if (notesSortSelect) notesSortSelect.value = notesSort;
        
        // Add animation classes
        document.querySelectorAll('.task-card, .project-card, .concept-item, .note-card').forEach(el => {
            el.classList.add('fade-in');
        });
    } catch (error) {
        console.error('Initialization error:', error);
    }
}

// Setup event listeners
function setupEventListeners() {
    // Add task button
    addTaskBtn.addEventListener('click', () => {
        openAddTaskModal();
    });
    
    // Quick add button
    quickAddBtn.addEventListener('click', () => {
        setCurrentView('quick');
    });
    
    // New project button
    newProjectBtn.addEventListener('click', () => {
        openAddProjectModal();
    });
    
    // New concept button
    newConceptBtn.addEventListener('click', () => {
        setCurrentView('concepts');
    });
    
    // Clear completed button
    clearCompletedBtn.addEventListener('click', () => {
        clearCompletedTasks();
    });
    
    // Close quick task area
    closeQuickTaskBtn.addEventListener('click', () => {
        setCurrentView('active');
    });
    
    // Close concept area
    closeConceptBtn.addEventListener('click', () => {
        setCurrentView('active');
    });
    
    // Save concept button
    document.getElementById('save-concept-btn').addEventListener('click', () => {
        saveConcept();
    });
    
    // Work out concept button
    document.getElementById('work-out-concept-btn').addEventListener('click', () => {
        workOutConcept();
    });
    
    // Quick task input
    quickTaskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && quickTaskInput.value.trim()) {
            addQuickTask(quickTaskInput.value.trim());
            quickTaskInput.value = '';
        }
    });
    
    // Close modals
    document.querySelectorAll('.close-modal').forEach(closeBtn => {
        closeBtn.addEventListener('click', () => {
            addTaskModal.style.display = 'none';
            editTaskModal.style.display = 'none';
            addProjectModal.style.display = 'none';
            editProjectModal.style.display = 'none';
            addNoteModal.style.display = 'none';
            editNoteModal.style.display = 'none';
        });
    });
    
    // Close modals when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === addTaskModal) {
            addTaskModal.style.display = 'none';
        }
        if (e.target === editTaskModal) {
            editTaskModal.style.display = 'none';
        }
        if (e.target === addProjectModal) {
            addProjectModal.style.display = 'none';
        }
        if (e.target === editProjectModal) {
            editProjectModal.style.display = 'none';
        }
        if (e.target === addNoteModal) {
            addNoteModal.style.display = 'none';
        }
        if (e.target === editNoteModal) {
            editNoteModal.style.display = 'none';
        }
    });
    
    // Task form submission
    taskForm.addEventListener('submit', (e) => {
        e.preventDefault();
        addNewTask();
    });
    
    // Edit task form submission
    editTaskForm.addEventListener('submit', (e) => {
        e.preventDefault();
        saveTaskChanges();
    });
    
    // Project form submission
    projectForm.addEventListener('submit', (e) => {
        e.preventDefault();
        addNewProject();
    });
    
    // Edit project form submission
    editProjectForm.addEventListener('submit', (e) => {
        e.preventDefault();
        saveProjectChanges();
    });
    
    // Note form submission
    noteForm.addEventListener('submit', (e) => {
        e.preventDefault();
        addNewNote();
    });
    
    // Edit note form submission
    editNoteForm.addEventListener('submit', (e) => {
        e.preventDefault();
        saveNoteChanges();
    });
    
    // Cancel buttons
    document.getElementById('cancel-task-btn').addEventListener('click', () => {
        addTaskModal.style.display = 'none';
    });
    
    document.getElementById('cancel-edit-btn').addEventListener('click', () => {
        editTaskModal.style.display = 'none';
    });
    
    document.getElementById('cancel-project-btn').addEventListener('click', () => {
        addProjectModal.style.display = 'none';
    });
    
    document.getElementById('cancel-edit-project-btn').addEventListener('click', () => {
        editProjectModal.style.display = 'none';
    });
    
    document.getElementById('cancel-note-btn').addEventListener('click', () => {
        addNoteModal.style.display = 'none';
    });
    
    document.getElementById('cancel-edit-note-btn').addEventListener('click', () => {
        editNoteModal.style.display = 'none';
    });
    
    // Delete buttons
    document.getElementById('delete-task-btn').addEventListener('click', () => {
        const taskId = document.getElementById('edit-task-id').value;
        deleteTask(taskId);
    });
    
    document.getElementById('delete-project-btn').addEventListener('click', () => {
        deleteProject(currentProjectId);
    });
    
    document.getElementById('delete-project-btn-modal').addEventListener('click', () => {
        const projectId = document.getElementById('edit-project-id').value;
        deleteProject(projectId);
        editProjectModal.style.display = 'none';
    });
    
    document.getElementById('delete-concept-btn').addEventListener('click', () => {
        deleteConcept(currentConceptId);
    });
    
    document.getElementById('delete-note-btn').addEventListener('click', () => {
        const noteId = document.getElementById('edit-note-id').value;
        deleteNote(noteId);
        editNoteModal.style.display = 'none';
    });
    
    // Sort select
    sortSelect.addEventListener('change', () => {
        currentSort = sortSelect.value;
        saveSettings('currentSort', currentSort);
        renderTasks();
    });
    
    // Notes sort select
    if (notesSortSelect) {
        notesSortSelect.addEventListener('change', () => {
            notesSort = notesSortSelect.value;
            saveSettings('notesSort', notesSort);
            renderNotes(currentProjectId);
        });
    }
    
    // View buttons
    activeViewBtn.addEventListener('click', () => {
        setCurrentView('active');
    });
    
    waitingViewBtn.addEventListener('click', () => {
        setCurrentView('waiting');
    });
    
    completedViewBtn.addEventListener('click', () => {
        setCurrentView('completed');
    });
    
    quickTasksViewBtn.addEventListener('click', () => {
        setCurrentView('quick');
    });
    
    projectsViewBtn.addEventListener('click', () => {
        setCurrentView('projects');
    });
    
    conceptsViewBtn.addEventListener('click', () => {
        setCurrentView('concepts');
    });
    
    // Project detail back button
    backToProjectsBtn.addEventListener('click', () => {
        projectDetail.classList.add('hidden');
        projectsArea.classList.remove('hidden');
        currentProjectId = null;
        setCurrentView('projects');
    });
    
    // Concept detail back button
    backToConceptsBtn.addEventListener('click', () => {
        conceptDetail.classList.add('hidden');
        conceptArea.classList.remove('hidden');
        currentConceptId = null;
        setCurrentView('concepts');
    });
    
    // Convert concept to project
    conceptToProjectBtn.addEventListener('click', () => {
        convertConceptToProject();
    });
    
    // Project tabs
    overviewTab.addEventListener('click', () => {
        setActiveTab('overview');
    });
    
    tasksTab.addEventListener('click', () => {
        setActiveTab('tasks');
    });
    
    notesTab.addEventListener('click', () => {
        setActiveTab('notes');
    });
    
    filesTab.addEventListener('click', () => {
        setActiveTab('files');
    });
    
    // Add project task
    addProjectTaskBtn.addEventListener('click', () => {
        openAddTaskModalForProject(currentProjectId);
    });
    
    // Add note button
    addNoteBtn.addEventListener('click', () => {
        openAddNoteModal(currentProjectId);
    });
    
    // Edit project
    editProjectBtn.addEventListener('click', () => {
        openEditProjectModal(currentProjectId);
    });
    
    // Save concept changes
    saveConceptDetailBtn.addEventListener('click', () => {
        saveConceptChanges();
    });
    
    // Projects view toggle
    gridViewBtn.addEventListener('click', () => {
        setProjectsViewMode('grid');
    });
    
    listViewBtn.addEventListener('click', () => {
        setProjectsViewMode('list');
    });
    
    // Project search and filter
    projectSearch.addEventListener('input', () => {
        renderProjects();
    });
    
    projectStatusFilter.addEventListener('change', () => {
        renderProjects();
    });
    
    // File upload
    if (fileUpload) {
        fileUpload.addEventListener('change', (e) => {
            handleFileUpload(e.target.files);
        });
    }
    
    // Project image upload
    document.getElementById('project-image-upload').addEventListener('change', (e) => {
        handleProjectImageUpload(e.target.files[0], 'image-preview');
    });
    
    document.getElementById('edit-project-image-upload').addEventListener('change', (e) => {
        handleProjectImageUpload(e.target.files[0], 'edit-image-preview');
    });
    
    // Status radio buttons (show/hide waiting reason)
    const statusRadios = document.querySelectorAll('input[name="status"]');
    statusRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            const waitingReasonContainer = document.getElementById('waiting-reason-container');
            if (radio.value === 'waiting') {
                waitingReasonContainer.classList.remove('hidden');
                renderSuggestedWaitingReasons();
            } else {
                waitingReasonContainer.classList.add('hidden');
            }
        });
    });
    
    // Edit status radio buttons
    const editStatusRadios = document.querySelectorAll('input[name="edit-status"]');
    editStatusRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            const waitingReasonContainer = document.getElementById('edit-waiting-reason-container');
            if (radio.value === 'waiting') {
                waitingReasonContainer.classList.remove('hidden');
                renderEditSuggestedWaitingReasons();
            } else {
                waitingReasonContainer.classList.add('hidden');
            }
        });
    });
    
    // Project status radio buttons
    const projectStatusRadios = document.querySelectorAll('input[name="project-status"]');
    projectStatusRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            const waitingReasonContainer = document.getElementById('project-waiting-reason-container');
            if (radio.value === 'waiting') {
                waitingReasonContainer.classList.remove('hidden');
                renderProjectSuggestedWaitingReasons();
            } else {
                waitingReasonContainer.classList.add('hidden');
            }
        });
    });
    
    // Edit project status radio buttons
    const editProjectStatusRadios = document.querySelectorAll('input[name="edit-project-status"]');
    editProjectStatusRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            const waitingReasonContainer = document.getElementById('edit-project-waiting-reason-container');
            if (radio.value === 'waiting') {
                waitingReasonContainer.classList.remove('hidden');
                renderEditProjectSuggestedWaitingReasons();
            } else {
                waitingReasonContainer.classList.add('hidden');
            }
        });
    });
    
    // Tags input
    document.getElementById('task-tags').addEventListener('input', () => {
        renderSuggestedTags();
    });
    
    document.getElementById('edit-task-tags').addEventListener('input', () => {
        renderEditSuggestedTags();
    });
    
    document.getElementById('project-tags').addEventListener('input', () => {
        renderProjectSuggestedTags();
    });
    
    document.getElementById('edit-project-tags').addEventListener('input', () => {
        renderEditProjectSuggestedTags();
    });
    
    // Waiting reason input
    document.getElementById('waiting-reason').addEventListener('input', () => {
        renderSuggestedWaitingReasons();
    });
    
    document.getElementById('edit-waiting-reason').addEventListener('input', () => {
        renderEditSuggestedWaitingReasons();
    });
    
    document.getElementById('project-waiting-reason').addEventListener('input', () => {
        renderProjectSuggestedWaitingReasons();
    });
    
    document.getElementById('edit-project-waiting-reason').addEventListener('input', () => {
        renderEditProjectSuggestedWaitingReasons();
    });
    
    // Deadline time toggle
    toggleTimeBtn.addEventListener('click', () => {
        timeContainer.classList.toggle('hidden');
        toggleTimeBtn.textContent = timeContainer.classList.contains('hidden') ? 'Add Time' : 'Remove Time';
    });
    
    editToggleTimeBtn.addEventListener('click', () => {
        editTimeContainer.classList.toggle('hidden');
        editToggleTimeBtn.textContent = editTimeContainer.classList.contains('hidden') ? 'Add Time' : 'Remove Time';
    });
    
    projectToggleTimeBtn.addEventListener('click', () => {
        projectTimeContainer.classList.toggle('hidden');
        projectToggleTimeBtn.textContent = projectTimeContainer.classList.contains('hidden') ? 'Add Time' : 'Remove Time';
    });
    
    editProjectToggleTimeBtn.addEventListener('click', () => {
        editProjectTimeContainer.classList.toggle('hidden');
        editProjectToggleTimeBtn.textContent = editProjectTimeContainer.classList.contains('hidden') ? 'Add Time' : 'Remove Time';
    });
}

// Set current view and update UI
function setCurrentView(view, skipSave = false) {
    currentView = view;
    
    if (!skipSave) {
        saveSettings('currentView', currentView);
    }
    
    // Update active button
    activeViewBtn.classList.remove('active');
    waitingViewBtn.classList.remove('active');
    completedViewBtn.classList.remove('active');
    quickTasksViewBtn.classList.remove('active');
    projectsViewBtn.classList.remove('active');
    conceptsViewBtn.classList.remove('active');
    
    // Hide all view areas
    quickTaskArea.classList.add('hidden');
    conceptArea.classList.add('hidden');
    projectsArea.classList.add('hidden');
    projectDetail.classList.add('hidden');
    conceptDetail.classList.add('hidden');
    tasksList.classList.remove('hidden');
    
    // Show appropriate view and set active button
    if (view === 'active') {
        activeViewBtn.classList.add('active');
    } else if (view === 'waiting') {
        waitingViewBtn.classList.add('active');
    } else if (view === 'completed') {
        completedViewBtn.classList.add('active');
    } else if (view === 'quick') {
        quickTasksViewBtn.classList.add('active');
        quickTaskArea.classList.remove('hidden');
        tasksList.classList.add('hidden');
        quickTaskInput.focus();
        renderQuickTasks();
    } else if (view === 'projects') {
        projectsViewBtn.classList.add('active');
        projectsArea.classList.remove('hidden');
        tasksList.classList.add('hidden');
        renderProjects();
    } else if (view === 'concepts') {
        conceptsViewBtn.classList.add('active');
        conceptArea.classList.remove('hidden');
        tasksList.classList.add('hidden');
        renderConcepts();
    }
    
    renderTasks();
}

// Set active tab in project detail view
function setActiveTab(tab) {
    // Remove active class from all tabs
    overviewTab.classList.remove('active');
    tasksTab.classList.remove('active');
    notesTab.classList.remove('active');
    filesTab.classList.remove('active');
    
    // Hide all tab content
    overviewContent.classList.add('hidden');
    tasksContent.classList.add('hidden');
    notesContent.classList.add('hidden');
    filesContent.classList.add('hidden');
    
    // Set active tab and show content
    if (tab === 'overview') {
        overviewTab.classList.add('active');
        overviewContent.classList.remove('hidden');
    } else if (tab === 'tasks') {
        tasksTab.classList.add('active');
        tasksContent.classList.remove('hidden');
    } else if (tab === 'notes') {
        notesTab.classList.add('active');
        notesContent.classList.remove('hidden');
        renderNotes(currentProjectId);
    } else if (tab === 'files') {
        filesTab.classList.add('active');
        filesContent.classList.remove('hidden');
        renderFiles(currentProjectId);
    }
}

// Set projects view mode (grid or list)
function setProjectsViewMode(mode) {
    projectsViewMode = mode;
    saveSettings('projectsViewMode', projectsViewMode);
    
    // Update active button
    gridViewBtn.classList.remove('active');
    listViewBtn.classList.remove('active');
    
    // Hide both views
    projectsGrid.classList.add('hidden');
    projectsList.classList.add('hidden');
    
    // Show selected view
    if (mode === 'grid') {
        gridViewBtn.classList.add('active');
        projectsGrid.classList.remove('hidden');
    } else if (mode === 'list') {
        listViewBtn.classList.add('active');
        projectsList.classList.remove('hidden');
    }
    
    renderProjects();
}

// Clear completed tasks
async function clearCompletedTasks() {
    if (!confirm('Are you sure you want to clear all completed tasks?')) {
        return;
    }
    
    // Remove completed tasks
    tasks = tasks.filter(task => !task.completed);
    
    // Save to IndexedDB
    await saveToIndexedDB(STORES.TASKS, tasks);
    
    // Update UI
    renderTasks();
    
    // If in a project detail view, refresh project tasks
    if (currentProjectId) {
        renderProjectTasks(currentProjectId);
        updateProjectProgress(currentProjectId);
    }
    
    // Show success message
    showToast('Completed tasks cleared successfully', 'success');
}

// Handle project image upload
function handleProjectImageUpload(file, previewId) {
    if (!file) return;
    
    // Check if file is an image
    if (!file.type.startsWith('image/')) {
        alert('Please select an image file.');
        return;
    }
    
    const reader = new FileReader();
    reader.onload = function(e) {
        // Set preview image
        const preview = document.getElementById(previewId);
        preview.innerHTML = `<img src="${e.target.result}" alt="Project Image Preview">`;
    };
    reader.readAsDataURL(file);
}

// Handle file upload for project files
async function handleFileUpload(files) {
    if (!files || !files.length || !currentProjectId) return;
    
    for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileId = Date.now().toString() + i;
        
        // Read file as DataURL (base64)
        const reader = new FileReader();
        
        reader.onload = async (e) => {
            const fileObj = {
                id: fileId,
                name: file.name,
                type: file.type,
                size: file.size,
                data: e.target.result,
                projectId: currentProjectId,
                uploadedAt: new Date().toISOString()
            };
            
            // Save file to IndexedDB
            await saveToIndexedDB(STORES.FILES, fileObj);
            
            // Update files object
            files[fileId] = fileObj;
            
            // Render files
            renderFiles(currentProjectId);
        };
        
        reader.readAsDataURL(file);
    }
    
    // Clear file input
    fileUpload.value = "";
}

// Download file
function downloadFile(fileId) {
    const fileObj = files[fileId];
    if (!fileObj) return;
    
    // Create download link
    const link = document.createElement('a');
    link.href = fileObj.data;
    link.download = fileObj.name;
    link.click();
}

// Delete file
async function deleteFile(fileId) {
    if (!confirm('Are you sure you want to delete this file?')) {
        return;
    }
    
    // Delete from IndexedDB
    await deleteItem(STORES.FILES, fileId);
    
    // Remove from files object
    delete files[fileId];
    
    // Render files
    renderFiles(currentProjectId);
    
    // Show success message
    showToast('File deleted successfully', 'success');
}

// Add quick task
async function addQuickTask(text) {
    if (!text) return;
    
    const newQuickTask = {
        id: Date.now().toString(),
        text: text,
        createdAt: new Date().toISOString()
    };
    
    quickTasks.push(newQuickTask);
    await saveToIndexedDB(STORES.QUICK_TASKS, quickTasks);
    renderQuickTasks();
}

// Process quick task (convert to full task)
function processQuickTask(quickTaskId) {
    const quickTask = quickTasks.find(qt => qt.id === quickTaskId);
    if (!quickTask) return;
    
    // Open add task modal
    openAddTaskModal();
    
    // Pre-fill title with quick task text
    document.getElementById('task-title').value = quickTask.text;
    
    // Remove quick task
    deleteQuickTask(quickTaskId);
}

// Delete quick task
async function deleteQuickTask(quickTaskId) {
    const index = quickTasks.findIndex(qt => qt.id === quickTaskId);
    if (index === -1) return;
    
    quickTasks.splice(index, 1);
    await saveToIndexedDB(STORES.QUICK_TASKS, quickTasks);
    renderQuickTasks();
}

// Render quick tasks
function renderQuickTasks() {
    // Clear quick tasks list
    quickTasksList.innerHTML = '';
    
    // Check if there are no quick tasks
    if (quickTasks.length === 0) {
        quickTasksList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-bolt"></i>
                <p>No quick tasks yet</p>
            </div>
        `;
        return;
    }
    
    // Sort quick tasks by creation date (newest first)
    const sortedQuickTasks = [...quickTasks].sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
    );
    
    // Render each quick task
    sortedQuickTasks.forEach((quickTask, index) => {
        const quickTaskElement = document.createElement('div');
        quickTaskElement.className = 'quick-task-item';
        quickTaskElement.setAttribute('data-id', quickTask.id);
        quickTaskElement.style.animationDelay = `${index * 0.05}s`;
        
        quickTaskElement.innerHTML = `
            <div class="quick-task-text">${quickTask.text}</div>
            <div class="quick-task-actions">
                <button class="quick-task-action-btn process-btn" title="Process task">
                    <i class="fas fa-arrow-right"></i>
                </button>
                <button class="quick-task-action-btn delete-btn" title="Delete task">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        // Add event listeners
        const processBtn = quickTaskElement.querySelector('.process-btn');
        processBtn.addEventListener('click', () => {
            processQuickTask(quickTask.id);
        });
        
        const deleteBtn = quickTaskElement.querySelector('.delete-btn');
        deleteBtn.addEventListener('click', () => {
            deleteQuickTask(quickTask.id);
        });
        
        quickTasksList.appendChild(quickTaskElement);
    });
}

// Save concept
async function saveConcept() {
    const title = conceptTitleInput.value.trim();
    const content = conceptInput.value.trim();
    
    if (!title) {
        alert('Please enter a concept title');
        return;
    }
    
    const newConcept = {
        id: Date.now().toString(),
        title: title,
        content: content,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    concepts.push(newConcept);
    await saveToIndexedDB(STORES.CONCEPTS, concepts);
    
    // Clear inputs
    conceptTitleInput.value = '';
    conceptInput.value = '';
    
    renderConcepts();
    
    // Show success message
    showToast('Concept saved successfully', 'success');
}

// Work out concept (open in detail view for further development)
async function workOutConcept() {
    const title = conceptTitleInput.value.trim();
    const content = conceptInput.value.trim();
    
    if (!title) {
        alert('Please enter a concept title');
        return;
    }
    
    // Save concept first
    const newConcept = {
        id: Date.now().toString(),
        title: title,
        content: content,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    concepts.push(newConcept);
    await saveToIndexedDB(STORES.CONCEPTS, concepts);
    
    // Clear inputs
    conceptTitleInput.value = '';
    conceptInput.value = '';
    
    // Open concept in detail view
    openConceptDetail(newConcept.id);
}

// Delete concept
async function deleteConcept(conceptId) {
    const index = concepts.findIndex(c => c.id === conceptId);
    if (index === -1) return;
    
    // Confirm deletion
    if (!confirm('Are you sure you want to delete this concept?')) {
        return;
    }
    
    concepts.splice(index, 1);
    await saveToIndexedDB(STORES.CONCEPTS, concepts);
    
    // Close detail view and go back to concepts list
    conceptDetail.classList.add('hidden');
    conceptArea.classList.remove('hidden');
    currentConceptId = null;
    
    renderConcepts();
    
    // Show success message
    showToast('Concept deleted successfully', 'success');
}

// Render concepts
function renderConcepts() {
    // Clear concepts list
    conceptsList.innerHTML = '';
    
    // Check if there are no concepts
    if (concepts.length === 0) {
        conceptsList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-lightbulb"></i>
                <p>No concepts yet</p>
            </div>
        `;
        return;
    }
    
    // Sort concepts by creation date (newest first)
    const sortedConcepts = [...concepts].sort((a, b) => 
        new Date(b.createdAt) - new Date(a.createdAt)
    );
    
    // Render each concept
    sortedConcepts.forEach((concept, index) => {
        const conceptElement = document.createElement('div');
        conceptElement.className = 'concept-item';
        conceptElement.setAttribute('data-id', concept.id);
        conceptElement.style.animationDelay = `${index * 0.05}s`;
        
        // Truncate content for preview
        const previewContent = concept.content ? 
            (concept.content.length > 100 ? concept.content.substring(0, 100) + '...' : concept.content) : 
            '';
        
        // Format date
        const date = new Date(concept.createdAt);
        const formattedDate = date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric',
            year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
        });
        
        conceptElement.innerHTML = `
            <div class="concept-header">
                <h3 class="concept-title">${concept.title}</h3>
                <span class="concept-date">${formattedDate}</span>
            </div>
            <div class="concept-preview">${previewContent}</div>
            <div class="concept-actions">
                <button class="concept-action-btn view-btn" title="View concept">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="concept-action-btn edit-btn" title="Edit concept">
                    <i class="fas fa-edit"></i>
                </button>
                <button class="concept-action-btn delete-btn" title="Delete concept">
                    <i class="fas fa-trash"></i>
                </button>
                <button class="concept-action-btn convert-btn" title="Convert to project">
                    <i class="fas fa-project-diagram"></i>
                </button>
            </div>
        `;
        
        // Add event listeners
        const viewBtn = conceptElement.querySelector('.view-btn');
        viewBtn.addEventListener('click', () => {
            openConceptDetail(concept.id);
        });
        
        const editBtn = conceptElement.querySelector('.edit-btn');
        editBtn.addEventListener('click', () => {
            openConceptDetail(concept.id);
        });
        
        const deleteBtn = conceptElement.querySelector('.delete-btn');
        deleteBtn.addEventListener('click', () => {
            deleteConcept(concept.id);
        });
        
        const convertBtn = conceptElement.querySelector('.convert-btn');
        convertBtn.addEventListener('click', () => {
            currentConceptId = concept.id;
            convertConceptToProject();
        });
        
        conceptsList.appendChild(conceptElement);
    });
}

// Open concept detail view
function openConceptDetail(conceptId) {
    const concept = concepts.find(c => c.id === conceptId);
    if (!concept) return;
    
    currentConceptId = conceptId;
    
    // Set concept details
    conceptDetailTitle.textContent = concept.title;
    conceptDetailText.value = concept.content || '';
    
    // Format date
    const date = new Date(concept.updatedAt);
    const formattedDate = `Last updated: ${date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
        hour: 'numeric',
        minute: '2-digit'
    })}`;
    
    conceptDetailDate.textContent = formattedDate;
    
    // Show concept detail view
    conceptArea.classList.add('hidden');
    conceptDetail.classList.remove('hidden');
}

// Save concept changes
async function saveConceptChanges() {
    if (!currentConceptId) return;
    
    const concept = concepts.find(c => c.id === currentConceptId);
    if (!concept) return;
    
    // Update concept
    concept.title = conceptDetailTitle.textContent;
    concept.content = conceptDetailText.value;
    concept.updatedAt = new Date().toISOString();
    
    await saveToIndexedDB(STORES.CONCEPTS, concepts);
    
    // Update date display
    const date = new Date(concept.updatedAt);
    const formattedDate = `Last updated: ${date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
        hour: 'numeric',
        minute: '2-digit'
    })}`;
    
    conceptDetailDate.textContent = formattedDate;
    
    // Show success message
    showToast('Concept saved successfully', 'success');
}

// Convert concept to project
function convertConceptToProject() {
    if (!currentConceptId) return;
    
    const concept = concepts.find(c => c.id === currentConceptId);
    if (!concept) return;
    
    // Open add project modal
    openAddProjectModal();
    
    // Pre-fill project form with concept data
    document.getElementById('project-title').value = concept.title;
    document.getElementById('project-description').value = concept.content;
    
    // Delete concept after conversion (optional)
    // deleteConcept(currentConceptId);
}

// Open add task modal
function openAddTaskModal() {
    // Reset form
    taskForm.reset();
    
    // No default deadline
    document.getElementById('task-deadline-date').value = '';
    document.getElementById('task-deadline-time').value = '';
    
    // Hide time input
    timeContainer.classList.add('hidden');
    toggleTimeBtn.textContent = 'Add Time';
    
    // Hide waiting reason by default
    document.getElementById('waiting-reason-container').classList.add('hidden');
    
    // Load projects
    const projectSelect = document.getElementById('task-project');
    projectSelect.innerHTML = '<option value="">-- None --</option>';
    
    projects.forEach(project => {
        const option = document.createElement('option');
        option.value = project.id;
        option.textContent = project.title;
        projectSelect.appendChild(option);
    });
    
    // Show modal
    addTaskModal.style.display = 'block';
    
    // Focus on title input
    document.getElementById('task-title').focus();
    
    // Render suggested tags
    renderSuggestedTags();
}

// Open add task modal for a specific project
function openAddTaskModalForProject(projectId) {
    openAddTaskModal();
    
    // Set project
    document.getElementById('task-project').value = projectId;
}

// Open edit task modal
function openEditTaskModal(taskId) {
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    // Fill form with task data
    document.getElementById('edit-task-id').value = task.id;
    document.getElementById('edit-task-title').value = task.title;
    document.getElementById('edit-task-description').value = task.description || '';
    document.getElementById('edit-task-tags').value = task.tags.join(', ');
    
    // Set project
    const projectSelect = document.getElementById('edit-task-project');
    projectSelect.innerHTML = '<option value="">-- None --</option>';
    
    projects.forEach(project => {
        const option = document.createElement('option');
        option.value = project.id;
        option.textContent = project.title;
        projectSelect.appendChild(option);
    });
    
    if (task.projectId) {
        document.getElementById('edit-task-project').value = task.projectId;
    }
    
    // Set deadline date and time
    if (task.deadline) {
        const deadlineDate = new Date(task.deadline);
        const dateStr = deadlineDate.toISOString().split('T')[0];
        document.getElementById('edit-task-deadline-date').value = dateStr;
        
        // If time is not midnight, set time and show time input
        if (deadlineDate.getHours() !== 0 || deadlineDate.getMinutes() !== 0) {
            const timeStr = ('0' + deadlineDate.getHours()).slice(-2) + ':' + ('0' + deadlineDate.getMinutes()).slice(-2);
            document.getElementById('edit-task-deadline-time').value = timeStr;
            editTimeContainer.classList.remove('hidden');
            editToggleTimeBtn.textContent = 'Remove Time';
        } else {
            document.getElementById('edit-task-deadline-time').value = '';
            editTimeContainer.classList.add('hidden');
            editToggleTimeBtn.textContent = 'Add Time';
        }
    } else {
        document.getElementById('edit-task-deadline-date').value = '';
        document.getElementById('edit-task-deadline-time').value = '';
        editTimeContainer.classList.add('hidden');
        editToggleTimeBtn.textContent = 'Add Time';
    }
    
    // Set importance
    document.querySelector(`input[name="edit-importance"][value="${task.importance}"]`).checked = true;
    
    // Set energy
    document.querySelector(`input[name="edit-energy"][value="${task.energy || 'medium'}"]`).checked = true;
    
    // Set focus
    document.querySelector(`input[name="edit-focus"][value="${task.focus || 'medium'}"]`).checked = true;
    
    // Set status
    document.querySelector(`input[name="edit-status"][value="${task.status}"]`).checked = true;
    
    // Set waiting reason if applicable
    const waitingReasonContainer = document.getElementById('edit-waiting-reason-container');
    if (task.status === 'waiting') {
        waitingReasonContainer.classList.remove('hidden');
        document.getElementById('edit-waiting-reason').value = task.waitingReason || '';
        renderEditSuggestedWaitingReasons();
    } else {
        waitingReasonContainer.classList.add('hidden');
    }
    
    // Show modal
    editTaskModal.style.display = 'block';
    
    // Focus on title input
    document.getElementById('edit-task-title').focus();
    
    // Render suggested tags
    renderEditSuggestedTags();
}

// Open add project modal
function openAddProjectModal() {
    // Reset form
    projectForm.reset();
    
    // Clear image preview
    document.getElementById('image-preview').innerHTML = '';
    
    // No default deadline
    document.getElementById('project-deadline-date').value = '';
    document.getElementById('project-deadline-time').value = '';
    
    // Hide time input
    projectTimeContainer.classList.add('hidden');
    projectToggleTimeBtn.textContent = 'Add Time';
    
    // Hide waiting reason by default
    document.getElementById('project-waiting-reason-container').classList.add('hidden');
    
    // Show modal
    addProjectModal.style.display = 'block';
    
    // Focus on title input
    document.getElementById('project-title').focus();
    
    // Render suggested tags
    renderProjectSuggestedTags();
}

// Open edit project modal
function openEditProjectModal(projectId) {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;
    
    // Fill form with project data
    document.getElementById('edit-project-id').value = project.id;
    document.getElementById('edit-project-title').value = project.title;
    document.getElementById('edit-project-description').value = project.description || '';
    document.getElementById('edit-project-tags').value = project.tags.join(', ');
    
    // Set image preview if project has an image
    const editImagePreview = document.getElementById('edit-image-preview');
    if (project.imageData) {
        editImagePreview.innerHTML = `<img src="${project.imageData}" alt="Project Image Preview">`;
    } else {
        editImagePreview.innerHTML = '';
    }
    
    // Set deadline date and time
    if (project.deadline) {
        const deadlineDate = new Date(project.deadline);
        const dateStr = deadlineDate.toISOString().split('T')[0];
        document.getElementById('edit-project-deadline-date').value = dateStr;
        
        // If time is not midnight, set time and show time input
        if (deadlineDate.getHours() !== 0 || deadlineDate.getMinutes() !== 0) {
            const timeStr = ('0' + deadlineDate.getHours()).slice(-2) + ':' + ('0' + deadlineDate.getMinutes()).slice(-2);
            document.getElementById('edit-project-deadline-time').value = timeStr;
            editProjectTimeContainer.classList.remove('hidden');
            editProjectToggleTimeBtn.textContent = 'Remove Time';
        } else {
            document.getElementById('edit-project-deadline-time').value = '';
            editProjectTimeContainer.classList.add('hidden');
            editProjectToggleTimeBtn.textContent = 'Add Time';
        }
    } else {
        document.getElementById('edit-project-deadline-date').value = '';
        document.getElementById('edit-project-deadline-time').value = '';
        editProjectTimeContainer.classList.add('hidden');
        editProjectToggleTimeBtn.textContent = 'Add Time';
    }
    
    // Set status
    document.querySelector(`input[name="edit-project-status"][value="${project.status}"]`).checked = true;
    
    // Set waiting reason if applicable
    const waitingReasonContainer = document.getElementById('edit-project-waiting-reason-container');
    if (project.status === 'waiting') {
        waitingReasonContainer.classList.remove('hidden');
        document.getElementById('edit-project-waiting-reason').value = project.waitingReason || '';
        renderEditProjectSuggestedWaitingReasons();
    } else {
        waitingReasonContainer.classList.add('hidden');
    }
    
    // Show modal
    editProjectModal.style.display = 'block';
    
    // Focus on title input
    document.getElementById('edit-project-title').focus();
    
    // Render suggested tags
    renderEditProjectSuggestedTags();
}

// Open add note modal
function openAddNoteModal(projectId) {
    // Reset form
    noteForm.reset();
    
    // Set project ID
    document.getElementById('note-project-id').value = projectId || '';
    
    // Show modal
    addNoteModal.style.display = 'block';
    
    // Focus on title input
    document.getElementById('note-title').focus();
}

// Open edit note modal
function openEditNoteModal(noteId) {
    const note = notes.find(n => n.id === noteId);
    if (!note) return;
    
    // Fill form with note data
    document.getElementById('edit-note-id').value = note.id;
    document.getElementById('edit-note-project-id').value = note.projectId || '';
    document.getElementById('edit-note-title').value = note.title;
    document.getElementById('edit-note-content').value = note.content || '';
    document.getElementById('edit-note-tags').value = note.tags.join(', ');
    
    // Show modal
    editNoteModal.style.display = 'block';
    
    // Focus on title input
    document.getElementById('edit-note-title').focus();
}

// Add new task
async function addNewTask() {
    const title = document.getElementById('task-title').value.trim();
    const description = document.getElementById('task-description').value.trim();
    const projectId = document.getElementById('task-project').value;
    const tagsInput = document.getElementById('task-tags').value.trim();
    const deadlineDate = document.getElementById('task-deadline-date').value;
    const deadlineTime = document.getElementById('task-deadline-time').value;
    const importance = document.querySelector('input[name="importance"]:checked').value;
    const energy = document.querySelector('input[name="energy"]:checked').value;
    const focus = document.querySelector('input[name="focus"]:checked').value;
    const status = document.querySelector('input[name="status"]:checked').value;
    const waitingReason = document.getElementById('waiting-reason').value.trim();
    
    if (!title) return;
    
    // Process deadline
    let deadline = null;
    if (deadlineDate) {
        if (deadlineTime && !timeContainer.classList.contains('hidden')) {
            deadline = new Date(`${deadlineDate}T${deadlineTime}`);
        } else {
            deadline = new Date(`${deadlineDate}T00:00:00`);
        }
        deadline = deadline.toISOString();
    }
    
    // Process tags
    const taskTags = tagsInput ? tagsInput.split(',').map(tag => tag.trim().toLowerCase()).filter(tag => tag) : [];
    
    // Update tags list
    const newTags = taskTags.filter(tag => !tags.includes(tag));
    if (newTags.length > 0) {
        tags = [...tags, ...newTags];
        await saveToIndexedDB(STORES.TAGS, tags);
    }
    
    // Process waiting reason
    if (status === 'waiting' && waitingReason && !waitingReasons.includes(waitingReason)) {
        waitingReasons.push(waitingReason);
        await saveToIndexedDB(STORES.WAITING_REASONS, waitingReasons);
    }
    
    // Create new task
    const newTask = {
        id: Date.now().toString(),
        title,
        description,
        projectId: projectId || null,
        tags: taskTags,
        deadline,
        importance,
        energy,
        focus,
        status,
        waitingReason: status === 'waiting' ? waitingReason : null,
        completed: false,
        createdAt: new Date().toISOString(),
        priority: 0 // Will be calculated
    };
    
    // Calculate priority
    newTask.priority = calculatePriority(newTask);
    
    // Add to tasks array
    tasks.push(newTask);
    
    // Save to IndexedDB
    await saveToIndexedDB(STORES.TASKS, tasks);
    
    // Close modal
    addTaskModal.style.display = 'none';
    
    // Update UI
    renderTasks();
    renderTagFilters();
    renderProjectFilters();
    renderManageTags();
    renderManageReasons();
    
    // If task was added from project detail view, refresh project tasks
    if (currentProjectId) {
        renderProjectTasks(currentProjectId);
        updateProjectProgress(currentProjectId);
    }
    
    // Show success message
    showToast('Task added successfully', 'success');
}

// Save task changes
async function saveTaskChanges() {
    const taskId = document.getElementById('edit-task-id').value;
    const title = document.getElementById('edit-task-title').value.trim();
    const description = document.getElementById('edit-task-description').value.trim();
    const projectId = document.getElementById('edit-task-project').value;
    const tagsInput = document.getElementById('edit-task-tags').value.trim();
    const deadlineDate = document.getElementById('edit-task-deadline-date').value;
    const deadlineTime = document.getElementById('edit-task-deadline-time').value;
    const importance = document.querySelector('input[name="edit-importance"]:checked').value;
    const energy = document.querySelector('input[name="edit-energy"]:checked').value;
    const focus = document.querySelector('input[name="edit-focus"]:checked').value;
    const status = document.querySelector('input[name="edit-status"]:checked').value;
    const waitingReason = document.getElementById('edit-waiting-reason').value.trim();
    
    if (!title) return;
    
    // Process deadline
    let deadline = null;
    if (deadlineDate) {
        if (deadlineTime && !editTimeContainer.classList.contains('hidden')) {
            deadline = new Date(`${deadlineDate}T${deadlineTime}`);
        } else {
            deadline = new Date(`${deadlineDate}T00:00:00`);
        }
        deadline = deadline.toISOString();
    }
    
    // Process tags
    const taskTags = tagsInput ? tagsInput.split(',').map(tag => tag.trim().toLowerCase()).filter(tag => tag) : [];
    
    // Update tags list
    const newTags = taskTags.filter(tag => !tags.includes(tag));
    if (newTags.length > 0) {
        tags = [...tags, ...newTags];
        await saveToIndexedDB(STORES.TAGS, tags);
    }
    
    // Process waiting reason
    if (status === 'waiting' && waitingReason && !waitingReasons.includes(waitingReason)) {
        waitingReasons.push(waitingReason);
        await saveToIndexedDB(STORES.WAITING_REASONS, waitingReasons);
    }
    
    // Find task index
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) return;
    
    // Update task
    tasks[taskIndex] = {
        ...tasks[taskIndex],
        title,
        description,
        projectId: projectId || null,
        tags: taskTags,
        deadline,
        importance,
        energy,
        focus,
        status,
        waitingReason: status === 'waiting' ? waitingReason : null
    };
    
    // Recalculate priority
    tasks[taskIndex].priority = calculatePriority(tasks[taskIndex]);
    
    // Save to IndexedDB
    await saveToIndexedDB(STORES.TASKS, tasks);
    
    // Close modal
    editTaskModal.style.display = 'none';
    
    // Update UI
    renderTasks();
    renderTagFilters();
    renderProjectFilters();
    renderManageTags();
    renderManageReasons();
    
    // If task was edited from project detail view, refresh project tasks
    if (currentProjectId) {
        renderProjectTasks(currentProjectId);
        updateProjectProgress(currentProjectId);
    }
    
    // Show success message
    showToast('Task updated successfully', 'success');
}

// Add new project
async function addNewProject() {
    const title = document.getElementById('project-title').value.trim();
    const description = document.getElementById('project-description').value.trim();
    const tagsInput = document.getElementById('project-tags').value.trim();
    const deadlineDate = document.getElementById('project-deadline-date').value;
    const deadlineTime = document.getElementById('project-deadline-time').value;
    const status = document.querySelector('input[name="project-status"]:checked').value;
    const waitingReason = document.getElementById('project-waiting-reason').value.trim();
    
    if (!title) return;
    
    // Get image data from preview
    let imageData = null;
    const imagePreview = document.getElementById('image-preview');
    if (imagePreview.querySelector('img')) {
        imageData = imagePreview.querySelector('img').src;
    }
    
    // Process deadline
    let deadline = null;
    if (deadlineDate) {
        if (deadlineTime && !projectTimeContainer.classList.contains('hidden')) {
            deadline = new Date(`${deadlineDate}T${deadlineTime}`);
        } else {
            deadline = new Date(`${deadlineDate}T00:00:00`);
        }
        deadline = deadline.toISOString();
    }
    
    // Process tags
    const projectTags = tagsInput ? tagsInput.split(',').map(tag => tag.trim().toLowerCase()).filter(tag => tag) : [];
    
    // Update tags list
    const newTags = projectTags.filter(tag => !tags.includes(tag));
    if (newTags.length > 0) {
        tags = [...tags, ...newTags];
        await saveToIndexedDB(STORES.TAGS, tags);
    }
    
    // Process waiting reason
    if (status === 'waiting' && waitingReason && !waitingReasons.includes(waitingReason)) {
        waitingReasons.push(waitingReason);
        await saveToIndexedDB(STORES.WAITING_REASONS, waitingReasons);
    }
    
    // Create new project
    const newProject = {
        id: Date.now().toString(),
        title,
        description,
        imageData,
        tags: projectTags,
        deadline,
        status,
        waitingReason: status === 'waiting' ? waitingReason : null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    // Add to projects array
    projects.push(newProject);
    
    // If project status is waiting, update all tasks for this project
    if (status === 'waiting') {
        updateTasksForProject(newProject.id, status, waitingReason);
    }
    
    // Save to IndexedDB
    await saveToIndexedDB(STORES.PROJECTS, projects);
    await saveToIndexedDB(STORES.TASKS, tasks);
    
    // Close modal
    addProjectModal.style.display = 'none';
    
    // If in projects view, refresh projects
    if (currentView === 'projects') {
        renderProjects();
    }
    
    // Update project filters
    renderProjectFilters();
    
    // Show success message
    showToast('Project added successfully', 'success');
}

// Save project changes
async function saveProjectChanges() {
    const projectId = document.getElementById('edit-project-id').value;
    const title = document.getElementById('edit-project-title').value.trim();
    const description = document.getElementById('edit-project-description').value.trim();
    const tagsInput = document.getElementById('edit-project-tags').value.trim();
    const deadlineDate = document.getElementById('edit-project-deadline-date').value;
    const deadlineTime = document.getElementById('edit-project-deadline-time').value;
    const status = document.querySelector('input[name="edit-project-status"]:checked').value;
    const waitingReason = document.getElementById('edit-project-waiting-reason').value.trim();
    
    if (!title) return;
    
    // Get image data from preview
    let imageData = null;
    const editImagePreview = document.getElementById('edit-image-preview');
    if (editImagePreview.querySelector('img')) {
        imageData = editImagePreview.querySelector('img').src;
    }
    
    // Process deadline
    let deadline = null;
    if (deadlineDate) {
        if (deadlineTime && !editProjectTimeContainer.classList.contains('hidden')) {
            deadline = new Date(`${deadlineDate}T${deadlineTime}`);
        } else {
            deadline = new Date(`${deadlineDate}T00:00:00`);
        }
        deadline = deadline.toISOString();
    }
    
    // Process tags
    const projectTags = tagsInput ? tagsInput.split(',').map(tag => tag.trim().toLowerCase()).filter(tag => tag) : [];
    
    // Update tags list
    const newTags = projectTags.filter(tag => !tags.includes(tag));
    if (newTags.length > 0) {
        tags = [...tags, ...newTags];
        await saveToIndexedDB(STORES.TAGS, tags);
    }
    
    // Process waiting reason
    if (status === 'waiting' && waitingReason && !waitingReasons.includes(waitingReason)) {
        waitingReasons.push(waitingReason);
        await saveToIndexedDB(STORES.WAITING_REASONS, waitingReasons);
    }
    
    // Find project index
    const projectIndex = projects.findIndex(p => p.id === projectId);
    if (projectIndex === -1) return;
    
    // Get old status
    const oldStatus = projects[projectIndex].status;
    
    // Update project
    projects[projectIndex] = {
        ...projects[projectIndex],
        title,
        description,
        imageData,
        tags: projectTags,
        deadline,
        status,
        waitingReason: status === 'waiting' ? waitingReason : null,
        updatedAt: new Date().toISOString()
    };
    
    // If project status has changed to or from waiting, update all tasks for this project
    if ((oldStatus !== 'waiting' && status === 'waiting') || 
        (oldStatus === 'waiting' && status !== 'waiting')) {
        updateTasksForProject(projectId, status, waitingReason);
    }
    
    // Save to IndexedDB
    await saveToIndexedDB(STORES.PROJECTS, projects);
    await saveToIndexedDB(STORES.TASKS, tasks);
    
    // Close modal
    editProjectModal.style.display = 'none';
    
    // If in project detail view, refresh project details
    if (currentProjectId === projectId) {
        renderProjectDetail(projectId);
    }
    
    // If in projects view, refresh projects
    if (currentView === 'projects') {
        renderProjects();
    }
    
    // Update project filters
    renderProjectFilters();
    
    // Show success message
    showToast('Project updated successfully', 'success');
}

// Add new note
async function addNewNote() {
    const projectId = document.getElementById('note-project-id').value;
    const title = document.getElementById('note-title').value.trim();
    const content = document.getElementById('note-content').value.trim();
    const tagsInput = document.getElementById('note-tags').value.trim();
    
    if (!title) return;
    
    // Process tags
    const noteTags = tagsInput ? tagsInput.split(',').map(tag => tag.trim().toLowerCase()).filter(tag => tag) : [];
    
    // Create new note
    const newNote = {
        id: Date.now().toString(),
        projectId: projectId || null,
        title,
        content,
        tags: noteTags,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
    };
    
    // Add to notes array
    notes.push(newNote);
    
    // Save to IndexedDB
    await saveToIndexedDB(STORES.NOTES, notes);
    
    // Close modal
    addNoteModal.style.display = 'none';
    
    // If in project detail view and notes tab is active, refresh notes
    if (currentProjectId && !notesContent.classList.contains('hidden')) {
        renderNotes(currentProjectId);
    }
    
    // Show success message
    showToast('Note added successfully', 'success');
}

// Save note changes
async function saveNoteChanges() {
    const noteId = document.getElementById('edit-note-id').value;
    const projectId = document.getElementById('edit-note-project-id').value;
    const title = document.getElementById('edit-note-title').value.trim();
    const content = document.getElementById('edit-note-content').value.trim();
    const tagsInput = document.getElementById('edit-note-tags').value.trim();
    
    if (!title) return;
    
    // Process tags
    const noteTags = tagsInput ? tagsInput.split(',').map(tag => tag.trim().toLowerCase()).filter(tag => tag) : [];
    
    // Find note index
    const noteIndex = notes.findIndex(n => n.id === noteId);
    if (noteIndex === -1) return;
    
    // Update note
    notes[noteIndex] = {
        ...notes[noteIndex],
        projectId: projectId || null,
        title,
        content,
        tags: noteTags,
        updatedAt: new Date().toISOString()
    };
    
    // Save to IndexedDB
    await saveToIndexedDB(STORES.NOTES, notes);
    
    // Close modal
    editNoteModal.style.display = 'none';
    
    // If in project detail view and notes tab is active, refresh notes
    if (currentProjectId && !notesContent.classList.contains('hidden')) {
        renderNotes(currentProjectId);
    }
    
    // Show success message
    showToast('Note updated successfully', 'success');
}

// Delete note
async function deleteNote(noteId) {
    const index = notes.findIndex(n => n.id === noteId);
    if (index === -1) return;
    
    // Confirm deletion
    if (!confirm('Are you sure you want to delete this note?')) {
        return;
    }
    
    // Remove note
    notes.splice(index, 1);
    
    // Save to IndexedDB
    await saveToIndexedDB(STORES.NOTES, notes);
    
    // If in project detail view and notes tab is active, refresh notes
    if (currentProjectId && !notesContent.classList.contains('hidden')) {
        renderNotes(currentProjectId);
    }
    
    // Show success message
    showToast('Note deleted successfully', 'success');
}

// Render notes for a project
function renderNotes(projectId) {
    // Clear notes grid
    notesGrid.innerHTML = '';
    
    // Reset note tag filters
    renderNoteTagFilters(projectId);
    
    // Get project notes
    let projectNotes = notes.filter(note => note.projectId === projectId);
    
    // Check if there are no notes
    if (projectNotes.length === 0) {
        notesGrid.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-sticky-note"></i>
                <p>No notes yet</p>
            </div>
        `;
        return;
    }
    
    // Apply tag filters if any
    if (noteActiveFilters.length > 0) {
        projectNotes = projectNotes.filter(note => {
            const hasFilteredTag = note.tags.some(tag => noteActiveFilters.includes(tag));
            return hasFilteredTag;
        });
    }
    
    // Sort notes
    projectNotes = sortNotes(projectNotes, notesSort);
    
    // Render each note
    projectNotes.forEach((note, index) => {
        const noteElement = document.createElement('div');
        noteElement.className = 'note-card';
        noteElement.setAttribute('data-id', note.id);
        noteElement.style.animationDelay = `${index * 0.05}s`;
        
        // Format date
        const date = new Date(note.updatedAt);
        const formattedDate = date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric',
            year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
        });
        
        // Create tags HTML
        const tagsHtml = note.tags.map(tag => {
            return `<div class="note-tag">${tag}</div>`;
        }).join('');
        
        noteElement.innerHTML = `
            <div class="note-header">
                <div class="note-title">${note.title}</div>
                <div class="note-date">${formattedDate}</div>
            </div>
            <div class="note-content-preview">${note.content}</div>
            ${note.tags.length > 0 ? `<div class="note-tags">${tagsHtml}</div>` : ''}
        `;
        
        // Add click event to open edit modal
        noteElement.addEventListener('click', () => {
            openEditNoteModal(note.id);
        });
        
        notesGrid.appendChild(noteElement);
    });
}

// Sort notes
function sortNotes(notes, sortBy) {
    return [...notes].sort((a, b) => {
        switch (sortBy) {
            case 'date':
                return new Date(b.updatedAt) - new Date(a.updatedAt);
            case 'title':
                return a.title.localeCompare(b.title);
            case 'tags':
                // Sort by the first tag, or title if no tags
                const tagA = a.tags.length > 0 ? a.tags[0] : '';
                const tagB = b.tags.length > 0 ? b.tags[0] : '';
                return tagA.localeCompare(tagB) || a.title.localeCompare(b.title);
            default:
                return 0;
        }
    });
}

// Render note tag filters
function renderNoteTagFilters(projectId) {
    // Clear note tag filters
    noteTagFilters.innerHTML = '';
    
    // Create a Set of all tags from project notes
    const noteTags = new Set();
    notes.filter(note => note.projectId === projectId).forEach(note => {
        note.tags.forEach(tag => noteTags.add(tag));
    });
    
    // Sort tags alphabetically
    const sortedTags = Array.from(noteTags).sort();
    
    // Render each tag
    sortedTags.forEach(tag => {
        const tagElement = document.createElement('div');
        tagElement.className = `note-tag-filter ${noteActiveFilters.includes(tag) ? 'active' : ''}`;
        tagElement.setAttribute('data-tag', tag);
        
        tagElement.innerHTML = `
            <span>${tag}</span>
        `;
        
        tagElement.addEventListener('click', () => {
            toggleNoteTagFilter(tag);
        });
        
        noteTagFilters.appendChild(tagElement);
    });
}

// Toggle note tag filter
function toggleNoteTagFilter(tag) {
    const index = noteActiveFilters.indexOf(tag);
    if (index === -1) {
        noteActiveFilters.push(tag);
    } else {
        noteActiveFilters.splice(index, 1);
    }
    
    renderNotes(currentProjectId);
}

// Render files for a project
function renderFiles(projectId) {
    // Clear files list
    filesList.innerHTML = '';
    
    // Get project files
    const projectFiles = Object.values(files).filter(file => file.projectId === projectId);
    
    // Check if there are no files
    if (projectFiles.length === 0) {
        filesList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-file"></i>
                <p>No files yet</p>
            </div>
        `;
        return;
    }
    
    // Sort files by upload date (newest first)
    const sortedFiles = [...projectFiles].sort((a, b) => 
        new Date(b.uploadedAt) - new Date(a.uploadedAt)
    );
    
    // Render each file
    sortedFiles.forEach((file, index) => {
        const fileElement = document.createElement('div');
        fileElement.className = 'file-item';
        fileElement.setAttribute('data-id', file.id);
        fileElement.style.animationDelay = `${index * 0.05}s`;
        
        // Determine file icon based on file type
        let iconClass = 'fa-file';
        if (file.type.includes('image')) {
            iconClass = 'fa-file-image';
        } else if (file.type.includes('pdf')) {
            iconClass = 'fa-file-pdf';
        } else if (file.type.includes('word')) {
            iconClass = 'fa-file-word';
        } else if (file.type.includes('excel') || file.type.includes('spreadsheet')) {
            iconClass = 'fa-file-excel';
        } else if (file.type.includes('powerpoint') || file.type.includes('presentation')) {
            iconClass = 'fa-file-powerpoint';
        } else if (file.type.includes('text')) {
            iconClass = 'fa-file-alt';
        } else if (file.type.includes('video')) {
            iconClass = 'fa-file-video';
        } else if (file.type.includes('audio')) {
            iconClass = 'fa-file-audio';
        } else if (file.type.includes('archive') || file.type.includes('zip')) {
            iconClass = 'fa-file-archive';
        } else if (file.type.includes('code')) {
            iconClass = 'fa-file-code';
        }
        
        // Format file size
        const fileSize = formatFileSize(file.size);
        
        fileElement.innerHTML = `
            <div class="file-icon">
                <i class="fas ${iconClass}"></i>
            </div>
            <div class="file-name" title="${file.name}">${file.name}</div>
            <div class="file-info">${fileSize}</div>
            <div class="file-actions">
                <button class="file-action-btn download-btn" title="Download file">
                    <i class="fas fa-download"></i> Download
                </button>
                <button class="file-action-btn delete-btn" title="Delete file">
                    <i class="fas fa-trash"></i> Delete
                </button>
            </div>
        `;
        
        // Add event listeners
        const downloadBtn = fileElement.querySelector('.download-btn');
        downloadBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            downloadFile(file.id);
        });
        
        const deleteBtn = fileElement.querySelector('.delete-btn');
        deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            deleteFile(file.id);
        });
        
        filesList.appendChild(fileElement);
    });
}

// Format file size
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Update tasks status when project status changes
function updateTasksForProject(projectId, projectStatus, waitingReason) {
    // Find all tasks for this project
    tasks.forEach(task => {
        if (task.projectId === projectId) {
            if (projectStatus === 'waiting') {
                // Set task to waiting
                task.status = 'waiting';
                task.waitingReason = waitingReason || 'Project is waiting';
            } else if (projectStatus === 'active' && task.status === 'waiting') {
                // Set task to active only if it was waiting because of the project
                if (task.waitingReason === 'Project is waiting') {
                    task.status = 'active';
                    task.waitingReason = null;
                }
            }
            
            // Recalculate priority
            task.priority = calculatePriority(task);
        }
    });
}

// Delete task
async function deleteTask(taskId) {
    // Find task index
    const taskIndex = tasks.findIndex(t => t.id === taskId);
    if (taskIndex === -1) return;
    
    // Confirm deletion
    if (!confirm('Are you sure you want to delete this task?')) {
        return;
    }
    
    // Remove task
    tasks.splice(taskIndex, 1);
    
    // Save to IndexedDB
    await saveToIndexedDB(STORES.TASKS, tasks);
    
    // Close modal
    editTaskModal.style.display = 'none';
    
    // Update UI
    renderTasks();
    renderTagFilters();
    renderProjectFilters();
    renderManageTags();
    renderManageReasons();
    
    // If task was deleted from project detail view, refresh project tasks
    if (currentProjectId) {
        renderProjectTasks(currentProjectId);
        updateProjectProgress(currentProjectId);
    }
    
    // Show success message
    showToast('Task deleted successfully', 'success');
}

// Delete project
async function deleteProject(projectId) {
    // Find project index
    const projectIndex = projects.findIndex(p => p.id === projectId);
    if (projectIndex === -1) return;
    
    // Confirm deletion
    if (!confirm(`Are you sure you want to delete project "${projects[projectIndex].title}"? All tasks associated with this project will be updated.`)) {
        return;
    }
    
    // Update tasks related to this project
    tasks.forEach(task => {
        if (task.projectId === projectId) {
            task.projectId = null;
        }
    });
    
    // Delete project notes
    notes = notes.filter(note => note.projectId !== projectId);
    
    // Delete project files
    for (const fileId in files) {
        if (files[fileId].projectId === projectId) {
            delete files[fileId];
            await deleteItem(STORES.FILES, fileId);
        }
    }
    
    // Remove project
    projects.splice(projectIndex, 1);
    
    // Save to IndexedDB
    await saveToIndexedDB(STORES.TASKS, tasks);
    await saveToIndexedDB(STORES.PROJECTS, projects);
    await saveToIndexedDB(STORES.NOTES, notes);
    
    // If deleting from project detail view, go back to projects list
    if (currentProjectId === projectId) {
        projectDetail.classList.add('hidden');
        projectsArea.classList.remove('hidden');
        currentProjectId = null;
        setCurrentView('projects');
    }
    
    // Update UI
    renderProjects();
    renderProjectFilters();
    renderTasks();
    
    // Show success message
    showToast('Project deleted successfully', 'success');
}

// Toggle task completion
async function toggleTaskCompletion(taskId) {
    // Find task
    const task = tasks.find(t => t.id === taskId);
    if (!task) return;
    
    // Toggle completion
    task.completed = !task.completed;
    
    // Save to IndexedDB
    await saveToIndexedDB(STORES.TASKS, tasks);
    
    // If completed, add animation class and schedule removal
    if (task.completed) {
        const taskElement = document.querySelector(`.task-card[data-id="${taskId}"]`);
        if (taskElement) {
            taskElement.classList.add('task-complete-animation');
        }
    }
    
    // Update UI
    renderTasks();
    
    // If task was completed from project detail view, refresh project tasks
    if (currentProjectId) {
        renderProjectTasks(currentProjectId);
        updateProjectProgress(currentProjectId);
    }
}

// Calculate task priority
function calculatePriority(task) {
    let priority = 0;
    
    // Importance factor
    if (task.importance === 'high') {
        priority += 50;
    } else if (task.importance === 'super') {
        priority += 100;
    }
    
    // Energy factor (inverse - lower energy tasks get higher priority)
    if (task.energy === 'low') {
        priority += 30;
    } else if (task.energy === 'high') {
        priority -= 20;
    }
    
    // Focus factor (inverse - lower focus tasks get higher priority)
    if (task.focus === 'low') {
        priority += 30;
    } else if (task.focus === 'high') {
        priority -= 20;
    }
    
    // Deadline factor
    if (task.deadline) {
        const now = new Date();
        const deadline = new Date(task.deadline);
        const timeLeft = deadline - now;
        
        // Convert to days
        const daysLeft = timeLeft / (1000 * 60 * 60 * 24);
        
        if (daysLeft < 0) {
            // Overdue
            priority += 200;
        } else if (daysLeft < 1) {
            // Due today
            priority += 150;
        } else if (daysLeft < 2) {
            // Due tomorrow
            priority += 100;
        } else if (daysLeft < 7) {
            // Due this week
            priority += 50;
        } else if (daysLeft < 14) {
            // Due next week
            priority += 25;
        }
    }
    
    // Project factor
    if (task.projectId) {
        const project = projects.find(p => p.id === task.projectId);
        if (project) {
            if (project.status === 'active') {
                priority += 20; // Boost priority for active project tasks
            }
        }
    }
    
    return priority;
}

// Render tasks
function renderTasks() {
    // Clear tasks list
    tasksList.innerHTML = '';
    
    // If in quick tasks, projects, concepts view, don't render tasks
    if (['quick', 'projects', 'concepts'].includes(currentView)) {
        return;
    }
    
    // Filter tasks based on current view and active filters
    let filteredTasks = tasks.filter(task => {
        // Filter by view
        if (currentView === 'active' && (task.status !== 'active' || task.completed)) {
            return false;
        }
        if (currentView === 'waiting' && (task.status !== 'waiting' || task.completed)) {
            return false;
        }
        if (currentView === 'completed' && !task.completed) {
            return false;
        }
        
        // Filter by tags
        if (activeFilters.length > 0) {
            const hasFilteredTag = task.tags.some(tag => activeFilters.includes(tag));
            if (!hasFilteredTag) {
                return false;
            }
        }
        
        // Filter by projects
        if (projectFilters.length > 0) {
            if (!task.projectId || !projectFilters.includes(task.projectId)) {
                return false;
            }
        }
        
        return true;
    });
    
    // Sort tasks
    filteredTasks = sortTasks(filteredTasks, currentSort);
    
    // Check if there are no tasks
    if (filteredTasks.length === 0) {
        tasksList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-clipboard-list"></i>
                <p>No tasks to display</p>
            </div>
        `;
        return;
    }
    
    // Render each task
    filteredTasks.forEach((task, index) => {
        const taskElement = createTaskElement(task, index);
        tasksList.appendChild(taskElement);
    });
    
    // Update priorities for all tasks
    updateAllPriorities();
}

// Create task element
function createTaskElement(task, index) {
    const taskElement = document.createElement('div');
    taskElement.className = `task-card ${task.completed ? 'completed' : ''} ${task.importance !== 'normal' ? 'importance-' + task.importance : ''}`;
    taskElement.setAttribute('data-id', task.id);
    taskElement.style.animationDelay = `${index * 0.05}s`;
    
    // Format deadline
    let deadlineStr = '';
    let isUrgent = false;
    
    if (task.deadline) {
        const deadlineDate = new Date(task.deadline);
        const now = new Date();
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        
        // Check if deadline is today or overdue
        if (deadlineDate < now) {
            deadlineStr = 'Overdue!';
            isUrgent = true;
        } else if (deadlineDate.toDateString() === now.toDateString()) {
            deadlineStr = 'Today';
            isUrgent = true;
        } else if (deadlineDate.toDateString() === tomorrow.toDateString()) {
            deadlineStr = 'Tomorrow';
        } else {
            deadlineStr = deadlineDate.toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric',
                year: deadlineDate.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
            });
        }
        
        // Add time if not midnight
        if (deadlineDate.getHours() !== 0 || deadlineDate.getMinutes() !== 0) {
            deadlineStr += ' at ' + deadlineDate.toLocaleTimeString('en-US', { 
                hour: 'numeric', 
                minute: '2-digit'
            });
        }
    }
    
    // Create priority label
    let priorityLabel = '';
    if (task.priority >= 200) {
        priorityLabel = `<div class="task-priority priority-urgent">Urgent</div>`;
    } else if (task.priority >= 100) {
        priorityLabel = `<div class="task-priority priority-high">High Priority</div>`;
    } else if (task.priority >= 50) {
        priorityLabel = `<div class="task-priority">Medium Priority</div>`;
    } else {
        priorityLabel = `<div class="task-priority">Low Priority</div>`;
    }
    
    // Create tags HTML
    const tagsHtml = task.tags.map(tag => {
        const tagClass = getTagClass(tag);
        return `<div class="task-tag ${tagClass}">${tag}</div>`;
    }).join('');
    
    // Create waiting reason HTML
    const waitingReasonHtml = task.status === 'waiting' && task.waitingReason 
        ? `<div class="task-waiting-reason">Waiting: ${task.waitingReason}</div>` 
        : '';
    
    // Create project HTML
    let projectHtml = '';
    if (task.projectId) {
        const project = projects.find(p => p.id === task.projectId);
        if (project) {
            projectHtml = `<div class="task-project">Project: ${project.title}</div>`;
        }
    }
    
    // Create energy and focus HTML
    const energyHtml = `
        <div class="task-meta-item task-energy energy-${task.energy || 'medium'}">
            <i class="fas fa-battery-half"></i>
            <span>Energy: ${capitalizeFirstLetter(task.energy || 'Medium')}</span>
        </div>
    `;
    
    const focusHtml = `
        <div class="task-meta-item task-focus focus-${task.focus || 'medium'}">
            <i class="fas fa-brain"></i>
            <span>Focus: ${capitalizeFirstLetter(task.focus || 'Medium')}</span>
        </div>
    `;
    
    taskElement.innerHTML = `
        <div class="task-header">
            <h3 class="task-title">${task.title}</h3>
        </div>
        
        ${task.description ? `<div class="task-description">${task.description}</div>` : ''}
        
        <div class="task-meta">
            ${task.deadline ? `
                <div class="task-meta-item task-deadline ${isUrgent ? 'urgent' : ''}">
                    <i class="far fa-calendar-alt"></i>
                    <span>${deadlineStr}</span>
                </div>
            ` : ''}
            
            <div class="task-meta-item task-importance">
                <i class="fas fa-exclamation-circle"></i>
                <span>${task.importance.charAt(0).toUpperCase() + task.importance.slice(1)}</span>
            </div>
            
            ${energyHtml}
            ${focusHtml}
        </div>
        
        ${projectHtml}
        ${tagsHtml ? `<div class="task-tags">${tagsHtml}</div>` : ''}
        ${waitingReasonHtml}
        ${priorityLabel}
        
        <div class="task-actions">
            <button class="task-action-btn task-complete-btn" title="Mark as ${task.completed ? 'incomplete' : 'complete'}">
                <i class="fas ${task.completed ? 'fa-undo' : 'fa-check'}"></i>
            </button>
            <button class="task-action-btn task-edit-btn" title="Edit task">
                <i class="fas fa-edit"></i>
            </button>
        </div>
    `;
    
    // Add event listeners
    const completeBtn = taskElement.querySelector('.task-complete-btn');
    completeBtn.addEventListener('click', () => {
        toggleTaskCompletion(task.id);
    });
    
    const editBtn = taskElement.querySelector('.task-edit-btn');
    editBtn.addEventListener('click', () => {
        openEditTaskModal(task.id);
    });
    
    return taskElement;
}

// Update next action
function updateNextAction(projectId) {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;
    
    const projectTasks = tasks.filter(task => task.projectId === projectId);
    
    if (projectTasks.length === 0) {
        nextAction.innerHTML = `<div class="no-next-action">No tasks in this project</div>`;
        return;
    }
    
    // If project is waiting, show waiting reason
    if (project.status === 'waiting') {
        nextAction.innerHTML = `
            <div class="waiting-next-action">
                <i class="fas fa-pause-circle"></i>
                <span>Project is waiting: ${project.waitingReason || 'No reason specified'}</span>
            </div>
        `;
        return;
    }
    
    // Get active tasks
    const activeTasks = projectTasks.filter(task => !task.completed && task.status === 'active');
    
    if (activeTasks.length === 0) {
        nextAction.innerHTML = `<div class="no-next-action">No active tasks</div>`;
        return;
    }
    
    // Sort by priority
    const sortedTasks = sortTasks(activeTasks, 'priority');
    const topTask = sortedTasks[0];
    
    // Format deadline
    let deadlineStr = '';
    if (topTask.deadline) {
        const deadlineDate = new Date(topTask.deadline);
        const now = new Date();
        
        if (deadlineDate < now) {
            deadlineStr = `<span class="urgent">Overdue!</span>`;
        } else if (deadlineDate.toDateString() === now.toDateString()) {
            deadlineStr = `<span class="urgent">Today</span>`;
        } else {
            deadlineStr = formatDate(deadlineDate);
        }
    }
    
    nextAction.innerHTML = `
        <div class="next-action-item">
            <h4>${topTask.title}</h4>
            <div class="next-action-meta">
                ${deadlineStr ? `<span>Due: ${deadlineStr}</span>` : ''}
                <span class="importance-${topTask.importance}">${capitalizeFirstLetter(topTask.importance)}</span>
                <span class="energy-${topTask.energy || 'medium'}">Energy: ${capitalizeFirstLetter(topTask.energy || 'Medium')}</span>
            </div>
            <div class="next-action-buttons">
                <button class="task-action-btn task-complete-btn" data-id="${topTask.id}">
                    <i class="fas fa-check"></i> Complete
                </button>
            </div>
        </div>
    `;
    
    // Add event listeners
    const completeBtn = nextAction.querySelector('.task-complete-btn');
    completeBtn.addEventListener('click', () => {
        toggleTaskCompletion(topTask.id);
    });
}

// Update project progress
function updateProjectProgress(projectId) {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;
    
    const projectTasks = tasks.filter(task => task.projectId === projectId);
    
    if (projectTasks.length === 0) {
        projectProgress.innerHTML = '<div class="no-progress">No tasks to measure progress</div>';
        return;
    }
    
    const totalTasks = projectTasks.length;
    const completedTasks = projectTasks.filter(task => task.completed).length;
    const activeTasks = projectTasks.filter(task => !task.completed && task.status === 'active').length;
    const waitingTasks = projectTasks.filter(task => !task.completed && task.status === 'waiting').length;
    
    const progressPercentage = Math.round((completedTasks / totalTasks) * 100);
    
    projectProgress.innerHTML = `
        <div class="progress-stats">
            <div class="progress-stat">
                <span class="stat-label">Total Tasks:</span>
                <span class="stat-value">${totalTasks}</span>
            </div>
            <div class="progress-stat">
                <span class="stat-label">Completed:</span>
                <span class="stat-value">${completedTasks}</span>
            </div>
            <div class="progress-stat">
                <span class="stat-label">Active:</span>
                <span class="stat-value">${activeTasks}</span>
            </div>
            <div class="progress-stat">
                <span class="stat-label">Waiting:</span>
                <span class="stat-value">${waitingTasks}</span>
            </div>
        </div>
        <div class="progress-bar-container">
            <div class="progress-label">${progressPercentage}% Complete</div>
            <div class="progress-bar">
                <div class="progress-fill" style="width: ${progressPercentage}%"></div>
            </div>
        </div>
    `;
}

// Render suggested tags
function renderSuggestedTags() {
    const tagsInput = document.getElementById('task-tags');
    const currentInput = tagsInput.value.trim();
    
    // Clear suggested tags
    suggestedTags.innerHTML = '';
    
    // If no input, show all tags
    if (!currentInput) {
        tags.slice(0, 5).forEach(tag => {
            addSuggestedTag(tag, suggestedTags, tagsInput);
        });
        return;
    }
    
    // Get current tag being typed
    const tagParts = currentInput.split(',');
    const currentTag = tagParts[tagParts.length - 1].trim().toLowerCase();
    
    // If current tag is empty, show all tags
    if (!currentTag) {
        tags.slice(0, 5).forEach(tag => {
            addSuggestedTag(tag, suggestedTags, tagsInput);
        });
        return;
    }
    
    // Filter tags that match current input
    const matchingTags = tags.filter(tag => 
        tag.toLowerCase().includes(currentTag) && 
        tag.toLowerCase() !== currentTag
    );
    
    // Add current tag if it's new
    if (!tags.includes(currentTag) && currentTag.length > 0) {
        addSuggestedTag(currentTag + ' (new)', suggestedTags, tagsInput, currentTag);
    }
    
    // Add matching tags
    matchingTags.slice(0, 5).forEach(tag => {
        addSuggestedTag(tag, suggestedTags, tagsInput);
    });
}

// Render edit suggested tags
function renderEditSuggestedTags() {
    const tagsInput = document.getElementById('edit-task-tags');
    const currentInput = tagsInput.value.trim();
    
    // Clear suggested tags
    editSuggestedTags.innerHTML = '';
    
    // If no input, show all tags
    if (!currentInput) {
        tags.slice(0, 5).forEach(tag => {
            addSuggestedTag(tag, editSuggestedTags, tagsInput);
        });
        return;
    }
    
    // Get current tag being typed
    const tagParts = currentInput.split(',');
    const currentTag = tagParts[tagParts.length - 1].trim().toLowerCase();
    
    // If current tag is empty, show all tags
    if (!currentTag) {
        tags.slice(0, 5).forEach(tag => {
            addSuggestedTag(tag, editSuggestedTags, tagsInput);
        });
        return;
    }
    
    // Filter tags that match current input
    const matchingTags = tags.filter(tag => 
        tag.toLowerCase().includes(currentTag) && 
        tag.toLowerCase() !== currentTag
    );
    
    // Add current tag if it's new
    if (!tags.includes(currentTag) && currentTag.length > 0) {
        addSuggestedTag(currentTag + ' (new)', editSuggestedTags, tagsInput, currentTag);
    }
    
    // Add matching tags
    matchingTags.slice(0, 5).forEach(tag => {
        addSuggestedTag(tag, editSuggestedTags, tagsInput);
    });
}

// Render project suggested tags
function renderProjectSuggestedTags() {
    const tagsInput = document.getElementById('project-tags');
    const currentInput = tagsInput.value.trim();
    const suggestedTagsContainer = document.getElementById('project-suggested-tags');
    
    // Clear suggested tags
    suggestedTagsContainer.innerHTML = '';
    
    // If no input, show all tags
    if (!currentInput) {
        tags.slice(0, 5).forEach(tag => {
            addSuggestedTag(tag, suggestedTagsContainer, tagsInput);
        });
        return;
    }
    
    // Get current tag being typed
    const tagParts = currentInput.split(',');
    const currentTag = tagParts[tagParts.length - 1].trim().toLowerCase();
    
    // If current tag is empty, show all tags
    if (!currentTag) {
        tags.slice(0, 5).forEach(tag => {
            addSuggestedTag(tag, suggestedTagsContainer, tagsInput);
        });
        return;
    }
    
    // Filter tags that match current input
    const matchingTags = tags.filter(tag => 
        tag.toLowerCase().includes(currentTag) && 
        tag.toLowerCase() !== currentTag
    );
    
    // Add current tag if it's new
    if (!tags.includes(currentTag) && currentTag.length > 0) {
        addSuggestedTag(currentTag + ' (new)', suggestedTagsContainer, tagsInput, currentTag);
    }
    
    // Add matching tags
    matchingTags.slice(0, 5).forEach(tag => {
        addSuggestedTag(tag, suggestedTagsContainer, tagsInput);
    });
}

// Render edit project suggested tags
function renderEditProjectSuggestedTags() {
    const tagsInput = document.getElementById('edit-project-tags');
    const currentInput = tagsInput.value.trim();
    const suggestedTagsContainer = document.getElementById('edit-project-suggested-tags');
    
    // Clear suggested tags
    suggestedTagsContainer.innerHTML = '';
    
    // If no input, show all tags
    if (!currentInput) {
        tags.slice(0, 5).forEach(tag => {
            addSuggestedTag(tag, suggestedTagsContainer, tagsInput);
        });
        return;
    }
    
    // Get current tag being typed
    const tagParts = currentInput.split(',');
    const currentTag = tagParts[tagParts.length - 1].trim().toLowerCase();
    
    // If current tag is empty, show all tags
    if (!currentTag) {
        tags.slice(0, 5).forEach(tag => {
            addSuggestedTag(tag, suggestedTagsContainer, tagsInput);
        });
        return;
    }
    
    // Filter tags that match current input
    const matchingTags = tags.filter(tag => 
        tag.toLowerCase().includes(currentTag) && 
        tag.toLowerCase() !== currentTag
    );
    
    // Add current tag if it's new
    if (!tags.includes(currentTag) && currentTag.length > 0) {
        addSuggestedTag(currentTag + ' (new)', suggestedTagsContainer, tagsInput, currentTag);
    }
    
    // Add matching tags
    matchingTags.slice(0, 5).forEach(tag => {
        addSuggestedTag(tag, suggestedTagsContainer, tagsInput);
    });
}

// Get tag class based on tag name
function getTagClass(tag) {
    const commonTags = {
        'work': 'tag-work',
        'personal': 'tag-personal',
        'urgent': 'tag-urgent',
        'home': 'tag-home',
        'study': 'tag-study',
        'health': 'tag-health'
    };
    
    return commonTags[tag] || '';
}

// Sort tasks
function sortTasks(tasks, sortBy) {
    return [...tasks].sort((a, b) => {
        switch (sortBy) {
            case 'priority':
                return b.priority - a.priority;
            case 'deadline':
                if (!a.deadline) return 1;
                if (!b.deadline) return -1;
                return new Date(a.deadline) - new Date(b.deadline);
            case 'importance':
                const importanceValues = { 'super': 3, 'high': 2, 'normal': 1 };
                return importanceValues[b.importance] - importanceValues[a.importance];
            case 'energy':
                const energyValues = { 'low': 1, 'medium': 2, 'high': 3 };
                return energyValues[a.energy || 'medium'] - energyValues[b.energy || 'medium'];
            case 'focus':
                const focusValues = { 'low': 1, 'medium': 2, 'high': 3 };
                return focusValues[a.focus || 'medium'] - focusValues[b.focus || 'medium'];
            case 'created':
                return new Date(b.createdAt) - new Date(a.createdAt);
            default:
                return 0;
        }
    });
}

// Render tag filters
function renderTagFilters() {
    // Clear tag filters
    tagFilters.innerHTML = '';
    
    // Get unique tags from active and waiting tasks
    const activeTags = new Set();
    tasks.forEach(task => {
        if (!task.completed) {
            task.tags.forEach(tag => activeTags.add(tag));
        }
    });
    
    // Sort tags alphabetically
    const sortedTags = Array.from(activeTags).sort();
    
    // Render each tag
    sortedTags.forEach(tag => {
        const tagElement = document.createElement('div');
        tagElement.className = `tag-filter ${activeFilters.includes(tag) ? 'active' : ''}`;
        tagElement.setAttribute('data-tag', tag);
        
        const tagClass = getTagClass(tag);
        if (tagClass) {
            tagElement.classList.add(tagClass);
        }
        
        tagElement.innerHTML = `
            <span>${tag}</span>
        `;
        
        tagElement.addEventListener('click', () => {
            toggleTagFilter(tag);
        });
        
        tagFilters.appendChild(tagElement);
    });
}

// Render project filters
function renderProjectFilters() {
    // Clear project filters
    projectFiltersElement.innerHTML = '';
    
    // Get active projects
    const activeProjects = projects.filter(project => project.status !== 'completed');
    
    // Sort projects alphabetically
    const sortedProjects = [...activeProjects].sort((a, b) => a.title.localeCompare(b.title));
    
    // Render each project
    sortedProjects.forEach(project => {
        const projectElement = document.createElement('div');
        projectElement.className = `tag-filter project-filter ${projectFilters.includes(project.id) ? 'active' : ''}`;
        projectElement.setAttribute('data-project', project.id);
        
        // Add status class
        projectElement.classList.add(`status-${project.status}`);
        
        projectElement.innerHTML = `
            <span>${project.title}</span>
        `;
        
        projectElement.addEventListener('click', () => {
            toggleProjectFilter(project.id);
        });
        
        projectFiltersElement.appendChild(projectElement);
    });
}

// Toggle tag filter
function toggleTagFilter(tag) {
    const index = activeFilters.indexOf(tag);
    if (index === -1) {
        activeFilters.push(tag);
    } else {
        activeFilters.splice(index, 1);
    }
    
    renderTagFilters();
    renderTasks();
}

// Toggle project filter
function toggleProjectFilter(projectId) {
    const index = projectFilters.indexOf(projectId);
    if (index === -1) {
        projectFilters.push(projectId);
    } else {
        projectFilters.splice(index, 1);
    }
    
    renderProjectFilters();
    renderTasks();
}

// Render manage tags
function renderManageTags() {
    // Clear manage tags container
    manageTags.innerHTML = '';
    
    // Sort tags alphabetically
    const sortedTags = [...tags].sort();
    
    // Render each tag
    sortedTags.forEach(tag => {
        const tagElement = document.createElement('div');
        tagElement.className = 'manage-item';
        
        const tagClass = getTagClass(tag);
        if (tagClass) {
            tagElement.classList.add(tagClass);
        }
        
        tagElement.innerHTML = `
            <span class="manage-item-text">${tag}</span>
            <button class="manage-item-remove" title="Remove tag">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        // Add event listener for remove button
        const removeBtn = tagElement.querySelector('.manage-item-remove');
        removeBtn.addEventListener('click', () => {
            removeTag(tag);
        });
        
        manageTags.appendChild(tagElement);
    });
    
    // Show message if no tags
    if (sortedTags.length === 0) {
        manageTags.innerHTML = '<div class="empty-state">No saved tags</div>';
    }
}

// Remove tag
async function removeTag(tagToRemove) {
    // Remove tag from tags array
    const tagIndex = tags.indexOf(tagToRemove);
    if (tagIndex !== -1) {
        tags.splice(tagIndex, 1);
    }
    
    // Remove tag from active filters
    const filterIndex = activeFilters.indexOf(tagToRemove);
    if (filterIndex !== -1) {
        activeFilters.splice(filterIndex, 1);
    }
    
    // Remove tag from all tasks
    tasks.forEach(task => {
        const taskTagIndex = task.tags.indexOf(tagToRemove);
        if (taskTagIndex !== -1) {
            task.tags.splice(taskTagIndex, 1);
        }
    });
    
    // Remove tag from all projects
    projects.forEach(project => {
        const projectTagIndex = project.tags.indexOf(tagToRemove);
        if (projectTagIndex !== -1) {
            project.tags.splice(projectTagIndex, 1);
        }
    });
    
    // Save to IndexedDB
    await saveToIndexedDB(STORES.TAGS, tags);
    await saveToIndexedDB(STORES.TASKS, tasks);
    await saveToIndexedDB(STORES.PROJECTS, projects);
    
    // Re-render
    renderManageTags();
    renderTagFilters();
    renderTasks();
    
    // If in projects view, refresh projects
    if (currentView === 'projects') {
        renderProjects();
    }
    
    // If in project detail view, refresh project details
    if (currentProjectId) {
        renderProjectDetail(currentProjectId);
    }
    
    // Show success message
    showToast('Tag removed successfully', 'success');
}

// Render manage waiting reasons
function renderManageReasons() {
    // Clear manage reasons container
    manageReasons.innerHTML = '';
    
    // Sort reasons alphabetically
    const sortedReasons = [...waitingReasons].sort();
    
    // Render each reason
    sortedReasons.forEach(reason => {
        const reasonElement = document.createElement('div');
        reasonElement.className = 'manage-item';
        
        reasonElement.innerHTML = `
            <span class="manage-item-text">${reason}</span>
            <button class="manage-item-remove" title="Remove reason">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        // Add event listener for remove button
        const removeBtn = reasonElement.querySelector('.manage-item-remove');
        removeBtn.addEventListener('click', () => {
            removeWaitingReason(reason);
        });
        
        manageReasons.appendChild(reasonElement);
    });
    
    // Show message if no reasons
    if (sortedReasons.length === 0) {
        manageReasons.innerHTML = '<div class="empty-state">No saved waiting reasons</div>';
    }
}

// Remove waiting reason
async function removeWaitingReason(reasonToRemove) {
    // Remove reason from waitingReasons array
    const reasonIndex = waitingReasons.indexOf(reasonToRemove);
    if (reasonIndex !== -1) {
        waitingReasons.splice(reasonIndex, 1);
    }
    
    // Update tasks with this waiting reason
    tasks.forEach(task => {
        if (task.waitingReason === reasonToRemove) {
            task.waitingReason = '';
        }
    });
    
    // Update projects with this waiting reason
    projects.forEach(project => {
        if (project.waitingReason === reasonToRemove) {
            project.waitingReason = '';
        }
    });
    
    // Save to IndexedDB
    await saveToIndexedDB(STORES.WAITING_REASONS, waitingReasons);
    await saveToIndexedDB(STORES.TASKS, tasks);
    await saveToIndexedDB(STORES.PROJECTS, projects);
    
    // Re-render
    renderManageReasons();
    renderTasks();
    
    // If in projects view, refresh projects
    if (currentView === 'projects') {
        renderProjects();
    }
    
    // If in project detail view, refresh project details
    if (currentProjectId) {
        renderProjectDetail(currentProjectId);
    }
    
    // Show success message
    showToast('Waiting reason removed successfully', 'success');
}

// Render projects
function renderProjects() {
    // Clear projects grid and list
    projectsGrid.innerHTML = '';
    projectsList.innerHTML = '';
    
    // Get search term and status filter
    const searchTerm = projectSearch.value.trim().toLowerCase();
    const statusFilter = projectStatusFilter.value;
    
    // Filter projects
    let filteredProjects = projects;
    
    if (searchTerm) {
        filteredProjects = filteredProjects.filter(project => 
            project.title.toLowerCase().includes(searchTerm) || 
            (project.description && project.description.toLowerCase().includes(searchTerm))
        );
    }
    
    if (statusFilter !== 'all') {
        filteredProjects = filteredProjects.filter(project => project.status === statusFilter);
    }
    
    // Sort projects: active first, then waiting, then completed, then by title
    const sortedProjects = [...filteredProjects].sort((a, b) => {
        const statusOrder = { 'active': 0, 'waiting': 1, 'completed': 2 };
        
        // First sort by status
        if (statusOrder[a.status] !== statusOrder[b.status]) {
            return statusOrder[a.status] - statusOrder[b.status];
        }
        
        // Then sort by title
        return a.title.localeCompare(b.title);
    });
    
    // Check if there are no projects
    if (sortedProjects.length === 0) {
        const emptyState = `
            <div class="empty-state">
                <i class="fas fa-project-diagram"></i>
                <p>No projects to display</p>
            </div>
        `;
        
        projectsGrid.innerHTML = emptyState;
        projectsList.innerHTML = emptyState;
        return;
    }
    
    // Render each project in grid view
    sortedProjects.forEach((project, index) => {
        const projectElement = createProjectGridElement(project, index);
        projectsGrid.appendChild(projectElement);
    });
    
    // Render each project in list view
    sortedProjects.forEach((project, index) => {
        const projectElement = createProjectListElement(project, index);
        projectsList.appendChild(projectElement);
    });
}

// Create project grid element
function createProjectGridElement(project, index) {
    const projectElement = document.createElement('div');
    projectElement.className = `project-card status-${project.status}`;
    projectElement.setAttribute('data-id', project.id);
    projectElement.style.animationDelay = `${index * 0.05}s`;
    
    // Get project image or default
    const imageStyle = project.imageData 
        ? `background-image: url('${project.imageData}')` 
        : 'background-color: var(--primary-color)';
    
    // Get project deadline
    let deadlineStr = '';
    if (project.deadline) {
        const deadlineDate = new Date(project.deadline);
        const now = new Date();
        
        deadlineStr = deadlineDate.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric',
            year: deadlineDate.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
        });
    }
    
    // Get task count
    const projectTasks = tasks.filter(task => task.projectId === project.id);
    const activeTasks = projectTasks.filter(task => !task.completed && task.status === 'active').length;
    const waitingTasks = projectTasks.filter(task => !task.completed && task.status === 'waiting').length;
    const completedTasks = projectTasks.filter(task => task.completed).length;
    const totalTasks = projectTasks.length;
    
    // Get next action
    let nextAction = 'No tasks yet';
    if (projectTasks.length > 0) {
        const activeProjectTasks = projectTasks.filter(task => !task.completed && task.status === 'active');
        if (activeProjectTasks.length > 0) {
            // Sort by priority
            const sortedTasks = sortTasks(activeProjectTasks, 'priority');
            nextAction = sortedTasks[0].title;
        } else {
            nextAction = project.status === 'waiting' ? 'Project is waiting' : 'No active tasks';
        }
    }
    
    // Create tags HTML
    const tagsHtml = project.tags.map(tag => {
        const tagClass = getTagClass(tag);
        return `<div class="project-tag ${tagClass}">${tag}</div>`;
    }).join('');
    
    projectElement.innerHTML = `
        <div class="project-image" style="${imageStyle}">
            <div class="project-status-badge">${capitalizeFirstLetter(project.status)}</div>
        </div>
        <div class="project-content">
            <h3 class="project-title">${project.title}</h3>
            ${project.description ? `<div class="project-description">${truncateText(project.description, 80)}</div>` : ''}
            
            <div class="project-meta">
                ${deadlineStr ? `
                    <div class="project-meta-item">
                        <i class="far fa-calendar-alt"></i>
                        <span>${deadlineStr}</span>
                    </div>
                ` : ''}
                
                <div class="project-meta-item">
                    <i class="fas fa-tasks"></i>
                    <span>${activeTasks} active, ${waitingTasks} waiting</span>
                </div>
            </div>
            
            <div class="project-next-action">
                <span class="next-action-label">Next:</span>
                <span class="next-action-text">${truncateText(nextAction, 30)}</span>
            </div>
            
            ${tagsHtml ? `<div class="project-tags">${tagsHtml}</div>` : ''}
        </div>
    `;
    
    // Add event listener
    projectElement.addEventListener('click', () => {
        openProjectDetail(project.id);
    });
    
    return projectElement;
}

// Open project detail view
function openProjectDetail(projectId) {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;
    
    currentProjectId = projectId;
    
    // Set project details
    renderProjectDetail(projectId);
    
    // Show project detail view
    projectsArea.classList.add('hidden');
    projectDetail.classList.remove('hidden');
    
    // Set active tab to overview
    setActiveTab('overview');
}

// Render project detail
function renderProjectDetail(projectId) {
    const project = projects.find(p => p.id === projectId);
    if (!project) return;
    
    // Set title and status
    projectDetailTitle.textContent = project.title;
    projectDetailStatus.innerHTML = `<span class="status-badge status-${project.status}">${capitalizeFirstLetter(project.status)}</span>`;
    
    if (project.status === 'waiting' && project.waitingReason) {
        projectDetailStatus.innerHTML += `<span class="waiting-reason">Waiting for: ${project.waitingReason}</span>`;
    }
    
    // Set dates
    const createdDate = new Date(project.createdAt);
    let datesHtml = `<div class="date-item">Created: ${formatDate(createdDate)}</div>`;
    
    if (project.deadline) {
        const deadlineDate = new Date(project.deadline);
        datesHtml += `<div class="date-item">Deadline: ${formatDate(deadlineDate)}</div>`;
    }
    
    projectDetailDates.innerHTML = datesHtml;
    
    // Set tags
    const tagsHtml = project.tags.map(tag => {
        const tagClass = getTagClass(tag);
        return `<div class="detail-tag ${tagClass}">${tag}</div>`;
    }).join('');
    
    projectDetailTags.innerHTML = tagsHtml || '<em>No tags</em>';
    
    // Set description
    projectDescription.textContent = project.description || 'No description provided.';
    
    // Set image
    const projectImage = document.querySelector('.project-detail-image');
    if (project.imageData) {
        projectImage.style.backgroundImage = `url('${project.imageData}')`;
        projectImage.innerHTML = '';
    } else {
        projectImage.style.backgroundImage = '';
        projectImage.innerHTML = '<div class="no-image">No Image</div>';
    }
    
    // Render project tasks
    renderProjectTasks(projectId);
    
    // Update next action
    updateNextAction(projectId);
    
    // Update progress
    updateProjectProgress(projectId);
}

// Render project tasks
function renderProjectTasks(projectId) {
    // Clear tasks list
    projectTasksList.innerHTML = '';
    
    // Get project tasks
    const projectTasks = tasks.filter(task => task.projectId === projectId);
    
    // Check if there are no tasks
    if (projectTasks.length === 0) {
        projectTasksList.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-tasks"></i>
                <p>No tasks in this project</p>
            </div>
        `;
        return;
    }
    
    // Sort tasks: active first, then by priority
    const sortedTasks = projectTasks.sort((a, b) => {
        // Completed tasks at the bottom
        if (a.completed !== b.completed) {
            return a.completed ? 1 : -1;
        }
        
        // Then active before waiting
        if (a.status !== b.status) {
            return a.status === 'active' ? -1 : 1;
        }
        
        // Then by priority
        return b.priority - a.priority;
    });
    
    // Render each task
    sortedTasks.forEach((task, index) => {
        const taskElement = createProjectTaskElement(task, index);
        projectTasksList.appendChild(taskElement);
    });
}

// Create project task element
function createProjectTaskElement(task, index) {
    const taskElement = document.createElement('div');
    taskElement.className = `project-task-item ${task.completed ? 'completed' : ''} ${task.status === 'waiting' ? 'waiting' : ''}`;
    taskElement.setAttribute('data-id', task.id);
    taskElement.style.animationDelay = `${index * 0.05}s`;
    
    // Format deadline
    let deadlineStr = '';
    if (task.deadline) {
        const deadlineDate = new Date(task.deadline);
        const now = new Date();
        
        if (deadlineDate < now) {
            deadlineStr = 'Overdue!';
        } else if (deadlineDate.toDateString() === now.toDateString()) {
            deadlineStr = 'Today';
        } else {
            deadlineStr = formatDate(deadlineDate);
        }
    }
    
    taskElement.innerHTML = `
        <div class="project-task-checkbox">
            <input type="checkbox" ${task.completed ? 'checked' : ''}>
            <span class="checkmark"></span>
        </div>
        <div class="project-task-content">
            <h4 class="project-task-title">${task.title}</h4>
            <div class="project-task-meta">
                ${task.status === 'waiting' ? `<span class="task-waiting">Waiting: ${task.waitingReason || 'No reason'}</span>` : ''}
                ${deadlineStr ? `<span class="task-deadline">Due: ${deadlineStr}</span>` : ''}
                <span class="task-importance importance-${task.importance}">${capitalizeFirstLetter(task.importance)}</span>
                <span class="task-energy energy-${task.energy || 'medium'}">Energy: ${capitalizeFirstLetter(task.energy || 'Medium')}</span>
                <span class="task-focus focus-${task.focus || 'medium'}">Focus: ${capitalizeFirstLetter(task.focus || 'Medium')}</span>
            </div>
        </div>
        <div class="project-task-actions">
            <button class="task-action-btn task-edit-btn" title="Edit task">
                <i class="fas fa-edit"></i>
            </button>
        </div>
    `;
    
    // Add event listeners
    const checkbox = taskElement.querySelector('input[type="checkbox"]');
    checkbox.addEventListener('change', () => {
        toggleTaskCompletion(task.id);
    });
    
    const editBtn = taskElement.querySelector('.task-edit-btn');
    editBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        openEditTaskModal(task.id);
    });
    
    return taskElement;
}

// Create project list element
function createProjectListElement(project, index) {
    const projectElement = document.createElement('div');
    projectElement.className = `project-list-item status-${project.status}`;
    projectElement.setAttribute('data-id', project.id);
    projectElement.style.animationDelay = `${index * 0.05}s`;
    
    // Get project deadline
    let deadlineStr = '';
    if (project.deadline) {
        const deadlineDate = new Date(project.deadline);
        const now = new Date();
        
        deadlineStr = deadlineDate.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric',
            year: deadlineDate.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined
        });
    }
    
    // Get task count
    const projectTasks = tasks.filter(task => task.projectId === project.id);
    const activeTasks = projectTasks.filter(task => !task.completed && task.status === 'active').length;
    const waitingTasks = projectTasks.filter(task => !task.completed && task.status === 'waiting').length;
    const completedTasks = projectTasks.filter(task => task.completed).length;
    const totalTasks = projectTasks.length;
    
    // Get next action
    let nextAction = 'No tasks yet';
    if (projectTasks.length > 0) {
        const activeProjectTasks = projectTasks.filter(task => !task.completed && task.status === 'active');
        if (activeProjectTasks.length > 0) {
            // Sort by priority
            const sortedTasks = sortTasks(activeProjectTasks, 'priority');
            nextAction = sortedTasks[0].title;
        } else {
            nextAction = project.status === 'waiting' ? 'Project is waiting' : 'No active tasks';
        }
    }
    
    // Create tags HTML
    const tagsHtml = project.tags.map(tag => {
        const tagClass = getTagClass(tag);
        return `<div class="project-tag ${tagClass}">${tag}</div>`;
    }).join('');
    
    projectElement.innerHTML = `
        <div class="project-list-status">${capitalizeFirstLetter(project.status)}</div>
        <div class="project-list-main">
            <h3 class="project-title">${project.title}</h3>
            <div class="project-list-meta">
                ${deadlineStr ? `
                    <div class="project-meta-item">
                        <i class="far fa-calendar-alt"></i>
                        <span>${deadlineStr}</span>
                    </div>
                ` : ''}
                
                <div class="project-meta-item">
                    <i class="fas fa-tasks"></i>
                    <span>${activeTasks} active, ${waitingTasks} waiting</span>
                </div>
            </div>
        </div>
        <div class="project-list-next">
            <span class="next-action-label">Next:</span>
            <span class="next-action-text">${truncateText(nextAction, 30)}</span>
        </div>
        <div class="project-list-tags">
            ${tagsHtml}
        </div>
    `;
    
    // Add event listener
    projectElement.addEventListener('click', () => {
        openProjectDetail(project.id);
    });
    
    return projectElement;
}
        