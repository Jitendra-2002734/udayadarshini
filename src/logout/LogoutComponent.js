import React from 'react';
import { Button, Modal } from 'antd';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URLS ,OS_TYPES,LOCAL_STORAGE_CONSTANTS} from '../configure/MyUtilsConfig';

const LogoutComponent = ({ open }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
      const info = JSON.parse(localStorage.getItem(LOCAL_STORAGE_CONSTANTS.USER_INFO));
      let inputdata = { userId: info?.uuid ,"osType":OS_TYPES.OS_WEB,}
      axios.post(API_URLS.URL_AUTH_LOGOUT, inputdata)
        .then((res) => {
          if (res.data.status === 1) {
            const keysToRemove = [LOCAL_STORAGE_CONSTANTS.USER_INFO];
            keysToRemove.forEach(key => localStorage.removeItem(key));
              navigate('/');
          }
          else {
            message.error("" + res.data.mssg);
          }
        }).catch((error) => {
          message.error(error);
        });
  };


  return (
    <Modal 
     width={400}
       title={<div style={{ color: 'red' }}><center>Session Expired</center></div>}
     open={open}
       footer={[]} 
      >
      <div style={{ height: '80px' }}>
        <center>
          <Button style={{ marginTop: '20px' }} type='primary' onClick={handleLogout}>
            Log In
          </Button>
        </center>
      </div>
    </Modal>
  );
};

export default LogoutComponent;
