import React from 'react';
import Skeleton from '../Skeleton';
import './ListItemSkeleton.css';

interface ListItemSkeletonProps {
  /** Режим отображения: список или карточка */
  isListMode?: boolean;
}

const ListItemSkeleton: React.FC<ListItemSkeletonProps> = ({ isListMode = false }) => {
  if (isListMode) {
    return (
      <div className="list-item-skeleton list-item-skeleton--list">
        {/* List mode: compact horizontal layout */}
        <div className="list-item-skeleton__content">
          <Skeleton variant="text" height="18px" width="200px" />
          <Skeleton variant="text" height="14px" width="80px" />
        </div>
        <div className="list-item-skeleton__actions">
          <Skeleton variant="rectangle" height="32px" width="100px" />
        </div>
      </div>
    );
  }

  return (
    <div className="list-item-skeleton">
      {/* Card mode: vertical layout */}
      <div className="list-item-skeleton__header">
        <Skeleton variant="text" height="20px" width="70%" />
        <Skeleton variant="text" height="16px" width="30%" />
      </div>
      
      <div className="list-item-skeleton__body">
        <Skeleton variant="text" lines={2} />
      </div>
      
      <div className="list-item-skeleton__footer">
        <Skeleton variant="text" height="14px" width="60px" />
        <Skeleton variant="rectangle" height="36px" width="120px" />
      </div>
    </div>
  );
};

export default ListItemSkeleton;
