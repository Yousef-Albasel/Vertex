const fs = require('fs-extra');
const path = require('path');
const matter = require('gray-matter');
const MarkdownIt = require('markdown-it');
const hljs = require('highlight.js'); // ADD THIS
const nunjucks = require('nunjucks');
const { config } = require('process');

const md = MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  highlight: function (str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return '<pre class="hljs"><code>' +
               hljs.highlight(str, { language: lang, ignoreIllegals: true }).value +
               '</code></pre>';
      } catch (__) {}
    }
    return '<pre class="hljs"><code>' + md.utils.escapeHtml(str) + '</code></pre>';
  }
});

async function getHighlightStyles() {
    const hljsPath = require.resolve('highlight.js/styles/github-dark.css');
    const styles = await fs.readFile(hljsPath, 'utf8');
    return `<style>\n${styles}\n</style>`;
}

function getThemeDir(projectDir, themeName) {
    const themesDir = path.join(projectDir, 'themes');
    const themeDir = path.join(themesDir, themeName);
    
    if (!fs.existsSync(themeDir)) {
        console.log(`Theme '${themeName}' not found in themes/, using layout/ directory`);
        return path.join(projectDir, 'layout');
    }
    
    return themeDir;
}



async function build(projectDir = '.',opetions={}){
    const {port = 3000} = opetions;

    console.log('Starting Build Process...');
    try{
        // Load page config
        const config = await loadConfig(projectDir);
        config.baseURL = config.baseURL || `http://localhost:${port}`;

        console.log('Config loaded successfully');

        // Get theme directory
        const themeName = config.theme || 'default';
        const themeDir = getThemeDir(projectDir, themeName);
        console.log(`Using theme: ${themeName} from ${path.relative(projectDir, themeDir)}`);

        const env = setupTemplating(path.join(themeDir, 'templates'));
        console.log('Templates configured successfully');
        
        const outputDir = path.join(projectDir, 'public');
        await fs.emptyDir(outputDir);
        console.log('Output directory cleaned successfully');
        
        await copyStaticAssets(projectDir, outputDir);
        console.log('Static assets copied successfully');
        
        // Copy theme CSS files
        await copyThemeAssets(themeDir, outputDir);
        console.log('Theme assets copied successfully');
        
        // Process both flat posts and series
        const { posts, series } = await processMarkdownFiles(projectDir);
        console.log(`Processed ${posts.length} posts and ${series.length} series successfully`);
        
        // Process standalone pages (about, etc.)
        const pages = await processPages(projectDir);
        console.log(`Processed ${pages.length} pages successfully`);
 
        await copyHighlightJsStyles(outputDir);
        console.log('Syntax highlighting styles copied successfully');
 
        await generatePostPages(posts, env, config, outputDir);
        console.log('Post pages generated successfully');
        
        await generatePageFiles(pages, env, config, outputDir);
        console.log('Static pages generated successfully');
        
        // Generate series pages
        await generateSeriesPages(series, env, config, outputDir);
        console.log('Series pages generated successfully');
        
        await generateHomePage(posts, series, env, config, outputDir);
        console.log('Home page generated successfully');
        
        // Generate posts listing page
        await generatePostsListingPage(posts, series, env, config, outputDir);
        console.log('Posts listing page generated successfully');
        
        await generateAboutMePage(path.join(themeDir, 'templates'), config, outputDir);
        
        // Generate category pages
        await generateCategoryPages(posts, env, config, outputDir);
        console.log('Category pages generated successfully');

        // Generate categories index page
        await generateCategoriesIndexPage(posts, env, config, outputDir);
        console.log('Categories index page generated successfully');
        
        console.log('Build completed successfully!');
    }
    catch (error) {
        console.log('An Error Occured while building:',error);
    }
};

async function copyHighlightJsStyles(outputDir) {
    const hljsPath = require.resolve('highlight.js/styles/github-dark.css');
    const cssDir = path.join(outputDir, 'css');
    await fs.ensureDir(cssDir);
    await fs.copy(hljsPath, path.join(cssDir, 'highlight.css'));
}

