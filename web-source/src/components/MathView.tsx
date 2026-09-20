import React, { useMemo } from 'react';
import katex from 'katex';

export interface MathViewProps {
  text: string;
  className?: string;
  inline?: boolean;
  blockEquations?: boolean;
}

const MATH_FUNCS = new Set([
  'sin', 'cos', 'tan', 'cot', 'sec', 'csc', 'arcsin', 'arccos', 'arctan',
  'sinh', 'cosh', 'tanh', 'log', 'ln', 'exp', 'lim', 'det', 'gcd', 'lcm',
  'deg', 'max', 'min', 'mod', 'pi'
]);

const MATH_TRIGGER_REGEX = /[\\^_\/√=<>≤≥≠≈±×÷·⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻⁼ⁿⁱˣʸᶻᵃᵇᶜᵈᵉᵏᵐᵖᵗ₀₁₂₃₄₅₆₇₈₉₊₋₌ₐₑₒₓₕₖₗₘₙₚₛₜπθαβγλμσωΔΣ]/;

function isEnglishWord(token: string): boolean {
  if (token.startsWith('\\')) return false;
  const clean = token.toLowerCase().replace(/^[^\w]+|[^\w]+$/g, '');
  if (clean.length >= 2 && /^[a-z]+$/.test(clean)) {
    if (!MATH_FUNCS.has(clean)) {
      return true;
    }
  }
  return false;
}

/**
 * Converts LaTeX syntax into clean, readable Unicode math text.
 * Guaranteed fallback so that raw LaTeX commands like \frac, \sqrt, or braces
 * are NEVER displayed directly to the student under any circumstances.
 */
export function latexToReadableUnicode(latex: string): string {
  if (!latex) return '';
  let s = latex;
  s = s.replace(/\\displaystyle\s*/g, '');
  s = s.replace(/\\textstyle\s*/g, '');
  s = s.replace(/\\(mathbf|mathrm|mathit|text)\{([^{}]+)\}/g, '$2');

  // Fractions: \frac{a}{b} -> (a) / (b)
  while (/\\frac\{([^{}]+)\}\{([^{}]+)\}/.test(s)) {
    s = s.replace(/\\frac\{([^{}]+)\}\{([^{}]+)\}/g, '($1) / ($2)');
  }

  // Radicals: \sqrt[n]{x} -> ⁿ√(x), \sqrt{x} -> √(x)
  s = s.replace(/\\sqrt\[([^{}]+)\]\{([^{}]+)\}/g, '($1)√($2)');
  while (/\\sqrt\{([^{}]+)\}/.test(s)) {
    s = s.replace(/\\sqrt\{([^{}]+)\}/g, '√($1)');
  }

  // Common operators
  s = s.replace(/\\times/g, '×');
  s = s.replace(/\\div/g, '÷');
  s = s.replace(/\\cdot/g, '·');
  s = s.replace(/\\pm/g, '±');
  s = s.replace(/\\mp/g, '∓');
  s = s.replace(/\\approx/g, '≈');
  s = s.replace(/\\sim/g, '~');
  s = s.replace(/\\equiv/g, '≡');
  s = s.replace(/\\ge|\\geq/g, '≥');
  s = s.replace(/\\le|\\leq/g, '≤');
  s = s.replace(/\\ne|\\neq/g, '≠');
  s = s.replace(/\\infty/g, '∞');
  s = s.replace(/\\circ/g, '°');

  // Greek
  s = s.replace(/\\pi/g, 'π');
  s = s.replace(/\\theta/g, 'θ');
  s = s.replace(/\\alpha/g, 'α');
  s = s.replace(/\\beta/g, 'β');
  s = s.replace(/\\gamma/g, 'γ');
  s = s.replace(/\\lambda/g, 'λ');
  s = s.replace(/\\mu/g, 'μ');
  s = s.replace(/\\sigma/g, 'σ');
  s = s.replace(/\\omega/g, 'ω');
  s = s.replace(/\\Delta/g, 'Δ');
  s = s.replace(/\\Sigma/g, 'Σ');

  // Superscripts ^{...} to Unicode
  const superMap: Record<string, string> = {
    '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹',
    '+': '⁺', '-': '⁻', '=': '⁼', 'n': 'ⁿ', 'i': 'ⁱ', 'x': 'ˣ', 'y': 'ʸ', 'z': 'ᶻ', 'a': 'ᵃ', 'b': 'ᵇ',
    'c': 'ᶜ', 'd': 'ᵈ', 'e': 'ᵉ', 'k': 'ᵏ', 'm': 'ᵐ', 'p': 'ᵖ', 't': 'ᵗ', 'u': 'ᵘ'
  };
  s = s.replace(/\^{([^{}]+)}/g, (_, exp) => {
    const chars = Array.from(exp as string);
    if (chars.every(ch => superMap[ch])) {
      return chars.map(ch => superMap[ch]).join('');
    }
    return `^(${exp})`;
  });

  // Subscripts _{...} to Unicode
  const subMap: Record<string, string> = {
    '0': '₀', '1': '₁', '2': '₂', '3': '₃', '4': '₄', '5': '₅', '6': '₆', '7': '₇', '8': '₈', '9': '₉',
    '+': '₊', '-': '₋', '=': '₌', 'a': 'ₐ', 'e': 'ₑ', 'o': 'ₒ', 'x': 'ₓ', 'h': 'ₕ', 'k': 'ₖ', 'l': 'ₗ',
    'm': 'ₘ', 'n': 'ₙ', 'p': 'ₚ', 's': 'ₛ', 't': 'ₜ'
  };
  s = s.replace(/_{([^{}]+)}/g, (_, sub) => {
    const chars = Array.from(sub as string);
    if (chars.every(ch => subMap[ch])) {
      return chars.map(ch => subMap[ch]).join('');
    }
    return `_(${sub})`;
  });

  // Strip remaining delimiters & backslashes
  s = s.replace(/[{}\$\\]/g, '');
  return s.trim();
}

