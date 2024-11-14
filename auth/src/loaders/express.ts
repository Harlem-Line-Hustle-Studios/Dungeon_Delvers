import { json, Application } from 'express'
import  from 'cors'
import config from '../config'
import routes from '../api'
import auth from '../services/auth'
export default (app: Application) => {
  app.get('/status', (req, res) => {
    res.status(200).end()
  })
  app.head('/status', (req, res) => {
    res.status(200).end()
  })

  // Useful if you're behind a reverse proxy (Heroku, Bluemix, AWS ELB, Nginx, etc)
  // It shows the real origin IP in the heroku or Cloudwatch logs
  app.enable('trust proxy')

  // The magic package that prevents frontend developers going nuts
  // Alternate description:
  // Enable Cross Origin Resource Sharing to all origins by default
  app.use(cors())
  auth(app)
  // Transforms the raw string of req.body into json
  app.use(json())
  app.use(config.api.prefix, routes())
}
