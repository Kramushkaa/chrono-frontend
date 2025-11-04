# План реализации социальных функций - Frontend

Дата создания: 1 ноября 2025

## 📋 Обзор

Frontend реализация для социальных функций Хронониндзя: бейджи, публичные списки, профили, стрики.

> **Backend план:** См. `chronoline-backend-only/SOCIAL_FEATURES_ROADMAP.md`

---

## 🏗️ Архитектура frontend

### Структура проекта

```
src/
├── features/
│   ├── badges/
│   │   ├── components/
│   │   │   ├── BadgeCard.tsx
│   │   │   ├── BadgeGrid.tsx
│   │   │   ├── BadgeNotification.tsx
│   │   │   ├── BadgeProgress.tsx
│   │   │   └── BadgeTooltip.tsx
│   │   ├── pages/
│   │   │   ├── BadgesPage.tsx
│   │   │   └── BadgeDetailPage.tsx
│   │   ├── hooks/
│   │   │   ├── useBadges.ts
│   │   │   └── useUserBadges.ts
│   │   └── utils/
│   │       └── badgeHelpers.ts
│   │
│   ├── public-lists/
│   │   ├── components/
│   │   │   ├── ListCard.tsx
│   │   │   ├── ListCatalog.tsx
│   │   │   ├── ListComments.tsx
│   │   │   ├── CommentItem.tsx
│   │   │   ├── PublishListModal.tsx
│   │   │   └── ListStats.tsx
│   │   ├── pages/
│   │   │   ├── PublicListsPage.tsx
│   │   │   └── ListDetailPage.tsx
│   │   └── hooks/
│   │       ├── usePublicLists.ts
│   │       ├── useListComments.ts
│   │       └── useListLikes.ts
│   │
│   ├── profiles/
│   │   ├── components/
│   │   │   ├── ProfileHeader.tsx
│   │   │   ├── ProfileStats.tsx
│   │   │   ├── ActivityFeed.tsx
│   │   │   ├── FollowButton.tsx
│   │   │   ├── UserBadgesSection.tsx
│   │   │   ├── UserListsSection.tsx
│   │   │   └── EditProfileModal.tsx
│   │   ├── pages/
│   │   │   ├── UserProfilePage.tsx
│   │   │   ├── EditProfilePage.tsx
│   │   │   ├── FollowersPage.tsx
│   │   │   └── FollowingPage.tsx
│   │   └── hooks/
│   │       ├── useUserProfile.ts
│   │       ├── useFollow.ts
│   │       └── useUserActivity.ts
│   │
│   └── streaks/
│       ├── components/
│       │   ├── StreakWidget.tsx
│       │   ├── StreakStats.tsx
│       │   ├── ActivityCalendar.tsx
│       │   └── StreakLeaderboard.tsx
│       └── hooks/
│           ├── useStreak.ts
│           └── useActivityCalendar.ts
│
└── shared/
    ├── api/
    │   ├── badges.ts
    │   ├── publicLists.ts
    │   ├── profiles.ts
    │   └── streaks.ts
    ├── context/
    │   └── SocialContext.tsx
    └── types/
        └── social.ts
```

---

## 🎨 1. Система достижений (Badges)

### API клиент

```typescript
// src/shared/api/badges.ts
import { apiData } from './core';

export interface Badge {
  id: number;
  code: string;
  title: string;
  description: string;
  iconUrl: string | null;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  category: 'quiz' | 'social' | 'content' | 'special';
  points: number;
}

export interface UserBadge {
  id: number;
  badgeId: number;
  earnedAt: Date;
  progress?: Record<string, unknown>;
  badge: Badge;
}

export const badgesApi = {
  // Получить все достижения
  getAllBadges: () => apiData<Badge[]>('/api/badges'),
  
  // Получить достижения пользователя
  getUserBadges: (userId: number) => 
    apiData<UserBadge[]>(`/api/users/${userId}/badges`),
  
  // Получить мои достижения
  getMyBadges: () => apiData<UserBadge[]>('/api/users/me/badges'),
  
  // Проверить новые достижения
  checkBadges: () => apiData<string[]>('/api/badges/check', {
    method: 'POST'
  }),
};
```

