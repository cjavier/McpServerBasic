import { Runner } from '@forgehive/runner'

import { price } from './tasks/stock/price'
import { portafolio } from './tasks/stock/portafolio'
import { contact } from './tasks/hubspot/contact'
import { company } from './tasks/hubspot/company'
import { lead } from './tasks/hubspot/lead'
import { deal } from './tasks/hubspot/deal'
import { associatedCompany } from './tasks/hubspot/associated_company'
import { otherContactsInCompany } from './tasks/hubspot/other_contacts_in_company'
import { associatedDeal } from './tasks/hubspot/associated_deal'
import { contactsInDeal } from './tasks/hubspot/contacts_in_deal'
import { contactActivities } from './tasks/hubspot/contact_activities'
import { createHubspotTask } from './tasks/hubspot/create_task'

const runner = new Runner()

runner.load('get_stock_price', price)
runner.load('get_stock_portafolio', portafolio)
runner.load('get_hubspot_contact', contact)
runner.load('get_hubspot_company', company)
runner.load('get_hubspot_lead', lead)
runner.load('get_hubspot_deal', deal)
runner.load('get_hubspot_associated_company', associatedCompany)
runner.load('get_hubspot_contacts_in_company', otherContactsInCompany)
runner.load('get_hubspot_associated_deal', associatedDeal)
runner.load('get_hubspot_contacts_in_deal', contactsInDeal)
runner.load('get_hubspot_contact_activities', contactActivities)
runner.load('create_hubspot_task', createHubspotTask)

export default runner