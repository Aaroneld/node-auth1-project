const db = require('./data/dbconfig.js');


module.exports = {

    register,
    findUser, 
    findUsers
}


function register (user) {

    return db('users-table').insert(user);

}

function findUser(username){

    return db('users-table')
            .select('id', 'username', 'password')
            .where({username: username});

}


function findUsers(){

    return db('users-table');
}