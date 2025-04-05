// TASK: other_contacts_in_company
// Run this task with:
// forge task:run hubspot:other_contacts_in_company --contactId 123456

import { createTask } from '@forgehive/task'
import { Schema } from '@forgehive/schema'
import * as dotenv from 'dotenv'
import axios, { AxiosError } from 'axios'

// Load environment variables from .env file
dotenv.config()

const schema = new Schema({
  contactId: Schema.string().describe('Hubspot contact ID to find other contacts in the same company')
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

export const otherContactsInCompany = createTask(
  schema,
  boundaries,
  async function ({ contactId }, { fetchHubspotApi }) {
    try {
      // Step 1: Get the company associated with the contact
      const companyAssociations = await fetchHubspotApi(`crm/v4/objects/contact/${contactId}/associations/company`);
      
      if (!companyAssociations.results || companyAssociations.results.length === 0) {
        return {
          message: 'No associated company found for this contact',
          status: 'success',
          contactId: contactId,
          otherContacts: []
        }
      }
      
      // Get the first company ID (assuming primary company)
      const companyId = companyAssociations.results[0].toObjectId;
      
      // Step 2: Get all contacts associated with this company
      const contactAssociations = await fetchHubspotApi(`crm/v4/objects/company/${companyId}/associations/contact`);
      
      if (!contactAssociations.results || contactAssociations.results.length === 0) {
        return {
          message: 'No contacts found associated with the company',
          status: 'success',
          companyId: companyId,
          otherContacts: []
        }
      }
      
      // Extract contact IDs, filtering out the original contact
      const otherContactIds = contactAssociations.results
        .map((result: any) => result.toObjectId)
        .filter((id: string) => id !== contactId);
      
      // Fetch details for each contact
      const otherContacts = [];
      for (const otherContactId of otherContactIds) {
        const contactData = await fetchHubspotApi(`crm/v3/objects/contacts/${otherContactId}`);
        otherContacts.push({
          id: contactData.id,
          properties: contactData.properties,
          createdAt: contactData.createdAt,
          updatedAt: contactData.updatedAt
        });
      }
      
      // Return other contacts with their details
      return {
        message: `Found ${otherContacts.length} other contacts in the same company`,
        status: 'success',
        companyId: companyId,
        contactId: contactId,
        otherContacts: otherContacts
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

otherContactsInCompany.setDescription('Get other contacts associated with the same company as a Hubspot contact') 