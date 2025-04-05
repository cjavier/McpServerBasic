import { ForgeRunner } from '@forgehive/forge-runner';
import { stockPrice } from './tasks/stock/price';

// Create the runner instance
export const runner = new ForgeRunner();

// Register all tasks here
runner.load('stock:price', stockPrice);

// Auto-register all tasks to avoid manual registration
// You could also use directory scanning to automate this further
export function autoRegisterTasks() {
  // This is a placeholder for auto-registration logic
  // In a more complex application, this could scan the tasks directory
  // and automatically register all tasks found
  console.log('Auto-registered tasks:', Object.keys(runner.getTasks()));
}

// Initialize auto-registration
autoRegisterTasks();
