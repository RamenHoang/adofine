#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const files = [
    'src/components/PortfolioDetail.jsx',
    'src/components/Admin.jsx',
    'src/components/BlogDetail.jsx',
    'src/components/BlogList.jsx',
    'src/components/CollectionDetail.jsx',
    'src/components/Hero.jsx',
    'src/components/CollectionsSection.jsx',
    'src/components/Frames.jsx',
    'src/components/Portfolio.jsx',
    'src/components/BlogSection.jsx'
];

const clientDir = __dirname;

files.forEach(file => {
    const filePath = path.join(clientDir, file);

    if (!fs.existsSync(filePath)) {
        console.log(`Skipping ${file} - not found`);
        return;
    }

    let content = fs.readFileSync(filePath, 'utf8');

    // Check if already has import
    const hasImport = content.includes("import { API_URL } from");

    // Replace all occurrences of localhost URL
    const newContent = content.replace(/http:\/\/localhost:3000/g, '${API_URL}');

    // Add import if needed and content changed
    if (!hasImport && newContent !== content) {
        // Find the last import statement
        const lines = newContent.split('\n');
        let lastImportIndex = -1;

        for (let i = 0; i < lines.length; i++) {
            if (lines[i].trim().startsWith('import ')) {
                lastImportIndex = i;
            }
        }

        if (lastImportIndex >= 0) {
            lines.splice(lastImportIndex + 1, 0, "import { API_URL } from '../config';");
            fs.writeFileSync(filePath, lines.join('\n'), 'utf8');
            console.log(`✓ Updated ${file}`);
        }
    } else if (newContent !== content) {
        fs.writeFileSync(filePath, newContent, 'utf8');
        console.log(`✓ Updated ${file}`);
    } else {
        console.log(`- No changes needed for ${file}`);
    }
});

console.log('\n✅ All files processed!');
