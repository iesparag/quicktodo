#!/usr/bin/env node
// Entry point for quicktodo CLI: Add command implementation
import { addTask } from '../lib/taskManager.js';

/**
 * Print error to stderr and exit nonzero.
 */
function fail(message) {
  console.error('Error:', message);
  process.exit(1);
}

/**
 * Print usage help for the CLI.
 */
function printHelp() {
  console.log(`quicktodo: simple local TODO manager \n\nUsage:\n  quicktodo add <task description>   Add a new task\n  quicktodo list                    List tasks (future)\n  quicktodo done <id>               Mark task as done (future)\n  quicktodo rm <id>                 Remove task (future)\n  quicktodo help                    Show this help\n\nExample:\n  quicktodo add \"Call Alice\"\n`);
}

async function main() {
  const argv = process.argv.slice(2);
  if (argv.length === 0 || argv[0] === 'help' || argv[0] === '--help' || argv[0] === '-h') {
    printHelp();
    return;
  }

  const [command, ...cmdArgs] = argv;

  switch (command) {
    case 'add': {
      if (cmdArgs.length === 0) fail('No task description supplied. Usage: quicktodo add "<task description>"');
      // Join all args as description (support quoted/unquoted)
      const desc = cmdArgs.join(' ').trim();
      if (!desc) fail('Task description cannot be empty.');
      try {
        const task = await addTask(desc);
        console.log(`Task added: [${task.id}] ${task.description}`);
      } catch (err) {
        fail(err.message);
      }
      break;
    }
    // Future commands (list, done, rm, clear, etc)
    default:
      fail(`Unknown command: ${command}. Run 'quicktodo help'`);
  }
}

main();
