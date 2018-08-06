const electron = window.require('electron');
const { spawn } = electron.remote.require( 'child_process' )

export default class Shell {

    constructor(){
        this.ls = null
    }

    run(command, path, callback){

        // if(this.ls){
        //     this.kill()
        // } 

        // let commands = command.split(' ')
        // let mainCommand = commands[0].replace('npm', 'npm.cmd')
        // commands.splice(0, 1)

        // this.ls = spawn(mainCommand, commands, { cwd: path } );
        // this.ls.stdout.on('data', data => {
        //     callback.onMessage(data)
        // })

        // this.ls.stderr.on('data', data => {
        //     callback.onError(data)
        // })

        // this.ls.on('close', code => {
        //     callback.close(code)
        // })

    }

    kill(){
       if(this.ls){
            this.ls.kill()
       } 
    }

}