import { useMemo, useState } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useDispatch, useSelector } from 'react-redux';
import { addTask, rescheduleTask } from '../redux/features/tasksSlice';
import Icon from './Icon';

const QuickSchema = Yup.object().shape({
  title: Yup.string().min(3, 'Too short').required('Required'),
  priority: Yup.string().oneOf(['low', 'medium', 'high']).required(),
});

function startOfWeekMonday(date) {
  const d = new Date(date);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

function toISO(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

function priorityChip(task) {
  if (task.status === 'done') {
    return 'bg-tertiary-container/30 text-tertiary';
  }
  if (task.priority === 'high') return 'bg-error-container/40 text-error';
  if (task.priority === 'medium') return 'bg-secondary-container/30 text-secondary';
  return 'bg-surface-container-high text-on-surface';
}

export default function CalendarView({
  tasks,
  members,
  canEdit,
  onEdit,
  projectId,
  filterAssignee,
  filterPriority,
  onFilterAssignee,
  onFilterPriority,
}) {
  const dispatch = useDispatch();
  const currentUser = useSelector((s) => s.auth.currentUser);
  const [cursor, setCursor] = useState(() => new Date(2026, 9, 1));
  const [granularity, setGranularity] = useState('month');
  const [hoverTask, setHoverTask] = useState(null);
  const [quickDate, setQuickDate] = useState(null);
  const [expandedDay, setExpandedDay] = useState(null);

  const year = cursor.getFullYear();
  const month = cursor.getMonth();

  const cells = useMemo(() => {
    if (granularity === 'day') {
      return [{ date: new Date(cursor), inMonth: true }];
    }
    if (granularity === 'week') {
      const start = startOfWeekMonday(cursor);
      return Array.from({ length: 7 }, (_, i) => {
        const d = new Date(start);
        d.setDate(start.getDate() + i);
        return { date: d, inMonth: d.getMonth() === month };
      });
    }
    const first = new Date(year, month, 1);
    const gridStart = startOfWeekMonday(first);
    return Array.from({ length: 42 }, (_, i) => {
      const d = new Date(gridStart);
      d.setDate(gridStart.getDate() + i);
      return { date: d, inMonth: d.getMonth() === month };
    });
  }, [cursor, granularity, year, month]);

  const tasksByDate = useMemo(() => {
    const map = {};
    tasks.forEach((t) => {
      if (!t.dueDate) return;
      if (!map[t.dueDate]) map[t.dueDate] = [];
      map[t.dueDate].push(t);
    });
    return map;
  }, [tasks]);

  const todayIso = toISO(new Date());
  const monthLabel = cursor.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const shift = (dir) => {
    const next = new Date(cursor);
    if (granularity === 'day') next.setDate(next.getDate() + dir);
    else if (granularity === 'week') next.setDate(next.getDate() + dir * 7);
    else next.setMonth(next.getMonth() + dir);
    setCursor(next);
  };

  const cols = granularity === 'day' ? 'grid-cols-1' : 'grid-cols-7';

  return (
    <div className="flex flex-col w-full">
      <div className="flex flex-col gap-space-md px-space-lg py-space-md bg-surface-container-lowest">
        <div className="flex flex-wrap items-center justify-between gap-space-md">
          <div className="flex items-center gap-space-md">
            <span className="font-code-tabular text-[11px] px-2 py-0.5 rounded-full bg-surface-container-high text-primary font-medium tracking-wide">
              SPRINT 14
            </span>
            <span className="font-body-sm text-body-sm text-outline">Due dates plotted by priority</span>
          </div>
          <div className="flex items-center gap-space-sm">
            <div className="flex items-center bg-surface-container-low px-2 py-1 rounded-xl gap-2">
              <Icon name="bolt" className="text-[16px] text-tertiary" />
              <span className="font-code-tabular text-[11px] text-on-surface-variant">
                Velocity: <strong className="text-on-surface font-semibold">{tasks.filter((t) => t.status === 'done').length}/{tasks.length} tasks</strong>
              </span>
            </div>
            {canEdit && (
              <button
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-primary-container text-on-primary-container font-label-md text-label-md hover:bg-primary transition-all shadow-md active:scale-95"
                type="button"
                onClick={() => setQuickDate(todayIso)}
              >
                <Icon name="add" className="text-[16px]" />
                <span>Add Task</span>
              </button>
            )}
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-space-md pt-1">
          <div className="flex items-center gap-space-md">
            <div className="flex items-center gap-1 bg-surface-container p-0.5 rounded-xl">
              <button aria-label="Previous" className="p-1 rounded-lg hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface" type="button" onClick={() => shift(-1)}>
                <Icon name="chevron_left" className="text-[18px]" />
              </button>
              <button className="px-2.5 py-1 rounded-lg hover:bg-surface-container-high text-on-surface font-label-sm text-label-sm" type="button" onClick={() => setCursor(new Date())}>
                Today
              </button>
              <button aria-label="Next" className="p-1 rounded-lg hover:bg-surface-container-high text-on-surface-variant hover:text-on-surface" type="button" onClick={() => shift(1)}>
                <Icon name="chevron_right" className="text-[18px]" />
              </button>
            </div>
            <h2 className="font-headline-md text-headline-md text-on-surface tracking-tight">{monthLabel}</h2>
          </div>
          <div className="flex flex-wrap items-center gap-space-sm">
            <div className="flex items-center gap-1.5 bg-surface-container-low p-1 rounded-xl">
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-container text-on-surface font-label-sm text-label-sm">
                <Icon name="group" className="text-[14px] text-outline" />
                <span>Assignee:</span>
                <select
                  className="bg-transparent text-primary font-semibold focus:outline-none"
                  value={filterAssignee || ''}
                  onChange={(e) => onFilterAssignee(e.target.value || null)}
                >
                  <option value="">All</option>
                  {members.map((m) => (
                    <option key={m.id} value={m.id}>{m.name}</option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-surface-container text-on-surface font-label-sm text-label-sm">
                <Icon name="flag" className="text-[14px] text-outline" />
                <span>Priority:</span>
                <select
                  className="bg-transparent text-primary font-semibold focus:outline-none"
                  value={filterPriority || ''}
                  onChange={(e) => onFilterPriority(e.target.value || null)}
                >
                  <option value="">All</option>
                  <option value="high">High</option>
                  <option value="medium">Medium</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>
            <div className="flex items-center bg-surface-container p-0.5 rounded-xl">
              {['month', 'week', 'day'].map((g) => (
                <button
                  key={g}
                  className={`px-3 py-1 rounded-lg font-label-sm text-label-sm capitalize ${
                    granularity === g ? 'bg-surface-container-high text-on-surface font-semibold shadow-sm' : 'text-on-surface-variant hover:text-on-surface'
                  }`}
                  type="button"
                  onClick={() => setGranularity(g)}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="p-space-lg bg-surface flex flex-col gap-space-lg">
        <div className="bg-surface-container-lowest rounded-xl shadow-xl overflow-hidden flex flex-col">
          {granularity !== 'day' && (
            <div className="grid grid-cols-7 bg-surface-container-low text-center py-2.5 font-label-sm text-label-sm uppercase tracking-wider text-outline">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d, i) => (
                <div key={d} className={i >= 5 ? 'text-on-surface-variant/50' : ''}>{d}</div>
              ))}
            </div>
          )}
          <div className={`grid ${cols} auto-rows-fr gap-px bg-surface-container-highest/40`}>
            {cells.map((cell) => {
              const iso = toISO(cell.date);
              const dayTasks = tasksByDate[iso] || [];
              const isToday = iso === todayIso;
              const weekend = cell.date.getDay() === 0 || cell.date.getDay() === 6;
                  const visible = dayTasks.slice(0, 2);
                  const extra = dayTasks.length - visible.length;
                  return (
                <div
                  key={iso}
                  className={`min-h-[120px] p-2 flex flex-col gap-1.5 ${
                    cell.inMonth ? (weekend ? 'bg-surface-container-low' : 'bg-surface-container') : 'bg-surface-container-lowest/60'
                  } ${isToday ? 'bg-surface-container-high/60' : ''}`}
                  onClick={() => canEdit && dayTasks.length === 0 && setQuickDate(iso)}
                >
                  {isToday ? (
                    <div className="flex items-center justify-between">
                      <div className="w-6 h-6 rounded-full bg-primary-container text-on-primary flex items-center justify-center font-code-tabular text-[11px] font-bold shadow-md">
                        {cell.date.getDate()}
                      </div>
                      <span className="font-label-sm text-[10px] text-primary font-semibold uppercase tracking-wider">Today</span>
                    </div>
                  ) : (
                    <span className={`font-code-tabular text-[11px] ${cell.inMonth ? 'text-outline' : 'text-outline/40'}`}>
                      {cell.date.getDate()}
                    </span>
                  )}
                  {(expandedDay === iso ? dayTasks : visible).map((task) => (
                    <button
                      key={task.id}
                      type="button"
                      className={`px-2 py-1 rounded-lg font-label-sm text-label-sm truncate text-left transition-all hover:scale-[1.01] ${priorityChip(task)}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        onEdit(task);
                      }}
                      onMouseEnter={() => setHoverTask({ task, iso })}
                      onMouseLeave={() => setHoverTask(null)}
                    >
                      <div className="flex items-center gap-1">
                        {task.status === 'done' ? (
                          <Icon name="check_circle" className="text-[12px] text-tertiary" />
                        ) : task.priority === 'high' ? (
                          <Icon name="priority_high" className="text-[13px] text-error" />
                        ) : (
                          <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                            task.priority === 'medium' ? 'bg-secondary' : 'bg-outline'
                          }`} />
                        )}
                        <span className="truncate">{task.title}</span>
                      </div>
                    </button>
                  ))}
                  {extra > 0 && expandedDay !== iso && (
                    <button
                      type="button"
                      className="text-left px-1 font-label-sm text-label-sm text-primary hover:underline font-medium flex items-center gap-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        setExpandedDay(iso);
                      }}
                    >
                      <Icon name="add" className="text-[12px]" />
                      <span>{extra} more</span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-space-md">
          <div className="p-space-md bg-surface-container-low rounded-xl flex flex-col gap-space-sm">
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider">Upcoming due dates</span>
              <Icon name="flag" className="text-outline text-[16px]" />
            </div>
            <div className="space-y-2">
              {tasks
                .filter((t) => t.dueDate)
                .sort((a, b) => a.dueDate.localeCompare(b.dueDate))
                .slice(0, 3)
                .map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    className="w-full flex items-center justify-between p-2 rounded-lg bg-surface-container text-left"
                    onClick={() => onEdit(t)}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <span className={`w-2 h-2 rounded-full shrink-0 ${t.priority === 'high' ? 'bg-error' : t.status === 'done' ? 'bg-tertiary' : 'bg-secondary'}`} />
                      <span className="font-body-md text-body-md text-on-surface truncate">{t.title}</span>
                    </div>
                    <span className="font-code-tabular text-[11px] text-outline shrink-0 ml-2">{t.dueDate.slice(5)}</span>
                  </button>
                ))}
            </div>
          </div>
          <div className="p-space-md bg-surface-container-low rounded-xl flex flex-col gap-space-sm">
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider">Sprint Pace</span>
              <span className="font-code-tabular text-[11px] text-tertiary">
                {tasks.filter((t) => t.status === 'done').length}/{tasks.length || 1} done
              </span>
            </div>
            <div className="flex items-center justify-between gap-4">
              <div className="flex flex-col justify-center">
                <span className="font-display-lg text-display-lg text-on-surface font-bold">
                  {tasks.length ? Math.round((tasks.filter((t) => t.status === 'done').length / tasks.length) * 100) : 0}%
                </span>
                <span className="font-body-sm text-body-sm text-outline">Target completion</span>
              </div>
              <svg className="w-36 h-12 text-primary" fill="none" viewBox="0 0 144 48">
                <path d="M2 40L24 35L48 28L72 32L96 18L120 14L142 4" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" />
                <path d="M2 40L24 35L48 28L72 32L96 18L120 14L142 4V48H2V40Z" fill="currentColor" fillOpacity="0.1" />
              </svg>
            </div>
          </div>
          <div className="p-space-md bg-surface-container-low rounded-xl flex flex-col justify-between gap-space-sm">
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-label-sm text-outline uppercase tracking-wider">Priority Reference</span>
              <span className="font-code-tabular text-[11px] text-on-surface-variant">Key</span>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-error-container/30 text-on-error-container font-label-sm text-label-sm">
                <span className="w-2 h-2 rounded-full bg-error" />
                <span>Urgent</span>
              </div>
              <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-secondary-container/30 text-secondary font-label-sm text-label-sm">
                <span className="w-2 h-2 rounded-full bg-secondary" />
                <span>Medium</span>
              </div>
              <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-tertiary-container/30 text-tertiary font-label-sm text-label-sm">
                <span className="w-2 h-2 rounded-full bg-tertiary" />
                <span>Complete</span>
              </div>
            </div>
            <p className="font-body-sm text-body-sm text-outline">Click an empty date to quick-add a task</p>
          </div>
        </div>
      </div>

      {hoverTask && (
        <div className="fixed bottom-6 right-6 z-40 w-80 p-space-md bg-surface-container-high text-on-surface rounded-xl shadow-2xl">
          <div className="flex items-start justify-between gap-2 pb-2">
            <span className="font-code-tabular text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-error-container text-on-error-container">
              {hoverTask.task.priority}
            </span>
            <span className="font-label-sm text-label-sm text-outline">{hoverTask.task.status}</span>
          </div>
          <h4 className="font-headline-sm text-headline-sm text-on-surface font-semibold mb-2 leading-snug">{hoverTask.task.title}</h4>
          <div className="flex items-center justify-between font-body-sm text-body-sm text-on-surface-variant">
            <span>Assignee</span>
            <span className="text-on-surface">{members.find((m) => m.id === hoverTask.task.assignee)?.name}</span>
          </div>
          <div className="mt-2 pt-2 flex items-center justify-between">
            <span className="font-label-sm text-label-sm text-outline flex items-center gap-1">
              <Icon name="schedule" className="text-[13px]" /> Reschedule
            </span>
            {canEdit && (
              <div className="flex items-center gap-1">
                <button
                  className="px-1.5 py-0.5 rounded bg-surface-container hover:bg-surface-bright text-primary font-code-tabular text-[10px]"
                  type="button"
                  onClick={() => {
                    const d = new Date(`${hoverTask.task.dueDate}T00:00:00`);
                    d.setDate(d.getDate() + 1);
                    dispatch(rescheduleTask({ id: hoverTask.task.id, dueDate: toISO(d) }));
                  }}
                >
                  +1d
                </button>
                <button
                  className="px-1.5 py-0.5 rounded bg-surface-container hover:bg-surface-bright text-primary font-code-tabular text-[10px]"
                  type="button"
                  onClick={() => {
                    const d = new Date(`${hoverTask.task.dueDate}T00:00:00`);
                    d.setDate(d.getDate() + 7);
                    dispatch(rescheduleTask({ id: hoverTask.task.id, dueDate: toISO(d) }));
                  }}
                >
                  +1w
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {quickDate && canEdit && (
        <div className="fixed inset-0 z-[70] bg-black/50 flex items-center justify-center p-4" onClick={() => setQuickDate(null)}>
          <div className="bg-surface-container-high rounded-xl shadow-2xl w-full max-w-sm p-space-lg" onClick={(e) => e.stopPropagation()}>
            <h2 className="font-headline-sm text-headline-sm text-on-surface mb-space-md">Quick create · {quickDate}</h2>
            <Formik
              initialValues={{ title: '', priority: 'medium' }}
              validationSchema={QuickSchema}
              onSubmit={(values) => {
                dispatch(addTask({
                  ...values,
                  projectId,
                  dueDate: quickDate,
                  assignee: currentUser?.id,
                  status: 'todo',
                }));
                setQuickDate(null);
              }}
            >
              <Form className="space-y-space-sm">
                <Field
                  name="title"
                  placeholder="Task title"
                  className="w-full bg-surface-container-low text-on-surface rounded-lg px-space-sm py-2 font-body-md text-body-md focus:outline-none"
                />
                <ErrorMessage name="title" component="p" className="text-error text-label-sm" />
                <Field
                  as="select"
                  name="priority"
                  className="w-full bg-surface-container-low text-on-surface rounded-lg px-space-sm py-2 font-body-md text-body-md focus:outline-none"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </Field>
                <div className="flex justify-end gap-space-xs">
                  <button type="button" onClick={() => setQuickDate(null)} className="px-3 py-1.5 rounded-xl font-label-md text-label-md text-on-surface-variant">
                    Cancel
                  </button>
                  <button type="submit" className="px-3 py-1.5 rounded-xl bg-primary-container text-on-primary-container font-label-md text-label-md">
                    Create
                  </button>
                </div>
              </Form>
            </Formik>
          </div>
        </div>
      )}
    </div>
  );
}
