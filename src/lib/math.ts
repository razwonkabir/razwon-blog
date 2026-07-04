import katex from 'katex';

/**
 * Preprocesses markdown string to replace LaTeX math blocks ($...$ and $$...$$)
 * with pre-rendered KaTeX HTML. This works flawlessly when rendered by react-markdown
 * with rehype-raw.
 */
export function renderMathInMarkdown(md: string): string {
  if (!md) return '';
  
  // 1. Replace display math blocks: $$ ... $$
  let processed = md.replace(/\$\$\s*([\s\S]+?)\s*\$\$/g, (_, formula) => {
    try {
      // Decode simple HTML entities if any got encoded
      const cleanFormula = formula
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&');
      return `<div class="katex-display-wrapper my-4 py-2 overflow-x-auto select-all text-center">${katex.renderToString(cleanFormula, { displayMode: true, throwOnError: false })}</div>`;
    } catch (err) {
      console.error("Math error display:", err);
      return `<div class="bg-rose-500/10 text-rose-500 border border-rose-500/20 px-3 py-1.5 rounded font-mono text-xs my-2">Math Error: ${formula}</div>`;
    }
  });

  // 2. Replace inline math: $ ... $
  processed = processed.replace(/\$([^$\n]+?)\$/g, (_, formula) => {
    try {
      const cleanFormula = formula
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&');
      return `<span class="katex-inline-wrapper px-0.5">${katex.renderToString(cleanFormula, { displayMode: false, throwOnError: false })}</span>`;
    } catch (err) {
      console.error("Math error inline:", err);
      return `<span class="text-rose-500 font-mono text-xs">${formula}</span>`;
    }
  });

  return processed;
}
