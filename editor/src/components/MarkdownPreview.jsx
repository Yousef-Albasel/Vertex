import { memo, useMemo, useEffect, useRef } from "react";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark, oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";
import matter from "gray-matter";

const CodeBlock = memo(({ language, value, isDarkMode }) => (
  <SyntaxHighlighter
    style={isDarkMode ? oneDark : oneLight}
    language={language || "text"}
    PreTag="div"
    className="rounded-lg my-3 font-mono text-sm"
    customStyle={{ margin: 0, padding: '1rem', overflowX: 'auto', maxWidth: '100%' }}
  >
    {value}
  </SyntaxHighlighter>
));

const createComponents = (isDarkMode) => ({
  code({ inline, className, children, ...props }) {
    const match = /language-(\w+)/.exec(className || "");
    const codeString = String(children).replace(/\n$/, "");
    if (inline) {
      return (
        <code
          className={`px-1.5 py-0.5 rounded text-sm font-mono break-all ${
            isDarkMode ? "bg-gray-700 text-gray-100" : "bg-gray-100 text-gray-800"
          }`}
          {...props}
        >
          {children}
        </code>
      );
    }
    return <CodeBlock language={match?.[1]} value={codeString} isDarkMode={isDarkMode} />;
  },
  h1: ({ children }) => <h1 className={`text-2xl font-bold mt-4 mb-2 break-words ${isDarkMode ? "text-gray-100" : "text-gray-900"}`}>{children}</h1>,
  h2: ({ children }) => <h2 className={`text-xl font-semibold mt-4 mb-2 break-words ${isDarkMode ? "text-gray-100" : "text-gray-900"}`}>{children}</h2>,
  h3: ({ children }) => <h3 className={`text-lg font-semibold mt-4 mb-2 break-words ${isDarkMode ? "text-gray-100" : "text-gray-900"}`}>{children}</h3>,
  p: ({ children }) => <p className={`mb-2 break-words ${isDarkMode ? "text-gray-200" : "text-gray-800"}`}>{children}</p>,
  a: ({ children, href }) => <a href={href} className={`break-words ${isDarkMode ? "text-blue-400 hover:text-blue-300" : "text-blue-600 hover:text-blue-800"} hover:underline`}>{children}</a>,
  ul: ({ children }) => <ul className={`list-disc pl-6 my-2 space-y-1 break-words ${isDarkMode ? "text-gray-200" : "text-gray-800"}`}>{children}</ul>,
  ol: ({ children }) => <ol className={`list-decimal pl-6 my-2 space-y-1 break-words ${isDarkMode ? "text-gray-200" : "text-gray-800"}`}>{children}</ol>,
  li: ({ children }) => <li className="leading-relaxed break-words">{children}</li>,
  img: ({ src, alt }) => {
    const finalSrc = src?.startsWith('http') ? src : `http://localhost:3001${src}`;
    return (
      <img
        src={finalSrc}
        alt={alt}
        className="max-w-full h-auto my-2 rounded block"
      />
    );
  },
});

export default memo(function PreviewPane({ markdown, isDarkMode }) {
  const { content } = useMemo(() => matter(markdown || ""), [markdown]);
  const components = useMemo(() => createComponents(isDarkMode), [isDarkMode]);

  const containerRef = useRef(null);

  // scroll to bottom whenever markdown changes
  useEffect(() => {
    const container = containerRef.current;
    if (container) {
      container.scrollTop = container.scrollHeight;
    }
  }, [content]);

  return (
    <div
      ref={containerRef}
      className={`h-full overflow-y-auto overflow-x-hidden p-4 prose max-w-none ${isDarkMode ? "text-gray-200" : "text-gray-800"}`}
      style={{ wordWrap: 'break-word', overflowWrap: 'break-word', boxSizing: 'border-box' }}
    >
      <ReactMarkdown components={components}>{content}</ReactMarkdown>
    </div>
  );
});
