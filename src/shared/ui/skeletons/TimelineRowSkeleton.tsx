import React from 'react';
import Skeleton from '../Skeleton';
import './TimelineRowSkeleton.css';

const TimelineRowSkeleton: React.FC = () => {
  return (
    <div className="timeline-row-skeleton">
      {/* Person year labels */}
      <div className="timeline-row-skeleton__year-labels">
        <Skeleton variant="text" height="14px" width="80px" />
      </div>

      {/* Person life bar */}
      <div className="timeline-row-skeleton__life-bar">
        <Skeleton variant="rectangle" height="20px" width="100%" />
      </div>

      {/* Achievement markers */}
      <div className="timeline-row-skeleton__achievement-markers">
        <Skeleton variant="circle" height="8px" width="8px" />
        <Skeleton variant="circle" height="8px" width="8px" />
        <Skeleton variant="circle" height="8px" width="8px" />
      </div>

      {/* Reign bars */}
      <div className="timeline-row-skeleton__reign-bars">
        <Skeleton variant="rectangle" height="12px" width="40%" />
      </div>
    </div>
  );
};

export default TimelineRowSkeleton;
