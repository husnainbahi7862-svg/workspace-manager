import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useDispatch, useSelector } from 'react-redux';
import { logout, switchUser } from '../redux/features/authSlice';
import {
  addWorkspace,
  setActiveWorkspace,
  addProject,
  setActiveProject,
} from '../redux/features/workspaceSlice';
import { seedTemplateTasks, undo } from '../redux/features/tasksSlice';
import { nanoid } from '@reduxjs/toolkit';
import Logo from './Logo';
import Icon from './Icon';
import ThemeToggle from './ThemeToggle';

const NameSchema = Yup.object().shape({
  name: Yup.string().min(2, 'Too short').required('Required'),
});

const DOT = {
  tertiary: 'bg-tertiary',
  secondary: 'bg-secondary',
  'primary-container': 'bg-primary-container',
  outline: 'bg-outline',
  primary: 'bg-primary',
};

function Avatar({ user, size = 'w-8 h-8 text-[10px]' }) {
  if (!user) return null;
  const tones = {
    u1: 'bg-primary text-on-primary',
    u2: 'bg-secondary-container text-on-secondary-container',
    u3: 'bg-surface-container-highest text-on-surface-variant',
  };
  if (user.avatarUrl) {
    return (
      <div className={`${size} rounded-full overflow-hidden shadow-sm flex items-center justify-center`} title={user.name}>
        <img src={user.avatarUrl} alt={user.name} className="w-full h-full object-cover" />
      </div>
    );
  }

  return (
    <div
      className={`${size} rounded-full flex items-center justify-center font-code-tabular font-bold shadow-sm ${tones[user.id] || tones.u3}`}
      title={user.name}
    >
      {user.initials || user.name.slice(0, 2).toUpperCase()}
    </div>
  );
}

function MiniModal({ title, onClose, children }) {
  return (
    <div className="fixed inset-0 z-[80] bg-black/50 flex items-center justify-center p-4" onClick={onClose}>
      <div
        className="bg-surface-container-high rounded-xl shadow-2xl w-full max-w-sm p-space-lg"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="font-headline-sm text-headline-sm text-on-surface mb-space-md">{title}</h2>
        {children}
      </div>
    </div>
  );
}

