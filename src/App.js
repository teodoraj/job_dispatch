import React from 'react';
import './App.module.css';
import Layout from './container/Layout';
import MainContent from './components/MainContent/MainContent';

import Wrapper from './components/MainContent/Main';
function App() {
  return (
    <div className="App">
      <Layout>
        {/* add menu */}

        <Wrapper />

      </Layout>

    </div>
  );
}

export default App;
