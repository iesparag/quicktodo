# Architecture

### Components

- CLI Executable: bin/quicktodo.js - parses user commands, arguments, and calls core logic
- Core Logic: lib/taskManager.js - handles all CRUD task operations, JSON file load/save with atomic writes
- Tests: test/taskManager.test.js - unit tests for core logic using tap

### Folder Tree

quicktodo/
├── bin/
│   └── quicktodo.js          # CLI executable entrypoint with commands parsing
├── lib/
│   └── taskManager.js        # Core module managing task storage and operations
├── test/
│   └── taskManager.test.js   # Unit tests for taskManager functions
├── package.json
├── README.md
├── .gitignore

### Data Flow

User runs `quicktodo <command> [args]` -> bin/quicktodo.js parses command and arguments -> calls functions in lib/taskManager.js which load the tasks JSON file atomically, perform the action (add, list, done, rm, clear) -> update and write back the JSON file -> CLI outputs results or errors.

### Key Decisions
- Use a hidden directory `.quicktodo` in user home to store tasks.json
- Manage tasks as an array of {id, description, status, createdAt, optional dueDate}
- Store UUIDs as ids (v4 format)
- Use atomic write to temp file then rename for save to avoid corruption
- Provide helpful CLI messages and validations
- Use Node.js native ES modules for modern syntax and deployment ease
- Use 'tap' for simple, dependency-light testing
- No config file; optionally environment variable to override data path (not implemented initially)

