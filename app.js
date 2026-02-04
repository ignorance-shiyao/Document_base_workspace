const CONFIG = { pageSize: 15 };
let rawFiles = [], filteredTree = [], currentPage = 1, fuse;

// 启动初始化
async function init() {
    initTheme();
    try {
        const res = await fetch('./list.json');
        rawFiles = await res.json();
        // 初始化模糊搜索
        fuse = new Fuse(rawFiles, { keys: ['path'], threshold: 0.3 });
        handleSearch("");
        document.getElementById('searchInput').addEventListener('input', e => handleSearch(e.target.value));
    } catch (e) {
        console.error("加载索引失败，请检查 list.json 是否生成成功");
    }
}

// 搜索并重新构建树
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
    currentPage = 1;
    updateUI();
}

// 渲染当前页
function updateUI() {
    const container = document.getElementById('tree-content');
    const start = (currentPage - 1) * CONFIG.pageSize;
    const items = filteredTree.slice(start, start + CONFIG.pageSize);

    container.innerHTML = items.length ?
        items.map(([name, node]) => renderNode(name, node)).join('') :
        '<div class="empty-state">未搜索到相关文档</div>';

    const total = Math.ceil(filteredTree.length / CONFIG.pageSize) || 1;
    document.getElementById('pageInfo').innerText = `${currentPage} / ${total}`;
}

// 递归渲染树节点
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

// 预览逻辑
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

// 目录折叠控制
function toggleSidebar() {
    const sb = document.getElementById('sidebar');
    const eb = document.getElementById('expandBtn');
    const isCol = sb.classList.toggle('collapsed');
    eb.style.display = isCol ? 'block' : 'none';
}

// 文件夹展开/收起
function toggleFolder(el) {
    const children = el.nextElementSibling;
    const arrow = el.querySelector('.icon-arrow');
    const isOpen = children.style.display === 'block';
    children.style.display = isOpen ? 'none' : 'block';
    arrow.style.transform = isOpen ? 'rotate(0deg)' : 'rotate(90deg)';
    arrow.style.transition = '0.2s';
}

// 主题逻辑
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