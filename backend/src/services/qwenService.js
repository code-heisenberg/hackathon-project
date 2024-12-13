import fetch from 'node-fetch';

const QWEN_API_ENDPOINT = 'https://api.qwen.ai/v1/chat/completions';

export async function generateCode(prompt, technicalDetails) {
    try {
        const response = await fetch(QWEN_API_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${process.env.MODEL_API_KEY}`
            },
            body: JSON.stringify({
                model: "qwen1.5-7b-chat",
                messages: [
                    {
                        role: "system",
                        content: "You are a skilled full-stack developer. Generate code based on the provided requirements and technical specifications."
                    },
                    {
                        role: "user",
                        content: generatePrompt(prompt, technicalDetails)
                    }
                ],
                temperature: 0.7,
                max_tokens: 2000
            })
        });

        const data = await response.json();
        return parseGeneratedCode(data.choices[0].message.content);
    } catch (error) {
        console.error('Error generating code:', error);
        throw new Error('Failed to generate code');
    }
}

function generatePrompt(prompt, technicalDetails) {
    return `
Generate a codebase with the following requirements:

${prompt}

Technical Specifications:
- Framework: ${technicalDetails.framework}
- Database: ${technicalDetails.database}
- Additional Features: ${technicalDetails.features.join(', ')}

Please provide:
1. File structure
2. Complete code for each file
3. Setup instructions
`;
}

function parseGeneratedCode(content) {
    // Parse the model's response into a structured format
    const fileStructure = {};
    let currentFile = null;
    let currentContent = '';

    const lines = content.split('\n');
    for (const line of lines) {
        if (line.startsWith('```') && line.includes('/')) {
            if (currentFile) {
                fileStructure[currentFile] = currentContent.trim();
            }
            currentFile = line.replace('```', '').trim();
            currentContent = '';
        } else if (line.startsWith('```') && currentFile) {
            fileStructure[currentFile] = currentContent.trim();
            currentFile = null;
            currentContent = '';
        } else if (currentFile) {
            currentContent += line + '\n';
        }
    }

    return {
        fileStructure,
        setupInstructions: content.split('Setup Instructions:')[1]?.trim() || ''
    };
}
