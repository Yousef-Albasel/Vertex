#!/usr/bin/env node

const { Command } = require('commander');
const build = require('./build');
const serve = require('./serve');

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
            await serve(options.dir, options.port);
        } catch (error) {
            console.error('Server failed:', error.message);
            process.exit(1);
        }
    });

program.parse(process.argv);