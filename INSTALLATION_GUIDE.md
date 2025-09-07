# 🚀 精致定时提醒工具 - 视觉增强版安装指南

## 📦 依赖安装

### 1. 安装核心依赖
```bash
npm install three@^0.158.0 framer-motion@^10.16.5
npm install --save-dev @types/three@^0.158.0
```

### 2. 验证安装
```bash
npm list three framer-motion
```

## 🔄 启用增强版本

### 方法1：替换主页面文件
```bash
# 备份原文件
mv app/page.tsx app/page-original.tsx

# 启用增强版本
mv app/page-enhanced.tsx app/page.tsx
```

### 方法2：手动切换
在 `app/layout.tsx` 中导入增强版本：
```typescript
import EnhancedHome from './page-enhanced'

export default function RootLayout({ children }) {
  return (
    <html lang="zh-CN">
      <body>
        <EnhancedHome />
      </body>
    </html>
  )
}
```

## 🎵 音频文件准备

### 创建音频目录
```bash
mkdir -p public/audio
```

### 下载音频文件
在 `public/audio/` 目录下放置以下文件：

1. **rain.mp3** - 雨声 (推荐时长: 2-5分钟)
2. **cafe.mp3** - 咖啡馆环境音 (推荐时长: 3-8分钟) 
3. **forest.mp3** - 森林鸟鸣 (推荐时长: 2-6分钟)
4. **reminder.mp3** - 提醒音效 (推荐时长: 1-3秒)

### 音频文件来源
- **Freesound.org** - 免费音效库
- **Zapsplat.com** - 专业音效平台
- **YouTube Audio Library** - YouTube音频库
- **Pixabay Audio** - 免费音频资源

### 临时测试文件
如果暂时没有音频文件，可以创建空的MP3文件用于测试：
```bash
touch public/audio/rain.mp3
touch public/audio/cafe.mp3  
touch public/audio/forest.mp3
touch public/audio/reminder.mp3
```

## 🛠️ 开发环境设置

### 启动开发服务器
```bash
npm run dev
```

### 访问应用
打开浏览器访问：http://localhost:3000

### 测试功能
1. **基础功能**：创建定时器、暂停/继续
2. **全屏模式**：按F1进入全屏
3. **白噪音**：测试音频播放（需要音频文件）
4. **动画效果**：观察各种交互动画

## 🎨 功能特性

### 🌟 视觉增强
- **Three.js 3D背景**：动态粒子和波浪效果
- **Framer Motion动画**：流畅的页面和组件动画
- **玻璃拟态设计**：现代化的半透明界面
- **渐变色彩系统**：丰富的色彩层次

### 🖥️ 全屏专注模式
- **F1快捷键**：一键进入沉浸式全屏
- **动态屏保**：可作为精美的桌面屏保
- **键盘控制**：空格暂停、方向键切换
- **自动隐藏**：3秒无操作自动隐藏控件

### 🎵 增强白噪音
- **可视化播放器**：实时音频波形显示
- **音量控制**：精确的音量调节滑块
- **动态主题**：不同音效的专属配色
- **播放状态**：丰富的视觉反馈

### 🎊 庆祝式提醒
- **粒子动画**：定时器完成时的庆祝效果
- **彩虹文字**：渐变色彩的标题显示
- **浮动装饰**：围绕弹窗的动画元素
- **完成统计**：显示专注时长等数据

## 🎮 操作指南

### 基础操作
```
创建定时器    - 填写表单，自动开始
模式切换     - 点击倒计时/定时模式卡片
暂停/继续    - 点击按钮或按空格键
删除定时器   - 点击垃圾桶图标
```

### 全屏模式
```
F1          - 进入全屏专注模式
ESC/F11     - 退出全屏模式
空格键       - 暂停/继续当前定时器
←/→ 方向键  - 切换不同定时器
鼠标移动     - 显示控制界面
```

### 白噪音控制
```
点击音效卡片  - 开启/关闭白噪音
拖动滑块     - 调节音量大小
切换音效     - 自动停止当前播放
```

## 🔧 故障排除

### 常见问题

**1. 依赖安装失败**
```bash
# 清除缓存重新安装
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

**2. Three.js 报错**
```bash
# 确保安装了正确版本
npm install three@^0.158.0 @types/three@^0.158.0
```

**3. 音频无法播放**
- 检查音频文件是否存在
- 确保浏览器允许自动播放
- 尝试用户交互后再播放

**4. 动画卡顿**
- 检查设备性能
- 关闭其他占用GPU的应用
- 降低浏览器缩放比例

### 性能优化

**降低粒子数量**（如果设备性能较低）：
```typescript
// 在 ThreeBackground.tsx 中修改
const particleCount = isFullscreen ? 4000 : 2000 // 原来是8000和4000
```

**禁用某些动画效果**：
```typescript
// 在组件中设置
const enableAnimations = false
```

## 📱 浏览器兼容性

### 推荐浏览器
- **Chrome 80+** ✅ 完全支持
- **Firefox 75+** ✅ 完全支持  
- **Safari 13+** ✅ 完全支持
- **Edge 80+** ✅ 完全支持

### 功能支持
- **WebGL** - Three.js 3D渲染
- **Web Audio API** - 音频播放和控制
- **CSS Backdrop Filter** - 毛玻璃效果
- **Fullscreen API** - 全屏模式

## 🚀 部署到生产环境

### 构建生产版本
```bash
npm run build
```

### 部署到 Vercel
```bash
# 安装 Vercel CLI
npm i -g vercel

# 部署
vercel --prod
```

### 部署到 Netlify
```bash
# 构建
npm run build

# 上传 out 目录到 Netlify
```

### 部署到 GitHub Pages
```bash
# 在 next.config.js 中确保有：
output: 'export'
trailingSlash: true
images: { unoptimized: true }

# 构建并部署
npm run build
# 将 out 目录内容推送到 gh-pages 分支
```

## 🎯 下一步

1. **安装依赖**：按照上述步骤安装所需包
2. **准备音频**：下载或录制白噪音文件
3. **启动应用**：运行开发服务器测试
4. **体验功能**：尝试全屏模式和各种动画
5. **自定义配置**：根据需要调整颜色和动画

享受这个全新的视觉体验吧！🎨✨