/**
 * Normalizes plain ASCII / Unicode mathematics syntax into clean, textbook-grade LaTeX.
 * Handles:
 * - Exponents: 3^x, x^2, a^2 + b^2, 2^{x+1}, 2^(x+1), x² + y²
 * - Subscripts: x_1, a_{n+1}, a_(n+1), x₁, aₙ
 * - Fractions: a/b, (a+b)/(a-b), \frac{a+b}{c+d}, (a+b)/c, a/(b+c)
 * - Square roots / Radicals: \sqrt{x}, \sqrt{\frac{x+a}{x-b}}, √((x+a)/(x-b)), √(ab), √x
 * - Operators: × (\times), ÷ (\div), · (\cdot), ± (\pm), ≤ (\le), ≥ (\ge), ≠ (\ne)
 * - Greek letters: π, θ, α, β, γ, λ, μ, σ, ω, Δ, Σ
 */
export function convertMathToLatex(raw: string): string {
  if (!raw) return '';
  let s = raw.trim();

  // Strip outer delimiters if present: $$, $, \[, \], \(, \), `
  if (s.startsWith('$$') && s.endsWith('$$') && s.length >= 4) {
    s = s.slice(2, -2).trim();
  } else if (s.startsWith('$') && s.endsWith('$') && s.length >= 2) {
    s = s.slice(1, -1).trim();
  } else if (s.startsWith('\\[') && s.endsWith('\\]') && s.length >= 4) {
    s = s.slice(2, -2).trim();
  } else if (s.startsWith('\\(') && s.endsWith('\\)') && s.length >= 4) {
    s = s.slice(2, -2).trim();
  } else if (s.startsWith('`') && s.endsWith('`') && s.length >= 2) {
    s = s.slice(1, -1).trim();
  }

  // Unicode math operators to LaTeX equivalents
  s = s.replace(/−/g, '-');
  s = s.replace(/×/g, ' \\times ');
  s = s.replace(/÷/g, ' \\div ');
  s = s.replace(/·/g, ' \\cdot ');
  s = s.replace(/(?<=[0-9a-zA-Z\)\}])\s*\*\s*(?=[0-9a-zA-Z\(\{])/g, ' \\cdot ');
  s = s.replace(/≥/g, ' \\ge ');
  s = s.replace(/>=/g, ' \\ge ');
  s = s.replace(/≤/g, ' \\le ');
  s = s.replace(/<=/g, ' \\le ');
  s = s.replace(/≠/g, ' \\ne ');
  s = s.replace(/!=/g, ' \\ne ');
  s = s.replace(/±/g, ' \\pm ');
  s = s.replace(/∓/g, ' \\mp ');
  s = s.replace(/≈/g, ' \\approx ');
  s = s.replace(/~/g, ' \\sim ');
  s = s.replace(/≡/g, ' \\equiv ');
  s = s.replace(/∞/g, ' \\infty ');
  s = s.replace(/°/g, '^{\\circ}');

  // Greek letters
  s = s.replace(/π/g, ' \\pi ');
  s = s.replace(/θ/g, ' \\theta ');
  s = s.replace(/α/g, ' \\alpha ');
  s = s.replace(/β/g, ' \\beta ');
  s = s.replace(/γ/g, ' \\gamma ');
  s = s.replace(/λ/g, ' \\lambda ');
  s = s.replace(/μ/g, ' \\mu ');
  s = s.replace(/σ/g, ' \\sigma ');
  s = s.replace(/ω/g, ' \\omega ');
  s = s.replace(/Δ/g, ' \\Delta ');
  s = s.replace(/Σ/g, ' \\Sigma ');

  // Unicode superscripts to ^{...}
  const superMap: Record<string, string> = {
    '⁰': '0', '¹': '1', '²': '2', '³': '3', '⁴': '4', '⁵': '5', '⁶': '6', '⁷': '7', '⁸': '8', '⁹': '9',
    '⁺': '+', '⁻': '-', '⁼': '=', 'ⁿ': 'n', 'ⁱ': 'i', 'ˣ': 'x', 'ʸ': 'y', 'ᶻ': 'z', 'ᵃ': 'a', 'ᵇ': 'b',
    'ᶜ': 'c', 'ᵈ': 'd', 'ᵉ': 'e', 'ᵏ': 'k', 'ᵐ': 'm', 'ᵖ': 'p', 'ᵗ': 't', 'ᵘ': 'u'
  };
  s = s.replace(/([⁰¹²³⁴⁵⁶⁷⁸⁹⁺⁻⁼ⁿⁱˣʸᶻᵃᵇᶜᵈᵉᵏᵐᵖᵗᵘ]+)/g, (m) => {
    const mapped = Array.from(m).map(ch => superMap[ch] || ch).join('');
    return `^{${mapped}}`;
  });

  // Unicode subscripts to _{...}
  const subMap: Record<string, string> = {
    '₀': '0', '₁': '1', '₂': '2', '₃': '3', '₄': '4', '₅': '5', '₆': '6', '₇': '7', '₈': '8', '₉': '9',
    '₊': '+', '₋': '-', '₌': '=', 'ₐ': 'a', 'ₑ': 'e', 'ₒ': 'o', 'ₓ': 'x', 'ₕ': 'h', 'ₖ': 'k', 'ₗ': 'l',
    'ₘ': 'm', 'ₙ': 'n', 'ₚ': 'p', 'ₛ': 's', 'ₜ': 't'
  };
  s = s.replace(/([₀₁₂₃₄₅₆₇₈₉₊₋₌ₐₑₒₓₕₖₗₘₙₚₛₜ]+)/g, (m) => {
    const mapped = Array.from(m).map(ch => subMap[ch] || ch).join('');
    return `_{${mapped}}`;
  });

  // Convert parenthesized powers and subscripts: ^(expr) -> ^{expr}, _(expr) -> _{expr}
  s = s.replace(/\^\(([^()]+)\)/g, '^{$1}');
  s = s.replace(/_\(([^()]+)\)/g, '_{$1}');

  // Replace square roots: √(...) or \sqrt(...) or √{...} or √term, supporting arbitrary nested expressions
  function replaceSquareRoots(text: string): string {
    let result = '';
    let i = 0;
    while (i < text.length) {
      if (text[i] === '√' || text.slice(i, i + 6) === '\\sqrt(') {
        const isCmd = text.slice(i, i + 6) === '\\sqrt(';
        i += isCmd ? 5 : 1;
        if (text[i] === '(') {
          let depth = 1;
          const start = i + 1;
          i++;
          while (i < text.length && depth > 0) {
            if (text[i] === '(') depth++;
            else if (text[i] === ')') depth--;
            i++;
          }
          const inner = text.substring(start, depth === 0 ? i - 1 : i);
          result += `\\sqrt{${replaceSquareRoots(inner)}}`;
        } else if (text[i] === '{') {
          let depth = 1;
          const start = i + 1;
          i++;
          while (i < text.length && depth > 0) {
            if (text[i] === '{') depth++;
            else if (text[i] === '}') depth--;
            i++;
          }
          const inner = text.substring(start, depth === 0 ? i - 1 : i);
          result += `\\sqrt{${replaceSquareRoots(inner)}}`;
        } else {
          const remaining = text.substring(i);
          const match = remaining.match(/^[a-zA-Z0-9]+/);
          if (match) {
            result += `\\sqrt{${match[0]}}`;
            i += match[0].length;
          } else {
            result += '\\sqrt{}';
          }
        }
      } else {
        result += text[i];
        i++;
      }
    }
    return result;
  }
  s = replaceSquareRoots(s);

  // Replace fractions: (expr)/(expr), (expr)/term, term/(expr), and term/term -> \frac{a}{b}
  function replaceFractions(text: string): string {
    let res = text;
    // 1. (expr)/(expr)
    while (/\(([^()]+)\)\s*\/\s*\(([^()]+)\)/.test(res)) {
      res = res.replace(/\(([^()]+)\)\s*\/\s*\(([^()]+)\)/g, '\\frac{$1}{$2}');
    }
    // 2. (expr)/term
    while (/\(([^()]+)\)\s*\/\s*(\\sqrt\{[^{}]+\}|[a-zA-Z0-9^_{}]+)/.test(res)) {
      res = res.replace(/\(([^()]+)\)\s*\/\s*(\\sqrt\{[^{}]+\}|[a-zA-Z0-9^_{}]+)/g, '\\frac{$1}{$2}');
    }
    // 3. term/(expr)
    while (/(\\sqrt\{[^{}]+\}|[a-zA-Z0-9^_{}]+)\s*\/\s*\(([^()]+)\)/.test(res)) {
      res = res.replace(/(\\sqrt\{[^{}]+\}|[a-zA-Z0-9^_{}]+)\s*\/\s*\(([^()]+)\)/g, '\\frac{$1}{$2}');
    }
    // 4. single term / single term
    res = res.replace(
      /(?<=^|[=+\-*<>\s,(])([a-zA-Z0-9^_{}]+)\s*\/\s*([a-zA-Z0-9^_{}]+)(?=[=+\-*<>\s,)]|$)/g,
      '\\frac{$1}{$2}'
    );
    return res;
  }
  s = replaceFractions(s);

  // Prepend \displaystyle if fractions or square roots are present for textbook stacked layout
  if ((s.includes('\\frac') || s.includes('\\sqrt')) && !s.includes('\\displaystyle')) {
    s = `\\displaystyle ${s}`;
  }

  return s;
}

