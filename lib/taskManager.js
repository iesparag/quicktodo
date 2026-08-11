// lib/taskManager.js
// Task data loading/saving for quicktodo
import fs from 'fs';
import os from 'os';
import path from 'path';
import { fileURLToPath } from 'url';

/**
 * Get path to the ~/.quicktodo data directory.
 */
export function getDataDir() {
  const dir = path.join(os.homedir(), '.quicktodo');
  return dir;
}

/**
 * Get absolute path to the user's tasks.json file.
 */
export function getTasksFilePath() {
  return path.join(getDataDir(), 'tasks.json');
}

/**
 * Synchronously ensure ~/.quicktodo directory exists, create if needed.
 * Throws on fs errors other than EEXIST.
 */
function ensureDataDirSync() {
  const dir = getDataDir();
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { mode: 0o700 }); // user private
  }
}

/**
 * Atomically write tasks as JSON array to tasks.json
 * 1. Write to tasks.json.tmp first, fsync
 * 2. Rename (replace) to tasks.json
 * Throws on hard write errors (disk full, etc)
 * @param {Array} tasks - list of task objs (array)
 */
export async function saveTasks(tasks) {
  ensureDataDirSync();
  const tasksFile = getTasksFilePath();
  const tmpFile = tasksFile + '.tmp';
  let out;
  try {
    out = fs.openSync(tmpFile, 'w', 0o600);
    const data = JSON.stringify(tasks, null, 2) + '\n';
    fs.writeSync(out, data, 0, 'utf8');
    fs.fsyncSync(out);
    fs.closeSync(out);
    fs.renameSync(tmpFile, tasksFile);
  } catch (err) {
    // Clean up temp file if partial write
    if (out) {
      try { fs.closeSync(out); } catch {}
    }
    if (fs.existsSync(tmpFile)) {
      try { fs.unlinkSync(tmpFile); } catch {}
    }
    throw new Error(`Failed to save tasks: ${err.message}`);
  }
}

/**
 * Load and parse user's tasks.json file.
 * - If file missing, returns [].
 * - If JSON corrupted/parse fails, backups to corrupt-tasks-<date>.bak, resets file to [].
 * @returns {Promise<Array>} tasks list
 */
export async function loadTasks() {
  ensureDataDirSync();
  const tasksFile = getTasksFilePath();
  if (!fs.existsSync(tasksFile)) return [];
  let fileText;
  try {
    fileText = fs.readFileSync(tasksFile, 'utf8');
  } catch (err) {
    throw new Error(`Error reading tasks file: ${err.message}`);
  }
  if (!fileText.trim()) return [];
  try {
    const tasks = JSON.parse(fileText);
    // we expect array, but tolerate {} for legacy
    if (Array.isArray(tasks)) return tasks;
    if (typeof tasks === 'object') return [];
    return [];
  } catch (err) {
    // JSON parse failed, backup and reset
    const dataDir = getDataDir();
    const bakName = 'corrupt-tasks-' + new Date().toISOString().replace(/[:.]/g, '-') + '.bak';
    const bakFile = path.join(dataDir, bakName);
    try {
      fs.copyFileSync(tasksFile, bakFile, fs.constants.COPYFILE_EXCL);
    } catch (e) {
      // If copy fails, ignore, prioritize unblocking the user
    }
    // Reset tasks.json to empty []
    try {
      await saveTasks([]); // atomic reset
    } catch {}
    return [];
  }
}