async function loadConfig(projectDir) {
    const configPath = path.join(projectDir, 'config.json');

    if (await fs.pathExists(configPath)) {
        return await fs.readJSON(configPath);
    } else {
        const default_config = {
            name: 'My Site',
            description: 'Welcome to my site',
            email: 'hello@example.com',
            avatar: '/images/avatar.jpg',
            baseURL: 'http://localhost:3001',
            theme: 'default'
        };

        await fs.writeFile(configPath, JSON.stringify(default_config, null, 2));
        return default_config;
    }
}

function setupTemplating(templateDir){
    const env = nunjucks.configure(templateDir,{
        autoescape : true,
        throwOnUndefined : false
    });
    return env;
};

async function copyStaticAssets(projectDir,outputDir){
    const staticDir = path.join(projectDir,'static');
    if (await fs.pathExists(staticDir)){
        await fs.copy(staticDir,outputDir);
    }
}

// New function to copy theme assets (CSS, JS, etc.)
async function copyThemeAssets(themeDir, outputDir) {
    const themeStaticDir = path.join(themeDir, 'static');
    
    if (await fs.pathExists(themeStaticDir)) {
        // Copy the entire static directory from theme
        await fs.copy(themeStaticDir, outputDir, {
            overwrite: true,
            errorOnExist: false
        });
        console.log('Theme static assets copied from theme/static/');
    } else {
        console.log('No static directory found in theme, skipping theme assets');
    }
}

async function processMarkdownFiles(projectDir) {
    const contentDir = path.join(projectDir, 'content');
    const posts = [];
    const series = [];
    
    if (!(await fs.pathExists(contentDir))) {
        console.log('No content directory found, skipping..');
        return { posts, series };
    }

    const items = await fs.readdir(contentDir, { withFileTypes: true });
    
    // Process flat markdown files (existing behavior)
    const markdownFiles = items
        .filter(item => item.isFile() && item.name.endsWith('.md'))
        .map(item => item.name);

    for (const file of markdownFiles) {
        const filePath = path.join(contentDir, file);
        const post = await processMarkdownFile(filePath, file);
        posts.push(post);
    }

    // Process directories (series)
    const directories = items.filter(item => item.isDirectory());
    
    for (const dir of directories) {
        const dirPath = path.join(contentDir, dir.name);
        const indexPath = path.join(dirPath, '_index.md');
        
        // Check if directory has _index.md
        if (await fs.pathExists(indexPath)) {
            const seriesData = await processSeriesDirectory(dirPath, dir.name);
            if (seriesData) {
                series.push(seriesData);
                // Add series posts to main posts array
                posts.push(...seriesData.posts);
            }
        } else {
            console.warn(`Directory ${dir.name} found but no _index.md file. Skipping...`);
        }
    }
    
    // Sort all posts by date (newest first)
    posts.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    return { posts, series };
}

async function processMarkdownFile(filePath, filename, seriesSlug = null) {
    const fileContent = await fs.readFile(filePath, "utf8");
    const { data: frontMatter, content } = matter(fileContent);
    const htmlContent = md.render(content);
    
    const slug = path.basename(filename, '.md');
    const post = {
        slug: seriesSlug ? `${seriesSlug}/${slug}` : slug,
        title: frontMatter.title || slug,
        description: frontMatter.description || '',
        date: frontMatter.date || new Date().toISOString().split('T')[0],
        category: frontMatter.category || '',
        image: frontMatter.image || '',
        layout: frontMatter.layout || 'post',
        content: htmlContent,
        url: seriesSlug ? `/${seriesSlug}/${slug}.html` : `/${slug}.html`,
        frontMatter,
        series: seriesSlug,
        order: frontMatter.order || 0,
        ...frontMatter
    };
    
    return post;
}

