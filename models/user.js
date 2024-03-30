const mongoose = require('mongoose')
/* 
    Schema TO-DO:
    Custom "Status" interface
    List of subscribed chat servers
    List of friends
    profile pic
    Should username be unique? (Needs something to make login token unique)
*/
const userSchema = new mongoose.Schema({
    usename: {
        type: String,
        required: true,
        unique: true
    },
    passwordHash: String,
    about: String,
    creationDate: Date,
    friends: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }
    ]
})

userSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        returnedObject.id = returnedObject._id.toString()
        delete returnedObject._id
        delete returnedObject.__v
        delete returnedObject.passwordHash
    }
})

const User = mongoose.model('User', userSchema)

module.exports = User