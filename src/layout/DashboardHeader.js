import React, { useState, useEffect } from 'react';
import { Layout, Avatar, Row, Col, Space, Modal, Button, Typography, Popover, Form, Input, Spin, Menu, message, Divider, Radio, Table } from 'antd';
import { UserOutlined, LockOutlined, LogoutOutlined,HistoryOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { API_URLS, OS_TYPE, OS_TYPES,ACTIVITY_TYPE,LOCAL_STORAGE_CONSTANTS,USER_TYPE } from '../configure/MyUtilsConfig';
import axios from 'axios';
import { color } from 'echarts';
import dayjs from 'dayjs';
import LogoutComponent from '../logout/LogoutComponent';
import ActivityLog from './ActivityLog';
const { Header } = Layout;

const DashboardHeader = ({ minimized, collapsed }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [form] = Form.useForm();
  const [loginInfo, setLoginInfo] = useState({});
  const [profileDialog, setProfileDialog] = useState(false);
  const [changePasswordDialog, setChangePasswordDialog] = useState(false);
  const [profileHistoryModal, setProfileHistoryModal] = useState(false);
  const navigate = useNavigate();
  const [apiHeader, setApiHeader] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isLoadingHistory,setIsLoadingHistory]=useState(false)
  const [isSessionExpiredVisible,setIsSessionExpiredVisible]=useState(false)
  
  const[userHistory,setUserHistory]=useState([])

  useEffect(() => {
    const info = JSON.parse(localStorage.getItem(LOCAL_STORAGE_CONSTANTS.USER_INFO));
    if (info) {
      setLoginInfo(info);
      setApiHeader({ authorization: info.token });
    }
  }, []);




  const logoutEvent = () => {
    const info = JSON.parse(localStorage.getItem(LOCAL_STORAGE_CONSTANTS.USER_INFO));
    setIsLoading(true);
    let inputdata = { userId: info?.uuid, "osType": OS_TYPES.OS_WEB };
    axios.post(API_URLS.URL_AUTH_LOGOUT, inputdata)
      .then((res) => {
        if (res.data.status === 1) {
          // localStorage.clear();
          const keysToRemove = [LOCAL_STORAGE_CONSTANTS.USER_INFO];
          keysToRemove.forEach(key => localStorage.removeItem(key));
          // localStorage.removeItem();
          navigate('/');
          message.success(res.data.mssg);
        } else {
          message.error(res.data.mssg);
        }
        setIsLoading(false);
      }).catch((error) => {
        message.error(error);
        setIsLoading(false);
      });
  };

  const hideProfileDialog = () => setProfileDialog(false);
  const showProfileDialog = () => setProfileDialog(true);
  const hideChangePasswordDialog = () => setChangePasswordDialog(false);
  const showChangePasswordDialog = () => setChangePasswordDialog(true); 

  const showProfileHistory = () =>{
    setProfileHistoryModal(true);
  }

  const confirmDelete = () => {
    Modal.confirm({
      title: 'Confirm logout',
      content: 'Are you sure do you want to logout?',
      okText: 'Yes',
      okType: 'danger',
      cancelText: 'No',
      onOk: () => logoutEvent(),
      // onOk:()=> navigate('')

    });
  };



  const content = (
    <Menu style={{ backgroundColor: 'transparent' }} >
      <Menu.Item key="Profile" style={{ color: 'black' }} onClick={showProfileDialog} icon={<UserOutlined />}>
        Profile
      </Menu.Item>
      {/* <Menu.Item key="History" style={{ color: 'black' }} onClick={showProfileHistory} icon={<HistoryOutlined />}>
        Activity Log
      </Menu.Item> */}
      <Menu.Item style={{ color: 'black', width: '100%' }} key="logout" icon={<LockOutlined />} onClick={showChangePasswordDialog}>
        Change Password
      </Menu.Item>
      <Menu.Item key="onLogout" type='primary' style={{ color: 'black' }} onClick={() => confirmDelete()} icon={<LogoutOutlined />} >
        Logout
      </Menu.Item>
    </Menu>
  );

  const onFinish = (values) => {
    const info = JSON.parse(localStorage.getItem(LOCAL_STORAGE_CONSTANTS.USER_INFO));
    if (values.newPassword !== values.cNewPassword) {
      message.error('Password and confirm password do not match');
    } else {
      setIsLoading(true);
      let inputdata = { employeeOrFarmerId: info?.uuid, password: values.password, newPassword: values.newPassword };
      axios.post(API_URLS.URL_AUTH_CHANGE_PASS, inputdata, { headers: apiHeader })
        .then((res) => {
          if (res.data.status === 1) {
            message.success(res.data.mssg);
            form.resetFields();
            hideChangePasswordDialog();
          } else {
            message.error(res.data.mssg);
          }
          setIsLoading(false);
        }).catch((error) => {
          message.error(error);
          setIsLoading(false);
        });
    }
  };

  return (<>
    <Header>
      {minimized ? (
        <Popover placement="topRight" content={content}>
          <Avatar
            size={30}
            style={{ backgroundColor: '#008945', border: '1px solid white', marginLeft: '10px' }} // blue theme
            icon={<UserOutlined />}
          />
        </Popover>
      ) : (
        <Popover placement="topRight" content={content}>

          <Avatar
            size={30}
            style={{
              backgroundColor: '#008945', // ea812b
              border: '1px solid white',
              marginLeft: '10px'
            }}
            icon={<UserOutlined />}
          />

          {!minimized && (
            <span style={{ color: '#fff', fontSize: '15px', marginLeft: '10px' }}>Profile</span> // Show text only when not minimized
          )}
        </Popover>
      )}

      <Modal
        width={300}
        open={profileDialog}
        onCancel={hideProfileDialog}
        footer={[]}
        closable={false}
        style={{
          // padding: 20,
          background: 'linear-gradient(to bottom, #E8B86D, #ffffff)',
          background: '#008945',
          borderRadius: '30px',
          // position: 'relative', // Enables absolute positioning of the icon
        }}
      >
        <div style={{ position: 'relative', }}>
          {/* Profile Icon - Half Out of the Gradient */}
          <div
            style={{
              position: 'absolute',
              top: '-65px', // Moves it upward
              left: '50%',
              transform: 'translateX(-50%)', // Centers horizontally
              backgroundColor: '#008945',
              borderRadius: '50%',
              padding: '10px',
              marginBottom: '20px'
            }}
          >
            <UserOutlined style={{ fontSize: '40px', color: '#fff' }} />
          </div>
        </div>

        <center>
          <p
            style={{
              fontSize: '16px',
              fontWeight: 'bold',
              color: '#EB8317',
            }}
          >
            {loginInfo.name}
          </p>
        </center>


        <Radio.Group
          style={{
            marginTop: '10px',
            display: 'flex',
            width: '100%',
          }}
          size="small"
        >
          <Radio.Button
            style={{
              flex: 2,
              textAlign: 'center',
              backgroundColor: '#ffffff',
              color: '#000',
              border: 'none',
            }}
          >
            <b>Role</b>
          </Radio.Button>
          <Radio.Button
            style={{
              flex: 2,
              textAlign: 'center',
              backgroundColor: '#ffffff',
              color: '#000',
              border: 'none',
            }}
          >
             {USER_TYPE[loginInfo?.roleId]}
            {/* {TLC_ID[loginInfo?.roleId]} */}
          </Radio.Button>
        </Radio.Group>

        <Radio.Group
          style={{
            marginTop: '10px',
            display: 'flex',
            width: '100%',
            marginBottom: '20px'
          }}
          size="small"
        >
          <Radio.Button
            style={{
              flex: 2,
              textAlign: 'center',
              color: '#000',
              border: 'none',
            }}
          >
            <b>Phone</b>
            {/* {TLC_ID[loginInfo?.roleId]} */}
          </Radio.Button>
          <Radio.Button
            style={{
              flex: 2,
              textAlign: 'center',
              color: '#000',
              border: 'none',
            }}
          >
            {loginInfo?.mobileNumber}
          </Radio.Button>
        </Radio.Group>


        {/* <Radio.Group
          style={{
            marginTop: '10px',
            display: 'flex',
            width: '100%',
            marginBottom: '20px'
          }}
          size="small"
        >
          <Radio.Button
            style={{
              flex: 2,
              textAlign: 'center',
              color: '#000',
              border: 'none',
            }}
          >
            <b>Designation</b>
          </Radio.Button>
          <Radio.Button
            style={{
              flex: 2,
              textAlign: 'center',
              color: '#000',
              border: 'none',
            }}
          >
            {loginInfo?.designation}
          </Radio.Button>
        </Radio.Group> */}

        <div style={{ textAlign: 'center', marginTop: '10px' }}>
          <Button htmlType="submit" onClick={hideProfileDialog}>
            Close
          </Button>
        </div>
      </Modal>

      <Modal title="Change Password " width={380}
        open={changePasswordDialog}
        onCancel={hideChangePasswordDialog}
        style={{ textAlign: 'center', padding: '25px' }}
        footer={false}>
        <div style={{ padding: 5, paddingLeft: 20 }}>
          <Form
            form={form}
            layout='vertical'
            style={{ width: '250px', marginTop: '10px' }}
            onFinish={onFinish}
          >
            <Form.Item
              name="password"
              label="Old Password"
              style={{ marginBottom: "8px" }}
              rules={[
                {
                  required: true,
                  message: 'Enter Password!',
                },
              ]}>
              <Input.Password placeholder="Password" />
            </Form.Item>
            <Form.Item
              name="newPassword"
              label="New Password"
              style={{ marginBottom: "8px" }}
              rules={[
                {
                  required: true,
                  message: 'Enter Password!',
                },
                { min: 5, message: 'Password should be minimum 5 characters' }
              ]}>
              <Input.Password
                min={5} max={20}
                type="password"
                placeholder="Password"
              />
            </Form.Item>
            <Form.Item
              name="cNewPassword"
              label="Confirm Password"
              style={{ marginBottom: "15px" }}
              rules={[
                {
                  required: true,
                  message: 'Enter Confirm Password!',
                },
                { min: 5, message: 'Password should be minimum 5 characters' }
              ]}>
              <Input.Password
                type="password"
                min={5} max={20}
                placeholder="Confirm Password"
                style={{ height: '40px' }} />
            </Form.Item>
            <Form.Item >
              <Button loading={isLoading} style={{ width: '100%', height: '40px', fontSize: '15px' }} type="primary" htmlType="submit" >
                Save
              </Button>
            </Form.Item>
          </Form>
        </div>
      </Modal>

      <Modal 
     open={profileHistoryModal}
     onCancel={() => setProfileHistoryModal(false)}
     footer={false}
     width="40%"
     title={`${"Activity Log - "}${loginInfo.name}`}>
    <ActivityLog  apiHeader={apiHeader} onOpen={showProfileHistory}/>
      
      </Modal>

      {isLoading && (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <Spin size="large" />
        </div>
      )}
    </Header>
      <LogoutComponent open={isSessionExpiredVisible} />
    </>);
};

export default DashboardHeader;
