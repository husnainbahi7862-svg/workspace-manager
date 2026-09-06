import { createSlice, nanoid } from '@reduxjs/toolkit';

const defaultTasks = [
  {
    id: 't1',
    projectId: 'p1',
    title: 'Setup GraphQL subscription gateway for live notifications',
    description: '',
    status: 'todo',
    priority: 'high',
    assignee: 'u1',
    dueDate: '2026-10-24',
    label: 'API',
    labelTone: 'secondary',
    subtasksDone: 3,
    subtasksTotal: 5,
    attachments: 2,
    comments: 4,
  },
  {
    id: 't2',
    projectId: 'p1',
    title: 'Audit icon consistency in mobile navigation bar',
    description: '',
    status: 'todo',
    priority: 'low',
    assignee: 'u2',
    dueDate: '2026-10-29',
    label: 'Design System',
    labelTone: 'tertiary',
    subtasksDone: 0,
    subtasksTotal: 2,
    attachments: 0,
    comments: 0,
  },
  {
    id: 't3',
    projectId: 'p1',
    title: 'Implement pull-to-refresh haptics with core iOS bridge',
    description: '',
    status: 'todo',
    priority: 'medium',
    assignee: 'u1',
    dueDate: '2026-11-02',
    label: 'Frontend',
    labelTone: 'primary',
    subtasksDone: 0,
    subtasksTotal: 0,
    attachments: 1,
    comments: 0,
  },
  {
    id: 't4',
    projectId: 'p1',
    title: 'Migrate bottom navigation to gesture-driven sheet',
    description: '',
    status: 'in-progress',
    priority: 'high',
    assignee: 'u1',
    dueDate: '2026-10-26',
    label: 'Frontend',
    labelTone: 'primary',
    subtasksDone: 4,
    subtasksTotal: 6,
    attachments: 0,
    comments: 8,
    thumbnail: true,
  },
  {
    id: 't5',
    projectId: 'p1',
    title: 'Resolve token expiration race condition during cold boot',
    description: '',
    status: 'in-progress',
    priority: 'high',
    assignee: 'u3',
    dueDate: '2026-09-06',
    label: 'Bug',
    labelTone: 'error',
    subtasksDone: 1,
    subtasksTotal: 3,
    attachments: 0,
    comments: 0,
  },
  {
    id: 't6',
    projectId: 'p1',
    title: 'Export typography variables to React Native stylesheet tokens',
    description: '',
    status: 'in-progress',
    priority: 'medium',
    assignee: 'u1',
    dueDate: '2026-10-27',
    label: 'Design System',
    labelTone: 'tertiary',
    subtasksDone: 2,
    subtasksTotal: 2,
    attachments: 0,
    comments: 0,
  },
  {
    id: 't7',
    projectId: 'p1',
    title: 'Mock offline caching responses for analytics endpoints',
    description: '',
    status: 'in-progress',
    priority: 'low',
    assignee: 'u2',
    dueDate: '2026-11-05',
    label: 'API',
    labelTone: 'secondary',
    subtasksDone: 0,
    subtasksTotal: 0,
    attachments: 1,
    comments: 0,
  },
  {
    id: 't8',
    projectId: 'p1',
    title: 'Dark mode contrast calibration for accessibility AA',
    description: '',
    status: 'in-review',
    priority: 'medium',
    assignee: 'u1',
    dueDate: '2026-10-25',
    label: 'Design System',
    labelTone: 'tertiary',
    subtasksDone: 5,
    subtasksTotal: 5,
    attachments: 0,
    comments: 2,
  },
  {
    id: 't9',
    projectId: 'p1',
    title: 'Peer review biometric unlock flow pull request',
    description: '',
    status: 'in-review',
    priority: 'high',
    assignee: 'u2',
    dueDate: '2026-10-26',
    label: 'Frontend',
    labelTone: 'primary',
    subtasksDone: 0,
    subtasksTotal: 0,
    attachments: 0,
    comments: 12,
  },
  {
    id: 't10',
    projectId: 'p1',
    title: 'Design token sync via automated CI/CD GitHub action',
    description: '',
    status: 'done',
    priority: 'medium',
    assignee: 'u1',
    dueDate: '2026-10-21',
    label: 'Design System',
    labelTone: 'tertiary',
    subtasksDone: 4,
    subtasksTotal: 4,
    attachments: 0,
    comments: 6,
  },
  {
    id: 't11',
    projectId: 'p1',
    title: 'Implement OAuth2 refresh token fallback mechanism',
    description: '',
    status: 'done',
    priority: 'medium',
    assignee: 'u2',
    dueDate: '2026-10-19',
    label: 'API',
    labelTone: 'secondary',
    subtasksDone: 3,
    subtasksTotal: 3,
    attachments: 0,
    comments: 0,
  },
];

