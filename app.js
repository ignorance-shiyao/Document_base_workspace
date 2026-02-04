const CONFIG = { pageSize: 15 };
let rawFiles = [], filteredTree = [], currentPage = 1, fuse;

// 初始化
async function init() {
    initTheme();
    try {
        const res = await fetch('./list.json');
        rawFiles = await res.json();
        fuse = new Fuse(rawFiles, { keys: ['path'], threshold: 0.3 });
        handleSearch("");
        document.getElementById('searchInput').addEventListener('input', e => handleSearch(e.target.value));
    } catch (e) {
        console.error("加载索引失败");
    }
}

// 主题切换
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

// 侧边栏收缩
function toggleSidebar() {
    const sidebar = document.getElementById('sidebar');
    const expandBtn = document.getElementById('expandMenu');
    sidebar.classList.toggle('collapsed');
    expandBtn.style.display = sidebar.classList.contains('collapsed') ? 'block' : 'none';
}

// 预览逻辑
function loadPreview(url, title) {
    document.getElementById('emptyPlaceholder').style.display = 'none';
    document.getElementById('iframeLoader').style.display = 'flex';
    document.getElementById('currentPageTitle').innerText = title;

    const iframe = document.getElementById('mainIframe');
    iframe.src = url;
    iframe.onload = () => document.getElementById('iframeLoader').style.display = 'none';
}

function openExternal() {
    const url = document.getElementById('mainIframe').src;
    if (url && url !== 'about:blank') window.open(url, '_blank');
}

// 渲染逻辑
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
    const items = filteredTree.slice(start, start + CONFIG.pageSize);
    container.innerHTML = items.map(([name, node]) => renderNode(name, node)).join('');

    const total = Math.ceil(filteredTree.length / CONFIG.pageSize) || 1;
    document.getElementById('pageInfo').innerText = `${currentPage}/${total}`;
}

function renderNode(name, node) {
    if (node._f) {
        return `<div class="file-item" onclick="loadPreview('./${node._f.path}', '${name}')">
            <i class="far fa-file"></i><span>${name}</span></div>`;
    }
    const children = Object.entries(node).map(([n,v]) => renderNode(n,v)).join('');
    return `<div class="folder-group">
        <div class="folder-header" onclick="this.nextElementSibling.style.display = this.nextElementSibling.style.display === 'none' ? 'block' : 'none'">
            <i class="fas fa-folder"></i><span>${name}</span>
        </div>
        <div style="display:none; padding-left:15px;">${children}</div>
    </div>`;
}

function changePage(s) {
    const total = Math.ceil(filteredTree.length / CONFIG.pageSize) || 1;
    let next = currentPage + s;
    if (next < 1 || next > total) return;
    currentPage = next;
    updateUI();
}

init();