import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Breadcrumbs } from 'shared/ui/Breadcrumbs';

export default function NotFoundPage() {
  return (
    <div className="app" id="chrononinja-app" role="main" aria-label="Страница не найдена">
      <Helmet>
        <title>Страница не найдена — Хронониндзя</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <Breadcrumbs />
      <div style={{ maxWidth: 720, margin: '60px auto', padding: '0 16px', textAlign: 'center' }}>
        <h1>404 — Страница не найдена</h1>
        <p>Похоже, такой страницы нет. Перейдите в меню и выберите нужный раздел.</p>
        <Link to="/menu" style={{ color: '#cd853f', fontWeight: 600 }}>Перейти в меню</Link>
      </div>
    </div>
  );
}


