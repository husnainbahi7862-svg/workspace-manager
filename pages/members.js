import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import AppShell from '../components/AppShell';
import { Avatar } from '../components/AppShell';
import Icon from '../components/Icon';
import { inviteUser, updateRole } from '../redux/features/authSlice';

const InviteSchema = Yup.object().shape({
  email: Yup.string().email('Valid email required').required('Required'),
  role: Yup.string().oneOf(['owner', 'admin', 'member', 'viewer']).required(),
});

export default function MembersPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const currentUser = useSelector((s) => s.auth.currentUser);
  const members = useSelector((s) => s.auth.mockUsers);
  const canEdit = currentUser?.role === 'owner' || currentUser?.role === 'admin';

  useEffect(() => {
    if (!currentUser) router.replace('/login');
  }, [currentUser, router]);

  if (!currentUser) return null;

  return (
    <AppShell view="" onViewChange={(v) => router.push(v === 'board' ? '/' : `/?view=${v}`)} onCommandPalette={() => router.push('/')}>
      <div className="px-space-xl py-space-lg max-w-3xl">
        <h1 className="font-headline-md text-headline-md text-on-surface mb-space-sm">Members & Roles</h1>
        <p className="font-body-md text-body-md text-on-surface-variant mb-space-lg">
          Workspace access is mock-local. Owner can send simulated invites.
        </p>
        <div className="rounded-xl bg-surface-container-lowest overflow-hidden mb-space-lg">
          {members.map((m) => (
            <div key={m.id} className="flex items-center justify-between px-space-md py-space-sm border-b border-outline-variant/20 last:border-0">
              <div className="flex items-center gap-space-sm">
                <Avatar user={m} />
                <div>
                  <p className="font-label-md text-label-md text-on-surface">{m.name}</p>
                  <p className="font-body-sm text-body-sm text-outline">{m.email}</p>
                </div>
              </div>
              {canEdit ? (
                <select
                  value={m.role}
                  onChange={(e) => dispatch(updateRole({ userId: m.id, role: e.target.value }))}
                  className="bg-surface-container text-on-surface font-code-tabular text-[10px] uppercase px-2 py-0.5 rounded-full focus:outline-none"
                >
                  <option value="owner">owner</option>
                  <option value="admin">admin</option>
                  <option value="member">member</option>
                  <option value="viewer">viewer</option>
                </select>
              ) : (
                <span className="font-code-tabular text-[10px] uppercase px-2 py-0.5 rounded-full bg-primary/15 text-primary">
                  {m.role}
                </span>
              )}
            </div>
          ))}
        </div>
        {canEdit && (
          <div className="bg-surface-container-low rounded-xl p-space-md">
            <h2 className="font-headline-sm text-headline-sm text-on-surface mb-space-sm">Invite member</h2>
            <Formik
              initialValues={{ email: '', role: 'member' }}
              validationSchema={InviteSchema}
              onSubmit={(values, { resetForm, setStatus }) => {
                dispatch(inviteUser({ email: values.email, role: values.role }));
                setStatus(`Invite queued for ${values.email} as ${values.role} (demo only).`);
                resetForm();
              }}
            >
              {({ status }) => (
                <Form className="space-y-space-sm">
                  <Field name="email" placeholder="name@acme.io" className="w-full bg-surface-container-lowest text-on-surface rounded-lg px-space-sm py-2 font-body-md focus:outline-none" />
                  <ErrorMessage name="email" component="p" className="text-error text-label-sm" />
                  <Field as="select" name="role" className="w-full bg-surface-container-lowest text-on-surface rounded-lg px-space-sm py-2 font-body-md focus:outline-none">
                    <option value="member">Member</option>
                    <option value="viewer">Viewer</option>
                    <option value="admin">Admin</option>
                    <option value="owner">Owner</option>
                  </Field>
                  <button type="submit" className="px-3 py-1.5 rounded-xl bg-primary-container text-on-primary-container font-label-md">
                    Send invite
                  </button>
                  {status && <p className="font-body-sm text-body-sm text-tertiary">{status}</p>}
                </Form>
              )}
            </Formik>
          </div>
        )}
        {!canEdit && (
          <p className="font-label-sm text-label-sm text-outline flex items-center gap-1">
            <Icon name="lock" className="text-[14px]" /> Only owners and admins can invite members.
          </p>
        )}
      </div>
    </AppShell>
  );
}