const STORAGE_KEY = 'wm_tasks_v2';

const loadTasks = () => {
  if (typeof window === 'undefined') return defaultTasks;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : defaultTasks;
  } catch {
    return defaultTasks;
  }
};

const persist = (tasks) => {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
  }
};

const stamp = () => new Date().toISOString();

const logActivity = (task, text, userId) => {
  if (!task.activity) task.activity = [];
  task.activity.unshift({ id: nanoid(), text, at: stamp(), userId });
};

export const hydrateTask = (task) => {
  const next = { ...task };
  if (!next.commentList) next.commentList = [];
  if (!next.activity) next.activity = [];
  if (!next.fileList) {
    next.fileList = Array.from({ length: next.attachments || 0 }, (_, i) => ({
      id: `file-${next.id}-${i}`,
      name: `attachment-${i + 1}.png`,
    }));
  }
  if (!next.subtaskList) {
    const total = next.subtasksTotal || 0;
    const done = next.subtasksDone || 0;
    next.subtaskList = Array.from({ length: total }, (_, i) => ({
      id: `sub-${next.id}-${i}`,
      title: `Subtask ${i + 1}`,
      done: i < done,
    }));
  }
  return next;
};

const ensure = (task) => {
  if (!task.commentList) task.commentList = [];
  if (!task.activity) task.activity = [];
  if (!task.fileList) task.fileList = [];
  if (!task.subtaskList) task.subtaskList = [];
};

const syncCounts = (task) => {
  task.comments = task.commentList?.length || 0;
  task.attachments = task.fileList?.length || 0;
  task.subtasksTotal = task.subtaskList?.length || 0;
  task.subtasksDone = task.subtaskList?.filter((s) => s.done).length || 0;
};

const taskDefaults = {
  status: 'todo',
  priority: 'medium',
  label: '',
  labelTone: 'primary',
  subtasksDone: 0,
  subtasksTotal: 0,
  attachments: 0,
  comments: 0,
  commentList: [],
  activity: [],
  fileList: [],
  subtaskList: [],
};

