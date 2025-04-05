// TASK: contact
// Run this task with:
// forge task:run hubspot:contact --contactId 123456

import { createTask } from '@forgehive/task'
import { Schema } from '@forgehive/schema'
import * as dotenv from 'dotenv'

// Load environment variables from .env file
dotenv.config()

const schema = new Schema({
  contactId: Schema.string().describe('Hubspot contact ID to retrieve')
})

const boundaries = {
  fetchHubspotApi: async (endpoint: string): Promise<any> => {
    const token = process.env.HUBSPOT_TOKEN
    
    if (!token) {
      throw new Error('HUBSPOT_TOKEN is not defined in .env file')
    }
    
    const response = await fetch(`https://api.hubapi.com/crm/v3/${endpoint}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    })
    
    if (!response.ok) {
      throw new Error(`Failed to fetch data from Hubspot: ${response.status} ${response.statusText}`)
    }
    
    return response.json()
  }
}

export const contact = createTask(
  schema,
  boundaries,
  async function ({ contactId }, { fetchHubspotApi }) {
    try {
      // Call Hubspot contacts API to get contact by ID
      const data = await fetchHubspotApi(`objects/contacts/${contactId}`)
      
      // Return contact data
      return {
        id: data.id,
        properties: data.properties,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt
      }
    } catch (error) {
      // Handle errors gracefully
      if (error instanceof Error) {
        return {
          error: error.message,
          status: 'failed'
        }
      }
      return {
        error: 'Unknown error occurred',
        status: 'failed'
      }
    }
  }
)

contact.setDescription('Get a Hubspot contact by ID')