import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useDispatch, useSelector } from 'react-redux';
import { addTask, updateTask } from '../redux/features/tasksSlice';

const TaskSchema = Yup.object().shape({
  title: Yup.string().min(3, 'Title too short').required('Title is required'),
  description: Yup.string().max(300, 'Max 300 characters'),
  priority: Yup.string().oneOf(['low', 'medium', 'high']).required(),
  assignee: Yup.string().required('Assignee is required'),
  dueDate: Yup.string(),
  label: Yup.string(),
});

export default function TaskModal({ task, projectId, defaultStatus, onClose }) {
  const dispatch = useDispatch();
  const members = useSelector((s) => s.auth.mockUsers);
  const columns = useSelector((s) => s.workspace.columns);
  const isEdit = Boolean(task);

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[70] p-4">
      <div className="bg-surface-container-high rounded-xl shadow-2xl w-full max-w-md p-space-lg">
        <h2 className="font-headline-sm text-headline-sm text-on-surface mb-space-md">
          {isEdit ? 'Edit Task' : 'New Task'}
        </h2>
        <Formik
          initialValues={{
            title: task?.title || '',
            description: task?.description || '',
            priority: task?.priority || 'medium',
            assignee: task?.assignee || members[0]?.id || '',
            dueDate: task?.dueDate || '',
            status: task?.status || defaultStatus || 'todo',
            label: task?.label || '',
          }}
          validationSchema={TaskSchema}
          onSubmit={(values) => {
            const labelTone =
              values.label.toLowerCase() === 'bug'
                ? 'error'
                : values.label.toLowerCase().includes('design')
                  ? 'tertiary'
                  : values.label.toLowerCase() === 'api'
                    ? 'secondary'
                    : 'primary';
            if (isEdit) {
              dispatch(updateTask({ id: task.id, ...values, labelTone }));
            } else {
              dispatch(addTask({ ...values, projectId, labelTone }));
            }
            onClose();
          }}
        >
          {() => (
            <Form className="space-y-space-sm">
              <div>
                <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1">Title</label>
                <Field
                  name="title"
                  className="w-full bg-surface-container-low text-on-surface rounded-lg px-space-sm py-2 font-body-md text-body-md focus:outline-none focus:bg-surface-container"
                />
                <ErrorMessage name="title" component="p" className="text-error text-label-sm mt-1" />
              </div>
              <div>
                <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1">Description</label>
                <Field
                  as="textarea"
                  name="description"
                  rows="3"
                  className="w-full bg-surface-container-low text-on-surface rounded-lg px-space-sm py-2 font-body-md text-body-md focus:outline-none"
                />
                <ErrorMessage name="description" component="p" className="text-error text-label-sm mt-1" />
              </div>
              <div className="grid grid-cols-2 gap-space-sm">
                <div>
                  <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1">Priority</label>
                  <Field
                    as="select"
                    name="priority"
                    className="w-full bg-surface-container-low text-on-surface rounded-lg px-space-sm py-2 font-body-md text-body-md focus:outline-none"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </Field>
                </div>
                <div>
                  <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1">Assignee</label>
                  <Field
                    as="select"
                    name="assignee"
                    className="w-full bg-surface-container-low text-on-surface rounded-lg px-space-sm py-2 font-body-md text-body-md focus:outline-none"
                  >
                    {members.map((m) => (
                      <option key={m.id} value={m.id}>{m.name}</option>
                    ))}
                  </Field>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-space-sm">
                <div>
                  <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1">Status</label>
                  <Field
                    as="select"
                    name="status"
                    className="w-full bg-surface-container-low text-on-surface rounded-lg px-space-sm py-2 font-body-md text-body-md focus:outline-none"
                  >
                    {columns.map((c) => (
                      <option key={c.id} value={c.id}>{c.label}</option>
                    ))}
                  </Field>
                </div>
                <div>
                  <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1">Due Date</label>
                  <Field
                    name="dueDate"
                    type="date"
                    className="w-full bg-surface-container-low text-on-surface rounded-lg px-space-sm py-2 font-body-md text-body-md focus:outline-none"
                  />
                </div>
              </div>
              <div>
                <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1">Label</label>
                <Field
                  name="label"
                  placeholder="API, Frontend, Design System..."
                  className="w-full bg-surface-container-low text-on-surface rounded-lg px-space-sm py-2 font-body-md text-body-md focus:outline-none"
                />
              </div>
              <div className="flex justify-end gap-space-xs pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 font-label-md text-label-md rounded-xl text-on-surface-variant hover:bg-surface-container"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 font-label-md text-label-md rounded-xl bg-primary-container text-on-primary-container hover:bg-primary-container/80"
                >
                  {isEdit ? 'Save' : 'Create'}
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}
