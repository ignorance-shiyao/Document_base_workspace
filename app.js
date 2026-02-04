const CONFIG = { pageSize: 100 }; // 既然是知识库，增加单页显示数量
let rawFiles = [], filteredTree = [], fuse;

async function init() {
    const savedTheme = localStorage.getItem('theme') || 'light';
    document.documentElement.setAttribute('data-theme', savedTheme);

    try {
        const res = await fetch('./list.json');
        rawFiles = await res.json();
        fuse = new Fuse(rawFiles, { keys: ['path'], threshold: 0.4 });
        renderList(rawFiles);

        document.getElementById('searchInput').addEventListener('input', (e) => {
            const query = e.target.value.trim();
            const results = query ? fuse.search(query).map(r => r.item) : rawFiles;
            renderList(results);
        });
    } catch (e) {
        console.error("未能加载索引文件 list.json");
    }
}

function renderList(files) {
    const container = document.getElementById('tree-content');
    const tree = {};

    // 构建简单层级（根据你的参考图，展示方式偏向扁平卡片）
    files.forEach(f => {
        const parts = f.path.split('/');
        let cur = tree;
        parts.forEach((p, i) => {
            if (!cur[p]) cur[p] = (i === parts.length - 1) ? { _f: f } : {};
            cur = cur[p];
        });
    });

    container.innerHTML = Object.entries(tree).map(([name, node]) => createNodeHtml(name, node)).join('');
}

function createNodeHtml(name, node) {
    if (node._f) {
        return `
            <div class="file-item" onclick="loadPage(this, './${node._f.path}', '${name}')">
                <i class="far fa-file-lines"></i>
                <span>${name}</span>
            </div>`;
    }
    const children = Object.entries(node).map(([n, v]) => createNodeHtml(n, v)).join('');
    return `
        <div class="folder-group">
            <div class="folder-header" onclick="this.nextElementSibling.style.display = this.nextElementSibling.style.display === 'none' ? 'block' : 'none'">
                <i class="fas fa-chevron-right"></i>
                <span>${name}</span>
            </div>
            <div class="folder-content" style="display:none; padding-left:15px;">${children}</div>
        </div>`;
}

function loadPage(el, url, title) {
    document.querySelectorAll('.file-item').forEach(item => item.classList.remove('active'));
    el.classList.add('active');

    document.getElementById('emptyPlaceholder').style.display = 'none';
    document.getElementById('iframeLoader').style.display = 'flex';
    document.getElementById('currentPageTitle').innerText = title;

    const iframe = document.getElementById('mainIframe');
    iframe.src = url;
    iframe.onload = () => document.getElementById('iframeLoader').style.display = 'none';
}

function toggleTheme() {
    const current = document.documentElement.getAttribute('data-theme');
    const next = current === 'light' ? 'dark' : 'light';
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('theme', next);
}

init();