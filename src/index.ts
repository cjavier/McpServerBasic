#!/usr/bin/env node

import { MCPServer } from '@modelcontextprotocol/server';
import { runner } from './runner';

async function main() {
  const server = new MCPServer({
    id: 'hello-mcp-server',
    title: 'Hello MCP Server',
    description: 'A basic MCP server implementation with example tools',
    version: '1.0.0',
    vendor: 'Example Vendor',
  });

  // Automatically register all tasks from the runner as MCP tools
  const tasks = runner.getTasks();
  for (const [taskId, task] of Object.entries(tasks)) {
    server.addTool({
      name: taskId,
      description: task.description,
      inputSchema: task.inputSchema,
      outputSchema: task.outputSchema,
      handler: async (input) => {
        try {
          return await runner.run(taskId, input);
        } catch (error) {
          console.error(`Error running task ${taskId}:`, error);
          throw error;
        }
      },
    });
  }

  try {
    await server.start();
    console.log(`MCP Server started. Press Ctrl+C to stop.`);
  } catch (error) {
    console.error('Failed to start MCP server:', error);
    process.exit(1);
  }
}

main().catch((error) => {
  console.error('Unhandled error:', error);
  process.exit(1);
});
