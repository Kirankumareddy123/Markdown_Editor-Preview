const editor = document.getElementById('editor');
const preview = document.getElementById('preview');
const themeToggle = document.getElementById('themeToggle');
const toolbarButtons = document.querySelectorAll('.toolbar button');

// Load saved content and theme
function loadContent() {
    const saved = localStorage.getItem('markdownContent');
    if (saved) {
        editor.value = saved;
        renderPreview();
    }
}

function saveContent() {
    localStorage.setItem('markdownContent', editor.value);
}

// Markdown parser
function parseMarkdown(markdown) {
    let html = markdown;

    // Code blocks (must be first)
    html = html.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
    
    // Inline code
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
    
    // Headers
    html = html.replace(/^### (.*$)/gm, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gm, '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gm, '<h1>$1</h1>');
    
    // Bold
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    
    // Italic
    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
    
    // Images
    html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g, '<img src="$2" alt="$1">');
    
    // Links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');
    
    // Blockquotes
    html = html.replace(/^> (.+)/gm, '<blockquote>$1</blockquote>');
    
    // Horizontal rule
    html = html.replace(/^---$/gm, '<hr>');
    
    // Unordered lists
    html = html.replace(/^\- (.+)/gm, '<li>$1</li>');
    html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');
    
    // Ordered lists
    html = html.replace(/^\d+\. (.+)/gm, '<li>$1</li>');
    
    // Paragraphs
    html = html.split('\n\n').map(para => {
        if (!para.match(/^<(h|ul|ol|li|blockquote|pre|hr)/)) {
            return para.trim() ? `<p>${para.trim()}</p>` : '';
        }
        return para;
    }).join('\n');
    
    // Line breaks
    html = html.replace(/\n/g, '<br>');
    
    return html;
}

function renderPreview() {
    const markdown = editor.value;
    preview.innerHTML = parseMarkdown(markdown);
}

function handleInput() {
    renderPreview();
    saveContent();
}

function applyFormatting(e) {
    const syntax = e.target.dataset.syntax;
    if (!syntax) return;

    const start = editor.selectionStart;
    const end = editor.selectionEnd;
    const selectedText = editor.value.substring(start, end);
    const before = editor.value.substring(0, start);
    const after = editor.value.substring(end);

    let newText;
    let cursorPos;

    if (syntax === '[]()') {
        newText = `[${selectedText}](url)`;
        cursorPos = start + newText.length - 4;
    } else if (syntax === '**' || syntax === '*' || syntax === '`') {
        newText = `${syntax}${selectedText}${syntax}`;
        cursorPos = start + newText.length;
    } else {
        newText = `${syntax}${selectedText}`;
        cursorPos = start + newText.length;
    }

    editor.value = before + newText + after;
    editor.focus();
    editor.setSelectionRange(cursorPos, cursorPos);
    
    handleInput();
}

function toggleTheme() {
    const currentTheme = document.body.dataset.theme;
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.body.dataset.theme = newTheme;
    themeToggle.textContent = newTheme === 'dark' ? '☀️' : '🌙';
    localStorage.setItem('theme', newTheme);
}

function loadTheme() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.body.dataset.theme = savedTheme;
    themeToggle.textContent = savedTheme === 'dark' ? '☀️' : '🌙';
}

// Event listeners
editor.addEventListener('input', handleInput);
themeToggle.addEventListener('click', toggleTheme);
toolbarButtons.forEach(btn => btn.addEventListener('click', applyFormatting));

// Initialize
loadTheme();
loadContent();
