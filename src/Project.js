import React, { useState } from 'react';
import {
  Row,
  Col,
  Typography,
  Form,
  Input,
  Button,
  Table,
  Card,
  Space
} from 'antd';
import { EditOutlined, EyeOutlined } from '@ant-design/icons';

const { Title } = Typography;
const { Search } = Input;

const ProjectPage = () => {
  const [form] = Form.useForm();
  const [data, setData] = useState([]);
  const [editingIndex, setEditingIndex] = useState(null);
  const [searchText, setSearchText] = useState('');

  const onFinish = (values) => {
    if (editingIndex !== null) {
      const updated = [...data];
      updated[editingIndex] = values;
      setData(updated);
      setEditingIndex(null);
    } else {
      setData([...data, values]);
    }
    form.resetFields();
  };

  const handleEdit = (record, index) => {
    form.setFieldsValue(record);
    setEditingIndex(index);
  };

  const filteredData = data.filter((item) => {
    const search = searchText.toLowerCase();
    return (
      item.projectTitle?.toLowerCase().includes(search) ||
      item.description?.toLowerCase().includes(search) ||
      item.createdBy?.toLowerCase().includes(search)
    );
  });

  const columns = [
    { title: 'Project Title', dataIndex: 'projectTitle' },
    { title: 'Description', dataIndex: 'description' },
    { title: 'Created By', dataIndex: 'createdBy' },
    {
      title: 'Action',
      render: (_, record, index) => (
        <Space>
          <EyeOutlined style={{ color: 'green' }} />
          <EditOutlined onClick={() => handleEdit(record, index)} style={{ color: 'green' }} />
        </Space>
      ),
    },
  ];

  return (
    <div style={{ padding: 24, background: '#f5f6fa', minHeight: '100vh' }}>
      <Row gutter={24} align="top">
        {/* Table Section */}
        <Col span={15}>
          <Title level={4} style={{ marginBottom: 8 }}>Project List</Title>
          <Card style={{ height: '500px', display: 'flex', flexDirection: 'column' }}>
            <Search
              placeholder="Search project"
              allowClear
              onChange={(e) => setSearchText(e.target.value)}
              style={{ marginBottom: 12 }}
              size="small"
            />
            <Table
              dataSource={filteredData}
              columns={columns}
              rowKey={(record, index) => index}
              pagination={false}
              style={{ flex: 1 }}
            />
          </Card>
        </Col>

        {/* Form Section */}
        <Col span={9}>
          <Title level={4} style={{ marginBottom: 8 }}>Add Project</Title>
          <Card style={{ height: '500px', display: 'flex', flexDirection: 'column' }}>
            <Form
              form={form}
              layout="vertical"
              onFinish={onFinish}
              style={{ flex: 1 }}
            >
              <Form.Item
                name="projectTitle"
                rules={[{ required: true, message: 'Please enter project title' }]}
                label="Project Title"
              >
                <Input placeholder="Enter project title" />
              </Form.Item>

              <Form.Item
                name="description"
                rules={[{ required: true, message: 'Please enter description' }]}
                label="Description"
              >
                <Input.TextArea rows={2} placeholder="Enter description" />
              </Form.Item>

              <Form.Item
                name="createdBy"
                rules={[{ required: true, message: 'Please enter your name' }]}
                label="Created By"
              >
                <Input placeholder="Enter your name" />
              </Form.Item>

              <Form.Item>
                <Space>
                  <Button onClick={() => form.resetFields()}>Reset</Button>
                  <Button
                    type="primary"
                    htmlType="submit"
                    style={{ backgroundColor: 'green', borderColor: 'green' }}
                  >
                    {editingIndex !== null ? 'Update' : 'Submit'}
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

export default ProjectPage;
