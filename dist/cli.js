import { createServer, logger, validateHooksConfig, validatePort } from "./utils-Bzk1WPXg.js";
import { cli } from "cleye";
import path from "path";
import fs from "fs/promises";

//#region src/cli.ts
/**
* 主函数，处理命令行参数并启动服务器
*/
async function main() {
	try {
		const argv = cli({
			name: "webhook",
			flags: {
				hooks: {
					type: String,
					description: "webhook定义文件路径",
					default: "hooks.json"
				},
				port: {
					type: Number,
					description: "监听端口",
					default: 3e3
				}
			}
		});
		const portError = validatePort(argv.flags.port);
		if (portError) {
			logger.error(`端口验证失败: ${portError}`);
			process.exit(1);
		}
		const realPath = path.join(process.cwd(), argv.flags.hooks);
		logger.info(`正在读取配置文件: ${realPath}`);
		const jsonFileContent = await fs.readFile(realPath, "utf-8");
		const hooks = JSON.parse(jsonFileContent);
		const validationErrors = validateHooksConfig(hooks);
		if (validationErrors.length > 0) {
			logger.error("配置文件验证失败:");
			validationErrors.forEach((error) => logger.error(`- ${error}`));
			process.exit(1);
		}
		const port = argv.flags.port;
		logger.info(`使用端口 ${port} 启动服务器`);
		const serve = createServer(hooks, port);
		process.on("SIGINT", () => {
			logger.info("\n正在关闭服务器...");
			serve.close(() => {
				logger.info("服务器已关闭");
				process.exit(0);
			});
		});
	} catch (error) {
		logger.error("启动服务器时发生错误:", error.message);
		process.exit(1);
	}
}
await main();

//#endregion
export {  };