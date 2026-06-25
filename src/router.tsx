import { createBrowserRouter, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import About from './pages/About';
import ProjectsIndex from './pages/ProjectsIndex';
import Project from './pages/Project';
import Contact from './pages/Contact';
import Privacy from './pages/Privacy';
import Accessibility from './pages/Accessibility';
import NotFound from './pages/NotFound';

export const router = createBrowserRouter([
  { path: '/', element: <Navigate to="/he" replace /> },
  {
    path: '/:lang',
    element: <Layout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'about', element: <About /> },
      { path: 'portfolio', element: <ProjectsIndex /> },
      { path: 'portfolio/:slug', element: <Project /> },
      { path: 'contact', element: <Contact /> },
      { path: 'privacy', element: <Privacy /> },
      { path: 'accessibility', element: <Accessibility /> },
      { path: '*', element: <NotFound /> },
    ],
  },
  { path: '*', element: <Navigate to="/he" replace /> },
]);
