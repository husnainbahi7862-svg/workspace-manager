import { useEffect, useMemo, useState } from 'react';
import { Formik, Form, Field } from 'formik';
import { useDispatch, useSelector } from 'react-redux';
import { deleteTask, toggleComplete, bulkUpdate, bulkDelete } from '../redux/features/tasksSlice';
import Icon from './Icon';
import { Avatar } from './AppShell';

const GRID = 'grid grid-cols-[44px_minmax(180px,2.8fr)_1.1fr_0.9fr_1.3fr_1.1fr_1.3fr_1fr_100px] items-center px-space-md';

const STATUS_ICON = {
  todo: { icon: 'radio_button_unchecked', className: 'text-outline' },
  'in-progress': { icon: 'cached', className: 'text-secondary' },
  'in-review': { icon: 'rate_review', className: 'text-primary' },
  done: { icon: 'check_circle', className: 'text-tertiary' },
};

const STATUS_PILL = {
  todo: 'bg-surface-container-highest text-on-surface-variant',
  'in-progress': 'bg-secondary/15 text-secondary',
  'in-review': 'bg-primary/15 text-primary',
  done: 'bg-tertiary/15 text-tertiary',
};

const STATUS_DOT = {
  todo: 'bg-outline',
  'in-progress': 'bg-secondary',
  'in-review': 'bg-primary',
  done: 'bg-tertiary',
};

const GROUP_DOT = {
  outline: 'bg-outline ring-outline/10',
  secondary: 'bg-secondary ring-secondary/10',
  primary: 'bg-primary ring-primary/10',
  tertiary: 'bg-tertiary ring-tertiary/10',
  error: 'bg-error ring-error/10',
};

const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 };

