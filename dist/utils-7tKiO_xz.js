import { serve } from "@hono/node-server";
import { Hono } from "hono";
import { execa } from "execa";

//#region src/logger.ts
var Logger = class {
	prefix;
	constructor(prefix = "") {
		this.prefix = prefix;
	}
	info(message, ...args) {
		console.log(`[INFO] ${this.prefix} ${message}`, ...args);
	}
	error(message, ...args) {
		console.error(`[ERROR] ${this.prefix} ${message}`, ...args);
	}
	warn(message, ...args) {
		console.warn(`[WARN] ${this.prefix} ${message}`, ...args);
	}
	debug(message, ...args) {
		console.debug(`[DEBUG] ${this.prefix} ${message}`, ...args);
	}
};
const logger = new Logger("[WebHook]");

//#endregion
//#region src/server.ts
async function executeHookCommand(hook, env) {
	try {
		if (!hook["command-working-directory"]) throw new Error("未指定工作目录");
		logger.info(`执行钩子 ${hook.id} 的命令: ${hook["execute-command"]}`);
		const { stdout, stderr } = await execa({
			cwd: hook["command-working-directory"],
			env: {
				...process.env,
				...Object.fromEntries(Object.entries(env).map(([k, v]) => [`HOOK_${k.toUpperCase()}`, v]))
			}
		})`${hook["execute-command"]}`;
		if (stderr) {
			logger.error(`钩子 ${hook.id} 执行出错:`, stderr);
			return {
				code: -1,
				data: stderr
			};
		}
		logger.info(`钩子 ${hook.id} 执行成功`);
		return {
			code: 0,
			data: stdout
		};
	} catch (error) {
		logger.error(`执行钩子 ${hook.id} 时发生错误:`, error.message);
		return {
			code: -1,
			data: error?.message || "Unknown error occurred"
		};
	}
}
async function handleGetRequest(c, hook) {
	const query = c.req.query();
	logger.info(`收到钩子 ${hook.id} 的 GET 请求:`, query);
	return executeHookCommand(hook, query);
}
async function handlePostRequest(c, hook) {
	try {
		const body = await c.req.json();
		logger.info(`收到钩子 ${hook.id} 的 POST 请求:`, body);
		return executeHookCommand(hook, body);
	} catch (error) {
		logger.error(`处理钩子 ${hook.id} 的 POST 请求时发生错误:`, error.message);
		return {
			code: -1,
			data: "Invalid JSON in request body"
		};
	}
}
function createNotFoundHandler() {
	return async (c) => {
		logger.warn(`404 Not Found: ${c.req.method} ${c.req.path}`);
		return c.json({
			code: 404,
			data: "Not Found"
		}, 404);
	};
}
function createErrorHandler() {
	return async (err, c) => {
		logger.error("服务器错误:", err);
		return c.json({
			code: 500,
			data: "Internal Server Error"
		}, 500);
	};
}
function createServer(hooks, port = 3e3) {
	const app = new Hono();
	app.get("/health", (c) => {
		logger.debug("健康检查请求");
		return c.json({
			status: "ok",
			timestamp: (/* @__PURE__ */ new Date()).toISOString()
		});
	});
	hooks.forEach((hook) => {
		const route = `/hooks/${hook.id}`;
		app.get(route, async (c) => {
			const result = await handleGetRequest(c, hook);
			return c.json(result);
		});
		app.post(route, async (c) => {
			const result = await handlePostRequest(c, hook);
			return c.json(result);
		});
	});
	app.notFound(createNotFoundHandler());
	app.onError(createErrorHandler());
	logger.info(`服务启动地址：http://127.0.0.1:${port}`);
	return serve({
		fetch: app.fetch,
		port
	});
}

//#endregion
//#region src/utils.ts
/**
* 验证钩子配置数组
* @param hooks 钩子配置数组
* @returns 验证错误信息数组，如果没有错误则为空数组
*/
function validateHooksConfig(hooks) {
	const errors = [];
	if (!Array.isArray(hooks)) {
		errors.push("配置必须是一个数组");
		return errors;
	}
	hooks.forEach((hook, index) => {
		const prefix = `钩子[${index}]`;
		if (!hook.id) errors.push(`${prefix}: 缺少必需字段 'id'`);
		else if (typeof hook.id !== "string") errors.push(`${prefix}: 'id' 必须是字符串`);
		if (!hook["execute-command"]) errors.push(`${prefix}: 缺少必需字段 'execute-command'`);
		else if (typeof hook["execute-command"] !== "string") errors.push(`${prefix}: 'execute-command' 必须是字符串`);
		if (!hook["command-working-directory"]) errors.push(`${prefix}: 缺少必需字段 'command-working-directory'`);
		else if (typeof hook["command-working-directory"] !== "string") errors.push(`${prefix}: 'command-working-directory' 必须是字符串`);
	});
	return errors;
}
/**
* 验证端口号
* @param port 端口号
* @returns 验证错误信息，如果验证通过则为null
*/
function validatePort(port) {
	if (!Number.isInteger(port)) return "端口号必须是整数";
	if (port < 1 || port > 65535) return "端口号必须在 1-65535 范围内";
	return null;
}

//#endregion
export { createServer, logger, validateHooksConfig, validatePort };