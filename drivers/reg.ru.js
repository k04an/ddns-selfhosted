class Driver {
    static update(subdomain, ip) {
        return new Promise(async (resolve, reject) => {
            // Получаем данные от API из переменных окружения
            const username = process.env.REG_RU_USERNAME
            const password = process.env.REG_RU_PASSWORD
            const domain = process.env.REG_RU_DOMAIN

            let removeRequestBody = new URLSearchParams({
                username, password,
                domain_name: domain,
                subdomain: subdomain,
                record_type: 'A'
            })

            let updateRequestBody = new URLSearchParams({
                username, password,
                domain_name: domain,
                subdomain: subdomain,
                ipaddr: ip
            })


            try {
                // Удаляем предыдущую запись если она была
                await fetch(`https://api.reg.ru/api/regru2/zone/remove_record` + '?' + removeRequestBody.toString(), {
                    method: "GET"
                })

                await fetch(`https://api.reg.ru/api/regru2/zone/add_alias` + '?' + updateRequestBody.toString(), {
                    method: "GET"
                })

                resolve()
            } catch (error) {
                reject(error)
            }
        })
    }
}

module.exports = Driver