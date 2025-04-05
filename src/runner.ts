import { Runner } from '@forgehive/runner'

import { price } from './tasks/stock/price'
import { portafolio } from './tasks/stock/portafolio'
import { contact } from './tasks/hubspot/contact'

const runner = new Runner()

runner.load('get_stock_price', price)
runner.load('get_stock_portafolio', portafolio)
runner.load('get_hubspot_contact', contact)

export default runner