import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { generateMockCode } from './services/mockService.js';
import { createRepository, saveFiles } from './services/githubService.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Route for code generation
app.post('/api/generate', async (req, res) => {
  try {
    const { prompt, technicalDetails } = req.body;
    // Use mock service for now
    const generatedCode = await generateMockCode(prompt, technicalDetails);
    res.json(generatedCode);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Route for creating GitHub repository and saving code
app.post('/api/github/save', async (req, res) => {
  try {
    const { repoName, description, files } = req.body;
    
    // Create new repository
    await createRepository(repoName, description);
    
    // Save files to repository
    const result = await saveFiles(repoName, files);
    
    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Route to preview file structure
app.post('/api/preview', async (req, res) => {
  try {
    const { prompt, technicalDetails } = req.body;
    // Use mock service for now
    const generatedCode = await generateMockCode(prompt, technicalDetails);
    res.json({
      structure: generatedCode.fileStructure,
      setupInstructions: generatedCode.setupInstructions
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
