import { createSlice, nanoid } from '@reduxjs/toolkit';

export const DEFAULT_COLUMNS = [
  { id: 'todo', label: 'To Do', dot: 'outline' },
  { id: 'in-progress', label: 'In Progress', dot: 'secondary' },
  { id: 'in-review', label: 'In Review', dot: 'primary' },
  { id: 'done', label: 'Done', dot: 'tertiary' },
];

const defaultState = {
  workspaces: [
    {
      id: 'w1',
      name: 'Acme Corp HQ',
      members: ['u1', 'u2', 'u3'],
      color: 'primary',
      icon: 'work',
      projects: [
        {
          id: 'p1',
          name: 'Mobile App Redesign',
          color: 'tertiary',
          code: 'SPRINT-14',
          description: 'Sprint 14 Backlog',
          starred: true,
          archived: false,
          members: ['u1', 'u2'],
          columns: DEFAULT_COLUMNS,
        },
        {
          id: 'p2',
          name: 'Core API v2',
          color: 'secondary',
          code: 'API-V2',
          description: 'Platform services',
          starred: false,
          archived: false,
          members: ['u1', 'u3'],
          columns: DEFAULT_COLUMNS,
        },
        {
          id: 'p3',
          name: 'Growth & Marketing',
          color: 'primary-container',
          code: 'GROWTH',
          description: 'Campaigns & growth',
          starred: false,
          archived: false,
          members: ['u2', 'u3'],
          columns: DEFAULT_COLUMNS,
        },
      ],
    },
  ],
  activeWorkspaceId: 'w1',
  activeProjectId: 'p1',
};

const STORAGE_KEY = 'wm_workspaces_v2';

const loadState = () => {
  if (typeof window === 'undefined') return defaultState;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState;
    const parsed = JSON.parse(raw);
    parsed.workspaces.forEach(ws => {
      ws.projects.forEach(p => {
        if (!p.columns || !p.columns.length) {
          p.columns = DEFAULT_COLUMNS;
        }
      });
    });
    return parsed;
  } catch {
    return defaultState;
  }
};

const persist = (state) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }
};