async function processSeriesDirectory(dirPath, dirName) {
    const indexPath = path.join(dirPath, '_index.md');
    
    // Read series metadata from _index.md
    const indexContent = await fs.readFile(indexPath, "utf8");
    const { data: seriesMetadata, content: seriesDescription } = matter(indexContent);
    
    const seriesSlug = dirName.toLowerCase().replace(/\s+/g, '-');
    
    // Get all markdown files in the series directory (except _index.md)
    const files = await fs.readdir(dirPath);
    const markdownFiles = files.filter(f => f.endsWith('.md') && f !== '_index.md');
    
    const seriesPosts = [];
    
    for (const file of markdownFiles) {
        const filePath = path.join(dirPath, file);
        const post = await processMarkdownFile(filePath, file, seriesSlug);
        seriesPosts.push(post);
    }
    
    // Sort series posts by order (if specified) then by date
    seriesPosts.sort((a, b) => {
        if (a.order !== b.order) {
            return a.order - b.order;
        }
        return new Date(a.date) - new Date(b.date);
    });
    
    // Add navigation links to each post in the series
    seriesPosts.forEach((post, index) => {
        post.seriesInfo = {
            title: seriesMetadata.title || dirName,
            slug: seriesSlug,
            currentIndex: index + 1,
            totalPosts: seriesPosts.length,
            previousPost: index > 0 ? seriesPosts[index - 1] : null,
            nextPost: index < seriesPosts.length - 1 ? seriesPosts[index + 1] : null
        };
    });
    
    return {
        slug: seriesSlug,
        title: seriesMetadata.title || dirName,
        description: seriesMetadata.description || '',
        category: seriesMetadata.category || '',
        image: seriesMetadata.image || '',
        date: seriesMetadata.date || new Date().toISOString().split('T')[0],
        layout: seriesMetadata.layout || 'series',
        content: md.render(seriesDescription),
        url: `/${seriesSlug}/index.html`,
        posts: seriesPosts,
        postCount: seriesPosts.length,
        frontMatter: seriesMetadata,
        ...seriesMetadata
    };
}

async function processPages(projectDir) {
    const pagesDir = path.join(projectDir, 'pages');
    const pages = [];
    
    if (!(await fs.pathExists(pagesDir))) {
        console.log('No pages directory found, skipping..');
        return pages;
    }
    
    const files = await fs.readdir(pagesDir);
    const markdownFiles = files.filter(file => file.endsWith('.md'));

    for (const file of markdownFiles) {
        const filePath = path.join(pagesDir, file);
        const fileContent = await fs.readFile(filePath, "utf8");
        const { data: frontMatter, content } = matter(fileContent);
        const htmlContent = md.render(content);
        
        const slug = path.basename(file, '.md');
        const page = {
            slug,
            title: frontMatter.title || slug,
            description: frontMatter.description || '',
            layout: frontMatter.layout || 'page',
            content: htmlContent,
            url: `/${slug}.html`,
            frontMatter,
            ...frontMatter
        };
        pages.push(page);
    }
    
    return pages;
}

async function generatePostPages(posts, env, config, outputDir) {
    for (const post of posts) {
        const templateName = `${post.layout}.html`;
        
        try {
            // Create subdirectory if post is part of a series
            if (post.series) {
                await fs.ensureDir(path.join(outputDir, post.series));
            }
            
            // Render the post using its specified layout
            const html = env.render(templateName, {
                ...post,
                site: config
            });
            
            const outputPath = post.series 
                ? path.join(outputDir, `${post.series}`, `${path.basename(post.slug)}.html`)
                : path.join(outputDir, `${post.slug}.html`);
            
            await fs.writeFile(outputPath, html);
            
        } catch (error) {
            console.error(`Error generating page for ${post.slug}:`, error.message);
        }
    }
}

async function generateSeriesPages(series, env, config, outputDir) {
    for (const seriesItem of series) {
        const templateName = `${seriesItem.layout}.html`;
        
        try {
            // Create series directory
            const seriesDir = path.join(outputDir, seriesItem.slug);
            await fs.ensureDir(seriesDir);
            
            // Render the series index page
            const html = env.render(templateName, {
                ...seriesItem,
                site: config
            });
            
            const outputPath = path.join(seriesDir, 'index.html');
            await fs.writeFile(outputPath, html);
            
        } catch (error) {
            console.error(`Error generating series page for ${seriesItem.slug}:`, error.message);
        }
    }
}

