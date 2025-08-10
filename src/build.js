const fs = require('fs-extra');
const path = require('path');
const matter = require('gray-matter');
const MarkdownIt = require('markdown-it');
const nunjucks = require('nunjucks');
const { config } = require('process');

const md = MarkdownIt({
  html: true,
  linkify: true,
  typographer: true
})

async function build(projectDir = '.'){
    console.log('Starting Build Process...');
    try{
        // Load page config
        const config = await loadConfig(projectDir);
        console.log('Config loaded successfully');

        const env = setupTemplating(projectDir);
        console.log('Templates configured successfully');
        
        const outputDir = path.join(projectDir, 'public');
        await fs.emptyDir(outputDir);
        console.log('Output directory cleaned successfully');
        
        await copyStaticAssets(projectDir, outputDir);
        console.log('Static assets copied successfully');
        
        const posts = await processMarkdownFiles(projectDir);
        console.log(`Processed ${posts.length} posts successfully`);
        
        // Process standalone pages (about, etc.)
        const pages = await processPages(projectDir);
        console.log(`Processed ${pages.length} pages successfully`);
        
        await generatePostPages(posts, env, config, outputDir);
        console.log('Post pages generated successfully');
        
        await generatePageFiles(pages, env, config, outputDir);
        console.log('Static pages generated successfully');
        
        await generateHomePage(posts, env, config, outputDir);
        console.log('Home page generated successfully');
        
        // Generate posts listing page
        await generatePostsListingPage(posts, env, config, outputDir);
        console.log('Posts listing page generated successfully');
        await generateAboutMePage(projectDir, config, outputDir);
        
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
            baseURL: 'http://localhost:3000'
        };

        await fs.writeFile(configPath, JSON.stringify(default_config, null, 2));
        return default_config;
    }
}

function setupTemplating(projectDir){
    const templateDir = path.join(projectDir,'layout');
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

async function processMarkdownFiles(projectDir){
    const contentDir = path.join(projectDir,'content');
    const posts = [];
    if (!(await fs.pathExists(contentDir))){
        console.log('No content directory found, skipping..');
        return posts
    }
    const files = await fs.readdir(contentDir);
    const markdownFiles = files.filter(file => file.endsWith('.md'));

    for (const file of markdownFiles){
        const filePath = path.join(contentDir,file);
        const fileContent = await fs.readFile(filePath,"utf8");
        const {data:frontMatter,content} = matter(fileContent);
        const htmlContent = md.render(content);
        // Create post objects
        const slug = path.basename(file,'.md');
        const post = {
            slug,
            title:frontMatter.title||slug,
            description:frontMatter.description||'',
            date:frontMatter.date||new Date().toISOString().split('T')[0],
            category:frontMatter.category||'',
            image:frontMatter.image||'',
            layout: frontMatter.layout || 'post',
            content: htmlContent,
            url: `/${slug}.html`,
            frontMatter,
            ...frontMatter
        };
        posts.push(post);
    }
    posts.sort((a,b)=>new Date(b.date) - new Date(a.date));
    return posts;
}

async function generateAboutMePage(projectDir, siteConfig, outputDir) {
    const nunjucksEnv = setupTemplating(projectDir);
    const html = nunjucksEnv.render('aboutme.html', { site: siteConfig });
    await fs.outputFile(path.join(outputDir, 'aboutme.html'), html);
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

async function generatePostPages(posts,env,config,outputDir){
    for (const post of posts) {
    const templateName = `${post.layout}.html`;
    
    try {
        // Render the post using its specified layout
        const html = env.render(templateName, {
            ...post,
            site: config
        });
        
        const outputPath = path.join(outputDir, `${post.slug}.html`);
        await fs.writeFile(outputPath, html);
        
    }   catch (error) {
        console.error(`Error generating page for ${post.slug}:`, error.message);
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

async function generateHomePage(posts, env, config, outputDir) {
    try {
        // Get latest posts for cards (first 6)
        const latestPosts = posts.slice(0, 6);
        const quickLinks = Object.entries(config.links).map(([label, obj]) => ({
            label,
            href: obj.href,
            icon: obj.icon || null
        }));
        
        // Render home page
        const html = env.render('index.html', {
            site: config,
            posts: posts,
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

async function generatePostsListingPage(posts, env, config, outputDir) {
    try {
        const html = env.render('posts.html', {
            site: config,
            posts: posts,
            title: 'All Posts'
        });
        
        const outputPath = path.join(outputDir, 'posts.html');
        await fs.writeFile(outputPath, html);
        
    } catch (error) {
        console.error('Error generating posts listing page:', error.message);
        throw error;
    }
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