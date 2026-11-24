# Product Decision Notebook

A lightweight, browser-based workspace for product managers to capture problem briefs, compare opportunities and document product decisions.

**Status:** Early MVP / active development  
**Maintainer:** [@zenifeni-star](https://github.com/zenifeni-star)

## Why this exists

Product reasoning is often scattered across documents, spreadsheets, chats and meeting notes. Product Decision Notebook gives individuals a simple place to preserve the context behind their decisions.

## Current features

- **Problem briefs:** capture the user, problem, evidence and desired outcome.
- **Prioritisation:** compare ideas using an Impact × Confidence ÷ Effort score.
- **Decision log:** preserve the context, choice, rationale and expected outcome.
- **Local persistence:** entries are saved in the browser using `localStorage`.
- **Export:** download a JSON copy of the workspace.
- **Responsive interface:** designed for desktop and mobile screens.

## Run locally

No build tools or dependencies are required.

1. Download or clone this repository.
2. Open `index.html` in a modern browser.
3. Start creating entries.

For a local development server, you can use the Live Server extension in Visual Studio Code, or run `python -m http.server 8000` from the project directory and visit `http://localhost:8000`.

## Data and privacy

This MVP stores data locally in the browser that you use. It does not send your entries to a server. Clearing browser storage may delete your saved workspace, so use the Export Workspace option to keep a backup.

## Prioritisation formula

The current comparison score is:

`Impact × Confidence ÷ Effort`

Each factor is rated from 1 to 5. The score is a lightweight discussion aid, not a scientific prediction or an objective measure of value. Teams should agree on what each rating means before comparing ideas.

## Roadmap

- [x] Problem brief creation, editing and deletion
- [x] Opportunity scoring and sorting
- [x] Decision records
- [x] Browser-local persistence
- [x] JSON export
- [ ] Import a previously exported workspace
- [ ] Markdown export for individual decision records
- [ ] Optional links between briefs, ideas and decisions
- [ ] Usability testing with product managers
- [ ] Accessibility and cross-browser review

## Contributing

Bug reports, usability feedback and thoughtful feature suggestions are welcome. Please read [CONTRIBUTING.md](CONTRIBUTING.md) before opening an issue or pull request.

## License

This project is licensed under the MIT License. See [LICENSE](LICENSE).

## Important note

This is an early-stage personal productivity tool. It is not a substitute for user research, product judgement or formal prioritisation processes. Please report bugs and usability issues through GitHub Issues.
