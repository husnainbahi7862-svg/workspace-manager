import { configureStore } from '@reduxjs/toolkit';
import authReducer from './features/authSlice';
import workspaceReducer from './features/workspaceSlice';
import tasksReducer from './features/tasksSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    workspace: workspaceReducer,
    tasks: tasksReducer,
  },
});
