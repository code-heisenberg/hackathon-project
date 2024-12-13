import axios from 'axios';

const githubAuthService = {
    async exchangeCodeForToken(code) {
        try {
            const response = await axios.post('https://github.com/login/oauth/access_token', {
                client_id: process.env.GITHUB_CLIENT_ID,
                client_secret: process.env.GITHUB_CLIENT_SECRET,
                code: code
            }, {
                headers: {
                    Accept: 'application/json'
                }
            });

            return response.data;
        } catch (error) {
            console.error('Error exchanging code for token:', error);
            throw new Error('Failed to exchange code for token');
        }
    }
};

export default githubAuthService;
