import Poetry from 'poetry';
import Joi from 'joi';
import Boom from 'boom';

import {
    Users,
    Teams
} from 'poetry/models';

Poetry.route( {

    method: 'POST',
    path: '/login/web',
    config: {
        description: 'Login (web mobile)',
        notes: [
            'Connect the user if authentication succeed. For applications that should never check the user agent'
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
                    .default( false )
            }
        },

        cors: {
            credentials: true,
            origin: [ '*' ]
        }
    }

}, ( request, reply ) => {

    if ( request.session.isAuthenticated ) {
        Poetry.log.silly( "Is already authenticated" );
        let session = request.session;
        let clonedSession = JSON.parse( JSON.stringify( session ) );
        return reply( clonedSession );
    }

    Poetry.login(
            request.payload.email.toLowerCase(),
            request.payload.password,
            false, //do not check mobile token
            request.headers.host
        )
        .then( session => {
            request.session._id = session._id;
            request.session.isAuthenticated = session.isAuthenticated;

            request.session.user = session.user;
            request.session.team = session.team;

            request.session.keep = request.payload.keep;

            Poetry.log.silly( request.session );

            return reply( session );

        }, err => {
            Poetry.log.silly( err );

            if ( typeof err === 'string' )
                return reply( Boom.unauthorized( err ) );

            reply( Boom.unauthorized( 'Wrong authentication.', err ) );

        } );

} );
