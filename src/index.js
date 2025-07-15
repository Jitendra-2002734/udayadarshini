// require('file-loader?name=[name].[ext]!./index.html');
// import React from 'react';
// import ReactDOM from 'react-dom/client';
// import './css/index.css';
// //import reportWebVitals from './reportWebVitals';
// import { App } from './Login/App';
// import { RouterProvider } from "react-router-dom";
// import router from './routes/router';
// import './css/App.css';
// import 'antd/dist/reset.css';
// import { ConfigProvider } from "antd";
// import { ProConfigProvider } from '@ant-design/pro-provider';
// import enUS from 'antd/es/locale/en_US';
// import { ORANGE_COLORS_CODES } from './configure/Themes';


// const root = ReactDOM.createRoot(document.getElementById('root'));
// root.render(
//   <ConfigProvider locale={enUS} theme={ORANGE_COLORS_CODES} >
   
//     <RouterProvider router={router}>
//       <App />
//     </RouterProvider>
  
// </ConfigProvider>
// );




require('file-loader?name=[name].[ext]!./index.html');
import React from 'react';
import ReactDOM from 'react-dom/client';
import './css/index.css';
//import reportWebVitals from './reportWebVitals';
import { App } from './login/App';
import { RouterProvider } from "react-router-dom";
import router from './routes/router';
import './css/App.css';
import 'antd/dist/reset.css';
import { ConfigProvider } from "antd";
import { ProConfigProvider } from '@ant-design/pro-provider';
import enUS from 'antd/es/locale/en_US';
import { ORANGE_COLORS_CODES } from './configure/Themes';


const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <ConfigProvider locale={enUS} theme={ORANGE_COLORS_CODES} >
   
    <RouterProvider router={router}>
      <App />
    </RouterProvider>
  
</ConfigProvider>
);