### Хуки

```typescript
// src/features/badges/hooks/useBadges.ts
import { useState, useEffect } from 'react';
import { badgesApi, Badge } from 'shared/api/badges';

export function useBadges() {
  const [badges, setBadges] = useState<Badge[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  useEffect(() => {
    let mounted = true;
    
    badgesApi.getAllBadges()
      .then(data => {
        if (mounted) {
          setBadges(data);
          setIsLoading(false);
        }
      })
      .catch(err => {
        if (mounted) {
          setError(err);
          setIsLoading(false);
        }
      });
    
    return () => { mounted = false; };
  }, []);
  
  return { badges, isLoading, error };
}

// src/features/badges/hooks/useUserBadges.ts
export function useUserBadges(userId?: number) {
  const [userBadges, setUserBadges] = useState<UserBadge[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    if (!userId) return;
    
    badgesApi.getUserBadges(userId)
      .then(setUserBadges)
      .finally(() => setIsLoading(false));
  }, [userId]);
  
  return { userBadges, isLoading };
}
```

### Компоненты

```typescript
// src/features/badges/components/BadgeCard.tsx
import React from 'react';
import { Badge } from 'shared/api/badges';
import './BadgeCard.css';

interface BadgeCardProps {
  badge: Badge;
  earned?: boolean;
  earnedAt?: Date;
  progress?: number; // 0-100
  showProgress?: boolean;
}

export function BadgeCard({ 
  badge, 
  earned = false, 
  earnedAt, 
  progress,
  showProgress = false 
}: BadgeCardProps) {
  const rarityColors = {
    common: '#6c757d',
    rare: '#0d6efd',
    epic: '#6f42c1',
    legendary: '#ffc107'
  };
  
  return (
    <div 
      className={`badge-card badge-card--${badge.rarity} ${earned ? 'badge-card--earned' : 'badge-card--locked'}`}
      style={{ borderColor: rarityColors[badge.rarity] }}
    >
      <div className="badge-card__icon">
        {badge.iconUrl ? (
          <img src={badge.iconUrl} alt={badge.title} />
        ) : (
          <span className="badge-card__icon-placeholder">🏆</span>
        )}
        {!earned && <div className="badge-card__lock">🔒</div>}
      </div>
      
      <div className="badge-card__content">
        <h3 className="badge-card__title">{badge.title}</h3>
        <p className="badge-card__description">{badge.description}</p>
        
        {earned && earnedAt && (
          <div className="badge-card__earned-date">
            Получено: {new Date(earnedAt).toLocaleDateString('ru-RU')}
          </div>
        )}
        
        {showProgress && !earned && progress !== undefined && (
          <div className="badge-card__progress">
            <div className="progress">
              <div 
                className="progress-bar" 
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="badge-card__progress-text">{progress}%</span>
          </div>
        )}
        
        <div className="badge-card__footer">
          <span className={`badge-card__rarity badge-card__rarity--${badge.rarity}`}>
            {badge.rarity}
          </span>
          <span className="badge-card__points">+{badge.points} очков</span>
        </div>
      </div>
    </div>
  );
}
```

```typescript
// src/features/badges/components/BadgeNotification.tsx
import React, { useEffect, useState } from 'react';
import { Badge } from 'shared/api/badges';
import './BadgeNotification.css';

interface BadgeNotificationProps {
  badge: Badge;
  onClose: () => void;
}

export function BadgeNotification({ badge, onClose }: BadgeNotificationProps) {
  const [visible, setVisible] = useState(false);
  
  useEffect(() => {
    // Анимация появления
    setTimeout(() => setVisible(true), 100);
    
    // Автозакрытие через 5 секунд
    const timer = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300);
    }, 5000);
    
    return () => clearTimeout(timer);
  }, [onClose]);
  
  return (
    <div className={`badge-notification ${visible ? 'badge-notification--visible' : ''}`}>
      <div className="badge-notification__content">
        <div className="badge-notification__icon">
          🎉
        </div>
        <div className="badge-notification__text">
          <h3>Новое достижение!</h3>
          <p className="badge-notification__title">{badge.title}</p>
          <p className="badge-notification__description">{badge.description}</p>
          <p className="badge-notification__points">+{badge.points} очков</p>
        </div>
        <button 
          className="badge-notification__close"
          onClick={() => {
            setVisible(false);
            setTimeout(onClose, 300);
          }}
        >
          ×
        </button>
      </div>
      <div className="badge-notification__animation">✨</div>
    </div>
  );
}
```

