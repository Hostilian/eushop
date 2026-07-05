import { useState, useEffect } from 'react';
import Link from 'next/link';
import fs from 'fs';
import path from 'path';

interface DocsProps {
  statusContent: string;
  devContent: string;
  auditContent: string;
  apiContent: string;
}

// A simple client-side markdown to JSX converter to keep dependencies minimal
function MarkdownRenderer({ content }: { content: string }) {
  const lines = content.split('\n');
  const renderedElements: React.JSX.Element[] = [];
  let inCodeBlock = false;
  let codeLines: string[] = [];
  let codeLang = '';
  let inList = false;
  let listItems: string[] = [];
  let inTable = false;
  let tableRows: string[][] = [];

  const flushList = (key: string) => {
    if (listItems.length > 0) {
      renderedElements.push(
        <ul key={`ul-${key}`} className="list-disc pl-6 mb-4 space-y-1.5 text-xs sm:text-sm text-gray-600 dark:text-gray-400">
          {listItems.map((item, idx) => {
            // Check for checklists like - [ ] or - [x]
            if (item.startsWith('[ ]') || item.startsWith('[x]') || item.startsWith('[/]')) {
              const checked = item.startsWith('[x]');
              const inProgress = item.startsWith('[/]');
              const text = item.substring(3).trim();
              return (
                <li key={idx} className="list-none flex items-start gap-2">
                  <span className={`text-xs font-bold px-1.5 py-0.2 rounded ${
                    checked ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30' :
                    inProgress ? 'bg-amber-50 text-amber-600 dark:bg-amber-950/30' :
                    'bg-gray-100 text-gray-500 dark:bg-gray-800'
                  }`}>
                    {checked ? '✓' : inProgress ? '⋯' : '○'}
                  </span>
                  <span className={checked ? 'line-through opacity-60' : ''}>{text}</span>
                </li>
              );
            }
            return <li key={idx}>{item}</li>;
          })}
        </ul>
      );
      listItems = [];
      inList = false;
    }
  };

  const flushTable = (key: string) => {
    if (tableRows.length > 0) {
      const headers = tableRows[0];
      const rows = tableRows.slice(2); // Skip separator row
      renderedElements.push(
        <div key={`table-wrapper-${key}`} className="overflow-x-auto mb-6 border border-gray-150 dark:border-gray-800 rounded-xl">
          <table className="w-full text-left border-collapse text-[11px] sm:text-xs">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 font-bold text-gray-700 dark:text-gray-300">
                {headers.map((h, i) => <th key={i} className="p-3">{h.trim()}</th>)}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, idx) => (
                <tr key={idx} className="border-b border-gray-100 dark:border-gray-900 hover:bg-gray-50/50 dark:hover:bg-gray-900/50">
                  {row.map((cell, i) => <td key={i} className="p-3 text-gray-600 dark:text-gray-400 font-medium">{cell.trim()}</td>)}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
      tableRows = [];
      inTable = false;
    }
  };

  lines.forEach((line, index) => {
    const trimmed = line.trim();

    // 1. Code Blocks
    if (trimmed.startsWith('```')) {
      if (inCodeBlock) {
        // End code block
        inCodeBlock = false;
        const codeText = codeLines.join('\n');
        renderedElements.push(
          <div key={`code-${index}`} className="mb-6 rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-950 p-4 font-mono text-[11px] sm:text-xs text-gray-200 overflow-x-auto shadow-inner">
            <div className="flex justify-between items-center text-[10px] text-gray-500 uppercase font-sans font-bold border-b border-gray-900 pb-2 mb-2">
              <span>{codeLang || 'code'}</span>
              <span>READONLY</span>
            </div>
            <code>{codeText}</code>
          </div>
        );
        codeLines = [];
        codeLang = '';
      } else {
        // Start code block
        inCodeBlock = true;
        codeLang = trimmed.substring(3).trim();
      }
      return;
    }

    if (inCodeBlock) {
      codeLines.push(line);
      return;
    }

    // 2. Tables
    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      flushList(String(index));
      inTable = true;
      const cells = trimmed.split('|').slice(1, -1);
      tableRows.push(cells);
      return;
    } else if (inTable) {
      flushTable(String(index));
    }

    // 3. Lists
    if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
      inList = true;
      listItems.push(trimmed.substring(2));
      return;
    } else if (inList) {
      flushList(String(index));
    }

    // 4. Headers
    if (trimmed.startsWith('#')) {
      const match = trimmed.match(/^(#{1,6})\s+(.*)$/);
      if (match) {
        const level = match[1].length;
        const titleText = match[2];
        const headingId = titleText.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
        
        if (level === 1) {
          renderedElements.push(
            <h1 key={`h1-${index}`} id={headingId} className="text-2xl sm:text-3xl font-black text-brand-dark dark:text-white mt-8 mb-4 border-b border-gray-100 dark:border-gray-900 pb-2 font-display">
              {titleText}
            </h1>
          );
        } else if (level === 2) {
          renderedElements.push(
            <h2 key={`h2-${index}`} id={headingId} className="text-lg sm:text-xl font-bold text-brand-dark dark:text-white mt-6 mb-3 font-display">
              {titleText}
            </h2>
          );
        } else {
          renderedElements.push(
            <h3 key={`h3-${index}`} id={headingId} className="text-sm sm:text-base font-bold text-gray-800 dark:text-gray-200 mt-4 mb-2">
              {titleText}
            </h3>
          );
        }
        return;
      }
    }

    // 5. Horizontal Rule
    if (trimmed === '---') {
      renderedElements.push(<hr key={`hr-${index}`} className="my-6 border-gray-250 dark:border-gray-800" />);
      return;
    }

    // 6. Blockquotes / Alerts
    if (trimmed.startsWith('>')) {
      const text = trimmed.substring(1).trim();
      renderedElements.push(
        <div key={`quote-${index}`} className="border-l-4 border-rose-500 bg-rose-50/40 dark:bg-rose-950/10 px-4 py-3 rounded-r-xl my-4 text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium">
          {text}
        </div>
      );
      return;
    }

    // 7. Regular Paragraphs (Simple bolding inline replacement)
    if (trimmed) {
      // Bold matcher **text**
      const boldParts = line.split('**');
      const nodes = boldParts.map((part, i) => {
        if (i % 2 !== 0) {
          return <strong key={i} className="font-bold text-brand-dark dark:text-white">{part}</strong>;
        }
        return part;
      });

      renderedElements.push(
        <p key={`p-${index}`} className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-4 leading-relaxed font-sans">
          {nodes}
        </p>
      );
    }
  });

  // Final flushes
  if (inList) flushList('final');
  if (inTable) flushTable('final');

  return <div className="space-y-1">{renderedElements}</div>;
}

function SandboxTester() {
  const [method, setMethod] = useState('GET');
  const [endpoint, setEndpoint] = useState('/foods');
  const [responseCode, setResponseCode] = useState(200);
  const [responseBody, setResponseBody] = useState('');
  const [sending, setSending] = useState(false);

  const endpoints = [
    { name: 'Get Foods List', method: 'GET', url: '/foods' },
    { name: 'Get Belgian Chocolates (ID: 1)', method: 'GET', url: '/foods/1' },
    { name: 'Get Active User Profile', method: 'GET', url: '/auth/me' },
    { name: 'Simulate Payment Creation', method: 'POST', url: '/payments/create-payment-intent' },
    { name: 'Simulate Creating Order', method: 'POST', url: '/orders' }
  ];

  const handleSelectEndpoint = (ep: typeof endpoints[0]) => {
    setMethod(ep.method);
    setEndpoint(ep.url);
  };

  const handleSend = async () => {
    setSending(true);
    setResponseBody('');
    // Delay for realism
    await new Promise(resolve => setTimeout(resolve, 600));

    try {
      if (endpoint === '/foods') {
        const raw = localStorage.getItem('local_foods');
        const list = raw ? JSON.parse(raw) : [];
        setResponseCode(200);
        setResponseBody(JSON.stringify({ status: 'SUCCESS', count: list.length + 10, foods: list }, null, 2));
      } else if (endpoint === '/foods/1') {
        setResponseCode(200);
        setResponseBody(JSON.stringify({
          id: '1',
          name: 'Artisanal Belgian Chocolates',
          country: 'Belgium',
          price: 24.99,
          description: 'Fine handmade pralines and truffles crafted by master chocolatiers.',
          sellerId: 'seller_belgium@eushop.local',
          category: 'Sweets & Confectionery',
          allergens: ['Milk', 'Soy', 'Nuts']
        }, null, 2));
      } else if (endpoint === '/auth/me') {
        const user = localStorage.getItem('user');
        if (user) {
          setResponseCode(200);
          setResponseBody(JSON.stringify({ status: 'SUCCESS', data: JSON.parse(user) }, null, 2));
        } else {
          setResponseCode(401);
          setResponseBody(JSON.stringify({ status: 'ERROR', message: 'Unauthorized. No active session cookie found.' }, null, 2));
        }
      } else if (endpoint === '/payments/create-payment-intent') {
        setResponseCode(200);
        setResponseBody(JSON.stringify({
          clientSecret: `pi_mock_secret_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
          id: `pi_mock_id_${Date.now()}`,
          amount: 4500,
          currency: 'eur',
          status: 'requires_payment_method'
        }, null, 2));
      } else if (endpoint === '/orders') {
        const user = localStorage.getItem('user');
        if (user) {
          setResponseCode(200);
          setResponseBody(JSON.stringify({
            status: 'SUCCESS',
            message: 'Order created locally in localStorage sandbox.',
            order: {
              foodId: '1',
              productName: 'Artisanal Belgian Chocolates',
              quantity: 1,
              totalPrice: 24.99,
              buyerEmail: JSON.parse(user).email,
              status: 'PROCESSING'
            }
          }, null, 2));
        } else {
          setResponseCode(401);
          setResponseBody(JSON.stringify({ status: 'ERROR', message: 'Not authenticated' }, null, 2));
        }
      } else {
        setResponseCode(404);
        setResponseBody(JSON.stringify({ status: 'ERROR', message: 'Endpoint not found' }, null, 2));
      }
    } catch (e: any) {
      setResponseCode(500);
      setResponseBody(JSON.stringify({ status: 'ERROR', message: e.message }, null, 2));
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-150 dark:border-gray-800 rounded-2xl p-6 shadow-sm space-y-5">
      <div>
        <h3 className="text-sm font-bold text-brand-dark dark:text-white uppercase tracking-wider">REST API Sandbox</h3>
        <p className="text-[11px] text-gray-500 dark:text-gray-400 mt-0.5">Test API calls against the simulated local client-side database.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {endpoints.map((ep, idx) => (
          <button
            key={idx}
            onClick={() => handleSelectEndpoint(ep)}
            className="px-2.5 py-1 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg text-[10px] font-bold transition"
          >
            {ep.name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
        <select
          value={method}
          onChange={e => setMethod(e.target.value)}
          className="px-3 py-2 border border-gray-250 dark:border-gray-700 bg-gray-50 dark:bg-gray-950 rounded-xl text-xs font-bold md:col-span-1 text-gray-800 dark:text-gray-200"
        >
          <option>GET</option>
          <option>POST</option>
          <option>PUT</option>
          <option>DELETE</option>
        </select>
        <input
          type="text"
          value={endpoint}
          onChange={e => setEndpoint(e.target.value)}
          className="px-4 py-2 border border-gray-250 dark:border-gray-700 bg-white dark:bg-gray-950 rounded-xl text-xs md:col-span-2 text-gray-800 dark:text-gray-200 font-mono"
        />
        <button
          onClick={handleSend}
          disabled={sending}
          className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition md:col-span-1 py-2 uppercase"
        >
          {sending ? 'Sending...' : 'Send Call'}
        </button>
      </div>

      {responseBody && (
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-gray-950 p-4 font-mono text-[11px] sm:text-xs text-gray-200 shadow-inner">
          <div className="flex justify-between items-center text-[10px] border-b border-gray-950 pb-2 mb-2">
            <span className="font-sans font-bold text-gray-500">RESPONSE</span>
            <span className={`font-bold ${responseCode === 200 ? 'text-emerald-500' : 'text-red-500'}`}>STATUS: {responseCode}</span>
          </div>
          <pre className="overflow-x-auto leading-relaxed">{responseBody}</pre>
        </div>
      )}
    </div>
  );
}

export default function DeveloperDocs({ statusContent, devContent, auditContent, apiContent }: DocsProps) {
  const [activeDoc, setActiveDoc] = useState<'status' | 'dev' | 'audit' | 'api'>('status');

  const getDocTitle = () => {
    switch (activeDoc) {
      case 'status': return 'STATUS.md - Project Status';
      case 'dev': return 'DEVELOPMENT.md - Build Guide';
      case 'audit': return 'Investor Diligence Memo & Plan';
      case 'api': return 'API_REFERENCE.md';
    }
  };

  const getDocContent = () => {
    switch (activeDoc) {
      case 'status': return statusContent;
      case 'dev': return devContent;
      case 'audit': return auditContent;
      case 'api': return apiContent;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 font-sans flex flex-col">
      <nav className="bg-white border-b border-gray-150 py-4 px-6 shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link href="/" className="text-2xl font-extrabold text-primary flex items-center gap-2">
            <span className="text-secondary">🌿</span> EUshop
          </Link>
          <div className="flex items-center gap-3">
            <span className="text-xs font-bold px-2.5 py-1 bg-blue-50 border border-blue-100 text-blue-700 rounded-full">
              Developer Portal
            </span>
            <Link href="/" className="text-xs font-bold text-gray-500 hover:text-primary transition">
              Storefront
            </Link>
          </div>
        </div>
      </nav>

      {/* Workspace split screen layout */}
      <div className="flex-1 max-w-7xl w-full mx-auto flex flex-col md:flex-row items-stretch">
        {/* Sidebar Nav */}
        <aside className="w-full md:w-64 border-r border-gray-200 bg-white p-6 shrink-0 space-y-6">
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Project Workspace Docs</h3>
            <div className="space-y-1">
              <button
                onClick={() => setActiveDoc('status')}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition ${
                  activeDoc === 'status' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                STATUS.md
              </button>
              <button
                onClick={() => setActiveDoc('dev')}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition ${
                  activeDoc === 'dev' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                DEVELOPMENT.md
              </button>
              <button
                onClick={() => setActiveDoc('audit')}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition ${
                  activeDoc === 'audit' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                Investor Diligence Plan
              </button>
              <button
                onClick={() => setActiveDoc('api')}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-bold transition ${
                  activeDoc === 'api' ? 'bg-blue-50 text-blue-600' : 'text-gray-600 hover:bg-gray-50'
                }`}
              >
                API_REFERENCE.md
              </button>
            </div>
          </div>

          <hr className="border-gray-150" />

          {/* Sandbox Hook */}
          <div>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Interactive API Sandbox</h3>
            <p className="text-[10px] text-gray-400 leading-relaxed mb-3">Test simulated REST calls dynamically below or inside the main content view.</p>
          </div>
        </aside>

        {/* Content Pane */}
        <main className="flex-1 bg-white md:bg-transparent p-6 sm:p-8 lg:p-10 space-y-8 overflow-y-auto max-h-[calc(100vh-64px)]">
          {/* Active Tab Heading */}
          <div className="flex justify-between items-center border-b border-gray-250 pb-4 mb-4">
            <h2 className="text-xl sm:text-2xl font-black text-brand-dark dark:text-white font-display">
              {getDocTitle()}
            </h2>
            <span className="text-[10px] font-extrabold px-2 py-0.5 bg-gray-100 rounded text-gray-500 tracking-wider">
              MARKDOWN VIEW
            </span>
          </div>

          {/* Interactive Sandbox inside Docs page */}
          {activeDoc === 'api' && <SandboxTester />}

          {/* Markdown Content */}
          <article className="bg-white rounded-3xl border border-gray-150 p-6 sm:p-8 shadow-sm">
            <MarkdownRenderer content={getDocContent()} />
          </article>
        </main>
      </div>
    </div>
  );
}

export async function getStaticProps() {
  let root = process.cwd();
  // Monorepo subfolder check: if process.cwd() is apps/web, the target markdown files are at '../../'
  if (!fs.existsSync(path.join(root, 'STATUS.md'))) {
    root = path.resolve(root, '../../');
  }

  const readDoc = (filename: string) => {
    try {
      const fullPath = path.join(root, filename);
      return fs.readFileSync(fullPath, 'utf8');
    } catch (e) {
      console.warn(`Could not read ${filename}:`, e);
      return `# Error\nFailed to load ${filename} at build time.`;
    }
  };

  return {
    props: {
      statusContent: readDoc('STATUS.md'),
      devContent: readDoc('DEVELOPMENT.md'),
      auditContent: readDoc('eushop-readiness-audit-and-plan.md'),
      apiContent: readDoc('docs/API_REFERENCE.md')
    }
  };
}
