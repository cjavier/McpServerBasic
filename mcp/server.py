import json
import logging

logger = logging.getLogger(__name__)

class MCPServer:
    """Model Context Protocol (MCP) server implementation"""
    
    def __init__(self, id, title, description, version, vendor):
        self.id = id
        self.title = title
        self.description = description
        self.version = version
        self.vendor = vendor
        self.tools = []
        
    def add_tool(self, tool):
        """Add a tool to the MCP server"""
        self.tools.append(tool)
        logger.info(f"Added tool: {tool['name']}")
        
    def get_tools(self):
        """Get all registered tools"""
        return self.tools
        
    def get_tool_by_name(self, name):
        """Get a tool by its name"""
        for tool in self.tools:
            if tool["name"] == name:
                return tool
        return None
        
    def process_request(self, request_data):
        """Process an MCP request"""
        try:
            # Verify the request format
            if "type" not in request_data:
                raise ValueError("Invalid MCP request: missing 'type' field")
                
            request_type = request_data["type"]
            
            # Handle different request types
            if request_type == "discovery":
                return self.handle_discovery()
            elif request_type == "execution":
                return self.handle_execution(request_data)
            else:
                raise ValueError(f"Unsupported request type: {request_type}")
                
        except Exception as e:
            logger.error(f"Error processing MCP request: {str(e)}")
            return {
                "type": "error",
                "error": {
                    "message": str(e)
                }
            }
            
    def handle_discovery(self):
        """Handle MCP discovery request"""
        tool_schemas = []
        
        for tool in self.tools:
            tool_schemas.append({
                "name": tool["name"],
                "description": tool["description"],
                "input_schema": tool["input_schema"],
                "output_schema": tool["output_schema"]
            })
            
        return {
            "type": "discovery_response",
            "server": {
                "id": self.id,
                "title": self.title,
                "description": self.description,
                "version": self.version,
                "vendor": self.vendor
            },
            "tools": tool_schemas
        }
        
    def handle_execution(self, request_data):
        """Handle MCP execution request"""
        if "tool" not in request_data:
            raise ValueError("Invalid execution request: missing 'tool' field")
            
        tool_name = request_data["tool"]
        tool = self.get_tool_by_name(tool_name)
        
        if not tool:
            raise ValueError(f"Unknown tool: {tool_name}")
            
        # Extract parameters
        parameters = request_data.get("parameters", {})
        
        try:
            # Execute the tool handler
            result = tool["handler"](parameters)
            
            # Return the execution response
            return {
                "type": "execution_response",
                "result": result
            }
        except Exception as e:
            logger.error(f"Error executing tool {tool_name}: {str(e)}")
            return {
                "type": "error",
                "error": {
                    "message": f"Error executing tool {tool_name}: {str(e)}"
                }
            }