function formatDue(dueDate) {
  if (!dueDate) return { label: '—', tone: 'text-outline', icon: 'event' };
  const d = new Date(`${dueDate}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diff = (d - today) / 86400000;
  if (diff === 0) return { label: 'Today', tone: 'text-secondary', icon: 'event_upcoming' };
  if (diff === 1) return { label: 'Tomorrow', tone: 'text-secondary', icon: 'event_upcoming' };
  if (diff < 0) return { label: d.toLocaleDateString('en-US', { month: 'short', day: '2-digit' }), tone: 'text-error', icon: 'event_busy' };
  return { label: d.toLocaleDateString('en-US', { month: 'short', day: '2-digit' }), tone: 'text-on-surface', icon: 'event' };
}

function points(task) {
  return task.priority === 'high' ? 5 : task.priority === 'medium' ? 3 : 1;
}

function sortTasks(list, sortKey) {
  const copy = [...list];
  if (sortKey === 'priority') return copy.sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]);
  if (sortKey === 'dueDate') return copy.sort((a, b) => (a.dueDate || '9999').localeCompare(b.dueDate || '9999'));
  if (sortKey === 'assignee') return copy.sort((a, b) => (a.assignee || '').localeCompare(b.assignee || ''));
  if (sortKey === 'status') return copy.sort((a, b) => (a.status || '').localeCompare(b.status || ''));
  if (sortKey === 'label') return copy.sort((a, b) => (a.label || '').localeCompare(b.label || ''));
  return copy.sort((a, b) => a.title.localeCompare(b.title));
}

export default function ListView({
  tasks,
  members,
  canEdit,
  onEdit,
  onNewTask,
  groupBy,
  onGroupByChange,
  sortKey,
  onSortKeyChange,
  filterAssignee,
  filterPriority,
  onClearAssignee,
  onClearPriority,
  onResetFilters,
}) {
  const dispatch = useDispatch();
  const columns = useSelector((s) => s.workspace.columns);
  const [collapsed, setCollapsed] = useState({});
  const [selected, setSelected] = useState([]);
  const [dense, setDense] = useState(true);
  const [assignOpen, setAssignOpen] = useState(false);
  const [tagOpen, setTagOpen] = useState(false);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') setSelected([]);
      if (e.key.toLowerCase() === 'c' && canEdit && !['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName)) {
        e.preventDefault();
        onNewTask('todo');
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [canEdit, onNewTask]);

  const groups = useMemo(() => {
    const sorted = sortTasks(tasks, sortKey);
    if (groupBy === 'assignee') {
      const ids = [...new Set(sorted.map((t) => t.assignee || 'unassigned'))];
      return ids.map((id) => {
        const member = members.find((m) => m.id === id);
        return {
          key: id,
          title: member?.name || 'Unassigned',
          dot: id === 'u1' ? 'primary' : id === 'u2' ? 'secondary' : 'outline',
          countTone: 'text-on-surface-variant',
          items: sorted.filter((t) => (t.assignee || 'unassigned') === id),
        };
      });
    }
    if (groupBy === 'priority') {
      return ['high', 'medium', 'low'].map((p) => ({
        key: p,
        title: p.toUpperCase(),
        dot: p === 'high' ? 'error' : p === 'medium' ? 'secondary' : 'outline',
        countTone: p === 'high' ? 'text-error' : 'text-on-surface-variant',
        items: sorted.filter((t) => t.priority === p),
      })).filter((g) => g.items.length);
    }
    if (groupBy === 'label') {
      const labels = [...new Set(sorted.map((t) => t.label || 'No label'))];
      return labels.map((label) => ({
        key: label,
        title: label.toUpperCase(),
        dot: 'primary',
        countTone: 'text-on-surface-variant',
        items: sorted.filter((t) => (t.label || 'No label') === label),
      }));
    }
    return columns.map((col) => ({
      key: col.id,
      title: col.label.toUpperCase(),
      dot: col.dot,
      countTone: col.dot === 'secondary' ? 'text-secondary' : col.dot === 'primary' ? 'text-primary' : col.dot === 'tertiary' ? 'text-tertiary' : 'text-on-surface-variant',
      items: sorted.filter((t) => t.status === col.id),
      statusId: col.id,
    })).filter((g) => g.items.length || true);
  }, [tasks, sortKey, groupBy, members, columns]);

  const visibleIds = groups.flatMap((g) => (collapsed[g.key] ? [] : g.items.map((t) => t.id)));
  const allSelected = visibleIds.length > 0 && visibleIds.every((id) => selected.includes(id));
  const pad = dense ? 'py-2.5' : 'py-4';

  const toggleSelect = (id) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const memberById = (id) => members.find((m) => m.id === id);

  return (
    <div className="flex flex-col w-full">
      <div className="px-space-xl pt-space-lg pb-space-md flex flex-col gap-space-md">
        <div className="flex flex-wrap items-center justify-between gap-space-md">
          <div className="flex items-center gap-space-2xs bg-surface-container-low p-1 rounded-xl shadow-inner">
            <span className="flex items-center gap-space-xs px-3 py-1.5 rounded-lg bg-surface-container-highest text-on-surface font-label-md text-label-md shadow-sm">
              <Icon name="format_list_bulleted" className="text-[16px] text-primary" />
              <span className="font-semibold">List</span>
              <span className="font-code-tabular text-[10px] px-1.5 py-0.2 rounded-full bg-primary/20 text-primary">{tasks.length}</span>
            </span>
          </div>
          <div className="flex items-center gap-space-md">
            <div className="hidden lg:flex items-center gap-space-sm bg-surface-container-low px-3 py-1.5 rounded-xl">
              <div className="flex flex-col">
                <span className="font-label-sm text-label-sm text-outline">Sprint Velocity</span>
                <span className="font-code-tabular text-body-sm font-semibold text-on-surface">
                  {tasks.filter((t) => t.status === 'done').length}/{tasks.length || 0} completed
                </span>
              </div>
              <svg className="w-20 h-6 text-tertiary overflow-visible" fill="none" viewBox="0 0 80 24">
                <path d="M0 20L15 17L30 19L45 11L60 14L80 4" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" />
                <circle className="fill-tertiary animate-pulse" cx="80" cy="4" r="3" />
              </svg>
            </div>
            <div className="flex items-center gap-1 bg-surface-container-low p-1 rounded-xl">
              <button
                aria-label="Dense view"
                className={`p-1.5 rounded-lg transition-colors ${dense ? 'bg-surface-container-high text-on-surface' : 'text-on-surface-variant hover:bg-surface-container'}`}
                type="button"
                onClick={() => setDense(true)}
              >
                <Icon name="density_medium" className="text-[18px]" />
              </button>
              <button
                aria-label="Comfortable view"
                className={`p-1.5 rounded-lg transition-colors ${!dense ? 'bg-surface-container-high text-on-surface' : 'text-on-surface-variant hover:bg-surface-container'}`}
                type="button"
                onClick={() => setDense(false)}
              >
                <Icon name="view_column" className="text-[18px]" />
              </button>
            </div>
            {canEdit && (
              <button
                className="flex items-center gap-space-xs px-3.5 py-1.5 rounded-xl bg-primary text-on-primary font-label-md text-label-md hover:bg-primary-fixed-dim transition-all shadow-md active:scale-95"
                type="button"
                onClick={() => onNewTask('todo')}
              >
                <Icon name="add_task" className="text-[18px]" />
                <span className="font-semibold">New Task</span>
                <span className="font-code-tabular text-[10px] opacity-70 bg-on-primary/20 px-1 rounded">C</span>
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-space-sm bg-surface-container-low/70 px-space-md py-2 rounded-xl">
          <div className="flex flex-wrap items-center gap-space-xs">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-container-high text-on-surface font-label-sm text-label-sm">
              <Icon name="workspaces" className="text-[15px] text-primary" />
              <span className="text-outline">Group by:</span>
              <select
                value={groupBy}
                onChange={(e) => onGroupByChange(e.target.value)}
                className="bg-transparent font-semibold text-on-surface focus:outline-none capitalize"
              >
                <option value="status">Status</option>
                <option value="assignee">Assignee</option>
                <option value="priority">Priority</option>
                <option value="label">Label</option>
              </select>
            </div>
            <div className="h-4 w-px bg-outline-variant mx-1" />
            {filterAssignee && (
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-surface-container text-on-surface font-label-sm text-label-sm">
                <span className="text-outline">Assignee:</span>
                <span className="font-semibold text-secondary">{members.find((m) => m.id === filterAssignee)?.name}</span>
                <button aria-label="Remove filter" className="text-outline hover:text-error transition-colors ml-1" type="button" onClick={onClearAssignee}>
                  <Icon name="close" className="text-[13px]" />
                </button>
              </div>
            )}
            {filterPriority && (
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-surface-container text-on-surface font-label-sm text-label-sm">
                <span className="text-outline">Priority:</span>
                <span className="font-semibold text-error capitalize">{filterPriority}</span>
                <button aria-label="Remove filter" className="text-outline hover:text-error transition-colors ml-1" type="button" onClick={onClearPriority}>
                  <Icon name="close" className="text-[13px]" />
                </button>
              </div>
            )}
            <span className="flex items-center gap-1 px-2 py-1 rounded-lg text-outline font-label-sm text-label-sm">
              <Icon name="filter_list" className="text-[15px]" />
              <span>Filters from toolbar above</span>
            </span>
          </div>
          <div className="flex items-center gap-space-sm">
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-container text-on-surface font-label-sm text-label-sm">
              <Icon name="sort" className="text-[15px] text-outline" />
              <span className="text-outline">Sort:</span>
              <select
                value={sortKey}
                onChange={(e) => onSortKeyChange(e.target.value)}
                className="bg-transparent font-semibold text-on-surface focus:outline-none"
              >
                <option value="priority">Priority: High to Low</option>
                <option value="dueDate">Due Date</option>
                <option value="title">Title</option>
                <option value="assignee">Assignee</option>
              </select>
            </div>
            <button className="text-outline hover:text-on-surface font-label-sm text-label-sm px-1 transition-colors" type="button" onClick={onResetFilters}>
              Reset
            </button>
          </div>
        </div>
      </div>

      {selected.length > 0 && (
        <div className="mx-space-xl mb-space-sm px-space-md py-2 bg-surface-container-high rounded-xl shadow-lg flex items-center justify-between">
          <div className="flex items-center gap-space-md">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
              <span className="font-label-md text-label-md font-semibold text-on-surface">
                {selected.length} item{selected.length === 1 ? '' : 's'} selected
              </span>
            </div>
            {canEdit && (
              <>
                <div className="h-4 w-px bg-outline-variant" />
                <div className="flex items-center gap-1.5">
                  <div className="relative">
                    <button
                      className="px-2.5 py-1 rounded-lg bg-surface-container text-on-surface hover:bg-surface-container-highest transition-colors font-label-sm text-label-sm flex items-center gap-1"
                      type="button"
                      onClick={() => { setTagOpen((v) => !v); setAssignOpen(false); }}
                    >
                      <Icon name="label" className="text-[15px] text-secondary" />
                      <span>Change Tags</span>
                    </button>
                    {tagOpen && (
                      <div className="absolute top-full mt-1 left-0 z-20 bg-surface-container-highest rounded-lg shadow-xl p-space-sm">
                        <Formik
                          initialValues={{ label: '' }}
                          onSubmit={(values) => {
                            dispatch(bulkUpdate({ ids: selected, patch: { label: values.label } }));
                            setTagOpen(false);
                            setSelected([]);
                          }}
                        >
                          <Form className="flex gap-1">
                            <Field name="label" placeholder="Label" className="bg-surface-container-low rounded px-2 py-1 font-body-sm text-body-sm text-on-surface w-28 focus:outline-none" />
                            <button type="submit" className="text-primary font-label-sm text-label-sm">Apply</button>
                          </Form>
                        </Formik>
                      </div>
                    )}
                  </div>
                  <div className="relative">
                    <button
                      className="px-2.5 py-1 rounded-lg bg-surface-container text-on-surface hover:bg-surface-container-highest transition-colors font-label-sm text-label-sm flex items-center gap-1"
                      type="button"
                      onClick={() => { setAssignOpen((v) => !v); setTagOpen(false); }}
                    >
                      <Icon name="assignment_ind" className="text-[15px] text-tertiary" />
                      <span>Assign</span>
                    </button>
                    {assignOpen && (
                      <div className="absolute top-full mt-1 left-0 z-20 w-40 bg-surface-container-highest rounded-lg shadow-xl p-1">
                        {members.map((m) => (
                          <button
                            key={m.id}
                            type="button"
                            className="w-full text-left px-2 py-1 rounded font-body-sm text-body-sm hover:bg-surface-container"
                            onClick={() => {
                              dispatch(bulkUpdate({ ids: selected, patch: { assignee: m.id } }));
                              setAssignOpen(false);
                              setSelected([]);
                            }}
                          >
                            {m.name}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  <button
                    className="px-2.5 py-1 rounded-lg bg-error-container/30 text-error hover:bg-error-container/60 transition-colors font-label-sm text-label-sm flex items-center gap-1"
                    type="button"
                    onClick={() => {
                      dispatch(bulkDelete(selected));
                      setSelected([]);
                    }}
                  >
                    <Icon name="delete" className="text-[15px]" />
                    <span>Bulk Delete</span>
                  </button>
                </div>
              </>
            )}
          </div>
          <button className="font-code-tabular text-[11px] text-outline hover:text-on-surface" type="button" onClick={() => setSelected([])}>
            Deselect all (Esc)
          </button>
        </div>
      )}

      <div className="px-space-xl pb-space-3xl overflow-x-auto">
        <div className="min-w-[1040px] flex flex-col rounded-xl bg-surface-container-lowest shadow-sm overflow-hidden">
          <div className={`${GRID} py-2.5 bg-surface-container-low font-code-tabular text-label-sm text-outline uppercase tracking-wider select-none`}>
            <div className="flex items-center justify-center">
              <input
                className="w-4 h-4 rounded bg-surface-container-highest accent-primary cursor-pointer"
                type="checkbox"
                checked={allSelected}
                onChange={() => setSelected(allSelected ? [] : visibleIds)}
                disabled={!canEdit}
              />
            </div>
            {[
              { key: 'title', label: 'Task Title' },
              { key: 'status', label: 'Status' },
              { key: 'priority', label: 'Priority' },
              { key: 'assignee', label: 'Assignee' },
              { key: 'dueDate', label: 'Due Date' },
              { key: 'label', label: 'Labels' },
              { key: 'subtasks', label: 'Subtasks' },
            ].map((col) => (
              <button
                key={col.key}
                type="button"
                className={`flex items-center gap-1 hover:text-on-surface ${sortKey === col.key ? 'text-primary' : ''}`}
                onClick={() => col.key !== 'subtasks' && onSortKeyChange(col.key)}
              >
                <span className={sortKey === col.key ? 'font-bold' : ''}>{col.label}</span>
                <Icon
                  name={sortKey === col.key ? (col.key === 'priority' ? 'arrow_downward' : 'arrow_upward') : 'unfold_more'}
                  className={`text-[14px] ${sortKey === col.key ? 'text-primary' : 'text-outline-variant'}`}
                />
              </button>
            ))}
            <div className="text-right pr-2">
              <span>Actions</span>
            </div>
          </div>

          {groups.map((group) => (
            <div key={group.key} className="flex flex-col">
              <button
                type="button"
                className="flex items-center justify-between px-space-md py-2 bg-surface-container hover:bg-surface-container-high transition-colors select-none"
                onClick={() => setCollapsed((c) => ({ ...c, [group.key]: !c[group.key] }))}
              >
                <div className="flex items-center gap-space-sm">
                  <Icon
                    name="expand_more"
                    className={`text-[18px] text-on-surface-variant transition-transform ${collapsed[group.key] ? '-rotate-90' : ''}`}
                  />
                  <div className="flex items-center gap-1.5">
                    <span className={`w-2.5 h-2.5 rounded-full ring-4 ${GROUP_DOT[group.dot] || GROUP_DOT.outline}`} />
                    <span className="font-headline-sm text-headline-sm text-on-surface font-semibold tracking-tight">{group.title}</span>
                  </div>
                  <span className={`font-code-tabular text-[11px] px-2 py-0.5 rounded-full bg-surface-container-highest font-bold ${group.countTone}`}>
                    {group.items.length}
                  </span>
                </div>
                <div className="flex items-center gap-space-sm">
                  <span className="font-code-tabular text-label-sm text-outline">
                    Sprint weight: {group.items.reduce((sum, t) => sum + points(t), 0)} pts
                  </span>
                  {canEdit && (
                    <span
                      className="p-1 rounded text-outline hover:text-on-surface hover:bg-surface-container-highest"
                      onClick={(e) => {
                        e.stopPropagation();
                        onNewTask(group.statusId || 'todo');
                      }}
                    >
                      <Icon name="add" className="text-[16px]" />
                    </span>
                  )}
                </div>
              </button>

              {!collapsed[group.key] && group.items.map((task) => {
                const due = formatDue(task.dueDate);
                const selectedRow = selected.includes(task.id);
                const statusMeta = STATUS_ICON[task.status] || STATUS_ICON.todo;
                const pct = task.subtasksTotal ? Math.round((task.subtasksDone / task.subtasksTotal) * 100) : 0;
                const column = columns.find((c) => c.id === task.status);
                return (
                  <div
                    key={task.id}
                    className={`${GRID} ${pad} transition-colors group ${
                      selectedRow ? 'bg-primary/10 hover:bg-primary/15' : 'bg-surface-container-lowest hover:bg-surface-container-low'
                    } ${!canEdit ? 'opacity-80' : ''}`}
                  >
                    <div className="flex items-center justify-center">
                      <input
                        className={`w-4 h-4 rounded accent-primary ${canEdit ? 'cursor-pointer' : 'opacity-40 cursor-not-allowed'}`}
                        type="checkbox"
                        checked={selectedRow}
                        disabled={!canEdit}
                        onChange={() => toggleSelect(task.id)}
                      />
                    </div>
                    <div className="flex items-center gap-space-sm min-w-0 pr-2">
                      <Icon name={statusMeta.icon} className={`text-[18px] shrink-0 ${statusMeta.className}`} />
                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`font-body-md text-body-md font-medium truncate cursor-pointer hover:text-primary ${selectedRow ? 'text-primary' : 'text-on-surface'}`}
                            onClick={() => onEdit(task)}
                          >
                            {task.title}
                          </span>
                          {!canEdit && <Icon name="lock" className="text-[14px] text-outline shrink-0" />}
                        </div>
                        <span className="font-code-tabular text-[10px] text-outline">
                          WM-{String(task.id).slice(-4).toUpperCase()}
                          {selectedRow ? ' • bulk selected' : ''}
                        </span>
                      </div>
                    </div>
                    <div>
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-code-tabular text-label-sm font-medium ${STATUS_PILL[task.status]}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[task.status]}`} />
                        {column?.label || task.status}
                      </span>
                    </div>
                    <div>
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded font-code-tabular text-[11px] font-semibold ${
                          task.priority === 'high'
                            ? 'bg-error/15 text-error'
                            : task.priority === 'medium'
                              ? 'bg-surface-container-high text-on-surface-variant'
                              : 'bg-surface-container-highest text-outline'
                        }`}
                      >
                        <Icon name={task.priority === 'high' ? 'emergency' : 'drag_handle'} className="text-[13px]" />
                        {task.priority === 'high' ? 'High' : task.priority === 'medium' ? 'Medium' : 'Low'}
                      </span>
                    </div>
                    <div className="flex items-center gap-space-xs truncate">
                      <Avatar user={memberById(task.assignee)} size="w-6 h-6 text-[10px]" />
                      <span className="font-body-sm text-body-sm text-on-surface truncate">
                        {memberById(task.assignee)?.name || 'Unassigned'}
                      </span>
                    </div>
                    <div className={`flex items-center gap-1 font-code-tabular text-label-md ${due.tone}`}>
                      <Icon name={due.icon} className="text-[14px]" />
                      <span>{due.label}</span>
                    </div>
                    <div className="flex items-center gap-1 flex-wrap">
                      {task.label ? (
                        <span className="px-2 py-0.5 rounded bg-surface-container-lowest text-on-surface-variant font-code-tabular text-[10px]">
                          {task.label}
                        </span>
                      ) : (
                        <span className="text-outline font-code-tabular text-[10px]">—</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 pr-2">
                      <div className="flex-1 h-1.5 rounded-full bg-surface-container-highest overflow-hidden">
                        <div
                          className={`h-full rounded-full ${task.status === 'done' ? 'bg-tertiary' : 'bg-secondary'}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <span className="font-code-tabular text-[11px] text-outline shrink-0">
                        {task.subtasksDone || 0}/{task.subtasksTotal || 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-end gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                      {canEdit && (
                        <button
                          className="p-1.5 rounded-lg text-outline hover:bg-tertiary/20 hover:text-tertiary"
                          title="Mark Complete"
                          type="button"
                          onClick={() => dispatch(toggleComplete(task.id))}
                        >
                          <Icon name="check" className="text-[16px]" />
                        </button>
                      )}
                      {canEdit && (
                        <button
                          className="p-1.5 rounded-lg text-outline hover:bg-surface-container-highest hover:text-on-surface"
                          title="Edit Task"
                          type="button"
                          onClick={() => onEdit(task)}
                        >
                          <Icon name="edit" className="text-[16px]" />
                        </button>
                      )}
                      {canEdit && (
                        <button
                          className="p-1.5 rounded-lg text-outline hover:bg-error-container/40 hover:text-error"
                          title="Delete Task"
                          type="button"
                          onClick={() => dispatch(deleteTask(task.id))}
                        >
                          <Icon name="delete" className="text-[16px]" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