export interface TextSegment {
  type: 'text' | 'inline-math' | 'block-math' | 'lead-in' | 'newline';
  content: string;
  leadInLabel?: string;
}

/**
 * Parses LaTeX commands with balanced braces/brackets to support arbitrary nesting.
 */
function parseLatexCommand(str: string, startIndex: number): { token: string; endIndex: number } | null {
  if (str[startIndex] !== '\\') return null;
  let i = startIndex + 1;
  while (i < str.length && /[a-zA-Z]/.test(str[i])) {
    i++;
  }
  const cmd = str.substring(startIndex, i);
  if (cmd.length <= 1) return null;

  while (i < str.length) {
    if (str[i] === ' ' || str[i] === '\t') {
      let peek = i;
      while (peek < str.length && (str[peek] === ' ' || str[peek] === '\t')) peek++;
      if (peek < str.length && (str[peek] === '{' || str[peek] === '[')) {
        i = peek;
      } else {
        break;
      }
    }
    if (str[i] === '{' || str[i] === '[') {
      const openChar = str[i];
      const closeChar = openChar === '{' ? '}' : ']';
      let depth = 1;
      i++;
      while (i < str.length && depth > 0) {
        if (str[i] === openChar) depth++;
        else if (str[i] === closeChar) depth--;
        i++;
      }
    } else {
      break;
    }
  }
  return { token: str.substring(startIndex, i), endIndex: i };
}

