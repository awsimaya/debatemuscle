import { useState, useRef } from 'react';
import Modal from '../common/Modal';
import TagSelector from './TagSelector';
import { TOURNAMENTS, DIVISIONS } from '../../utils/constants';
import { uploadVideo } from '../../api/videos';

export default function UploadModal({ isOpen, onClose, onUploaded }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [tournament, setTournament] = useState('');
  const [division, setDivision] = useState('');
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(0);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');
  const fileInputRef = useRef(null);
  const [dragActive, setDragActive] = useState(false);

  const reset = () => {
    setTitle('');
    setDescription('');
    setTournament('');
    setDivision('');
    setFile(null);
    setProgress(0);
    setError('');
    setUploading(false);
  };

  const handleClose = () => {
    if (!uploading) {
      reset();
      onClose();
    }
  };

  const handleFile = (f) => {
    const allowed = ['video/mp4', 'video/quicktime', 'video/webm', 'video/x-msvideo', 'video/x-matroska'];
    if (!allowed.includes(f.type) && !f.name.match(/\.(mp4|mov|webm|avi|mkv)$/i)) {
      setError('Please select a video file (.mp4, .mov, .webm, .avi, .mkv)');
      return;
    }
    if (f.size > 500 * 1024 * 1024) {
      setError('File size must be under 500 MB');
      return;
    }
    setFile(f);
    setError('');
    if (!title) {
      setTitle(f.name.replace(/\.[^/.]+$/, ''));
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);
    if (e.dataTransfer.files?.[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !title || !tournament || !division) {
      setError('Please fill in all required fields');
      return;
    }

    setUploading(true);
    setError('');
    setProgress(0);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);
    formData.append('description', description);
    formData.append('tournament', tournament);
    formData.append('division', division);

    try {
      await uploadVideo(formData, setProgress);
      reset();
      onClose();
      onUploaded?.();
    } catch (err) {
      setError(err.response?.data?.error || 'Upload failed');
      setUploading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Upload Video">
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Drop zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
          onDragLeave={() => setDragActive(false)}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
            dragActive ? 'border-dm-accent bg-dm-accent/10' : 'border-dm-mid hover:border-dm-accent/50'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="video/*"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
            className="hidden"
          />
          {file ? (
            <div>
              <p className="text-dm-text font-medium">{file.name}</p>
              <p className="text-dm-muted text-sm mt-1">
                {(file.size / (1024 * 1024)).toFixed(1)} MB
              </p>
            </div>
          ) : (
            <div>
              <p className="text-dm-muted">Drop a video file here or click to browse</p>
              <p className="text-dm-muted text-xs mt-1">MP4, MOV, WebM, AVI, MKV (max 500 MB)</p>
            </div>
          )}
        </div>

        <div>
          <label className="block text-sm text-dm-muted mb-1">Title *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
            className="w-full bg-dm-dark border border-dm-mid rounded-lg px-3 py-2 text-dm-text focus:outline-none focus:border-dm-accent transition-colors"
            placeholder="Video title"
          />
        </div>

        <div>
          <label className="block text-sm text-dm-muted mb-1">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            className="w-full bg-dm-dark border border-dm-mid rounded-lg px-3 py-2 text-dm-text focus:outline-none focus:border-dm-accent transition-colors resize-none"
            placeholder="Optional description"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <TagSelector label="Tournament *" options={TOURNAMENTS} value={tournament} onChange={setTournament} />
          <TagSelector label="Division *" options={DIVISIONS} value={division} onChange={setDivision} />
        </div>

        {error && <p className="text-red-400 text-sm">{error}</p>}

        {uploading && (
          <div className="w-full bg-dm-dark rounded-full h-2">
            <div
              className="bg-dm-accent h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={handleClose}
            disabled={uploading}
            className="px-4 py-2 text-sm text-dm-muted hover:text-dm-text transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={uploading || !file}
            className="px-4 py-2 text-sm bg-dm-accent hover:bg-blue-600 text-white rounded-lg transition-colors disabled:opacity-50"
          >
            {uploading ? `Uploading ${progress}%` : 'Upload'}
          </button>
        </div>
      </form>
    </Modal>
  );
}