```typescript
// src/features/badges/pages/BadgesPage.tsx
import React, { useState } from 'react';
import { useBadges } from '../hooks/useBadges';
import { useUserBadges } from '../hooks/useUserBadges';
import { useAuthUser } from 'shared/context/AuthContext';
import { BadgeCard } from '../components/BadgeCard';
import { SEO } from 'shared/ui/SEO';
import './BadgesPage.css';

export function BadgesPage() {
  const { user } = useAuthUser();
  const { badges, isLoading: badgesLoading } = useBadges();
  const { userBadges, isLoading: userBadgesLoading } = useUserBadges(user?.id);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  
  const isLoading = badgesLoading || userBadgesLoading;
  
  const earnedBadgeIds = new Set(userBadges.map(ub => ub.badgeId));
  
  const filteredBadges = badges.filter(badge => 
    activeCategory === 'all' || badge.category === activeCategory
  );
  
  const earnedCount = badges.filter(b => earnedBadgeIds.has(b.id)).length;
  const totalPoints = userBadges.reduce((sum, ub) => sum + ub.badge.points, 0);
  
  return (
    <div className="badges-page">
      <SEO 
        title="Достижения - Хронониндзя"
        description="Система достижений и наград"
      />
      
      <div className="badges-page__header">
        <h1>🏆 Достижения</h1>
        {user && (
          <div className="badges-page__stats">
            <span>{earnedCount} / {badges.length} получено</span>
            <span>•</span>
            <span>{totalPoints} очков заработано</span>
          </div>
        )}
      </div>
      
      <div className="badges-page__filters">
        <button
          className={`filter-btn ${activeCategory === 'all' ? 'filter-btn--active' : ''}`}
          onClick={() => setActiveCategory('all')}
        >
          Все
        </button>
        <button
          className={`filter-btn ${activeCategory === 'quiz' ? 'filter-btn--active' : ''}`}
          onClick={() => setActiveCategory('quiz')}
        >
          🎓 Квизы
        </button>
        <button
          className={`filter-btn ${activeCategory === 'social' ? 'filter-btn--active' : ''}`}
          onClick={() => setActiveCategory('social')}
        >
          👥 Социальные
        </button>
        <button
          className={`filter-btn ${activeCategory === 'content' ? 'filter-btn--active' : ''}`}
          onClick={() => setActiveCategory('content')}
        >
          ✍️ Контент
        </button>
        <button
          className={`filter-btn ${activeCategory === 'special' ? 'filter-btn--active' : ''}`}
          onClick={() => setActiveCategory('special')}
        >
          ⭐ Особые
        </button>
      </div>
      
      {isLoading ? (
        <div className="badges-page__loading">Загрузка...</div>
      ) : (
        <div className="badges-page__grid">
          {filteredBadges.map(badge => {
            const userBadge = userBadges.find(ub => ub.badgeId === badge.id);
            return (
              <BadgeCard
                key={badge.id}
                badge={badge}
                earned={!!userBadge}
                earnedAt={userBadge?.earnedAt}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
```

### CSS

