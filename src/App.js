import React from 'react';
import './App.module.css';
import Layout from './container/Layout';
import MapWrapper from './components/MainContent/MapWrapper';

function App() {
  return (
    <div className="App">
      <Layout>
        <MapWrapper />
      </Layout>
    </div>
  );
}

export default App;
