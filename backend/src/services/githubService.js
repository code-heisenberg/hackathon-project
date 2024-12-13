import { Octokit } from 'octokit';
import { exec } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs/promises';
import axios from 'axios';

const execAsync = promisify(exec);

const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN,
    headers: {
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`
    }
});

export async function getCurrentUser() {
    const { data } = await octokit.rest.users.getAuthenticated();
    return data;
}

export async function listRepositories() {
    const { data } = await octokit.rest.repos.listForAuthenticatedUser({
        sort: 'created',
        direction: 'desc'
    });
    return data;
}

async function initializeLocalRepo(repoPath, repoUrl) {
    try {
        // Create directory if it doesn't exist
        await fs.mkdir(repoPath, { recursive: true });

        // Initialize git repository
        await execAsync('git init', { cwd: repoPath });
        
        // Configure git
        const user = await getCurrentUser();
        await execAsync(`git config user.name "${user.login}"`, { cwd: repoPath });
        await execAsync(`git config user.email "${user.email || 'noreply@github.com'}"`, { cwd: repoPath });
        
        // Add remote
        await execAsync(`git remote add origin ${repoUrl}`, { cwd: repoPath });
        
        return true;
    } catch (error) {
        console.error('Error initializing local repo:', error);
        throw error;
    }
}

async function commitAndPush(repoPath, message = 'Update code structure') {
    try {
        // Add all files
        await execAsync('git add .', { cwd: repoPath });
        
        // Commit changes
        await execAsync(`git commit -m "${message}"`, { cwd: repoPath });
        
        // Push to remote
        await execAsync('git push -u origin main', { cwd: repoPath });
        
        return true;
    } catch (error) {
        console.error('Error committing and pushing:', error);
        throw error;
    }
}

export async function createRepository(repoName, description) {
    try {
        const { data: repo } = await octokit.rest.repos.createForAuthenticatedUser({
            name: repoName,
            description: description,
            private: false,
            auto_init: true,
            headers: {
                'Accept': 'application/vnd.github.v3+json',
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`
            }
        });

        // Create default branch protection
        try {
            await octokit.rest.repos.updateBranchProtection({
                owner: repo.owner.login,
                repo: repoName,
                branch: 'main',
                required_status_checks: null,
                enforce_admins: false,
                restrictions: null,
                required_pull_request_reviews: null
            });
        } catch (error) {
            console.warn('Could not set branch protection:', error);
        }

        return repo;
    } catch (error) {
        console.error('Error creating repository:', error);
        throw error;
    }
}

export async function saveFiles(repoName, files, branch = 'main') {
    try {
        const user = await getCurrentUser();
        const owner = user.login;
        const repoUrl = `https://github.com/${owner}/${repoName}.git`;
        const repoPath = path.join(process.cwd(), 'temp', repoName);

        // Initialize local repository
        await initializeLocalRepo(repoPath, repoUrl);

        // Write files to local repository
        for (const [filePath, content] of Object.entries(files)) {
            const fullPath = path.join(repoPath, filePath);
            const dirPath = path.dirname(fullPath);
            await fs.mkdir(dirPath, { recursive: true });
            await fs.writeFile(fullPath, content);
        }

        // Commit and push changes
        await commitAndPush(repoPath);

        // Clean up temporary directory
        await fs.rm(repoPath, { recursive: true, force: true });

        return {
            success: true,
            repoUrl: `https://github.com/${owner}/${repoName}`,
            pagesUrl: `https://${owner}.github.io/${repoName}`
        };
    } catch (error) {
        console.error('Error saving files:', error);
        throw error;
    }
}

export async function createWebhook(repoName, webhookUrl) {
    try {
        const user = await getCurrentUser();
        await octokit.rest.repos.createWebhook({
            owner: user.login,
            repo: repoName,
            config: {
                url: webhookUrl,
                content_type: 'json'
            },
            events: ['push', 'pull_request']
        });
    } catch (error) {
        console.warn('Could not create webhook:', error);
    }
}

export async function getRepositories(username) {
    try {
        const response = await axios.get(`https://api.github.com/users/${username}/repos`, {
            headers: {
                'Accept': 'application/vnd.github.v3+json',
                'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching repositories:', error);
        throw error;
    }
}

export async function getRepositoryContent(owner, repo, path = '') {
    try {
        const response = await axios.get(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
            headers: {
                'Accept': 'application/vnd.github.v3+json',
                'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching repository content:', error);
        throw error;
    }
}

export async function getFileContent(owner, repo, path) {
    try {
        const response = await axios.get(`https://api.github.com/repos/${owner}/${repo}/contents/${path}`, {
            headers: {
                'Accept': 'application/vnd.github.v3+json',
                'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`
            }
        });
        
        if (Array.isArray(response.data)) {
            throw new Error('Path points to a directory, not a file');
        }

        // Get the content and decode from base64
        const content = Buffer.from(response.data.content, 'base64').toString('utf8');
        return content;
    } catch (error) {
        console.error('Error fetching file content:', error);
        throw error;
    }
}

export async function searchCode(query, owner, repo) {
    try {
        const response = await axios.get('https://api.github.com/search/code', {
            params: {
                q: `${query} repo:${owner}/${repo}`
            },
            headers: {
                'Accept': 'application/vnd.github.v3+json',
                'Authorization': `Bearer ${process.env.GITHUB_TOKEN}`
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error searching code:', error);
        throw error;
    }
}
