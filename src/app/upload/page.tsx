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
    setMsg(''); setProgress(0);
    if (!file) return setMsg('Select a video file.');
    if (!title.trim()) return setMsg('Enter a title.');
    if (!pin.trim()) return setMsg('Enter the upload PIN.');
    setUploading(true);
    try {
      const startRes = await fetch('/api/upload/start', {
        method: 'POST',
        headers: { 'content-type': 'application/json', authorization: `Bearer ${pin}` },
        body: JSON.stringify({ filename: file.name, mimetype: file.type || 'video/mp4', title: title.trim() }),
      });
      const start = await startRes.json();
      if (!startRes.ok) throw new Error(start.error || 'Failed to get upload URL');

      const tick = setInterval(() => setProgress((p) => (p >= 90 ? 90 : p + 10)), 250);
      const put = await fetch(start.signedUrl, {
        method: 'PUT',
        headers: { 'content-type': file.type || 'video/mp4', 'x-upsert': 'false' },
        body: file,
      });
      if (!put.ok) { clearInterval(tick); setProgress(0); throw new Error(`Upload failed (${put.status})`); }

      const finRes = await fetch('/api/upload/finish', {
        method: 'POST',
        headers: { 'content-type': 'application/json', authorization: `Bearer ${pin}` },
        body: JSON.stringify({ title: title.trim(), path: start.path }),
      });
      const fin = await finRes.json();
      clearInterval(tick); setProgress(100);
      if (!finRes.ok) { setMsg(fin.error || 'Finalize failed.'); setProgress(0); return; }

      setMsg('Video uploaded successfully.');
      setTitle(''); setPin(''); setFile(undefined);
      const input = document.getElementById('file') as HTMLInputElement | null;
      if (input) input.value = '';
      setTimeout(() => setProgress(0), 1000);
    } catch (e: any) {
      setMsg(e?.message || 'Network error.'); setProgress(0);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="max-w-xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Upload League Video</h1>
        <p className="text-gray-600">Direct-to-cloud with PIN.</p>
      </div>
      <form className="space-y-4 bg-white rounded-lg shadow-md p-6"
        onSubmit={(e) => { e.preventDefault(); onUpload(); }} aria-describedby="status">
        <div className="space-y-1">
          <label htmlFor="title" className="block text-sm font-medium">Title <span className="text-red-500">*</span></label>
          <input id="title" required className="w-full border rounded px-3 py-2"
            placeholder="Week 10 Victory Speech" value={title}
            onChange={(e) => setTitle(e.target.value)} disabled={uploading} />
        </div>
        <div className="space-y-1">
          <label htmlFor="pin" className="block text-sm font-medium">Upload PIN <span className="text-red-500">*</span></label>
          <input id="pin" type="password" required className="w-full border rounded px-3 py-2"
            placeholder="Enter PIN" value={pin} onChange={(e) => setPin(e.target.value)} disabled={uploading} />
          <p className="text-xs text-gray-500">Validated server-side.</p>
        </div>
        <div className="space-y-1">
          <label htmlFor="file" className="block text-sm font-medium">Video File <span className="text-red-500">*</span></label>
          <input id="file" required type="file"
            accept="video/mp4,video/webm,video/quicktime,video/x-msvideo"
            className="w-full border rounded px-3 py-2 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700"
            onChange={(e) => setFile(e.target.files?.[0])} disabled={uploading} />
          <p className="text-xs text-gray-500">Max 500MB by signed URL policy.</p>
        </div>
        {uploading && progress > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm"><span>Uploading…</span><span>{progress}%</span></div>
            <progress value={progress} max={100} className="progress w-full h-2" />
          </div>
        )}
        <button type="submit" className="w-full bg-blue-600 text-white rounded px-4 py-2 hover:bg-blue-700 disabled:opacity-50"
          disabled={uploading}>{uploading ? 'Uploading…' : 'Upload Video'}</button>
      </form>
      {msg && (
        <p id="status" role="status" aria-live="polite"
          className={`text-sm p-3 rounded ${/success/i.test(msg) ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {msg}
        </p>
      )}
    </div>
  );
}
