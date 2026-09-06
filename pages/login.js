import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useDispatch, useSelector } from 'react-redux';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { login, clearLoginError, registerUser } from '../redux/features/authSlice';
import Logo from '../components/Logo';
import Icon from '../components/Icon';
import ThemeToggle from '../components/ThemeToggle';

const LoginSchema = Yup.object().shape({
  email: Yup.string().email('Enter a valid email').required('Email is required'),
  password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
});

const SignupSchema = Yup.object().shape({
  name: Yup.string().min(2, 'Name is required').required('Name is required'),
  email: Yup.string().email('Enter a valid email').required('Email is required'),
  password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
});



export default function LoginPage() {
  const router = useRouter();
  const dispatch = useDispatch();
  const currentUser = useSelector((s) => s.auth.currentUser);
  const loginError = useSelector((s) => s.auth.loginError);
  const mockUsers = useSelector((s) => s.auth.mockUsers);
  const [showPassword, setShowPassword] = useState(false);
  const [isSignup, setIsSignup] = useState(false);

  useEffect(() => {
    dispatch(clearLoginError());
  }, [dispatch]);

  useEffect(() => {
    if (currentUser) router.replace('/');
  }, [currentUser, router]);

  return (
    <div className="min-h-screen bg-surface grid lg:grid-cols-2">
      <aside className="hidden lg:flex flex-col justify-between bg-surface-container-lowest p-space-3xl">
        <div className="flex items-center gap-space-sm">
          <Logo className="h-10 w-10" />
          <div>
            <p className="font-headline-sm text-headline-sm text-on-surface">Workspace Manager</p>
            <p className="font-code-tabular text-[11px] text-outline uppercase tracking-wider">Kinetic enterprise</p>
          </div>
        </div>
        <div className="space-y-space-lg max-w-md">
          <h2 className="font-display-lg text-display-lg text-on-surface">Precision ops for every sprint.</h2>
          <p className="font-body-lg text-body-lg text-on-surface-variant">
            Board, list, and calendar in one dark-first shell — roles, offline queue, and task detail without leaving the workspace.
          </p>
          <ul className="space-y-space-sm">
            {[
              { icon: 'view_kanban', text: 'Kanban with bulk actions' },
              { icon: 'group', text: 'Owner / member / viewer gates' },
              { icon: 'cloud_sync', text: 'Simulated offline sync ribbon' },
            ].map((item) => (
              <li key={item.icon} className="flex items-center gap-space-sm text-on-surface">
                <span className="w-8 h-8 rounded-xl bg-surface-container flex items-center justify-center">
                  <Icon name={item.icon} className="text-[18px] text-primary" />
                </span>
                <span className="font-body-md text-body-md">{item.text}</span>
              </li>
            ))}
          </ul>
        </div>
        <p className="font-code-tabular text-[11px] text-outline">Demo build · localStorage only · password 123456</p>
      </aside>

      <main className="flex flex-col justify-center px-space-lg py-space-2xl relative">
        <div className="absolute top-space-md right-space-md">
          <ThemeToggle />
        </div>
        <div className="w-full max-w-md mx-auto">
          <div className="lg:hidden flex items-center gap-space-sm mb-space-lg">
            <Logo className="h-8 w-8" />
            <span className="font-headline-sm text-headline-sm text-on-surface">Workspace Manager</span>
          </div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface mb-space-xs">
            {isSignup ? 'Create an account' : 'Sign in'}
          </h1>
          <p className="font-body-md text-body-md text-on-surface-variant mb-space-xl">
            {isSignup ? 'Enter your details below to get started.' : 'Enter your credentials to continue.'}
          </p>

          <Formik
            initialValues={{ name: '', email: 'husnain@example.com', password: '123456' }}
            validationSchema={isSignup ? SignupSchema : LoginSchema}
            onSubmit={(values) => {
              if (isSignup) dispatch(registerUser(values));
              else dispatch(login(values));
            }}
          >
            {({ setFieldValue, isSubmitting }) => (
              <Form className="space-y-space-md">
                
                {isSignup && (
                  <div>
                    <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1">Full Name</label>
                    <Field
                      name="name"
                      type="text"
                      autoComplete="name"
                      className="w-full bg-surface-container-low text-on-surface rounded-xl px-space-md py-2.5 font-body-md text-body-md focus:outline-none focus:bg-surface-container"
                    />
                    <ErrorMessage name="name" component="p" className="text-error text-label-sm mt-1" />
                  </div>
                )}

                <div>
                  <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1">Email</label>
                  <Field
                    name="email"
                    type="email"
                    autoComplete="username"
                    className="w-full bg-surface-container-low text-on-surface rounded-xl px-space-md py-2.5 font-body-md text-body-md focus:outline-none focus:bg-surface-container"
                  />
                  <ErrorMessage name="email" component="p" className="text-error text-label-sm mt-1" />
                </div>
                <div>
                  <label className="block font-label-sm text-label-sm text-on-surface-variant mb-1">Password</label>
                  <div className="relative">
                    <Field
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="current-password"
                      className="w-full bg-surface-container-low text-on-surface rounded-xl px-space-md py-2.5 pr-12 font-body-md text-body-md focus:outline-none focus:bg-surface-container"
                    />
                    <button
                      type="button"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface"
                      onClick={() => setShowPassword((v) => !v)}
                    >
                      <Icon name={showPassword ? 'visibility_off' : 'visibility'} className="text-[18px]" />
                    </button>
                  </div>
                  <ErrorMessage name="password" component="p" className="text-error text-label-sm mt-1" />
                </div>
                {loginError && (
                  <div className="flex items-center gap-space-xs px-space-sm py-2 rounded-xl bg-error-container/40 text-error">
                    <Icon name="error" className="text-[16px]" />
                    <p className="font-body-sm text-body-sm">{loginError}</p>
                  </div>
                )}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-primary-container text-on-primary-container rounded-xl py-2.5 font-label-md text-label-md hover:bg-primary-container/80 transition shadow-sm"
                >
                  {isSignup ? 'Sign Up' : 'Continue'}
                </button>
                <div className="flex flex-col items-center gap-2 mt-4">
                  <button
                    type="button"
                    className="font-label-md text-label-md text-primary hover:underline"
                    onClick={() => {
                      setIsSignup(!isSignup);
                      dispatch(clearLoginError());
                    }}
                  >
                    {isSignup ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}
                  </button>
                  <p className="font-code-tabular text-[11px] text-outline text-center">
                    All demo passwords: 123456
                  </p>
                </div>
                <div className="mt-space-lg pt-space-md border-t border-outline-variant/15">
                  <p className="font-label-sm text-label-sm text-outline mb-space-sm">Or sign in quickly as a demo user:</p>
                  <div className="flex flex-col gap-space-xs">
                    {mockUsers.map(u => (
                      <button
                        key={u.id}
                        type="button"
                        onClick={() => dispatch(login({ email: u.email, password: u.password }))}
                        className="flex items-center gap-space-sm p-2 rounded-xl bg-surface-container-lowest hover:bg-surface-container transition-colors text-left border border-outline-variant/20"
                      >
                        <span className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-[11px]">{u.initials}</span>
                        <div>
                          <p className="font-label-md text-label-md text-on-surface">{u.name}</p>
                          <p className="font-body-sm text-body-sm text-outline">{u.email}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              </Form>
            )}
          </Formik>
        </div>
      </main>
    </div>
  );
}
