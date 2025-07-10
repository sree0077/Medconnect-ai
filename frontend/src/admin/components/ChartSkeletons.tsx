import React from 'react';

export const AreaChartSkeleton: React.FC = () => (
  <div className="animate-pulse">
    <div className="flex items-center justify-between mb-6">
      <div>
        <div className="h-6 bg-gray-200 rounded w-48 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-64"></div>
      </div>
      <div className="h-5 w-5 bg-gray-200 rounded"></div>
    </div>
    <div className="h-[300px] bg-gray-100 rounded-lg relative overflow-hidden">
      {/* Grid lines */}
      <div className="absolute inset-0 flex flex-col justify-between p-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-px bg-gray-200"></div>
        ))}
      </div>
      <div className="absolute inset-0 flex justify-between p-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="w-px bg-gray-200"></div>
        ))}
      </div>
      {/* Animated wave */}
      <div className="absolute bottom-4 left-4 right-4 h-32">
        <svg className="w-full h-full" viewBox="0 0 400 120">
          <path
            d="M0,60 Q100,20 200,40 T400,60 L400,120 L0,120 Z"
            fill="url(#gradient1)"
            className="opacity-30"
          >
            <animateTransform
              attributeName="transform"
              type="translate"
              values="-400,0;0,0;400,0"
              dur="3s"
              repeatCount="indefinite"
            />
          </path>
          <path
            d="M0,80 Q100,40 200,60 T400,80 L400,120 L0,120 Z"
            fill="url(#gradient2)"
            className="opacity-20"
          >
            <animateTransform
              attributeName="transform"
              type="translate"
              values="-400,0;0,0;400,0"
              dur="3.5s"
              repeatCount="indefinite"
            />
          </path>
          <defs>
            <linearGradient id="gradient1" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.1" />
            </linearGradient>
            <linearGradient id="gradient2" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#EC4899" stopOpacity="0.3" />
              <stop offset="100%" stopColor="#EC4899" stopOpacity="0.1" />
            </linearGradient>
          </defs>
        </svg>
      </div>
    </div>
  </div>
);

export const PieChartSkeleton: React.FC = () => (
  <div className="animate-pulse">
    <div className="flex items-center justify-between mb-6">
      <div>
        <div className="h-6 bg-gray-200 rounded w-48 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-56"></div>
      </div>
      <div className="h-5 w-5 bg-gray-200 rounded"></div>
    </div>
    <div className="h-[300px] bg-gray-100 rounded-lg flex items-center justify-center relative overflow-hidden">
      {/* Animated pie chart skeleton */}
      <div className="relative">
        <div className="w-40 h-40 rounded-full border-8 border-gray-200"></div>
        <div className="absolute inset-0 w-40 h-40 rounded-full border-8 border-transparent border-t-purple-300 animate-spin"></div>
        <div className="absolute inset-2 w-36 h-36 rounded-full border-6 border-transparent border-r-pink-300 animate-spin" style={{ animationDirection: 'reverse', animationDuration: '2s' }}></div>
        <div className="absolute inset-4 w-32 h-32 rounded-full border-4 border-transparent border-b-yellow-300 animate-spin" style={{ animationDuration: '3s' }}></div>
      </div>
      {/* Legend skeleton */}
      <div className="absolute bottom-4 left-4 space-y-2">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
            <div className="h-3 bg-gray-200 rounded w-16"></div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export const LineChartSkeleton: React.FC = () => (
  <div className="animate-pulse">
    <div className="flex items-center justify-between mb-6">
      <div>
        <div className="h-6 bg-gray-200 rounded w-40 mb-2"></div>
        <div className="h-4 bg-gray-200 rounded w-72"></div>
      </div>
    </div>
    <div className="h-[400px] bg-gray-100 rounded-lg relative overflow-hidden">
      {/* Grid lines */}
      <div className="absolute inset-0 flex flex-col justify-between p-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="h-px bg-gray-200"></div>
        ))}
      </div>
      <div className="absolute inset-0 flex justify-between p-4">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="w-px bg-gray-200"></div>
        ))}
      </div>
      {/* Animated lines */}
      <div className="absolute inset-4">
        <svg className="w-full h-full" viewBox="0 0 400 300">
          {/* Line 1 */}
          <polyline
            points="0,150 50,120 100,140 150,100 200,130 250,90 300,110 350,80 400,100"
            fill="none"
            stroke="#8B5CF6"
            strokeWidth="3"
            className="opacity-40"
            strokeDasharray="1000"
            strokeDashoffset="1000"
          >
            <animate
              attributeName="stroke-dashoffset"
              from="1000"
              to="0"
              dur="2s"
              repeatCount="indefinite"
            />
          </polyline>
          {/* Line 2 */}
          <polyline
            points="0,200 50,180 100,190 150,160 200,180 250,150 300,170 350,140 400,160"
            fill="none"
            stroke="#EC4899"
            strokeWidth="3"
            className="opacity-40"
            strokeDasharray="1000"
            strokeDashoffset="1000"
          >
            <animate
              attributeName="stroke-dashoffset"
              from="1000"
              to="0"
              dur="2.5s"
              repeatCount="indefinite"
            />
          </polyline>
          {/* Line 3 */}
          <polyline
            points="0,250 50,230 100,240 150,210 200,230 250,200 300,220 350,190 400,210"
            fill="none"
            stroke="#F59E0B"
            strokeWidth="3"
            className="opacity-40"
            strokeDasharray="1000"
            strokeDashoffset="1000"
          >
            <animate
              attributeName="stroke-dashoffset"
              from="1000"
              to="0"
              dur="3s"
              repeatCount="indefinite"
            />
          </polyline>
          {/* Animated dots */}
          {[...Array(9)].map((_, i) => (
            <circle
              key={i}
              cx={i * 50}
              cy={150 + Math.sin(i) * 30}
              r="4"
              fill="#8B5CF6"
              className="opacity-60"
            >
              <animate
                attributeName="opacity"
                values="0.6;1;0.6"
                dur="2s"
                repeatCount="indefinite"
                begin={`${i * 0.2}s`}
              />
            </circle>
          ))}
        </svg>
      </div>
    </div>
  </div>
);

