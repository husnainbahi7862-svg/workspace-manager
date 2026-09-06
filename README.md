# Workspace Manager (Demo Build)

## Run it
```
npm install
npm run dev
```
Open http://localhost:3000 — it redirects to /login.

Mock login credentials (any of these, password always `123456`):
- ali@example.com (role: owner)
- sara@example.com (role: member)
- bilal@example.com (role: viewer)

## What's covered (for your demo)
- **Auth**: mock login (Formik + Yup validated), session in localStorage, switch-user dropdown, logout.
- **Workspaces/Projects**: one seeded workspace + project shown in the top bar.
- **Tasks**: create/edit/delete via a Formik + Yup validated modal (title, description, priority, assignee, due date).
- **Views**: Kanban board (Move ← / Move →) and List view (sortable, checkbox complete).
- **Roles**: role badge shown top-right; "viewer" role hides edit/create actions (permission-gated UI).
- **Search**: live search box filters tasks by title.
- **Data persistence**: tasks, workspace/project, current user all persist to localStorage — refresh keeps state.
- **Theme toggle**: dark/light mode, persisted.

## What's intentionally left out (mention this if asked)
Given the time limit this build focuses on breadth over depth. Not implemented: comments,
notifications, activity log, undo/redo, drag-and-drop (uses move buttons instead), command
palette, offline/export-import. These are all straightforward extensions of the same
patterns (Redux slice + Formik form + Tailwind component) if there's time to add them later.
