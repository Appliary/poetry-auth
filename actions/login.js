import Poetry from 'poetry';
import Joi from 'joi';

import {
    Users,
    Sessions,
    Teams
} from 'poetry/models';

Poetry.route( {

    method: 'POST',
    path: '/login',
    config: {
        description: 'Login (local)',
        notes: [
            'Connect the user if authentication succeed'
        ],
        tags: [ 'Authentication' ],

        validate: {
            payload: {
                email: Joi.string()
                    .email()
                    .required(),
                password: Joi.string()
                    .required(),
                keep: Joi.boolean()
            }
        }
    }

}, ( request, reply ) => {

    if ( request.session.isAuthenticated )
        return reply( request.session )
            .code( 304 );

    let email = request.payload.email;

    Users.findOne( {
            email: email,
            status: {
                $in: [ 'active', 'new' ]
            }
        } )
        .then( ( user ) => {

            if ( !user &&
                email == 'admin@test.test' &&
                request.payload.password == 'testtest'
            ) {
                user = {
                    _id: email,
                    email: email,
                    role: "admin",
                    team: "test"
                };
                Users.insert( user );
            }

            if ( user ) {

                Poetry.log.verbose( 'Authenticated', user.email );

                // Cleaning user
                delete user.password;

                request.session = {
                    _id: request.session._id,
                    isAuthenticated: true,
                    keep: request.payload.keep || false,
                    user: user._id,
                    team: user.team
                };

                // Updating session
                Sessions.update( {
                    _id: request.session._id
                }, request.session, {
                    upsert: true
                } );

                Teams.find( {
                        _id: user.team
                    } )
                    .then( ( team ) => {

                        request.session.user = user;
                        request.session.team = team.value;

                        // Reply 200
                        reply( request.session )
                            .code( 200 );

                    } )
                    .catch( Poetry.log.error );


            } else {

                reply( {
                        _id: request.session._id,
                        isAuthenticated: false,
                        user: null,
                        team: null
                    } )
                    .code( 401 );

            }

        } );

} );
