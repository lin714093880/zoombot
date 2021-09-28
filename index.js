import config from './config.js'
import Zoom from './zoom.js'
import logger from './logger.js'

for (const meeting of config) {
  const loggerName = `[Main/${meeting.name}] `
  // TODO: cron

  const zoom = new Zoom(meeting.name, meeting.zoomConfig)
  logger.debug(loggerName + `Created zoom instance for meeting`)
  await zoom.join()
  logger.info(loggerName + `Successfully joined meeting`)

  for (const pluginConfig of meeting.plugins) {
    const plugin = new pluginConfig.plugin(meeting.name, zoom, pluginConfig.config)
    logger.debug(loggerName + `Created ${pluginConfig.name}`)
    const pluginPromise = plugin.run()
    logger.info(loggerName + `Started ${pluginConfig.name}`)

    pluginPromise.then(() => {
      if (plugin.running) {
        logger.warn(loggerName + `${pluginConfig.name} terminated unexpectedly`)
      } else {
        logger.info(loggerName + `${pluginConfig.name} terminated successfully`)
      }
    }).catch(e => {
      logger.error(loggerName + `${pluginConfig.name} terminated with exception`)
      logger.error(e)
    })
  }
}
