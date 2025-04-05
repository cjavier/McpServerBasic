import { ForgeTask } from '@forgehive/forge-runner';
import axios from 'axios';

interface StockPriceInput {
  ticker: string;
}

interface StockPriceOutput {
  ticker: string;
  price: number;
  currency: string;
  timestamp: string;
}

/**
 * Task that fetches the current price of a stock by its ticker symbol
 */
export const stockPrice: ForgeTask<StockPriceInput, StockPriceOutput> = {
  name: 'stock:price',
  description: 'Get the current price of a stock by its ticker symbol',
  
  // Define the input schema for this task
  inputSchema: {
    type: 'object',
    properties: {
      ticker: {
        type: 'string',
        description: 'The stock ticker symbol (e.g., AAPL for Apple Inc.)',
      },
    },
    required: ['ticker'],
  },
  
  // Define the output schema for this task
  outputSchema: {
    type: 'object',
    properties: {
      ticker: {
        type: 'string',
        description: 'The stock ticker symbol',
      },
      price: {
        type: 'number',
        description: 'The current stock price',
      },
      currency: {
        type: 'string',
        description: 'The currency of the price (e.g., USD)',
      },
      timestamp: {
        type: 'string',
        description: 'The timestamp when the price was fetched',
      },
    },
  },
  
  // Implement the actual task execution
  async run({ ticker }) {
    try {
      // In a real implementation, you would use a proper financial API
      // For this example, we're simulating the API call
      // Replace this with an actual API call in production
      
      // For demonstration, using a free API (you should use a more reliable API in production)
      const apiKey = process.env.STOCK_API_KEY || 'demo';
      const response = await axios.get(
        `https://www.alphavantage.co/query?function=GLOBAL_QUOTE&symbol=${ticker}&apikey=${apiKey}`
      );
      
      // Parse the response
      const data = response.data;
      
      // Check if we have valid data
      if (!data || !data['Global Quote'] || !data['Global Quote']['05. price']) {
        throw new Error(`Unable to fetch price for ticker ${ticker}`);
      }
      
      const price = parseFloat(data['Global Quote']['05. price']);
      
      return {
        ticker: ticker.toUpperCase(),
        price,
        currency: 'USD', // Assuming USD for simplicity
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error(`Error fetching stock price for ${ticker}:`, error);
      throw new Error(`Failed to fetch stock price for ${ticker}: ${error.message}`);
    }
  },
};
