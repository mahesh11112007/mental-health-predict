import { transformFileAsync } from '@babel/core';
import { promises as fs } from 'fs';
import path from 'path';

async function walk(dir) {
    const files = await fs.readdir(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = await fs.stat(fullPath);
        if (stat.isDirectory()) {
            await walk(fullPath);
        } else if (fullPath.endsWith('.ts') || fullPath.endsWith('.tsx')) {
            if (fullPath.endsWith('.d.ts')) continue;
            
            const isTsx = fullPath.endsWith('.tsx');
            const result = await transformFileAsync(fullPath, {
                presets: [
                    ['@babel/preset-typescript', { isTSX: isTsx, allExtensions: true }]
                ],
                plugins: []
            });
            
            const newPath = fullPath.replace(/\.tsx?$/, isTsx ? '.jsx' : '.js');
            await fs.writeFile(newPath, result.code);
            await fs.unlink(fullPath);
            console.log(`Converted ${fullPath} -> ${newPath}`);
        }
    }
}

async function main() {
    await walk('./client/src');
    
    // Update index.html
    let html = await fs.readFile('./client/index.html', 'utf-8');
    html = html.replace('/src/main.tsx', '/src/main.jsx');
    await fs.writeFile('./client/index.html', html);
    console.log('Updated index.html');
}
main().catch(console.error);