const workspaceSlice = createSlice({
  name: 'workspace',
  initialState: {
    workspaces: defaultState.workspaces,
    activeWorkspaceId: 'w1',
    activeProjectId: 'p1',
    projectViews: {}, // For storing last used view per project
  },
  reducers: {
    rehydrateWorkspace: (state) => {
      const stored = loadState();
      state.workspaces = stored.workspaces;
      state.activeWorkspaceId = stored.activeWorkspaceId;
      state.activeProjectId = stored.activeProjectId;
      state.projectViews = stored.projectViews || {};
      state.activeProjectId = stored.activeProjectId;
    },
    addWorkspace: (state, action) => {
      const ws = {
        id: nanoid(),
        name: action.payload.name,
        color: action.payload.color || 'primary',
        icon: action.payload.icon || 'work',
        members: ['u1'],
        projects: [],
      };
      state.workspaces.push(ws);
      state.activeWorkspaceId = ws.id;
      state.activeProjectId = null;
      persist(state);
    },
    setActiveWorkspace: (state, action) => {
      state.activeWorkspaceId = action.payload;
      const ws = state.workspaces.find((w) => w.id === action.payload);
      state.activeProjectId = ws?.projects?.[0]?.id || null;
      persist(state);
    },
    addProject: (state, action) => {
      const ws = state.workspaces.find((w) => w.id === state.activeWorkspaceId);
      if (ws) {
        const colors = ['tertiary', 'secondary', 'primary-container'];
        const newProject = {
          id: action.payload.id || nanoid(),
          name: action.payload.name,
          color: action.payload.color || colors[ws.projects.length % colors.length],
          code: action.payload.code || `PRJ-${ws.projects.length + 1}`,
          description: action.payload.description || '',
          starred: false,
          archived: false,
          members: ws.members,
          columns: DEFAULT_COLUMNS,
        };
        ws.projects.push(newProject);
        state.activeProjectId = newProject.id;
      }
      persist(state);
    },
    setActiveProject: (state, action) => {
      state.activeProjectId = action.payload;
      persist(state);
    },
    setProjectView: (state, action) => {
      const { projectId, view } = action.payload;
      if (!state.projectViews) state.projectViews = {};
      state.projectViews[projectId] = view;
      persist(state);
    },
    toggleStarProject: (state, action) => {
      const ws = state.workspaces.find((w) => w.id === state.activeWorkspaceId);
      const project = ws?.projects.find((p) => p.id === action.payload);
      if (project) project.starred = !project.starred;
      persist(state);
    },
    toggleArchiveProject: (state, action) => {
      const ws = state.workspaces.find((w) => w.id === state.activeWorkspaceId);
      const project = ws?.projects.find((p) => p.id === action.payload);
      if (project) project.archived = !project.archived;
      persist(state);
    },
    updateProjectMembers: (state, action) => {
      const { projectId, members } = action.payload;
      const ws = state.workspaces.find((w) => w.id === state.activeWorkspaceId);
      const project = ws?.projects.find((p) => p.id === projectId);
      if (project) project.members = members;
      persist(state);
    },
    addColumn: (state, action) => {
      const ws = state.workspaces.find((w) => w.id === state.activeWorkspaceId);
      const project = ws?.projects.find((p) => p.id === state.activeProjectId);
      if (project) {
        if (!project.columns) project.columns = [...DEFAULT_COLUMNS];
        project.columns.push({
          id: nanoid(),
          label: action.payload.label,
          dot: action.payload.dot || 'outline',
        });
      }
      persist(state);
    },
    reorderColumns: (state, action) => {
      const { sourceIndex, destinationIndex } = action.payload;
      const ws = state.workspaces.find((w) => w.id === state.activeWorkspaceId);
      const project = ws?.projects.find((p) => p.id === state.activeProjectId);
      if (project && project.columns) {
        const [moved] = project.columns.splice(sourceIndex, 1);
        project.columns.splice(destinationIndex, 0, moved);
      }
      persist(state);
    },
    updateWorkspaceMeta: (state, action) => {
      const { id, name, color, icon } = action.payload;
      const ws = state.workspaces.find((w) => w.id === id);
      if (ws) {
        if (name !== undefined) ws.name = name;
        if (color !== undefined) ws.color = color;
        if (icon !== undefined) ws.icon = icon;
      }
      persist(state);
    },
    updateWorkspaceCode: (state, action) => {
      const ws = state.workspaces.find((w) => w.id === state.activeWorkspaceId);
      const project = ws?.projects.find((p) => p.id === state.activeProjectId);
      if (project) {
        if (action.payload.name != null) project.name = action.payload.name;
        if (action.payload.code != null) project.code = action.payload.code;
        if (action.payload.description != null) project.description = action.payload.description;
      }
      persist(state);
    },
    deleteWorkspace: (state, action) => {
      state.workspaces = state.workspaces.filter((w) => w.id !== action.payload);
      if (state.activeWorkspaceId === action.payload) {
        state.activeWorkspaceId = state.workspaces[0]?.id || null;
        state.activeProjectId = state.workspaces[0]?.projects?.[0]?.id || null;
      }
      persist(state);
    },
    deleteProject: (state, action) => {
      const { workspaceId, projectId } = action.payload;
      const ws = state.workspaces.find((w) => w.id === workspaceId);
      if (ws) {
        ws.projects = ws.projects.filter((p) => p.id !== projectId);
        if (state.activeProjectId === projectId) {
          state.activeProjectId = ws.projects[0]?.id || null;
        }
      }
      persist(state);
    },
  },
});

export const {
  rehydrateWorkspace,
  addWorkspace,
  setActiveWorkspace,
  addProject,
  setActiveProject,
  toggleStarProject,
  toggleArchiveProject,
  updateProjectMembers,
  addColumn,
  reorderColumns,
  setProjectView,
  updateWorkspaceMeta,
  updateWorkspaceCode,
  deleteWorkspace,
  deleteProject,
} = workspaceSlice.actions;
export default workspaceSlice.reducer;