/**
 * Tokenizes a sentence into narrative words, punctuation, whitespace, and math expressions.
 */
function tokenizeSentence(text: string): string[] {
  const tokens: string[] = [];
  let i = 0;
  while (i < text.length) {
    // Check for LaTeX command
    if (text[i] === '\\' && /[a-zA-Z]/.test(text[i + 1] || '')) {
      const parsed = parseLatexCommand(text, i);
      if (parsed) {
        tokens.push(parsed.token);
        i = parsed.endIndex;
        continue;
      }
    }

    if (/\s/.test(text[i])) {
      let j = i;
      while (j < text.length && /\s/.test(text[j])) j++;
      tokens.push(text.substring(i, j));
      i = j;
      continue;
    }

    if (/[a-zA-Z]/.test(text[i])) {
      let j = i;
      while (j < text.length && /[a-zA-Z]/.test(text[j])) j++;
      tokens.push(text.substring(i, j));
      i = j;
      continue;
    }

    if (/[0-9]/.test(text[i])) {
      let j = i;
      while (j < text.length && /[0-9]/.test(text[j])) j++;
      tokens.push(text.substring(i, j));
      i = j;
      continue;
    }

    // Single symbol or punctuation
    tokens.push(text[i]);
    i++;
  }
  return tokens;
}