```css
/* src/features/badges/components/BadgeCard.css */
.badge-card {
  background: white;
  border: 2px solid #e0e0e0;
  border-radius: 12px;
  padding: 20px;
  transition: all 0.3s ease;
  position: relative;
}

.badge-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
}

.badge-card--locked {
  opacity: 0.6;
  filter: grayscale(80%);
}

.badge-card--earned {
  border-color: #28a745;
}

.badge-card__icon {
  position: relative;
  width: 80px;
  height: 80px;
  margin: 0 auto 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.badge-card__icon img {
  width: 100%;
  height: 100%;
  object-fit: contain;
}

.badge-card__icon-placeholder {
  font-size: 48px;
}

.badge-card__lock {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 32px;
}

.badge-card__title {
  font-size: 18px;
  font-weight: bold;
  margin-bottom: 8px;
  text-align: center;
}

.badge-card__description {
  font-size: 14px;
  color: #666;
  text-align: center;
  margin-bottom: 12px;
}

.badge-card__earned-date {
  font-size: 12px;
  color: #28a745;
  text-align: center;
  margin-bottom: 12px;
}

.badge-card__progress {
  margin-bottom: 12px;
}

.badge-card__progress-text {
  font-size: 12px;
  color: #666;
  display: block;
  text-align: center;
  margin-top: 4px;
}

.badge-card__footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 12px;
  border-top: 1px solid #e0e0e0;
}

.badge-card__rarity {
  font-size: 12px;
  font-weight: bold;
  text-transform: uppercase;
  padding: 4px 8px;
  border-radius: 4px;
}

.badge-card__rarity--common { background: #6c757d; color: white; }
.badge-card__rarity--rare { background: #0d6efd; color: white; }
.badge-card__rarity--epic { background: #6f42c1; color: white; }
.badge-card__rarity--legendary { background: #ffc107; color: #000; }

.badge-card__points {
  font-size: 14px;
  font-weight: bold;
  color: #28a745;
}

/* Badge Notification */
.badge-notification {
  position: fixed;
  top: 80px;
  right: -400px;
  width: 350px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 8px 24px rgba(0,0,0,0.2);
  z-index: 9999;
  transition: right 0.3s ease;
  animation: badge-glow 2s infinite;
}

.badge-notification--visible {
  right: 20px;
}

@keyframes badge-glow {
  0%, 100% { box-shadow: 0 8px 24px rgba(0,0,0,0.2); }
  50% { box-shadow: 0 8px 32px rgba(102, 126, 234, 0.4); }
}

.badge-notification__content {
  display: flex;
  gap: 16px;
  align-items: flex-start;
}

.badge-notification__icon {
  font-size: 48px;
  animation: bounce 1s ease infinite;
}

@keyframes bounce {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-10px); }
}

.badge-notification__text h3 {
  margin: 0 0 8px;
  font-size: 18px;
}

.badge-notification__title {
  font-size: 16px;
  font-weight: bold;
  margin: 0 0 4px;
}

.badge-notification__description {
  font-size: 14px;
  opacity: 0.9;
  margin: 0 0 8px;
}

.badge-notification__points {
  font-size: 14px;
  font-weight: bold;
  color: #ffd700;
  margin: 0;
}

.badge-notification__close {
  position: absolute;
  top: 10px;
  right: 10px;
  background: rgba(255,255,255,0.2);
  border: none;
  color: white;
  font-size: 24px;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  cursor: pointer;
  transition: background 0.2s;
}

.badge-notification__close:hover {
  background: rgba(255,255,255,0.3);
}

.badge-notification__animation {
  position: absolute;
  top: -20px;
  right: 50%;
  font-size: 32px;
  animation: sparkle 2s ease-in-out infinite;
}

@keyframes sparkle {
  0%, 100% { transform: translateY(0) scale(1); opacity: 1; }
  50% { transform: translateY(-20px) scale(1.2); opacity: 0.5; }
}
```

---

## 📚 2. Публичные списки

### API клиент

