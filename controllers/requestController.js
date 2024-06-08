const { DBController } = require('./dbController')
const { Logger } = require('../utils/logger')

class requestController {
    // Создание пользовательского токена
    static async createUserToken(req, res) {
        // Проверяем задан ли токен администратора в GET параметрах
        if (!req.query.token) {
            res.status(400).json({
                message: 'No token provided'
            })
            return
        }

        // Проверяем совпадает ли указанный токен с токеном администратора указанным в .env
        if (req.query.token !== process.env.ADMIN_TOKEN) {
            res.status(401).json({
                message: 'Invalid token'
            })
            return
        }

        // Проверяем задан ли subdomain в GET параметрах
        if (!req.query.subdomain) {
            res.status(400).json({
                message: 'No subdomain provided'
            })
            return
        }

        // Проверяем задан ли driver в GET параметрах
        if (!req.query.driver) {
            res.status(400).json({
                message: 'No driver provided'
            })
            return
        }

        // Проверяем существование домена
        const domainInUse = await DBController.domainInUse(req.query.subdomain)
        if (domainInUse) {
            res.status(409).json({
                message: 'Domain in use'
            })
            return
        }

        // Создаем токен
        const token = await DBController.createToken(req.query.subdomain, req.query.driver)

        // Создаем запись об использовании домена
        await DBController.createDomain(req.query.subdomain, token)

        Logger.log(`User token created: ${token}`, 'RequestController')

        res.status(200).json({
            message: 'Token created',
            token
        })
    }




    // Создание задачи для обновления IP
    static async createUpdateTask(req, res) {
        try {
            // Проверяем указан ли токен и существует ли он в Redis
            const tokenExists = await DBController.tokenExists(req.query.token)
            if (!tokenExists) {
                res.status(401).json({
                    message: 'Invalid token'
                })
                return
            }

            // Получаем ip пользователя в формате 0.0.0.0
            let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress

            // Убираем из ip адреса часть IPv6
            ip = ip.replace(/(.*:)/, '')

            // Получаем домен по токену
            const subdomain = await DBController.getDomainByToken(req.query.token)

            // Пишем задачу в Redis
            await DBController.createUpdateTask(req.query.token, subdomain, ip)

            Logger.log(`Update task created: ${ip} - ${subdomain}`, 'RequestController')

            res.status(200).json({
                message: 'Task created'
            })
        } catch (error) {
            res.status(500).json({
                message: 'Internal server error',
                error
            })
        }
    } 
}

module.exports = requestController