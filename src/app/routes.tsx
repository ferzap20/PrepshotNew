/* eslint-disable react-refresh/only-export-components */
import { lazy, Suspense } from 'react';
import { createBrowserRouter } from 'react-router';
import { AppLayout } from '@/components/layout/AppLayout';
import { AuthGuard } from '@/components/guards/AuthGuard';
import { AdminGuard } from '@/components/guards/AdminGuard';

// Eagerly load auth + not-found pages (tiny, always needed)
import { LoginPage } from '@/pages/LoginPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { NotFoundPage } from '@/pages/NotFoundPage';

// Lazy-load all app pages for route-level code splitting
const HomePage = lazy(() => import('@/pages/HomePage').then((m) => ({ default: m.HomePage })));
const ProjectsPage = lazy(() => import('@/pages/ProjectsPage').then((m) => ({ default: m.ProjectsPage })));
const ProjectDetailPage = lazy(() => import('@/pages/ProjectDetailPage').then((m) => ({ default: m.ProjectDetailPage })));
const ProjectListPage = lazy(() => import('@/pages/ProjectListPage').then((m) => ({ default: m.ProjectListPage })));
const ShootingDaysPage = lazy(() => import('@/pages/ShootingDaysPage').then((m) => ({ default: m.ShootingDaysPage })));
const ShootingDayPage = lazy(() => import('@/pages/ShootingDayPage').then((m) => ({ default: m.ShootingDayPage })));
const TemplatesPage = lazy(() => import('@/pages/TemplatesPage').then((m) => ({ default: m.TemplatesPage })));
const CatalogPage = lazy(() => import('@/pages/CatalogPage').then((m) => ({ default: m.CatalogPage })));
const MyGearPage = lazy(() => import('@/pages/MyGearPage').then((m) => ({ default: m.MyGearPage })));
const RentalSourcesPage = lazy(() => import('@/pages/RentalSourcesPage').then((m) => ({ default: m.RentalSourcesPage })));
const SettingsPage = lazy(() => import('@/pages/SettingsPage').then((m) => ({ default: m.SettingsPage })));
const AdminPage = lazy(() => import('@/pages/AdminPage').then((m) => ({ default: m.AdminPage })));

function PageLoader() {
  return (
    <div className="flex items-center justify-center min-h-[200px]">
      <div className="w-6 h-6 rounded-full border-2 border-primary border-t-transparent animate-spin" />
    </div>
  );
}

function page(element: React.ReactNode) {
  return <Suspense fallback={<PageLoader />}>{element}</Suspense>;
}

export const router = createBrowserRouter([
  {
    path: '/login',
    element: <LoginPage />,
  },
  {
    path: '/register',
    element: <RegisterPage />,
  },
  {
    path: '/',
    element: (
      <AuthGuard>
        <AppLayout />
      </AuthGuard>
    ),
    children: [
      { index: true, element: page(<HomePage />), handle: { filename: 'HomePage.tsx' } },
      { path: 'projects', element: page(<ProjectsPage />), handle: { filename: 'ProjectsPage.tsx' } },
      { path: 'projects/:projectId', element: page(<ProjectDetailPage />), handle: { filename: 'ProjectDetailPage.tsx' } },
      { path: 'projects/:projectId/list', element: page(<ProjectListPage />), handle: { filename: 'ProjectListPage.tsx' } },
      { path: 'projects/:projectId/days', element: page(<ShootingDaysPage />), handle: { filename: 'ShootingDaysPage.tsx' } },
      { path: 'projects/:projectId/days/:dayId', element: page(<ShootingDayPage />), handle: { filename: 'ShootingDayPage.tsx' } },
      { path: 'templates', element: page(<TemplatesPage />), handle: { filename: 'TemplatesPage.tsx' } },
      { path: 'catalog', element: page(<CatalogPage />), handle: { filename: 'CatalogPage.tsx' } },
      { path: 'my-gear', element: page(<MyGearPage />), handle: { filename: 'MyGearPage.tsx' } },
      { path: 'rental-sources', element: page(<RentalSourcesPage />), handle: { filename: 'RentalSourcesPage.tsx' } },
      { path: 'settings', element: page(<SettingsPage />), handle: { filename: 'SettingsPage.tsx' } },
      {
        path: 'admin',
        handle: { filename: 'AdminPage.tsx' },
        element: (
          <AdminGuard>
            {page(<AdminPage />)}
          </AdminGuard>
        ),
      },
    ],
  },
  { path: '*', element: <NotFoundPage /> },
]);
