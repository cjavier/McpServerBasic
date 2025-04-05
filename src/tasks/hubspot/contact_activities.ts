// TASK: contact_activities
// Run this task with:
// forge task:run hubspot:contact_activities --contactId 123456

import { createTask } from '@forgehive/task'
import { Schema } from '@forgehive/schema'
import * as dotenv from 'dotenv'
import axios, { AxiosError } from 'axios'

// Load environment variables from .env file
dotenv.config()

const schema = new Schema({
  contactId: Schema.string().describe('Hubspot contact ID to get associated activities for')
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

export const contactActivities = createTask(
  schema,
  boundaries,
  async function ({ contactId }, { fetchHubspotApi }) {
    try {
      // First, get the contact details to verify it exists
      const contactData = await fetchHubspotApi(`crm/v3/objects/contacts/${contactId}`);
      
      // Define activity types to fetch
      const activityTypes = ['TASK', 'MEETING', 'CALL'];
      
      let allActivities = [];
      
      // Get activities for each type
      for (const activityType of activityTypes) {
        try {
          // Get activities of this type associated with the contact
          const associations = await fetchHubspotApi(`crm/v4/objects/contact/${contactId}/associations/${activityType.toLowerCase()}`);
          
          if (associations.results && associations.results.length > 0) {
            // Extract activity IDs
            const activityIds = associations.results.map((result: any) => result.toObjectId);
            
            // Fetch details for each activity
            for (const activityId of activityIds) {
              try {
                // Get detailed information about the engagement
                const engagementData = await fetchHubspotApi(`engagements/v1/engagements/${activityId}`);
                
                // Add the activity type for better organization
                engagementData.activityType = activityType;
                
                allActivities.push(engagementData);
              } catch (engagementError) {
                console.error(`Failed to fetch details for ${activityType} ID ${activityId}: ${engagementError}`);
                // Continue with the next activity
              }
            }
          }
        } catch (associationError) {
          console.error(`Failed to fetch ${activityType} associations: ${associationError}`);
          // Continue with the next activity type
        }
      }
      
      // Return the activities with their details
      return {
        message: `Found ${allActivities.length} activities for contact ${contactId}`,
        status: 'success',
        contactId: contactId,
        contactName: `${contactData.properties?.firstname || ''} ${contactData.properties?.lastname || ''}`.trim() || 'Unknown Contact',
        activities: allActivities.map(activity => ({
          id: activity.engagement?.id,
          type: activity.engagement?.type,
          timestamp: activity.engagement?.timestamp,
          title: activity.metadata?.title || 'No Title',
          status: activity.metadata?.status,
          body: activity.metadata?.body || activity.engagement?.bodyPreview,
          associations: activity.associations,
          createdAt: activity.engagement?.createdAt,
          lastUpdated: activity.engagement?.lastUpdated
        }))
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

contactActivities.setDescription('Get activities (tasks, meetings, calls) associated with a Hubspot contact') 