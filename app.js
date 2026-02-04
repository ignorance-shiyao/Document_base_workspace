const CONFIG = { pageSize: 15 };
let rawFiles = [], filteredTree = [], currentPage = 1, fuse;

async function init() {
    initTheme();
    try {
        const res = await fetch('./list.json');
        rawFiles = await res.json();
        fuse = new Fuse(rawFiles, { keys: ['path'], threshold: 0.3 });
        handleSearch("");
        document.getElementById('searchInput').addEventListener('input', e => handleSearch(e.target.value));
    } catch (e) { console.error("Index load failed"); }
}

function handleSearch(q) {
    const files = q ? fuse.search(q).map(r => r.item) : rawFiles;
    const tree = {};
    files.forEach(f => {
        const parts = f.path.split('/');
        let cur = tree;
        parts.forEach((p, i) => {
            if (!cur[p]) cur[p] = (i === parts.length - 1) ? { _f: f } : {};
            cur = cur[p];
        });
    });
    filteredTree = Object.entries(tree);
    updateUI();
}

function renderNode(name, node) {
    if (node._f) {
        return `<div class="file-item" data-path="${node._f.path}" onclick="loadPreview(this, './${node._f.path}', '${name}')">
            <i class="far fa-file-alt"></i><span>${name}</span></div>`;
    }
    const children = Object.entries(node).map(([n,v]) => renderNode(n,v)).join('');
    return `<div class="folder-group">
        <div class="folder-header" onclick="toggleFolder(this)">
            <i class="fas fa-chevron-right"></i><i class="fas fa-folder"></i><span>${name}</span>
        </div>
        <div class="folder-children" style="display:none; padding-left:15px;">${children}</div>
    </div>`;
}

function toggleFolder(el) {
    const children = el.nextElementSibling;
    const icon = el.querySelector('.fa-chevron-right');
    const isOpen = children.style.display === 'block';
    children.style.display = isOpen ? 'none' : 'block';
    icon.style.transform = isOpen ? 'rotate(0deg)' : 'rotate(90deg)';
    icon.style.transition = '0.2s';
}

function loadPreview(el, url, title) {
    document.querySelectorAll('.file-item').forEach(i => i.classList.remove('active'));
    el.classList.add('active');

    document.getElementById('emptyPlaceholder').style.display = 'none';
    document.getElementById('iframeLoader').style.display = 'flex';
    document.getElementById('currentPageTitle').innerText = title;

    const iframe = document.getElementById('mainIframe');
    iframe.src = url;
    iframe.onload = () => document.getElementById('iframeLoader').style.display = 'none';
}

function toggleTheme() {
    const html = document.documentElement;
    const isDark = html.getAttribute('data-theme') === 'dark';
    const next = isDark ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    document.getElementById('themeIcon').className = next === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
}

function initTheme() {
    const saved = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', saved);
    document.getElementById('themeIcon').className = saved === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
}

function toggleSidebar() {
    const sb = document.getElementById('sidebar');
    const eb = document.getElementById('expandMenu');
    const isCol = sb.classList.toggle('collapsed');
    eb.style.display = isCol ? 'block' : 'none';
}

function updateUI() {
    const container = document.getElementById('tree-content');
    const start = (currentPage - 1) * CONFIG.pageSize;
    container.innerHTML = filteredTree.slice(start, start + CONFIG.pageSize).map(([name, node]) => renderNode(name, node)).join('');
    document.getElementById('pageInfo').innerText = `${currentPage} / ${Math.ceil(filteredTree.length / CONFIG.pageSize) || 1}`;
}

function changePage(s) {
    const total = Math.ceil(filteredTree.length / CONFIG.pageSize) || 1;
    if (currentPage + s >= 1 && currentPage + s <= total) {
        currentPage += s;
        updateUI();
    }
}

init();