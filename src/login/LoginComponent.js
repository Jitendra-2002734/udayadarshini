import React, { useState, useRef } from 'react';
import { Row, Avatar, Col, Typography, Button, Form, Input, Modal, message, Card, notification, Layout } from 'antd';
import { LockOutlined, UserOutlined } from '@ant-design/icons';
import { useNavigate } from "react-router-dom";
import sfr from '../images/logo.png';
import ReCAPTCHA from 'react-google-recaptcha';
import '../layout/MainContent';
import MindCoinLogo from '../images/MindCoinLogo.png';

const { Text } = Typography;
const { Content } = Layout;

const APP_NAME = {
  APP_NAME: "Udyana Darshini"
};

const LOCAL_STORAGE_CONSTANTS = {
  USER_INFO: "USER_INFO"
};

const LoginComponent = () => {
  const recaptchaRef = useRef(null);
  const [isLoading, setIsLoading] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState('');
  const [isModalVisible, setIsModalVisible] = useState(false);
  const navigate = useNavigate();
  const [messageApi, contextHolder] = message.useMessage();

  const handleRecaptchaChange = (token) => {
    setRecaptchaToken(token);
  };

  const onFinish = (values) => {
    if (!recaptchaToken) {
      notification.error({
        message: 'ReCAPTCHA Verification',
        description: 'Please complete the reCAPTCHA verification before logging in.',
        placement: 'top'
      });
      return;
    }

    setIsLoading(true);

    // ✅ Dummy Login Logic (No API)
    setTimeout(() => {
      localStorage.setItem(LOCAL_STORAGE_CONSTANTS.USER_INFO, JSON.stringify({ username: values.username }));
      navigate('/DashboardReport'); // Make sure this route exists in your router
      setIsLoading(false);
    }, 1000);
  };

  return (
    <>
      {contextHolder}
      <Row
        className='container'
        style={{
          backgroundColor: '#008945',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '100vh',
          width: '100%',
        }}
      >
        <Col
          span={12}
          className="login-form"
          style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              width: '100%',
              flexGrow: 1
            }}
          >
            <Card
              style={{
                background: 'white',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
                border: '1px solid rgb(211, 207, 201)',
                borderRadius: '20px',
                width: '330px'
              }}
            >
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  marginTop: '10px'
                }}
              >
                <Avatar size={80} src={sfr} />
                <Typography.Text
                  strong
                  style={{ fontSize: 15, color: 'black', marginTop: '10px' }}
                >
                  {APP_NAME.APP_NAME}
                </Typography.Text>
              </div>

              <Form
                onFinish={onFinish}
                style={{ marginTop: '20px', marginBottom: '20px' }}
              >
                <Form.Item
                  name="username"
                  rules={[{ required: true, message: 'Enter Mobile Number' }]}
                >
                  <Input
                    size="medium"
                    prefix={<UserOutlined />}
                    placeholder="Mobile Number"
                    style={{ height: '40px' }}
                  />
                </Form.Item>

                <Form.Item
                  name="password"
                  rules={[{ required: true, message: 'Enter Password' }]}
                >
                  <Input.Password
                    prefix={<LockOutlined />}
                    type="password"
                    placeholder="Password"
                    style={{ height: '40px' }}
                  />
                </Form.Item>

                <Form.Item>
                  <div style={{ transform: 'scale(0.9)', transformOrigin: '0 0' }}>
                    <ReCAPTCHA
                      ref={recaptchaRef}
                      onChange={handleRecaptchaChange}
                      sitekey='6LebpAwqAAAAAHg2BchUtVEoP4Xd7k2zoBWEr81i'
                    />
                  </div>
                </Form.Item>

                <Button
                  loading={isLoading}
                  type="primary"
                  htmlType="submit"
                  style={{
                    width: '100%',
                    height: '40px',
                    fontSize: '18px',
                    color: 'white',
                    marginBottom: '10px'
                  }}
                >
                  Log In
                </Button>
              </Form>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
                <span style={{ marginRight: "10px", fontSize: '12px' }}>Powered by</span>
                <a href="https://mindcoinservices.com/" target="_blank" rel="noopener noreferrer" style={{ textDecoration: "none", color: "inherit" }}>
                  <img src={MindCoinLogo} alt="MindCoin Logo" style={{ width: "70px", height: "auto" }} />
                </a>
              </div>
            </Card>
          </div>

          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '10px 0' }}>
            <Text style={{ color: 'white' }}>
              Contact: <a href="tel:+919701658885" style={{ color: 'white' }}>+91-97016 58885</a> |
              Email: <a href="mailto:info@mindcoinservices.com" style={{ color: 'white' }}>info@mindcoinservices.com</a> |
              Ver-21.05.01
            </Text>
          </div>
        </Col>
      </Row>

      <Modal
        width={400}
        title={<div style={{ color: 'red', textAlign: 'center' }}>Access Denied</div>}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <div style={{ fontSize: '16px', fontWeight: '450', textAlign: 'center', marginTop: '20px' }}>
          CLIs can't log in to the web application.
        </div>
      </Modal>
    </>
  );
};

export default LoginComponent;
