// test/taskManager.test.js
import tap from 'tap';
import fs from 'fs';
import os from 'os';
import path from 'path';
import {
  getDataDir,
  getTasksFilePath,
  loadTasks,
  saveTasks
} from '../lib/taskManager.js';

// For isolation: run all tests using a temp home dir
const TEST_DIR = fs.mkdtempSync(path.join(os.tmpdir(), 'quicktodo-test-'));
const origHome = process.env.HOME;
process.env.HOME = TEST_DIR; // spoof home

const DATA_DIR = getDataDir();
const TASKS_FILE = getTasksFilePath();

// Helper: cleanup all persistent files after test
function cleanup() {
  if (fs.existsSync(DATA_DIR)) {
    const files = fs.readdirSync(DATA_DIR);
    for (const f of files) {
      fs.unlinkSync(path.join(DATA_DIR, f));
    }
    fs.rmdirSync(DATA_DIR);
  }
}

tap.teardown(() => {
  cleanup();
  if (process.env.HOME === TEST_DIR) {
    process.env.HOME = origHome;
    fs.rmdirSync(TEST_DIR, { recursive: true });
  }
});

// Tests

tap.test('getDataDir and getTasksFilePath return correct paths', t => {
  t.match(DATA_DIR, /.quicktodo$/);
  t.match(TASKS_FILE, /tasks\.json$/);
  t.end();
});

tap.test('loadTasks() returns [] if tasks file does not exist', async t => {
  cleanup();
  const tasks = await loadTasks();
  t.same(tasks, [], 'Should load empty list when tasks file is missing');
  t.end();
});

tap.test('saveTasks() creates the data directory and tasks.json', async t => {
  cleanup();
  const sample = [ { id: '1', desc: 'hello', status: 'pending' } ];
  await saveTasks(sample);
  t.ok(fs.existsSync(DATA_DIR), 'Data directory created');
  t.ok(fs.existsSync(TASKS_FILE), 'tasks.json created');
  const data = JSON.parse(fs.readFileSync(TASKS_FILE, 'utf8'));
  t.same(data, sample, 'Stored data matches');
  t.end();
});

tap.test('saveTasks() is atomic (no partial files)', async t => {
  cleanup();
  const before = [ { id: 'a', desc: 'x', status: 'pending' } ];
  const after  = [ { id: 'b', desc: 'y', status: 'done' } ];
  await saveTasks(before);
  // simulate concurrent save: saveTasks will always write to .tmp, then rename atomically
  await saveTasks(after);
  t.ok(fs.existsSync(TASKS_FILE), 'tasks.json exists');
  const actual = JSON.parse(fs.readFileSync(TASKS_FILE, 'utf8'));
  t.same(actual, after, 'tasks.json has the new contents, not a partial file');
  t.notOk(fs.existsSync(TASKS_FILE + '.tmp'), 'No lingering .tmp file');
  t.end();
});

tap.test('loadTasks() loads valid tasks array', async t => {
  cleanup();
  const items = [ { id: 't1', desc: 'A', status: 'pending' }, { id: 't2', desc: 'B', status: 'done' } ];
  await saveTasks(items);
  const loaded = await loadTasks();
  t.same(loaded, items, 'Loaded is identical to saved list');
  t.end();
});

tap.test('loadTasks() returns [] and resets file if JSON is corrupt', async t => {
  cleanup();
  fs.mkdirSync(DATA_DIR, { mode: 0o700 });
  fs.writeFileSync(TASKS_FILE, 'not{ valid json]', { mode: 0o600 });
  const ret = await loadTasks();
  t.same(ret, [], 'Should return an empty array');
  // tasks.json must now be reset to []
  const data = JSON.parse(fs.readFileSync(TASKS_FILE, 'utf8'));
  t.same(data, [], 'tasks.json is reset to []');
  // corrupt-tasks-<...>.bak should exist
  const bakFiles = fs.readdirSync(DATA_DIR).filter(f => f.startsWith('corrupt-tasks-'));
  t.ok(bakFiles.length > 0, 'Backup file made for corrupt JSON');
  t.end();
});

tap.test('loadTasks() works if data file is empty string (treat as empty list)', async t => {
  cleanup();
  fs.mkdirSync(DATA_DIR, { mode: 0o700 });
  fs.writeFileSync(TASKS_FILE, '', { mode: 0o600 });
  const ret = await loadTasks();
  t.same(ret, [], 'Empty string -> []');
  t.end();
});

// Edge: file contents is '{}' (object), tolerate as "no tasks"
tap.test('loadTasks() with {} as content returns []', async t => {
  cleanup();
  fs.mkdirSync(DATA_DIR, { mode: 0o700 });
  fs.writeFileSync(TASKS_FILE, '{}', { mode: 0o600 });
  const ret = await loadTasks();
  t.same(ret, [], 'Treat object/non-array as empty');
  t.end();
});


