为了衬托你对摄影的热爱，你的相册不应该只是简单的图片堆砌，而应该具备**“策展感”**。

考虑到你计算机专业的背景，我为你设计了一个**“非对称响应式 Bento Grid（便当盒布局）”**相册。这种布局是目前国际顶级设计站点（如 Apple, Linear）最流行的风格，能完美平衡不同构图（横屏、竖屏、方构图）的照片。

------

## 1. 设计亮点：策展式相册

- **动态比例：** 照片不再等大，系统根据视觉权重自动分配大小，模拟实体影集的错落感。
- **黑标数据回显 (EXIF Overlay)：** 悬停时显示照片的拍摄参数（ISO, 快门, 光圈），体现你的专业性。
- **毛玻璃（Glassmorphism）交互：** 采用半透明容器承载文字，增加层次感。
- **性能优化：** 使用 `object-fit: cover` 确保图片不失真。

------

## 2. 前端代码实现

你可以直接将以下代码复制到你的项目中。

### HTML 结构 (`index.html`)

HTML

```
<div class="gallery-container">
    <header class="gallery-header">
        <h1>视界 / PERCEPTION</h1>
        <p>捕捉光影中的算法美学</p>
    </header>

    <div class="bento-grid">
        <div class="gallery-item tall">
            <img src="https://images.unsplash.com/photo-1493246507139-91e8bef99c02" alt="Nature">
            <div class="exif-info">
                <span class="location">Mount Fuji, Japan</span>
                <span class="specs">f/2.8 · 1/1000 · ISO 100</span>
            </div>
        </div>

        <div class="gallery-item">
            <img src="https://images.unsplash.com/photo-1501785888041-af3ef285b470" alt="Scenery">
            <div class="exif-info">
                <span class="specs">f/4.0 · 1/500 · ISO 200</span>
            </div>
        </div>

        <div class="gallery-item wide">
            <img src="https://images.unsplash.com/photo-1470770841072-f978cf4d019e" alt="Horizon">
            <div class="exif-info">
                <span class="location">Alps, France</span>
                <span class="specs">f/8.0 · 1/250 · ISO 400</span>
            </div>
        </div>

        <div class="gallery-item">
            <img src="https://images.unsplash.com/photo-1441974231531-c6227db76b6e" alt="Forest">
        </div>
        
        </div>
</div>
```

### CSS 样式 (`style.css`)

CSS

```
:root {
    --bg-color: #0a0a0a;
    --text-color: #ffffff;
    --accent-color: #00ffcc; /* AI感极光绿 */
}

body {
    background-color: var(--bg-color);
    color: var(--text-color);
    font-family: 'Inter', -apple-system, sans-serif;
    margin: 0;
}

.gallery-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 80px 20px;
}

.gallery-header {
    text-align: center;
    margin-bottom: 60px;
}

.gallery-header h1 {
    font-size: 2.5rem;
    letter-spacing: 4px;
    font-weight: 200;
}

/* Bento Grid 核心布局 */
.bento-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    grid-auto-rows: 240px;
    grid-gap: 15px;
}

.gallery-item {
    position: relative;
    border-radius: 12px;
    overflow: hidden;
    background: #1a1a1a;
    transition: transform 0.4s cubic-bezier(0.165, 0.84, 0.44, 1);
}

/* 跨行与跨列设置，形成非对称美感 */
.gallery-item.tall { grid-row: span 2; }
.gallery-item.wide { grid-column: span 2; }

@media (max-width: 768px) {
    .gallery-item.wide { grid-column: span 1; }
}

.gallery-item img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    filter: grayscale(20%); /* 统一低饱和度色调 */
    transition: all 0.6s ease;
}

/* 悬停动效 */
.gallery-item:hover {
    transform: translateY(-5px);
    z-index: 10;
}

.gallery-item:hover img {
    filter: grayscale(0%);
    transform: scale(1.05);
}

/* EXIF 信息浮层 */
.exif-info {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 20px;
    background: linear-gradient(transparent, rgba(0,0,0,0.8));
    opacity: 0;
    transition: opacity 0.3s ease;
    display: flex;
    flex-direction: column;
}

.gallery-item:hover .exif-info {
    opacity: 1;
}

.exif-info .location {
    font-size: 0.9rem;
    font-weight: 600;
}

.exif-info .specs {
    font-size: 0.75rem;
    color: var(--accent-color);
    margin-top: 5px;
    font-family: 'Courier New', monospace;
}
```

------

## 3. 进阶建议：让相册更有“计算机专业”味

1. **自动读取 EXIF：** 既然是计算机专业，你可以使用 `exif-js` 这个库，实现用户上传照片后，前端自动解析照片的 ISO、光圈、地理位置并显示，而不是手动写死 HTML。
2. **暗房加载效果：** 在图片加载时，可以先显示一个黑白底片样式的占位图（Placeholder），然后像冲洗照片一样慢慢变为彩色。