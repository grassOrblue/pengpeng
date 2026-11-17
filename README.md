# 碰一碰好评小程序

> 美团/抖音/大众点评 碰一碰 NFC 好评小程序，使用 HBuilder X 开发，支持多端发布

## 项目结构

```
pengyipeng/
├── frontend/          # uni-app 小程序前端（HBuilder X 项目）
│   ├── pages/         # 页面
│   │   ├── index/     # 首页
│   │   ├── merchant/  # 商家入驻/登录/中心
│   │   ├── product/   # 产品管理
│   │   ├── qrcode/    # 二维码/NFC生成
│   │   ├── tap/       # 碰一碰结果
│   │   └── platform/  # 平台跳转
│   ├── utils/         # API工具
│   ├── App.vue
│   ├── main.js
│   ├── manifest.json  # 多端配置
│   ├── pages.json     # 路由配置
│   └── uni.scss       # 全局样式
├── backend/           # Node.js 后端服务
│   ├── routes/        # API路由
│   ├── db/            # 数据库
│   ├── server.js      # 主服务
│   └── package.json
├── admin/             # 后台管理界面
│   ├── index.html
│   ├── admin.js
│   └── admin.css
└── README.md
```

## 功能说明

### 商家端
1. **商家入驻** - 填写店铺信息、各平台商家链接
2. **产品管理** - 添加产品、上传图片、设置价格
3. **碰一碰二维码** - 生成各平台的碰一碰二维码
4. **NFC标签写入** - 将碰一碰URL写入NFC标签

### 客户端
1. **碰一碰** - 手机触碰NFC标签或扫描二维码
2. **自动跳转** - 跳转到对应平台商家页面
3. **AI好评生成** - 大模型自动生成好评文案
4. **一键发布** - 好评自动填入，确认即可发布

### 后台管理
1. **仪表盘** - 数据统计概览
2. **商家管理** - 审核入驻、编辑商家信息
3. **产品管理** - 查看所有产品
4. **AI接口配置** - 配置大模型API（OpenAI兼容格式）
5. **好评模板** - 管理各平台好评模板
6. **碰一碰记录** - 查看历史记录

## 技术栈

- **前端**: uni-app (Vue2) + HBuilder X
- **后端**: Node.js + Express + SQLite
- **AI**: OpenAI兼容API（支持OpenAI/DeepSeek/通义千问等）
- **二维码**: qrcode 库
- **NFC**: uni-app NFC API（APP端）

## 快速启动

### 1. 启动后端服务

```bash
cd backend
npm install
npm start
```

服务启动后：
- 后台管理: http://localhost:3000/admin/
- API服务: http://localhost:3000/api/

### 2. 启动前端（HBuilder X）

1. 用 HBuilder X 打开 `frontend` 目录
2. 点击「运行」→ 选择目标平台（H5/微信小程序/APP等）
3. H5模式下会自动代理API到后端

### 3. 配置AI接口

1. 打开后台管理 → AI接口配置
2. 添加大模型API配置（如OpenAI、DeepSeek等）
3. 填入API地址、API Key、模型名称
4. 设为当前使用配置

## 平台风格

| 平台 | 主色调 | 风格 |
|------|--------|------|
| 美团 | #FFD700 (黄色) | 热情、口语化 |
| 抖音 | #FE2C55 (红黑) | 潮流、有梗 |
| 大众点评 | #FF7A00 (橙色) | 专业、细致 |

## 默认管理员

- 用户名: admin
- 密码: admin123

## 多端发布

在 HBuilder X 中：
- **H5**: 运行 → 运行到浏览器
- **微信小程序**: 运行 → 运行到小程序模拟器
- **APP**: 运行 → 运行到手机或模拟器
- **抖音小程序**: 发行 → 抖音小程序
- **美团小程序**: 发行 → 美团小程序

## 注意事项

- NFC功能仅在APP端（Android）可用
- AI接口未配置时，系统使用内置模板生成好评
- 各平台商家链接需在后台或入驻时填写
