from app import db
from datetime import datetime

class MCPTask(db.Model):
    """Model to track MCP task executions"""
    id = db.Column(db.Integer, primary_key=True)
    task_id = db.Column(db.String(100), nullable=False)
    input_data = db.Column(db.JSON, nullable=False)
    output_data = db.Column(db.JSON, nullable=True)
    status = db.Column(db.String(20), nullable=False, default='pending')
    error = db.Column(db.Text, nullable=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    def __repr__(self):
        return f'<MCPTask {self.task_id} {self.status}>'