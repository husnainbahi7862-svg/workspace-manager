import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';
import AppShell from '../../components/AppShell';
import TaskDetail from '../../components/TaskDetail';

export default function TaskPage() {
  const router = useRouter();
  const currentUser = useSelector((s) => s.auth.currentUser);
  const { id } = router.query;

  useEffect(() => {
    if (!currentUser) router.replace('/login');
  }, [currentUser, router]);

  if (!currentUser || !id) return null;

  return (
    <AppShell
      view=""
      onViewChange={(v) => router.push(v === 'board' ? '/' : `/?view=${v}`)}
      onCommandPalette={() => router.push('/')}
    >
      <TaskDetail taskId={id} />
    </AppShell>
  );
}
