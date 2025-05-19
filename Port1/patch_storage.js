/* patch_storage.js – swaps raw IndexedDB helpers with Dexie.js for robustness */
if (window.Dexie === undefined) {
    console.error('Dexie.js is not loaded – storage patch aborted.');
} else {
    const db = new Dexie('finaTaskManager');
    db.version(1).stores({
        tasks: 'id',
        quickTasks: 'id',
        tags: 'tag',
        waitingReasons: 'reason',
        projects: 'id',
        concepts: 'id',
        notes: 'id',
        files: 'id',
        settings: 'key'
    });

    // Replace helper functions globally
    window.getAll = (store) => db.table(store).toArray();
    window.get = (store, key) => db.table(store).get(key);
    window.add = (store, item) => db.table(store).add(item);
    window.put = (store, item) => db.table(store).put(item);
    window.deleteItem = (store, key) => db.table(store).delete(key);
    window.clearStore = (store) => db.table(store).clear();

    // Override legacy initIndexedDB so script.js resolves to Dexie instance
    window.initIndexedDB = async () => db;
    console.info('Fina: Dexie-powered storage layer active.');
}

    // expose globally
    window.finaDB = db;
