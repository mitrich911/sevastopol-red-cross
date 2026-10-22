import { StrictMode, lazy } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import '@fontsource-variable/golos-text/wght.css';
import './styles.css';

const Services = lazy(() => import('./pages/Services'));
const Help = lazy(() => import('./pages/Help'));
const Apply = lazy(() => import('./pages/Apply'));
const Documents = lazy(() => import('./pages/Documents'));
const Volunteers = lazy(() => import('./pages/Volunteers'));
const About = lazy(() => import('./pages/About'));
const Contacts = lazy(() => import('./pages/Contacts'));
const Privacy = lazy(() => import('./pages/Misc').then((m) => ({ default: m.Privacy })));
const NotFound = lazy(() => import('./pages/Misc').then((m) => ({ default: m.NotFound })));

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, '')}>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="services" element={<Services />} />
          <Route path="help" element={<Help />} />
          <Route path="apply" element={<Apply />} />
          <Route path="documents" element={<Documents />} />
          <Route path="volunteers" element={<Volunteers />} />
          <Route path="about" element={<About />} />
          <Route path="contacts" element={<Contacts />} />
          <Route path="privacy" element={<Privacy />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);
