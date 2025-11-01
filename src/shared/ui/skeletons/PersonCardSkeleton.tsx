import React from 'react';
import Skeleton from '../Skeleton';
import './PersonCardSkeleton.css';

const PersonCardSkeleton: React.FC = () => {
  return (
    <div className="person-card-skeleton">
      {/* Header with name */}
      <div className="person-card-skeleton__header">
        <Skeleton variant="rectangle" height="32px" />
      </div>

      {/* Main content area */}
      <div className="person-card-skeleton__content">
        {/* Avatar */}
        <Skeleton variant="circle" height="96px" width="96px" />
        
        {/* Text content */}
        <div className="person-card-skeleton__text">
          {/* Birth/Death years */}
          <Skeleton variant="text" height="18px" width="120px" />
          
          {/* Description lines */}
          <Skeleton variant="text" lines={2} />
          
          {/* Category */}
          <Skeleton variant="text" height="14px" width="80px" />
        </div>
      </div>

      {/* Achievements section */}
      <div className="person-card-skeleton__achievements">
        <Skeleton variant="text" height="16px" width="100px" />
        <div className="person-card-skeleton__achievements-list">
          <Skeleton variant="rectangle" height="60px" />
        </div>
      </div>
    </div>
  );
};

export default PersonCardSkeleton;



