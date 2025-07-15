import React, { useState, useEffect } from 'react';
import { Input, Button, List, Radio, Tag, Form, Typography, Space, Alert, Spin, message } from 'antd';
import { useOutletContext } from 'react-router-dom';
import axios from 'axios';
import { API_URLS,LOCAL_STORAGE_CONSTANTS } from '../configure/MyUtilsConfig';
import dayjs from 'dayjs';
import LogoutComponent from '../logout/LogoutComponent';

const { Text } = Typography;

const BugConversationModel = ({ currentDiscussion, userName }) => {
  const [form] = Form.useForm();
  const { apiHeader } = useOutletContext();
  const [messages, setMessages] = useState([]);
  const [isSessionExpiredVisible, setIsSessionExpiredVisible] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState(1);
  const [isFormDisabled, setIsFormDisabled] = useState(false);

  useEffect(() => {
    fetchMessages();
  }, [currentDiscussion]);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const response = await axios.get(API_URLS.DISCUSSION_GET_BY_TICKET_ID + `/${currentDiscussion.uuid}`, { headers: apiHeader });
     
      const formattedMessages = response.data.content.map(item => ({
        text: item.msg || 'No content',
        time: item.createdDate ? dayjs(item.createdDate).format('DD-MMM-YY , HH:mm') : null,
        status: item.status,
        name:item.userName,
      }));
      const hasClosedStatus = formattedMessages.some(item => item.status === 3);
      setIsFormDisabled(hasClosedStatus);
       console.log("Messages:",formattedMessages)
      setMessages(formattedMessages);
    } catch (error) {
      console.error('Error fetching messages:', error);
      setMessages([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSend = async (values) => {
    if (input.trim()) {
      try {
        setLoading(true);
        const info = JSON.parse(localStorage.getItem(LOCAL_STORAGE_CONSTANTS.USER_INFO));
        const obj = {
          msg: input,
          userId: info?.uuid,
          userName:info?.name,
          createdBy: info?.uuid,
          ticketsId: currentDiscussion.uuid,
          status: status,
          createdDate: dayjs().toISOString(),
          divId:info?.divId
        };

        const res = await axios.post(`${API_URLS.DISCUSSION_UPDATE}`, obj, { headers: apiHeader });
        if (res.data.status === 1) {
          setInput("");
          fetchMessages();
          form.resetFields();
        } else if (res.data.status === 2) {
          setIsSessionExpiredVisible(true);
        } else {
          message.error(res.data.mssg);
        }
      } catch (error) {
        console.error('Error sending message:', error);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  const getStatusText = (status) => {
    switch (status) {
      case 1:
        return <Tag bordered={false} color="geekblue">Open</Tag>;
      case 2:
        return <Tag bordered={false} color="magenta">Working</Tag>;
      case 3:
        return <Tag bordered={false} color="green">Closed</Tag>;
      default:
        return null;
    }
  };

  return (
    <>
      <div style={{ padding: 10 }}>
        {loading ? <Spin /> :
          <div style={{ padding: 10, height: 300, overflowY: 'auto' }}>
            <List
              dataSource={messages}
              renderItem={(item, index) => (
                <List.Item
                  key={index}  
                  style={{ marginBottom: 10 }}
                >
                  <List.Item.Meta
                    title={
                      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                        <div>
                          {item.name}<span style={{ fontSize: '12px', color: '#888', marginLeft: '5px' }}>{item.time}</span>
                        </div>
                        {getStatusText(item.status)}
                      </div>}
                    description={<span style={{ color: '#000', width: '200px' }}>{item.text}</span>}
                  />
                </List.Item>
              )}
              loading={loading}
            />
          </div>
        }

        <hr />

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSend}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
            <span style={{ marginRight: '10px' }}>Status:</span>
            <Form.Item name="status" colon={false} style={{ marginBottom: 0, flex: 1 }} initialValue={status}>
              <Radio.Group  value={status} onChange={(e) => setStatus(e.target.value)} disabled={isFormDisabled}>
                <Radio value={1}>Open</Radio>
                <Radio value={2}>Working</Radio>
                <Radio value={3}>Closed</Radio>
              </Radio.Group>
            </Form.Item>
          </div>
          <Form.Item
        name="comment"
        rules={[
          { required: true, message: 'Comment is required!' },
        ]}
        style={{ marginTop: 10 }}
      >
        <Space direction="horizontal" size="large" style={{ width: '100%' }}>
          <Input.TextArea
            value={input}
            onChange={handleInputChange}
            placeholder="Enter Your Comment"
            maxLength={500}
            style={{ flex: 1, width: '500px' }}
            disabled={isFormDisabled}
          />
          <Button
            disabled={isFormDisabled}
            htmlType="submit"
            type="primary"
            loading={loading}
          >
            Send
          </Button>
        </Space>
      </Form.Item>
          {isFormDisabled && (
            <Alert
              description={
                <span>
                  <center>This ticket has been resolved and <strong>Closed</strong>.</center>
                </span>
              }
              type="warning"
            />
          )}
        </Form>
      </div>
      <LogoutComponent open={isSessionExpiredVisible} />
    </>
  );
};

export default BugConversationModel;
