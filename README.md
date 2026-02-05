# 文档库 (Knowledge Base Workspace)

这是一个基于 **GitHub Actions** 自动化驱动的轻量级文档管理系统。它能够自动索引仓库中的 HTML 文档，并提供具备模糊搜索、目录折叠及实时主题同步预览功能的单页工作台体验。

## 核心功能特性

* **自动化索引**：利用 GitHub Actions 实时扫描仓库，生成 `list.json` 索引文件，彻底解决 GitHub API 的 60 次/小时访问频率限制。
* **深度主题同步**：
* 主控台支持浅色（Light）与暗色（Dark）模式无感切换。
* **传值渲染**：查阅文档时，系统会自动向子页面传递主题参数（如 `xxx.html?cs=light` 或 `xxx.html?cs=dark`，适用于 Typora 主题 [Vlook](https://github.com/MadMaxChow/VLOOK)的暗色和浅色模式），实现预览内容与主控台视觉的一致性。

* **现代交互体验**：
* **物理折叠**：侧边栏支持完全收起，为预览内容提供沉浸式视野。
* **模糊匹配**：集成 `Fuse.js` 算法，支持对文件名和路径的实时模糊检索。

* **响应式适配**：完美适配移动端，在手机浏览器上自动切换为抽屉式菜单布局。

---

## 目录结构与文件作用说明

```text
/
├── .github/workflows/
│   └── index-gen.yml     # [GitHub Actions] 核心自动化脚本，负责扫描 HTML 并生成索引
├── css/
│   └── style.css         # [样式] 基于 CSS 变量的主题系统，定义了响应式布局与视觉交互
├── js/
│   └── app.js            # [逻辑] 系统核心引擎，负责数据抓取、树形渲染、搜索及主题传值逻辑
├── index.html            # [入口] 系统的单页应用主入口，定义了工作台的物理骨架
└── list.json             # [数据] 自动生成的静态索引文件，存储仓库中所有可预览文档的路径

```

### 关键文件深度解析

| 文件 | 关键职责 | 核心逻辑点 |
| --- | --- | --- |
| **index-gen.yml** | 自动化维护 | 在每次 `push` 代码后触发，通过 `find` 和 `jq` 命令更新 `list.json`。 |
| **style.css** | 视觉约束 | 使用 `@media (max-width: 768px)` 实现移动端抽屉布局，定义了 `[data-theme]` 变量池。 |
| **app.js** | 交互路由 | 通过解析 `document.documentElement` 的主题状态，动态为 iframe 拼接 `cs` 参数。 |

## 快速启动

1. 将本项目代码上传至你的 GitHub 仓库。
2. 前往 **Settings -> Actions -> General**，确保 **Workflow permissions** 已开启 **Read and write permissions**。
3. 提交任意修改以触发第一次 Actions 运行，生成 `list.json`。
4. 将Vlook系列主题导出的html文件上传到你对应的仓库，开启 **GitHub Pages** 即可通过网页直接访问您的文档库。

