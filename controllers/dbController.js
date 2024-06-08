const crypto = require('crypto')

class DBController {
    // Инициализация Redis клиента
    static async init(redisClient) {
        this.redisClient = redisClient
    }

    // Проверка существования токена
    static async tokenExists(token) {
        return new Promise(async (resolve, reject) => {
            let result = await this.redisClient.exists(`user-token:${token}`)
            if (result) {
                resolve(true)
            } else {
                resolve(false)
            }
        })
    }

    // Проверка использования домена
    static async domainInUse(subdomain) {
        return new Promise(async (resolve, reject) => {
            let result = await this.redisClient.get(`domain:${subdomain}`)
            if (result) {
                resolve(true)
            } else {
                resolve(false)
            }
        })
    }

    // Получение домена по токену
    static async getDomainByToken(token) {
        return new Promise(async (resolve, reject) => {

            let result = await this.redisClient.hGet(`user-token:${token}`, 'subdomain')
            if (result) {
                resolve(result)
            } else {
                reject()
            }
        })
    }

    // Создание пользовательского токена
    static async createToken(subdomain, driver) {
        return new Promise(async (resolve, reject) => {
            // Генерируем случайную строку которая будет токеном
            const randomString = crypto.randomBytes(16).toString('hex')

            // Проверяем существование токена
            let tokenExists = await this.tokenExists(randomString)
            if (tokenExists) {
                return this.createToken(subdomain)
            }

            // Пишем токен в Redis
            // let result = await this.redisClient.set(`user-token:${randomString}`, subdomain)
            let result = await this.redisClient.hSet(`user-token:${randomString}`, {
                subdomain,
                ip: '0.0.0.0',
                driver
            })

            if (result) {
                resolve(randomString)
            } else {
                reject()
            }
        })
    }

    // Создание записи о использовании домена
    static async createDomain(subdomain, token) {
        return new Promise(async (resolve, reject) => {
            let result = await this.redisClient.set(`domain:${subdomain}`, token)
            if (result) {
                resolve()
            } else {
                reject()
            }
        })
    }

    // Получение всей информации по токену
    static async getTokenInfo(token) {
        return new Promise(async (resolve, reject) => {
            try {
                let result = await this.redisClient.hGetAll(`user-token:${token}`)
                resolve(result)
            } catch (error) {
                reject(error)
            }
            
        })
    }

    // Создание задачи на обновление IP
    static async createUpdateTask(token, subdomain, ip) {
        return new Promise(async (resolve, reject) => {
            try {
                // Получаем драйвер по токену
                let tokenInfo = await this.getTokenInfo(token)
                let driver = tokenInfo.driver

                let result = await this.redisClient.hSet(`update-task:${subdomain}`, {
                    ip,
                    driver
                })

                resolve(result)
            } catch (error) {
                reject(error)
            }
        })
    }

    // Получение списка задач на обновление IP
    static async getUpdateTasks() {
        return new Promise(async (resolve, reject) => {
            // Получаем n кол-во записей, кол-во берем из .env иначе 15
            let limit = process.env.UPDATE_TASKS_LIMIT ? process.env.UPDATE_TASKS_LIMIT : 15

            let taskKeys = await this.redisClient.keys(`update-task:*`)

            taskKeys = taskKeys.slice(0, limit)

            // Получаем задачи
            let tasks = await Promise.all(taskKeys.map(async taskKey => {
                // Получаем домен по задаче, отсекая update-task:
                let subdomain = taskKey.replace('update-task:', '')
                
                let task = await this.redisClient.hGetAll(taskKey)
                return {
                    task: taskKey,
                    ip: task.ip,
                    token: task.token,
                    subdomain,
                    driver: task.driver
                }
            }))

            resolve(tasks)
        })
    }

    // Удаление множества задач на обновление IP
    static async deleteUpdateTasks(taskKeys) {
        return new Promise(async (resolve, reject) => {
            try {
                let result = await this.redisClient.del(taskKeys)
                resolve()
            } catch (error) {
                reject(error)
            }
        })
    }
}

module.exports = {
    DBController
}