const CONFIG = { pageSize: 15 };
let rawFiles = [], filteredTree = [], currentPage = 1, fuse;

async function init() {
    initTheme();
    try {
        const res = await fetch('./list.json');
        if (!res.ok) throw new Error();
        rawFiles = await res.json();
        fuse = new Fuse(rawFiles, { keys: ['path'], threshold: 0.3 });
        handleSearch("");
        document.getElementById('searchInput').addEventListener('input', e => handleSearch(e.target.value));
    } catch (e) {
        document.getElementById('tree-content').innerHTML = '<div style="padding:20px; font-size:12px; opacity:0.6;">等待 Actions 生成索引...</div>';
    }
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

function updateUI() {
    const container = document.getElementById('tree-content');
    const start = (currentPage - 1) * CONFIG.pageSize;
    container.innerHTML = filteredTree.slice(start, start + CONFIG.pageSize).map(([name, node]) => renderNode(name, node)).join('');
    const total = Math.ceil(filteredTree.length / CONFIG.pageSize) || 1;
    document.getElementById('pageInfo').innerText = `${currentPage} / ${total}`;
}

function renderNode(name, node) {
    if (node._f) {
        return `<div class="file-item" onclick="loadPreview(this, './${node._f.path}', '${name}')">
            <i class="far fa-file-alt"></i><span>${name}</span></div>`;
    }
    const children = Object.entries(node).map(([n,v]) => renderNode(n,v)).join('');
    return `<div class="folder-group">
        <div class="folder-header" onclick="toggleFolder(this)">
            <i class="fas fa-chevron-right icon-arrow"></i><i class="fas fa-folder"></i><span>${name}</span>
        </div>
        <div class="folder-children" style="display:none; padding-left:18px;">${children}</div>
    </div>`;
}

function toggleFolder(el) {
    const children = el.nextElementSibling;
    const arrow = el.querySelector('.icon-arrow');
    const isOpen = children.style.display === 'block';
    children.style.display = isOpen ? 'none' : 'block';
    arrow.style.transform = isOpen ? 'rotate(0deg)' : 'rotate(90deg)';
}

function loadPreview(el, url, title) {
    if (window.innerWidth <= 768) toggleSidebar(); // 移动端选后收起
    document.querySelectorAll('.file-item').forEach(i => i.classList.remove('active'));
    el.classList.add('active');
    document.getElementById('emptyPlaceholder').style.display = 'none';
    document.getElementById('iframeLoader').style.display = 'flex';
    document.getElementById('currentPageTitle').innerText = title;
    const iframe = document.getElementById('mainIframe');
    iframe.src = url;
    iframe.onload = () => document.getElementById('iframeLoader').style.display = 'none';
}

function toggleSidebar() {
    const isMobile = window.innerWidth <= 768;
    const sb = document.getElementById('sidebar');
    const overlay = document.getElementById('sidebarOverlay');
    if (isMobile) {
        sb.classList.toggle('mobile-active');
        overlay.classList.toggle('active');
    } else {
        sb.classList.toggle('collapsed');
    }
}

function toggleTheme() {
    const html = document.documentElement;
    const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
    html.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
    document.getElementById('themeIcon').className = next === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
}

function initTheme() {
    const saved = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', saved);
    document.getElementById('themeIcon').className = saved === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
}

function openExternal() {
    const url = document.getElementById('mainIframe').src;
    if (url && url !== 'about:blank') window.open(url, '_blank');
}

function changePage(s) {
    const total = Math.ceil(filteredTree.length / CONFIG.pageSize) || 1;
    if (currentPage + s >= 1 && currentPage + s <= total) {
        currentPage += s;
        updateUI();
    }
}

init();