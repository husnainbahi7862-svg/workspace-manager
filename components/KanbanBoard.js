import { useEffect, useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useDispatch, useSelector } from 'react-redux';
import {
  deleteTask,
  duplicateTask,
  moveTask,
  bulkUpdate,
  bulkDelete,
} from '../redux/features/tasksSlice';
import { addColumn, reorderColumns } from '../redux/features/workspaceSlice';
import Icon from './Icon';
import { Avatar } from './AppShell';

const DOT = {
  outline: 'bg-outline',
  secondary: 'bg-secondary',
  primary: 'bg-primary',
  tertiary: 'bg-tertiary',
};

const COUNT_TONE = {
  outline: 'text-on-surface-variant',
  secondary: 'text-secondary',
  primary: 'text-primary',
  tertiary: 'text-tertiary',
};

const PRIORITY_PILL = {
  high: 'bg-error/15 text-error',
  medium: 'bg-secondary-container/20 text-secondary',
  low: 'bg-surface-container-highest text-outline',
};

const PRIORITY_LABEL = { high: 'High', medium: 'Med', low: 'Low' };

const LABEL_TONE = {
  secondary: 'bg-surface-container-highest text-secondary',
  tertiary: 'bg-surface-container-highest text-tertiary',
  primary: 'bg-surface-container-highest text-primary',
  error: 'bg-error-container/40 text-error',
};

const ColumnSchema = Yup.object().shape({
  label: Yup.string().min(2, 'Too short').required('Required'),
});

function formatDue(dueDate) {
  if (!dueDate) return null;
  const d = new Date(`${dueDate}T00:00:00`);
  if (Number.isNaN(d.getTime())) return dueDate;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  if (d.getTime() === today.getTime()) return 'Today';
  return d.toLocaleDateString('en-US', { month: 'short', day: '2-digit' });
}

