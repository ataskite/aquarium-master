# 水族大师 Demo

`aquarium-master` 是一个面向水族箱管理场景的微信小程序 Demo。项目以 `prototype.png` 为视觉参考，提供鱼缸档案、水质记录、维护记录、提醒、知识库、AI 问答和图片上传等基础能力。

仓库采用 pnpm workspace 组织，前端是 Taro + React 微信小程序，后端是 NestJS + Prisma API，开发依赖 PostgreSQL 与 MinIO，生产部署可通过 Docker Compose + Caddy 对外提供服务。

## 功能范围

- 鱼缸管理：创建、查看、更新、删除鱼缸档案，记录容积、尺寸、生物类型、运行状态和健康分。
- 水质记录：记录温度、pH、氨、亚硝酸盐、硝酸盐、TDS 和备注。
- 维护记录：记录换水、清洁、加药等维护动作，可关联图片。
- 提醒事项：创建和维护到期提醒，支持待办/完成状态。
- AI 助手：默认使用 echo provider，便于无外部服务时本地演示；也可切换到 HTTP provider。
- 知识库：提供水族知识文章的只读 API。
- 文件上传：通过 S3 SDK 写入 MinIO，也可替换为其他 S3 兼容对象存储。

## 技术栈

| 模块 | 技术 |
| --- | --- |
| 小程序前端 | Taro 4、React 18、TypeScript、NutUI React Taro、Zustand |
| API 服务 | NestJS 11、TypeScript、Prisma |
| 数据库 | PostgreSQL 16 |
| 对象存储 | MinIO、AWS S3 SDK |
| 网关 | Caddy |
| 包管理 | pnpm workspace、Corepack |
| 部署 | Docker Compose、GitHub Actions SSH 部署 |

## 目录结构

```text
.
├── apps/
│   ├── api/                 # NestJS + Prisma API 服务
│   │   ├── prisma/          # Prisma schema 与 migration
│   │   └── src/             # 业务模块、Controller、Service
│   └── weapp/               # Taro + React 小程序
│       ├── config/          # Taro 构建配置
│       └── src/             # 页面、状态与接口封装
├── infra/
│   └── Caddyfile            # Caddy 网关配置
├── .github/workflows/       # GitHub Actions 部署流水线
├── docker-compose.yml       # PostgreSQL、MinIO、API、Caddy
├── package.json             # 根 workspace 脚本
├── pnpm-workspace.yaml      # pnpm workspace 配置
└── prototype.png            # 产品原型参考图
```

## 环境要求

- Node.js 20+，建议通过 Corepack 使用仓库声明的 `pnpm@11.1.2`。
- Docker 与 Docker Compose，用于启动 PostgreSQL、MinIO，以及生产容器。
- 微信开发者工具，用于打开和预览 `apps/weapp`。

首次使用建议执行：

```bash
corepack enable
```

## 环境变量

本地开发从示例文件复制：

```bash
cp .env.example .env
```

常用变量说明：

| 变量 | 说明 | 默认值 |
| --- | --- | --- |
| `API_PORT` | NestJS API 监听端口 | `3000` |
| `WEB_APP_ORIGIN` | API CORS 允许来源，多个值用英文逗号分隔 | `http://localhost:10086` |
| `DATABASE_URL` | Prisma PostgreSQL 连接串 | `postgresql://aquarium:aquarium@localhost:5432/aquarium?schema=public` |
| `POSTGRES_PORT` | 本地 PostgreSQL 映射端口 | `5432` |
| `MINIO_ENDPOINT` | 服务端访问 MinIO 的地址 | `http://localhost:9000` |
| `MINIO_PUBLIC_ENDPOINT` | 返回给客户端访问文件的公开地址 | `http://localhost:9000` |
| `MINIO_BUCKET` | 文件上传 bucket | `aquarium` |
| `WECHAT_APP_ID` / `WECHAT_APP_SECRET` | 微信登录配置，留空时走 mock openid | 空 |
| `AI_PROVIDER` | AI provider，可选 `echo` 或 `http` | `echo` |
| `AI_HTTP_ENDPOINT` / `AI_HTTP_API_KEY` | HTTP AI provider 的地址与密钥 | 空 |
| `TARO_APP_API_BASE_URL` | 小程序/H5 请求的 API 根地址 | `http://localhost:3000` |

