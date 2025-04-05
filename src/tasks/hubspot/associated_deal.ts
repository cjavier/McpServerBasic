// TASK: associated_deal
// Run this task with:
// forge task:run hubspot:associated_deal --contactId 123456

import { createTask } from '@forgehive/task'
import { Schema } from '@forgehive/schema'
import * as dotenv from 'dotenv'
import axios, { AxiosError } from 'axios'

// Load environment variables from .env file
dotenv.config()

const schema = new Schema({
  contactId: Schema.string().describe('Hubspot contact ID to get associated deals for')
})

const boundaries = {
  fetchHubspotApi: async (endpoint: string): Promise<any> => {
    const token = process.env.HUBSPOT_TOKEN
    
    if (!token) {
      throw new Error('HUBSPOT_TOKEN is not defined in .env file')
    }
    
    try {
      const response = await axios.get(`https://api.hubapi.com/${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      return response.data;
    } catch (error: unknown) {
      const axiosError = error as AxiosError;
      throw new Error(`Failed to fetch data from Hubspot: ${axiosError.response?.status || 'unknown'} ${axiosError.response?.statusText || 'unknown error'}`);
    }
  }
}

export const associatedDeal = createTask(
  schema,
  boundaries,
  async function ({ contactId }, { fetchHubspotApi }) {
    try {
      // Call Hubspot associations API to get deals associated with contact
      const associations = await fetchHubspotApi(`crm/v4/objects/contact/${contactId}/associations/deal`)
      
      if (!associations.results || associations.results.length === 0) {
        return {
          message: 'No associated deals found for this contact',
          status: 'success',
          deals: []
        }
      }
      
      // Extract deal IDs from the associations
      const dealIds = associations.results.map((result: any) => result.toObjectId);
      
      // Fetch details for each deal
      const deals = [];
      for (const dealId of dealIds) {
        const dealData = await fetchHubspotApi(`crm/v3/objects/deals/${dealId}`);
        deals.push({
          id: dealData.id,
          properties: dealData.properties,
          createdAt: dealData.createdAt,
          updatedAt: dealData.updatedAt
        });
      }
      
      // Return associated deals with their details
      return {
        message: `Found ${deals.length} associated deals`,
        status: 'success',
        deals: deals
      }
    } catch (error: unknown) {
      // Handle errors gracefully with type assertion
      const errorMessage = (error instanceof Error) ? error.message : 'Unknown error occurred';
      return {
        error: errorMessage,
        status: 'failed'
      }
    }
  }
)

associatedDeal.setDescription('Get the deals associated with a Hubspot contact') 