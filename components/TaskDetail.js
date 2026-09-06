import { useState } from 'react';
import { useRouter } from 'next/router';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useDispatch, useSelector } from 'react-redux';
import {
  updateTask,
  deleteTask,
  duplicateTask,
  moveTask,
  addComment,
  addSubtask,
  toggleSubtask,
  addFile,
  removeFile,
  removeSubtask,
  convertSubtask,
  hydrateTask,
  editComment,
  deleteComment,
} from '../redux/features/tasksSlice';
import Icon from './Icon';
import { Avatar } from './AppShell';

const CommentSchema = Yup.object().shape({
  text: Yup.string().min(2, 'Too short').max(500, 'Too long').required('Required'),
});
const SubtaskSchema = Yup.object().shape({
  title: Yup.string().min(2, 'Too short').required('Required'),
});
const FileSchema = Yup.object().shape({
  name: Yup.string().min(3, 'Too short').required('Required'),
});
const TitleSchema = Yup.object().shape({
  title: Yup.string().min(3, 'Too short').required('Required'),
  label: Yup.string(),
  description: Yup.string().max(500, 'Max 500 characters'),
});

function formatAt(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  return d.toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

const PRIORITY_PILL = {
  high: 'bg-error/15 text-error',
  medium: 'bg-secondary-container/20 text-secondary',
  low: 'bg-surface-container-highest text-outline',
};

export default function TaskDetail({ taskId }) {
  const router = useRouter();
  const dispatch = useDispatch();
  const raw = useSelector((s) => s.tasks.items.find((t) => t.id === taskId));
  const members = useSelector((s) => s.auth.mockUsers);
  const columns = useSelector((s) => s.workspace.columns);
  const currentUser = useSelector((s) => s.auth.currentUser);
  const canEdit = currentUser?.role !== 'viewer';
  const [tab, setTab] = useState('comments');
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [editingComment, setEditingComment] = useState(null);

  if (!raw) {
    return (
      <div className="px-space-xl py-space-3xl text-center">
        <Icon name="search_off" className="text-[32px] text-outline" />
        <p className="font-headline-sm text-headline-sm text-on-surface mt-space-sm">Task not found</p>
        <p className="font-body-md text-body-md text-on-surface-variant">It may have been deleted, or the id is invalid.</p>
        <button type="button" className="mt-space-md px-3 py-1.5 rounded-xl bg-primary-container text-on-primary-container font-label-md" onClick={() => router.push('/')}>
          Back to board
        </button>
      </div>
    );
  }

  const task = hydrateTask(raw);
  const assignee = members.find((m) => m.id === task.assignee);
  const column = columns.find((c) => c.id === task.status);
  const doneCount = task.subtaskList.filter((s) => s.done).length;
  const pct = task.subtaskList.length ? Math.round((doneCount / task.subtaskList.length) * 100) : 0;

  return (
    <div className="px-space-lg py-space-lg max-w-5xl pb-space-3xl">
      <div className="flex flex-wrap items-center justify-between gap-space-sm mb-space-md">
        <button
          type="button"
          className="flex items-center gap-1 text-on-surface-variant hover:text-on-surface font-label-sm text-label-sm"
          onClick={() => router.push('/')}
        >
          <Icon name="arrow_back" className="text-[16px]" />
          Back to workspace
        </button>
        <div className="flex items-center gap-space-xs">
          <span className="font-code-tabular text-[11px] px-2 py-0.5 rounded-full bg-surface-container-high text-on-surface-variant">
            WM-{String(task.id).slice(-4).toUpperCase()}
          </span>
          <span className={`font-code-tabular text-[10px] font-semibold px-2 py-0.5 rounded-full ${PRIORITY_PILL[task.priority]}`}>
            {task.priority}
          </span>
          {!canEdit && (
            <span className="flex items-center gap-1 font-label-sm text-label-sm text-outline">
              <Icon name="lock" className="text-[14px]" /> Viewer · read only
            </span>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-space-lg">
        <div className="space-y-space-md">
          <div className="bg-surface-container-low rounded-xl p-space-lg">
            {canEdit ? (
              <Formik
                enableReinitialize
                initialValues={{
                  title: task.title,
                  label: task.label || '',
                  description: task.description || '',
                }}
                validationSchema={TitleSchema}
                onSubmit={(values) => {
                  const labelTone =
                    values.label.toLowerCase() === 'bug'
                      ? 'error'
                      : values.label.toLowerCase().includes('design')
                        ? 'tertiary'
                        : values.label.toLowerCase() === 'api'
                          ? 'secondary'
                          : 'primary';
                  dispatch(updateTask({ id: task.id, ...values, labelTone }));
                }}
              >
                <Form className="space-y-space-sm">
                  <Field
                    name="title"
                    className="w-full bg-transparent font-headline-md text-headline-md text-on-surface tracking-tight focus:outline-none border-b border-transparent focus:border-outline-variant pb-1"
                  />
                  <ErrorMessage name="title" component="p" className="text-error text-label-sm" />
                  <div className="flex gap-space-sm">
                    <Field
                      name="label"
                      placeholder="Label"
                      className="flex-1 bg-surface-container-lowest text-on-surface rounded-lg px-space-sm py-2 font-body-sm text-body-sm focus:outline-none"
                    />
                  </div>
                  <Field
                    as="textarea"
                    name="description"
                    rows="4"
                    placeholder="Add a description…"
                    className="w-full bg-surface-container-lowest text-on-surface rounded-lg px-space-sm py-2 font-body-md text-body-md focus:outline-none"
                  />
                  <button type="submit" className="px-3 py-1.5 rounded-xl bg-primary-container text-on-primary-container font-label-sm text-label-sm">
                    Save details
                  </button>
                </Form>
              </Formik>
            ) : (
              <>
                <h1 className="font-headline-md text-headline-md text-on-surface tracking-tight">{task.title}</h1>
                {task.label && (
                  <span className="inline-block mt-space-xs font-label-sm text-label-sm px-1.5 py-0.5 rounded bg-surface-container-highest text-secondary">
                    {task.label}
                  </span>
                )}
                <p className="font-body-md text-body-md text-on-surface-variant mt-space-sm">
                  {task.description || 'No description.'}
                </p>
              </>
            )}
          </div>

          <div className="bg-surface-container-low rounded-xl p-space-md">
            <div className="flex items-center justify-between mb-space-sm">
              <h2 className="font-headline-sm text-headline-sm text-on-surface">Subtasks</h2>
              <span className="font-code-tabular text-[11px] text-outline">{doneCount}/{task.subtaskList.length} · {pct}%</span>
            </div>
            <div className="h-1.5 rounded-full bg-surface-container-highest overflow-hidden mb-space-sm">
              <div className="h-full bg-tertiary rounded-full" style={{ width: `${pct}%` }} />
            </div>
            <div className="space-y-space-2xs">
              {task.subtaskList.map((sub) => (
                <div key={sub.id} className="flex items-center gap-space-sm px-space-sm py-1.5 rounded-lg hover:bg-surface-container">
                  <input
                    type="checkbox"
                    checked={sub.done}
                    disabled={!canEdit}
                    onChange={() => dispatch(toggleSubtask({ id: task.id, subtaskId: sub.id, userId: currentUser?.id }))}
                    className="accent-primary"
                  />
                  <span className={`flex-1 font-body-md text-body-md ${sub.done ? 'line-through text-outline' : 'text-on-surface'}`}>
                    {sub.title}
                  </span>
                  {canEdit && (
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button type="button" title="Convert to Task" className="text-outline hover:text-primary p-1" onClick={() => dispatch(convertSubtask({ id: task.id, subtaskId: sub.id, userId: currentUser?.id }))}>
                        <Icon name="transform" className="text-[14px]" />
                      </button>
                      <button type="button" title="Delete" className="text-outline hover:text-error p-1" onClick={() => dispatch(removeSubtask({ id: task.id, subtaskId: sub.id, userId: currentUser?.id }))}>
                        <Icon name="close" className="text-[14px]" />
                      </button>
                    </div>
                  )}
                </div>
              ))}
              {task.subtaskList.length === 0 && (
                <p className="font-body-sm text-body-sm text-outline px-space-sm">Break this task into checkable steps.</p>
              )}
            </div>
            {canEdit && (
              <Formik
                initialValues={{ title: '' }}
                validationSchema={SubtaskSchema}
                onSubmit={(values, { resetForm }) => {
                  dispatch(addSubtask({ id: task.id, title: values.title, userId: currentUser?.id }));
                  resetForm();
                }}
              >
                <Form className="flex gap-space-xs mt-space-sm">
                  <Field name="title" placeholder="Add subtask" className="flex-1 bg-surface-container-lowest text-on-surface rounded-lg px-space-sm py-1.5 font-body-sm text-body-sm focus:outline-none" />
                  <button type="submit" className="px-3 py-1.5 rounded-lg bg-surface-container-high text-on-surface font-label-sm">Add</button>
                </Form>
              </Formik>
            )}
          </div>

          <div className="bg-surface-container-low rounded-xl p-space-md">
            <h2 className="font-headline-sm text-headline-sm text-on-surface mb-space-sm">Attachments</h2>
            <div className="space-y-space-2xs">
              {task.fileList.map((f) => (
                <div key={f.id} className="flex items-center gap-space-sm px-space-sm py-1.5 rounded-lg bg-surface-container">
                  <Icon name="attach_file" className="text-[16px] text-outline" />
                  {f.data ? (
                    <a href={f.data} download={f.name} className="flex-1 font-body-sm text-body-sm text-on-surface hover:underline">{f.name}</a>
                  ) : (
                    <span className="flex-1 font-body-sm text-body-sm text-on-surface">{f.name}</span>
                  )}
                  {canEdit && (
                    <button type="button" className="text-outline hover:text-error" onClick={() => dispatch(removeFile({ id: task.id, fileId: f.id, userId: currentUser?.id }))}>
                      <Icon name="delete" className="text-[16px]" />
                    </button>
                  )}
                </div>
              ))}
              {task.fileList.length === 0 && (
                <p className="font-body-sm text-body-sm text-outline">No files yet.</p>
              )}
            </div>
            {canEdit && (
              <div className="mt-space-sm relative">
                <input
                  type="file"
                  id={`file-upload-${task.id}`}
                  className="hidden"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (ev) => {
                        dispatch(addFile({ id: task.id, name: file.name, data: ev.target.result, userId: currentUser?.id }));
                      };
                      reader.readAsDataURL(file);
                    }
                    e.target.value = null; // reset
                  }}
                />
                <label
                  htmlFor={`file-upload-${task.id}`}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface-container-high hover:bg-surface-container-highest text-on-surface font-label-sm cursor-pointer transition-colors"
                >
                  <Icon name="upload_file" className="text-[16px]" /> Attach File
                </label>
              </div>
            )}
          </div>

          <div className="bg-surface-container-low rounded-xl p-space-md">
            <div className="flex items-center gap-space-xs mb-space-md">
              {['comments', 'activity'].map((id) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setTab(id)}
                  className={`px-3 py-1 rounded-xl font-label-md text-label-md capitalize ${
                    tab === id ? 'bg-surface-container-high text-on-surface' : 'text-on-surface-variant hover:bg-surface-container'
                  }`}
                >
                  {id}
                </button>
              ))}
            </div>

            {tab === 'comments' && (
              <>
                {canEdit && (
                  <Formik
                    initialValues={{ text: '' }}
                    validationSchema={CommentSchema}
                    onSubmit={(values, { resetForm }) => {
                      // Mentioned user IDs
                      const mentions = members
                        .filter((m) => values.text.includes(`@${m.name}`))
                        .map((m) => m.id);
                      dispatch(addComment({ id: task.id, userId: currentUser.id, text: values.text, mentions }));
                      resetForm();
                    }}
                  >
                    {({ values, setFieldValue }) => {
                      const match = values.text.match(/@(\w*)$/);
                      const q = match ? match[1].toLowerCase() : null;
                      const mentionList =
                        q !== null
                          ? members.filter((m) => m.name.toLowerCase().includes(q) || m.id.toLowerCase().includes(q))
                          : [];
                      
                      return (
                        <Form className="mb-space-md space-y-space-xs relative">
                          <Field as="textarea" name="text" rows="2" placeholder="Write a comment..." className="w-full bg-surface-container-lowest text-on-surface rounded-lg px-space-sm py-2 font-body-md text-body-md focus:outline-none" />
                          
                          {mentionList.length > 0 && (
                            <div className="absolute top-12 left-0 mt-1 w-48 bg-surface-container-high rounded-lg shadow-xl p-1 z-10 border border-outline-variant/20">
                              {mentionList.map((m) => (
                                <button
                                  key={m.id}
                                  type="button"
                                  className="w-full text-left px-2 py-1.5 rounded font-body-sm text-body-sm hover:bg-surface-container text-on-surface flex items-center gap-2"
                                  onClick={() => {
                                    const newText = values.text.replace(/@\w*$/, `@${m.name} `);
                                    setFieldValue('text', newText);
                                  }}
                                >
                                  <Avatar user={m} size="w-5 h-5 text-[8px]" />
                                  <span>{m.name}</span>
                                </button>
                              ))}
                            </div>
                          )}

                          <ErrorMessage name="text" component="p" className="text-error text-label-sm" />
                          <button type="submit" className="px-3 py-1.5 rounded-xl bg-primary-container text-on-primary-container font-label-sm">Comment</button>
                        </Form>
                      );
                    }}
                  </Formik>
                )}
                <div className="space-y-space-sm">
                  {task.commentList.map((c) => {
                    const user = members.find((m) => m.id === c.userId);
                    return (
                      <div key={c.id} className="flex gap-space-sm group">
                        <Avatar user={user} size="w-7 h-7 text-[9px]" />
                        <div className="flex-1">
                          <div className="flex items-center gap-space-xs">
                            <span className="font-label-md text-label-md text-on-surface">{user?.name}</span>
                            <span className="font-code-tabular text-[10px] text-outline">{formatAt(c.at)}</span>
                            {c.userId === currentUser?.id && (
                              <div className="ml-auto opacity-0 group-hover:opacity-100 flex gap-2">
                                <button type="button" onClick={() => setEditingComment(c.id)} className="text-outline hover:text-primary font-label-sm text-[11px]">Edit</button>
                                <button type="button" onClick={() => dispatch(deleteComment({ id: task.id, commentId: c.id }))} className="text-outline hover:text-error font-label-sm text-[11px]">Delete</button>
                              </div>
                            )}
                          </div>
                          {editingComment === c.id ? (
                            <Formik
                              initialValues={{ text: c.text }}
                              onSubmit={(values) => {
                                dispatch(editComment({ id: task.id, commentId: c.id, text: values.text }));
                                setEditingComment(null);
                              }}
                            >
                              <Form className="mt-1 flex gap-2">
                                <Field as="textarea" name="text" rows="2" className="flex-1 bg-surface-container-lowest text-on-surface rounded-lg px-space-sm py-1 font-body-md text-body-md focus:outline-none border border-outline-variant" />
                                <div className="flex flex-col gap-1">
                                  <button type="submit" className="px-2 py-1 rounded bg-primary-container text-on-primary-container font-label-sm text-[11px]">Save</button>
                                  <button type="button" onClick={() => setEditingComment(null)} className="px-2 py-1 rounded text-outline font-label-sm text-[11px]">Cancel</button>
                                </div>
                              </Form>
                            </Formik>
                          ) : (
                            <p className="font-body-md text-body-md text-on-surface whitespace-pre-wrap">{c.text}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  {task.commentList.length === 0 && (
                    <p className="font-body-sm text-body-sm text-outline">No comments yet.</p>
                  )}
                </div>
              </>
            )}

            {tab === 'activity' && (
              <div className="space-y-space-sm">
                {(task.activity || []).map((a) => (
                  <div key={a.id} className="flex gap-space-xs">
                    <Icon name="history" className="text-[14px] text-outline mt-0.5" />
                    <div>
                      <p className="font-body-sm text-body-sm text-on-surface">{a.text}</p>
                      <p className="font-code-tabular text-[10px] text-outline">{formatAt(a.at)}</p>
                    </div>
                  </div>
                ))}
                {(task.activity || []).length === 0 && (
                  <p className="font-body-sm text-body-sm text-outline">Moves, comments, and attachments will show here.</p>
                )}
              </div>
            )}
          </div>
        </div>

        <aside className="space-y-space-md">
          <div className="bg-surface-container-low rounded-xl p-space-md space-y-space-sm">
            <p className="font-label-sm text-label-sm text-outline uppercase tracking-wider">Properties</p>
            <label className="block font-label-sm text-label-sm text-outline">Status</label>
            <select
              disabled={!canEdit}
              value={task.status}
              onChange={(e) => dispatch(moveTask({ id: task.id, status: e.target.value, userId: currentUser?.id }))}
              className="w-full bg-surface-container-lowest text-on-surface rounded-lg px-space-sm py-2 font-body-sm focus:outline-none disabled:opacity-60"
            >
              {columns.map((c) => (
                <option key={c.id} value={c.id}>{c.label}</option>
              ))}
            </select>
            <p className="font-code-tabular text-[10px] text-outline">Now: {column?.label || task.status}</p>
            <label className="block font-label-sm text-label-sm text-outline">Priority</label>
            <select
              disabled={!canEdit}
              value={task.priority}
              onChange={(e) => dispatch(updateTask({ id: task.id, priority: e.target.value }))}
              className="w-full bg-surface-container-lowest text-on-surface rounded-lg px-space-sm py-2 font-body-sm focus:outline-none disabled:opacity-60"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
            <label className="block font-label-sm text-label-sm text-outline">Assignee</label>
            <div className="flex items-center gap-space-xs">
              <Avatar user={assignee} size="w-7 h-7 text-[9px]" />
              <select
                disabled={!canEdit}
                value={task.assignee}
                onChange={(e) => dispatch(updateTask({ id: task.id, assignee: e.target.value }))}
                className="flex-1 bg-surface-container-lowest text-on-surface rounded-lg px-space-sm py-2 font-body-sm focus:outline-none disabled:opacity-60"
              >
                {members.map((m) => (
                  <option key={m.id} value={m.id}>{m.name}</option>
                ))}
              </select>
            </div>
            <label className="block font-label-sm text-label-sm text-outline">Due date</label>
            <input
              type="date"
              disabled={!canEdit}
              value={task.dueDate || ''}
              onChange={(e) => dispatch(rescheduleTask({ id: task.id, dueDate: e.target.value, userId: currentUser?.id }))}
              className="w-full bg-surface-container-lowest text-on-surface rounded-lg px-space-sm py-2 font-body-sm focus:outline-none disabled:opacity-60"
            />
          </div>

          {canEdit && (
            <div className="bg-surface-container-low rounded-xl p-space-md space-y-space-xs">
              <button
                type="button"
                className="w-full flex items-center gap-space-xs px-space-sm py-2 rounded-xl hover:bg-surface-container font-label-sm text-label-sm text-on-surface"
                onClick={() => {
                  dispatch(duplicateTask(task.id));
                  router.push('/');
                }}
              >
                <Icon name="content_copy" className="text-[16px] text-outline" />
                Duplicate task
              </button>
              {!confirmDelete ? (
                <button
                  type="button"
                  className="w-full flex items-center gap-space-xs px-space-sm py-2 rounded-xl hover:bg-error-container/40 font-label-sm text-label-sm text-error"
                  onClick={() => setConfirmDelete(true)}
                >
                  <Icon name="delete" className="text-[16px]" />
                  Delete task
                </button>
              ) : (
                <div className="flex gap-space-xs">
                  <button
                    type="button"
                    className="flex-1 px-space-sm py-2 rounded-xl bg-error-container text-on-error-container font-label-sm"
                    onClick={() => {
                      dispatch(deleteTask(task.id));
                      router.push('/');
                    }}
                  >
                    Confirm
                  </button>
                  <button type="button" className="flex-1 px-space-sm py-2 rounded-xl bg-surface-container font-label-sm text-on-surface" onClick={() => setConfirmDelete(false)}>
                    Cancel
                  </button>
                </div>
              )}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