## 本地开发

### 1. 安装依赖

```bash
corepack pnpm install
```

### 2. 启动本地依赖

```bash
corepack pnpm docker:up
```

等价于：

```bash
docker compose up -d postgres minio
```

本地端口：

- API：`http://localhost:3000/api`
- PostgreSQL：`localhost:5432`
- MinIO API：`http://localhost:9000`
- MinIO 控制台：`http://localhost:9001`

MinIO 默认账号密码见 `.env.example`。

### 3. 初始化数据库

```bash
corepack pnpm prisma:generate
corepack pnpm prisma:migrate
```

`prisma:migrate` 会读取 `apps/api/prisma/schema.prisma`，并在本地数据库执行开发 migration。

### 4. 启动开发服务

同时启动 API 与小程序 watch 构建：

```bash
corepack pnpm dev
```

也可以分开启动：

```bash
corepack pnpm dev:api
corepack pnpm dev:weapp
```

## 微信小程序预览

启动小程序构建：

```bash
corepack pnpm dev:weapp
```

然后用微信开发者工具打开：

```text
apps/weapp
```

项目配置在 `apps/weapp/project.config.json`，`miniprogramRoot` 指向 `dist/`。本地联调接口由 `TARO_APP_API_BASE_URL` 控制，默认请求 `http://localhost:3000/api`。

## 浏览器 H5 预览

如果只是快速查看页面，可以启动 H5 版本：

```bash
corepack pnpm dev:h5
```

浏览器访问：

```text
http://localhost:10086
```

H5 仍会请求 `TARO_APP_API_BASE_URL`。需要联调接口时，另开终端启动 API：

```bash
corepack pnpm dev:api
```

## 常用脚本

| 命令 | 作用 |
| --- | --- |
| `corepack pnpm dev` | 并行启动 workspace 内所有开发服务 |
| `corepack pnpm dev:api` | 启动 NestJS API watch |
| `corepack pnpm dev:weapp` | 构建微信小程序并 watch |
| `corepack pnpm dev:h5` | 构建 H5 并 watch |
| `corepack pnpm build` | 构建所有 workspace |
| `corepack pnpm build:h5` | 构建 H5 产物 |
| `corepack pnpm typecheck` | 执行所有 workspace TypeScript 检查 |
| `corepack pnpm lint` | 当前等价于 TypeScript noEmit 检查 |
| `corepack pnpm prisma:generate` | 生成 Prisma Client |
| `corepack pnpm prisma:migrate` | 执行本地 Prisma dev migration |
| `corepack pnpm docker:up` | 启动 PostgreSQL 与 MinIO |

## API 说明

API 统一带 `/api` 前缀。

| 方法 | 路径 | 说明 |
| --- | --- | --- |
| `POST` | `/api/auth/wechat-login` | 微信 code 换 openid；未配置微信密钥时返回 `mock-openid-${code}` |
| `GET` / `PATCH` | `/api/users/:id` | 用户资料查询和更新 |
| `GET` / `POST` / `PATCH` / `DELETE` | `/api/aquariums` | 鱼缸 CRUD |
| `GET` | `/api/aquariums/:id` | 鱼缸详情，包含水质、维护和提醒记录 |
| `GET` / `POST` / `PATCH` / `DELETE` | `/api/water-quality-records` | 水质记录 CRUD |
| `GET` / `POST` / `PATCH` / `DELETE` | `/api/maintenance-records` | 维护记录 CRUD |
| `GET` / `POST` / `PATCH` / `DELETE` | `/api/reminders` | 提醒 CRUD |
| `POST` | `/api/ai/chat` | AI 问答 |
| `POST` | `/api/files/upload` | 文件上传到 MinIO/S3 |
| `GET` | `/api/knowledge` | 知识库列表 |
| `GET` | `/api/knowledge/:id` | 知识库详情 |

## 数据模型