async function generatePageFiles(pages, env, config, outputDir) {
    for (const page of pages) {
        const templateName = `${page.layout}.html`;
        
        try {
            const html = env.render(templateName, {
                ...page,
                site: config
            });
            
            const outputPath = path.join(outputDir, `${page.slug}.html`);
            await fs.writeFile(outputPath, html);
            
        } catch (error) {
            console.error(`Error generating page for ${page.slug}:`, error.message);
        }
    }
}

async function generateHomePage(posts, series, env, config, outputDir) {
    try {
        // Get latest posts for cards (first 6)
        const latestPosts = posts.slice(0, 6);
        const quickLinks = Object.entries(config.links || {}).map(([label, obj]) => ({
            label,
            href: obj.href,
            icon: obj.icon || null
        }));
        
        // Render home page
        const html = env.render('index.html', {
            site: config,
            posts: posts,
            series: series,
            latestPosts: latestPosts,
            links: quickLinks
        });

        const outputPath = path.join(outputDir, 'index.html');
        await fs.writeFile(outputPath, html);
        
    } catch (error) {
        console.error('Error generating home page:', error.message);
        throw error;
    }
}

async function generatePostsListingPage(posts, series, env, config, outputDir) {
    try {
        const html = env.render('posts.html', {
            site: config,
            posts: posts,
            series: series,
            title: 'All Posts'
        });
        
        const outputPath = path.join(outputDir, 'posts.html');
        await fs.writeFile(outputPath, html);
        
    } catch (error) {
        console.error('Error generating posts listing page:', error.message);
        throw error;
    }
}

async function generateAboutMePage(themeDir, siteConfig, outputDir) {
    const nunjucksEnv = setupTemplating(themeDir);
    const html = nunjucksEnv.render('aboutme.html', { site: siteConfig });
    await fs.outputFile(path.join(outputDir, 'aboutme.html'), html);
}

async function generateCategoryPages(posts, env, config, outputDir) {
    // Group posts by category
    const postsByCategory = {};
    
    posts.forEach(post => {
        if (post.category) {
            if (!postsByCategory[post.category]) {
                postsByCategory[post.category] = [];
            }
            postsByCategory[post.category].push(post);
        }
    });
    
    // Create category directory
    const categoryDir = path.join(outputDir, 'categories');
    await fs.ensureDir(categoryDir);
    
    // Generate individual category pages
    for (const [category, categoryPosts] of Object.entries(postsByCategory)) {
        try {
            const html = env.render('category.html', {
                site: config,
                posts: categoryPosts,
                category: category,
                title: `Posts in ${category}`
            });
            
            const outputPath = path.join(categoryDir, `${category.toLowerCase().replace(/\s+/g, '-')}.html`);
            await fs.writeFile(outputPath, html);
            
        } catch (error) {
            console.error(`Error generating category page for ${category}:`, error.message);
        }
    }
}

async function generateCategoriesIndexPage(posts, env, config, outputDir) {
    // Group posts by category and count them
    const categories = {};
    
    posts.forEach(post => {
        if (post.category) {
            if (!categories[post.category]) {
                categories[post.category] = {
                    name: post.category,
                    count: 0,
                    posts: [],
                    slug: post.category.toLowerCase().replace(/\s+/g, '-')
                };
            }
            categories[post.category].count++;
            categories[post.category].posts.push(post);
        }
    });
    
    try {
        const html = env.render('categories.html', {
            site: config,
            categories: Object.values(categories),
            title: 'Categories'
        });
        
        const outputPath = path.join(outputDir, 'categories.html');
        await fs.writeFile(outputPath, html);
        
    } catch (error) {
        console.error('Error generating categories index page:', error.message);
        throw error;
    }
}

module.exports = build;