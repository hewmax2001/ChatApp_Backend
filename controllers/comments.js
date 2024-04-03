const User = require('../models/user')
const Comment = require('../models/comment')

const create = async (request, response) => {
    const { content } = request.body
    const requestUser = request.user

    const user = await User.findById(requestUser.id)

    const comment = new Comment({
        content,
        user: user.id
    })

    const savedComment = await comment.save()

    return response.status(201).json({savedComment})
}

const getAll = async (request, response) => {
    const comments = await Comment.find({})

    return response.status(201).json(comments)
}

module.exports = {
    create,
    getAll
}