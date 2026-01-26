/* Hybrid Framework Playbook - minimal JS (no deps) */

(function () {
  const body = document.body;
  const nav = document.getElementById('nav');
  const q = document.getElementById('q');
  const modePicker = document.getElementById('modePicker');

  function setMode(mode) {
    body.classList.toggle('mode-single', mode === 'single');
    body.classList.toggle('mode-multi', mode === 'multi');
    localStorage.setItem('hf_mode', mode);
  }

  const savedMode = localStorage.getItem('hf_mode') || 'single';
  setMode(savedMode);
  if (modePicker) {
    modePicker.querySelectorAll('input[name="mode"]').forEach((r) => {
      r.checked = r.value === savedMode;
      r.addEventListener('change', () => setMode(r.value));
    });
  }

  if (q && nav) {
    q.addEventListener('input', () => {
      const term = q.value.trim().toLowerCase();
      nav.querySelectorAll('a').forEach((a) => {
        const hay = (a.getAttribute('data-text') || a.textContent || '').toLowerCase();
        a.style.display = term === '' || hay.includes(term) ? 'block' : 'none';
      });
    });
  }

  // ---------- TypeScript highlighter (tokenizer) ----------

  const TS_KEYWORDS = new Set([
    'import', 'from', 'export', 'default', 'class', 'interface', 'type', 'extends', 'implements',
    'public', 'private', 'protected', 'readonly', 'static', 'async', 'await', 'return', 'new',
    'const', 'let', 'var', 'if', 'else', 'for', 'while', 'do', 'switch', 'case', 'break', 'continue',
    'try', 'catch', 'finally', 'throw', 'typeof', 'instanceof', 'in', 'as', 'void', 'this', 'super',
    'true', 'false', 'null', 'undefined'
  ]);

  const TS_TYPES = new Set([
    'string', 'number', 'boolean', 'any', 'unknown', 'never', 'void', 'object',
    'Record', 'Partial', 'Promise', 'Array', 'Map', 'Set'
  ]);

  function escapeHtml(s) {
    return s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  function isIdentStart(ch) {
    return /[A-Za-z_$]/.test(ch);
  }

  function isIdent(ch) {
    return /[A-Za-z0-9_$]/.test(ch);
  }

  function isDigit(ch) {
    return /[0-9]/.test(ch);
  }

  function peekNonSpace(code, i) {
    let j = i;
    while (j < code.length && /\s/.test(code[j])) j++;
    return code[j] || '';
  }

  function highlightTs(code) {
    let i = 0;
    let out = '';

    while (i < code.length) {
      const ch = code[i];
      const ch2 = code[i + 1] || '';

      // Line comment
      if (ch === '/' && ch2 === '/') {
        let j = i + 2;
        while (j < code.length && code[j] !== '\n') j++;
        const tok = code.slice(i, j);
        out += '<span class="tok-com">' + escapeHtml(tok) + '</span>';
        i = j;
        continue;
      }

      // Block comment
      if (ch === '/' && ch2 === '*') {
        let j = i + 2;
        while (j < code.length && !(code[j] === '*' && code[j + 1] === '/')) j++;
        j = Math.min(code.length, j + 2);
        const tok = code.slice(i, j);
        out += '<span class="tok-com">' + escapeHtml(tok) + '</span>';
        i = j;
        continue;
      }

      // Strings: ', ", `
      if (ch === '\'' || ch === '"' || ch === '`') {
        const quote = ch;
        let j = i + 1;
        while (j < code.length) {
          const cj = code[j];
          if (cj === '\\') {
            j += 2;
            continue;
          }
          if (cj === quote) {
            j += 1;
            break;
          }
          j += 1;
        }
        const tok = code.slice(i, j);
        out += '<span class="tok-str">' + escapeHtml(tok) + '</span>';
        i = j;
        continue;
      }

      // Decorators: @ccclass
      if (ch === '@') {
        let j = i + 1;
        while (j < code.length && (isIdent(code[j]) || code[j] === '.')) j++;
        const tok = code.slice(i, j);
        out += '<span class="tok-deco">' + escapeHtml(tok) + '</span>';
        i = j;
        continue;
      }

      // Numbers
      if (isDigit(ch)) {
        let j = i + 1;
        while (j < code.length && (isDigit(code[j]) || code[j] === '.')) j++;
        const tok = code.slice(i, j);
        out += '<span class="tok-num">' + escapeHtml(tok) + '</span>';
        i = j;
        continue;
      }

      // Identifiers / keywords / function calls
      if (isIdentStart(ch)) {
        let j = i + 1;
        while (j < code.length && isIdent(code[j])) j++;
        const word = code.slice(i, j);
        const next = peekNonSpace(code, j);

        if (TS_KEYWORDS.has(word)) {
          out += '<span class="tok-kw">' + escapeHtml(word) + '</span>';
        } else if (TS_TYPES.has(word)) {
          out += '<span class="tok-ty">' + escapeHtml(word) + '</span>';
        } else if (next === '(') {
          out += '<span class="tok-fn">' + escapeHtml(word) + '</span>';
        } else {
          out += escapeHtml(word);
        }

        i = j;
        continue;
      }

      // Everything else
      out += escapeHtml(ch);
      i += 1;
    }

    return out;
  }

  function addLineNumbers(pre, codeText) {
    const lines = codeText.split(/\n/).length;
    const gutter = document.createElement('div');
    gutter.className = 'gutter';
    const frag = document.createDocumentFragment();
    for (let i = 1; i <= lines; i++) {
      const d = document.createElement('div');
      d.textContent = String(i);
      frag.appendChild(d);
    }
    gutter.appendChild(frag);
    pre.appendChild(gutter);
  }

  function installCopyButton(pre, codeEl) {
    const btn = document.createElement('button');
    btn.className = 'copy';
    btn.type = 'button';
    btn.textContent = 'Copy';
    btn.addEventListener('click', async () => {
      const text = (codeEl.textContent || '').replace(/\u00a0/g, ' ');
      try {
        await navigator.clipboard.writeText(text);
        btn.textContent = 'Copied';
        setTimeout(() => (btn.textContent = 'Copy'), 900);
      } catch {
        btn.textContent = 'No clipboard';
        setTimeout(() => (btn.textContent = 'Copy'), 900);
      }
    });
    pre.appendChild(btn);
  }

  

  function highlightTree(raw) {
    // Lightweight tree highlighter for folder/file/class names. Safe: works on plain text only.
    const lines = raw.split(/\n/);
    const outLines = [];

    const esc = escapeHtml;

    const fileRe = /([A-Za-z0-9_.-]+\.(ts|js|json|md|prefab|scene))/g;
    const dirRe = /([A-Za-z0-9_.-]+\/)/g;
    const classRe = /\b([A-Z][A-Za-z0-9_]{2,})\b/g;

    for (const line of lines) {
      // Split inline comment
      const idx = line.indexOf('//');
      let main = idx >= 0 ? line.slice(0, idx) : line;
      let com = idx >= 0 ? line.slice(idx) : '';

      let h = esc(main);

      // Highlight dirs first, then files
      h = h.replace(dirRe, '<span class="tree-dir">$1</span>');
      h = h.replace(fileRe, '<span class="tree-file">$1</span>');

      // Highlight class-ish tokens (capitalized identifiers) but avoid wrapping inside already wrapped spans by running last on plain text.
      // This is imperfect but good enough for trees.
      h = h.replace(classRe, '<span class="tree-class">$1</span>');

      if (com) {
        h += '<span class="tree-comment">' + esc(com) + '</span>';
      }

      outLines.push(h);
    }

    return outLines.join('\n');
  }
// Apply TS highlighting + line numbers
  document.querySelectorAll('pre > code.language-ts').forEach((codeEl) => {
    const pre = codeEl.parentElement;
    if (!pre || pre.dataset.hfCodeDone === '1') return;
    const raw = codeEl.textContent || '';
    codeEl.innerHTML = highlightTs(raw);
    addLineNumbers(pre, raw);
    installCopyButton(pre, codeEl);
    pre.dataset.hfCodeDone = '1';
  });

  
  // Apply tree highlighting + line numbers
  document.querySelectorAll('pre > code.code-tree').forEach((codeEl) => {
    const pre = codeEl.parentElement;
    if (!pre || pre.dataset.hfCodeDone === '1') return;
    const raw = codeEl.textContent || '';
    codeEl.innerHTML = highlightTree(raw);
    addLineNumbers(pre, raw);
    installCopyButton(pre, codeEl);
    pre.dataset.hfCodeDone = '1';
  });

// ---------- Keyword/term highlighting in descriptions ----------

  const TERMS = [
    'ServiceLocator', 'EventBus', 'FSM', 'MVVM-lite', 'AppController', 'FrameworkBootstrap',
    'ISceneService', 'Persist Root Node', 'single-scene', 'multi-scene', 'preloadScene', 'loadScene',
    'pooling', 'NodePool', 'IPoolable', 'preload',
    'UIRoot', 'UIView', 'UIScreen', 'UIPopup', 'UIScreenRouter', 'Binder', 'ObservableValue', 'ViewModel', 'IUIService', 'IAssetsService', 'UIPrefetchManifest', 'UIPrefetcher', 'warmupView', 'preloadView', 'stagingLayer', 'StagingLayer', 'UIListBuilder', 'UIWarmup'
  ];

  // Build one regex, longer terms first
  const TERM_RE = new RegExp(
    '(' + TERMS
      .slice()
      .sort((a, b) => b.length - a.length)
      .map((t) => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
      .join('|') + ')',
    'g'
  );

  function shouldInlineCode(term) {
    return term.includes('-') || term.startsWith('I') || term.includes('(') || term.includes('.') || term.includes('Scene');
  }

  function wrapTermsInTextNode(node) {
    const text = node.nodeValue;
    if (!text || !TERM_RE.test(text)) return;

    // Reset regex state
    TERM_RE.lastIndex = 0;

    const frag = document.createDocumentFragment();
    let last = 0;
    let m;
    while ((m = TERM_RE.exec(text))) {
      const start = m.index;
      const end = start + m[0].length;

      if (start > last) {
        frag.appendChild(document.createTextNode(text.slice(last, start)));
      }

      const span = document.createElement('span');
      const term = m[0];
      span.className = shouldInlineCode(term) ? 'inline-code' : 'hl-term';
      span.textContent = term;
      frag.appendChild(span);

      last = end;
    }

    if (last < text.length) {
      frag.appendChild(document.createTextNode(text.slice(last)));
    }

    node.parentNode.replaceChild(frag, node);
  }

  function walkAndWrapTerms(root) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: (n) => {
        // Skip inside code/pre
        if (!n.parentElement) return NodeFilter.FILTER_REJECT;
        if (n.parentElement.closest('pre, code')) return NodeFilter.FILTER_REJECT;
        // Skip if empty
        if (!n.nodeValue || !n.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });

    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach(wrapTermsInTextNode);
  }

  document.querySelectorAll('p, li, small').forEach((el) => walkAndWrapTerms(el));
})();
