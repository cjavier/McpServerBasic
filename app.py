import os
import logging
from flask import Flask, request, jsonify
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import DeclarativeBase
from werkzeug.middleware.proxy_fix import ProxyFix

# Set up logging
logging.basicConfig(level=logging.DEBUG)
logger = logging.getLogger(__name__)

# Create base for SQLAlchemy models
class Base(DeclarativeBase):
    pass

# Initialize database
db = SQLAlchemy(model_class=Base)

# Create the Flask app
app = Flask(__name__)
app.secret_key = os.environ.get("SESSION_SECRET", "dev-secret-key")
app.wsgi_app = ProxyFix(app.wsgi_app, x_proto=1, x_host=1)  # needed for url_for to generate with https

# Configure the database
app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get("DATABASE_URL")
app.config["SQLALCHEMY_ENGINE_OPTIONS"] = {
    "pool_recycle": 300,
    "pool_pre_ping": True,
}

# Initialize the app with the extension
db.init_app(app)

# Import models and create tables
with app.app_context():
    import models  # noqa: F401
    db.create_all()

# Import MCP related modules
from mcp.server import MCPServer
from mcp.runner import runner

# Create MCP server instance
mcp_server = MCPServer(
    id='hello-mcp-server',
    title='Hello MCP Server',
    description='A basic MCP server implementation with example tools',
    version='1.0.0',
    vendor='Example Vendor',
)

# Define routes for the MCP server
@app.route('/api/mcp', methods=['POST'])
def mcp_api():
    """Handle MCP API requests"""
    try:
        data = request.json
        logger.debug(f"Received MCP request: {data}")
        
        # Process request based on MCP protocol specifications
        response = mcp_server.process_request(data)
        return jsonify(response)
    except Exception as e:
        logger.error(f"Error processing MCP request: {str(e)}")
        return jsonify({"error": str(e)}), 500

@app.route('/')
def index():
    """Simple index page showing the MCP server status"""
    return f"""
    <html>
    <head>
        <title>{mcp_server.title}</title>
        <link rel="stylesheet" href="https://cdn.replit.com/agent/bootstrap-agent-dark-theme.min.css">
        <style>
            body {{
                padding: 20px;
            }}
            .container {{
                max-width: 800px;
            }}
            pre {{
                background-color: #f8f9fa;
                padding: 15px;
                border-radius: 5px;
            }}
        </style>
    </head>
    <body data-bs-theme="dark">
        <div class="container">
            <h1>{mcp_server.title}</h1>
            <p>{mcp_server.description}</p>
            <p>Version: {mcp_server.version}</p>
            <p>Vendor: {mcp_server.vendor}</p>
            <h2>Available Tools</h2>
            <ul>
                {' '.join(f'<li><strong>{tool["name"]}</strong>: {tool["description"]}</li>' for tool in mcp_server.get_tools())}
            </ul>
            <h2>API Endpoint</h2>
            <p>MCP API is available at <code>/api/mcp</code> (POST)</p>
        </div>
    </body>
    </html>
    """

# Register tasks with the MCP server
def register_mcp_tasks():
    """Register all tasks from the runner as MCP tools"""
    tasks = runner.get_tasks()
    for task_id, task in tasks.items():
        mcp_server.add_tool({
            "name": task_id,
            "description": task.description,
            "input_schema": task.input_schema,
            "output_schema": task.output_schema,
            "handler": lambda input_data, task_id=task_id: runner.run(task_id, input_data)
        })
    logger.info(f"Registered {len(tasks)} MCP tools")

# Initialize MCP server
register_mcp_tasks()
logger.info("MCP Server initialized")