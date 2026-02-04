const CONFIG = { pageSize: 12 };
let rawFiles = [], filteredTree = [], currentPage = 1, fuse;

async function init() {
    try {
        const res = await fetch('./list.json');
        rawFiles = await res.json();
        fuse = new Fuse(rawFiles, { keys: ['path'], threshold: 0.3 });
        handleSearch("");
        setupListeners();
    } catch (e) {
        document.getElementById('tree-content').innerHTML = "索引未就绪";
    }
}

function setupListeners() {
    document.getElementById('searchInput').addEventListener('input', (e) => handleSearch(e.target.value));
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
    currentPage = 1;
    updateUI();
}

function renderNode(name, node) {
    if (node._f) {
        return `<div class="file-item" onclick="openPreview('./${node._f.path}', '${name}')">
            <i class="far fa-file-code icon"></i>${name}</div>`;
    }
    const children = Object.entries(node).map(([n, v]) => renderNode(n, v)).join('');
    return `<div class="node-item">
        <div class="folder-header" onclick="this.parentElement.classList.toggle('open')">
            <i class="far fa-folder icon"></i><span>${name}</span>
        </div>
        <div class="children" style="display:none; padding-left:18px;">${children}</div>
    </div>`;
}

// 弹窗逻辑
function openPreview(url, title) {
    const overlay = document.getElementById('el-dialog-overlay');
    const iframe = document.getElementById('preview-iframe');
    document.getElementById('dialog-title').innerText = title;
    iframe.src = url;
    overlay.style.display = 'flex';
}

function closeDialog() {
    document.getElementById('el-dialog-overlay').style.display = 'none';
    document.getElementById('preview-iframe').src = 'about:blank';
}

function toggleSize() {
    const dialog = document.getElementById('el-dialog');
    const isFull = dialog.getAttribute('data-state') === 'full';
    dialog.setAttribute('data-state', isFull ? 'normal' : 'full');
}

// 分页逻辑同前... (略)
init();