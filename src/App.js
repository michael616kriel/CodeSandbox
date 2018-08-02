import React, { Component } from 'react';
import { Switch, Route, Link } from 'react-router-dom'
import './App.css';

import { Layout, Menu, Icon, Breadcrumb } from 'antd';

import Projects from './routes/projects/Projects';
import Editor from './routes/editor/Editor';

const { Header, Sider, Content } = Layout;
const electron = window.require('electron');
const fs = electron.remote.require('fs');
const ipcRenderer  = electron.ipcRenderer;


class App extends Component {

  state = {
    collapsed: false,
  };

  constructor(){
    super()
 
  }

  toggle = () => {
    this.setState({
      collapsed: !this.state.collapsed,
    });
  }


  render() {
    return (
      <Layout>
        <Sider
          trigger={null}
          collapsible
          collapsed={this.state.collapsed}
        >
          <div className="logo" />
          <Menu theme="dark" mode="inline" defaultSelectedKeys={['1']}>
            <Menu.Item key="1">
              <Link to='/'>
                <Icon type="hdd" />
                <span>Projects</span>
              </Link>
            </Menu.Item>
          </Menu>
        </Sider>

        <Layout>
          <Header style={{ background: '#fff', padding: 0 }}>
            <Icon
              className="trigger"
              type={this.state.collapsed ? 'menu-unfold' : 'menu-fold'}
              onClick={this.toggle}
            />
          </Header>
          <Content style={{ 
            margin: '16px', 
            padding: 0, 
            background: 'transparent', 
            minHeight: 280 
            }}>
              <Switch>
                <Route exact path='/' component={Projects}/>
                <Route exact path='/editor/:folder' component={Editor}/>
              </Switch>
          </Content>
        </Layout>

      </Layout>
    );
  }
}

export default App;
