

import React, { Component } from 'react';
import { Icon, Button, Layout, Tree, message  } from 'antd';
import { UnControlled as CodeMirrorEditor} from 'react-codemirror2'
import { Tabs } from 'antd';
import ContextMenu from '../../components/ContextMenu'
import * as CodeMirror from 'codemirror'

import FileManager from '../../lib/FileManager'
import './Editor.css';

import "codemirror/lib/codemirror";

import 'codemirror/mode/javascript/javascript';
import 'codemirror/mode/css/css';
import 'codemirror/mode/htmlmixed/htmlmixed';
import 'codemirror/mode/xml/xml';

import 'codemirror/addon/hint/javascript-hint';
import 'codemirror/addon/hint/xml-hint';
import 'codemirror/addon/hint/css-hint';
import 'codemirror/addon/hint/html-hint';
import 'codemirror/addon/hint/anyword-hint';

import 'codemirror/addon/hint/show-hint'; 
import 'codemirror/addon/hint/show-hint.css'; 

import "codemirror/addon/fold/foldcode.js"
import "codemirror/addon/fold/foldgutter.js"
import "codemirror/addon/fold/brace-fold.js"
import "codemirror/addon/fold/indent-fold.js"
import "codemirror/addon/fold/comment-fold.js"
import "codemirror/addon/fold/xml-fold.js"

import "codemirror/addon/dialog/dialog.js"
import "codemirror/addon/scroll/annotatescrollbar.js"
import "codemirror/addon/search/search.js"
import "codemirror/addon/search/searchcursor.js"
import "codemirror/addon/search/matchesonscrollbar.js"
import "codemirror/addon/search/jump-to-line.js"

const theme = require('./../../theme')
const TabPane = Tabs.TabPane;
const DirectoryTree = Tree.DirectoryTree;
const TreeNode = Tree.TreeNode;
const { Content, Sider } = Layout;
const electron = window.require('electron');
const prompt = electron.remote.require('electron-prompt');


class Editor extends Component {

    constructor(props){
        super(props)
        this.fileManager = new FileManager()
        this.state = {
            folder : {},
            values : {},
            activeKey: null,
            panes : [],
            contextSelection : null
        }
    }   


    saveFile(){

        let panes = this.state.panes
        let active = this.state.activeKey

        for(var k in  panes){
            var pane =  panes[k]
            if(pane.key === active){
                pane.saved = true
                this.fileManager.saveFile(pane.path, this.state.values[this.state.activeKey])
            }
        }

        this.setState({
            panes : panes,
        })

        message.success('File Saved.');
    }

    componentDidMount() {
        const { match: { params } } = this.props;
        this.newTabIndex = 0;
        let path = electron.remote.app.getAppPath() + '/testProjects/' + params.folder
        this.setState({
            folder : this.fileManager.initProject(params.folder, path)
        })
    }

    getEditor(key, file){

        let nameSplit = file.name.split('.')
        let ext = nameSplit[nameSplit.length-1]
 
        let options = {
            'html' : {
                mode : 'xml'
            },
            'css' : {
                mode : 'css'
            },
            'scss' : {
                mode : 'css'
            },
            'less' : {
                mode : 'css'
            },
            'json' : {
                mode : 'javascript'
            },
            'js' : {
                mode : 'javascript'
            }
        }

        let config = Object.assign({
            theme: 'material',
            lineNumbers: true,
            styleActiveLine: true,
            matchBrackets: true,
            foldGutter: true,
            autoRefresh:false,
            lineWiseCopyCut : false,
            globalVars : true,
            gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"],
            extraKeys: {
                "Ctrl-Space": "autocomplete",
                "Ctrl-Q" : function(cm){ cm.foldCode(cm.getCursor()) },
                "Alt-F": "findPersistent"
            }
        }, options[ext])


        let editorRender = (
            <CodeMirrorEditor
                className="customEditor"
                style={{ height: '100%' }}
                value={this.state.values[key]}
                autoCursor={false}
                options={config}
                onChange={(editor, data, value) => {
                    let values = this.state.values
                    let panes = this.state.panes
                    for(var k in panes){
                        if(panes[k].key === key){
                            panes[k].saved = false
                            values[key] = value
                        }
                    }
                    //editor.execCommand('autocomplete')
                    this.setState({values : values, panes : panes})
                }}
                />
            )

        return  editorRender
    }

