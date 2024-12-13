import React from 'react';
import { FiGithub } from 'react-icons/fi';

const Login = () => {
  const handleGitHubLogin = () => {
    // GitHub OAuth2 client ID
    const clientId = import.meta.env.VITE_GITHUB_CLIENT_ID;
    const redirectUri = import.meta.env.VITE_GITHUB_REDIRECT_URI;
    const scope = 'user repo';

    window.location.href = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=${scope}`;
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>Welcome to Code Generator</h1>
        <p>Please sign in with GitHub to continue</p>
        <button className="github-login-button" onClick={handleGitHubLogin}>
          <FiGithub /> Sign in with GitHub
        </button>
      </div>
    </div>
  );
};

export default Login;
