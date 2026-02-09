// components/ui/profile/sections/restaurants/ScrollTest.tsx
"use client";

import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

interface ScrollTestProps {
  onTestComplete?: (result: { success: boolean; message: string }) => void;
}

const ScrollTest: React.FC<ScrollTestProps> = ({ onTestComplete }) => {
  const searchParams = useSearchParams();
  const [testResults, setTestResults] = useState<string[]>([]);

  useEffect(() => {
    const runTests = () => {
      const results: string[] = [];
      
      // Test 1: Check if URL parameters are being parsed correctly
      const restaurantId = searchParams.get('restaurantId');
      const tab = searchParams.get('tab');
      const userId = searchParams.get('userId');
      const source = searchParams.get('source');
      
      results.push(`Teste 1 - URL Parameters:`);
      results.push(`  restaurantId: ${restaurantId || 'null'}`);
      results.push(`  tab: ${tab || 'null'}`);
      results.push(`  userId: ${userId || 'null'}`);
      results.push(`  source: ${source || 'null'}`);
      
      // Test 2: Check if scroll logic would be triggered
      const shouldScroll = tab === 'restaurants' && restaurantId !== null;
      results.push(`Teste 2 - Scroll Logic:`);
      results.push(`  Should scroll: ${shouldScroll}`);
      results.push(`  Reason: ${shouldScroll ? 'tab=restaurants AND restaurantId present' : 'Missing required parameters'}`);
      
      // Test 3: Check if we're on the right page
      const currentPath = window.location.pathname;
      const isProfilePage = currentPath.startsWith('/users/');
      results.push(`Teste 3 - Page Context:`);
      results.push(`  Current path: ${currentPath}`);
      results.push(`  Is profile page: ${isProfilePage}`);
      
      // Test 4: Check if container element exists (simulated)
      results.push(`Teste 4 - DOM Elements:`);
      results.push(`  Container ref would be available: true`);
      results.push(`  Restaurant elements would be rendered: true`);
      
      // Overall assessment
      const canScroll = shouldScroll && isProfilePage;
      results.push(`Teste 5 - Overall Assessment:`);
      results.push(`  Can perform scroll: ${canScroll}`);
      results.push(`  Expected behavior: ${canScroll ? 'Scroll to restaurant with highlight effect' : 'No scroll action'}`);
      
      setTestResults(results);
      
      // Notify parent component of test completion
      if (onTestComplete) {
        onTestComplete({
          success: canScroll,
          message: canScroll 
            ? 'URL parameters are correctly configured for scrolling'
            : 'Missing required URL parameters for scrolling'
        });
      }
    };

    runTests();
  }, [searchParams, onTestComplete]);

  return (
    <div className="bg-gray-100 border border-gray-300 rounded-lg p-4 mb-4">
      <h3 className="text-lg font-semibold text-gray-800 mb-2">Teste de Scroll Automático</h3>
      <div className="space-y-1 text-sm text-gray-600">
        {testResults.map((result, index) => (
          <div key={index} className="font-mono">
            {result}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ScrollTest;