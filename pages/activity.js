import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';
import AppShell from '../components/AppShell';
import Icon from '../components/Icon';
import { hydrateTask } from '../redux/features/tasksSlice';
import { Avatar } from '../components/AppShell';

export default function ActivityPage() {
  const router = useRouter();
  const currentUser = useSelector((s) => s.auth.currentUser);
  const items = useSelector((s) => s.tasks.items);
  const activeProjectId = useSelector((s) => s.workspace.activeProjectId);
  const members = useSelector((s) => s.auth.mockUsers);

  const [filterUser, setFilterUser] = useState('');
  const [filterType, setFilterType] = useState('');

  useEffect(() => {
    if (!currentUser) router.replace('/login');
  }, [currentUser, router]);

  const feed = useMemo(() => {
    const rows = [];
    const projectItems = items.filter((t) => t.projectId === activeProjectId);
    projectItems.forEach((raw) => {
      const t = hydrateTask(raw);
      (t.activity || []).forEach((a) => {
        rows.push({ ...a, taskTitle: t.title, taskId: t.id });
      });
    });
    let result = rows;
    if (filterUser) result = result.filter((r) => r.userId === filterUser);
    if (filterType) {
      result = result.filter((r) => {
        const txt = r.text.toLowerCase();
        if (filterType === 'status') return txt.startsWith('status');
        if (filterType === 'comment') return txt.includes('comment');
        if (filterType === 'attachment') return txt.includes('attach');
        if (filterType === 'subtask') return txt.includes('subtask');
        return true;
      });
    }
    return result.sort((a, b) => (b.at || '').localeCompare(a.at || ''));
  }, [items, activeProjectId, filterUser, filterType]);

  if (!currentUser) return null;

  return (
    <AppShell view="" onViewChange={(v) => router.push(v === 'board' ? '/' : `/?view=${v}`)} onCommandPalette={() => router.push('/')}>
      <div className="px-space-xl py-space-lg max-w-3xl">
        <h1 className="font-headline-md text-headline-md text-on-surface mb-space-sm">Activity Log</h1>
        
        <div className="flex gap-space-sm mb-space-lg">
          <select
            value={filterUser}
            onChange={(e) => setFilterUser(e.target.value)}
            className="bg-surface-container-low text-on-surface rounded-lg px-space-sm py-1 font-body-sm focus:outline-none border border-outline-variant/30"
          >
            <option value="">All Users</option>
            {members.map((m) => (
              <option key={m.id} value={m.id}>{m.name}</option>
            ))}
          </select>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="bg-surface-container-low text-on-surface rounded-lg px-space-sm py-1 font-body-sm focus:outline-none border border-outline-variant/30"
          >
            <option value="">All Actions</option>
            <option value="status">Status Changes</option>
            <option value="comment">Comments</option>
            <option value="attachment">Attachments</option>
            <option value="subtask">Subtasks</option>
          </select>
        </div>

        <div className="rounded-xl bg-surface-container-lowest divide-y divide-outline-variant/20">
          {feed.map((row) => {
            const user = members.find((m) => m.id === row.userId);
            return (
              <button
                key={row.id}
                type="button"
                className="w-full text-left px-space-md py-space-sm hover:bg-surface-container flex items-start gap-space-sm"
                onClick={() => router.push(`/task/${row.taskId}`)}
              >
                {user ? (
                  <Avatar user={user} size="w-6 h-6 text-[9px] mt-0.5" />
                ) : (
                  <Icon name="history" className="text-[16px] text-outline mt-0.5" />
                )}
                <div className="flex-1">
                  <p className="font-body-md text-body-md text-on-surface">{row.taskTitle}</p>
                  <p className="font-body-sm text-body-sm text-on-surface-variant">
                    {user ? <span className="font-medium mr-1">{user.name}</span> : null}
                    {row.text}
                  </p>
                </div>
              </button>
            );
          })}
          {feed.length === 0 && (
            <div className="px-space-md py-space-lg text-center text-outline font-body-md">
              No activity found.
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
