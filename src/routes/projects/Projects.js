import React, { Component } from 'react';
import { Card, Icon, Col, Row, Drawer, List, Collapse, Modal, Button, Input, Divider, message } from 'antd';
import './Projects.css';
import Shell from '../../lib/Shell'
import NpmRegistry from '../../lib/NpmRegistry'
import FileManager from '../../lib/FileManager'

const theme = require('./../../theme')
const Search = Input.Search;
const { Meta } = Card;
const Panel = Collapse.Panel;


const electron = window.require('electron');
const child_process = electron.remote.require( 'child_process' )

class Projects extends Component {

    constructor(){
        super()

        this.filesManager = new FileManager()
        let projects = this.filesManager.readProjects()
        
        this.state = {
            projects : projects,
            visible: false,

            ModalText: '',
            modalVisible: false,

            npmInstallModalVisible: false,
            npmInstallLoading : false,
            confirmLoading : false,
            npmSearchLoading : false,
            npmInstallResults : [],

            selectedProject : projects[0]
        }

    }

    mapDependencies(dependencies){
        let data = []
        for(var k in dependencies){
            data.push({
                name : k,
                version : dependencies[k]
            })
        }
        return data
    }

    delete(item, key){
        console.log(item)
        if(!window.confirm(`Are you sure you want to delete "${item.folder}"?`)){
            return
        }
        this.setState({
            projects: this.state.projects.filter((_, i) => i !== key),
        })
        message.success(`${item.folder} deleted.`);
    }

    edit(item, key){
        this.props.history.push(`/editor/${item.folder}`)
    }

    serveProject(item){

        const shell = new Shell('npm start', item.path.replace('//', '/').replace('/', '\\'))
        shell.run({
            onMessage : (data) => {
                console.log(data.toString())
                child_process.execSync('start http://localhost:9000')
            },
            onError : (data) => {
                console.log(data.toString())
            },
            close : (data) => {
                console.log(data.toString())
            }
        })
    }

    // npm install
    runNpmInstall(item){
        if(!window.confirm('Are you sure you want to run "npm install" ?')){
            return
        }
        this.setState({
            modalVisible: true,
            confirmLoading: true,
            ModalText : ''
        });
        const shell = new Shell('npm i ', item.path)
        shell.run({
            onMessage : (data) => {
                this.setState({
                    ModalText: `${data} ${this.state.ModalText}`,
                });
            },
            onError : (data) => {
                this.setState({
                    ModalText: `${data} ${this.state.ModalText}`,
                });
            },
            close : (data) => {
                this.setState({
                    confirmLoading: false,
                });
            }
        })
    }

    // MODAL
    showModal = () => {
        this.setState({
            modalVisible: true,
        });
    }

    showNpmInstallModal = () => {
        this.setState({
            npmInstallModalVisible: true,
        });
    }



    checkPackageInstalled(dependency){
        let project = this.state.selectedProject.package
        for(var name in project.dependencies){
            var version = project.dependencies[name]
            if(dependency.name === name){
                if(dependency.version.replace('^', '') === version.replace('^', '')){
                    return true
                }
            }
        }
        return false
    }
    
    npmInstallPackage(npmpackage){
        if(!window.confirm(`Are you sure you want to install "${npmpackage.package.name}" ?`)){
            return
        }

        this.setState({
            modalVisible: true,
            confirmLoading: true,
            ModalText : ''
        });

        //run shell
        const shell = new Shell(`npm i ${npmpackage.package.name} --save`, this.state.selectedProject.path)
        shell.run({
            onMessage : (data) => {
                this.setState({
                    ModalText: `${data} ${this.state.ModalText}`,
                });
            },
            onError : (data) => {
                this.setState({
                    ModalText: `${data} ${this.state.ModalText}`,
                });
            },
            close : (data) => {
                this.setState({
                    projects : this.filesManager.reloadProject(this.state.projects, this.state.selectedProject),
                    confirmLoading: false,
                });
            }
        })

    }

    onSearch = (value) =>{
        let registry = new NpmRegistry()
        this.setState({
            npmSearchLoading: true,
            npmInstallResults : []
        });
        registry.search(value, (response) => {
            setTimeout(() => {
                this.setState({
                    npmSearchLoading: false,
                    npmInstallResults : response
                });
            }, 1000)
        })
    }

    onNpmIntallCancel = () => {
        this.setState({
            npmInstallLoading: false,
            npmInstallModalVisible: false,
            npmInstallResults : []
        });
    }

    onCancel(){
        this.setState({
            modalVisible: false,
            confirmLoading: false,
        });
    }

    handleOk(){
        this.onCancel()
    }

    // DRAWER
    showDrawer = () => {
        this.setState({
            visible: true
        });
    };

    onClose = () => {
        this.setState({
            visible: false,
        });
    };


    // RENDERS
    modalLoggerRender(){
        return (
            <Modal 
                className="loggerModal"
                title="Terminal"
                width="80%"
                visible={this.state.modalVisible }
                onOk={this.handleOk}
                onCancel={this.handleCancel}
                footer={[
                    <Button key="ok" type="primary" loading={this.state.confirmLoading} onClick={() => { this.handleOk() }}>
                    Ok
                    </Button>,
                ]}
            >
                <p>{this.state.ModalText}</p>
            </Modal>
        )
    }

    openLink (link) {
        child_process.execSync(`start ${link}`)
    }

