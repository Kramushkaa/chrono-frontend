import React from 'react';
import { Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';

export default function NotFoundPage() {
  return (
    <div className="app" id="chrononinja-app" role="main" aria-label="Страница не найдена">
      <Helmet>
        <title>Страница не найдена — Хронониндзя</title>
        <meta name="robots" content="noindex, nofollow" />
      </Helmet>
      <div style={{ maxWidth: 720, margin: '60px auto', padding: '0 16px', textAlign: 'center' }}>
        <h1>404 — Страница не найдена</h1>
        <p>Похоже, такой страницы нет. Перейдите к временной линии и продолжите путешествие по истории.</p>
        <Link to="/timeline" style={{ color: '#cd853f', fontWeight: 600 }}>Перейти к временной линии</Link>
      </div>
    </div>
  );
}


