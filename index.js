require('dotenv').config()
const web = require('express')()
const redis = require('redis')
const router = require('./routing/routes')
const { DBController } = require('./controllers/dbController')
const { UpdateController } = require('./controllers/updateController')
const scheduler = require('node-cron')
const { Logger } = require('./utils/logger')

const APIPORT = process.env.APIPORT ? process.env.APIPORT : 80
const redisClient = redis.createClient()

// Проверяем задан ли токен администратора в .env
if (!process.env.ADMIN_TOKEN) {
    console.error('ERROR: No ADMIN_TOKEN in .env file')
    process.exit()
}


const init = async () => {
    Logger.log('Starting...')

    redisClient.on('error', (err) => {
        Logger.log('Redis connection failed')
        process.exit()
    })

    redisClient.on('connect', () => {
        Logger.log('Redis connection established')
    })

    redisClient.connect()
    await DBController.init(redisClient)


    web.use('/api', router)
    web.listen(APIPORT)
    Logger.log('Web server started on port ' + APIPORT)


    scheduler.schedule('* * * * *', async () => {
        await UpdateController.update()
    })
    Logger.log('Update scheduler started')
}
init()