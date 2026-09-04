'use client';

import { useState } from 'react';
import { Download, Loader2, Clock } from 'lucide-react';

interface Props {
  orderId: string;
  productTitle: string;
}

export function DownloadButton({ orderId, productTitle }: Props) {
  const [loading, setLoading] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleGetLink = async () => {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/orders/download', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate download link');
      }

      setDownloadUrl(data.downloadUrl);
      // Trigger automatic browser download
      window.location.href = data.downloadUrl;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Download failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col sm:items-end gap-1.5">
      <button
        onClick={handleGetLink}
        disabled={loading}
        className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-brand-700 disabled:opacity-50 transition-colors"
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Generating link...
          </>
        ) : (
          <>
            <Download className="h-4 w-4" />
            Download File
          </>
        )}
      </button>

      {downloadUrl && (
        <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
          <Clock className="h-3 w-3" /> Link active for 30 minutes
        </span>
      )}

      {error && (
        <span className="text-xs text-red-600">{error}</span>
      )}
    </div>
  );
}
