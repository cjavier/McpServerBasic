// TASK: contacts_in_deal
// Run this task with:
// forge task:run hubspot:contacts_in_deal --dealId 123456

import { createTask } from '@forgehive/task'
import { Schema } from '@forgehive/schema'
import * as dotenv from 'dotenv'
import axios, { AxiosError } from 'axios'

// Load environment variables from .env file
dotenv.config()

const schema = new Schema({
  dealId: Schema.string().describe('Hubspot deal ID to find associated contacts')
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

export const contactsInDeal = createTask(
  schema,
  boundaries,
  async function ({ dealId }, { fetchHubspotApi }) {
    try {
      // First, get the deal details to verify it exists
      const dealData = await fetchHubspotApi(`crm/v3/objects/deals/${dealId}`);
      
      // Get all contacts associated with this deal
      const contactAssociations = await fetchHubspotApi(`crm/v4/objects/deal/${dealId}/associations/contact`);
      
      if (!contactAssociations.results || contactAssociations.results.length === 0) {
        return {
          message: 'No contacts found associated with this deal',
          status: 'success',
          dealId: dealId,
          dealName: dealData.properties?.dealname || 'Unknown Deal',
          contacts: []
        }
      }
      
      // Extract contact IDs from the associations
      const contactIds = contactAssociations.results.map((result: any) => result.toObjectId);
      
      // Fetch details for each contact
      const contacts = [];
      for (const contactId of contactIds) {
        const contactData = await fetchHubspotApi(`crm/v3/objects/contacts/${contactId}`);
        contacts.push({
          id: contactData.id,
          properties: contactData.properties,
          createdAt: contactData.createdAt,
          updatedAt: contactData.updatedAt
        });
      }
      
      // Return contacts with their details
      return {
        message: `Found ${contacts.length} contacts associated with this deal`,
        status: 'success',
        dealId: dealId,
        dealName: dealData.properties?.dealname || 'Unknown Deal',
        dealStage: dealData.properties?.dealstage || 'Unknown Stage',
        dealAmount: dealData.properties?.amount || 'Unknown Amount',
        contacts: contacts
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

contactsInDeal.setDescription('Get all contacts associated with a Hubspot deal') 