```typescript
// src/shared/api/publicLists.ts
export interface PublicList {
  id: number;
  title: string;
  description: string | null;
  shareCode: string;
  visibility: 'private' | 'public' | 'unlisted';
  viewsCount: number;
  likesCount: number;
  commentsCount: number;
  itemsCount: number;
  owner: {
    id: number;
    username: string;
    avatarUrl: string | null;
  };
  createdAt: Date;
  updatedAt: Date;
  isLiked?: boolean; // для текущего пользователя
}

export interface ListComment {
  id: number;
  listId: number;
  userId: number;
  user: {
    username: string;
    avatarUrl: string | null;
  };
  content: string;
  parentCommentId: number | null;
  likesCount: number;
  isLiked?: boolean;
  isEdited: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export const publicListsApi = {
  // Получить публичные списки
  getPublicLists: (params?: {
    limit?: number;
    offset?: number;
    sortBy?: 'recent' | 'popular' | 'likes';
  }) => apiData<{ lists: PublicList[]; total: number }>('/api/lists/public', {
    params
  }),
  
  // Получить список по share code
  getListByShareCode: (shareCode: string) => 
    apiData<PublicList>(`/api/lists/public/${shareCode}`),
  
  // Опубликовать список
  publishList: (listId: number, description?: string) =>
    apiData<{ shareCode: string }>(`/api/lists/${listId}/publish`, {
      method: 'POST',
      body: { description }
    }),
  
  // Изменить видимость
  updateVisibility: (listId: number, visibility: 'private' | 'public' | 'unlisted') =>
    apiData(`/api/lists/${listId}/visibility`, {
      method: 'PUT',
      body: { visibility }
    }),
  
  // Лайки
  likeList: (listId: number) => 
    apiData(`/api/lists/${listId}/like`, { method: 'POST' }),
  
  unlikeList: (listId: number) =>
    apiData(`/api/lists/${listId}/like`, { method: 'DELETE' }),
  
  // Комментарии
  getComments: (listId: number, params?: { limit?: number; offset?: number }) =>
    apiData<ListComment[]>(`/api/lists/${listId}/comments`, { params }),
  
  addComment: (listId: number, content: string, parentId?: number) =>
    apiData<ListComment>(`/api/lists/${listId}/comments`, {
      method: 'POST',
      body: { content, parentCommentId: parentId }
    }),
  
  updateComment: (listId: number, commentId: number, content: string) =>
    apiData(`/api/lists/${listId}/comments/${commentId}`, {
      method: 'PUT',
      body: { content }
    }),
  
  deleteComment: (listId: number, commentId: number) =>
    apiData(`/api/lists/${listId}/comments/${commentId}`, {
      method: 'DELETE'
    }),
  
  likeComment: (listId: number, commentId: number) =>
    apiData(`/api/lists/${listId}/comments/${commentId}/like`, {
      method: 'POST'
    }),
  
  unlikeComment: (listId: number, commentId: number) =>
    apiData(`/api/lists/${listId}/comments/${commentId}/like`, {
      method: 'DELETE'
    }),
};
```

### Компоненты

```typescript
// src/features/public-lists/components/ListCard.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import { PublicList } from 'shared/api/publicLists';
import './ListCard.css';

interface ListCardProps {
  list: PublicList;
}

export function ListCard({ list }: ListCardProps) {
  return (
    <Link to={`/lists/public/${list.shareCode}`} className="list-card">
      <div className="list-card__header">
        <div className="list-card__owner">
          {list.owner.avatarUrl ? (
            <img src={list.owner.avatarUrl} alt={list.owner.username} />
          ) : (
            <div className="list-card__owner-placeholder">👤</div>
          )}
          <span>@{list.owner.username}</span>
        </div>
        <div className="list-card__date">
          {formatRelativeDate(list.createdAt)}
        </div>
      </div>
      
      <h3 className="list-card__title">⭐ {list.title}</h3>
      
      {list.description && (
        <p className="list-card__description">{list.description}</p>
      )}
      
      <div className="list-card__stats">
        <span title="Просмотры">👁 {list.viewsCount}</span>
        <span title="Лайки">❤️ {list.likesCount}</span>
        <span title="Комментарии">💬 {list.commentsCount}</span>
        <span title="Элементов">📝 {list.itemsCount}</span>
      </div>
    </Link>
  );
}
```

