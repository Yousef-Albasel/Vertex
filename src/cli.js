#!/usr/bin/env node

const { Command } = require('commander');
const build = require('./build');
const serve = require('./serve');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs-extra');
const open = require('open');

const program = new Command();

program
    .name('vertex')
    .description('VERTEX - Static Site Generator')
    .version('1.0.0');

// Build command
program
    .command('build')
    .description('Build the static site')
    .option('-d, --dir <directory>', 'Project directory', '.')
    .action(async (options) => {
        try {
            console.log('Building site...');
            await build(options.dir);
        } catch (error) {
            console.error('Build failed:', error.message);
            process.exit(1);
        }
    });

// Serve command
program
    .command('serve')
    .description('Start development server')
    .option('-p, --port <port>', 'Port to serve on', '3000')
    .option('-d, --dir <directory>', 'Project directory', '.')
    .action(async (options) => {
        try {
            console.log('Starting development server... 🚀 ');
            await serve(options.dir, parseInt(options.port));
        } catch (error) {
            console.error('Server failed:', error.message);
            process.exit(1);
        }
    });

// Editor command
program
    .command('edit')
    .description('Open the Vertex markdown editor')
    .option('-f, --file <filename>', 'Open specific file in editor')
    .option('-p, --port <port>', 'API server port', '3001')
    .option('-d, --dir <directory>', 'Project directory', '.')
    .action(async (options) => {
        try {
            console.log('Starting Vertex Editor...');
            
            const projectDir = path.resolve(options.dir);
            const editorDir = path.join(projectDir, 'markdown-editor');
            
            if (!await fs.pathExists(editorDir)) {
                console.error('❌ Editor not found. Make sure the markdown-editor directory exists.');
                process.exit(1);
            }
            
            // Start the API server
            console.log('Starting API server...');
            const apiServer = spawn('node', [path.join(__dirname, 'editor-server.js')], {
                cwd: projectDir,
                env: { ...process.env, PORT: options.port },
                stdio: 'inherit'
            });
            
            await new Promise(resolve => setTimeout(resolve, 2000));
            console.log('Starting editor interface...');
            const editorServer = spawn('npm', ['run', 'dev'], {
                cwd: editorDir,
                stdio: 'inherit',
                shell: true
            });
            
            setTimeout(async () => {
                let url = 'http://localhost:5173';

                // If a specific file is requested, add it as a URL parameter
                if (options.file) {
                    // Determine if it's in content or pages directory
                    const contentPath = path.join(projectDir, 'content', options.file);
                    const pagesPath = path.join(projectDir, 'pages', options.file);
                    
                    if (await fs.pathExists(contentPath)) {
                        url += `?file=content/${options.file}`;
                    } else if (await fs.pathExists(pagesPath)) {
                        url += `?file=pages/${options.file}`;
                    } else {
                        console.log(`   File "${options.file}" not found in content/ or pages/`);
                        console.log(`   Creating new file in content/ directory`);
                        url += `?file=content/${options.file}&create=true`;
                    }
                }
                
                try {
                    await open(url);
                    console.log(`Editor opened at: ${url}`);
                } catch (error) {
                    console.log(`Editor available at: ${url}`);
                }
            }, 3000);
            
            // Handle shutdown
            const shutdown = () => {
                console.log('\n📴 Shutting down Vertex Editor...');
                apiServer.kill();
                editorServer.kill();
                process.exit(0);
            };
            
            process.on('SIGINT', shutdown);
            process.on('SIGTERM', shutdown);
            
            await Promise.all([
                new Promise((resolve, reject) => {
                    apiServer.on('exit', resolve);
                    apiServer.on('error', reject);
                }),
                new Promise((resolve, reject) => {
                    editorServer.on('exit', resolve);
                    editorServer.on('error', reject);
                })
            ]);
            
        } catch (error) {
            console.error('Editor failed:', error.message);
            process.exit(1);
        }
    });

// Create command - alias for edit with new file
program
    .command('create <filename>')
    .description('Create and open a new markdown file in the editor')
    .option('-t, --type <type>', 'File type: content or page', 'content')
    .option('-p, --port <port>', 'API server port', '3001')
    .option('-d, --dir <directory>', 'Project directory', '.')
    .action(async (filename, options) => {
        try {
            // Ensure filename ends with .md
            if (!filename.endsWith('.md')) {
                filename += '.md';
            }
            
            const projectDir = path.resolve(options.dir);
            const targetDir = options.type === 'page' ? 'pages' : 'content';
            const filePath = path.join(projectDir, targetDir, filename);
            
            // Create the file with basic frontmatter
            const now = new Date().toISOString().split('T')[0];
            const title = filename.replace('.md', '').replace(/[-_]/g, ' ');
            
            let initialContent;
            if (options.type === 'page') {
                initialContent = `---
title: "${title}"
layout: "page"
---

# ${title}

Start writing your page content here...
`;
            } else {
                initialContent = `---
title: "${title}"
date: "${now}"
category: ""
description: ""
---

# ${title}

Start writing your post content here...
`;
            }
            
            await fs.ensureDir(path.dirname(filePath));
            if (!await fs.pathExists(filePath)) {
                await fs.writeFile(filePath, initialContent);
                console.log(`📝 Created new ${options.type}: ${targetDir}/${filename}`);
            } else {
                console.log(`📄 Opening existing ${options.type}: ${targetDir}/${filename}`);
            }
            
            const editOptions = {
                file: filename,
                port: options.port,
                dir: options.dir
            };
            
            await program.commands.find(cmd => cmd.name() === 'edit').action(editOptions);
            
        } catch (error) {
            console.error('Create failed:', error.message);
            process.exit(1);
        }
    });

program.parse(process.argv);