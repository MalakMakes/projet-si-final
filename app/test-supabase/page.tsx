import { createClient } from '@/lib/supabase/server';

export default async function TestPage() {
  const supabase = await createClient();

  // Replace 'interactions' with an actual table name from your database
  const { data, error } = await supabase.from('interactions').select('*').limit(1);

  return (
    <main className="p-8 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Supabase Connection Test</h1>

      {error ? (
        <div className="p-4 bg-red-50 border border-red-200 rounded text-red-700">
          <h2 className="font-semibold">Connection Failed</h2>
          <p className="text-sm mt-1">{error.message}</p>
        </div>
      ) : (
        <div className="p-4 bg-green-50 border border-green-200 rounded text-green-700">
          <h2 className="font-semibold">Connection Successful!</h2>
          <p className="text-sm mt-1">Successfully fetched data from the database.</p>
          {data && data.length > 0 && (
            <pre className="mt-4 p-2 bg-white rounded text-xs overflow-auto border border-gray-200">
              {JSON.stringify(data[0], null, 2)}
            </pre>
          )}
        </div>
      )}
    </main>
  );
}