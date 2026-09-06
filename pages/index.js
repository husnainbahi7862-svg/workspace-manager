import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import { toggleStarProject, setProjectView } from '../redux/features/workspaceSlice';
import AppShell, { Avatar, DOT } from '../components/AppShell';
import KanbanBoard from '../components/KanbanBoard';
import ListView from '../components/ListView';
import CalendarView from '../components/CalendarView';
import TaskModal from '../components/TaskModal';
import Icon from '../components/Icon';

const VIEWS = [
  { id: 'board', label: 'Board', icon: 'view_kanban' },
  { id: 'list', label: 'List', icon: 'format_list_bulleted' },
  { id: 'calendar', label: 'Calendar', icon: 'calendar_today' },
];

export default function Home() {
  const router = useRouter();
  const dispatch = useDispatch();
  const currentUser = useSelector((s) => s.auth.currentUser);
  const members = useSelector((s) => s.auth.mockUsers);
  const workspaces = useSelector((s) => s.workspace.workspaces);
  const activeWorkspaceId = useSelector((s) => s.workspace.activeWorkspaceId);
  const activeProjectId = useSelector((s) => s.workspace.activeProjectId);
  const allTasks = useSelector((s) => s.tasks.items);
  const projectViews = useSelector((s) => s.workspace.projectViews);

  const [view, setView] = useState('board');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState(null);
  const [defaultStatus, setDefaultStatus] = useState('todo');
  const [query, setQuery] = useState('');
  const [headerSearch, setHeaderSearch] = useState('');
  const [sortKey, setSortKey] = useState('dueDate');
  const [groupBy, setGroupBy] = useState('status');
  const [savedView, setSavedView] = useState('all');
  const [filterAssignee, setFilterAssignee] = useState(null);
  const [filterPriority, setFilterPriority] = useState(null);
  const [filterStatus, setFilterStatus] = useState('all');
  const [addFilterOpen, setAddFilterOpen] = useState(false);
  const [jumpOpen, setJumpOpen] = useState(false);
  const [customViews, setCustomViews] = useState([]);

  const workspace = workspaces.find((w) => w.id === activeWorkspaceId) || workspaces[0];
  const activeProject = workspace?.projects.find((p) => p.id === activeProjectId) || workspace?.projects[0];

  useEffect(() => {
    if (!currentUser) router.replace('/login');
  }, [currentUser, router]);

  useEffect(() => {
    if (activeProjectId) {
      setView(projectViews?.[activeProjectId] || 'board');
    }
  }, [activeProjectId, projectViews]);

  useEffect(() => {
    const q = router.query.view;
    if (q === 'list' || q === 'calendar' || q === 'board') {
      if (q !== view) {
        setView(q);
        if (activeProjectId) {
          dispatch(setProjectView({ projectId: activeProjectId, view: q }));
        }
      }
    }
  }, [router.query.view, activeProjectId, dispatch]);

  const handleViewChange = (v) => {
    setView(v);
    if (activeProjectId) {
      dispatch(setProjectView({ projectId: activeProjectId, view: v }));
    }
    router.push(v === 'board' ? '/' : `/?view=${v}`, undefined, { shallow: true });
  };

  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setJumpOpen(true);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const canEdit = currentUser?.role !== 'viewer';

  const tasks = useMemo(() => {
    let list = allTasks.filter((t) => t.projectId === activeProject?.id);
    const q = (query || headerSearch).toLowerCase();
    if (q) {
      list = list.filter((t) => 
        t.title.toLowerCase().includes(q) ||
        (t.description || '').toLowerCase().includes(q) ||
        (t.commentList || []).some(c => (c.text || '').toLowerCase().includes(q))
      );
    }
    if (savedView === 'mine') list = list.filter((t) => t.assignee === currentUser?.id);
    if (savedView === 'urgent') list = list.filter((t) => t.priority === 'high');
    if (filterAssignee) list = list.filter((t) => t.assignee === filterAssignee);
    if (filterPriority) list = list.filter((t) => t.priority === filterPriority);
    if (filterStatus && filterStatus !== 'all') list = list.filter((t) => t.status === filterStatus);
    return list;
  }, [
    allTasks,
    activeProject?.id,
    query,
    headerSearch,
    savedView,
    currentUser?.id,
    filterAssignee,
    filterPriority,
    filterStatus,
  ]);

  const doneCount = allTasks.filter((t) => t.projectId === activeProject?.id && t.status === 'done').length;
  const totalCount = allTasks.filter((t) => t.projectId === activeProject?.id).length;
  const completion = totalCount ? Math.round((doneCount / totalCount) * 100) : 0;
  const projectMembers = members.filter((m) => workspace?.members?.includes(m.id));

  const openNewTask = (status) => {
    if (!canEdit) return;
    setEditingTask(null);
    setDefaultStatus(status || 'todo');
    setModalOpen(true);
  };

  const openEditTask = (task) => {
    router.push(`/task/${task.id}`);
  };

  if (!currentUser) return null;

  return (
    <AppShell
      view={view}
      onViewChange={handleViewChange}
      searchQuery={headerSearch}
      onSearchChange={setHeaderSearch}
      onCommandPalette={() => setJumpOpen(true)}
    >
      <div className="flex flex-col w-full">
        {view === 'board' && (
        <div className="px-space-lg pt-space-md pb-space-sm flex flex-col gap-space-md">
          <div className="flex flex-wrap items-center justify-between gap-space-md">
            <div className="flex items-center gap-space-md">
              <div className="flex items-center gap-space-xs">
                <span className={`w-3.5 h-3.5 rounded flex-shrink-0 shadow-sm ${DOT[activeProject?.color] || 'bg-tertiary'}`} />
                <h1 className="font-headline-md text-headline-md text-on-surface tracking-tight">
                  {activeProject?.name || 'Project'}
                </h1>
              </div>
              <button
                className={`p-1 rounded transition-colors ${activeProject?.starred ? 'text-secondary' : 'text-on-surface-variant hover:text-secondary'}`}
                title="Star project"
                type="button"
                onClick={() => activeProject && dispatch(toggleStarProject(activeProject.id))}
              >
                <Icon name={activeProject?.starred ? 'star' : 'star'} className="text-[18px]" />
              </button>
              {activeProject?.code && (
                <span className="font-code-tabular text-[11px] px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant">
                  {activeProject.code}
                </span>
              )}
              <div className="hidden sm:flex items-center -space-x-1.5 ml-2">
                {projectMembers.slice(0, 2).map((m) => (
                  <Avatar key={m.id} user={m} size="w-6 h-6 text-[10px]" />
                ))}
                {projectMembers.length > 2 && (
                  <div className="w-6 h-6 rounded-full bg-surface-container-highest text-on-surface-variant flex items-center justify-center font-code-tabular text-[10px]">
                    +{projectMembers.length - 2}
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-space-sm">
              <div className="flex items-center bg-surface-container-lowest p-0.5 rounded-xl shadow-inner">
                {VIEWS.map((v) => (
                  <button
                    key={v.id}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-lg font-label-md text-label-md ${
                      view === v.id
                        ? 'bg-surface-container-high text-on-surface shadow-sm'
                        : 'text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition-colors'
                    }`}
                    type="button"
                    onClick={() => handleViewChange(v.id)}
                  >
                    <Icon name={v.icon} className={`text-[16px] ${view === v.id ? 'text-primary' : ''}`} />
                    <span>{v.label}</span>
                  </button>
                ))}
              </div>
              <button
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface font-label-md text-label-md transition-colors shadow-sm"
                type="button"
              >
                <Icon name="ios_share" className="text-[16px] text-outline" />
                <span className="hidden sm:inline">Share</span>
              </button>
              {canEdit ? (
                <button
                  className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-primary-container hover:bg-primary-container/80 text-on-primary-container font-label-md text-label-md shadow-sm transition-all active:scale-[0.98]"
                  type="button"
                  onClick={() => openNewTask('todo')}
                >
                  <Icon name="add" className="text-[18px]" />
                  <span>New Task</span>
                </button>
              ) : (
                <span className="font-label-sm text-label-sm text-outline italic">Viewer — read only</span>
              )}
            </div>
          </div>

          {view === 'board' && (
          <div className="flex flex-col gap-space-xs bg-surface-container-lowest/70 p-space-sm rounded-xl">
            <div className="flex flex-wrap items-center justify-between gap-space-sm">
              <div className="flex flex-wrap items-center gap-space-xs">
                <div className="relative flex items-center min-w-[200px]">
                  <Icon name="search" className="text-[16px] absolute left-2.5 text-outline" />
                  <input
                    className="w-full bg-surface-container-low text-on-surface placeholder:text-outline text-body-sm font-body-sm pl-8 pr-2.5 py-1 rounded-lg focus:outline-none focus:bg-surface-container"
                    placeholder="Filter tasks..."
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                  />
                </div>
                <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-surface-container-low text-on-surface font-label-sm text-label-sm">
                  <span className="text-outline">Group:</span>
                  <select
                    value={groupBy}
                    onChange={(e) => setGroupBy(e.target.value)}
                    className="bg-transparent font-medium text-on-surface focus:outline-none"
                  >
                    <option value="status">Status</option>
                    <option value="assignee">Assignee</option>
                    <option value="priority">Priority</option>
                  </select>
                </div>
                <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-surface-container-low text-on-surface font-label-sm text-label-sm">
                  <span className="text-outline">Sort:</span>
                  <select
                    value={sortKey}
                    onChange={(e) => setSortKey(e.target.value)}
                    className="bg-transparent font-medium text-on-surface focus:outline-none"
                  >
                    <option value="dueDate">Due Date</option>
                    <option value="priority">Priority</option>
                    <option value="title">Title</option>
                  </select>
                  <Icon name="sort" className="text-[14px] text-outline" />
                </div>
                <div className="h-4 w-[1px] bg-surface-container-highest mx-1" />
                <div className="flex items-center gap-1">
                  <span className="font-code-tabular text-[10px] text-outline uppercase tracking-wider mr-1">Views:</span>
                  {[
                    { id: 'mine', label: 'My Tasks' },
                    { id: 'urgent', label: 'Urgent Bugfix' },
                    { id: 'sprint', label: 'Q3 Sprint' },
                    ...customViews
                  ].map((sv) => (
                    <button
                      key={sv.id}
                      className={`px-2 py-0.5 rounded-full font-code-tabular text-[11px] transition-colors ${
                        savedView === sv.id
                          ? 'bg-surface-container-high hover:bg-surface-container-highest text-primary'
                          : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant'
                      }`}
                      type="button"
                      onClick={() => {
                        if (savedView === sv.id) {
                          setSavedView('all');
                        } else {
                          setSavedView(sv.id);
                          if (sv.filters) {
                            setFilterAssignee(sv.filters.filterAssignee);
                            setFilterPriority(sv.filters.filterPriority);
                            setFilterStatus(sv.filters.filterStatus);
                            setQuery(sv.filters.query);
                          }
                        }
                      }}
                    >
                      {sv.label}
                    </button>
                  ))}
                </div>
              </div>
              <button
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-primary hover:bg-surface-container font-label-sm text-label-sm transition-colors"
                type="button"
                onClick={() => {
                  const name = window.prompt('Enter name for this view:');
                  if (name) {
                    setCustomViews([...customViews, {
                      id: 'custom-' + Date.now(),
                      label: name,
                      filters: { filterAssignee, filterPriority, filterStatus, query }
                    }]);
                  }
                }}
              >
                <Icon name="bookmark_add" className="text-[14px]" />
                <span>Save filter view</span>
              </button>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 pt-1">
              <span className="font-code-tabular text-[10px] uppercase text-outline mr-0.5">Active Filters:</span>
              {filterAssignee && (
                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-surface-container-high text-on-surface font-code-tabular text-[11px]">
                  <span className="text-outline">Assignee:</span>
                  <span>{members.find((m) => m.id === filterAssignee)?.name}</span>
                  <button className="hover:text-error ml-0.5 flex items-center" type="button" onClick={() => setFilterAssignee(null)}>
                    <Icon name="close" className="text-[13px]" />
                  </button>
                </div>
              )}
              {filterPriority && (
                <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-surface-container-high text-on-surface font-code-tabular text-[11px]">
                  <span className="text-outline">Priority:</span>
                  <span className="text-error font-medium capitalize">{filterPriority}</span>
                  <button className="hover:text-error ml-0.5 flex items-center" type="button" onClick={() => setFilterPriority(null)}>
                    <Icon name="close" className="text-[13px]" />
                  </button>
                </div>
              )}
              <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-surface-container-high text-on-surface font-code-tabular text-[11px]">
                <span className="text-outline">Status:</span>
                <span className="capitalize">{filterStatus}</span>
                {filterStatus !== 'all' && (
                  <button className="hover:text-error ml-0.5 flex items-center" type="button" onClick={() => setFilterStatus('all')}>
                    <Icon name="close" className="text-[13px]" />
                  </button>
                )}
              </div>
              <div className="relative">
                <button
                  className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-surface-container hover:bg-surface-container-high text-on-surface-variant text-label-sm font-label-sm transition-colors"
                  type="button"
                  onClick={() => setAddFilterOpen((v) => !v)}
                >
                  <Icon name="add" className="text-[13px]" />
                  <span>Add filter</span>
                </button>
                {addFilterOpen && (
                  <div className="absolute left-0 mt-1 w-48 bg-surface-container-high rounded-lg shadow-xl p-1 z-20">
                    {members.map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        className="w-full text-left px-2 py-1 rounded font-body-sm text-body-sm hover:bg-surface-container"
                        onClick={() => {
                          setFilterAssignee(m.id);
                          setAddFilterOpen(false);
                        }}
                      >
                        Assignee: {m.name}
                      </button>
                    ))}
                    {['high', 'medium', 'low'].map((p) => (
                      <button
                        key={p}
                        type="button"
                        className="w-full text-left px-2 py-1 rounded font-body-sm text-body-sm hover:bg-surface-container capitalize"
                        onClick={() => {
                          setFilterPriority(p);
                          setAddFilterOpen(false);
                        }}
                      >
                        Priority: {p}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          )}
        </div>
        )}

        {view === 'board' && (
        <div className="px-space-lg py-space-xs">
          <div className="w-full bg-surface-container-low rounded-xl p-space-sm flex flex-wrap items-center justify-between gap-space-md shadow-sm">
            <div className="flex items-center gap-space-lg">
              <div className="flex items-center gap-space-sm">
                <div className="relative w-10 h-10 flex items-center justify-center">
                  <svg className="w-10 h-10 -rotate-90" viewBox="0 0 36 36">
                    <path className="text-surface-container-highest" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="currentColor" strokeWidth="3.5" />
                    <path
                      className="text-tertiary"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="currentColor"
                      strokeDasharray={`${completion}, 100`}
                      strokeLinecap="round"
                      strokeWidth="3.5"
                    />
                  </svg>
                  <span className="absolute font-code-tabular text-[10px] font-bold text-tertiary">{completion}%</span>
                </div>
                <div className="flex flex-col">
                  <span className="font-label-sm text-label-sm text-on-surface">Sprint Completion</span>
                  <span className="font-code-tabular text-[11px] text-outline">
                    {doneCount} of {totalCount} tasks closed
                  </span>
                </div>
              </div>
              <div className="hidden lg:flex items-center gap-space-sm pl-space-md">
                <div className="flex items-end gap-1 h-6">
                  <div className="w-1.5 h-3 rounded-t bg-secondary/50" />
                  <div className="w-1.5 h-4 rounded-t bg-secondary/70" />
                  <div className="w-1.5 h-2 rounded-t bg-secondary/40" />
                  <div className="w-1.5 h-6 rounded-t bg-secondary" />
                  <div className="w-1.5 h-5 rounded-t bg-secondary" />
                </div>
                <div className="flex flex-col">
                  <span className="font-label-sm text-label-sm text-on-surface">Velocity Index</span>
                  <span className="font-code-tabular text-[11px] text-secondary">38 pts / week (+12%)</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-space-md">
              <div className="flex items-center gap-space-xs">
                <div className="w-16 h-8 rounded bg-surface-container-highest flex items-center justify-center">
                  <Icon name="layers" className="text-[16px] text-outline" />
                </div>
                <div className="flex flex-col">
                  <span className="font-code-tabular text-[10px] text-outline uppercase tracking-wider">Figma Artifact</span>
                  <span className="font-body-sm text-body-sm text-on-surface font-medium">v2.4 Final Screens</span>
                </div>
              </div>
              <div className="flex items-center gap-1.5 bg-surface-container px-2 py-1 rounded-lg">
                <Icon name="timer" className="text-[15px] text-outline" />
                <span className="font-code-tabular text-[11px] text-on-surface">4 days remaining</span>
              </div>
            </div>
          </div>
        </div>
        )}

        {view === 'board' && (
          <KanbanBoard
            tasks={tasks}
            members={members}
            canEdit={canEdit}
            onEdit={openEditTask}
            onNewTask={openNewTask}
            sortKey={sortKey}
          />
        )}

        {view === 'list' && (
          <ListView
            tasks={tasks}
            members={members}
            canEdit={canEdit}
            onEdit={openEditTask}
            onNewTask={openNewTask}
            groupBy={groupBy}
            onGroupByChange={setGroupBy}
            sortKey={sortKey}
            onSortKeyChange={setSortKey}
            filterAssignee={filterAssignee}
            filterPriority={filterPriority}
            onClearAssignee={() => setFilterAssignee(null)}
            onClearPriority={() => setFilterPriority(null)}
            onResetFilters={() => {
              setFilterAssignee(null);
              setFilterPriority(null);
              setFilterStatus('all');
              setSavedView('all');
              setQuery('');
              setGroupBy('status');
              setSortKey('priority');
            }}
          />
        )}

        {view === 'calendar' && (
          <CalendarView
            tasks={tasks}
            members={members}
            canEdit={canEdit}
            onEdit={openEditTask}
            projectId={activeProject?.id}
            filterAssignee={filterAssignee}
            filterPriority={filterPriority}
            onFilterAssignee={setFilterAssignee}
            onFilterPriority={setFilterPriority}
          />
        )}
      </div>

      {jumpOpen && (
        <div className="fixed inset-0 z-[80] bg-black/50 flex items-start justify-center pt-24 px-4" onClick={() => setJumpOpen(false)}>
          <div className="w-full max-w-lg bg-surface-container-high rounded-xl shadow-2xl p-space-sm" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-space-sm px-space-sm py-2">
              <Icon name="search" className="text-[18px] text-outline" />
              <input
                autoFocus
                value={headerSearch}
                onChange={(e) => setHeaderSearch(e.target.value)}
                placeholder="Search or jump to..."
                className="flex-1 bg-transparent text-on-surface font-body-md text-body-md focus:outline-none"
              />
              <button type="button" className="font-code-tabular text-[10px] text-outline" onClick={() => setJumpOpen(false)}>
                Esc
              </button>
            </div>
            <div className="max-h-64 overflow-y-auto mt-1">
              {allTasks
                .filter((t) => {
                  const q = headerSearch.toLowerCase();
                  return t.title.toLowerCase().includes(q) ||
                    (t.description || '').toLowerCase().includes(q) ||
                    (t.commentList || []).some(c => (c.text || '').toLowerCase().includes(q));
                })
                .slice(0, 8)
                .map((t) => (
                  <button
                    key={t.id}
                    type="button"
                    className="w-full text-left px-space-sm py-1.5 rounded-lg hover:bg-surface-container font-body-sm text-body-sm text-on-surface"
                    onClick={() => {
                      openEditTask(t);
                      setJumpOpen(false);
                    }}
                  >
                    {t.title}
                  </button>
                ))}
            </div>
          </div>
        </div>
      )}

      {modalOpen && (
        <TaskModal
          task={editingTask}
          projectId={activeProject?.id}
          defaultStatus={defaultStatus}
          onClose={() => setModalOpen(false)}
        />
      )}
    </AppShell>
  );
}
