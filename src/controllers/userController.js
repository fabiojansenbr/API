'use strict'

const joi = require('joi')
const uuid = require('uuid/v4')
const bcrypt = require('bcrypt')
const repository = require('../repositories/userRepository')
const authService = require('../services/authService')

exports.store = async (req, res) => {
    try {
        const userSchema = joi.object().keys({
            name: joi.string().required(),
            nickname: joi.string().required(),
            phone: joi.string().regex(/^\(\d{2}\)\s\d{5}-?\d{4}$/),
            email: joi.string().email({ minDomainAtoms: 2 }),
            password: joi.string().min(8).required()
        })

        const data = await joi.validate(req.body, userSchema)
        const id = await uuid()
        const hash = await bcrypt.hash(data.password, 10)

        const user = {
            id: id,
            name: data.name,
            nickname: data.nickname,
            phone: data.phone,
            email: data.email,
            password: hash
        }

        await repository.create(user)

        return res.send(201, {
            token: await authService.generateToken({ id, profile: 'client' })
        })
    } catch(error) {
        console.error(error)
        return res.send(400, { message: error.message })
    }
}

exports.edit = async (req, res) => {
    try {
        const userSchema = joi.object().keys({
            nickname: joi.string().required(),
            phone: joi.string().regex(/^\(\d{2}\)\s\d{5}-?\d{4}$/),
            email: joi.string().email({ minDomainAtoms: 2 }),
        })

        const data = await joi.validate(req.body, userSchema)

        // Pega o UUID do usuário
        const token = await authService.decodeToken(req.headers['x-access-token']);

        const user = {
            id: token.id,
            nickname: data.nickname,
            phone: data.phone,
            email: data.email
        }

        await repository.update(user)

        return res.send(200, { message: 'Atualizado com sucesso' })
    } catch(error) {
        console.error(error)
        return res.send(400, { message: error.message })
    }
}
