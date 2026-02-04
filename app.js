const CONFIG = { pageSize: 10 };
let rawFiles = [];
let filteredTree = [];
let currentPage = 1;
let fuse;

async function init() {
    try {
        // 直接读取本地生成的静态 JSON，不再请求 API
        const res = await fetch('./list.json');
        if (!res.ok) throw new Error('Not Found');
        rawFiles = await res.json();

        fuse = new Fuse(rawFiles, { keys: ['path'], threshold: 0.3 });
        handleSearch(""); // 初始渲染
        setupSearch();
    } catch (e) {
        document.getElementById('tree-content').innerHTML = `
            <div style="padding:40px; text-align:center; color: #999;">
                <p>未找到索引文件，请确保 Actions 已运行成功并生成 list.json</p>
            </div>`;
    }
}

function setupSearch() {
    document.getElementById('searchInput').addEventListener('input', (e) => {
        handleSearch(e.target.value.trim());
    });
}

function handleSearch(query) {
    const files = query ? fuse.search(query).map(r => r.item) : rawFiles;
    const tree = {};
    files.forEach(file => {
        const parts = file.path.split('/');
        let cur = tree;
        parts.forEach((p, i) => {
            if (!cur[p]) cur[p] = (i === parts.length - 1) ? { _f: file } : {};
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
    const pageItems = filteredTree.slice(start, start + CONFIG.pageSize);

    container.innerHTML = pageItems.map(([name, node]) => renderNode(name, node)).join('');

    const total = Math.ceil(filteredTree.length / CONFIG.pageSize) || 1;
    document.getElementById('pageDots').innerText = `${currentPage} / ${total}`;
    document.getElementById('prevBtn').disabled = currentPage === 1;
    document.getElementById('nextBtn').disabled = currentPage === total;
}

function renderNode(name, node) {
    if (node._f) {
        return `<a class="file-item" href="./${node._f.path}"><span class="icon">📄</span>${name}</a>`;
    }
    const children = Object.entries(node).map(([n, v]) => renderNode(n, v)).join('');
    return `
        <div class="node-item">
            <div class="folder-header" onclick="this.parentElement.classList.toggle('open')">
                <span class="icon">📁</span><span>${name}</span><span class="chevron">›</span>
            </div>
            <div class="children">${children}</div>
        </div>`;
}

function changePage(step) {
    currentPage += step;
    updateUI();
    window.scrollTo(0, 0);
}

init();