核心实体定义在 `apps/api/prisma/schema.prisma`：

- `User`：用户资料与微信 openid。
- `Aquarium`：鱼缸档案，关联水质、维护和提醒记录。
- `WaterQualityRecord`：水质数据。
- `MaintenanceRecord`：维护记录。
- `Reminder`：提醒事项。
- `KnowledgeArticle`：知识库文章。
- `FileObject`：上传文件元数据。

## 外部能力替换点

- 微信登录：`apps/api/src/auth/wechat-openid.client.ts`。配置 `WECHAT_APP_ID` 与 `WECHAT_APP_SECRET` 后可接入真实微信 code2Session。
- AI 问答：`apps/api/src/ai/ai.service.ts`。默认 `AI_PROVIDER=echo`，可配置 `AI_PROVIDER=http`、`AI_HTTP_ENDPOINT`、`AI_HTTP_API_KEY` 接入兼容 HTTP 服务。
- 对象存储：`apps/api/src/storage/storage.service.ts`。当前使用 S3 SDK 对接 MinIO，可替换为其他 S3 兼容服务。
- API 地址：`apps/weapp/src/services/api.ts` 读取 `TARO_APP_API_BASE_URL`，用于切换本地、测试或生产接口。

## 构建与检查

```bash
corepack pnpm typecheck
corepack pnpm build
```

小程序生产构建：

```bash
corepack pnpm --filter @aquarium/weapp build
```

API 生产构建：

```bash
corepack pnpm --filter @aquarium/api build
```

H5 生产构建：

```bash
corepack pnpm build:h5
```

## Docker 部署

服务器需要 Docker、Docker Compose、Node.js/Corepack。首次部署流程：

```bash
git clone <repo-url> aquarium-master
cd aquarium-master
cp .env.example .env
vi .env
docker compose up -d postgres minio
corepack enable
corepack pnpm install
corepack pnpm --filter @aquarium/api prisma:migrate:deploy
docker compose up -d --build api caddy
```

Caddy 默认读取 `infra/Caddyfile`，通过 `APP_DOMAIN` 配置域名；未配置时使用 `localhost`。`/api/*` 会反向代理到 API 容器。

## GitHub Actions 部署

`.github/workflows/deploy.yml` 提供 SSH 部署流水线。推送到 `main` 或 `master` 后，会在服务器执行拉取代码、安装依赖、部署 Prisma migration，并重建 `api` 与 `caddy`。

需要配置这些 GitHub Secrets：

- `TENCENT_LIGHTHOUSE_HOST`
- `TENCENT_LIGHTHOUSE_USER`
- `TENCENT_LIGHTHOUSE_SSH_KEY`
- `DEPLOY_PATH`

## 常见问题

### API 启动后数据库连不上

确认 PostgreSQL 容器已启动，并且 `.env` 中 `DATABASE_URL` 的端口与 `POSTGRES_PORT` 一致。本项目默认使用宿主机 `5432`，避免和本机 `5432` 冲突。

### 小程序请求不到接口

确认 API 已启动在 `http://localhost:3000`，并检查 `.env` 中的 `TARO_APP_API_BASE_URL`。微信开发者工具里还需要根据实际情况配置合法域名或开启开发环境不校验合法域名。

### 上传文件失败

确认 MinIO 已启动，`MINIO_ENDPOINT`、`MINIO_BUCKET`、`MINIO_ACCESS_KEY`、`MINIO_SECRET_KEY` 与 `.env` 一致。当前代码不会自动创建 bucket，首次使用前需要在 MinIO 控制台创建 `.env` 中配置的 bucket，默认是 `aquarium`。

### AI 问答为什么只是回显

本地默认 `AI_PROVIDER=echo`，用于无外部依赖演示。要接入真实模型服务，设置 `AI_PROVIDER=http`，并配置 `AI_HTTP_ENDPOINT` 与 `AI_HTTP_API_KEY`。

### 微信登录为什么返回 mock openid

当 `WECHAT_APP_ID` 或 `WECHAT_APP_SECRET` 为空时，后端会进入占位模式，返回 `mock-openid-${code}`，方便本地开发。