export default function AppShell({
  view,
  onViewChange,
  searchQuery,
  onSearchChange,
  onCommandPalette,
  children,
}) {
  const router = useRouter();
  const dispatch = useDispatch();
  const currentUser = useSelector((s) => s.auth.currentUser);
  const members = useSelector((s) => s.auth.mockUsers);
  const workspaces = useSelector((s) => s.workspace.workspaces);
  const activeWorkspaceId = useSelector((s) => s.workspace.activeWorkspaceId);
  const activeProjectId = useSelector((s) => s.workspace.activeProjectId);
  const allTasks = useSelector((s) => s.tasks.items);

  const workspace = workspaces.find((w) => w.id === activeWorkspaceId) || workspaces[0];
  const activeProject = workspace?.projects.find((p) => p.id === activeProjectId) || workspace?.projects[0];

  const [wsOpen, setWsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [createWs, setCreateWs] = useState(false);
  const [createProject, setCreateProject] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [queued, setQueued] = useState(2);
  const [notifOpen, setNotifOpen] = useState(false);
  const [mockNotifs, setMockNotifs] = useState([
    { id: 'n1', text: 'Sprint 14 review is due.' },
    { id: 'n2', text: 'Sara Khan moved a task to In Review.' }
  ]);
  const wsRef = useRef(null);
  const profileRef = useRef(null);

  // Live Collaboration Mock
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.7) {
        setMockNotifs(prev => {
          const newNotif = { id: nanoid(), text: `Bilal Ahmed commented on a task.` };
          return [newNotif, ...prev].slice(0, 5); // Keep last 5
        });
      }
    }, 15000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const onDoc = (e) => {
      if (wsRef.current && !wsRef.current.contains(e.target)) setWsOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, []);

  const taskCount = allTasks.length;
  const roleLabel = currentUser?.role ? currentUser.role.charAt(0).toUpperCase() + currentUser.role.slice(1) : '';

  const navActive = (id) =>
    view === id
      ? 'flex items-center gap-space-sm px-space-sm py-1.5 transition-colors bg-surface-container-high text-on-surface font-bold rounded-lg'
      : 'flex items-center gap-space-sm px-space-sm py-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors font-body-md text-body-md';

  return (
    <div className="min-h-screen bg-surface text-on-surface">
      <aside className="fixed left-0 top-0 h-full w-72 bg-surface-container-lowest z-50 flex flex-col justify-between shadow-[0_1px_8px_rgba(0,0,0,0.04)]">
        <div className="flex flex-col h-full overflow-hidden">
          <div className="h-16 px-space-md flex items-center justify-between bg-surface-container-lowest/80 backdrop-blur-xl">
            <div className="flex items-center gap-space-sm w-full">
              <Logo className="h-8 w-8 shrink-0" />
              <div className="flex-1 min-w-0" ref={wsRef}>
                <button
                  className="w-full flex items-center justify-between px-space-sm py-space-xs rounded-xl bg-surface-container hover:bg-surface-container-high transition-colors text-left group"
                  type="button"
                  onClick={() => setWsOpen((v) => !v)}
                >
                  <div className="flex items-center gap-space-xs truncate">
                    <Icon name={workspace?.icon || 'work'} className={`text-[16px] ${workspace?.color ? `text-${workspace.color}` : 'text-primary'} shrink-0`} />
                    <span className="font-label-md text-label-md text-on-surface truncate">{workspace?.name}</span>
                  </div>
                  <Icon name="unfold_more" className="text-[16px] text-on-surface-variant group-hover:text-on-surface shrink-0" />
                </button>
                {wsOpen && (
                  <div className="absolute left-space-md right-space-md mt-1 z-50 bg-surface-container-high rounded-xl shadow-xl p-1">
                    {workspaces.map((w) => (
                      <button
                        key={w.id}
                        type="button"
                        className={`w-full text-left px-space-sm py-1.5 rounded-lg font-body-md text-body-md ${
                          w.id === workspace?.id
                            ? 'bg-surface-container text-on-surface'
                            : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                        }`}
                        onClick={() => {
                          dispatch(setActiveWorkspace(w.id));
                          setWsOpen(false);
                        }}
                      >
                        <div className="flex items-center gap-2">
                          <Icon name={w.icon || 'work'} className={`text-[14px] ${w.color ? `text-${w.color}` : 'text-primary'}`} />
                          <span>{w.name}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="px-space-md py-space-xs">
            <button
              className="w-full flex items-center justify-center gap-space-xs py-1.5 px-space-sm rounded-lg bg-surface-container-low hover:bg-surface-container text-on-surface-variant hover:text-on-surface transition-colors font-label-sm text-label-sm"
              type="button"
              onClick={() => setCreateWs(true)}
            >
              <Icon name="add" className="text-[15px]" />
              <span>Create workspace</span>
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-space-sm py-space-sm space-y-space-md">
            <div className="space-y-space-2xs">
              <div className="px-space-sm py-space-2xs text-[10px] uppercase font-code-tabular tracking-wider text-outline">Core</div>
              <nav className="space-y-space-2xs">
                <button type="button" onClick={() => { onViewChange?.('list'); router.push('/?view=list'); }} className="w-full flex items-center justify-between px-space-sm py-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors font-body-md text-body-md">
                  <div className="flex items-center gap-space-sm">
                    <Icon name="check_circle" className="text-[18px]" />
                    <span>All Tasks</span>
                  </div>
                  <span className="font-code-tabular text-[11px] px-1.5 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant">
                    {taskCount}
                  </span>
                </button>
                <button type="button" onClick={() => router.push('/activity')} className="w-full flex items-center justify-between px-space-sm py-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors font-body-md text-body-md">
                  <div className="flex items-center gap-space-sm">
                    <Icon name="history" className="text-[18px]" />
                    <span>Activity Log</span>
                  </div>
                </button>
                <button type="button" onClick={() => router.push('/members')} className="w-full flex items-center justify-between px-space-sm py-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors font-body-md text-body-md">
                  <div className="flex items-center gap-space-sm">
                    <Icon name="group" className="text-[18px]" />
                    <span>Members &amp; Roles</span>
                  </div>
                </button>
              </nav>
            </div>

            <div className="space-y-space-2xs">
              <div className="flex items-center justify-between px-space-sm py-space-2xs">
                <span className="text-[10px] uppercase font-code-tabular tracking-wider text-outline">Views</span>
              </div>
              <nav className="space-y-space-2xs">
                <button type="button" className={`w-full ${navActive('board')}`} onClick={() => { onViewChange?.('board'); router.push('/'); }}>
                  <Icon name="view_kanban" className="text-[18px]" />
                  <span>Board</span>
                </button>
                <button type="button" className={`w-full ${navActive('list')}`} onClick={() => { onViewChange?.('list'); router.push('/?view=list'); }}>
                  <Icon name="format_list_bulleted" className="text-[18px]" />
                  <span>List</span>
                </button>
                <button type="button" className={`w-full ${navActive('calendar')}`} onClick={() => { onViewChange?.('calendar'); router.push('/?view=calendar'); }}>
                  <Icon name="calendar_today" className="text-[18px]" />
                  <span>Calendar</span>
                </button>
              </nav>
            </div>

            <div className="space-y-space-2xs">
              <div className="flex items-center justify-between px-space-sm py-space-2xs">
                <span className="text-[10px] uppercase font-code-tabular tracking-wider text-outline">Projects</span>
                <button
                  className="text-on-surface-variant hover:text-on-surface flex items-center"
                  type="button"
                  onClick={() => setCreateProject(true)}
                >
                  <Icon name="add" className="text-[15px]" />
                </button>
              </div>
              <nav className="space-y-space-2xs">
                {(workspace?.projects || []).filter(p => !p.archived).map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => dispatch(setActiveProject(p.id))}
                    className={`w-full flex items-center justify-between px-space-sm py-1.5 rounded-lg transition-colors font-body-md text-body-md ${
                      p.id === activeProject?.id
                        ? 'bg-surface-container-high text-on-surface font-bold'
                        : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                    }`}
                  >
                    <div className="flex items-center gap-space-sm truncate">
                      <span className={`w-2 h-2 rounded shrink-0 ${DOT[p.color] || 'bg-outline'}`} />
                      <span className="truncate">{p.name}</span>
                    </div>
                  </button>
                ))}
                
                {(workspace?.projects || []).filter(p => p.archived).length > 0 && (
                  <button
                    type="button"
                    className="text-[10px] text-outline hover:text-on-surface-variant font-code-tabular tracking-wider w-full text-left px-space-sm pt-2"
                    onClick={() => setShowArchived(!showArchived)}
                  >
                    {showArchived ? 'HIDE ARCHIVED' : `SHOW ARCHIVED (${(workspace?.projects || []).filter(p => p.archived).length})`}
                  </button>
                )}

                {showArchived && (workspace?.projects || []).filter(p => p.archived).map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => dispatch(setActiveProject(p.id))}
                    className={`w-full flex items-center justify-between px-space-sm py-1.5 rounded-lg transition-colors font-body-md text-body-md opacity-60 ${
                      p.id === activeProject?.id
                        ? 'bg-surface-container-high text-on-surface font-bold'
                        : 'text-on-surface-variant hover:bg-surface-container hover:text-on-surface'
                    }`}
                  >
                    <div className="flex items-center gap-space-sm truncate">
                      <span className={`w-2 h-2 rounded shrink-0 ${DOT[p.color] || 'bg-outline'}`} />
                      <span className="truncate">{p.name}</span>
                    </div>
                  </button>
                ))}
              </nav>
            </div>

            <div className="space-y-space-2xs">
              <div className="px-space-sm py-space-2xs text-[10px] uppercase font-code-tabular tracking-wider text-outline">System</div>
              <nav className="space-y-space-2xs">
                <button type="button" onClick={() => router.push('/settings')} className="w-full flex items-center gap-space-sm px-space-sm py-1.5 rounded-lg text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors font-body-md text-body-md">
                  <Icon name="settings" className="text-[18px]" />
                  <span>Workspace Settings</span>
                </button>
              </nav>
            </div>
          </div>
        </div>

        <div className="p-space-md bg-surface-container-lowest/90 space-y-space-sm">
          <div className="flex items-center justify-between px-space-sm py-1.5 rounded-lg bg-surface-container-low">
            <div className="flex items-center gap-space-xs">
              <Icon name="keyboard" className="text-[14px] text-outline" />
              <span className="font-code-tabular text-[11px] text-outline">Shortcuts</span>
            </div>
            <span className="font-code-tabular text-[10px] px-1.5 py-0.5 rounded bg-surface-container-highest text-on-surface-variant">?</span>
          </div>
          <div className="flex items-center justify-between px-space-sm py-1 rounded-lg bg-surface-container-low">
            <div className="flex items-center gap-space-xs">
              <span className="w-1.5 h-1.5 rounded-full bg-primary-container" />
              <span className="font-label-sm text-label-sm text-on-surface-variant">Role Access</span>
            </div>
            <span className="font-code-tabular text-[10px] uppercase tracking-wide px-2 py-0.5 rounded-full bg-primary/15 text-primary">
              {roleLabel}
            </span>
          </div>
        </div>
      </aside>

      <div className="pl-72">
        <header className="fixed top-0 left-72 right-0 h-16 bg-surface/85 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] z-40 flex items-center justify-between px-space-lg">
          <div className="flex items-center gap-space-md min-w-0">
            <div className="flex items-center gap-space-xs font-label-md text-label-md text-on-surface-variant truncate">
              <span className="hover:text-on-surface transition-colors cursor-pointer truncate">{workspace?.name}</span>
              <span className="text-outline-variant">/</span>
              <span className="hover:text-on-surface transition-colors cursor-pointer">Projects</span>
              <span className="text-outline-variant">/</span>
              <span className="text-on-surface font-semibold truncate">{activeProject?.description || activeProject?.name}</span>
            </div>
            <div className="hidden xl:flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-surface-container-low text-tertiary font-label-sm text-label-sm shrink-0">
              <Icon name="check_circle" className="text-[14px] animate-pulse" />
              <span>Saved</span>
            </div>
            {queued > 0 && (
              <div className="hidden 2xl:flex items-center gap-space-xs px-2.5 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant font-label-sm text-label-sm shrink-0">
                <span className="w-2 h-2 rounded-full bg-error shrink-0" />
                <span>Offline Mode</span>
                <button className="flex items-center gap-1 text-primary hover:underline ml-1" type="button" onClick={() => setQueued(0)}>
                  <Icon name="sync" className="text-[13px] animate-spin" />
                  <span>Sync now</span>
                </button>
              </div>
            )}
          </div>
          <div className="flex items-center gap-space-md">
            <button
              type="button"
              onClick={() => dispatch(undo())}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-surface-container-low hover:bg-surface-container text-on-surface-variant hover:text-on-surface transition-colors font-label-sm"
              title="Undo last action"
            >
              <Icon name="undo" className="text-[16px]" />
              <span>Undo</span>
            </button>
            <button
              type="button"
              onClick={onCommandPalette}
              className="flex items-center gap-space-sm w-48 lg:w-72 px-space-sm py-1.5 rounded-xl bg-surface-container-low hover:bg-surface-container transition-colors cursor-pointer text-outline"
            >
              <Icon name="search" className="text-[18px]" />
              <span className="font-body-md text-body-md text-on-surface-variant flex-1 text-left">Search or jump to...</span>
              <span className="font-code-tabular text-[10px] px-1.5 py-0.5 rounded bg-surface-container-highest text-on-surface-variant">⌘K</span>
            </button>
            <div className="flex items-center gap-space-xs">
              <div className="relative">
                <button
                  aria-label="Notifications"
                  className="relative p-2 rounded-xl text-on-surface-variant hover:bg-surface-container hover:text-on-surface transition-colors"
                  type="button"
                  onClick={() => setNotifOpen((v) => !v)}
                >
                  <Icon name="notifications" className="text-[20px]" />
                  <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary-container text-on-primary-container font-code-tabular text-[9px] font-bold">
                    {mockNotifs.length}
                  </span>
                </button>
                {notifOpen && (
                  <div className="absolute right-0 mt-2 w-72 bg-surface-container-high rounded-xl shadow-2xl p-space-sm z-50">
                    <div className="flex items-center justify-between mb-space-xs">
                      <p className="font-label-md text-label-md text-on-surface">Notifications</p>
                      <button className="text-[10px] text-primary hover:underline" onClick={() => setMockNotifs([])}>Clear</button>
                    </div>
                    {mockNotifs.length === 0 ? (
                      <p className="font-body-sm text-body-sm text-outline">No new notifications.</p>
                    ) : (
                      <ul className="space-y-space-xs max-h-64 overflow-y-auto">
                        {mockNotifs.map(n => (
                          <li key={n.id} className="font-body-sm text-body-sm text-on-surface-variant bg-surface-container-low p-2 rounded-lg">
                            {n.text}
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                )}
              </div>
              <ThemeToggle />
            </div>
            <div className="flex items-center gap-space-sm pl-space-sm">
              <div className="relative" ref={profileRef}>
                <button
                  type="button"
                  onClick={() => setProfileOpen((v) => !v)}
                  className="flex items-center gap-space-sm bg-surface-container-low hover:bg-surface-container px-space-sm py-1 rounded-xl transition-colors"
                >
                  <Avatar user={currentUser} />
                  <div className="hidden md:flex flex-col text-left">
                    <div className="flex items-center gap-1.5">
                      <span className="font-label-md text-label-md text-on-surface">{currentUser?.name}</span>
                      <span className="font-code-tabular text-[9px] px-1.5 rounded-full bg-primary/15 text-primary uppercase">
                        {currentUser?.role}
                      </span>
                    </div>
                    <span className="font-label-sm text-label-sm text-outline">{currentUser?.email}</span>
                  </div>
                  <Icon name="arrow_drop_down" className="text-[16px] text-on-surface-variant" />
                </button>
                {profileOpen && (
                  <div className="absolute right-0 mt-1 w-56 bg-surface-container-high rounded-xl shadow-xl p-1 z-50">
                    {members.map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        className="w-full flex items-center gap-2 px-space-sm py-1.5 rounded-lg hover:bg-surface-container text-left"
                        onClick={() => {
                          dispatch(switchUser(m.id));
                          setProfileOpen(false);
                        }}
                      >
                        <Avatar user={m} size="w-6 h-6 text-[9px]" />
                        <span className="font-body-sm text-body-sm text-on-surface">{m.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <button
                aria-label="Log out"
                className="p-2 rounded-xl text-on-surface-variant hover:bg-surface-container hover:text-error transition-colors"
                type="button"
                onClick={() => dispatch(logout())}
              >
                <Icon name="logout" className="text-[20px]" />
              </button>
            </div>
          </div>
        </header>

        <main className="w-full pt-16 bg-surface min-h-screen">
          {queued > 0 && (
            <div className="w-full bg-surface-container-low px-space-lg py-1.5 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-space-sm min-w-0">
                <span className="flex h-2 w-2 rounded-full bg-tertiary animate-pulse" />
                <span className="font-code-tabular text-code-tabular text-on-surface-variant flex items-center gap-1.5">
                  <Icon name="cloud_sync" className="text-[14px] text-secondary" />
                  <span>
                    Simulated Offline Mode — <strong className="text-on-surface font-medium">{queued} changes queued</strong>
                  </span>
                </span>
              </div>
              <button
                className="flex items-center gap-1.5 px-2.5 py-0.5 rounded bg-surface-container-high hover:bg-surface-container-highest text-primary font-label-sm text-label-sm transition-colors"
                type="button"
                onClick={() => setQueued(0)}
              >
                <Icon name="sync" className="text-[14px] animate-spin text-primary" />
                <span>Sync now</span>
              </button>
            </div>
          )}
          {children}
        </main>
      </div>

      {createWs && (
        <MiniModal title="Create workspace" onClose={() => setCreateWs(false)}>
          <Formik
            initialValues={{ name: '' }}
            validationSchema={NameSchema}
            onSubmit={(values) => {
              dispatch(addWorkspace(values));
              setCreateWs(false);
            }}
          >
            <Form className="space-y-space-sm">
              <Field
                name="name"
                placeholder="Workspace name"
                className="w-full bg-surface-container-low text-on-surface rounded-lg px-space-sm py-2 font-body-md text-body-md focus:outline-none"
              />
              <ErrorMessage name="name" component="p" className="text-error text-label-sm" />
              <div className="flex justify-end gap-space-xs">
                <button type="button" onClick={() => setCreateWs(false)} className="px-3 py-1.5 rounded-xl font-label-md text-label-md text-on-surface-variant">
                  Cancel
                </button>
                <button type="submit" className="px-3 py-1.5 rounded-xl bg-primary-container text-on-primary-container font-label-md text-label-md">
                  Create
                </button>
              </div>
            </Form>
          </Formik>
        </MiniModal>
      )}

      {createProject && (
        <MiniModal title="New project" onClose={() => setCreateProject(false)}>
          <Formik
            initialValues={{ name: '', template: 'none' }}
            validationSchema={NameSchema}
            onSubmit={(values) => {
              const projectId = nanoid();
              dispatch(addProject({ id: projectId, name: values.name }));
              if (values.template !== 'none') {
                dispatch(seedTemplateTasks({ projectId, template: values.template }));
              }
              setCreateProject(false);
            }}
          >
            <Form className="space-y-space-sm">
              <div>
                <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1">Project Name</label>
                <Field
                  name="name"
                  placeholder="e.g. Q3 Launch"
                  className="w-full bg-surface-container-low text-on-surface rounded-lg px-space-sm py-2 font-body-md text-body-md focus:outline-none"
                />
                <ErrorMessage name="name" component="p" className="text-error text-label-sm mt-1" />
              </div>
              <div>
                <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1">Template</label>
                <Field
                  as="select"
                  name="template"
                  className="w-full bg-surface-container-low text-on-surface rounded-lg px-space-sm py-2 font-body-md text-body-md focus:outline-none appearance-none"
                >
                  <option value="none">Blank Project</option>
                  <option value="software">Software Engineering</option>
                  <option value="marketing">Marketing Campaign</option>
                </Field>
              </div>
              <div className="flex justify-end gap-space-xs mt-space-md">
                <button type="button" onClick={() => setCreateProject(false)} className="px-3 py-1.5 rounded-xl font-label-md text-label-md text-on-surface-variant">
                  Cancel
                </button>
                <button type="submit" className="px-3 py-1.5 rounded-xl bg-primary-container text-on-primary-container font-label-md text-label-md">
                  Create
                </button>
              </div>
            </Form>
          </Formik>
        </MiniModal>
      )}
    </div>
  );
}

export { Avatar, DOT };
