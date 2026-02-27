import { RouterProvider } from 'react-router';
import { router } from './routes';
import { AuthProvider } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { AppSettingsProvider } from '@/contexts/AppSettingsContext';
import { ErrorBoundary } from '@/components/ErrorBoundary';

export function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <AuthProvider>
          <AppSettingsProvider>
            <RouterProvider router={router} />
          </AppSettingsProvider>
        </AuthProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}
