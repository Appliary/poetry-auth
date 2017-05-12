import Poetry from 'poetry';
import Joi from 'joi';
import Boom from 'boom';

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

    if ( request.session.isAuthenticated )
        return reply( request.session );

    let checkMobileToken = request.headers["user-agent"] && request.headers["user-agent"].indexOf("Mobi") > -1; 
    
    Poetry.log.silly("User-Agent", request.headers["user-agent"]);
    if(checkMobileToken){
        Poetry.log.silly("Mobile User", checkMobileToken);

    }

    Poetry.login(
            request.payload.email,
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

            return reply( session );

        }, err => {
            Poetry.log.silly( err );

            reply( Boom.unauthorized( 'Wrong authentication.', err ) );
        } );

} );
