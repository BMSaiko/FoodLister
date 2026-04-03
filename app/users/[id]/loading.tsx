'use client';

import React from 'react';
import { 
  Star, 
  List, 
  Utensils, 
  Clock,
  User,
  MapPin,
  Globe,
  Calendar,
  Users
} from 'lucide-react';

const UserLoadingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 relative overflow-hidden">
      {/* Floating decorative elements */}
      <div className="absolute inset-0 opacity-80 pointer-events-none">
        <div className="absolute top-10 left-5 w-16 h-16 bg-amber-600 rounded-full animate-float-slow"></div>
        <Utensils className="absolute top-28 right-6 w-6 h-6 text-amber-900 animate-bounce-subtle delay-700 drop-shadow-lg" />
        <List className="absolute bottom-20 right-4 w-5 h-5 text-orange-800 animate-bounce-subtle delay-1500 drop-shadow-lg" />
      </div>

      <div className="container mx-auto px-4 py-6 relative z-10">
        {/* Header Loading */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div className="animate-pulse">
              <div className="h-10 w-24 bg-gray-300 rounded-lg"></div>
            </div>
            <div className="animate-pulse">
              <div className="h-10 w-32 bg-gray-300 rounded-lg"></div>
            </div>
          </div>

          <div className="animate-pulse">
            <div className="h-8 w-64 bg-gray-300 rounded-lg mb-2"></div>
            <div className="h-4 w-96 bg-gray-300 rounded-lg"></div>
          </div>
        </div>

        {/* Profile Header Loading */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 sm:p-6 mb-6">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Profile Image and Basic Info */}
            <div className="flex-1 flex flex-col lg:flex-row gap-4 lg:gap-6">
              <div className="lg:w-32 lg:h-32 w-24 h-24 relative flex-shrink-0">
                <div className="w-full h-full rounded-full bg-gradient-to-br from-amber-400 to-orange-400 shadow-xl flex items-center justify-center overflow-hidden ring-4 ring-white animate-pulse">
                  <User className="h-12 w-12 sm:h-16 sm:w-16 text-white opacity-80" />
                </div>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-3">
                  <div className="animate-pulse">
                    <div className="h-8 w-48 bg-gray-300 rounded-lg"></div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <div className="animate-pulse">
                      <div className="h-6 w-24 bg-gray-300 rounded-full"></div>
                    </div>
                    <div className="animate-pulse">
                      <div className="h-8 w-8 bg-gray-300 rounded-full"></div>
                    </div>
                  </div>
                </div>
                
                <div className="animate-pulse mb-3">
                  <div className="h-4 w-full bg-gray-300 rounded-lg mb-2"></div>
                  <div className="h-4 w-3/4 bg-gray-300 rounded-lg"></div>
                </div>
                
                <div className="flex flex-wrap gap-2">
                  <div className="animate-pulse">
                    <div className="h-6 w-32 bg-gray-300 rounded-full"></div>
                  </div>
                  <div className="animate-pulse">
                    <div className="h-6 w-24 bg-gray-300 rounded-full"></div>
                  </div>
                  <div className="animate-pulse">
                    <div className="h-6 w-40 bg-gray-300 rounded-full"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Stats Loading */}
            <div className="flex-1 grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-lg p-3 sm:p-4 border border-amber-200 animate-pulse">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="h-4 w-24 bg-gray-300 rounded-lg mb-2"></div>
                    <div className="h-6 w-16 bg-gray-300 rounded-lg"></div>
                  </div>
                  <Utensils className="h-6 sm:h-8 w-6 sm:w-8 text-amber-500 opacity-80" />
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-lg p-3 sm:p-4 border border-orange-200 animate-pulse">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="h-4 w-20 bg-gray-300 rounded-lg mb-2"></div>
                    <div className="h-6 w-12 bg-gray-300 rounded-lg"></div>
                  </div>
                  <Star className="h-6 sm:h-8 w-6 sm:w-8 text-orange-500 opacity-80" />
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-yellow-50 to-amber-50 rounded-lg p-3 sm:p-4 border border-yellow-200 animate-pulse">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="h-4 w-24 bg-gray-300 rounded-lg mb-2"></div>
                    <div className="h-6 w-16 bg-gray-300 rounded-lg"></div>
                  </div>
                  <List className="h-6 sm:h-8 w-6 sm:w-8 text-yellow-500 opacity-80" />
                </div>
              </div>
              
              <div className="bg-gradient-to-br from-green-50 to-teal-50 rounded-lg p-3 sm:p-4 border border-green-200 animate-pulse">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="h-4 w-32 bg-gray-300 rounded-lg mb-2"></div>
                    <div className="h-6 w-20 bg-gray-300 rounded-lg"></div>
                  </div>
                  <Utensils className="h-6 sm:h-8 w-6 sm:w-8 text-green-500 opacity-80" />
                </div>
              </div>
            </div>
          </div>

          {/* Actions Loading */}
          <div className="flex flex-wrap gap-2 sm:gap-3 mt-4 sm:mt-6">
            <div className="animate-pulse">
              <div className="h-10 w-32 bg-gray-300 rounded-lg"></div>
            </div>
            <div className="animate-pulse">
              <div className="h-10 w-32 bg-gray-300 rounded-lg"></div>
            </div>
          </div>
        </div>

        {/* Content Tabs Loading */}
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
          {/* Tab Navigation Loading */}
          <div className="border-b border-gray-200">
            <div className="flex overflow-x-auto">
              {[1, 2, 3, 4].map((tab) => (
                <div key={tab} className="animate-pulse">
                  <div className="flex items-center gap-3 px-6 py-4 border-b-2 border-transparent">
                    <div className="h-4 w-4 bg-gray-300 rounded"></div>
                    <div className="h-4 w-16 bg-gray-300 rounded"></div>
                    <div className="h-5 w-8 bg-gray-300 rounded-full"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Tab Content Loading */}
          <div className="p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Left Column Loading */}
              <div className="bg-gradient-to-br from-amber-50 to-orange-50 rounded-xl p-6 animate-pulse">
                <div className="h-6 w-32 bg-gray-300 rounded-lg mb-4"></div>
                <div className="space-y-4">
                  {[1, 2, 3].map((item) => (
                    <div key={item} className="bg-white rounded-lg p-4 shadow-sm">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="h-4 w-32 bg-gray-300 rounded-lg mb-1"></div>
                          <div className="flex items-center gap-2">
                            <div className="h-3 w-12 bg-gray-300 rounded-lg"></div>
                            <div className="h-3 w-16 bg-gray-300 rounded-lg"></div>
                          </div>
                        </div>
                        <div className="w-16 h-16 bg-gray-300 rounded-lg"></div>
                      </div>
                      <div className="h-3 w-full bg-gray-300 rounded-lg"></div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column Loading */}
              <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl p-6 animate-pulse">
                <div className="h-6 w-32 bg-gray-300 rounded-lg mb-4"></div>
                <div className="space-y-4">
                  {[1, 2, 3].map((item) => (
                    <div key={item} className="bg-white rounded-lg p-4 shadow-sm">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="h-4 w-32 bg-gray-300 rounded-lg mb-1"></div>
                          <div className="flex items-center gap-2">
                            <div className="h-3 w-16 bg-gray-300 rounded-lg"></div>
                            <div className="h-3 w-12 bg-gray-300 rounded-lg"></div>
                          </div>
                        </div>
                      </div>
                      <div className="h-3 w-full bg-gray-300 rounded-lg"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Stats Loading */}
            <div className="bg-gradient-to-br from-green-50 to-teal-50 rounded-xl p-6 mt-6 animate-pulse">
              <div className="h-6 w-40 bg-gray-300 rounded-lg mb-4"></div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg p-4 text-center">
                  <div className="h-8 w-16 bg-gray-300 rounded-lg mx-auto mb-2"></div>
                  <div className="h-3 w-20 bg-gray-300 rounded-lg"></div>
                </div>
                <div className="bg-white rounded-lg p-4 text-center">
                  <div className="h-8 w-16 bg-gray-300 rounded-lg mx-auto mb-2"></div>
                  <div className="h-3 w-16 bg-gray-300 rounded-lg"></div>
                </div>
                <div className="bg-white rounded-lg p-4 text-center">
                  <div className="h-8 w-20 bg-gray-300 rounded-lg mx-auto mb-2"></div>
                  <div className="h-3 w-24 bg-gray-300 rounded-lg"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserLoadingPage;
