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
        return reply( {
                isAuthenticated: false
            } );

    Sessions.remove( {
            _id: request.session._id
        } )
        .then( () => {
            reply( {
                isAuthenticated: false
            } );
        } );

} );
