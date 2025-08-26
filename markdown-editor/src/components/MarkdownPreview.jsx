import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark, oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";
import matter from "gray-matter";
import React from "react";

export default function PreviewPane({ markdown, isDarkMode }) {
  const { content } = matter(markdown || "");

  return (
    <div
      className={`h-full overflow-y-auto overflow-x-hidden p-4 prose max-w-none ${
        isDarkMode ? "text-gray-200" : "text-gray-800"
      }`}
      style={{
        wordWrap: 'break-word',
        overflowWrap: 'break-word',
        boxSizing: 'border-box'
      }}
    >
      <ReactMarkdown
        components={{
          // Headers
          h1: ({ children }) => (
            <h1
              className={`text-2xl font-bold mt-4 mb-2 break-words ${
                isDarkMode ? "text-gray-100" : "text-gray-900"
              }`}
            >
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2
              className={`text-xl font-semibold mt-4 mb-2 break-words ${
                isDarkMode ? "text-gray-100" : "text-gray-900"
              }`}
            >
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3
              className={`text-lg font-semibold mt-4 mb-2 break-words ${
                isDarkMode ? "text-gray-100" : "text-gray-900"
              }`}
            >
              {children}
            </h3>
          ),

          // Text formatting
          strong: ({ children }) => (
            <strong className={`break-words ${isDarkMode ? "text-gray-100" : "text-gray-900"}`}>
              {children}
            </strong>
          ),
          em: ({ children }) => (
            <em className={`break-words ${isDarkMode ? "text-gray-200" : "text-gray-700"}`}>
              {children}
            </em>
          ),

          // Code with syntax highlighting
          code({ inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || "");
            const codeString = String(children).replace(/\n$/, "");
            const [copied, setCopied] = React.useState(false);
            const handleCopy = () => {
            navigator.clipboard.writeText(codeString);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
            };

            if (inline) {
              return (
                <code
                  className={`px-1.5 py-0.5 rounded text-sm font-mono break-all ${
                    isDarkMode
                      ? "bg-gray-700 text-gray-100"
                      : "bg-gray-100 text-gray-800"
                  }`}
                  {...props}
                >
                  {children}
                </code>
              );
            }

            return (
              <div className="relative group overflow-x-auto">
                <button
                  onClick={() => {handleCopy()}}
                  className="absolute top-2 right-2 px-2 py-1 text-xs rounded bg-gray-600 text-white opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer z-10"
                >
                  {copied ? "Copied!" : "Copy"}
                </button>
                <div className="overflow-x-auto">
                  <SyntaxHighlighter
                    style={isDarkMode ? oneDark : oneLight}
                    language={match ? match[1] : "text"}
                    PreTag="div"
                    className="rounded-lg my-3 font-mono text-sm"
                    customStyle={{
                      margin: 0,
                      padding: '1rem',
                      overflowX: 'auto',
                      maxWidth: '100%'
                    }}
                  >
                    {codeString}
                  </SyntaxHighlighter>
                </div>
              </div>
            );
          },

          // Links
          a: ({ children, href }) => (
            <a
              href={href}
              className={`break-words ${
                isDarkMode
                  ? "text-blue-400 hover:text-blue-300"
                  : "text-blue-600 hover:text-blue-800"
              } hover:underline`}
            >
              {children}
            </a>
          ),

          // Images
          img: ({ src, alt }) => (
            <img
              src={src}
              alt={alt}
              className="max-w-full h-auto my-2 rounded block"
            />
          ),

          // Lists
          ul: ({ children }) => (
            <ul
              className={`list-disc pl-6 my-2 space-y-1 break-words ${
                isDarkMode ? "text-gray-200" : "text-gray-800"
              }`}
            >
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol
              className={`list-decimal pl-6 my-2 space-y-1 break-words ${
                isDarkMode ? "text-gray-200" : "text-gray-800"
              }`}
            >
              {children}
            </ol>
          ),
          li: ({ children }) => <li className="leading-relaxed break-words">{children}</li>,

          // Blockquotes
          blockquote: ({ children }) => (
            <blockquote
              className={`${
                isDarkMode
                  ? "border-gray-600 text-gray-300 bg-gray-800"
                  : "border-gray-300 text-gray-600 bg-gray-50"
              } border-l-4 pl-4 py-2 my-2 italic rounded-r break-words`}
            >
              {children}
            </blockquote>
          ),

          // Paragraphs
          p: ({ children }) => (
            <p
              className={`mb-2 break-words ${
                isDarkMode ? "text-gray-200" : "text-gray-800"
              }`}
            >
              {children}
            </p>
          ),

          // Tables (add proper wrapping for tables)
          table: ({ children }) => (
            <div className="overflow-x-auto my-4">
              <table className={`min-w-full border-collapse ${
                isDarkMode ? "border-gray-600" : "border-gray-300"
              }`}>
                {children}
              </table>
            </div>
          ),

          // Prevent pre elements from breaking layout
          pre: ({ children }) => (
            <div className="overflow-x-auto">
              <pre className="whitespace-pre-wrap break-words">
                {children}
              </pre>
            </div>
          ),
        }}
      >
        {content || ""}
      </ReactMarkdown>
    </div>
  );
}