export const MetricCardSkeleton: React.FC = () => (
  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 animate-pulse">
    <div className="flex items-center">
      <div className="p-3 rounded-lg bg-gray-200 w-12 h-12"></div>
      <div className="ml-4 flex-1">
        <div className="h-4 bg-gray-200 rounded w-24 mb-2"></div>
        <div className="h-8 bg-gray-200 rounded w-16 mb-1"></div>
        <div className="h-3 bg-gray-200 rounded w-20"></div>
      </div>
    </div>
  </div>
);

export const AIAnalyticsPageSkeleton: React.FC = () => (
  <div className="space-y-6 animate-pulse">
    {/* Header Skeleton */}
    <div className="mb-8">
      <div className="flex items-center justify-between">
        <div>
          <div className="h-9 bg-gradient-to-r from-purple-200 to-pink-200 rounded w-80 mb-2"></div>
          <div className="h-5 bg-gray-200 rounded w-96"></div>
        </div>
        <div className="flex items-center space-x-4">
          <div className="h-10 bg-gray-200 rounded w-32"></div>
          <div className="h-10 bg-purple-200 rounded w-24"></div>
        </div>
      </div>
    </div>

    {/* Key Metrics Skeleton */}
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <MetricCardSkeleton />
      <MetricCardSkeleton />
      <MetricCardSkeleton />
      <MetricCardSkeleton />
    </div>

    {/* Charts Row 1 Skeleton */}
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <AreaChartSkeleton />
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <PieChartSkeleton />
      </div>
    </div>

    {/* Performance Metrics Skeleton */}
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="h-6 bg-gray-200 rounded w-48 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-64"></div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
            <div className="h-4 bg-purple-200 rounded w-20 mx-auto mb-2"></div>
            <div className="h-8 bg-purple-200 rounded w-16 mx-auto mb-1"></div>
            <div className="h-3 bg-purple-200 rounded w-12 mx-auto"></div>
          </div>
        ))}
      </div>
    </div>

    {/* System Trends Chart Skeleton */}
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <LineChartSkeleton />
    </div>

    {/* Insights Section Skeleton */}
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="h-6 bg-gray-200 rounded w-64 mb-4"></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="p-4 bg-purple-50 rounded-lg border border-purple-200">
            <div className="flex items-center mb-2">
              <div className="h-5 w-5 bg-purple-200 rounded mr-2"></div>
              <div className="h-5 bg-purple-200 rounded w-32"></div>
            </div>
            <div className="space-y-2">
              <div className="h-3 bg-purple-200 rounded w-full"></div>
              <div className="h-3 bg-purple-200 rounded w-3/4"></div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);