    addEditor(file){
        
        let values = this.state.values
        values[file.key] = this.fileManager.readFile(file.path)
        
        let panes = this.state.panes.concat([{ 
            title: file.name, 
            content: this.getEditor(file.key, file), 
            key: file.key, 
            path : file.path,
            saved : true
        }])

        this.setState({
            values : values,
            panes : panes,
            activeKey : panes[0].key
        })
    }


    promptInput(title, label, callback){
        prompt({
            title: title,
            label: label,
            value: '',
            inputAttrs: {
                type: 'text'
            },
            type: 'input'
        })
        .then((r) => {
            if(r === null) {
                console.log('user cancelled');
            } else {
                console.log('result', r);
                callback(r)
            }
        })
        .catch(console.error);
    }

    createFile(){

        this.promptInput("Please enter a file name", "Filename :", (filename) => {
   
            let selectedItem = this.state.contextSelection
            this.fileManager.writeFile(filename, 'Text contents', selectedItem.path)
            let file = {
                name : filename,
                type : 'file',
                children : null,
                path : selectedItem.path + '/' + filename,
                saved : true,
                key : this.fileManager.randomID()
            }
            if(this.state.folder.key === selectedItem.key){ //is root folder
                this.state.folder.children.push(file)
            }else{
                this.state.folder.children = this.fileManager.addToFolder(this.state.folder.children, selectedItem.key, file)
            } 
            this.setState({
                folder : this.state.folder
            })

            message.success('File Created.');

        })

    }


    renameFile(){

        this.promptInput("Please enter a file name", "Rename :", (filename) => {
   
            let selectedItem = this.state.contextSelection
            let newPath = this.fileManager.renameFile(selectedItem.path, selectedItem.name, filename)

  
            this.state.folder.children = this.fileManager.updateFileByKey(this.state.folder.children, selectedItem.key, { name : filename, path : newPath })

            let panes = this.state.panes
            for(var k in panes){
                var pane = panes[k]
                if(pane.key === selectedItem.key){
                     pane.title = filename
                     pane.path = newPath
                }
            }

            this.setState({
                folder : this.state.folder,
                panes : panes
            })

            message.success('File Renamed.');

        })

    }

    createFolder(){


        this.promptInput("Please enter a folder name", "Folder :", (foldername) => {

            let selectedItem = this.state.contextSelection
            this.fileManager.writeFolder(foldername, selectedItem.path)
    
            let folder = {
                name : foldername,
                type : 'folder',
                children : [],
                path : selectedItem.path + '/' + foldername,
                key : this.fileManager.randomID()
            }
    
            if(this.state.folder.key === selectedItem.key){ //is root folder
                this.state.folder.children.push(folder)
            }else{
                this.state.folder.children = this.fileManager.addToFolder(this.state.folder.children, selectedItem.key, folder)
            } 
    
            this.setState({
                folder : this.state.folder
            })

            message.success('Folder Created.');

        })


    }

    //deletes files and folders
    deleteFile(isFile){
        if(!window.confirm(`Are you sure you want to delete "${this.state.contextSelection.name}" ?`)){
            return
        }
        let selectedItem = this.state.contextSelection
        let type = selectedItem.type
        this.remove(selectedItem.key)
        this.fileManager.delete(selectedItem.path)
        this.state.folder.children = this.fileManager.removeFromFolder(this.state.folder.children, selectedItem.key)
        this.setState({
            folder : this.state.folder
        })
        message.success(`${(type === 'file') ? 'File' : 'Folder'} deleted.`);
    }


    onRightClick = (event) => {
        //conext menu 
        let file = null
        if(event.node.props.dataRef){ //is file  
            //find file
            let fileKey = event.node.props.dataRef.key
            file = this.fileManager.findFileByKey(fileKey, this.state.folder.children)
            //show context menu
            this.refs.ContextMenu1.show();
        }else{
            //find folder
            let folderKey = event.node.props.eventKey
            if(this.state.folder.key === folderKey){ //if is root folder
                file = this.state.folder
            }else{ // if child folder
                file = this.fileManager.findFolderByKey(folderKey, this.state.folder.children)
            }
            //show context menu
            this.refs.ContextMenu2.show();
        }
        this.setState({
            contextSelection : file
        })
    }

    onSelect(item, e) {
        if(!e.selectedNodes[0]){
            return
        }
        let file = e.selectedNodes[0].props.dataRef
        if(!file){
            return
        }
        if(file.type === 'file' && (!this.state.values[file.key] && !this.state.values.hasOwnProperty(file.key))){
            this.addEditor(file)
        }
        this.setState({
            activeKey : file.key
        })
    }


