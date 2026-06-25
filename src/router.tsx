import { createBrowserRouter, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Portfolio from './pages/Portfolio';
import Project from './pages/Project';
import About from './pages/About';
import Services from './pages/Services';
import Process from './pages/Process';
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
      { path: 'portfolio', element: <Portfolio /> },
      { path: 'portfolio/:slug', element: <Project /> },
      { path: 'about', element: <About /> },
      { path: 'services', element: <Services /> },
      { path: 'process', element: <Process /> },
      { path: 'contact', element: <Contact /> },
      { path: 'privacy', element: <Privacy /> },
      { path: 'accessibility', element: <Accessibility /> },
      { path: '*', element: <NotFound /> },
    ],
  },
  { path: '*', element: <Navigate to="/he" replace /> },
]);
