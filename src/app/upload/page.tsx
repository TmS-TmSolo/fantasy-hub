'use client';
import { useState } from 'react';

export default function UploadPage(){
  const [file, setFile] = useState<File>();
  const [title, setTitle] = useState('');
  const [teamId, setTeamId] = useState('');
  const [pin, setPin] = useState('');          // owners enter PIN
  const [msg, setMsg] = useState('');

  const onUpload = async () => {
    setMsg('');
    if (!file) return setMsg('Select a file');
    if (!title || !teamId || !pin) return setMsg('Title, Team ID, and PIN required');

    const fd = new FormData();
    fd.append('file', file);
    fd.append('title', title);
    fd.append('teamId', teamId);

    const res = await fetch('/api/upload', {
      method: 'POST',
      headers: { authorization: `Bearer ${pin}` },
      body: fd,
    });

    if (!res.ok) { setMsg(await res.text()); return; }
    const data = await res.json();
    setMsg('Uploaded');
    setFile(undefined); setTitle(''); setTeamId(''); setPin('');
  };

  return (
    <div className="max-w-xl mx-auto p-6 space-y-4">
      <h1 className="text-2xl font-semibold">Upload Team Video</h1>

      <form className="space-y-4" onSubmit={(e)=>{ e.preventDefault(); onUpload(); }} aria-describedby="status">
        <div className="space-y-1">
          <label htmlFor="title" className="block text-sm font-medium">Title</label>
          <input id="title" required className="w-full border rounded px-3 py-2"
                 value={title} onChange={e=>setTitle(e.target.value)} />
        </div>

        <div className="space-y-1">
          <label htmlFor="teamId" className="block text-sm font-medium">Team ID (1–12)</label>
          <input id="teamId" required inputMode="numeric" className="w-full border rounded px-3 py-2"
                 value={teamId} onChange={e=>setTeamId(e.target.value)} />
        </div>

        <div className="space-y-1">
          <label htmlFor="pin" className="block text-sm font-medium">Upload PIN</label>
          <input id="pin" required className="w-full border rounded px-3 py-2"
                 value={pin} onChange={e=>setPin(e.target.value)} />
        </div>

        <div className="space-y-1">
          <label htmlFor="file" className="block text-sm font-medium">Video file</label>
          <input id="file" required type="file" accept="video/*"
                 onChange={e=>setFile(e.target.files?.[0])} />
        </div>

        <button type="submit" className="border rounded px-4 py-2">Upload</button>
      </form>

      <p id="status" role="status" aria-live="polite" className="text-sm text-muted-foreground">{msg}</p>
    </div>
  );
}
