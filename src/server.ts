import { serve } from '@hono/node-server'
import { Hono } from 'hono'
import { execa } from 'execa'
import { logger } from './logger'
import type { HooksArray, HookItemConfig as Hook } from './types'

// 执行命令并返回结果
async function executeHookCommand(hook: Hook, env: Record<string, any>) {
  try {
    // 验证工作目录是否存在
    if (!hook['command-working-directory']) {
      throw new Error('未指定工作目录')
    }
    
    logger.info(`执行钩子 ${hook.id} 的命令: ${hook['execute-command']}`)
    
    // 执行命令
    const { stdout, stderr } = await execa({
      cwd: hook['command-working-directory'],
      env: { ...process.env, ...env }
    })`${hook['execute-command']}`
    
    if (stderr) {
      logger.error(`钩子 ${hook.id} 执行出错:`, stderr)
      return {
        code: -1,
        data: stderr,
      }
    }
    
    logger.info(`钩子 ${hook.id} 执行成功`)
    return {
      code: 0,
      data: stdout,
    }
  } catch (error: any) {
    logger.error(`执行钩子 ${hook.id} 时发生错误:`, error.message)
    return {
      code: -1,
      data: error?.message || 'Unknown error occurred',
    }
  }
}

// 处理 GET 请求
async function handleGetRequest(c: any, hook: Hook) {
  const query = c.req.query()
  logger.info(`收到钩子 ${hook.id} 的 GET 请求:`, query)
  return executeHookCommand(hook, query)
}

// 处理 POST 请求
async function handlePostRequest(c: any, hook: Hook) {
  try {
    const body = await c.req.json()
    logger.info(`收到钩子 ${hook.id} 的 POST 请求:`, body)
    return executeHookCommand(hook, body)
  } catch (error: any) {
    logger.error(`处理钩子 ${hook.id} 的 POST 请求时发生错误:`, error.message)
    return {
      code: -1,
      data: 'Invalid JSON in request body',
    }
  }
}

// 404 处理中间件
function createNotFoundHandler() {
  return async (c: any) => {
    logger.warn(`404 Not Found: ${c.req.method} ${c.req.path}`)
    return c.json({
      code: 404,
      data: 'Not Found'
    }, 404)
  }
}

// 错误处理中间件
function createErrorHandler() {
  return async (err: any, c: any) => {
    logger.error('服务器错误:', err)
    return c.json({
      code: 500,
      data: 'Internal Server Error'
    }, 500)
  }
}

export function createServer(hooks: HooksArray, port: number = 3000) {
  const app = new Hono()
  
  // 健康检查端点
  app.get('/health', (c) => {
    logger.debug('健康检查请求')
    return c.json({
      status: 'ok',
      timestamp: new Date().toISOString()
    })
  })
  
  // 注册每个钩子的路由
  hooks.forEach((hook) => {
    const route = `/hooks/${hook.id}`
    
    // GET 请求处理
    app.get(route, async (c) => {
      const result = await handleGetRequest(c, hook)
      return c.json(result)
    })
    
    // POST 请求处理
    app.post(route, async (c) => {
      const result = await handlePostRequest(c, hook)
      return c.json(result)
    })
  })
  
  // 404 处理
  app.notFound(createNotFoundHandler())
  
  // 错误处理
  app.onError(createErrorHandler())
  
  // 启动服务
  logger.info(`服务启动地址：http://127.0.0.1:${port}`)
  return serve({
    fetch: app.fetch,
    port
  })
}