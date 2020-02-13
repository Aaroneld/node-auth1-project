const express = require('express');
const bcrypt = require('bcryptjs');
const session = require('express-session');

const server = express();
const users = require('./users-model.js');

const sessionConfig = {
    name: 'Yes',
    secret: 'my secret secret',
    cookie: {
        maxAge: Infinity,
        secure: false,
        httpOnly: true,

    },
    resave: false,
    saveUninitialized: false
}

server.use(express.json());
server.use(session(sessionConfig));

function validateUser ( req, res, next) {

    if (req.session && req.session.user){
        next();
    }
    else {
        res.status(400).json({message: 'No Credentials Provided'});
    }
}

server.post('/api/register', (req, res) => {

    const user = req.body;

    const hash = bcrypt.hashSync(user.password, 12);

    user.password = hash;

    users.register(user)
        .then(user => {
            res.status(201).json(user);
        })
        .catch(err => {
            res.status(500).json(err.message);
        })
});

server.post('/api/login', (req, res) => {

    const {username, password} = req.body;

    users.findUser(req.body.username)
        .first()
        .then( user => {
            if (user &&  bcrypt.compareSync(password, user.password)){
                req.session.user = user;
                res.status(200).json({ message: `Welcome ${user.username}`});
            }else {
                res.status(401).json({message: user});
            }
        })
        .catch( err => {
            res.status(500).json({err: err.message, message: username});
        })

});

server.get('/api/logout', (req, res) => {
    if (req.session){
        req.session.destroy(err => {
            if(err){
                res.json({message: "Couldn't log out"})
            }
            else{
                res.status(200).json({success: true});
            }
        })
    } else {
        res.status(202).json({message: "already logged out"})
    }
})

server.get('/api/users', validateUser, (req, res) => {

    users.findUsers()
        .then(users => {
            res.status(200).json({users});
        })
        .catch(err => {

            res.status(500).json({err: err.message});
        })

});

module.exports = server;