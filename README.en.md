# DSH Markup · Inline annotations and document review

Package: `dsh-markup`. Previously `dsh-doc-review`; renamed in 0.2.0.

[简体中文](README.md) · English

Review DeepSeek Harness responses with inline annotations, document reading, comment threads, and text revisions, then bring a reading summary back to the main conversation.

## Features

- Select passages in an assistant response and add comments, agreement, or disagreement. Send the collected annotations for a point-by-point response or a revised answer.
- Open a response in document mode to highlight passages and discuss them in comment threads. Ask the Agent to revise the document text, with undo support.
- Bring highlights and discussions back to the main conversation as reference material attached to your next message, including the full revised document when its text has changed.

![Inline annotations](https://raw.githubusercontent.com/nickzhangcomes/dsh-markup/v0.1.0/docs/screenshots/1-conversation.png)

![Document mode](https://raw.githubusercontent.com/nickzhangcomes/dsh-markup/v0.1.0/docs/screenshots/2-docmode.png)

## Install

Requires DSH `>=0.2.1-rc.3`. The tested host version is `0.2.1-rc.3`; the desktop window interaction fix in `0.1.1` was verified on macOS. Windows and Linux desktop behavior has not been independently verified.

For Desktop, use **Plugins → Add plugin** and enter `dsh-markup`, a GitHub URL, or the full path to a release archive. The desktop CLI commands below require the CLI supplied by the desktop app; if your CLI says the `desktop` profile is managed by Electron, use the in-app installer.

**Publication status (2026-10-27):** The 0.2.0 archive is available on [GitHub Releases](https://github.com/nickzhangcomes/dsh-markup/releases/tag/v0.2.0). The new npm package is awaiting publisher reauthentication; use the release archive or GitHub installation until npm publication completes. The commands below apply after publication.

```bash
# Desktop
dsh plugin --profile desktop add dsh-markup@latest

# Web
dsh plugin --profile web add dsh-markup@latest
```

Use the profile name configured on your machine. Fully quit and reopen the desktop app after installation or an update; restart or reload your web host as appropriate.

Prebuilt archives are also available from [GitHub Releases](https://github.com/nickzhangcomes/dsh-markup/releases). Uninstall with `dsh plugin --profile desktop remove dsh-markup`.

The plugin UI is currently in Chinese. It uses internal DSH interfaces, so future host releases may require a plugin update.

## Upgrade from dsh-doc-review

Use the same profile, remove the old package, and install the new name. On Desktop, this can be done in the Plugins page. Do not enable both packages together.

```bash
# Replace desktop with web for a web profile.
dsh plugin --profile desktop remove dsh-doc-review
dsh plugin --profile desktop add dsh-markup@latest
```

Fully quit and reopen the desktop app, or reload the web host. In the same DSH profile and browser storage environment, existing annotations, highlights, comment threads, text revisions, preferences, and pending reading summaries remain readable. The storage format and persisted reference identifiers are unchanged. Removing the old package does not clear these records; do not clear application/browser data. Sent conversation history remains managed by DSH.

The GitHub repository, package, and documentation now use `dsh-markup`. The old GitHub URL redirects, and the old npm package is retained for historical versions and migration guidance. The desktop window-dragging fix from 0.1.1 is preserved.

## Data access and model calls

- The plugin reads the response being reviewed and selected passages. Annotations, document copies, comments, revisions, preferences, and pending reading references are stored in the DSH page environment's `localStorage`. The plugin does not provide cross-device sync.
- Sending annotations submits the selected text, notes, overall feedback, and current composer draft through DSH's normal message flow.
- Requesting an Agent reply in document mode forks the parent conversation. The child retains conversation context and receives the current document, selected passage, and comment. The full document is sent again after revisions. Calls use the model service configured in DSH and consume tokens, potentially incurring charges.
- Turning off a comment's Agent toggle defers a model call; `@Agent` still requests a reply. Earlier comments may be included as context when you later request an Agent reply in that document.
- Bringing a reading back to the main conversation attaches its highlights and discussions to the composer, plus the full revised document if its text has changed. They are sent with your next message and can be removed before sending.
- Leaving document mode attempts to stop and archive the plugin-created child session. Cleanup is retried on a later load if necessary. Archiving does not delete history.

The plugin does not directly read or write workspace files, request a separate API key, or operate its own upload or analytics service. Agent tools and permissions remain governed by DSH's configuration and authorization flow. Document rendering uses DSH's Markdown components; external images and similar resources may still cause network requests.

Uninstalling does not erase plugin records already stored in `localStorage` or messages already sent through DSH. Unsent chat annotations can be deleted or cleared, and pending reading references can be removed from the composer. DSH manages conversation history.

## Marketplace assets

[screenshots.json](screenshots.json) lists four demonstration images in display order. See [submission materials](docs/marketplace/README.md) for descriptions and listing drafts. A draft is not a confirmed marketplace listing.

## Development

With Node.js 20 or newer:

```bash
npm ci
npm run build
npm pack
```

`npm pack` rebuilds the distributable files before packaging.

## License

MIT
