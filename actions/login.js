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
            }
        }
    }

}, ( request, reply ) => {

    if ( request.session.isAuthenticated )
        return reply( request.session )
            .code( 304 );

    Poetry.login( request.payload.email, request.payload.password )
        .then( ( session ) => {

            request.session.isAuthenticated = session.isAuthenticated;

            request.session.user = session.user;
            request.session.team = session.team;

            request.session.keep = request.payload.keep;

            return reply( session );

        }, err => reply( Boom.unauthorized( 'Wrong authentication.', err ) ) );

} );
