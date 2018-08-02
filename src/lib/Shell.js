const electron = window.require('electron');
// const fs = electron.remote.require('fs');
// const ipcRenderer  = electron.ipcRenderer;
const { spawn } = electron.remote.require( 'child_process' )

export default class Shell {

    constructor(command, path){
        this.path = path
        this.commands = command.split(' ')
        this.mainCommand = this.commands[0].replace('npm', 'npm.cmd')
        this.commands.splice(0, 1)
    }

    run(callback){
        const ls = spawn(this.mainCommand, this.commands, { cwd: this.path } );
        ls.stdout.on('data', data => {
            callback.onMessage(data)
        })
        ls.stderr.on('data', data => {
            callback.onError(data)
        })
        ls.on('close', code => {
            callback.close(code)
        })
    }

}