# 📚 Document Base Workspace

[![GitHub License](https://img.shields.io/badge/license-MIT-blue.svg)](LICENSE)
[![Actions Status](https://img.shields.io/badge/Actions-Automated-success.svg)](https://github.com/ignorance-shiyao/ignorance/actions)
[![Theme-Sync](https://img.shields.io/badge/Theme--Sync-Vlook--Compatible-orange.svg)](#key-features)

**English** | [简体中文](./README.md)

A lightweight document management system driven by **GitHub Actions** automation. It automatically indexes HTML documents in the repository and provides a single-page workspace experience featuring fuzzy search, directory folding, and real-time theme synchronization.

---

## ✨ Key Features

* **🤖 Automated Indexing**: Leverages GitHub Actions to scan the repository in real-time and generate a `list.json` index, bypassing GitHub API rate limits.
* **🌓 Deep Theme Synchronization**:
    * **Seamless Switch**: The console supports one-click switching between Light and Dark modes.
    * **Parameter-driven Rendering**: When viewing documents, the system passes theme parameters (e.g., `?cs=light` or `?cs=dark`), perfectly compatible with Typora **Vlook** theme's mode switching.
* **🖥️ Modern Interaction**:
    * **Physical Folding**: The sidebar supports full collapse, providing an immersive view for the preview content.
    * **Fuzzy Matching**: Integrates the `Fuse.js` algorithm for real-time fuzzy search of filenames and paths.
* **📱 Responsive Design**: Fully optimized for mobile devices, automatically switching to a drawer-style menu layout on mobile browsers.

---

## 📂 Project Structure

```text
/
├── .github/workflows/
│   └── index-gen.yml     # Core GitHub Actions script for indexing
├── css/
│   └── style.css         # Theme styles, defining responsive layout & interaction
├── js/
│   └── app.js            # Core engine for rendering, search, and theme sync
├── index.html            # Main entry point for the SPA
└── list.json             # Automatically generated static index file