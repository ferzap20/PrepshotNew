import { RouterProvider } from 'react-router';
import { router } from './routes';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AppSettingsProvider } from '@/contexts/AppSettingsContext';
import { ToastProvider } from '@/contexts/ToastContext';
import { ToastContainer } from '@/components/ui/ToastContainer';
import { ErrorBoundary } from '@/components/ErrorBoundary';

export function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <AppSettingsProvider>
            <ToastProvider>
              <RouterProvider router={router} />
              <ToastContainer />
            </ToastProvider>
          </AppSettingsProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
