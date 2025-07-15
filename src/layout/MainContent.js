import React, { useState, useEffect } from 'react';
import ProLayout, { PageContainer, DefaultFooter } from '@ant-design/pro-layout';
import { Outlet, useLocation, useNavigate, Link } from 'react-router-dom';
import sfr from '../images/logo.png';
import { APP_NAME, COM_PATH_PERMISSIONS, LOCAL_STORAGE_CONSTANTS } from '../configure/MyUtilsConfig';
import { MobileOutlined,DownloadOutlined } from '@ant-design/icons';
import MenuConfig from './MenuConfig';
import { Button,Tooltip } from 'antd';
import DashboardHeader from './DashboardHeader';
  
import '../css/Layout.css';

const MainContent = () => {
  const [actionId, setActionId] = useState(null);
  const [apiHeader, setApiHeader] = useState(null);
  const [collapsed, setCollapsed] = useState(false);
  const [selectedKey, setSelectedKey] = useState(null);
  const [isMinimized, setIsMinimized] = useState(false);
  const [divisionName, setDivName] = useState('');
  const navigate = useNavigate();
  const location = useLocation();
  const resultPath = location.pathname.slice(1);

  useEffect(() => {

    try {
      const info = JSON.parse(localStorage.getItem(LOCAL_STORAGE_CONSTANTS.USER_INFO));
      if (info) {
        setDivName(info?.divName)
        setActionId(info?.roleId);
        setApiHeader({ authorization: info.token });
      }
    } catch (error) {
      console.error('Error initializing MainContent:', error);
    }

    const handleResize = () => {
      if (window.innerWidth <= 768) {
        setIsMinimized(true);
      } else {
        setIsMinimized(false);
      }
    };

    window.addEventListener('resize', handleResize);

    // Initial check
    handleResize();

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const handleCollapse = (collapsed) => {
    setCollapsed(collapsed);
  };

  const getAllPaths = () => {
    const info = JSON.parse(localStorage.getItem(LOCAL_STORAGE_CONSTANTS.USER_INFO));
    return COM_PATH_PERMISSIONS[info.roleId] || [];
  };

  const getMenuItems = () => {
    switch (actionId) {
      case 7: return MenuConfig.ADMIN;
      default: return MenuConfig.ADMIN;
    }
  };

  const customLogo = () => (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
      <div style={{ display: 'flex', alignItems: 'center' }}>
        <img src={sfr} alt="logo" style={{ width: 'auto', height: '30px' }} />
        {!isMinimized && !collapsed && (
          <h1 style={{ color: 'white', margin: 0, paddingLeft: '8px', fontSize: '18px' }}>
            {APP_NAME.APP_NAME}
          </h1>
        )}
      </div>
      <div style={{ color: 'white', fontSize: '14px', marginTop: '4px', marginLeft: '40px' }}>
        {!isMinimized && !collapsed && (
          <span
            style={{
              border: ' 2px solid #008945',
              color: '#fff',
              padding: '4px 12px',
              borderRadius: '20px',
              fontSize: '11px',
              fontWeight: '600',
              textTransform: 'uppercase',
              letterSpacing: '0.5px',
              display: 'inline-block',
              marginTop: '4px',
              boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2)',
              whiteSpace: 'nowrap',
              transition: 'transform 0.2s ease',

            }}
          >
            {''}
          </span>
        )}
      </div>
    </div>
  );


  return (
    <ProLayout
      className="pro-layout-container"
      logo={customLogo()}
      menuItemRender={(item, dom) => {
          return (
            <div
              role="button"
              tabIndex="0"
              onClick={() => {
                setSelectedKey(item.key);
                navigate(item.path);
              }}
              style={{ cursor: 'pointer' }}
            >
              {dom}
            </div>
          );
      }}
      title={false}
      menuDataRender={() => getMenuItems()}
      layout="side"
      onCollapse={handleCollapse}
      siderWidth={260}
      collapsed={collapsed}
      selectedKeys={[selectedKey]}
      footerRender={() => (
        <DefaultFooter
          className='footer-content'
          copyright={`Created ©${new Date().getFullYear()} by Mindcoin Services Private Limited. ver-21.05.01`}
        />
      )}
      actionsRender={() => (
        <DashboardHeader
          minimized={isMinimized} 
          style={{
            marginRight: isMinimized ? '-10px' : '70px',
            backgroundColor: isMinimized ? 'transparent' : "#093c97",
          }}
        />
      )}
    >
      <PageContainer style={{ backgroundColor: '#ECEDF3', flex: 1, paddingLeft: '-900px', overflow: 'auto', marginTop: '-40px' }} title={false}>
        {apiHeader && <Outlet context={{ apiHeader }} />}
      </PageContainer>

    </ProLayout>
  );
};

export default MainContent;



