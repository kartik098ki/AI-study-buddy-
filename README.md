# AI Study Buddy 🧠

一个基于AI的智能学习平台，帮助学生自动解析文档、生成总结、创建闪卡和测验题。

## 功能特点

- 📄 **文档上传**: 支持PDF、TXT文件上传和自动解析
- 📝 **AI总结**: 使用Google Gemini API生成智能内容总结
- 🎴 **闪卡生成**: 自动创建学习闪卡，包含难度分级
- 📋 **测验生成**: 基于内容生成多选题测试理解程度
- 📚 **资源管理**: 组织和管理所有学习材料

## 技术栈

- **前端**: Next.js 15 + TypeScript + Tailwind CSS + shadcn/ui
- **后端**: Next.js API Routes + ZAI Web Dev SDK
- **AI服务**: Google Gemini API (通过ZAI SDK)
- **文档处理**: pdf-parse for PDF文件解析

## API端点

### 1. 文档处理
```
POST /api/process-document
Content-Type: multipart/form-data
Body: FormData with 'file' field
```

### 2. 生成总结
```
POST /api/generate-summary
Content-Type: application/json
Body: { "content": "text content" }
```

### 3. 生成闪卡
```
POST /api/generate-flashcards
Content-Type: application/json
Body: { "content": "text content", "summary": "summary text" }
```

### 4. 生成测验
```
POST /api/generate-quiz
Content-Type: application/json
Body: { "content": "text content", "summary": "summary text" }
```

## 使用方法

1. **上传文档**: 在主页面选择"Add Resources"标签页
2. **选择输入方式**: 
   - 上传PDF或TXT文件
   - 直接粘贴文本内容
3. **AI处理**: 系统自动生成总结、闪卡和测验
4. **查看资源**: 在"My Resources"中查看所有学习材料
5. **学习模式**: 使用"Study Mode"进行专注学习

## 安全性

- Google Gemini API密钥安全存储在服务器端
- 前端无法直接访问API密钥
- 所有AI请求都通过后端代理

## 测试

访问 `/test.html` 页面可以测试所有API功能，使用示例内容验证AI生成效果。

## 项目结构

```
src/
├── app/
│   ├── page.tsx                 # 主页面
│   ├── api/
│   │   ├── process-document/    # 文档处理API
│   │   ├── generate-summary/    # 总结生成API
│   │   ├── generate-flashcards/ # 闪卡生成API
│   │   └── generate-quiz/       # 测验生成API
│   └── globals.css
├── components/ui/               # shadcn/ui组件
└── lib/                         # 工具库
```

## 开发说明

- 使用 `npm run dev` 启动开发服务器
- 使用 `npm run lint` 检查代码质量
- API密钥已配置在ZAI SDK中，确保后端服务正常运行

## 未来功能

- [ ] 支持更多文档格式 (DOC, DOCX)
- [ ] 添加用户账户系统
- [ ] 实现学习进度跟踪
- [ ] 添加协作学习功能
- [ ] 支持多语言内容处理