const CONFIG = { pageSize: 15 };
let rawFiles = [], filteredTree = [], currentPage = 1, fuse;

async function init() {
    try {
        const res = await fetch('./list.json');
        rawFiles = await res.json();
        fuse = new Fuse(rawFiles, { keys: ['path'], threshold: 0.35 });
        handleSearch("");
        document.getElementById('searchInput').addEventListener('input', (e) => handleSearch(e.target.value));
    } catch (e) {
        document.getElementById('tree-content').innerHTML = `<div class="empty-state">索引文件加载失败</div>`;
    }
}

function handleSearch(q) {
    const files = q.trim() ? fuse.search(q).map(r => r.item) : rawFiles;
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

function updateUI() {
    const container = document.getElementById('tree-content');
    const start = (currentPage - 1) * CONFIG.pageSize;
    const items = filteredTree.slice(start, start + CONFIG.pageSize);

    container.innerHTML = items.map(([name, node]) => renderNode(name, node)).join('');

    const total = Math.ceil(filteredTree.length / CONFIG.pageSize) || 1;
    document.getElementById('pageInfo').innerText = `${currentPage} / ${total}`;
}

function renderNode(name, node) {
    if (node._f) {
        return `<div class="file-item" onclick="openDialog('./${node._f.path}', '${name}')">
            <i class="far fa-file-alt"></i><span>${name}</span></div>`;
    }
    const children = Object.entries(node).map(([n, v]) => renderNode(n, v)).join('');
    return `<div class="node-group">
        <div class="folder-header" onclick="toggleFolder(this)">
            <i class="fas fa-folder"></i><span>${name}</span>
        </div>
        <div class="node-children" style="display:none; padding-left:15px;">${children}</div>
    </div>`;
}

function toggleFolder(el) {
    const childBox = el.nextElementSibling;
    const icon = el.querySelector('i');
    const isHidden = childBox.style.display === 'none';
    childBox.style.display = isHidden ? 'block' : 'none';
    icon.className = isHidden ? 'fas fa-folder-open' : 'fas fa-folder';
}

function openDialog(url, title) {
    const overlay = document.getElementById('dialogOverlay');
    const iframe = document.getElementById('previewIframe');
    document.getElementById('dialogTitle').innerText = title;
    document.getElementById('iframeLoader').style.display = 'flex';
    iframe.src = url;
    overlay.style.display = 'flex';
}

function closeDialog() {
    document.getElementById('dialogOverlay').style.display = 'none';
    document.getElementById('previewIframe').src = 'about:blank';
}

function toggleSize() {
    const el = document.getElementById('elDialog');
    const state = el.getAttribute('data-state');
    el.setAttribute('data-state', state === 'normal' ? 'full' : 'normal');
}

function openNewTab() {
    const url = document.getElementById('previewIframe').src;
    if (url && url !== 'about:blank') window.open(url, '_blank');
}

function changePage(step) {
    const total = Math.ceil(filteredTree.length / CONFIG.pageSize) || 1;
    let next = currentPage + step;
    if (next < 1 || next > total) return;
    currentPage = next;
    updateUI();
}

init();