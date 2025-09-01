// src/app/upload/page.tsx
'use client';
import { useState } from 'react';

export default function UploadPage() {
  const [file, setFile] = useState<File>();
  const [title, setTitle] = useState('');
  const [pin, setPin] = useState('');
  const [msg, setMsg] = useState('');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  async function onUpload() {
    setMsg('');
    setProgress(0);

    if (!file) return setMsg('Select a video file.');
    if (!title.trim()) return setMsg('Enter a title.');
    if (!pin.trim()) return setMsg('Enter the upload PIN.');

    setUploading(true);

    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('title', title.trim());

      const tick = setInterval(() => {
        setProgress((p) => (p >= 90 ? 90 : p + 10));
      }, 300);

      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { authorization: `Bearer ${pin}` },
        body: fd,
      });

      clearInterval(tick);
      setProgress(100);

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        setMsg(data.error || 'Upload failed.');
        setProgress(0);
        return;
      }

      setMsg('Video uploaded successfully.');
      setTitle('');
      setPin('');
      setFile(undefined);
      const fileInput = document.getElementById('file') as HTMLInputElement | null;
      if (fileInput) fileInput.value = '';
      setTimeout(() => setProgress(0), 1200);
    } catch {
      setMsg('Network error.');
      setProgress(0);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Upload League Video</h1>
        <p className="text-gray-600">Highlights, hype, or trash talk.</p>
      </div>

      <form
        className="space-y-4 bg-white rounded-lg shadow-md p-6"
        onSubmit={(e) => {
          e.preventDefault();
          onUpload();
        }}
        aria-describedby="status"
      >
        <div className="space-y-1">
          <label htmlFor="title" className="block text-sm font-medium">
            Title <span className="text-red-500">*</span>
          </label>
          <input
            id="title"
            required
            className="w-full border rounded px-3 py-2"
            placeholder="Week 10 Victory Speech"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            disabled={uploading}
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="pin" className="block text-sm font-medium">
            Upload PIN <span className="text-red-500">*</span>
          </label>
          <input
            id="pin"
            type="password"
            required
            className="w-full border rounded px-3 py-2"
            placeholder="Enter PIN"
            value={pin}
            onChange={(e) => setPin(e.target.value)}
            disabled={uploading}
          />
          <p className="text-xs text-gray-500">Validated server-side against env tokens.</p>
        </div>

        <div className="space-y-1">
          <label htmlFor="file" className="block text-sm font-medium">
            Video File <span className="text-red-500">*</span>
          </label>
          <input
            id="file"
            required
            type="file"
            accept="video/mp4,video/webm,video/quicktime,video/x-msvideo"
            className="w-full border rounded px-3 py-2 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700"
            onChange={(e) => setFile(e.target.files?.[0])}
            disabled={uploading}
          />
          <p className="text-xs text-gray-500">Max 500MB • MP4, WebM, MOV, AVI</p>
        </div>

        {uploading && progress > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Uploading…</span>
              <span>{progress}%</span>
            </div>
            <progress value={progress} max={100} className="progress w-full h-2" />
          </div>
        )}

        <button
          type="submit"
          className="w-full bg-blue-600 text-white rounded px-4 py-2 hover:bg-blue-700 disabled:opacity-50"
          disabled={uploading}
        >
          {uploading ? 'Uploading…' : 'Upload Video'}
        </button>
      </form>

      {msg && (
        <p
          id="status"
          role="status"
          aria-live="polite"
          className={`text-sm p-3 rounded ${
            /success/i.test(msg) ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}
        >
          {msg}
        </p>
      )}
    </div>
  );
}
