import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import Home from './pages/Home';
import Services from './pages/Services';
import Help from './pages/Help';
import Apply from './pages/Apply';
import Documents from './pages/Documents';
import Volunteers from './pages/Volunteers';
import About from './pages/About';
import Contacts from './pages/Contacts';
import { NotFound, Privacy } from './pages/Misc';
import './styles.css';

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