/**
 * Splits plain text segments (outside explicit delimiters) into narrative text and math expressions.
 */
function splitTextAndMath(sentence: string): { type: 'text' | 'math'; content: string }[] {
  const rawTokens = tokenizeSentence(sentence);

  const classified = rawTokens.map(t => {
    if (/^\s+$/.test(t)) return { text: t, type: 'ws' as const };
    if (t.startsWith('\\')) return { text: t, type: 'math-trigger' as const };
    if (MATH_TRIGGER_REGEX.test(t)) return { text: t, type: 'math-trigger' as const };
    if (isEnglishWord(t)) return { text: t, type: 'word' as const };
    if (/^[0-9]+$/.test(t)) return { text: t, type: 'number' as const };
    if (/^[a-zA-Z]$/.test(t)) return { text: t, type: 'variable' as const };
    if (/^[.,;:?!]$/.test(t)) return { text: t, type: 'punct' as const };
    return { text: t, type: 'symbol' as const };
  });

  const spans: { type: 'text' | 'math'; content: string }[] = [];
  let i = 0;

  while (i < classified.length) {
    if (classified[i].type === 'word' || classified[i].type === 'punct') {
      spans.push({ type: 'text', content: classified[i].text });
      i++;
      continue;
    }

    if (classified[i].type === 'ws') {
      spans.push({ type: 'text', content: classified[i].text });
      i++;
      continue;
    }

    // Gather non-word, non-punct tokens that form a math expression
    const mathTokens: string[] = [];
    let hasTrigger = false;
    let j = i;
    let lastNonWs = i;

    while (j < classified.length) {
      const c = classified[j];
      if (c.type === 'word') break;
      if (c.type === 'punct') {
        // Decimal point inside numbers e.g. 3.14
        if (c.text === '.' && j > i && classified[j - 1].type === 'number' && j + 1 < classified.length && classified[j + 1].type === 'number') {
          mathTokens.push(c.text);
          j++;
          lastNonWs = j - 1;
          continue;
        }
        break;
      }
      if (c.type === 'math-trigger') hasTrigger = true;
      mathTokens.push(c.text);
      if (c.type !== 'ws') lastNonWs = j;
      j++;
    }

    const validTokens = mathTokens.slice(0, lastNonWs - i + 1);
    const trailingWs = mathTokens.slice(lastNonWs - i + 1);

    const mathStr = validTokens.join('');
    const hasOperator = /[+\-*\/]/.test(mathStr);

    if (hasTrigger || hasOperator || /^[a-zA-Z]$/.test(mathStr)) {
      spans.push({ type: 'math', content: mathStr });
    } else {
      spans.push({ type: 'text', content: mathStr });
    }

    if (trailingWs.length > 0) {
      spans.push({ type: 'text', content: trailingWs.join('') });
    }

    i = j;
  }

  // Merge adjacent same-type spans
  const merged: { type: 'text' | 'math'; content: string }[] = [];
  for (const s of spans) {
    if (merged.length > 0 && merged[merged.length - 1].type === s.type) {
      merged[merged.length - 1].content += s.content;
    } else {
      merged.push({ ...s });
    }
  }

  return merged;
}

