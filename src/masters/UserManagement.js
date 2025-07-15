import React, { useState } from 'react';
import {
  Row,
  Col,
  Card,
  Typography,
  Form,
  Input,
  Button,
  Select,
  Radio,
  Table,
  Space,
} from 'antd';
import { EyeOutlined, EditOutlined } from '@ant-design/icons';

const { Title } = Typography;
const { Option } = Select;
const { Search } = Input;

const UserManagement = () => {
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
      item.name?.toLowerCase().includes(search) ||
      item.crisId?.toLowerCase().includes(search) ||
      item.depot?.toLowerCase().includes(search)
    );
  });

  const columns = [
    { title: 'Role', dataIndex: 'role' },
    { title: 'Depot', dataIndex: 'depot' },
    { title: 'CRIS ID', dataIndex: 'crisId' },
    { title: 'Name', dataIndex: 'name' },
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
      <Row gutter={24}>
        {/* Left: User Table */}
        <Col span={15}>
          <Title level={4} style={{ marginBottom: 16 }}>User List</Title>
          <Card style={{ height: '540px', display: 'flex', flexDirection: 'column' }}>
            <Search
              placeholder="Search name, crisId, depot"
              allowClear
              onChange={(e) => setSearchText(e.target.value)}
              style={{ marginBottom: 12 }}
              size="small"
            />
            <Table
              dataSource={filteredData}
              columns={columns}
              rowKey={(record, index) => index}
              pagination={{ pageSize: 5 }}
              style={{ flex: 1 }}
            />
          </Card>
        </Col>

        {/* Right: User Form */}
        <Col span={9}>
          <Title level={4} style={{ marginBottom: 16 }}>
            {editingIndex !== null ? 'Edit User' : 'Add User'}
          </Title>
          <Card style={{ height: '540px' }}>
            <Form form={form} layout="vertical" onFinish={onFinish}>
              <Form.Item
                name="role"
                rules={[{ required: true, message: 'Please select a role' }]}
                label={<span style={{ color: 'black' }}> Role</span>}
              >
                <Select placeholder="Select Role">
                  <Option value="CLI">CLI</Option>
                  <Option value="DEE">DEE</Option>
                </Select>
              </Form.Item>

              <Form.Item
                name="depot"
                rules={[{ required: true, message: 'Please enter depot' }]}
                label={<span style={{ color: 'black' }}> Depot</span>}
              >
                <Input placeholder="Enter depot" />
              </Form.Item>

              <Form.Item
                name="crisId"
                rules={[{ required: true, message: 'Please enter CRIS ID' }]}
                label={<span style={{ color: 'black' }}> CRIS ID</span>}
              >
                <Input placeholder="Enter CRIS ID" />
              </Form.Item>

              <Form.Item
                name="name"
                rules={[{ required: true, message: 'Please enter name' }]}
                label={<span style={{ color: 'black' }}> Name</span>}
              >
                <Input placeholder="Enter name" />
              </Form.Item>

              <Form.Item
                name="status"
                label={<span style={{ color: 'black' }}> Status</span>}
                initialValue="Active"
              >
                <Radio.Group>
                  <Radio value="Active">Active</Radio>
                  <Radio value="Deactive">Deactive</Radio>
                </Radio.Group>
              </Form.Item>

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

export default UserManagement;


