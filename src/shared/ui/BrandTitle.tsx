import React from 'react';
import { Link } from 'react-router-dom';

type BrandTitleProps = {
  asLink?: boolean;
};

export const BrandTitle: React.FC<BrandTitleProps> = ({ asLink = false }) => {
  const content = (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2 }}>
      <span>Хрон</span>
      <img src="/logo192.png" alt="" aria-hidden="true" style={{ width: '1em', height: '1em', verticalAlign: 'middle' }} />
      <span>ниндзя</span>
    </span>
  );
  if (asLink) {
    return (
      <Link to="/menu" style={{ color: 'inherit', textDecoration: 'none' }} aria-label="Перейти в меню">
        {content}
      </Link>
    );
  }
  return content;
};