const LEAD_IN_REGEX = /^(?:\*\*)?(Given|To\s+prove|To\s+find|Step\s+\d+|Therefore|Hence|Thus|Since|Substitute|Substituting|Formula|Using\s+formula|Simplifying|Simplify|Note|Applying(?:\s+[\w\s]+)?)(?:\*\*)?[:.,]?\s*(.*)$/i;

/**
 * Parses mixed text and mathematical equations into renderable segments.
 */
function tokenizeContent(rawText: string, isInlineOnly: boolean): TextSegment[] {
  if (!rawText) return [];

  // Extract option prefix like "A. ", "B. ", "1. " if present
  let prefix = '';
  let body = rawText;
  const prefixMatch = rawText.match(/^([A-D]\.|\d+\.)\s*/);
  if (prefixMatch) {
    prefix = prefixMatch[0];
    body = rawText.substring(prefix.length);
  }

  const result: TextSegment[] = [];
  if (prefix) {
    result.push({ type: 'text', content: prefix });
  }

  // Explicit LaTeX delimiters ($$...$$, \[...\], $...$, \(...\))
  // Using matchAll to prevent RegExp lastIndex state corruption
  const delimiterPattern = /\$\$([\s\S]*?)\$\$|\\\[([\s\S]*?)\\\]|\$((?:\\\$|[^\$])+?)\$|\\\(([\s\S]*?)\\\)/g;
  const matches = Array.from(body.matchAll(delimiterPattern));

  if (matches.length > 0) {
    let lastIndex = 0;
    for (const match of matches) {
      const matchIndex = match.index ?? 0;
      if (matchIndex > lastIndex) {
        const textBefore = body.substring(lastIndex, matchIndex);
        const subSpans = splitTextAndMath(textBefore);
        for (const s of subSpans) {
          result.push({ type: s.type === 'math' ? 'inline-math' : 'text', content: s.content });
        }
      }

      const fullMatch = match[0];
      const isBlock = fullMatch.startsWith('$$') || fullMatch.startsWith('\\[');
      const mathContent = (match[1] || match[2] || match[3] || match[4] || '').trim();

      result.push({
        type: isBlock && !isInlineOnly ? 'block-math' : 'inline-math',
        content: mathContent
      });

      lastIndex = matchIndex + fullMatch.length;
    }

    if (lastIndex < body.length) {
      const remaining = body.substring(lastIndex);
      const subSpans = splitTextAndMath(remaining);
      for (const s of subSpans) {
        result.push({ type: s.type === 'math' ? 'inline-math' : 'text', content: s.content });
      }
    }
  } else {
    // No explicit delimiters: parse line by line
    const lines = body.split('\n');
    for (let li = 0; li < lines.length; li++) {
      const line = lines[li];
      if (!line.trim()) {
        result.push({ type: 'newline', content: '\n' });
        continue;
      }

      // Check if line has a textbook lead-in (e.g. "Given 2^x = 8", "**Given** 2^x = 8", "Step 1: 2^x = 2^3", "Therefore x = 3")
      const leadInMatch = !isInlineOnly ? line.match(LEAD_IN_REGEX) : null;
      if (leadInMatch && leadInMatch[2]?.trim()) {
        const label = leadInMatch[1].trim();
        const equationOrText = leadInMatch[2].trim();

        // Check if the remainder is purely mathematical (no narrative words)
        const restWords = equationOrText.split(/\s+/).filter(w => isEnglishWord(w));
        const restHasTrigger = MATH_TRIGGER_REGEX.test(equationOrText);

        if (restWords.length === 0 && restHasTrigger) {
          result.push({
            type: 'lead-in',
            leadInLabel: label,
            content: equationOrText
          });
          if (li < lines.length - 1) {
            result.push({ type: 'newline', content: '\n' });
          }
          continue;
        }
      }

      // Check if entire line is a standalone block equation
      const words = line.split(/\s+/).filter(w => isEnglishWord(w));
      const hasTrigger = MATH_TRIGGER_REGEX.test(line);

      if (!isInlineOnly && !prefix && words.length === 0 && hasTrigger) {
        result.push({ type: 'block-math', content: line.trim() });
      } else {
        const spans = splitTextAndMath(line);
        for (const s of spans) {
          result.push({ type: s.type === 'math' ? 'inline-math' : 'text', content: s.content });
        }
      }

      if (li < lines.length - 1) {
        result.push({ type: 'newline', content: '\n' });
      }
    }
  }

  return result;
}

