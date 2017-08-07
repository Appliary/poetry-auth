import Poetry from 'poetry';
import Joi from 'joi';
import Boom from 'boom';

import {
    Users,
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

    let checkMobileToken = request.headers[ "user-agent" ] && request.headers[ "user-agent" ].indexOf( "Mobi" ) > -1;

    Poetry.log.silly( "User-Agent", request.headers[ "user-agent" ] );
    if ( checkMobileToken ) {
        Poetry.log.silly( "Mobile User", checkMobileToken );
    }

    Poetry.login(
            request.payload.email.toLowerCase(),
            request.payload.password,
            checkMobileToken,
            request.headers.host
        )
        .then( session => {
            request.session._id = session._id;
            request.session.isAuthenticated = session.isAuthenticated;

            request.session.user = session.user;
            request.session.team = session.team;

            request.session.keep = request.payload.keep;
            if(checkMobileToken){
                request.session.isMobile = true;
            }

            Poetry.log.silly( request.session );

            return reply( session );

        }, err => {
            Poetry.log.silly( err );

            if ( typeof err === 'string' )
                return reply( Boom.unauthorized( err ) );

            reply( Boom.unauthorized( 'Wrong authentication.', err ) );

        } );

} );
