class GitHubService {
  constructor() {
    this.updateCredentials();
  }

  updateCredentials() {
    try {
      const githubUser = JSON.parse(localStorage.getItem('githubUser'));
      if (githubUser) {
        this.accessToken = githubUser.auth.access_token;
        this.username = githubUser.login;
      } else {
        throw new Error('GitHub credentials not found');
      }
    } catch (err) {
      console.error('Error loading GitHub credentials:', err);
      throw new Error('Failed to load GitHub credentials');
    }
  }

  async getRepoContents(repo, path = '') {
    this.updateCredentials();
    try {
      const response = await fetch(
        `https://api.github.com/repos/${repo.full_name}/contents/${path}`,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Accept': 'application/vnd.github.v3+json'
          }
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to fetch repository contents');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error fetching repo contents:', error);
      throw error;
    }
  }

  async getFileContent(repo, path) {
    this.updateCredentials();
    try {
      const response = await fetch(
        `https://api.github.com/repos/${repo.full_name}/contents/${path}`,
        {
          headers: {
            'Authorization': `Bearer ${this.accessToken}`,
            'Accept': 'application/vnd.github.v3.raw'
          }
        }
      );

      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: 'Failed to fetch file content' }));
        throw new Error(error.message);
      }

      const content = await response.text();
      return content;
    } catch (error) {
      console.error('Error fetching file content:', error);
      throw error;
    }
  }

  async loadRepositoryFiles(repo) {
    try {
      const contents = await this.getRepoContents(repo);
      const fileStructure = await this.buildFileStructure(contents, repo);
      return fileStructure;
    } catch (error) {
      console.error('Error loading repository:', error);
      throw error;
    }
  }

  async buildFileStructure(contents, repo, path = '') {
    const result = [];

    for (const item of contents) {
      const node = {
        name: item.name,
        path: item.path,
        type: item.type,
        repo: repo
      };

      if (item.type === 'dir') {
        const subContents = await this.getRepoContents(repo, item.path);
        node.children = await this.buildFileStructure(subContents, repo, item.path);
      }

      result.push(node);
    }

    return result;
  }
}

export const githubService = new GitHubService();
