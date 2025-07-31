'use client';

import { useState, useEffect } from 'react';
import { testApiConnection } from '@/lib/debug-utils';

export default function DebugPage() {
  const [apiUrl, setApiUrl] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [supabaseUrl, setSupabaseUrl] = useState('');
  const [supabaseKey, setSupabaseKey] = useState('');
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Get environment variables
    setApiUrl(process.env.NEXT_PUBLIC_AGENT_API_URL || '');
    setApiKey(process.env.NEXT_PUBLIC_AGENT_API_KEY || '');
    setSupabaseUrl(process.env.NEXT_PUBLIC_SUPABASE_URL || '');
    setSupabaseKey(process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '');
  }, []);

  const runApiTest = async () => {
    setIsLoading(true);
    setTestResults([]);

    // Override console.log to capture output
    const originalLog = console.log;
    const originalError = console.error;
    const originalGroup = console.group;
    const originalGroupEnd = console.groupEnd;

    const logs: string[] = [];

    console.log = (...args) => {
      originalLog(...args);
      logs.push(args.map(arg =>
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' '));
    };

    console.error = (...args) => {
      originalError(...args);
      logs.push('ERROR: ' + args.map(arg =>
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' '));
    };

    console.group = (label) => {
      originalGroup(label);
      logs.push(`\n--- ${label} ---`);
    };

    console.groupEnd = () => {
      originalGroupEnd();
      logs.push('-------------------\n');
    };

    try {
      // Test basic fetch to health endpoint
      logs.push('Testing direct fetch to health endpoint...');
      try {
        const healthResponse = await fetch(`${apiUrl}/health`);
        const healthText = await healthResponse.text();
        logs.push(`Status: ${healthResponse.status}`);
        logs.push(`Response: ${healthText}`);
      } catch (error) {
        logs.push(`Error: ${error.message}`);
      }

      // Run the comprehensive API test
      await testApiConnection(apiUrl, apiKey);
    } catch (error) {
      logs.push(`Test failed: ${error.message}`);
    } finally {
      // Restore console functions
      console.log = originalLog;
      console.error = originalError;
      console.group = originalGroup;
      console.groupEnd = originalGroupEnd;

      setTestResults(logs);
      setIsLoading(false);
    }
  };

  const testCors = async () => {
    setIsLoading(true);
    setTestResults(['Testing CORS...']);

    try {
      // Test preflight request
      const response = await fetch(`${apiUrl}/health`, {
        method: 'OPTIONS',
        headers: {
          'Origin': window.location.origin,
          'Access-Control-Request-Method': 'GET',
          'Access-Control-Request-Headers': 'Content-Type'
        }
      });

      setTestResults(prev => [
        ...prev,
        `Preflight status: ${response.status}`,
        'Response headers:',
        ...Array.from(response.headers.entries()).map(([key, value]) => `${key}: ${value}`)
      ]);
    } catch (error: any) {
      setTestResults(prev => [...prev, `CORS test failed: ${error.message || 'Unknown error'}`]);
    } finally {
      setIsLoading(false);
    }
  };

  const testSupabase = async () => {
    setIsLoading(true);
    setTestResults(['Testing Supabase connection...']);

    try {
      // Import the supabase client dynamically to ensure it uses the latest env vars
      const { supabase } = await import('@/lib/supabase');

      // Test a simple query
      const { data, error } = await supabase
        .from('conversations')
        .select('count(*)')
        .limit(1);

      if (error) {
        setTestResults(prev => [...prev, `Supabase error: ${error.message}`]);
      } else {
        setTestResults(prev => [
          ...prev,
          `Supabase connection successful!`,
          `Data: ${JSON.stringify(data)}`,
          `Supabase URL: ${supabaseUrl}`,
          `Supabase Key: ${supabaseKey ? '***' + supabaseKey.slice(-5) : 'Not set'}`
        ]);
      }
    } catch (error: any) {
      setTestResults(prev => [...prev, `Supabase test failed: ${error.message || 'Unknown error'}`]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">API Debug Page</h1>

      <div className="bg-gray-100 p-4 rounded-lg mb-4">
        <h2 className="text-lg font-semibold mb-2">API Configuration</h2>
        <div className="mb-2">
          <label className="block text-sm font-medium mb-1">API URL:</label>
          <input
            type="text"
            value={apiUrl}
            onChange={(e) => setApiUrl(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>
        <div className="mb-2">
          <label className="block text-sm font-medium mb-1">API Key:</label>
          <input
            type="text"
            value={apiKey}
            onChange={(e) => setApiKey(e.target.value)}
            className="w-full p-2 border rounded"
          />
        </div>
      </div>

      <div className="flex space-x-2 mb-4">
        <button
          onClick={runApiTest}
          disabled={isLoading}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:bg-blue-300"
        >
          {isLoading ? 'Testing...' : 'Run API Test'}
        </button>

        <button
          onClick={testCors}
          disabled={isLoading}
          className="bg-purple-500 text-white px-4 py-2 rounded hover:bg-purple-600 disabled:bg-purple-300"
        >
          Test CORS
        </button>
      </div>

      <div className="bg-black text-stone-400 p-4 rounded-lg font-mono text-sm overflow-auto max-h-[600px]">
        {testResults.length > 0 ? (
          testResults.map((log, index) => (
            <div key={index} className={log.startsWith('ERROR') ? 'text-red-400' : ''}>
              {log}
            </div>
          ))
        ) : (
          <div className="text-gray-500">Run a test to see results</div>
        )}
      </div>

      <div className="mt-4 bg-yellow-50 p-4 rounded-lg">
        <h2 className="text-lg font-semibold mb-2">Troubleshooting Tips</h2>
        <ul className="list-disc pl-5 space-y-1">
          <li>Check if the API URL is correct and accessible</li>
          <li>Verify that the API key is valid</li>
          <li>Look for CORS errors in the browser console (F12)</li>
          <li>Check if the API server is running and responding</li>
          <li>Try the standalone test page at <a href="/api-test.html" className="text-blue-500 underline">api-test.html</a></li>
        </ul>
      </div>
    </div>
  );
}
