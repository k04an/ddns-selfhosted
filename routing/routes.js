const express = require('express')
const router = express.Router()
const requestController = require('../controllers/requestController')

router.get('/admin/createToken', requestController.createUserToken)

router.get('/update', requestController.createUpdateTask)


module.exports = router