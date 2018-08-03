const electron = window.require('electron');
const fs = electron.remote.require('fs');

export default class FileManager {
 
    readProjects(){
        let path = electron.remote.app.getAppPath() + '/testProjects/'
        let projects = []
        let folders = fs.readdirSync(path)
        for(var f in folders){
          var item = folders[f]
          var projectInfo = fs.readFileSync(path + '/' + item + '/package.json', "utf8")
          projects.push({
            folder : item,
            package : JSON.parse(projectInfo),
            path : (path + '/' + item)
          })
        }
        return projects
    }

    reloadProject(projects, project){
        for(var k in projects){
            if(projects[k].path === project.path){
                var projectInfo = fs.readFileSync(`${projects[k].path}/package.json`, "utf8")
                projects[k].package = JSON.parse(projectInfo)
            }
        }
        return projects
    }

    initProject(folder, path){
        return {
            name : folder,
            type : 'folder',
            children : this.getFolders(path),
            key : `id-${this.randomID()}`
        }
    }

    readFile(path){
        return fs.readFileSync(path, "utf8")
    }

    saveFile(path, contents){
        return fs.writeFileSync(path, contents, 'utf8');
    }

    getFolders(path){
        let folder = []
        let folders = fs.readdirSync(path)
        for(var f in folders){
          var item = folders[f]
          var url = path + '/' + item + '/'
          if(item !== 'node_modules'){
            if(fs.lstatSync(url).isDirectory()){
                folder.push({
                    name : item,
                    type : 'folder',
                    children : this.getFolders(url),
                    path : url,
                    key : this.randomID()
                })
            }else{
                folder.push({
                    name : item,
                    type : 'file',
                    children : null,
                    path : url,
                    saved : true,
                    key : this.randomID()
                })
            }
          }
        }
        return folder
    }


    randomID() {
        function s4() {
          return Math.floor((1 + Math.random()) * 0x10000)
            .toString(16)
            .substring(1);
        }
        return s4() + s4() + '-' + s4() + '-' + s4() + '-' + s4() + '-' + s4() + s4() + s4();
      }

}