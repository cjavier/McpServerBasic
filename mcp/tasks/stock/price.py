import logging
import random
from datetime import datetime

logger = logging.getLogger(__name__)

class StockPrice:
    """Task that fetches the current price of a stock by its ticker symbol"""
    
    description = "Get the current price of a stock by ticker symbol"
    
    input_schema = {
        "type": "object",
        "properties": {
            "ticker": {
                "type": "string",
                "description": "The ticker symbol of the stock"
            }
        },
        "required": ["ticker"]
    }
    
    output_schema = {
        "type": "object",
        "properties": {
            "ticker": {
                "type": "string",
                "description": "The ticker symbol of the stock"
            },
            "price": {
                "type": "number",
                "description": "The current price of the stock"
            },
            "currency": {
                "type": "string",
                "description": "The currency of the price"
            },
            "timestamp": {
                "type": "string",
                "description": "The timestamp of the price"
            }
        },
        "required": ["ticker", "price", "currency", "timestamp"]
    }
    
    @staticmethod
    def run(input_data):
        """Run the stock price task"""
        ticker = input_data.get("ticker")
        
        if not ticker:
            raise ValueError("Ticker symbol is required")
            
        # In a real implementation, this would call a stock API
        # For now, we'll just return mock data
        logger.info(f"Fetching stock price for {ticker}")
        
        # Create a deterministic but random-looking price based on ticker
        seed = sum(ord(c) for c in ticker)
        random.seed(seed)
        price = round(random.uniform(10, 1000), 2)
        
        return {
            "ticker": ticker,
            "price": price,
            "currency": "USD",
            "timestamp": datetime.now().isoformat()
        }
        
# Export the task instance
stock_price = StockPrice