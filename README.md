# quicktodo

A simple, fast CLI tool to manage your personal TODO tasks — stored locally in a hidden JSON file so you control your data.

---

## Usage (placeholder)

```
$ quicktodo add "Buy milk"
$ quicktodo list
$ quicktodo done <id>
$ quicktodo rm <id>
$ quicktodo clear
```

See `quicktodo help` for command options and details. More in-depth usage and examples will follow in later versions.

---

## Installation

Clone this repo and run:

```
npm install -g
```

Or via npm (coming soon):

```
npm install -g quicktodo
```

---

## Project Structure

- `bin/quicktodo.js`: CLI executable entry point
- `lib/taskManager.js`: Core logic for managing your tasks
- `test/taskManager.test.js`: Tests for task data model and operations

---

## Testing

This project uses [tap](https://www.node-tap.org/) for testing. Run the tests with:

```
npm test
```

---

## License

MIT
