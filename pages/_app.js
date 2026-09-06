import { useEffect, useState } from 'react';
import { Provider } from 'react-redux';
import { store } from '../redux/store';
import { rehydrateAuth } from '../redux/features/authSlice';
import { rehydrateWorkspace } from '../redux/features/workspaceSlice';
import { rehydrateTasks } from '../redux/features/tasksSlice';
import '../styles/globals.css';

export default function App({ Component, pageProps }) {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    store.dispatch(rehydrateAuth());
    store.dispatch(rehydrateWorkspace());
    store.dispatch(rehydrateTasks());
    setReady(true);
  }, []);

  return (
    <Provider store={store}>
      {ready ? <Component {...pageProps} /> : <div className="min-h-screen bg-surface" />}
    </Provider>
  );
}
