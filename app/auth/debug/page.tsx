'use client';

import React, { useState, useEffect } from 'react';
import { getClient } from '@/libs/supabase/client';
import { authLogger } from '@/utils/authLogger';

export default function AuthDebugPage() {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [authHistory, setAuthHistory] = useState<any[]>([]);

  const supabase = getClient();

  useEffect(() => {
    checkSession();
    updateAuthHistory();
  }, []);

  const checkSession = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        setError(`Error getting session: ${error.message}`);
        console.error('Session error:', error);
      } else {
        setSession(session);
      }
    } catch (err) {
      setError(`Unexpected error: ${err}`);
      console.error('Unexpected error:', err);
    } finally {
      setLoading(false);
    }
  };

  const updateAuthHistory = () => {
    const history = authLogger.getSessionHistory();
    setAuthHistory(history);
  };

  const refreshSession = async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      
      if (error) {
        setError(`Error refreshing session: ${error.message}`);
        console.error('Refresh error:', error);
      } else {
        setSession(data.session);
        updateAuthHistory();
      }
    } catch (err) {
      setError(`Unexpected error during refresh: ${err}`);
      console.error('Unexpected refresh error:', err);
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        setError(`Error signing out: ${error.message}`);
        console.error('Sign out error:', error);
      } else {
        setSession(null);
        updateAuthHistory();
      }
    } catch (err) {
      setError(`Unexpected error during sign out: ${err}`);
      console.error('Unexpected sign out error:', err);
    }
  };

  const clearAuthData = () => {
    // Clear cookies
    document.cookie.split(";").forEach((c) => {
      const eqPos = c.indexOf("=");
      const name = eqPos > -1 ? c.substr(0, eqPos) : c;
      document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/";
    });
    
    // Clear localStorage
    localStorage.clear();
    
    // Clear sessionStorage
    sessionStorage.clear();
    
    updateAuthHistory();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-6">Auth Debug Page</h1>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Session Information */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h2 className="text-lg font-semibold mb-4">Session Information</h2>
              {loading ? (
                <p className="text-gray-600">Loading...</p>
              ) : session ? (
                <div className="space-y-2 text-sm">
                  <div><strong>Access Token:</strong> {session.access_token ? 'Present' : 'Missing'}</div>
                  <div><strong>Refresh Token:</strong> {session.refresh_token ? 'Present' : 'Missing'}</div>
                  <div><strong>Expires At:</strong> {session.expires_at ? new Date(session.expires_at * 1000).toLocaleString() : 'Not set'}</div>
                  <div><strong>User ID:</strong> {session.user?.id || 'Not set'}</div>
                  <div><strong>Email:</strong> {session.user?.email || 'Not set'}</div>
                </div>
              ) : (
                <p className="text-gray-600">No active session</p>
              )}
            </div>

            {/* Actions */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h2 className="text-lg font-semibold mb-4">Actions</h2>
              <div className="space-y-2">
                <button
                  onClick={checkSession}
                  className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  Check Session
                </button>
                <button
                  onClick={refreshSession}
                  className="w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                >
                  Refresh Session
                </button>
                <button
                  onClick={signOut}
                  className="w-full bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                >
                  Sign Out
                </button>
                <button
                  onClick={clearAuthData}
                  className="w-full bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
                >
                  Clear Auth Data
                </button>
              </div>
            </div>
          </div>

          {/* Authentication History */}
          <div className="mt-8">
            <h2 className="text-lg font-semibold mb-4">Authentication History</h2>
            <div className="bg-gray-50 rounded-lg p-4 max-h-64 overflow-y-auto">
              {authHistory.length > 0 ? (
                <div className="space-y-2">
                  {authHistory.map((event, index) => (
                    <div key={index} className="text-sm border-b border-gray-300 pb-2">
                      <div className="font-medium">{event.type.toUpperCase()}</div>
                      <div className="text-gray-600">{new Date(event.timestamp).toLocaleString()}</div>
                      {event.details && (
                        <div className="mt-1 text-xs text-gray-500">
                          {JSON.stringify(event.details, null, 2)}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-600">No authentication events logged yet</p>
              )}
            </div>
          </div>

          {/* Instructions */}
          <div className="mt-8">
            <h2 className="text-lg font-semibold mb-4">Debug Instructions</h2>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-blue-800">
                Use this page to debug authentication issues. Check the console for detailed logs.
                You can also access the auth logger in the browser console via <code>window.__authLogger</code>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}