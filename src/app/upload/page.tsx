'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface Team {
  id: string;
  name: string;
}

export default function UploadPage() {
  const [file, setFile] = useState<File>();
  const [title, setTitle] = useState('');
  const [teamId, setTeamId] = useState('');
  const [pin, setPin] = useState('');
  const [msg, setMsg] = useState('');
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [teams, setTeams] = useState<Team[]>([]);

  // Fetch teams on mount
  useEffect(() => {
    fetchTeams();
  }, []);

  const fetchTeams = async () => {
    const { data, error } = await supabase
      .from('teams')
      .select('id, name')
      .order('name');
    
    if (data) setTeams(data);
  };

  const onUpload = async () => {
    setMsg('');
    setProgress(0);
    
    if (!file) return setMsg('Please select a video file');
    if (!title.trim()) return setMsg('Please enter a title');
    if (!teamId) return setMsg('Please select a team');
    if (!pin.trim()) return setMsg('Please enter the upload PIN');

    setUploading(true);

    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('title', title.trim());
      fd.append('teamId', teamId);

      // Simulate progress (since fetch doesn't support upload progress)
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 500);

      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 
          authorization: `Bearer ${pin}` 
        },
        body: fd,
      });

      clearInterval(progressInterval);
      setProgress(100);

      const data = await res.json();

      if (!res.ok) {
        setMsg(data.error || 'Upload failed');
        setProgress(0);
        return;
      }

      setMsg(data.message || 'Video uploaded successfully!');
      
      // Reset form
      setTimeout(() => {
        setFile(undefined);
        setTitle('');
        setTeamId('');
        setPin('');
        setProgress(0);
        // Clear file input
        const fileInput = document.getElementById('file') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      }, 2000);

    } catch (error) {
      setMsg('Network error. Please try again.');
      setProgress(0);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Upload Team Video</h1>
        <p className="text-gray-600">Share highlights, victory speeches, or trash talk!</p>
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
            Video Title <span className="text-red-500">*</span>
          </label>
          <input 
            id="title" 
            required 
            className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Week 10 Victory Speech"
            value={title} 
            onChange={e => setTitle(e.target.value)} 
            disabled={uploading}
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="teamId" className="block text-sm font-medium">
            Team <span className="text-red-500">*</span>
          </label>
          <select 
            id="teamId" 
            required 
            className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            value={teamId} 
            onChange={e => setTeamId(e.target.value)}
            disabled={uploading}
          >
            <option value="">Select your team</option>
            {teams.map(team => (
              <option key={team.id} value={team.id}>
                {team.name}
              </option>
            ))}
          </select>
        </div>

        <div className="space-y-1">
          <label htmlFor="pin" className="block text-sm font-medium">
            Upload PIN <span className="text-red-500">*</span>
          </label>
          <input 
            id="pin" 
            type="password"
            required 
            className="w-full border rounded px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter the upload PIN"
            value={pin} 
            onChange={e => setPin(e.target.value)}
            disabled={uploading}
          />
          <p className="text-xs text-gray-500">Ask your commissioner for the PIN</p>
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
            className="w-full border rounded px-3 py-2 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
            onChange={e => setFile(e.target.files?.[0])}
            disabled={uploading}
          />
          <p className="text-xs text-gray-500">Max 500MB • MP4, WebM, MOV, or AVI</p>
        </div>

        {uploading && progress > 0 && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Uploading...</span>
              <span>{progress}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className={`bg-blue-600 h-2 rounded-full transition-all duration-300 progress-bar`}
                data-progress={progress}
              />
            </div>
          </div>
        )}

        <button 
          type="submit" 
          className="w-full bg-blue-600 text-white rounded px-4 py-2 hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={uploading}
        >
          {uploading ? 'Uploading...' : 'Upload Video'}
        </button>
      </form>

      {msg && (
        <p 
          id="status" 
          role="status" 
          aria-live="polite" 
          className={`text-sm p-3 rounded ${
            msg.includes('success') || msg.includes('successfully') 
              ? 'bg-green-100 text-green-700' 
              : 'bg-red-100 text-red-700'
          }`}
        >
          {msg}
        </p>
      )}
    </div>
  );
}