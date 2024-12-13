import * as BrowserFS from 'browserfs';

class FileSystem {
  constructor() {
    this.fs = null;
    this.initialized = false;
    this.initPromise = this.init();
  }

  async init() {
    if (this.initialized) return;

    return new Promise((resolve, reject) => {
      BrowserFS.configure({
        fs: "LocalStorage",
        options: {}
      }, (e) => {
        if (e) {
          console.error('Failed to initialize BrowserFS', e);
          reject(e);
          return;
        }
        this.fs = BrowserFS.BFSRequire('fs');
        this.path = BrowserFS.BFSRequire('path');
        this.initialized = true;
        resolve();
      });
    });
  }

  async ensureInitialized() {
    if (!this.initialized) {
      await this.initPromise;
    }
  }

  async clear() {
    await this.ensureInitialized();
    const files = await this.readdir('/');
    for (const file of files) {
      await this.removeRecursive('/' + file);
    }
  }

  async readdir(path) {
    await this.ensureInitialized();
    return new Promise((resolve, reject) => {
      this.fs.readdir(path, (err, files) => {
        if (err) reject(err);
        else resolve(files);
      });
    });
  }

  async stat(path) {
    await this.ensureInitialized();
    return new Promise((resolve, reject) => {
      this.fs.stat(path, (err, stats) => {
        if (err) reject(err);
        else resolve(stats);
      });
    });
  }

  async removeRecursive(path) {
    await this.ensureInitialized();
    try {
      const stats = await this.stat(path);
      if (stats.isDirectory()) {
        const files = await this.readdir(path);
        for (const file of files) {
          await this.removeRecursive(this.path.join(path, file));
        }
        await this.rmdir(path);
      } else {
        await this.remove(path);
      }
    } catch (err) {
      if (err.code !== 'ENOENT') throw err;
    }
  }

  async rmdir(path) {
    return new Promise((resolve, reject) => {
      this.fs.rmdir(path, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  async createFile(path, content) {
    await this.ensureInitialized();
    await this.ensureDirectoryExists(this.path.dirname(path));
    
    return new Promise((resolve, reject) => {
      this.fs.writeFile(path, content, 'utf8', (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  async readFile(path) {
    await this.ensureInitialized();
    return new Promise((resolve, reject) => {
      this.fs.readFile(path, 'utf8', (err, data) => {
        if (err) reject(err);
        else resolve(data);
      });
    });
  }

  async remove(path) {
    await this.ensureInitialized();
    return new Promise((resolve, reject) => {
      this.fs.unlink(path, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }

  async ensureDirectoryExists(dirPath) {
    await this.ensureInitialized();
    if (dirPath === '/' || dirPath === '') return;

    try {
      await this.mkdir(dirPath);
    } catch (err) {
      if (err.code === 'EEXIST') return;
      if (err.code === 'ENOENT') {
        await this.ensureDirectoryExists(this.path.dirname(dirPath));
        await this.mkdir(dirPath);
        return;
      }
      throw err;
    }
  }

  async mkdir(path) {
    return new Promise((resolve, reject) => {
      this.fs.mkdir(path, { recursive: true }, (err) => {
        if (err) reject(err);
        else resolve();
      });
    });
  }
}

export const fileSystem = new FileSystem();
