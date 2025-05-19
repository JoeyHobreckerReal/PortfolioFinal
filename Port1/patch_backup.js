/* patch_backup.js – automatic 3‑day JSON backups of Dexie DB
   Requires Dexie (loaded earlier by patch_storage.js) and File System Access API (Chromium‑based browsers).
   Fallback: triggers a download in the browser's Downloads folder.
*/

(async () => {
  if (!window.Dexie || !navigator.storage) return;

  const BACKUP_INTERVAL_MS = 1000 * 60 * 60 * 24 * 3; // 3 days
  const SETTINGS_KEY = 'lastBackup';

  const db = new Dexie('finaTaskManager');

  async function exportDB() {
    const data = {};
    for (const table of db.tables) {
      data[table.name] = await table.toArray();
    }
    return new Blob([JSON.stringify(data)], { type: 'application/json' });
  }

  async function saveToFileSystem(blob) {
    try {
      // Ask once per session
      let dirHandle = localStorage.getItem('finaBackupDir');
      if (!dirHandle) {
        dirHandle = await window.showDirectoryPicker({ id: 'fina-backups', mode:'readwrite' });
        localStorage.setItem('finaBackupDir', await dirHandle.requestPermission({ mode: 'readwrite' }) === 'granted' ? dirHandle.name : '');
      }

      if (!dirHandle) throw new Error('No directory access');

      const fileName = `fina-backup-${new Date().toISOString().slice(0,10)}.json`;
      const fh = await dirHandle.getFileHandle(fileName, { create: true });
      const writable = await fh.createWritable();
      await writable.write(blob);
      await writable.close();
      console.info('[Fina] Backup saved to directory:', fileName);
    } catch (err) {
      console.warn('[Fina] Directory backup failed, falling back to download.', err);
      const url = URL.createObjectURL(blob);
      const a = Object.assign(document.createElement('a'), { href:url, download:`fina-backup-${Date.now()}.json` });
      document.body.appendChild(a);
      a.click();
      setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 5000);
    }
  }

  
  // update UI indicator if present
  function updateBackupIndicator(ts){
      const el = document.getElementById('last-backup-indicator');
      if(el){ el.textContent = new Date(ts).toLocaleDateString(); }
  }

  async function doBackup() {
    const blob = await exportDB();
    await saveToFileSystem(blob);
    const now = Date.now();
    await db.table('settings').put({ key: SETTINGS_KEY, value: now });
    updateBackupIndicator(now);
    if (window.showToast) showToast('Automatic backup saved', 'success');
  }

  // Kick‑off on load if > 3 days
  const last = await db.table('settings').get(SETTINGS_KEY);
  if (!last || (Date.now() - last.value) > BACKUP_INTERVAL_MS) {
    doBackup();
  }

  // Also setInterval while app remains open
  setInterval(doBackup, BACKUP_INTERVAL_MS);
})();