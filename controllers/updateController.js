const { DBController } = require('./dbController')
const { Logger } = require('../utils/logger')

class UpdateController {
    // Обновление IP
    static async update() {
        return new Promise(async (resolve, reject) => {
            try {
                // Получаем задачи
                let tasks = await DBController.getUpdateTasks()

                if (tasks.length == 0) {
                    return
                }

                Logger.log(`Updating tasks: ${tasks.length}`, 'UpdateController')

                tasks.forEach(async task => {
                    // Подключаем драйвер
                    let driver = require(`../drivers/${task.driver}`)
                    await driver.update(task.subdomain, task.ip)
                })

                // Удаляем отработанные задачи
                await DBController.deleteUpdateTasks(tasks.map(t => t.task))
                resolve()
            } catch (error) {
                reject(error)
            }
        })
    }
}

module.exports = { UpdateController }