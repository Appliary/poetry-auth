import Poetry from 'poetry';

import {
    Sessions
} from 'poetry/models';

Poetry.route( {

    method: 'GET',
    path: '/logout',
    config: {
        description: 'Logout',
        notes: [
            'Disconnect the current user'
        ],
        tags: [ 'Authentication' ]
    }

}, ( request, reply ) => {

    if ( !request.session._id )
        return reply.redirect('/');

    Sessions.remove( {
            _id: request.session._id
        } )
        .then( () => {
            request.session = {};
            reply.redirect('/');
        } )
        .catch( reply );

} );
