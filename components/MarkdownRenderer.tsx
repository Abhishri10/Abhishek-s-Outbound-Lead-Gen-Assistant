
import React from 'react';

interface MarkdownRendererProps {
  content: string;
  className?: string;
}

/**
 * A simple, lightweight Markdown-to-HTML renderer that handles basic formatting:
 * - Headers (###, ##, #)
 * - Bold (**text**)
 * - Bullet points (- or *)
 * - Line breaks
 */
const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({ content, className = '' }) => {
  const parseMarkdown = (text: string) => {
    // Split by lines to handle block-level elements
    const lines = text.split('\n');
    
    return lines.map((line, index) => {
      const trimmedLine = line.trim();
      
      // Handle Headers
      if (trimmedLine.startsWith('###')) {
        return <h3 key={index} className="text-lg font-bold text-slate-800 mt-4 mb-2">{trimmedLine.replace(/^###\s*/, '')}</h3>;
      }
      if (trimmedLine.startsWith('##')) {
        return <h2 key={index} className="text-xl font-bold text-slate-800 mt-5 mb-3 border-b pb-1">{trimmedLine.replace(/^##\s*/, '')}</h2>;
      }
      if (trimmedLine.startsWith('#')) {
        return <h1 key={index} className="text-2xl font-black text-slate-900 mt-6 mb-4">{trimmedLine.replace(/^#\s*/, '')}</h1>;
      }

      // Handle Bullet Points
      if (trimmedLine.startsWith('- ') || trimmedLine.startsWith('* ')) {
        const content = trimmedLine.replace(/^[-*]\s*/, '');
        return (
          <li key={index} className="ml-4 mb-1 list-disc text-slate-700 leading-relaxed">
            {renderInlineMarkdown(content)}
          </li>
        );
      }

      // Handle empty lines
      if (trimmedLine === '') {
        return <div key={index} className="h-2" />;
      }

      // Default paragraph
      return (
        <p key={index} className="mb-3 text-slate-700 leading-relaxed text-sm md:text-base">
          {renderInlineMarkdown(line)}
        </p>
      );
    });
  };

  const renderInlineMarkdown = (text: string) => {
    // Handle Bold
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, i) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={i} className="font-bold text-slate-900">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  return (
    <div className={`markdown-body ${className}`}>
      {parseMarkdown(content)}
    </div>
  );
};

export default MarkdownRenderer;
