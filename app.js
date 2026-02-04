const CONFIG = {
    user: 'ignorance-shiyao',
    repo: 'ignorance',
    branch: 'main',
    pageSize: 8
};

let rawFiles = []; // 扁平数据，用于搜索
let filteredTree = []; // 搜索后的树状结构
let currentPage = 1;
let fuse;

async function init() {
    try {
        const url = `https://api.github.com/repos/${CONFIG.user}/${CONFIG.repo}/git/trees/${CONFIG.branch}?recursive=1`;
        const res = await fetch(url);
        const data = await res.json();

        rawFiles = data.tree.filter(i => i.type === 'blob' && i.path.endsWith('.html') && i.path !== 'index.html');

        // 初始化搜索库
        fuse = new Fuse(rawFiles, { keys: ['path'], threshold: 0.4 });

        handleSearch(); // 执行初始渲染
        setupSearchListener();
    } catch (e) {
        document.getElementById('tree-content').innerHTML = "加载失败，请检查 API 访问限制。";
    }
}

function setupSearchListener() {
    document.getElementById('searchInput').addEventListener('input', (e) => {
        const query = e.target.value.trim();
        if (query) {
            const results = fuse.search(query);
            renderTree(results.map(r => r.item));
        } else {
            renderTree(rawFiles);
        }
        currentPage = 1; // 重置页码
    });
}

function renderTree(files) {
    const tree = buildTree(files);
    filteredTree = Object.entries(tree);
    updateUI();
}

function buildTree(files) {
    const root = {};
    files.forEach(file => {
        const parts = file.path.split('/');
        let current = root;
        parts.forEach((part, i) => {
            if (!current[part]) {
                current[part] = i === parts.length - 1 ? { _file: file } : {};
            }
            current = current[part];
        });
    });
    return root;
}

function updateUI() {
    const container = document.getElementById('tree-content');
    const start = (currentPage - 1) * CONFIG.pageSize;
    const pageItems = filteredTree.slice(start, start + CONFIG.pageSize);

    container.innerHTML = pageItems.map(([name, node]) => createNodeHtml(name, node)).join('');

    // 更新页码
    const totalPages = Math.ceil(filteredTree.length / CONFIG.pageSize) || 1;
    document.getElementById('pageInfo')?.remove();
    document.getElementById('pageDots').innerText = `第 ${currentPage} / ${totalPages} 页`;
    document.getElementById('prevBtn').disabled = currentPage === 1;
    document.getElementById('nextBtn').disabled = currentPage === totalPages;
}

function createNodeHtml(name, node) {
    if (node._file) {
        return `<a class="file-item" href="./${node._file.path}">
            <span class="icon">📄</span><span>${name}</span>
        </a>`;
    }
    const children = Object.entries(node).map(([n, v]) => createNodeHtml(n, v)).join('');
    return `
        <div class="node-item folder-node">
            <div class="folder-header" onclick="this.parentElement.classList.toggle('open')">
                <span class="icon">📁</span><span>${name}</span>
                <span class="chevron">›</span>
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