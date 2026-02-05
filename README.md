# 📚 文档库工作台 (Document Base Workspace)

[![GitHub License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Actions Status](https://img.shields.io/badge/Actions-Automated-success.svg)](https://github.com/ignorance-shiyao/ignorance/actions)
[![Theme-Sync](https://img.shields.io/badge/Theme--Sync-Vlook--Compatible-orange.svg)](#核心功能特性)

[English Version](./README_EN.md) | **简体中文**

这是一个基于 **GitHub Actions** 自动化驱动的轻量级文档管理系统。它能够自动索引仓库中的 HTML 文档，并提供具备模糊搜索、目录折叠及实时主题同步预览功能的单页工作台体验。

---

## ✨ 核心功能特性

* **🤖 自动化索引**：利用 GitHub Actions 实时扫描仓库，生成 `list.json` 索引文件，彻底解决 GitHub API 的频率限制问题。
* **🌓 深度主题同步**：
    * **无感切换**：主控台支持浅色（Light）与暗色（Dark）模式的一键切换。
    * **传值渲染**：查阅文档时，系统自动向子页面传递主题参数（如 `?cs=light` 或 `?cs=dark`），完美适配 Typora **Vlook** 主题的暗色和浅色模式切换。
* **🖥️ 现代交互体验**：
    * **物理折叠**：侧边栏支持完全收起，为预览内容提供沉浸式视野。
    * **模糊匹配**：集成 `Fuse.js` 算法，支持对文件名和路径的实时模糊检索。
* **📱 响应式适配**：完美适配移动端，在手机浏览器上自动切换为抽屉式菜单布局。

---

## 📂 目录结构说明

```text
/
├── .github/workflows/
│   └── index-gen.yml     # GitHub Actions 核心脚本，负责生成索引
├── css/
│   └── style.css         # 主题样式，定义响应式布局与视觉交互
├── js/
│   └── app.js            # 核心引擎，负责数据渲染、搜索及主题传值
├── index.html            # 单页应用 (SPA) 主入口
└── list.json             # 自动生成的静态索引文件