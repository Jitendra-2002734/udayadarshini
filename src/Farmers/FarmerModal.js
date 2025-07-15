import React, { useState, useEffect } from 'react';
import {
    Modal, Form, Input, Button, Select, message, Radio, Row, Col, Spin,open,
    Card
} from 'antd';
import { API_URLS } from '../configure/MyUtilsConfig';
import axios from 'axios';
import { useOutletContext } from 'react-router-dom';

const { TextArea } = Input;
const { Option } = Select;

const FarmerModal = ({
 open,
    
    onCancel,
    onSuccess,
    farmer,
    isEditMode,
    districts,
    mandals,
    villages
}) => {
    const [form] = Form.useForm();
    const { apiHeader } = useOutletContext();
    const [isLoading, setIsLoading] = useState(false);
    const [selectedDistrict, setSelectedDistrict] = useState(null);
    const [selectedMandal, setSelectedMandal] = useState(null);

    useEffect(() => {
        if (open) {
            if (isEditMode && farmer) {
                form.setFieldsValue({
                    farmerName: farmer.farmerName,
                    address: farmer.address,
                    mobileNumber: farmer.mobileNumber,
                    email: farmer.email,
                    password: farmer.password,
                    districtId: farmer.districtId,
                    mandalId: farmer.mandalId,
                    villageId: farmer.villageId,
                    status: farmer.status
                });
                setSelectedDistrict(farmer.districtId);
                setSelectedMandal(farmer.mandalId);
            } else {
                form.resetFields();
                form.setFieldsValue({
                    status: 1
                });
                setSelectedDistrict(null);
                setSelectedMandal(null);
            }
        }
    }, [open, farmer, isEditMode, form]);

    const handleDistrictChange = (value) => {
        setSelectedDistrict(value);
        setSelectedMandal(null);
        form.setFieldsValue({ mandalId: null, villageId: null });
    };

    const handleMandalChange = (value) => {
        setSelectedMandal(value);
        form.setFieldsValue({ villageId: null });
    };

    const filteredMandals = selectedDistrict
        ? mandals.filter(m => m.districtId === selectedDistrict)
        : [];

    const filteredVillages = selectedMandal
        ? villages.filter(v => v.mandalId === selectedMandal)
        : [];


    const handleSubmit = async () => {
        try {
            await form.validateFields();
            const values = form.getFieldsValue();
            setIsLoading(true);

            const data = isEditMode ? {
                ...farmer,
                ...values,
                name: values.farmerName,

                districtName: districts.find(d => d.value === values.districtId)?.label,
                mandalName: mandals.find(m => m.value === values.mandalId)?.label,
                villageName: villages.find(v => v.value === values.villageId)?.label,
                status: values.status || 1
            } : {
                ...values,
                name: values.farmerName,

                districtName: districts.find(d => d.value === values.districtId)?.label,
                mandalName: mandals.find(m => m.value === values.mandalId)?.label,
                villageName: villages.find(v => v.value === values.villageId)?.label,
                status: values.status || 1
            };

            const response = await axios.post(
                API_URLS.ADD_UPDATE_FARMER,
                data,
                { headers: apiHeader }
            );

            if (response.data.status === 1) {
                message.success(response.data.mssg);
                onSuccess();
                onCancel();
            } else {
                if (response.data.mssg.includes('mobile number')) {
                    message.error('Mobile number already exists. Please use a different number.');
                } else {
                    message.error(response.data.mssg || `Failed to ${isEditMode ? 'update' : 'add'} farmer`);
                }
            }
        } catch (error) {
            if (error.response && error.response.data && error.response.data.mssg) {
                message.error(error.response.data.mssg);
            } else {
                message.error('An error occurred. Please try again.');
            }
            console.error('API Error:', error);
        } finally {
            setIsLoading(false);
        }
    };
    return (
        <Modal
            title={isEditMode ? "Edit Farmer" : "Add Farmer"}
            open={open}
            onCancel={onCancel}
            footer={[
                <Button key="back" onClick={onCancel}>
                    Cancel
                </Button>,
                <Button
                    key="submit"
                    type="primary"
                    loading={isLoading}
                    onClick={handleSubmit}
                >
                    {isEditMode ? "Update" : "Add"}
                </Button>,
            ]}
            width={500}
            destroyOnClose

        >
            <Card
                style={{ height: '400px', overflowY: 'auto', overflowX: "hidden" }}
            >
                <Form
                    form={form}
                    layout="horizontal"
                    labelCol={{ span: 7 }}
                    wrapperCol={{ span: 16 }}
                >
                    <Row gutter={16}>
                        <Col span={24}>
                            <Form.Item
                                name="farmerName"
                                label="Name"
                                rules={[{ required: true, message: 'Please enter name' }]}
                            >
                                <Input placeholder="Enter name" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={24}>
                            <Form.Item
                                name="mobileNumber"
                                label="Mobile Number"
                                rules={[
                                    { pattern: /^[6-9][0-9]{9}$/, message: 'Please enter valid 10 digit Indian mobile number' }
                                ]}
                            >
                                <Input placeholder="Enter mobile number" maxLength={10} />
                            </Form.Item>
                        </Col>
                    </Row>



                    <Row gutter={16}>
                        <Col span={24}>
                            <Form.Item
                                name="email"
                                label="Email"
                                rules={[
                                    { type: 'email', message: 'Please enter valid email' }
                                ]}
                            >
                                <Input placeholder="Enter email" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={24}>
                            <Form.Item
                                name="password"
                                label="Password"
                                rules={[{ required: true, message: 'Please enter password' }]}
                            >
                                <Input.Password placeholder="Enter password" />
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={24}>
                            <Form.Item
                                name="districtId"
                                label="District"
                                rules={[{ required: true, message: 'Please select district' }]}
                            >
                                <Select
                                    placeholder="Select District"
                                    onChange={handleDistrictChange}
                                    allowClear
                                    loading={districts.length === 0}
                                    showSearch
                                    optionFilterProp="children"
                                    filterOption={(input, option) =>
                                        (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
                                    }
                                >
                                    {districts.map(district => (
                                        <Option key={district.value} value={district.value}>
                                            {district.label}
                                        </Option>
                                    ))}

                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={24}>
                            <Form.Item
                                name="mandalId"
                                label="Mandal"
                                rules={[{ required: true, message: 'Please select mandal' }]}
                            >
                                <Select
                                    placeholder="Select Mandal"
                                    onChange={handleMandalChange}
                                    disabled={!selectedDistrict}
                                    loading={filteredMandals.length === 0 && selectedDistrict}
                                    showSearch
                                    optionFilterProp="children"
                                    filterOption={(input, option) =>
                                        (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
                                    }
                                >
                                    {filteredMandals.map(mandal => (
                                        <Option key={mandal.value} value={mandal.value}>
                                            {mandal.label}
                                        </Option>
                                    ))}
                                    showSearch
                                    optionFilterProp="children"
                                    filterOption={(input, option) =>
                                        (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
                                    }
                                </Select>
                            </Form.Item>
                        </Col>
                    </Row>

                    <Row gutter={16}>
                        <Col span={24}>
                            <Form.Item
                                name="villageId"
                                label="Village"
                                rules={[{ required: true, message: 'Please select village' }]}
                            >
                                <Select
                                    placeholder="Select Village"
                                    disabled={!selectedMandal}
                                    loading={filteredVillages.length === 0 && selectedMandal}
                                    showSearch
                                    optionFilterProp="children"
                                    filterOption={(input, option) =>
                                        (option?.children ?? '').toLowerCase().includes(input.toLowerCase())
                                    }
                                >
                                    {filteredVillages.map(village => (
                                        <Option key={village.value} value={village.value}>
                                            {village.label}
                                        </Option>
                                    ))}
                                </Select>
                            </Form.Item>
                            <Form.Item
                                label="Status"
                                name="status"
                                rules={[{ required: true, message: 'Please select status' }]}
                            >
                                <Radio.Group>
                                    <Radio value={1}>Active</Radio>
                                    <Radio value={0}>Deactive</Radio>
                                </Radio.Group>
                            </Form.Item>
                        </Col>
                    </Row>
                </Form>
            </Card>
        </Modal>
    );
};

export default FarmerModal;