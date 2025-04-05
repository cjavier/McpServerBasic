import logging
from mcp.tasks.stock.price import stock_price

logger = logging.getLogger(__name__)

class ForgeRunner:
    """Task runner for MCP tasks"""
    
    def __init__(self):
        self.tasks = {}
        
    def load(self, task_id, task):
        """Register a task with the runner"""
        self.tasks[task_id] = task
        logger.info(f"Registered task: {task_id}")
        
    def get_tasks(self):
        """Get all registered tasks"""
        return self.tasks
        
    def run(self, task_id, input_data):
        """Run a task with the given input data"""
        if task_id not in self.tasks:
            raise ValueError(f"Unknown task: {task_id}")
            
        task = self.tasks[task_id]
        
        try:
            # Execute the task's run method
            result = task.run(input_data)
            return result
        except Exception as e:
            logger.error(f"Error running task {task_id}: {str(e)}")
            raise

# Create the runner instance
runner = ForgeRunner()

# Register tasks
runner.load('stock:price', stock_price)

# Auto-register all tasks
def auto_register_tasks():
    """Auto-register tasks (placeholder for more complex logic)"""
    logger.info(f"Auto-registered tasks: {list(runner.get_tasks().keys())}")

# Initialize auto-registration
auto_register_tasks()