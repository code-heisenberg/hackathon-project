import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import './RepoSearchModal.css';

const RepoSearchModal = ({ isOpen, onClose, onSelectRepo }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [repos, setRepos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [accessToken, setAccessToken] = useState('');
  const [username, setUsername] = useState('');

  useEffect(() => {
    // Get GitHub credentials from localStorage
    try {
      const githubUser = JSON.parse(localStorage.getItem('githubUser'));
      if (githubUser) {
        setAccessToken(githubUser.auth.access_token);
        setUsername(githubUser.login);
      } else {
        setError('GitHub credentials not found. Please login first.');
      }
    } catch (err) {
      console.error('Error parsing GitHub credentials:', err);
      setError('Error loading GitHub credentials. Please login again.');
    }
  }, []);

  const searchRepos = async () => {
    if (!accessToken || !username) {
      setError('GitHub credentials not found. Please login first.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`https://api.github.com/search/repositories?q=user:${username} ${searchQuery}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Accept': 'application/vnd.github.v3+json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch repositories');
      }

      const data = await response.json();
      setRepos(data.items || []);
    } catch (err) {
      toast.error('Error searching repositories: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    searchRepos();
  };

  const handleSelectRepo = (repo) => {
    onClose();
    onSelectRepo(repo);
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h2>Search GitHub Repositories</h2>
          <button className="close-button" onClick={onClose}>&times;</button>
        </div>

        <form onSubmit={handleSubmit} className="search-form">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search repositories..."
            className="search-input"
          />
          <button type="submit" disabled={loading || !accessToken} className="search-button">
            {loading ? 'Searching...' : 'Search'}
          </button>
        </form>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <div className="repos-list">
          {repos.map(repo => (
            <div
              key={repo.id}
              className="repo-item"
              onClick={() => handleSelectRepo(repo)}
            >
              <h3>{repo.name}</h3>
              <p>{repo.description}</p>
              <div className="repo-meta">
                <span>⭐ {repo.stargazers_count}</span>
                <span>🔄 {repo.updated_at.split('T')[0]}</span>
              </div>
            </div>
          ))}
          {loading && (
            <div className="searching">
              <div className="loading-spinner"></div>
              <span>Searching repositories...</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RepoSearchModal;
