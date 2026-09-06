import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { addWorkspace, updateWorkspaceMeta, updateWorkspaceCode, setActiveWorkspace, deleteWorkspace, deleteProject, toggleArchiveProject, updateProjectMembers } from '../redux/features/workspaceSlice';
import { importTasks } from '../redux/features/tasksSlice';
import { logout, updateProfile } from '../redux/features/authSlice';
import AppShell from '../components/AppShell';
import ThemeToggle from '../components/ThemeToggle';
import Icon from '../components/Icon';
import { Avatar } from '../components/AppShell';

const WorkspaceSchema = Yup.object().shape({
  name: Yup.string().min(2, 'Too short').max(48, 'Too long').required('Required'),
  color: Yup.string(),
  icon: Yup.string(),
});

const ProfileSchema = Yup.object().shape({
  name: Yup.string().min(2, 'Too short').required('Required'),
  email: Yup.string().email('Invalid email').required('Required'),
});

const ProjectSchema = Yup.object().shape({
  name: Yup.string().min(2, 'Too short').max(48, 'Too long').required('Required'),
  code: Yup.string().max(16, 'Too long'),
  description: Yup.string().max(80, 'Too long'),
});

const PREFS_KEY = 'wm_user_prefs';

const defaultPrefs = {
  notifyMentions: true,
  notifyMoves: true,
  notifyDue: false,
  compactLists: false,
};