```typescript
// src/features/public-lists/pages/PublicListsPage.tsx
import React, { useState, useEffect } from 'react';
import { publicListsApi, PublicList } from 'shared/api/publicLists';
import { ListCard } from '../components/ListCard';
import { SEO } from 'shared/ui/SEO';
import './PublicListsPage.css';

export function PublicListsPage() {
  const [lists, setLists] = useState<PublicList[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'likes'>('recent');
  
  useEffect(() => {
    setIsLoading(true);
    publicListsApi.getPublicLists({ sortBy })
      .then(data => {
        setLists(data.lists);
        setTotal(data.total);
      })
      .finally(() => setIsLoading(false));
  }, [sortBy]);
  
  return (
    <div className="public-lists-page">
      <SEO 
        title="Каталог списков - Хронониндзя"
        description="Списки исторических личностей, созданные сообществом"
      />
      
      <div className="public-lists-page__header">
        <h1>📚 Каталог Списков</h1>
        <p>Подборки исторических личностей от сообщества</p>
      </div>
      
      <div className="public-lists-page__filters">
        <select 
          value={sortBy} 
          onChange={e => setSortBy(e.target.value as any)}
          className="sort-select"
        >
          <option value="recent">Последние</option>
          <option value="popular">Популярные</option>
          <option value="likes">По лайкам</option>
        </select>
      </div>
      
      {isLoading ? (
        <div className="public-lists-page__loading">Загрузка...</div>
      ) : (
        <div className="public-lists-page__grid">
          {lists.map(list => (
            <ListCard key={list.id} list={list} />
          ))}
        </div>
      )}
      
      {!isLoading && lists.length === 0 && (
        <div className="public-lists-page__empty">
          Пока нет публичных списков. Будьте первым!
        </div>
      )}
    </div>
  );
}
```

---

## 👤 3. Публичные профили

### API клиент

```typescript
// src/shared/api/profiles.ts
export interface PublicProfile {
  id: number;
  username: string;
  fullName: string | null;
  avatarUrl: string | null;
  bio: string | null;
  location: string | null;
  websiteUrl: string | null;
  favoritePeriodStart: number | null;
  favoritePeriodEnd: number | null;
  favoriteCategories: string[] | null;
  totalQuizPoints: number;
  quizCount: number;
  perfectQuizzes: number;
  followersCount: number;
  followingCount: number;
  publicListsCount: number;
  badgesCount: number;
  approvedContributions: number;
  joinedAt: Date;
  isFollowing?: boolean; // для текущего пользователя
}

export const profilesApi = {
  // Получить профиль
  getProfile: (username: string) => 
    apiData<PublicProfile>(`/api/users/${username}/profile`),
  
  // Обновить свой профиль
  updateMyProfile: (data: Partial<PublicProfile>) =>
    apiData('/api/users/me/profile', {
      method: 'PUT',
      body: data
    }),
  
  // Подписки
  follow: (username: string) =>
    apiData(`/api/users/${username}/follow`, { method: 'POST' }),
  
  unfollow: (username: string) =>
    apiData(`/api/users/${username}/unfollow`, { method: 'DELETE' }),
  
  isFollowing: (username: string) =>
    apiData<{ isFollowing: boolean }>(`/api/users/${username}/is-following`),
  
  getFollowers: (username: string, params?: { limit?: number; offset?: number }) =>
    apiData(`/api/users/${username}/followers`, { params }),
  
  getFollowing: (username: string, params?: { limit?: number; offset?: number }) =>
    apiData(`/api/users/${username}/following`, { params }),
};
```

### Компоненты

```typescript
// src/features/profiles/components/ProfileHeader.tsx
import React from 'react';
import { PublicProfile } from 'shared/api/profiles';
import { FollowButton } from './FollowButton';
import './ProfileHeader.css';

interface ProfileHeaderProps {
  profile: PublicProfile;
  isOwnProfile: boolean;
}

export function ProfileHeader({ profile, isOwnProfile }: ProfileHeaderProps) {
  return (
    <div className="profile-header">
      <div className="profile-header__avatar">
        {profile.avatarUrl ? (
          <img src={profile.avatarUrl} alt={profile.username} />
        ) : (
          <div className="profile-header__avatar-placeholder">👤</div>
        )}
      </div>
      
      <div className="profile-header__info">
        <h1 className="profile-header__username">@{profile.username}</h1>
        {profile.fullName && (
          <h2 className="profile-header__fullname">{profile.fullName}</h2>
        )}
        
        {profile.location && (
          <div className="profile-header__location">
            📍 {profile.location}
          </div>
        )}
        
        {profile.websiteUrl && (
          <div className="profile-header__website">
            🌐 <a href={profile.websiteUrl} target="_blank" rel="noopener noreferrer">
              {profile.websiteUrl}
            </a>
          </div>
        )}
        
        {!isOwnProfile && (
          <FollowButton 
            username={profile.username}
            initialFollowing={profile.isFollowing}
          />
        )}
        
        {isOwnProfile && (
          <button className="btn btn-primary">✏️ Редактировать профиль</button>
        )}
      </div>
      
      {profile.bio && (
        <div className="profile-header__bio">
          {profile.bio}
        </div>
      )}
      
      <div className="profile-header__stats">
        <div className="profile-stat">
          <strong>{profile.badgesCount}</strong>
          <span>достижений</span>
        </div>
        <div className="profile-stat">
          <strong>{profile.followersCount}</strong>
          <span>подписчиков</span>
        </div>
        <div className="profile-stat">
          <strong>{profile.followingCount}</strong>
          <span>подписок</span>
        </div>
        <div className="profile-stat">
          <strong>{profile.publicListsCount}</strong>
          <span>списков</span>
        </div>
        <div className="profile-stat">
          <strong>{profile.totalQuizPoints}</strong>
          <span>очков в квизах</span>
        </div>
        <div className="profile-stat">
          <strong>{profile.approvedContributions}</strong>
          <span>вкладов</span>
        </div>
      </div>
    </div>
  );
}
```

