class Logger {
    // Получение времени вывода лога. В формате "[YYYY-MM-DD HH:mm:ss]" С leading zero
    static getTime() {
        let date = new Date()
        return `[${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()} ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}]`
    }
    


    // Вывод лога в консоль
    static log(message, module = 'Main') {
        console.log(Logger.getTime(), `[${module}] `, message)
    }
}

module.exports = { Logger }