const axios = require('axios');
const _ = require('lodash');

const {AUTH0_TOKEN} = require('./../config/config');

class Users {
    constructor() {
        this.users = [];
        this.getUserFromAuth0();
    }

    getUserFromAuth0() {
        axios.get('https://giangph.auth0.com/api/v2/users', {
            headers: {'Authorization': 'Bearer ' + AUTH0_TOKEN},
        }).then((response) => {
            response.data.forEach((user) => {
                this.users.push(user);
            });
        });
    }

    login(id, email, room) {
        let user = _.find(this.users, user => user.email === email);
        if (user) {
            user.id = id;
            user.room = room;
            user.online_status = 1;
            return user;
        }
        return null;
    }

    logout(id) {
        const user = this.getUser(id);

        if (user) {
            user.online_status = 0;
        }

        return user;
    }

    getUser(id) {
        return _.find(this.users, user => user.id === id);
    }

    getUserList (room) {
        var namesArray = this.users.map((user) => _.pick(user, ['nickname', 'online_status']));
        return namesArray;
    }
}

module.exports = {Users};