/**
 * Escapes HTML characters for safe fallback insertion.
 */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

/**
 * Renders a single math segment safely with KaTeX into HTML.
 * If KaTeX fails, gracefully renders clean readable Unicode math
 * so raw LaTeX formatting syntax is NEVER shown.
 */
function renderKatexHtml(content: string, displayMode: boolean): string {
  const latex = convertMathToLatex(content);
  try {
    return katex.renderToString(latex, {
      displayMode,
      throwOnError: true,
      output: 'htmlAndMathml'
    });
  } catch {
    // Fallback: guaranteed clean readable textbook representation without raw LaTeX
    const cleanMath = latexToReadableUnicode(latex || content);
    return `<span class="katex-clean-fallback font-serif italic">${escapeHtml(cleanMath)}</span>`;
  }
}

export const MathView: React.FC<MathViewProps> = ({
  text,
  className = '',
  inline = false,
  blockEquations = true
}) => {
  const segments = useMemo(() => tokenizeContent(text, inline), [text, inline]);

  if (!text) return null;

  // Inline mode: optimal baseline alignment for options, badges, and compact cards
  if (inline) {
    return (
      <span className={`math-typeset-inline inline items-baseline flex-wrap ${className}`}>
        {segments.map((seg, idx) => {
          if (seg.type === 'text') {
            return (
              <span key={idx} className="font-normal text-inherit">
                {seg.content}
              </span>
            );
          }
          const html = renderKatexHtml(seg.content, false);
          return (
            <span
              key={idx}
              className="inline-math-item inline-block align-baseline mx-0.5 text-inherit"
              dangerouslySetInnerHTML={{ __html: html }}
            />
          );
        })}
      </span>
    );
  }

  // Full rich math mode: typeset questions, solution steps, and explanations like a textbook
  return (
    <div className={`math-typeset-container leading-relaxed ${className}`}>
      {segments.map((seg, idx) => {
        if (seg.type === 'newline') {
          return <div key={idx} className="h-1.5" />;
        }

        if (seg.type === 'lead-in') {
          const html = renderKatexHtml(seg.content, blockEquations);
          return (
            <div key={idx} className="my-2 space-y-1">
              <div className="font-bold text-slate-800 text-xs tracking-wide">
                {seg.leadInLabel}
              </div>
              <div className="py-1 px-3 bg-slate-50/70 border border-slate-200/60 rounded-xl overflow-x-auto">
                <div
                  className="text-slate-900 leading-normal"
                  dangerouslySetInnerHTML={{ __html: html }}
                />
              </div>
            </div>
          );
        }

        if (seg.type === 'text') {
          return (
            <span key={idx} className="leading-relaxed">
              {seg.content}
            </span>
          );
        }

        if (seg.type === 'block-math') {
          const html = renderKatexHtml(seg.content, blockEquations);
          return (
            <div
              key={idx}
              className="my-2.5 py-2 px-3 bg-slate-50/70 border border-slate-200/60 rounded-xl overflow-x-auto text-center flex items-center justify-center"
            >
              <div
                className="text-slate-900 leading-normal my-0.5"
                dangerouslySetInnerHTML={{ __html: html }}
              />
            </div>
          );
        }

        // inline-math
        const html = renderKatexHtml(seg.content, false);
        return (
          <span
            key={idx}
            className="inline-math-item inline-block align-baseline mx-0.5 text-inherit"
            dangerouslySetInnerHTML={{ __html: html }}
          />
        );
      })}
    </div>
  );
};

export default MathView;