    tabPaneRender = (pane) => {
        const titleBar = [
            <Icon key={pane.key} type={(pane.saved) ? "star" : "star-o" } style={ {color : (pane.saved) ? theme['success-color'] : theme['error-color']} } />,
            pane.title
        ]
        return <TabPane tab={titleBar} key={pane.key} closable={pane.closable}>{pane.content}</TabPane>
    }

    editorRender(){
        return (
            <Tabs
                className="editor-tabs"
                onChange={this.onChange}
                activeKey={this.state.activeKey}
                type="editable-card"
                onEdit={this.onEdit}
            >
                {this.state.panes.map(this.tabPaneRender)}
            </Tabs>
        );
    }

    //TABS
    onChange = (activeKey) => {
        this.setState({ activeKey });
    }

    onEdit = (targetKey, action) => {
        this[action](targetKey);
    }

    add = () => {
        // const panes = this.state.panes;
        // const activeKey = `newTab${this.newTabIndex++}`;
        // panes.push({ title: 'New Tab', content: 'Content of new Tab', key: activeKey });
        // this.setState({ panes, activeKey });
    }

    remove = (targetKey) => {

        //check if file saved here/
        //---------------
        let passed = true
        for(var k in this.state.panes){
            if(this.state.panes[k].key === targetKey && !this.state.panes[k].saved){
                passed = window.confirm('are you sure want to close without saving?')
            }
        }
        if(!passed){
            return
        }

        let activeKey = this.state.activeKey;
        let lastIndex;
        const panes = this.state.panes.filter(pane => pane.key !== targetKey);
        
        this.state.panes.forEach((pane, i) => {
            if (pane.key === targetKey) {
                lastIndex = i - 1;
            }
        })
        
        if (lastIndex >= 0 && activeKey === targetKey) {
            activeKey = panes[lastIndex].key;
        }

        //remove value holder for editor
        let values = this.state.values
        delete values[targetKey]
        
        //update
        this.setState({ 
            panes : panes, 
            activeKey : activeKey, 
            values : values 
        })

    }



    sortFolder(folder){
        folder.sort((a,b) => {
            if (a.type < b.type)
                return 1;
            if (a.type > b.type)
                return -1;
            return 0;
        })
        return folder
    }
      

    renderTreeNodes = (data) => {
        if(!data || !(typeof data === 'object')){
            return
        }
        return this.sortFolder(data).map((item) => {
            if (item.type === 'folder') {
            return (
                <TreeNode title={item.name} key={item.key}>
                    {this.renderTreeNodes(item.children)}
                </TreeNode>
            );
            }
            return (
                <TreeNode title={item.name} key={item.key} dataRef={item} isLeaf/>
            );
        });
    }

    

    render() {

        const fileMenu = ([
            <div className="contextMenu--option" onClick={() => { this.renameFile() }} key={3}>Rename</div>,
            <div className="contextMenu--option" onClick={() => this.deleteFile(true)} key={4}>Delete</div>,
        ])
        const folderMenu = ([
            <div className="contextMenu--option" onClick={() => this.createFile()} key={0}>New File</div>,
            <div className="contextMenu--option" onClick={() => this.createFolder()} key={1}>New Folder</div>,
            <div className="contextMenu--separator" key={2}/>,
            // <div className="contextMenu--option" key={3}>Rename</div>,
            <div className="contextMenu--option" onClick={() => this.deleteFile(false)} key={4}>Delete</div>,
        ])

        return (
            <div className="Editor">

                <ContextMenu ref="ContextMenu1" id="ContextMenu1" children={ fileMenu }/>
                <ContextMenu ref="ContextMenu2" id="ContextMenu2" children={ folderMenu }/>

                 <Layout style={{ padding: '0', background: '#fff', marginTop : 16, marginLeft : 16 }}>
                    <Sider width={250} style={{ background: '#fff' }}>

                    {/* <Button style={{ margin : 10 }} onClick={() => { this.saveFile() }}>Save File</Button> */}
                    
                    <DirectoryTree
                        defaultExpandAll
                        onSelect={(item, e) => {
                            this.onSelect(item, e)
                        }}
                        onRightClick={(e) => {this.onRightClick(e)}}
                    >
                
                        <TreeNode title={this.state.folder.name} key={this.state.folder.key}>
                            { this.renderTreeNodes(this.state.folder.children) }
                        </TreeNode> 

                    </DirectoryTree>
                    </Sider>
                    <Content style={{ 
                        padding: '0px', 
                        minHeight: 680,
                        // height: '680px'
                        }}>
                        {this.editorRender()}
                    </Content>
                </Layout>

            </div>
        );
    }
}

export default Editor;
