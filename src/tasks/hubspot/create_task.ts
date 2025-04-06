// TASK: create_task
// Run this task with:
// forge task:run hubspot:create_task --contactId 123456 --title "Task title" --description "Task description" --dueDate "2025-04-09T14:00:00Z"

import { createTask } from '@forgehive/task'
import { Schema } from '@forgehive/schema'
import * as dotenv from 'dotenv'
import axios, { AxiosError } from 'axios'

// Load environment variables from .env file
dotenv.config()

const schema = new Schema({
  contactId: Schema.string().describe('Hubspot contact ID to associate with the task'),
  title: Schema.string().describe('Title of the task'),
  description: Schema.string().describe('Description of the task'),
  dueDate: Schema.string().describe('Due date of the task in ISO format (e.g., 2025-04-09T14:00:00Z)')
})

const boundaries = {
  postHubspotApi: async (endpoint: string, data: any): Promise<any> => {
    const token = process.env.HUBSPOT_TOKEN
    
    if (!token) {
      throw new Error('HUBSPOT_TOKEN is not defined in .env file')
    }
    
    try {
      const response = await axios.post(`https://api.hubapi.com/crm/v3/${endpoint}`, data, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      return response.data;
    } catch (error: unknown) {
      const axiosError = error as AxiosError;
      throw new Error(`Failed to post data to Hubspot: ${axiosError.response?.status || 'unknown'} ${axiosError.response?.statusText || 'unknown error'}`);
    }
  }
}

export const createHubspotTask = createTask(
  schema,
  boundaries,
  async function ({ contactId, title, description, dueDate }, { postHubspotApi }) {
    try {
      // Prepare the request body
      const requestBody = {
        associations: [
          {
            types: [
              {
                associationCategory: "HUBSPOT_DEFINED",
                associationTypeId: 204
              }
            ],
            to: {
              id: contactId
            }
          }
        ],
        properties: {
          hs_task_body: description,
          hs_task_status: "NOT_STARTED",
          hs_task_subject: title,
          hs_timestamp: dueDate
        }
      };
      
      // Call Hubspot tasks API to create a new task
      const data = await postHubspotApi('objects/tasks', requestBody);
      
      // Return the created task data
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

createHubspotTask.setDescription('Create a new Hubspot task associated with a contact') 