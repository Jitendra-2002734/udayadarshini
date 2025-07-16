import React, { useState } from 'react';
import {
  Row,
  Col,
  Card,
  Typography,
  Form,
  Input,
  Button,
  Table,
  Space,
} from 'antd';
import { EyeOutlined, EditOutlined } from '@ant-design/icons';

const { Title } = Typography;
const { Search } = Input;

const BugReport = () => {
  const [form] = Form.useForm();
  const [reports, setReports] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [searchText, setSearchText] = useState('');

  const onFinish = values => {
    if (editingIndex !== null) {
      const updated = [...reports];
      updated[editingIndex] = values;
      setReports(updated);
      setEditingIndex(null);
    } else {
      setReports([...reports, values]);
    }
    form.resetFields();
  };

  const handleEdit = (record, index) => {
    form.setFieldsValue(record);
    setEditingIndex(index);
  };

  const filteredReports = reports.filter(item => {
    const search = searchText.toLowerCase();
    return (
      item.bugTitle?.toLowerCase().includes(search) ||
      item.description?.toLowerCase().includes(search) ||
      item.createdBy?.toLowerCase().includes(search)
    );
  });

  const columns = [
    { title: 'Bug Title', dataIndex: 'bugTitle', key: 'bugTitle' },
    { title: 'Description', dataIndex: 'description', key: 'description' },
    { title: 'Created By', dataIndex: 'createdBy', key: 'createdBy' },
    {
      title: 'Action',
      key: 'action',
      render: (_, record, index) => (
        <Space size="middle">
          <EyeOutlined style={{ color: 'green' }} />
          <EditOutlined onClick={() => handleEdit(record, index)} style={{ color: 'green' }} />
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24, background: '#f5f6fa', minHeight: '100vh' }}>
      <Row gutter={24} align="stretch">
        {/* Left: Bug Report List */}
        <Col span={15}>
          <Title level={4} style={{ marginBottom: 8 }}>Bug Report List</Title>
          <Card
            style={{
              height: '400px',
              display: 'flex',
              flexDirection: 'column',
            }}
            bodyStyle={{ padding: 16, display: 'flex', flexDirection: 'column', flex: 1 }}
          >
            <Search
              placeholder="Search bug"
              allowClear
              onChange={(e) => setSearchText(e.target.value)}
              style={{ marginBottom: 12 }}
              size="small"
            />
            <div style={{ flex: 1, overflow: 'auto' }}>
              <Table
                dataSource={filteredReports}
                columns={columns}
                rowKey={(record, idx) => idx}
                pagination={{ pageSize: 5 }}
              />
            </div>
          </Card>
        </Col>

        {/* Right: Add/Edit Form */}
        <Col span={9}>
          <Title level={4} style={{ marginBottom: 8 }}>
            {editingIndex !== null ? 'Edit Bug Report' : 'Add Bug Report'}
          </Title>
          <Card
            style={{
              height: '400px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between'
            }}
            bodyStyle={{ padding: 16, display: 'flex', flexDirection: 'column', flex: 1 }}
          >
            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
              style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}
            >
              <div>
                <Form.Item
                  name="bugTitle"
                  rules={[{ required: true, message: 'Please enter the bug title' }]}
                  label={<span style={{ color: 'black' }}> Bug Title</span>}
                >
                  <Input placeholder="Enter bug title" />
                </Form.Item>

                <Form.Item
                  name="description"
                  rules={[{ required: true, message: 'Please describe the bug' }]}
                  label={<span style={{ color: 'black' }}> Description</span>}
                >
                  <Input.TextArea placeholder="Enter description" rows={4} />
                </Form.Item>

                <Form.Item
                  name="createdBy"
                  rules={[{ required: true, message: 'Please enter your name' }]}
                  label={<span style={{ color: 'black' }}> Created By</span>}
                >
                  <Input placeholder="Enter your name" />
                </Form.Item>
              </div>

              <Form.Item>
                <Space>
                  <Button onClick={() => form.resetFields()}>Reset</Button>
                  <Button
                    type="primary"
                    htmlType="submit"
                    style={{ backgroundColor: 'green', borderColor: 'green' }}
                  >
                    {editingIndex !== null ? 'Update' : 'Add'}
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </Card>
        </Col>
      </Row>
    </div>
  );
};

export default BugReport;
