import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
import Login from './components/Login.tsx';
import { Provider } from 'react-redux';
import { store } from './redux/store.ts';
import { AuthProvider } from "./components/dashboard/AuthContext.tsx";
import Dashboard from './components/dashboard/Dashboard.tsx';
import Activities from './components/dashboard/Activities.tsx';
import DailyLog from './components/dashboard/DailyLog.tsx';
import Reports from './components/dashboard/Reports.tsx';
import Profile from './components/dashboard/Profile.tsx';
import Settings from './components/dashboard/Settings.tsx';
import HomePage from './components/HomePage.tsx';

const routes = createBrowserRouter([
  {
    path: '/',
    element: <HomePage />
  },
  {
    path: '/login',
    element: <Login />
  },
  {
    element: <App />,
    children: [
      { path: '/dashboard', element: <Dashboard /> },
      { path: '/activities', element: <Activities /> },
      { path: '/daily-log', element: <DailyLog /> },
      { path: '/reports', element: <Reports /> },
      { path: '/profile', element: <Profile /> },
      { path: '/settings', element: <Settings /> },
    ],
  },
  {
    path: '*',
    element: <Navigate to="/" replace />
  }
]);

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <AuthProvider>
        <RouterProvider router={routes} />
      </AuthProvider>
    </Provider>
  </StrictMode>,
)