    resultListRender = (item) => {
        console.log(item)
        let isInstalled = this.checkPackageInstalled(item.package)
        let actions = [
            <span> {item.package.version} </span>
        ]
        if(!isInstalled){
            actions.push(
                (<Button type="primary" onClick={() => {this.npmInstallPackage(item)}}>
                    Install
                </Button>)
            )
        }else{
            actions.push((<span> Installed</span>))
        }
        return (
            <List.Item
                actions={actions}
            >
                <List.Item.Meta
                    title={ <span onClick={() => { this.openLink(item.package.links.homepage) }}> {item.package.name} </span>}
                    description={item.package.description}
                />
            </List.Item>
        )
    }

    modalNpmInstallRender(){

        return (
            <Modal 
                className="npmInstallModal"
                title="Install Package"
                width="50%"
                visible={this.state.npmInstallModalVisible}
              //  onOk={this.handleOk}
                onCancel={this.onNpmIntallCancel}
                footer={[ ]}
            >

                <Search
                    placeholder="input search text"
                    onSearch={this.onSearch}
                    enterButton={
                        <Button type="primary" loading={this.state.npmSearchLoading}>
                            Search
                        </Button>
                    }
                />
                <Divider>Search Results</Divider>
                <List
                    size="small"
                    dataSource={this.state.npmInstallResults}
                    renderItem={this.resultListRender}
                />
            </Modal>
        )
    }


    dependencyRender(){
        let dependencies = this.state.selectedProject.package.dependencies
        let devDependencies = this.state.selectedProject.package.devDependencies
        let scripts = this.state.selectedProject.package.scripts
        return (
            <Collapse defaultActiveKey={['0']} bordered={false}>
                <Panel header="Dependencies" key="1">
                    <List
                        size="small"
                        itemLayout="horizontal"
                        dataSource={this.mapDependencies(dependencies)}
                        renderItem={item => (
                        <List.Item actions={[<Button type="danger">Unistall</Button>]}>
                            
                    
                            <List.Item.Meta
                            // avatar={<Avatar src="https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png" />}
                            title={item.name}
                            description={item.version}
                            />
                        </List.Item>
                        )}
                    />
                </Panel>
                <Panel header="Dev Dependencies" key="2">
                    <List
                        size="small"
                        itemLayout="horizontal"
                        dataSource={this.mapDependencies(devDependencies)}
                        renderItem={item => (
                        <List.Item actions={[<Button type="danger">Unistall</Button>]}>

                    
                            <List.Item.Meta
                            // avatar={<Avatar src="https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png" />}
                            title={<a href="https://ant.design">{item.name}</a>}
                            description={item.version}
                            />
                        </List.Item>
                        )}
                    />
                </Panel>
                <Panel header="Scripts" key="3">
                    <List
                        size="small"
                        itemLayout="horizontal"
                        dataSource={this.mapDependencies(scripts)}
                        renderItem={item => (
                        <List.Item actions={[<Button type="dashed">Run</Button>]}>

                    
                            <List.Item.Meta
                            // avatar={<Avatar src="https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png" />}
                            title={<a href="https://ant.design">{item.name}</a>}
                            description={item.version}
                            />
                        </List.Item>
                        )}
                    />
                </Panel>
            </Collapse>
        )
    }

    drawerRender(){
        return (
            <Drawer
                title={this.state.selectedProject.package.name}
                width={420}
                placement="right"
                onClose={this.onClose}
                maskClosable={false}
                visible={this.state.visible}
                style={{
                    height: 'calc(100% - 55px)',
                    overflow: 'auto',
                    paddingBottom: 53,
                }}
            >
            
            <p>Version : {this.state.selectedProject.package.version}</p>
            <p>Description : {this.state.selectedProject.package.description}</p>

            {this.dependencyRender()}

            <br/>         
            <Button onClick={ this.showNpmInstallModal }>
                Install npm package
            </Button>
            
            </Drawer>
        )
    }

    render() {
 
        const allProjects = this.state.projects.map((item, i) => (
            <Col span={6} key={i}>
                <Card
                    key={i}
                    style={{ width: '100%', margin : '0 0 16px 0' }}
                    // cover={<img alt="example" src="https://gw.alipayobjects.com/zos/rmsportal/JiqGstEfoWAOHiTxclqi.png" />}
                    actions={[
                        <Icon type="eye" onClick={(event) => { 
                            this.showDrawer();
                            this.setState({ selectedProject : item })
                        }}/>, 
                        <Icon type="edit" onClick={(event) => { this.edit(item, i) }}/>, 
                        <Icon type="delete" onClick={(event) => { this.delete(item, i) }}/>, 
                        <Icon type="rocket" onClick={(event) => { this.runNpmInstall(item) }}/>,
                        <Icon type="laptop" onClick={(event) => { this.serveProject(item) }}/>
                    ]}
                >
                    <Meta
                    // avatar={<Avatar src="https://zos.alipayobjects.com/rmsportal/ODTLcjxAfvqbxHnVXCYX.png" />}
                    title={[
                        <Icon key={1} type="folder" style={{ fontSize : 32, margin : '0 10px 0 0', color : theme['secondary-color']}}/>, 
                        <span key={2} style={{ fontSize : 20, top : -5, position: 'relative', color : theme['primary-color'] }}>{item.folder}</span>
                    ]}
                    description={item.package.version}
                    />
                </Card>
            </Col>
        ))            

        return (
            <div className="Settings">
                {this.drawerRender()}
                {this.modalLoggerRender()}
                {this.modalNpmInstallRender()}
                <Row gutter={16}>
                    {allProjects}
                </Row>
            </div>
        );
    }
}

export default Projects;
