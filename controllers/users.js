const bcrypt = require('bcrypt')
const User = require('../models/user')

const create = async (request, response) => {
    const {username, password} = request.body

    // password & username validation
    const saltRounds = 10
    const passwordHash = await bcrypt.hash(password, saltRounds)

    const user = new User({
        username,
        passwordHash
    })

    const savedUser = await user.save()

    return response.status(201).json(savedUser)
}

const getAll = async (request, response) => {
    const users = await User
        .find({})
        .populate('friends', { id: 1, username: 1 })
    
    response.json(users)
}

const get = async (request, response) => {
    const { id } = request.params

    const user = await User.findById(id)
        .populate('friends', { id: 1, username: 1 })

    return response.status(201).json(user)
}

// Sources from accepted user's client
// Need a way to prohibit arbitrary request acceptance
// Validate with a seperate friend request from initial sent user?
const acceptFriend = async (request, response) => {

    const { sentId, acceptedId } = request.body

    // Add friend to accepted user
    const accUser = await User.findById(acceptedId)
    const accList = accUser.friends.concat(sentId)
    await User.findByIdAndUpdate(
        acceptedId,
        { friends: accList },
        { new: true, runValidators: true, context: 'query' }
    )

    // Add friend to sent user
    const sentUser = await User.findById(sentId)
    const sentList = sentUser.friends.concat(acceptedId)

    const updatedSent = await User.findByIdAndUpdate(
        sentId,
        { friends: sentList },
        { new: true, runValidators: true, context: 'query' }
    ).populate('friends', { id: 1, username: 1})

    // Assuming this is sources from the accepting user. Ought to only respond with the data of sent user
    return response.status(201).json(updatedSent)
}


/*
TODO:
Update
Delete
Add friend
*/


module.exports = {
    create,
    getAll,
    get,
}