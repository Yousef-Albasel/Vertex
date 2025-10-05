
import MarkdownIt from 'markdown-it';
// Create a unified markdown-it instance with the same settings used in build.js
export const createMarkdownRenderer = () => {
  return new MarkdownIt({
    html: true,
    linkify: true,
    typographer: true,
    breaks: false // Set to true if you want single line breaks to create <br>
  });
};

export const md = createMarkdownRenderer();

export const renderMarkdown = (content) => {
  if (!content) return '';
  return md.render(content);
};

// Update your build.js to use the same configuration:
// const md = MarkdownIt({
//   html: true,
//   linkify: true,
//   typographer: true
// })