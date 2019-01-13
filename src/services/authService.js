'use strict'

const jwt = require('jsonwebtoken')

exports.generateToken = async (data) => {
    return jwt.sign(data, process.env.SALT_KEY, { expiresIn: '1d' })
}

exports.decodeToken = async (token) => {
    return await jwt.verify(token, process.env.SALT_KEY)
}

exports.authorize = function (req, res, next) {
    const token = req.body.token || req.query.token || req.headers['x-access-token']

    if (!token) return res.json(401, { message: 'Token inválido' })
    return jwt.verify(token, process.env.SALT_KEY, function (error, decoded) {
        if (error) return res.json(401, { message: 'Token inválido' })
        next()
    })
}

exports.isOwner = function (req, res, next) {
    const token = req.body.token || req.query.token || req.headers['x-access-token']

    if (!token) return res.json(401, { message: 'Token inválido' })
    return jwt.verify(token, process.env.SALT_KEY, function (error, decoded) {
        if (error) return res.json(401, { message: 'Token inválido' })

        if (decoded.roles.includes('owner')) {
            next()
        }
        res.json(403, { message: 'Esta funcionalidade é restrita para Owners' })
    })
}
