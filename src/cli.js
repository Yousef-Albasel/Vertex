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
    .option('-p, --port <port>', 'Port to serve on', '3001')
    .option('-d, --dir <directory>', 'Project directory', '.')
    .action(async (options) => {
        try {
            console.log('Starting development server... 🚀');
            await serve(options.dir, parseInt(options.port));
        } catch (error) {
            console.error('Server failed:', error.message);
            process.exit(1);
        }
    });

// Theme management commands
program
    .command('theme')
    .description('Manage themes')
    .addCommand(
        new Command('list')
            .description('List all available themes')
            .option('-d, --dir <directory>', 'Project directory', '.')
            .action(async (options) => {
                try {
                    const projectDir = path.resolve(options.dir);
                    const themesDir = path.join(projectDir, 'themes');
                    const configPath = path.join(projectDir, 'config.json');
                    
                    let currentTheme = 'default';
                    if (await fs.pathExists(configPath)) {
                        const config = await fs.readJSON(configPath);
                        currentTheme = config.theme || 'default';
                    }
                    
                    console.log('\n📁 Available Themes:\n');
                    
                    if (await fs.pathExists(themesDir)) {
                        const themes = await fs.readdir(themesDir, { withFileTypes: true });
                        const themeFolders = themes.filter(t => t.isDirectory());
                        
                        if (themeFolders.length === 0) {
                            console.log('   No themes found in themes/ directory');
                        } else {
                            for (const theme of themeFolders) {
                                const isCurrent = theme.name === currentTheme;
                                const marker = isCurrent ? '✓' : ' ';
                                console.log(`   [${marker}] ${theme.name}${isCurrent ? ' (active)' : ''}`);
                            }
                        }
                    } else {
                        console.log('   No themes directory found');
                    }
                    
                    // Check for legacy layout directory
                    const layoutDir = path.join(projectDir, 'layout');
                    if (await fs.pathExists(layoutDir)) {
                        const isActive = currentTheme === 'default' && !await fs.pathExists(path.join(themesDir, 'default'));
                        console.log(`\n   Legacy layout/ directory${isActive ? ' (active)' : ''}`);
                    }
                    
                    console.log('\n');
                } catch (error) {
                    console.error('Failed to list themes:', error.message);
                    process.exit(1);
                }
            })
    )
    .addCommand(
        new Command('set')
            .description('Set the active theme')
            .argument('<theme>', 'Theme name to activate')
            .option('-d, --dir <directory>', 'Project directory', '.')
            .action(async (themeName, options) => {
                try {
                    const projectDir = path.resolve(options.dir);
                    const themesDir = path.join(projectDir, 'themes');
                    const themeDir = path.join(themesDir, themeName);
                    const configPath = path.join(projectDir, 'config.json');
                    
                    // Check if theme exists
                    if (!await fs.pathExists(themeDir)) {
                        console.error(`❌ Theme '${themeName}' not found in themes/ directory`);
                        process.exit(1);
                    }
                    
                    // Update config
                    let config = {};
                    if (await fs.pathExists(configPath)) {
                        config = await fs.readJSON(configPath);
                    }
                    
                    config.theme = themeName;
                    await fs.writeJSON(configPath, config, { spaces: 2 });
                    
                    console.log(`✅ Active theme set to: ${themeName}`);
                    console.log('   Run "vertex build" to apply the theme');
                    
                } catch (error) {
                    console.error('Failed to set theme:', error.message);
                    process.exit(1);
                }
            })
    )
    .addCommand(
        new Command('create')
            .description('Create a new theme from the current layout')
            .argument('<name>', 'Name for the new theme')
            .option('-d, --dir <directory>', 'Project directory', '.')
            .option('-f, --from <source>', 'Source theme to copy from', 'layout')
            .action(async (themeName, options) => {
                try {
                    const projectDir = path.resolve(options.dir);
                    const themesDir = path.join(projectDir, 'themes');
                    const newThemeDir = path.join(themesDir, themeName);
                    
                    // Check if theme already exists
                    if (await fs.pathExists(newThemeDir)) {
                        console.error(`❌ Theme '${themeName}' already exists`);
                        process.exit(1);
                    }
                    
                    // Determine source directory
                    let sourceDir;
                    if (options.from === 'layout') {
                        sourceDir = path.join(projectDir, 'layout');
                    } else {
                        sourceDir = path.join(themesDir, options.from);
                    }
                    
                    if (!await fs.pathExists(sourceDir)) {
                        console.error(`❌ Source '${options.from}' not found`);
                        process.exit(1);
                    }
                    
                    // Create themes directory if it doesn't exist
                    await fs.ensureDir(themesDir);
                    
                    // Copy the source to new theme
                    await fs.copy(sourceDir, newThemeDir);
                    
                    console.log(`✅ Created new theme: ${themeName}`);
                    console.log(`   Location: themes/${themeName}/`);
                    console.log(`   Set as active: vertex theme set ${themeName}`);
                    
                } catch (error) {
                    console.error('Failed to create theme:', error.message);
                    process.exit(1);
                }
            })
    );

// Editor command
program
    .command('edit')
    .description('Open the Vertex editor')
    .option('-f, --file <filename>', 'Open specific file in editor')
    .option('-p, --port <port>', 'API server port', '3001')
    .option('-d, --dir <directory>', 'Project directory', '.')
    .action(async (options) => {
        try {
            console.log('Starting Vertex Editor...');
            
            const projectDir = path.resolve(options.dir);
            const editorDir = path.join(projectDir, 'editor');
            
            if (!await fs.pathExists(editorDir)) {
                console.error('Editor not found. Make sure the markdown-editor directory exists.');
                process.exit(1);
            }
            
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

                if (options.file) {
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
                console.log('\nShutting down Vertex Editor...');
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
                console.log(`Created new ${options.type}: ${targetDir}/${filename}`);
            } else {
                console.log(`Opening existing ${options.type}: ${targetDir}/${filename}`);
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