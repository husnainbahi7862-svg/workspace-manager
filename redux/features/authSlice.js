import { createSlice } from '@reduxjs/toolkit';

const MOCK_USERS = [
  { id: 'u1', name: 'Muhammad Husnain', email: 'husnain@example.com', password: '123456', role: 'owner', initials: 'MH', avatarUrl: 'avatars/myphoto.jpg' },
  { id: 'u2', name: 'Sara Khan', email: 'sara@example.com', password: '123456', role: 'admin', initials: 'SK' },
  { id: 'u3', name: 'Bilal Ahmed', email: 'bilal@example.com', password: '123456', role: 'member', initials: 'BA' },
  { id: 'u4', name: 'John Doe', email: 'john@example.com', password: '123456', role: 'viewer', initials: 'JD' },
];

const readStoredUser = () => {
  try {
    const raw = localStorage.getItem('wm_current_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

const readMockUsers = () => {
  try {
    const raw = localStorage.getItem('wm_mock_users');
    return raw ? JSON.parse(raw) : MOCK_USERS;
  } catch {
    return MOCK_USERS;
  }
};

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    currentUser: null,
    mockUsers: readMockUsers(),
    loginError: null,
  },
  reducers: {
    rehydrateAuth: (state) => {
      if (typeof window === 'undefined') return;
      state.currentUser = readStoredUser();
      state.mockUsers = readMockUsers();
    },
    login: (state, action) => {
      const { email, password } = action.payload;
      const found = state.mockUsers.find(
        (u) => u.email === email && u.password === password
      );
      if (found) {
        state.currentUser = found;
        state.loginError = null;
        if (typeof window !== 'undefined') {
          localStorage.setItem('wm_current_user', JSON.stringify(found));
        }
      } else {
        state.loginError = 'Invalid email or password';
      }
    },
    logout: (state) => {
      state.currentUser = null;
      state.loginError = null;
      if (typeof window !== 'undefined') {
        localStorage.removeItem('wm_current_user');
      }
    },
    clearLoginError: (state) => {
      state.loginError = null;
    },
    switchUser: (state, action) => {
      const found = state.mockUsers.find((u) => u.id === action.payload);
      if (found) {
        state.currentUser = found;
        if (typeof window !== 'undefined') {
          localStorage.setItem('wm_current_user', JSON.stringify(found));
        }
      }
    },
    registerUser: (state, action) => {
      const { name, email, password } = action.payload;
      const id = `u_${Date.now()}`;
      const initials = name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || 'U';
      const newUser = { id, name, email, password, role: 'owner', initials };
      state.mockUsers.push(newUser);
      state.currentUser = newUser;
      state.loginError = null;
      if (typeof window !== 'undefined') {
        localStorage.setItem('wm_current_user', JSON.stringify(newUser));
        localStorage.setItem('wm_mock_users', JSON.stringify(state.mockUsers));
      }
    },
    updateProfile: (state, action) => {
      const { name, email, avatarUrl } = action.payload;
      if (state.currentUser) {
        state.currentUser.name = name;
        state.currentUser.email = email;
        if (avatarUrl !== undefined) state.currentUser.avatarUrl = avatarUrl;
        state.currentUser.initials = name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || 'U';
        const idx = state.mockUsers.findIndex(u => u.id === state.currentUser.id);
        if (idx !== -1) {
          state.mockUsers[idx] = state.currentUser;
        }
        if (typeof window !== 'undefined') {
          localStorage.setItem('wm_current_user', JSON.stringify(state.currentUser));
          localStorage.setItem('wm_mock_users', JSON.stringify(state.mockUsers));
        }
      }
    },
    inviteUser: (state, action) => {
      const { email, role } = action.payload;
      const id = `u_${Date.now()}`;
      const name = email.split('@')[0];
      const initials = name.slice(0, 2).toUpperCase();
      const newUser = { id, name, email, password: 'password', role, initials };
      state.mockUsers.push(newUser);
      if (typeof window !== 'undefined') {
        localStorage.setItem('wm_mock_users', JSON.stringify(state.mockUsers));
      }
    },
    updateRole: (state, action) => {
      const { userId, role } = action.payload;
      const user = state.mockUsers.find(u => u.id === userId);
      if (user) {
        user.role = role;
        if (state.currentUser?.id === userId) {
          state.currentUser.role = role;
          if (typeof window !== 'undefined') {
            localStorage.setItem('wm_current_user', JSON.stringify(state.currentUser));
          }
        }
        if (typeof window !== 'undefined') {
          localStorage.setItem('wm_mock_users', JSON.stringify(state.mockUsers));
        }
      }
    },
  },
});

export const { rehydrateAuth, login, logout, switchUser, clearLoginError, registerUser, updateProfile, inviteUser, updateRole } = authSlice.actions;
export default authSlice.reducer;