export default function SettingsPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const currentUser = useSelector((s) => s.auth.currentUser);
  const allTasks = useSelector((s) => s.tasks.items);
  const allUsers = useSelector((s) => s.auth.mockUsers);
  const workspaces = useSelector((s) => s.workspace.workspaces);
  const activeWorkspaceId = useSelector((s) => s.workspace.activeWorkspaceId);
  const activeProjectId = useSelector((s) => s.workspace.activeProjectId);
  const workspace = workspaces.find((w) => w.id === activeWorkspaceId);
  const project = workspace?.projects.find((p) => p.id === activeProjectId) || workspace?.projects[0];
  const canEdit = currentUser?.role === 'owner' || currentUser?.role === 'admin';
  const isOwner = currentUser?.role === 'owner';
  const [prefs, setPrefs] = useState(defaultPrefs);
  const [cleared, setCleared] = useState(false);

  useEffect(() => {
    if (!currentUser) router.replace('/login');
  }, [currentUser, router]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(PREFS_KEY);
      if (raw) setPrefs({ ...defaultPrefs, ...JSON.parse(raw) });
    } catch {
      /* ignore */
    }
  }, []);

  const savePrefs = (next) => {
    setPrefs(next);
    localStorage.setItem(PREFS_KEY, JSON.stringify(next));
  };

  if (!currentUser) return null;

  return (
    <AppShell view="" onViewChange={(v) => router.push(v === 'board' ? '/' : `/?view=${v}`)} onCommandPalette={() => router.push('/')}>
      <div className="px-space-xl py-space-lg max-w-3xl space-y-space-lg pb-space-3xl">
        <div>
          <p className="font-code-tabular text-[11px] text-outline uppercase tracking-wider">System</p>
          <h1 className="font-headline-md text-headline-md text-on-surface">Workspace Settings</h1>
          <p className="font-body-md text-body-md text-on-surface-variant mt-space-xs">
            Appearance, identity, and notification prefs — stored locally for this demo.
          </p>
        </div>

        <section className="bg-surface-container-low rounded-xl p-space-md">
          <div className="flex flex-wrap items-center justify-between gap-space-md mb-space-md pb-space-sm border-b border-outline-variant/15">
            <div className="flex items-center gap-space-sm">
              <Avatar user={currentUser} size="w-12 h-12 text-[16px]" />
              <div>
                <p className="font-label-md text-label-md text-on-surface">{currentUser.name}</p>
                <p className="font-body-sm text-body-sm text-outline mb-1">{currentUser.email}</p>
                <label className="text-primary hover:underline cursor-pointer font-label-sm text-[11px] inline-flex items-center gap-1">
                  <Icon name="upload" className="text-[12px]" /> Upload Photo
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (ev) => {
                          dispatch(updateProfile({ name: currentUser.name, email: currentUser.email, avatarUrl: ev.target.result }));
                        };
                        reader.readAsDataURL(file);
                      }
                      e.target.value = null;
                    }}
                  />
                </label>
              </div>
            </div>
            <div className="flex items-center gap-space-sm">
              <span className="font-code-tabular text-[10px] uppercase px-2 py-0.5 rounded-full bg-primary/15 text-primary">
                {currentUser.role}
              </span>
              <button
                type="button"
                onClick={() => {
                  dispatch(logout());
                  router.push('/login');
                }}
                className="px-3 py-1.5 rounded-xl bg-surface-container hover:bg-error-container/40 hover:text-error font-label-sm text-label-sm text-on-surface-variant"
              >
                Sign out
              </button>
            </div>
          </div>
          <Formik
            initialValues={{ name: currentUser.name, email: currentUser.email }}
            validationSchema={ProfileSchema}
            onSubmit={(values) => dispatch(updateProfile(values))}
          >
            <Form className="flex flex-wrap items-end gap-space-xs mt-space-sm">
               <div className="flex-1 min-w-[200px]">
                 <label className="block font-label-sm text-label-sm text-outline">Full Name</label>
                 <Field name="name" className="w-full bg-surface-container-lowest text-on-surface rounded-xl px-space-sm py-1.5 font-body-sm focus:outline-none" />
               </div>
               <div className="flex-1 min-w-[200px]">
                 <label className="block font-label-sm text-label-sm text-outline">Email</label>
                 <Field name="email" type="email" className="w-full bg-surface-container-lowest text-on-surface rounded-xl px-space-sm py-1.5 font-body-sm focus:outline-none" />
               </div>
               <button type="submit" className="px-3 py-1.5 h-fit rounded-xl bg-surface-container-high hover:bg-surface-container-highest transition-colors text-on-surface font-label-sm">
                 Update Profile
               </button>
            </Form>
          </Formik>
        </section>

        <section className="bg-surface-container-low rounded-xl p-space-md">
          <div className="flex items-center justify-between mb-space-sm">
            <div>
              <h2 className="font-headline-sm text-headline-sm text-on-surface">Appearance</h2>
              <p className="font-body-sm text-body-sm text-outline">Dark-first tokens with a light invert</p>
            </div>
            <ThemeToggle />
          </div>
          <label className="flex items-center justify-between py-2 cursor-pointer">
            <span className="font-body-md text-body-md text-on-surface">Compact list rows</span>
            <input
              type="checkbox"
              checked={prefs.compactLists}
              onChange={(e) => savePrefs({ ...prefs, compactLists: e.target.checked })}
              className="accent-primary"
            />
          </label>
        </section>

        <section className="bg-surface-container-low rounded-xl p-space-md space-y-space-md">
          <h2 className="font-headline-sm text-headline-sm text-on-surface">Workspace identity</h2>
          <div className="flex flex-wrap gap-space-xs">
            {workspaces.map((w) => (
              <button
                key={w.id}
                type="button"
                onClick={() => dispatch(setActiveWorkspace(w.id))}
                className={`px-3 py-1 rounded-xl font-label-sm text-label-sm ${
                  w.id === workspace?.id
                    ? 'bg-surface-container-high text-on-surface'
                    : 'bg-surface-container text-on-surface-variant hover:text-on-surface'
                }`}
              >
                {w.name}
              </button>
            ))}
          </div>
          {canEdit && workspace && (
            <Formik
              enableReinitialize
              initialValues={{ name: workspace.name, color: workspace.color || 'primary', icon: workspace.icon || 'work' }}
              validationSchema={WorkspaceSchema}
              onSubmit={(values) => dispatch(updateWorkspaceMeta({ id: workspace.id, ...values }))}
            >
              <Form className="space-y-space-sm mt-space-sm">
                <div className="grid sm:grid-cols-3 gap-space-sm">
                  <div>
                    <label className="block font-label-sm text-label-sm text-outline mb-1">Workspace name</label>
                    <Field name="name" className="w-full bg-surface-container-lowest text-on-surface rounded-xl px-space-sm py-2 font-body-md focus:outline-none" />
                    <ErrorMessage name="name" component="p" className="text-error text-label-sm" />
                  </div>
                  <div>
                    <label className="block font-label-sm text-label-sm text-outline mb-1">Color</label>
                    <Field as="select" name="color" className="w-full bg-surface-container-lowest text-on-surface rounded-xl px-space-sm py-2 font-body-md focus:outline-none">
                      <option value="primary">Primary</option>
                      <option value="secondary">Secondary</option>
                      <option value="tertiary">Tertiary</option>
                      <option value="error">Error</option>
                    </Field>
                  </div>
                  <div>
                    <label className="block font-label-sm text-label-sm text-outline mb-1">Icon</label>
                    <Field as="select" name="icon" className="w-full bg-surface-container-lowest text-on-surface rounded-xl px-space-sm py-2 font-body-md focus:outline-none">
                      <option value="work">Work</option>
                      <option value="home">Home</option>
                      <option value="folder">Folder</option>
                      <option value="star">Star</option>
                    </Field>
                  </div>
                </div>
                <button type="submit" className="px-3 py-2 rounded-xl bg-primary-container text-on-primary-container font-label-sm">
                  Save workspace
                </button>
              </Form>
            </Formik>
          )}
          {canEdit && project && (
            <div className="pt-space-md border-t border-outline-variant/15 mt-space-md">
              <h3 className="font-headline-sm text-headline-sm text-on-surface mb-space-sm">Project Settings</h3>
              <Formik
                enableReinitialize
                initialValues={{ name: project.name || '', code: project.code || '', description: project.description || '' }}
                validationSchema={ProjectSchema}
                onSubmit={(values) => dispatch(updateWorkspaceCode(values))}
              >
                <Form className="grid sm:grid-cols-2 gap-space-sm">
                  <div className="sm:col-span-2">
                    <label className="block font-label-sm text-label-sm text-outline mb-1">Active project name</label>
                    <Field name="name" className="w-full bg-surface-container-lowest text-on-surface rounded-xl px-space-sm py-2 font-body-md focus:outline-none" />
                    <ErrorMessage name="name" component="p" className="text-error text-label-sm" />
                  </div>
                  <div>
                    <label className="block font-label-sm text-label-sm text-outline mb-1">Active project code</label>
                    <Field name="code" className="w-full bg-surface-container-lowest text-on-surface rounded-xl px-space-sm py-2 font-body-md focus:outline-none" />
                  </div>
                  <div>
                    <label className="block font-label-sm text-label-sm text-outline mb-1">Breadcrumb label</label>
                    <Field name="description" className="w-full bg-surface-container-lowest text-on-surface rounded-xl px-space-sm py-2 font-body-md focus:outline-none" />
                  </div>
                  <div className="sm:col-span-2 mt-2">
                    <button type="submit" className="px-3 py-1.5 rounded-xl bg-surface-container-high text-on-surface font-label-sm">
                      Update project meta
                    </button>
                  </div>
                </Form>
              </Formik>
              
              <div className="mt-space-md">
                <label className="block font-label-sm text-label-sm text-outline mb-2">Project Members</label>
                <div className="flex flex-wrap gap-2">
                  {allUsers.filter(u => workspace?.members?.includes(u.id)).map(user => {
                    const isMember = project.members?.includes(user.id);
                    return (
                      <button
                        key={user.id}
                        type="button"
                        onClick={() => {
                          const newMembers = isMember
                            ? project.members.filter(id => id !== user.id)
                            : [...(project.members || []), user.id];
                          dispatch(updateProjectMembers({ projectId: project.id, members: newMembers }));
                        }}
                        className={`px-3 py-1 rounded-full text-label-sm font-label-sm transition-colors ${isMember ? 'bg-primary text-on-primary' : 'bg-surface-container text-on-surface-variant hover:text-on-surface'}`}
                      >
                        {user.name}
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="mt-space-md pt-space-sm border-t border-outline-variant/15 flex items-center justify-between">
                <div>
                  <p className="font-body-md text-body-md text-on-surface">Archive Project</p>
                  <p className="font-body-sm text-body-sm text-outline">Hide from switcher</p>
                </div>
                <button
                  type="button"
                  onClick={() => dispatch(toggleArchiveProject(project.id))}
                  className={`px-3 py-1.5 rounded-xl font-label-sm text-label-sm ${project.archived ? 'bg-tertiary text-on-tertiary' : 'bg-surface-container text-on-surface-variant'}`}
                >
                  {project.archived ? 'Unarchive' : 'Archive'}
                </button>
              </div>
            </div>
          )}
          {!canEdit && (
            <p className="font-label-sm text-label-sm text-outline flex items-center gap-1">
              <Icon name="lock" className="text-[14px]" /> Only owners and admins can rename the workspace.
            </p>
          )}
        </section>

        <section className="bg-surface-container-low rounded-xl p-space-md">
          <h2 className="font-headline-sm text-headline-sm text-on-surface mb-space-sm">Notifications</h2>
          {[
            { key: 'notifyMentions', label: 'Mentions and comments', hint: 'When someone comments on a task' },
            { key: 'notifyMoves', label: 'Status changes', hint: 'When a task moves column' },
            { key: 'notifyDue', label: 'Due date reminders', hint: 'Local reminder flag only' },
          ].map((row) => (
            <label key={row.key} className="flex items-center justify-between py-2 border-b border-outline-variant/15 last:border-0 cursor-pointer">
              <div>
                <p className="font-body-md text-body-md text-on-surface">{row.label}</p>
                <p className="font-body-sm text-body-sm text-outline">{row.hint}</p>
              </div>
              <input
                type="checkbox"
                checked={Boolean(prefs[row.key])}
                onChange={(e) => savePrefs({ ...prefs, [row.key]: e.target.checked })}
                className="accent-primary"
              />
            </label>
          ))}
        </section>

        {canEdit && (
          <section className="bg-surface-container-low rounded-xl p-space-md">
            <h2 className="font-headline-sm text-headline-sm text-on-surface mb-space-sm">Create workspace</h2>
            <Formik
              initialValues={{ name: '' }}
              validationSchema={WorkspaceSchema}
              onSubmit={(values, { resetForm }) => {
                dispatch(addWorkspace(values));
                resetForm();
              }}
            >
              <Form className="flex gap-space-xs">
                <div className="flex-1">
                  <Field name="name" placeholder="New workspace name" className="w-full bg-surface-container-lowest text-on-surface rounded-xl px-space-sm py-2 font-body-md focus:outline-none" />
                  <ErrorMessage name="name" component="p" className="text-error text-label-sm mt-1" />
                </div>
                <button type="submit" className="h-fit px-3 py-2 rounded-xl bg-primary-container text-on-primary-container font-label-sm">
                  Create
                </button>
              </Form>
            </Formik>
          </section>
        )}

        <section className="bg-surface-container-low rounded-xl p-space-md">
          <h2 className="font-headline-sm text-headline-sm text-on-surface mb-space-sm">Data Management</h2>
          <p className="font-body-sm text-body-sm text-on-surface-variant mb-space-sm">
            Export all tasks as JSON, or import tasks from a JSON file.
          </p>
          <div className="flex flex-wrap gap-space-xs">
            <button
              type="button"
              className="px-3 py-1.5 rounded-xl bg-surface-container hover:bg-surface-container-high transition-colors text-on-surface font-label-sm flex items-center gap-2"
              onClick={() => {
                const blob = new Blob([JSON.stringify(allTasks, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `workspace-tasks-${new Date().toISOString().slice(0, 10)}.json`;
                a.click();
                URL.revokeObjectURL(url);
              }}
            >
              <Icon name="download" className="text-[16px]" /> Export JSON
            </button>
            <div className="relative">
              <input
                type="file"
                id="import-json"
                className="hidden"
                accept=".json"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) {
                    const reader = new FileReader();
                    reader.onload = (ev) => {
                      try {
                        const parsed = JSON.parse(ev.target.result);
                        if (Array.isArray(parsed)) {
                           dispatch(importTasks(parsed));
                           alert(`Imported ${parsed.length} tasks successfully.`);
                        } else {
                           alert('Invalid format. Expected JSON array.');
                        }
                      } catch (err) {
                        alert('Error parsing JSON.');
                      }
                    };
                    reader.readAsText(file);
                  }
                  e.target.value = null;
                }}
              />
              <label
                htmlFor="import-json"
                className="px-3 py-1.5 rounded-xl bg-surface-container hover:bg-surface-container-high transition-colors text-on-surface font-label-sm cursor-pointer inline-flex items-center gap-2"
              >
                <Icon name="upload" className="text-[16px]" /> Import JSON
              </label>
            </div>
          </div>
        </section>

        <section className="bg-error-container/20 rounded-xl p-space-md space-y-space-md">
          <div>
            <h2 className="font-headline-sm text-headline-sm text-error mb-space-xs">Danger zone</h2>
            <p className="font-body-sm text-body-sm text-on-surface-variant mb-space-sm">
              Clears demo data in this browser (tasks, workspaces, session).
            </p>
            <button
              type="button"
              className="px-3 py-1.5 rounded-xl bg-error-container text-on-error-container font-label-sm"
              onClick={() => {
                ['wm_current_user', 'wm_tasks_v2', 'wm_workspaces_v2', 'wm_user_prefs', 'wm_theme'].forEach((k) => localStorage.removeItem(k));
                setCleared(true);
                dispatch(logout());
                router.push('/login');
              }}
            >
              Reset local demo data
            </button>
            {cleared && <p className="font-body-sm text-tertiary mt-space-xs">Cleared.</p>}
          </div>

          {isOwner && workspace && (
            <div className="pt-space-sm border-t border-error/20">
              <p className="font-body-sm text-body-sm text-on-surface-variant mb-space-xs">
                Delete the current workspace or active project.
              </p>
              <div className="flex flex-wrap gap-space-xs">
                <button
                  type="button"
                  className="px-3 py-1.5 rounded-xl bg-error-container text-on-error-container font-label-sm hover:bg-error hover:text-on-error transition-colors"
                  onClick={() => dispatch(deleteWorkspace(workspace.id))}
                >
                  Delete Workspace
                </button>
                {project && (
                  <button
                    type="button"
                    className="px-3 py-1.5 rounded-xl bg-surface-container text-error font-label-sm hover:bg-error hover:text-on-error transition-colors"
                    onClick={() => dispatch(deleteProject({ workspaceId: workspace.id, projectId: project.id }))}
                  >
                    Delete Project
                  </button>
                )}
              </div>
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}
