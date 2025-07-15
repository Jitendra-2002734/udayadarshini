import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Typography, Form, Input, Button, Select, Table, message, Space, Modal, Spin, Tag, Empty, Radio, Tooltip } from 'antd';
import axios from 'axios';
import { ReloadOutlined, EditOutlined } from '@ant-design/icons';
import { API_URLS, LOCAL_STORAGE_CONSTANTS } from '../configure/MyUtilsConfig';
import { useOutletContext } from 'react-router-dom';

import LogoutComponent from '../logout/LogoutComponent';


let localDataList = [];
const { TextArea } = Input;
const Mandal = () => {
    const [form] = Form.useForm();
    const [selectedMandalsVariety, setSelectedMandalsVariety] = useState(null);
    const [isSessionExpiredVisible, setIsSessionExpiredVisible] = useState(false);
    const [isNew, setIsNew] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [dataList, setDataList] = useState([]);
    const [refresh, setRefresh] = useState(0);
    const { apiHeader } = useOutletContext();
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(5);
    const [searchInput, setSearchInput] = useState('');
    const [allMandals, setAllMandals] = useState([]);
    const [filteredList, setFilteredList] = useState([])
    const [isLoadingMandals, setIsLoadingMandals] = useState(false);
    const [isMandalsLoaded, setIsMandalsLoaded] = useState(false);
    const [dataMap, setDataMap] = useState({});


    useEffect(() => {
        fetchAllMandalsDetails();
        fetchMasterdata();
    }, [refresh]);

    const fetchMasterdata = async () => {
        try {
            setIsLoadingMandals(true);
            const response = await axios.get(API_URLS.GET_DISTRICTS, { headers: apiHeader });

            if (response.data.status === 1) {
                const tempDistrictsList = response.data.content.map(obj => ({
                    key: obj.uuid,
                    label: obj.name,
                    value: obj.uuid,
                }));
                setAllMandals(tempDistrictsList);
                let tempMap = new Map();
                addKeyValuePair(tempMap, tempDistrictsList);
                setDataMap(tempMap);

                setIsMandalsLoaded(true);
            } else {
                message.error("No valid Mandal data found.");
            }
        } catch (error) {
            message.error('Failed to fetch Mandal data.');
            console.error('Fetch Mandal data error:', error);
        } finally {
            setIsLoadingMandals(false);
        }
    };

    const addKeyValuePair = (map, list) => {
        list.forEach(obj => {
            map[obj.key] = obj.label;
        });
    };


    const fetchAllMandalsDetails = async () => {
        setIsLoading(true);
        try {
            const res = await axios.get(API_URLS.GET_MANDAL, { headers: apiHeader });
            if (res?.data?.status === 1) {
                const content = res.data.content;
                localDataList = content;
                setDataList(content);
            } else if (res.data.status === 2) {
                setIsSessionExpiredVisible(true);
            } else {
                message.error(res?.data?.mssg || 'Failed to fetch details.');
            }
        } catch (error) {
            message.error('Failed to fetch details.');
        } finally {
            setIsLoading(false);
        }
    };

    const onFinish = async (values) => {
        const info = JSON.parse(localStorage.getItem(LOCAL_STORAGE_CONSTANTS));

        const MandalsVarietyObj = isNew
            ? { ...values, createdBy: info?.uuid, districtId: values.districtId }
            : { ...selectedMandalsVariety, ...values, createdBy: info?.uuid, districtId: values.districtId };
        setIsLoading(true);
        try {
            const res = await axios.post(API_URLS.ADD_UPDATE_MANDALS, MandalsVarietyObj, { headers: apiHeader });
            if (res.data.status === 1) {
                fetchAllMandalsDetails();
                message.success(res.data.mssg);
                form.resetFields();
                setSelectedMandalsVariety(null);
                setIsNew(true);
                setSearchInput("");
            } else if (res.data.status === 2) {
                setIsSessionExpiredVisible(true);
            } else {
                message.error("" + res.data.mssg);
            }
        } catch (error) {
            message.error(error.response ? error.response.data.mssg : error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleEdit = (record) => {
        setSelectedMandalsVariety(record);
        setIsNew(false);
        form.setFieldsValue({
            name: record.name,
            districtId: record.districtId,
            code: record.code,
            status: record.status,
        });
    };

    const confirmReset = () => {
        Modal.confirm({
            title: 'Are you sure you want to reset the form?',
            onOk() {
                form.resetFields();
                setSelectedMandalsVariety(null);
                setIsNew(true);
            },
        });
    };

    const columns = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            render: (text) => {
                const displayText = text || "---";
                return (
                    <Tooltip title={displayText} placement="top">
                        <div style={{
                            display: '-webkit-box',
                            WebkitBoxOrient: 'vertical',
                            WebkitLineClamp: 2,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'normal',
                            wordBreak: 'break-word',
                            maxHeight: '3em',
                            lineHeight: '1.5em'
                        }}>
                            {displayText}
                        </div>
                    </Tooltip>
                );
            }


        },
        {
            title: 'District Name',
            dataIndex: 'districtName',
            key: 'districtName',
            render: (text) => text || "---"

        },



        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => (
                status === 1 ? (
                    <Tag style={{ fontSize: '14px' }} bordered={false} color="success">
                        Active
                    </Tag>
                ) : (
                    <Tag style={{ fontSize: '14px' }} bordered={false} color="error">
                        Deactive
                    </Tag>
                )
            ),
        },
        {
            title: 'Action',
            key: 'action',
            render: (_, record) => (
                <Space size="middle">
                    <Tooltip title="Edit Mandals Variety">
                        <Button type="link" icon={<EditOutlined style={{ fontSize: '14px' }} />} onClick={() => handleEdit(record)} />
                    </Tooltip>
                </Space>
            ),
        },
    ];

    const handleMandalsChange = (selecteddistrictId) => {
        setSearchInput('');

        if (selecteddistrictId) {
            const filteredMandals = localDataList.filter(item => item.districtId === selecteddistrictId);
            setDataList(filteredMandals);
            setFilteredList(filteredMandals);
        } else {
            setDataList(localDataList);
            setFilteredList(localDataList);
        }
    };

    const changeEdtSearch = (searchWord) => {
        if (!searchWord) {
            setDataList(filteredList.length > 0 ? filteredList : localDataList);
        } else {
            let searchResults = (filteredList.length > 0 ? filteredList : localDataList).filter((item) =>
                item.name.toLowerCase().includes(searchWord.toLowerCase())
            );
            setDataList(searchResults);
        }
    };

    const changeEdtSearchRaw = (evt) => {
        let searchWord = evt.target.value;
        setSearchInput(searchWord);
        changeEdtSearch(searchWord);
    };




    const listHeaderSearchUI = () => {
        return (
            <div>
                <Row gutter={[10, 3]}>
                    <Col flex={2}>
                        <Form form={form} colon={false}>
                            <Form.Item style={{ fontWeight: 400 }} name='districtId1'>
                                <Select
                                    showSearch
                                    placeholder="Select District"
                                    onChange={handleMandalsChange}
                                    allowClear
                                    style={{ width: '100%' }}
                                    filterOption={(input, option) =>
                                        (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                                    }
                                    options={
                                        isLoadingMandals
                                            ? [{
                                                label: (
                                                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                                                        <Spin />
                                                    </div>
                                                ),
                                                value: "loading",
                                                disabled: true
                                            }]
                                            : allMandals
                                    }
                                    loading={isLoadingMandals}
                                    onDropdownVisibleChange={(open) => {
                                        if (open && !isMandalsLoaded) {
                                            fetchMasterdata();
                                        }
                                    }}
                                />
                            </Form.Item>
                        </Form>
                    </Col>
                    <Col flex={2}>
                        <Input.Search
                            size="middle"
                            placeholder="Search"
                            allowClear
                            value={searchInput}
                            onChange={(evt) => {
                                setSearchInput(evt.target.value);
                                changeEdtSearchRaw(evt);
                            }}
                            onSearch={changeEdtSearch}
                        />
                    </Col>
                    <Col flex={1}>
                        <Button
                            size="middle"
                            onClick={() => {
                                setSearchInput('');
                                form.setFieldsValue({ 'districtId1': undefined });
                                setRefresh(refresh + 1);
                                setCurrentPage(1);
                                form.setFieldsValue({ 'districtId': undefined });
                            }}
                            icon={<ReloadOutlined />}
                        />
                    </Col>
                    <Col flex={2}></Col>
                </Row>
            </div>
        );
    };

    return (
        <>
            <Row gutter={[16, 16]}>
                <Col xs={24} sm={24} md={24} lg={16} xl={16}>
                    <Typography.Title level={4}>{'Masters >> Mandals'}</Typography.Title>
                    <Card>
                        <div style={{ marginBottom: '20px' }}>{listHeaderSearchUI()}</div>
                        {isLoading ? (
                            <Spin tip="Loading...">
                                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                            </Spin>
                        ) : (
                            <Table
                                dataSource={dataList}
                                columns={columns}
                                size="small"
                                rowKey="uuid"
                                pagination={{
                                    current: currentPage,
                                    total: dataList.length,
                                    pageSize: pageSize,
                                    pageSizeOptions: ['5', '10', '15', '20'],
                                    showSizeChanger: true,
                                    onChange: (page, newPageSize) => {
                                        if (pageSize !== newPageSize) {
                                            setCurrentPage(1);
                                        } else {
                                            setCurrentPage(page);
                                        }
                                        setPageSize(newPageSize);
                                    },
                                }}
                            />
                        )}
                    </Card>
                </Col>
                <Col xs={24} sm={24} md={24} lg={8} xl={8}>
                    <Typography.Title level={4}>Add / Edit Mandal</Typography.Title>
                    <Card>
                        <Form
                            form={form}
                            name="basic"
                            size="middle"
                            layout="vertical"
                            initialValues={{ status: 1 }}
                            onFinish={onFinish}
                        >
                            <Form.Item
                                label="Name"
                                name="name"
                                colon={false}
                                rules={[{ required: true, message: 'Please enter Mandal Name' }]}
                            >
                                <Input maxLength={70} placeholder="Enter Mandal Name" />

                            </Form.Item>

                            <Form.Item
                                label="District"
                                name="districtId"
                                colon={false}
                                rules={[{ required: true, message: 'Select District' }]}
                            >
                                <Select
                                    filterOption={(input, option) =>
                                        (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                                    }
                                    showSearch
                                    placeholder="Select District"
                                    allowClear
                                    style={{ width: '100%' }}

                                    options={
                                        isLoadingMandals
                                            ? [{
                                                label: (
                                                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                                                        <Spin />
                                                    </div>
                                                ),
                                                value: "loading",
                                                disabled: true
                                            }]
                                            : allMandals
                                    }
                                    loading={isLoadingMandals}
                                    onDropdownVisibleChange={(open) => {
                                        if (open && !isMandalsLoaded) {
                                            fetchMasterdata();
                                        }
                                    }}
                                />
                            </Form.Item>


                            <Form.Item
                                label="Status"
                                name="status"
                                colon={false}
                                rules={[{ required: true, message: 'Please Select Status' }]}
                            >
                                <Radio.Group>
                                    <Radio value={1}>Active</Radio>
                                    <Radio value={0}>Deactive</Radio>
                                </Radio.Group>
                            </Form.Item>
                            <Form.Item wrapperCol={{ offset: 8 }}>
                                <Space>
                                    <Button onClick={confirmReset}>Reset</Button>
                                    <Button type="primary" htmlType="submit" loading={isLoading}>
                                        {isNew ? 'Add' : 'Update'}
                                    </Button>
                                </Space>
                            </Form.Item>
                        </Form>
                    </Card>
                </Col>
            </Row>

            <LogoutComponent open={isSessionExpiredVisible} />
        </>
    );
};

export default Mandal;