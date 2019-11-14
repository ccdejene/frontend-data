// Include the server in your file
const server = require('server');
const { get } = server.router;

// Handle requests to the url "/" ( http://localhost:3000/ )
server([
    get('/', ctx =>{
        return redirect('/index.html');
    })
]);