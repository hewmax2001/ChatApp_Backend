const Message = require('../models/message')

const handleCreate = async (request, response) => {
    const { content } = request.body
    const user = request.session.user

    const comment = new Message({
        content,
        user: user.id
    })

    const savedComment = await comment.save()

    return response.status(201).json({savedComment})
}

const handleGetAll = async (request, response) => {
    const comments = await Message.find({})
    console.log('Session:', request.sessionID)
    return response.status(201).json(comments)
}

module.exports = {
    handleCreate,
    handleGetAll
}