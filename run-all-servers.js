/*
 * Script to start all four microservices in parallel.
 * Replaces the monolithic www script to spin up the independent services.
 */

const { spawn } = require('child_process');

const services = [
        { name: 'users', cmd: 'node', args: ['./bin/users-server'] },
        { name: 'costs', cmd: 'node', args: ['./bin/costs-server'] },
        { name: 'logs', cmd: 'node', args: ['./bin/logs-server'] },
        { name: 'admin', cmd: 'node', args: ['./bin/admin-server'] }
];

/**
 * Spawns a child process for a given microservice object configuration.
 * @param {Object} service - A service configuration containing name, cmd, args.
 */
const startMicroservice = (service) => {
        // spawn node child process
        const proc = spawn(service.cmd, service.args, { stdio: 'inherit', shell: true });

        proc.on('close', (code) => {
                // simple diagnostic event handling for crashes
                console.log(`[${service.name}] exited with code ${code}`);
        });
};

// iterate services and execute run mechanism
services.forEach((service) => {
        startMicroservice(service);
});
