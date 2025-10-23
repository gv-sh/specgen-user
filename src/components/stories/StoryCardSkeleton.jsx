import React from 'react';
import { Card, CardContent } from '../ui/card';

/**
 * Skeleton placeholder for StoryCard component
 * Shows animated placeholders while content is loading
 */
const StoryCardSkeleton = () => {
  return (
    <Card className="overflow-hidden animate-pulse">
      {/* Image skeleton */}
      <div className="w-full h-48 bg-gray-200"></div>
      
      <CardContent className="p-4 space-y-3">
        {/* Title skeleton */}
        <div className="space-y-2">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
        
        {/* Metadata skeleton */}
        <div className="flex justify-between items-center pt-2">
          <div className="h-3 bg-gray-200 rounded w-20"></div>
          <div className="h-3 bg-gray-200 rounded w-16"></div>
        </div>
        
        {/* Tags skeleton */}
        <div className="flex gap-2 pt-1">
          <div className="h-5 bg-gray-200 rounded-full w-12"></div>
          <div className="h-5 bg-gray-200 rounded-full w-16"></div>
        </div>
      </CardContent>
    </Card>
  );
};

export default StoryCardSkeleton;