function isOverdue(dueDate) {
  if (!dueDate) return false;
  const d = new Date(`${dueDate}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return d < today;
}

function TaskCard({
  task,
  member,
  selected,
  menuOpen,
  canEdit,
  onToggleSelect,
  onOpenMenu,
  onEdit,
  onDuplicate,
  onDelete,
  onMove,
  columns,
}) {
  const due = formatDue(task.dueDate);
  const overdue = isOverdue(task.dueDate) && task.status !== 'done';
  const done = task.status === 'done';

  return (
    <div
      draggable
      onDragStart={(e) => {
        e.stopPropagation();
        e.dataTransfer.setData('taskid', task.id);
        e.dataTransfer.effectAllowed = 'move';
        // Delay opacity so drag image is opaque
        setTimeout(() => { if (e.target) e.target.style.opacity = '0.4'; }, 0);
      }}
      onDragEnd={(e) => {
        e.target.style.opacity = '1';
      }}
      className={`group rounded-lg p-space-sm shadow-sm hover:shadow-md transition-all relative cursor-grab active:cursor-grabbing ${
        selected ? 'bg-surface-container' : 'bg-surface-container-low hover:bg-surface-container'
      }`}
    >
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2">
          <input
            checked={selected}
            onChange={() => onToggleSelect(task.id)}
            className="w-3.5 h-3.5 rounded bg-surface-container-low checked:bg-primary accent-primary cursor-pointer"
            type="checkbox"
          />
          <Icon name="drag_indicator" className="text-[14px] text-outline opacity-40 group-hover:opacity-100 cursor-grab" />
          <span className={`font-code-tabular text-[10px] font-semibold px-2 py-0.5 rounded-full ${done ? 'bg-tertiary/15 text-tertiary' : PRIORITY_PILL[task.priority]}`}>
            {done ? 'Done' : PRIORITY_LABEL[task.priority] || task.priority}
          </span>
        </div>
        <div className="relative">
          <button
            className={`p-0.5 rounded text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high ${menuOpen ? 'text-on-surface bg-surface-container-high' : ''}`}
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onOpenMenu(menuOpen ? null : task.id);
            }}
          >
            <Icon name="more_horiz" className="text-[16px]" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-8 z-30 w-44 bg-surface-container-high rounded-lg shadow-xl p-1 flex flex-col gap-0.5 text-on-surface">
              {columns.map((col) => (
                <button
                  key={col.id}
                  className="w-full text-left px-2 py-1 rounded text-body-sm font-body-sm hover:bg-surface-container flex items-center gap-2"
                  type="button"
                  onClick={() => onMove(task, col.id)}
                >
                  <Icon name="subdirectory_arrow_right" className="text-[14px] text-outline" />
                  <span>Move to {col.label}</span>
                </button>
              ))}
              {canEdit && (
                <button
                  className="w-full text-left px-2 py-1 rounded text-body-sm font-body-sm hover:bg-surface-container flex items-center gap-2"
                  type="button"
                  onClick={() => onDuplicate(task.id)}
                >
                  <Icon name="content_copy" className="text-[14px] text-outline" />
                  <span>Duplicate task</span>
                </button>
              )}
              {canEdit && (
                <button
                  className="w-full text-left px-2 py-1 rounded text-body-sm font-body-sm hover:bg-error-container text-error flex items-center gap-2"
                  type="button"
                  onClick={() => onDelete(task.id)}
                >
                  <Icon name="delete" className="text-[14px]" />
                  <span>Delete task</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {task.label ? (
        <div className="mb-2">
          <span className={`font-label-sm text-label-sm px-1.5 py-0.5 rounded font-medium ${LABEL_TONE[task.labelTone] || LABEL_TONE.primary}`}>
            {task.label}
          </span>
        </div>
      ) : null}

      <h3
        className={`font-body-md text-body-md tracking-tight mb-2 leading-snug cursor-pointer ${
          done
            ? 'text-on-surface line-through decoration-outline font-medium opacity-80'
            : 'text-on-surface font-semibold'
        }`}
        onClick={() => onEdit(task)}
      >
        {task.title}
      </h3>

      {task.thumbnail ? (
        <div className="mb-2 rounded overflow-hidden h-24 bg-surface-container-highest flex items-center justify-center">
          <Icon name="image" className="text-[28px] text-outline" />
        </div>
      ) : null}

      <div className="flex items-center justify-between pt-1 text-on-surface-variant">
        <div className="flex items-center gap-space-sm text-[11px] font-code-tabular">
          {task.subtasksTotal > 0 && (
            <span className={`flex items-center gap-0.5 ${done ? 'text-tertiary' : 'hover:text-on-surface'}`} title="Subtasks">
              <Icon name={done ? 'check_circle' : 'checklist'} className="text-[13px]" />
              {task.subtasksDone}/{task.subtasksTotal}
            </span>
          )}
          {task.attachments > 0 && (
            <span className="flex items-center gap-0.5 hover:text-on-surface" title="Attachments">
              <Icon name="attach_file" className="text-[13px]" /> {task.attachments}
            </span>
          )}
          {task.comments > 0 && (
            <span className="flex items-center gap-0.5 hover:text-on-surface" title="Comments">
              <Icon name="chat_bubble_outline" className="text-[13px]" /> {task.comments}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          {due && (
            <span
              className={`font-code-tabular text-[10px] flex items-center gap-0.5 ${
                overdue
                  ? 'px-1.5 py-0.5 rounded bg-error-container text-on-error-container font-medium'
                  : 'text-outline'
              }`}
            >
              <Icon name="schedule" className="text-[12px]" /> {due}
            </span>
          )}
          <Avatar user={member} size="w-5 h-5 text-[9px]" />
        </div>
      </div>
    </div>
  );
}

export default function KanbanBoard({
  tasks,
  members,
  canEdit,
  onEdit,
  onNewTask,
  sortKey,
}) {
  const dispatch = useDispatch();
  const columns = useSelector((s) => {
    const ws = s.workspace.workspaces.find((w) => w.id === s.workspace.activeWorkspaceId);
    const p = ws?.projects.find((p) => p.id === s.workspace.activeProjectId);
    return p?.columns || [];
  });
  const currentUser = useSelector((s) => s.auth.currentUser);
  const [selected, setSelected] = useState([]);
  const [menuId, setMenuId] = useState(null);
  const [toast, setToast] = useState(null);
  const [addColOpen, setAddColOpen] = useState(false);
  const [bulkStatusOpen, setBulkStatusOpen] = useState(false);
  const [bulkAssignOpen, setBulkAssignOpen] = useState(false);
  const [bulkPriorityOpen, setBulkPriorityOpen] = useState(false);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setSelected([]);
        setMenuId(null);
        setBulkStatusOpen(false);
        setBulkAssignOpen(false);
        setBulkPriorityOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(() => setToast(null), 4000);
    return () => clearTimeout(t);
  }, [toast]);

  const memberById = (id) => members.find((m) => m.id === id);

  const sortedForColumn = (colId) => {
    const list = tasks.filter((t) => t.status === colId);
    if (sortKey === 'priority') {
      const order = { high: 0, medium: 1, low: 2 };
      return [...list].sort((a, b) => (order[a.priority] ?? 9) - (order[b.priority] ?? 9));
    }
    if (sortKey === 'title') {
      return [...list].sort((a, b) => a.title.localeCompare(b.title));
    }
    return [...list].sort((a, b) => (a.dueDate || '9999').localeCompare(b.dueDate || '9999'));
  };

  const toggleSelect = (id) => {
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  const handleMove = (task, status) => {
    const col = columns.find((c) => c.id === status);
    dispatch(moveTask({ id: task.id, status, userId: currentUser?.id }));
    setMenuId(null);
    setToast({ title: `Task “${task.title}”`, detail: `Moved to ${col?.label || status} stage`, task });
  };

  const undoToast = () => {
    if (!toast?.task) return;
    dispatch(moveTask({ id: toast.task.id, status: toast.task.status, userId: currentUser?.id }));
    setToast(null);
  };

  return (
    <div className="w-full px-space-lg py-space-md overflow-x-auto pb-28">
      <div className="inline-flex items-start gap-space-md min-w-[1240px] w-full">
        {columns.map((col) => {
          const colTasks = sortedForColumn(col.id);
          return (
            <div
              key={col.id}
              draggable
              onDragStart={(e) => {
                e.dataTransfer.setData('colid', col.id);
                e.dataTransfer.effectAllowed = 'move';
              }}
              onDragOver={(e) => {
                e.preventDefault();
                if (e.dataTransfer.types.includes('colid')) {
                  e.currentTarget.classList.add('ring-2', 'ring-tertiary/50');
                } else {
                  e.currentTarget.classList.add('ring-2', 'ring-primary/50');
                }
              }}
              onDragLeave={(e) => {
                e.currentTarget.classList.remove('ring-2', 'ring-primary/50', 'ring-tertiary/50');
              }}
              onDrop={(e) => {
                e.stopPropagation();
                e.preventDefault();
                e.currentTarget.classList.remove('ring-2', 'ring-primary/50', 'ring-tertiary/50');
                const taskId = e.dataTransfer.getData('taskid');
                const colId = e.dataTransfer.getData('colid');
                if (taskId) {
                  const taskObj = tasks.find((t) => t.id === taskId);
                  if (taskObj && taskObj.status !== col.id) {
                    handleMove(taskObj, col.id);
                  }
                } else if (colId && colId !== col.id) {
                  const sourceIndex = columns.findIndex(c => c.id === colId);
                  const destinationIndex = columns.findIndex(c => c.id === col.id);
                  if (sourceIndex > -1 && destinationIndex > -1) {
                    dispatch(reorderColumns({ sourceIndex, destinationIndex }));
                  }
                }
              }}
              className={`flex-1 min-w-[290px] max-w-[340px] bg-surface-container-lowest/60 rounded-xl p-space-sm flex flex-col gap-space-sm shadow-sm transition-all cursor-default ${
                col.id === 'done' ? 'opacity-95' : ''
              }`}
            >
              <div className="flex items-center justify-between pb-1 px-1">
                <div className="flex items-center gap-space-xs">
                  <span className={`w-2 h-2 rounded-full ${DOT[col.dot] || 'bg-outline'}`} />
                  <h2 className="font-headline-sm text-headline-sm text-on-surface font-semibold">{col.label}</h2>
                  <span className={`font-code-tabular text-[11px] px-1.5 py-0.2 rounded-full bg-surface-container-high font-medium ${COUNT_TONE[col.dot] || 'text-on-surface-variant'}`}>
                    {colTasks.length}
                  </span>
                </div>
                <div className="flex items-center gap-0.5">
                  <button className="p-1 rounded text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors" title="Sort Column" type="button">
                    <Icon name="sort" className="text-[16px]" />
                  </button>
                  {canEdit && (
                    <button
                      className="p-1 rounded text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors"
                      title="Add Card"
                      type="button"
                      onClick={() => onNewTask(col.id)}
                    >
                      <Icon name="add" className="text-[16px]" />
                    </button>
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-space-xs">
                {colTasks.map((task) => (
                  <TaskCard
                    key={task.id}
                    task={task}
                    member={memberById(task.assignee)}
                    selected={selected.includes(task.id)}
                    menuOpen={menuId === task.id}
                    canEdit={canEdit}
                    columns={columns}
                    onToggleSelect={toggleSelect}
                    onOpenMenu={setMenuId}
                    onEdit={onEdit}
                    onDuplicate={(id) => {
                      dispatch(duplicateTask(id));
                      setMenuId(null);
                    }}
                    onDelete={(id) => {
                      dispatch(deleteTask(id));
                      setSelected((s) => s.filter((x) => x !== id));
                      setMenuId(null);
                    }}
                    onMove={handleMove}
                  />
                ))}
              </div>

              {canEdit && (
                <button
                  className="w-full py-1.5 flex items-center justify-center gap-1 text-outline hover:text-on-surface hover:bg-surface-container rounded-lg transition-colors font-label-sm text-label-sm"
                  type="button"
                  onClick={() => onNewTask(col.id)}
                >
                  <Icon name="add" className="text-[15px]" />
                  <span>Add task</span>
                </button>
              )}
            </div>
          );
        })}

        {canEdit && (
          <div className="w-72 flex-shrink-0">
            {addColOpen ? (
              <div className="rounded-xl bg-surface-container-lowest p-space-sm">
                <Formik
                  initialValues={{ label: '' }}
                  validationSchema={ColumnSchema}
                  onSubmit={(values, { resetForm }) => {
                    dispatch(addColumn({ label: values.label }));
                    resetForm();
                    setAddColOpen(false);
                  }}
                >
                  <Form className="space-y-space-xs">
                    <Field
                      name="label"
                      placeholder="Column name"
                      className="w-full bg-surface-container-low text-on-surface rounded-lg px-space-sm py-2 font-body-sm text-body-sm focus:outline-none"
                    />
                    <ErrorMessage name="label" component="p" className="text-error text-label-sm" />
                    <div className="flex gap-space-xs">
                      <button type="submit" className="px-3 py-1 rounded-lg bg-primary-container text-on-primary-container font-label-sm text-label-sm">
                        Add
                      </button>
                      <button type="button" onClick={() => setAddColOpen(false)} className="px-3 py-1 rounded-lg text-on-surface-variant font-label-sm text-label-sm">
                        Cancel
                      </button>
                    </div>
                  </Form>
                </Formik>
              </div>
            ) : (
              <button
                className="w-full py-6 px-4 rounded-xl bg-surface-container-lowest/40 hover:bg-surface-container-low transition-all text-on-surface-variant hover:text-on-surface flex flex-col items-center justify-center gap-2 group shadow-sm"
                type="button"
                onClick={() => setAddColOpen(true)}
              >
                <span className="w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-outline group-hover:text-primary transition-colors">
                  <Icon name="add" className="text-[20px]" />
                </span>
                <span className="font-label-md text-label-md font-medium">Add New Column</span>
                <span className="font-code-tabular text-[10px] text-outline">Stage, Workflow or Category</span>
              </button>
            )}
          </div>
        )}
      </div>

      {selected.length > 0 && (
        <aside className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 bg-surface-container-highest/95 backdrop-blur-md px-space-md py-space-xs rounded-xl shadow-2xl flex items-center gap-space-md text-on-surface max-w-[90vw]">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary animate-ping" />
            <span className="font-label-md text-label-md font-semibold text-on-surface">
              {selected.length} task{selected.length === 1 ? '' : 's'} selected
            </span>
          </div>
          <div className="h-4 w-[1px] bg-outline-variant" />
          {canEdit && (
            <div className="flex items-center gap-space-xs">
              <div className="relative">
                <button
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-sm text-label-sm transition-colors"
                  type="button"
                  onClick={() => {
                    setBulkStatusOpen((v) => !v);
                    setBulkAssignOpen(false);
                    setBulkPriorityOpen(false);
                  }}
                >
                  <span className="text-outline">Status:</span>
                  <span className="text-secondary font-medium">Change</span>
                  <Icon name="arrow_drop_down" className="text-[14px]" />
                </button>
                {bulkStatusOpen && (
                  <div className="absolute bottom-full mb-1 left-0 w-40 bg-surface-container-high rounded-lg shadow-xl p-1">
                    {columns.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        className="w-full text-left px-2 py-1 rounded font-body-sm text-body-sm hover:bg-surface-container"
                        onClick={() => {
                          dispatch(bulkUpdate({ ids: selected, patch: { status: c.id } }));
                          setBulkStatusOpen(false);
                          setSelected([]);
                        }}
                      >
                        {c.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="relative">
                <button
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-sm text-label-sm transition-colors"
                  type="button"
                  onClick={() => {
                    setBulkAssignOpen((v) => !v);
                    setBulkStatusOpen(false);
                    setBulkPriorityOpen(false);
                  }}
                >
                  <Icon name="person_add" className="text-[14px] text-outline" />
                  <span>Assign to...</span>
                </button>
                {bulkAssignOpen && (
                  <div className="absolute bottom-full mb-1 left-0 w-44 bg-surface-container-high rounded-lg shadow-xl p-1">
                    {members.map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        className="w-full text-left px-2 py-1 rounded font-body-sm text-body-sm hover:bg-surface-container"
                        onClick={() => {
                          dispatch(bulkUpdate({ ids: selected, patch: { assignee: m.id } }));
                          setBulkAssignOpen(false);
                          setSelected([]);
                        }}
                      >
                        {m.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div className="relative">
                <button
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface font-label-sm text-label-sm transition-colors"
                  type="button"
                  onClick={() => {
                    setBulkPriorityOpen((v) => !v);
                    setBulkStatusOpen(false);
                    setBulkAssignOpen(false);
                  }}
                >
                  <Icon name="flag" className="text-[14px] text-outline" />
                  <span>Priority</span>
                </button>
                {bulkPriorityOpen && (
                  <div className="absolute bottom-full mb-1 left-0 w-32 bg-surface-container-high rounded-lg shadow-xl p-1">
                    {['high', 'medium', 'low'].map((p) => (
                      <button
                        key={p}
                        type="button"
                        className="w-full text-left px-2 py-1 rounded font-body-sm text-body-sm hover:bg-surface-container capitalize"
                        onClick={() => {
                          dispatch(bulkUpdate({ ids: selected, patch: { priority: p } }));
                          setBulkPriorityOpen(false);
                          setSelected([]);
                        }}
                      >
                        {p}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-error-container hover:bg-error-container/80 text-on-error-container font-label-sm text-label-sm transition-colors"
                type="button"
                onClick={() => {
                  dispatch(bulkDelete(selected));
                  setSelected([]);
                }}
              >
                <Icon name="delete" className="text-[14px]" />
                <span className="hidden sm:inline">Delete</span>
              </button>
            </div>
          )}
          <div className="h-4 w-[1px] bg-outline-variant" />
          <button
            className="flex items-center gap-1 text-outline hover:text-on-surface font-code-tabular text-[11px] transition-colors"
            type="button"
            onClick={() => setSelected([])}
          >
            <span>Deselect</span>
            <span className="px-1 py-0.2 rounded bg-surface-container text-[9px] uppercase">Esc</span>
          </button>
        </aside>
      )}

      {toast && (
        <aside className="fixed bottom-6 right-6 z-40 bg-surface-container-high rounded-xl shadow-2xl p-space-sm max-w-sm flex flex-col gap-2">
          <div className="flex items-start justify-between gap-space-sm">
            <div className="flex items-start gap-space-xs">
              <Icon name="check_circle" className="text-[18px] text-tertiary mt-0.5" />
              <div className="flex flex-col">
                <span className="font-body-md text-body-md text-on-surface font-medium leading-tight">{toast.title}</span>
                <span className="font-code-tabular text-[11px] text-outline">{toast.detail}</span>
              </div>
            </div>
            <button
              className="px-2 py-0.5 rounded bg-surface-container-highest hover:bg-surface-bright text-primary font-label-sm text-label-sm transition-colors font-semibold"
              type="button"
              onClick={undoToast}
            >
              Undo
            </button>
          </div>
          <div className="w-full bg-surface-container h-1 rounded-full overflow-hidden">
            <div className="bg-tertiary h-full rounded-full w-full origin-left animate-[shrink_4s_linear_forwards]" />
          </div>
        </aside>
      )}
    </div>
  );
}
