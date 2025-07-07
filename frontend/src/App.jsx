import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import Index from './components/Index';
import { Provider } from 'react-redux';
import { store } from './Redux/store';
import { SocketProvider } from './context/socketContext';

const App = () => {
  return (
    <Provider store={store}>
      <SocketProvider>
        <BrowserRouter>
          <Index />
        </BrowserRouter>
      </SocketProvider>
    </Provider>
  );
};

export default App;
