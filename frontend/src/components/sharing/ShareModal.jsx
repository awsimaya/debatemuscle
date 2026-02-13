import { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import { shareVideo, listShares, revokeShare } from '../../api/shares';

export default function ShareModal({ isOpen, onClose, video }) {
  const [email, setEmail] = useState('');
  const [shares, setShares] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && video) {
      loadShares();
    }
  }, [isOpen, video]);

  const loadShares = async () => {
    try {
      const data = await listShares(video.id);
      setShares(data);
    } catch {
      // ignore
    }
  };

  const handleShare = async (e) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setError('');

    try {
      await shareVideo(video.id, email.trim());
      setEmail('');
      loadShares();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to share');
    } finally {
      setLoading(false);
    }
  };

  const handleRevoke = async (userId) => {
    try {
      await revokeShare(video.id, userId);
      loadShares();
    } catch {
      // ignore
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Share "${video?.title}"`}>
      <form onSubmit={handleShare} className="flex gap-2 mb-4">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Enter reviewer's email"
          className="flex-1 bg-dm-dark border border-dm-mid rounded-lg px-3 py-2 text-dm-text text-sm focus:outline-none focus:border-dm-accent transition-colors"
        />
        <button
          type="submit"
          disabled={loading || !email.trim()}
          className="px-4 py-2 text-sm bg-dm-accent hover:bg-blue-600 text-white rounded-lg transition-colors disabled:opacity-50"
        >
          Share
        </button>
      </form>

      {error && <p className="text-red-400 text-sm mb-3">{error}</p>}

      {shares.length > 0 && (
        <div>
          <h4 className="text-sm text-dm-muted mb-2">Shared with</h4>
          <div className="space-y-2">
            {shares.map((share) => (
              <div key={share.id} className="flex items-center justify-between bg-dm-dark rounded-lg px-3 py-2">
                <div>
                  <p className="text-sm text-dm-text">{share.shared_with?.display_name}</p>
                  <p className="text-xs text-dm-muted">{share.shared_with?.email}</p>
                </div>
                <button
                  onClick={() => handleRevoke(share.shared_with_user_id)}
                  className="text-xs text-red-400 hover:text-red-300 transition-colors"
                >
                  Revoke
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </Modal>
  );
}
