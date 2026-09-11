# History and Settings Implementation

## Problem

The sidebar displayed History and Settings, but both items used `href="#"`. There were no React routes or pages for either feature, so clicking them did not open an application view.

## Changes Implemented

### History route

Added the route:

```text
/history
```

The new History page provides:

- A transformation-history workspace header.
- An intentional empty state for the current MVP.
- A link back to the Transform page.
- A roadmap preview showing the information planned for saved jobs:
  - Source and output versions.
  - Processing time and status.
  - Exportable results.

The current transformation API does not persist results, so the page clearly explains that saved history will become available after database persistence is added.

### Settings route

Added the route:

```text
/settings
```

The new Settings page provides:

- Preferred output language selection.
- A Remember my last choice toggle.
- A Save preferences action.
- Browser-local persistence using `localStorage`.
- A note explaining that account-level settings and server-side privacy controls are planned.

The settings page currently supports English, Hindi, Spanish, and French as preference values. The language preference does not yet change backend translation behavior because real multilingual translation is not implemented.

### Navigation

Updated the sidebar so History and Settings use React Router `NavLink` components. Active navigation styling now works for all four pages:

- `/`
- `/transform`
- `/history`
- `/settings`

### Styling

Added responsive styles for:

- History empty state.
- History roadmap preview.
- Settings form and toggle control.
- Settings information panel.
- Mobile layouts for the new pages.

## Files Changed

- `frontend/src/App.jsx`
- `frontend/src/components/Sidebar.jsx`
- `frontend/src/index.css`
- `frontend/src/pages/History.jsx`
- `frontend/src/pages/Settings.jsx`

## Validation

The frontend should be checked with:

```powershell
cd frontend
npm run build
npm run lint
```

Open these URLs while the Vite server is running:

- http://127.0.0.1:5173/history
- http://127.0.0.1:5173/settings

## Future Work

- Store completed transformations in PostgreSQL.
- Populate History with saved jobs and output versions.
- Add search, filters, pagination, and export actions.
- Connect the preferred language to a real translation provider.
- Add account, authentication, retention, and privacy settings.