---

## 🔥 4. Стрики

### API клиент

```typescript
// src/shared/api/streaks.ts
export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: Date;
  totalActiveDays: number;
  bonus: number; // множитель очков
}

export const streaksApi = {
  getMyStreak: () => apiData<StreakData>('/api/users/me/streak'),
  
  getUserStreak: (username: string) => 
    apiData<StreakData>(`/api/users/${username}/streak`),
  
  getTopStreaks: (limit: number = 10) =>
    apiData<Array<{ username: string; currentStreak: number }>>('/api/streaks/leaderboard', {
      params: { limit }
    }),
};
```

### Компоненты

```typescript
// src/features/streaks/components/StreakWidget.tsx
import React, { useEffect, useState } from 'react';
import { streaksApi, StreakData } from 'shared/api/streaks';
import { useAuthUser } from 'shared/context/AuthContext';
import './StreakWidget.css';

export function StreakWidget() {
  const { isAuthenticated } = useAuthUser();
  const [streak, setStreak] = useState<StreakData | null>(null);
  
  useEffect(() => {
    if (!isAuthenticated) return;
    
    streaksApi.getMyStreak()
      .then(setStreak)
      .catch(() => {});
  }, [isAuthenticated]);
  
  if (!isAuthenticated || !streak) return null;
  
  const emoji = streak.currentStreak >= 30 ? '🔥🔥🔥' :
                streak.currentStreak >= 7 ? '🔥🔥' : '🔥';
  
  return (
    <div className="streak-widget">
      <div className="streak-widget__icon">{emoji}</div>
      <div className="streak-widget__content">
        <div className="streak-widget__current">
          {streak.currentStreak} {pluralize(streak.currentStreak, 'день', 'дня', 'дней')} подряд
        </div>
        {streak.longestStreak > streak.currentStreak && (
          <div className="streak-widget__best">
            Лучший: {streak.longestStreak}
          </div>
        )}
        {streak.bonus > 0 && (
          <div className="streak-widget__bonus">
            +{Math.round(streak.bonus * 100)}% к очкам!
          </div>
        )}
      </div>
    </div>
  );
}

function pluralize(n: number, one: string, few: string, many: string): string {
  if (n % 10 === 1 && n % 100 !== 11) return one;
  if (n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20)) return few;
  return many;
}
```

---

## 🎯 Интеграция

### Автоматическая проверка бейджей

```typescript
// src/shared/utils/badgeChecker.ts
import { badgesApi } from 'shared/api/badges';
import { Badge } from 'shared/api/badges';

let notificationQueue: Badge[] = [];
let isChecking = false;

export async function checkAndNotifyBadges() {
  if (isChecking) return;
  isChecking = true;
  
  try {
    const newBadgeCodes = await badgesApi.checkBadges();
    
    if (newBadgeCodes.length > 0) {
      // Получить полную информацию о бейджах
      const allBadges = await badgesApi.getAllBadges();
      const newBadges = allBadges.filter(b => newBadgeCodes.includes(b.code));
      
      // Добавить в очередь уведомлений
      notificationQueue.push(...newBadges);
      
      // Показать первое уведомление
      showNextBadgeNotification();
    }
  } finally {
    isChecking = false;
  }
}

function showNextBadgeNotification() {
  if (notificationQueue.length === 0) return;
  
  const badge = notificationQueue.shift()!;
  
  // Создать и показать уведомление
  // (реализация зависит от вашей системы уведомлений)
  const event = new CustomEvent('badge-earned', { detail: badge });
  window.dispatchEvent(event);
}

// Вызывать после важных действий
export function triggerBadgeCheck() {
  // Debounce для избежания частых проверок
  setTimeout(() => checkAndNotifyBadges(), 1000);
}
```

