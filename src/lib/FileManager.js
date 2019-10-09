const electron = window.require('electron');
const fs = electron.remote.require('fs-extra');
const pathModule = electron.remote.require('path');

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
            key : `${this.randomID()}`,
            path : path
        }
    }

    renameFile(path, file, newName){
        let renameFile = path.replace(file, newName)
        fs.renameSync(path, renameFile);
        return renameFile
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
          var url = pathModule.join(path, item)
          if(item !== 'node_modules'){
            const isDir = fs.statSync(url).isDirectory()
            if(isDir){
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

    delete(path){
        try{
            fs.removeSync(path.replace(/^\/|\/$/g, ''));
        }catch (e){
            console.log("Cannot delete ", e);
        }
    }

    writeFile(name, content, path){
        try{
            fs.writeFileSync(`${path}/${name}`, content);
        }catch (e){
            console.log("Cannot write file ", e);
        }
    }

    writeFolder(name, path){
        try{
            if (!fs.existsSync(`${path}/${name}`)){
                fs.mkdirSync(`${path}/${name}`);
            }
        }catch (e){
            console.log("Cannot write folder ", e);
        }
    }

    //Files and Folders
    findFileByKey(key, folder){
        let result = null
        for(var f in folder){
            var item = folder[f]
            if(item.children){
                result = this.findFileByKey(key, item.children) 
            }else if(item.key === key){
                result = item
                return result
            }
        }
        return result
    }

    findFolderByKey(key, folder){
        let result = null
        for(var f in folder){
            var item = folder[f]
            var hasChildren = (item.children) ? (item.children.length > 0) : false
            if(hasChildren && item.key !== key){
                result = this.findFolderByKey(key, item.children) 
                if(result){
                    return result
                }
            }else if(item.key === key){
                result = item
                return result
            }
        }
    }

    removeFromFolder(items, key){
        for(var f in  items){
            var item = items[f]
            if(item.children && item.key !== key){
                item.children = this.removeFromFolder(item.children, key) 
            }else if(item.key === key){
                items.splice(f, 1)
                return items
            }
        }
        return items
    }

    addToFolder(root, key, itemToAdd){
        let items = root
        for(var f in  items){
            var item = items[f]
            if(item.children && item.key !== key){
                item.children = this.addToFolder(item.children, key, itemToAdd) 
            }else if(item.key === key){
                item.children.push(itemToAdd)
                return root
            }
        }
        return root
    }


    updateFileByKey(folder, key, value){
        for(var f in folder){
            var item = folder[f]
            if(item.children){
                item.children = this.updateFileByKey(item.children, key, value) 
            }else if(item.key === key){
                for(var k in value){ //update values
                    if(item.hasOwnProperty(k)){
                        item[k] = value[k]
                    }
                }
                return folder
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