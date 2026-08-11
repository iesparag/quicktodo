# Build plan

## Build Plan and Milestones

### Step 1: Setup project structure and dependencies
- Initialize npm project with ES modules
- Create folder structure: bin/, lib/, test/
- Add scripts: test (using tap), start for CLI
- Create README.md, .gitignore

### Step 2: Implement task data loading and saving
- Functions to load task JSON file, handle missing or corrupt file
- Atomic save implementation using a temp file + rename
- Folder and file creation if missing

### Step 3: Implement 'add' command
- Parse and validate task description
- Create task object with UUID, timestamps, pending status
- Save and confirm output

### Step 4: Implement 'list' command
- Read tasks
- Support filters: --all, --pending (default), --done
- Display neat formatted list or message if no tasks

### Step 5: Implement 'done' command
- Mark task by ID as done
- Validate ID format and existence
- Save and confirm

### Step 6: Implement 'rm' command
- Remove task by ID
- Validate ID format and existence
- Save and confirm

### Step 7: Implement 'clear' command
- Clear all tasks or only done tasks with --done flag
- Confirm action

### Step 8: Add full argument parsing and help command
- Show usage and commands if no or invalid commands
- Validate arguments and show errors

### Step 9: Write unit tests for taskManager.js
- Cover add, list (filters), done, rm, clear
- Test load/save with mocked FS
- Test corrupt data recovery
- Validate all validations

### Step 10: Final manual CLI tests and README documentation
- Test all CLI commands end to end
- Ensure atomic writes and user experience
- Write usage examples and FAQ in README
- Add license if desired

