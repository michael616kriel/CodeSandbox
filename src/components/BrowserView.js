
import React, { Component } from 'react';
import { Layout, Input, Button  } from 'antd';
import './BrowserView.scss';

const { Header, Footer, Sider, Content } = Layout;
const Search = Input.Search;

class BrowserView extends Component {

        state = {
            url: 'http://localhost:9000',
            value : 'localhost:9000'
        };
        
        componentDidMount() {

        };
    
        componentWillUnmount() {

        }

        onSearch = (value) => {
            let newUrl = `http://${value}`
            this.setState({
                url : newUrl,
                value : newUrl.replace('http://', '')
            })
        }

        render() {
            return <div className="browser">
                <div className="top">
                    <Search
                        value={this.state.value}
                        addonBefore="http://" 
                        placeholder="input search text"
                        onSearch={this.onSearch}
                        onChange={value => console.log(value)}
                        enterButton
                    />
                </div>
                <div className="content">
                    <iframe src={this.state.url}></iframe>
                </div>
            </div>
        };

}

export default BrowserView;
