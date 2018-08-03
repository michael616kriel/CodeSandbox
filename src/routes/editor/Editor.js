

import React, { Component } from 'react';
import { Icon, Button, Layout, Tree  } from 'antd';
import { UnControlled as CodeMirror} from 'react-codemirror2'
import { Tabs } from 'antd';


import FileManager from '../../lib/FileManager'
import './Editor.css';

require('codemirror/mode/xml/xml');
require('codemirror/mode/javascript/javascript');
require('codemirror/mode/css/css');

const TabPane = Tabs.TabPane;
const DirectoryTree = Tree.DirectoryTree;
const TreeNode = Tree.TreeNode;
const { Content, Sider } = Layout;
const electron = window.require('electron');



class Editor extends Component {

    constructor(props){
        super(props)
        this.fileManager = new FileManager()
        this.state = {
            folder : {},
            values : {},
            activeKey: null,
            panes : []
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
            lineNumbers: true
        }, options[ext])

        return (
            <CodeMirror
                className="customEditor"
                style={{ height: '100%' }}
                value={this.state.values[key]}
                autoCursor={false}
                options={config}
                // onBeforeChange={(editor, data, value) => {
                    
                // }}
                onChange={(editor, data, value) => {
                    let values = this.state.values
                    let panes = this.state.panes
                    for(var k in panes){
                        if(panes[k].key === key){
                            panes[k].saved = false
                            values[key] = value
                        }
                    }

                    this.setState({values : values, panes : panes})
                }}
            />
        )
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

    renderTreeNodes = (data) => {
        if(!data){
            return
        }
        return data.map((item) => {
            if (item.type === 'folder') {
            return (
                <TreeNode title={item.name} key={item.key}>
                    {this.renderTreeNodes(item.children)}
                </TreeNode>
            );
            }
            return <TreeNode title={item.name} key={item.key} dataRef={item} isLeaf/>;
        });
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
            <Icon key={pane.key} type={(pane.saved) ? "star" : "star-o" } style={ {color : (pane.saved) ? "green" : "red"} } />,
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
    
   
    render() {
    
        return (
            <div className="Editor">

                 <Layout style={{ padding: '0', background: '#fff' }}>
                    <Sider width={250} style={{ background: '#fff' }}>

                    <Button style={{ margin : 10 }} onClick={() => { this.saveFile() }}>Save File</Button>

                    <DirectoryTree
                        defaultExpandAll
                        onSelect={(item, e) => {
                            this.onSelect(item, e)
                        }}
                    >

                    <TreeNode title={this.state.folder.name} key="0-0">
                        { this.renderTreeNodes(this.state.folder.children) }
                    </TreeNode>

                    </DirectoryTree>
                    </Sider>
                    <Content style={{ 
                        padding: '0px', 
                        minHeight: 680,
                        height: '680px'
                        }}>
                        {this.editorRender()}
                    </Content>
                </Layout>

            </div>
        );
    }
}

export default Editor;
