const express = require('express');
const path = require('path');
const chokidar = require('chokidar');
const build = require('./build');

async function serve(projectDir = '.', port = 3001) {
    // Make sure publicDir is absolute
    const publicDir = path.resolve(projectDir, 'public');
    
    console.log('Building site for first time...');
    await build(projectDir, {port});
    const app = express();
    app.use(express.static(publicDir));
    
    // Handle clean URLs (remove .html extension)
    app.use((req, res, next) => {
        if (req.path.indexOf('.') === -1 && req.path !== '/') {
            const htmlPath = path.resolve(publicDir, req.path.slice(1) + '.html');
            res.sendFile(htmlPath, (err) => {
                if (err) {
                    next(); // Continue to 404 handler
                }
            });
        } else {
            next();
        }
    });
    
    app.get('/', (req, res) => {
        res.sendFile(path.resolve(publicDir, 'index.html'));
    });

    // Handle /posts route
    app.get('/posts', (req, res) => {
        res.sendFile(path.resolve(publicDir, 'posts.html'));
    });

    // Handle /categories route
    app.get('/categories', (req, res) => {
        res.sendFile(path.resolve(publicDir, 'categories.html'));
    });

    // Handle /about route
    app.get('/aboutme', (req, res) => {
        res.sendFile(path.resolve(publicDir, 'aboutme.html'));
    });

    app.get('/categories/:category', (req, res) => {
        const categoryFile = path.resolve(publicDir, 'categories', `${req.params.category}.html`);
        res.sendFile(categoryFile, (err) => {
            if (err) {
                res.status(404).sendFile(path.resolve(publicDir, '404.html'), (err2) => {
                    if (err2) {
                        res.status(404).send('Category not found');
                    }
                });
            }
        });
    });
    
    // 404 handler
    app.use((req, res) => {
        res.status(404).send(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>404 - Page Not Found</title>
                <style>
                    body { 
                        font-family: Arial, sans-serif; 
                        text-align: center; 
                        padding: 50px; 
                        background: #f4f4f4; 
                    }
                    .container { 
                        max-width: 500px; 
                        margin: 0 auto; 
                        background: white; 
                        padding: 40px; 
                        border-radius: 10px; 
                        box-shadow: 0 4px 6px rgba(0,0,0,0.1); 
                    }
                    h1 { color: #333; }
                    a { 
                        color: #007acc; 
                        text-decoration: none; 
                        font-weight: bold; 
                    }
                    a:hover { text-decoration: underline; }
                </style>
            </head>
            <body>
                <div class="container">
                    <h1>404 - Page Not Found</h1>
                    <p>The page <code>${req.url}</code> was not found.</p>
                    <a href="/">← Go Home</a>
                </div>
            </body>
            </html>
        `);
    });
    
    // Start server
    const server = app.listen(port, () => {
        console.log(`Server running at http://localhost:${port}`);
        console.log('Watching for file changes...');
    });
    
    const watchPaths = [
        path.join(projectDir, 'content'),
        path.join(projectDir, 'pages'),
        path.join(projectDir, 'layout'),
        path.join(projectDir, 'static'),
        path.join(projectDir, 'config.json')
    ];
    
    const watcher = chokidar.watch(watchPaths, {
        ignored: /node_modules/,
        persistent: true,
        ignoreInitial: true // Don't trigger on startup
    });
    
    let rebuildTimer;
    const rebuild = async (eventType, filePath) => {
        clearTimeout(rebuildTimer);
        rebuildTimer = setTimeout(async () => {
            try {
                console.log(`File ${eventType}: ${path.relative(projectDir, filePath)}`);
                console.log('Rebuilding...');
                await build(projectDir, { port });
                console.log('Rebuild complete!');
            } catch (error) {
                console.error('Rebuild failed:', error.message);
            }
        }, 300); // Wait 300ms after last change
    };
    
    watcher.on('change', (filePath) => rebuild('changed', filePath));
    watcher.on('add', (filePath) => rebuild('added', filePath));
    watcher.on('unlink', (filePath) => rebuild('removed', filePath));
    
    process.on('SIGINT', () => {
        console.log('\n Shutting down server...');
        watcher.close();
        server.close(() => {
            console.log('Server closed.');
            process.exit(0);
        });
    });
    
    return server;
}

module.exports = serve;