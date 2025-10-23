import React from 'react';
import StoryCardSkeleton from './StoryCardSkeleton';
import { Button } from '../ui/button';

/**
 * Skeleton placeholder for the entire library page
 * @param {Object} props - Component props
 * @param {number} props.count - Number of skeleton cards to show
 */
const LibrarySkeleton = ({ count = 6 }) => {
  return (
    <div className="container max-w-6xl mx-auto p-6">
      {/* Header skeleton */}
      <div className="flex items-center justify-between mb-8">
        <div className="space-y-2">
          <div className="h-8 bg-gray-200 rounded w-48 animate-pulse"></div>
          <div className="h-4 bg-gray-200 rounded w-64 animate-pulse"></div>
        </div>
        <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
      </div>
      
      {/* Filter skeleton */}
      <div className="mb-6 space-y-4">
        <div className="flex gap-4">
          <div className="h-10 bg-gray-200 rounded flex-1 max-w-sm animate-pulse"></div>
          <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
          <div className="h-10 bg-gray-200 rounded w-32 animate-pulse"></div>
        </div>
      </div>
      
      {/* Grid skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {Array.from({ length: count }, (_, i) => (
          <StoryCardSkeleton key={`skeleton-${i}`} />
        ))}
      </div>
      
      {/* Pagination skeleton */}
      <div className="flex justify-center items-center gap-2 mt-8">
        <div className="h-8 bg-gray-200 rounded w-16 animate-pulse"></div>
        <div className="h-8 bg-gray-200 rounded w-8 animate-pulse"></div>
        <div className="h-8 bg-gray-200 rounded w-8 animate-pulse"></div>
        <div className="h-8 bg-gray-200 rounded w-8 animate-pulse"></div>
        <div className="h-8 bg-gray-200 rounded w-16 animate-pulse"></div>
      </div>
    </div>
  );
};

export default LibrarySkeleton;