const tasksSlice = createSlice({
  name: 'tasks',
  initialState: {
    items: defaultTasks,
    past: [],
  },
  reducers: {
    rehydrateTasks: (state) => {
      state.items = loadTasks();
      state.past = [];
    },
    undo: (state) => {
      if (state.past.length > 0) {
        state.items = state.past.pop();
        persist(state.items);
      }
    },
    addTask: (state, action) => {
      state.past.push(JSON.parse(JSON.stringify(state.items)));
      if (state.past.length > 15) state.past.shift();
      state.items.push({ id: nanoid(), ...taskDefaults, ...action.payload });
      persist(state.items);
    },
    updateTask: (state, action) => {
      state.past.push(JSON.parse(JSON.stringify(state.items)));
      if (state.past.length > 15) state.past.shift();
      const idx = state.items.findIndex((t) => t.id === action.payload.id);
      if (idx !== -1) {
        state.items[idx] = { ...state.items[idx], ...action.payload };
      }
      persist(state.items);
    },
    deleteTask: (state, action) => {
      state.past.push(JSON.parse(JSON.stringify(state.items)));
      if (state.past.length > 15) state.past.shift();
      state.items = state.items.filter((t) => t.id !== action.payload);
      persist(state.items);
    },
    duplicateTask: (state, action) => {
      state.past.push(JSON.parse(JSON.stringify(state.items)));
      if (state.past.length > 15) state.past.shift();
      const source = state.items.find((t) => t.id === action.payload);
      if (source) {
        state.items.push({ ...source, id: nanoid(), title: `${source.title} (copy)` });
      }
      persist(state.items);
    },
    moveTask: (state, action) => {
      state.past.push(JSON.parse(JSON.stringify(state.items)));
      if (state.past.length > 15) state.past.shift();
      const { id, status, userId } = action.payload;
      const task = state.items.find((t) => t.id === id);
      if (task) {
        const prev = task.status;
        task.status = status;
        ensure(task);
        logActivity(task, `Status ${prev} → ${status}`, userId);
      }
      persist(state.items);
    },
    addComment: (state, action) => {
      const { id, userId, text, mentions } = action.payload;
      const task = state.items.find((t) => t.id === id);
      if (!task) return;
      ensure(task);
      task.commentList.unshift({ id: nanoid(), userId, text, at: stamp(), mentions: mentions || [] });
      logActivity(task, 'Added a comment', userId);
      syncCounts(task);
      persist(state.items);
    },
    editComment: (state, action) => {
      const { id, commentId, text } = action.payload;
      const task = state.items.find((t) => t.id === id);
      if (!task) return;
      const comment = task.commentList?.find((c) => c.id === commentId);
      if (comment) {
        comment.text = text;
      }
      persist(state.items);
    },
    deleteComment: (state, action) => {
      const { id, commentId } = action.payload;
      const task = state.items.find((t) => t.id === id);
      if (!task) return;
      ensure(task);
      task.commentList = task.commentList.filter((c) => c.id !== commentId);
      syncCounts(task);
      persist(state.items);
    },
    addSubtask: (state, action) => {
      const { id, title, userId } = action.payload;
      const task = state.items.find((t) => t.id === id);
      if (!task) return;
      ensure(task);
      task.subtaskList.push({ id: nanoid(), title, done: false });
      logActivity(task, `Added subtask “${title}”`, userId);
      syncCounts(task);
      persist(state.items);
    },
    toggleSubtask: (state, action) => {
      const { id, subtaskId } = action.payload;
      const task = state.items.find((t) => t.id === id);
      if (!task) return;
      ensure(task);
      const sub = task.subtaskList.find((s) => s.id === subtaskId);
      if (sub) sub.done = !sub.done;
      syncCounts(task);
      persist(state.items);
    },
    addFile: (state, action) => {
      const { id, name, data, userId } = action.payload;
      const task = state.items.find((t) => t.id === id);
      if (!task) return;
      ensure(task);
      task.fileList.push({ id: nanoid(), name, data });
      logActivity(task, `Attached ${name}`, userId);
      syncCounts(task);
      persist(state.items);
    },
    removeFile: (state, action) => {
      const { id, fileId, userId } = action.payload;
      const task = state.items.find((t) => t.id === id);
      if (!task) return;
      ensure(task);
      task.fileList = task.fileList.filter((f) => f.id !== fileId);
      logActivity(task, 'Removed an attachment', userId);
      syncCounts(task);
      persist(state.items);
    },
    removeSubtask: (state, action) => {
      const { id, subtaskId } = action.payload;
      const task = state.items.find((t) => t.id === id);
      if (!task) return;
      ensure(task);
      task.subtaskList = task.subtaskList.filter((s) => s.id !== subtaskId);
      syncCounts(task);
      persist(state.items);
    },
    convertSubtask: (state, action) => {
      const { id, subtaskId, userId } = action.payload;
      const task = state.items.find((t) => t.id === id);
      if (!task) return;
      ensure(task);
      const sub = task.subtaskList.find((s) => s.id === subtaskId);
      if (!sub) return;
      state.items.push({
        id: nanoid(),
        ...taskDefaults,
        title: sub.title,
        status: task.status,
        projectId: task.projectId,
        assignee: task.assignee,
      });
      task.subtaskList = task.subtaskList.filter((s) => s.id !== subtaskId);
      logActivity(task, `Converted subtask “${sub.title}” to full task`, userId);
      syncCounts(task);
      persist(state.items);
    },
    seedTemplateTasks: (state, action) => {
      const { projectId, template } = action.payload;
      const newTasks = [];
      if (template === 'software') {
        newTasks.push(
          { id: nanoid(), title: 'Design system setup', status: 'done', projectId, assignee: 'u1', fileList: [], subtaskList: [], comments: [] },
          { id: nanoid(), title: 'API architecture', status: 'in-progress', projectId, assignee: 'u2', fileList: [], subtaskList: [], comments: [] },
          { id: nanoid(), title: 'Database schema', status: 'todo', projectId, assignee: 'u3', fileList: [], subtaskList: [], comments: [] }
        );
      } else if (template === 'marketing') {
        newTasks.push(
          { id: nanoid(), title: 'Q3 Campaign Planning', status: 'in-progress', projectId, assignee: 'u1', fileList: [], subtaskList: [], comments: [] },
          { id: nanoid(), title: 'Social media assets', status: 'todo', projectId, assignee: 'u2', fileList: [], subtaskList: [], comments: [] }
        );
      }
      state.items.push(...newTasks);
      persist(state.items);
    },
    rescheduleTask: (state, action) => {
      const { id, dueDate, userId } = action.payload;
      const task = state.items.find((t) => t.id === id);
      if (!task) return;
      task.dueDate = dueDate;
      ensure(task);
      logActivity(task, `Due date set to ${dueDate}`, userId);
      persist(state.items);
    },
    toggleComplete: (state, action) => {
      state.past.push(JSON.parse(JSON.stringify(state.items)));
      if (state.past.length > 15) state.past.shift();
      const task = state.items.find((t) => t.id === action.payload);
      if (task) task.status = task.status === 'done' ? 'todo' : 'done';
      persist(state.items);
    },
    bulkUpdate: (state, action) => {
      state.past.push(JSON.parse(JSON.stringify(state.items)));
      if (state.past.length > 15) state.past.shift();
      const { ids, patch } = action.payload;
      state.items.forEach((t) => {
        if (ids.includes(t.id)) Object.assign(t, patch);
      });
      persist(state.items);
    },
    bulkDelete: (state, action) => {
      state.past.push(JSON.parse(JSON.stringify(state.items)));
      if (state.past.length > 15) state.past.shift();
      const ids = action.payload;
      state.items = state.items.filter((t) => !ids.includes(t.id));
      persist(state.items);
    },
    importTasks: (state, action) => {
      state.past.push(JSON.parse(JSON.stringify(state.items)));
      if (state.past.length > 15) state.past.shift();
      state.items = [...state.items, ...action.payload];
      persist(state.items);
    },
  },
});

export const {
  rehydrateTasks,
  addTask,
  updateTask,
  deleteTask,
  duplicateTask,
  moveTask,
  toggleComplete,
  bulkUpdate,
  bulkDelete,
  addComment,
  editComment,
  deleteComment,
  addSubtask,
  toggleSubtask,
  addFile,
  removeFile,
  removeSubtask,
  convertSubtask,
  seedTemplateTasks,
  rescheduleTask,
  undo,
  importTasks,
} = tasksSlice.actions;
export default tasksSlice.reducer;