### Использование в компонентах

```typescript
// В компоненте результатов квиза
import { triggerBadgeCheck } from 'shared/utils/badgeChecker';

function QuizResults({ result }: QuizResultsProps) {
  useEffect(() => {
    // После показа результатов проверить бейджи
    triggerBadgeCheck();
  }, []);
  
  // ...
}
```

### Глобальный обработчик уведомлений

```typescript
// src/App.tsx
import { BadgeNotification } from 'features/badges/components/BadgeNotification';

function App() {
  const [earnedBadges, setEarnedBadges] = useState<Badge[]>([]);
  
  useEffect(() => {
    const handleBadgeEarned = (e: CustomEvent<Badge>) => {
      setEarnedBadges(prev => [...prev, e.detail]);
    };
    
    window.addEventListener('badge-earned', handleBadgeEarned as any);
    
    return () => {
      window.removeEventListener('badge-earned', handleBadgeEarned as any);
    };
  }, []);
  
  const handleCloseNotification = (badge: Badge) => {
    setEarnedBadges(prev => prev.filter(b => b.id !== badge.id));
  };
  
  return (
    <>
      {/* Основное приложение */}
      <Routes>...</Routes>
      
      {/* Уведомления о бейджах */}
      {earnedBadges.map(badge => (
        <BadgeNotification
          key={badge.id}
          badge={badge}
          onClose={() => handleCloseNotification(badge)}
        />
      ))}
    </>
  );
}
```

---

## 🛣️ Маршруты

Добавить в `App.tsx`:

```typescript
// Badges
<Route path="/badges" element={<BadgesPage />} />

// Public Lists
<Route path="/lists/public" element={<PublicListsPage />} />
<Route path="/lists/public/:shareCode" element={<ListDetailPage />} />

// Profiles
<Route path="/users/:username" element={<UserProfilePage />} />
<Route path="/users/:username/followers" element={<FollowersPage />} />
<Route path="/users/:username/following" element={<FollowingPage />} />
<Route path="/profile/edit" element={<EditProfilePage />} />
```

---

## ✅ Чеклист реализации

### Badges
- [ ] API клиент
- [ ] Хуки (useBadges, useUserBadges)
- [ ] BadgeCard компонент
- [ ] BadgeNotification компонент
- [ ] BadgesPage
- [ ] Автоматическая проверка бейджей
- [ ] CSS и анимации

### Public Lists
- [ ] API клиент
- [ ] Хуки
- [ ] ListCard компонент
- [ ] PublicListsPage
- [ ] ListDetailPage
- [ ] Комментарии компонент
- [ ] PublishListModal

### Profiles
- [ ] API клиент
- [ ] ProfileHeader компонент
- [ ] FollowButton компонент
- [ ] UserProfilePage
- [ ] EditProfilePage
- [ ] ActivityFeed компонент

### Streaks
- [ ] API клиент
- [ ] StreakWidget компонент
- [ ] Интеграция в header
- [ ] ActivityCalendar (опционально)

---

## 🎨 UI/UX рекомендации

1. **Анимации** - плавные переходы и микроанимации
2. **Feedback** - мгновенный отклик на действия (optimistic updates)
3. **Loading states** - скелетоны вместо спиннеров где возможно
4. **Mobile-first** - все компоненты адаптивные
5. **Accessibility** - ARIA атрибуты, keyboard navigation

---

**Создано:** 1 ноября 2025  
**Версия:** 1.0  
**Связанный документ:** `chronoline-backend-only/SOCIAL_FEATURES_ROADMAP.md`

