import ReactMarkdown from "react-markdown";

export default function PreviewPane({ markdown, isDarkMode }) {
  return (
    <div className={`h-full overflow-y-auto p-4 prose max-w-none ${
      isDarkMode ? 'text-gray-200' : 'text-gray-800'
    }`}>
      <ReactMarkdown
        components={{
          // Headers
          h1: ({children}) => (
            <h1 className={`text-2xl font-bold mt-4 mb-2 ${
              isDarkMode ? 'text-gray-100' : 'text-gray-900'
            }`}>
              {children}
            </h1>
          ),
          h2: ({children}) => (
            <h2 className={`text-xl font-semibold mt-4 mb-2 ${
              isDarkMode ? 'text-gray-100' : 'text-gray-900'
            }`}>
              {children}
            </h2>
          ),
          h3: ({children}) => (
            <h3 className={`text-lg font-semibold mt-4 mb-2 ${
              isDarkMode ? 'text-gray-100' : 'text-gray-900'
            }`}>
              {children}
            </h3>
          ),
          
          // Text formatting
          strong: ({children}) => (
            <strong className={isDarkMode ? 'text-gray-100' : 'text-gray-900'}>
              {children}
            </strong>
          ),
          em: ({children}) => (
            <em className={isDarkMode ? 'text-gray-200' : 'text-gray-700'}>
              {children}
            </em>
          ),
          
          // Code
          code: ({node, inline, className, children, ...props}) => {
            if (inline) {
              return (
                <code 
                  className={`${isDarkMode ? 'bg-gray-700 text-gray-100' : 'bg-gray-100 text-gray-800'} px-1 rounded`}
                  {...props}
                >
                  {children}
                </code>
              );
            }
            return (
              <pre className={`${isDarkMode ? 'bg-gray-800 text-gray-100 border-gray-600' : 'bg-gray-100 text-gray-900'} p-3 rounded-md overflow-x-auto border`}>
                <code className={className} {...props}>
                  {children}
                </code>
              </pre>
            );
          },
          
          // Links
          a: ({children, href}) => (
            <a 
              href={href}
              className={`${isDarkMode ? 'text-blue-400 hover:text-blue-300' : 'text-blue-600 hover:text-blue-800'} hover:underline`}
            >
              {children}
            </a>
          ),
          
          // Images
          img: ({src, alt}) => (
            <img 
              src={src} 
              alt={alt} 
              className="max-w-full h-auto my-2 rounded" 
            />
          ),
          
          // Lists
          li: ({children}) => (
            <li className={`ml-4 ${isDarkMode ? 'text-gray-200' : 'text-gray-700'}`}>
              {children}
            </li>
          ),
          
          // Blockquotes
          blockquote: ({children}) => (
            <blockquote className={`${
              isDarkMode 
                ? 'border-gray-600 text-gray-300 bg-gray-800' 
                : 'border-gray-300 text-gray-600 bg-gray-50'
            } border-l-4 pl-4 py-2 my-2 italic rounded-r`}>
              {children}
            </blockquote>
          ),
          
          // Paragraphs
          p: ({children}) => (
            <p className={`mb-2 ${isDarkMode ? 'text-gray-200' : 'text-gray-800'}`}>
              {children}
            </p>
          )
        }}
      >
        {markdown || ""}
      </ReactMarkdown>
    </div>
  );
}