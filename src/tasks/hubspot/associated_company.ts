// TASK: associated_company
// Run this task with:
// forge task:run hubspot:associated_company --contactId 123456

import { createTask } from '@forgehive/task'
import { Schema } from '@forgehive/schema'
import * as dotenv from 'dotenv'
import axios, { AxiosError } from 'axios'

// Load environment variables from .env file
dotenv.config()

const schema = new Schema({
  contactId: Schema.string().describe('Hubspot contact ID to get associated company for')
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

export const associatedCompany = createTask(
  schema,
  boundaries,
  async function ({ contactId }, { fetchHubspotApi }) {
    try {
      // Call Hubspot associations API to get company associated with contact
      const associations = await fetchHubspotApi(`crm/v4/objects/contact/${contactId}/associations/company`)
      
      if (!associations.results || associations.results.length === 0) {
        return {
          message: 'No associated company found for this contact',
          status: 'success',
          companies: []
        }
      }
      
      // Extract company IDs from the associations
      const companyIds = associations.results.map((result: any) => result.toObjectId);
      
      // Fetch details for each company
      const companies = [];
      for (const companyId of companyIds) {
        const companyData = await fetchHubspotApi(`crm/v3/objects/companies/${companyId}`);
        companies.push({
          id: companyData.id,
          properties: companyData.properties,
          createdAt: companyData.createdAt,
          updatedAt: companyData.updatedAt
        });
      }
      
      // Return associated companies with their details
      return {
        message: `Found ${companies.length} associated companies`,
        status: 'success',
        companies: companies
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

associatedCompany.setDescription('Get the company associated with a Hubspot contact') 