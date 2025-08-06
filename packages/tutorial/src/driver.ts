import { driver, Driver, Config } from 'driver.js'
import 'driver.js/dist/driver.css'

let driverObj: Driver | undefined

type DriverOptions = {
  override?: boolean
}

export default (config?: Config, options?: DriverOptions): Driver => {
  if (!driverObj || options?.override) {
    driverObj = driver(config)
  }

  return driverObj
}
