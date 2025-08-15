import React from 'react';
import { useLocation, Link } from 'react-router-dom';

interface BreadcrumbItem {
  label: string;
  path: string;
  isActive?: boolean;
}

export function Breadcrumbs() {
  const location = useLocation();
  
  const getBreadcrumbs = (): BreadcrumbItem[] => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [];
    
    // Главная страница
    breadcrumbs.push({
      label: 'Главная',
      path: '/',
      isActive: pathSegments.length === 0
    });
    
    // Динамические сегменты
    let currentPath = '';
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      
      let label = '';
      switch (segment) {
        case 'timeline':
          label = 'Таймлайн';
          break;
        case 'menu':
          label = 'Меню';
          break;
        case 'lists':
          label = 'Списки';
          break;
        case 'profile':
          label = 'Профиль';
          break;
        case 'register':
          label = 'Регистрация';
          break;
        default:
          label = segment.charAt(0).toUpperCase() + segment.slice(1);
      }
      
      breadcrumbs.push({
        label,
        path: currentPath,
        isActive: index === pathSegments.length - 1
      });
    });
    
    return breadcrumbs;
  };
  
  const breadcrumbs = getBreadcrumbs();
  
  // Не показываем крошки на главной странице
  if (breadcrumbs.length <= 1) {
    return null;
  }
  
  return (
    <nav 
      aria-label="Хлебные крошки" 
      className="breadcrumbs"
    >
      <ol>
        {breadcrumbs.map((item, index) => (
          <li key={item.path}>
            {index > 0 && (
              <span 
                aria-hidden="true"
                className="separator"
              >
                ›
              </span>
            )}
            {item.isActive ? (
              <span 
                aria-current="page"
              >
                {item.label}
              </span>
            ) : (
              <Link
                to={item.path === '/' ? '/menu' : item.path}
              >
                {item.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
