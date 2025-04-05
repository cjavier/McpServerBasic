// TASK: lead
// Run this task with:
// forge task:run hubspot:lead --leadId 123456

import { createTask } from '@forgehive/task'
import { Schema } from '@forgehive/schema'
import * as dotenv from 'dotenv'
import axios, { AxiosError } from 'axios'

// Load environment variables from .env file
dotenv.config()

const schema = new Schema({
  leadId: Schema.string().describe('Hubspot lead ID to retrieve')
})

const boundaries = {
  fetchHubspotApi: async (endpoint: string): Promise<any> => {
    const token = process.env.HUBSPOT_TOKEN
    
    if (!token) {
      throw new Error('HUBSPOT_TOKEN is not defined in .env file')
    }
    
    try {
      const response = await axios.get(`https://api.hubapi.com/crm/v3/${endpoint}`, {
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

export const lead = createTask(
  schema,
  boundaries,
  async function ({ leadId }, { fetchHubspotApi }) {
    try {
      // Call Hubspot leads API to get lead by ID
      const data = await fetchHubspotApi(`objects/leads/${leadId}`)
      
      // Return lead data
      return {
        id: data.id,
        properties: data.properties,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt
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

lead.setDescription('Get a Hubspot lead by ID') 