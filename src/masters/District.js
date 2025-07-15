import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Typography, Form, Input, Button, Table, message, Space, Modal, Spin, Tag, Empty, Radio, Tooltip } from 'antd';
import axios from 'axios';
import { ReloadOutlined, EditOutlined } from '@ant-design/icons';
import { API_URLS, LOCAL_STORAGE_CONSTANTS } from '../configure/MyUtilsConfig';
import { useOutletContext } from 'react-router-dom';
import LogoutComponent from '../logout/LogoutComponent';


const TELANGANA_STATE = {
    id: "Y1c0ecd68-e9c5-4d66-ace1-17e5e44bf160",
    name: "Telangana"
};


let localDataList = [];
const { TextArea } = Input;
const District = () => {
    const [form] = Form.useForm();
    const [selectedDistrictsVariety, setSelectedDistrictsVariety] = useState(null);
    const [isSessionExpiredVisible, setIsSessionExpiredVisible] = useState(false);
    const [isNew, setIsNew] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [dataList, setDataList] = useState([]);
    const [refresh, setRefresh] = useState(0);
    const { apiHeader } = useOutletContext();
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(5);
    const [searchInput, setSearchInput] = useState('');
    const [allDistricts, setAllDistricts] = useState([]);
    const [filteredList, setFilteredList] = useState([])


    useEffect(() => {
        fetchAllDistrictsDetails();
    }, [refresh]);




    const fetchAllDistrictsDetails = async () => {
        setIsLoading(true);
        try {
            const res = await axios.get(API_URLS.GET_DISTRICTS, { headers: apiHeader });
            if (res?.data?.status === 1) {
                const content = res.data.content;

                const uniqueDistrictsMap = new Map(
                    content.map(obj => [obj.stateId, { key: obj.stateId, label: obj.zoneName, value: obj.stateId }])
                );
                const tempDistrictsList = Array.from(uniqueDistrictsMap.values());
                setAllDistricts(tempDistrictsList);

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
        const districtObj = {
            ...values,
            createdBy: info?.uuid,
        };
        const DistrictsVarietyObj = isNew
            ? { ...values, createdBy: info?.uuid, }
            : { ...selectedDistrictsVariety, ...values, createdBy: info?.uuid };
        setIsLoading(true);
        try {
            const res = await axios.post(API_URLS.ADD_UPDATE_DISTRICTS, DistrictsVarietyObj, { headers: apiHeader });
            if (res.data.status === 1) {
                fetchAllDistrictsDetails();
                message.success(res.data.mssg);
                form.resetFields(['name', 'code']);
                setSelectedDistrictsVariety(null);
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
        setSelectedDistrictsVariety(record);
        setIsNew(false);
        form.setFieldsValue({
            name: record.name,
            stateId: record.stateId,
            code: record.code,
            status: record.status,
        });
    };

    const confirmReset = () => {
        Modal.confirm({
            title: 'Are you sure you want to reset the form?',
            onOk() {
                form.resetFields();
                setSelectedDistrictsVariety(null);
                setIsNew(true);
            },
        });
    };

    const columns = [


        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            render: (text) => text ? text : "---"

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
                    <Tooltip title="Edit Districts Variety">
                        <Button type="link" icon={<EditOutlined style={{ fontSize: '14px' }} />} onClick={() => handleEdit(record)} />
                    </Tooltip>
                </Space>
            ),
        },
    ];



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
                                form.setFieldsValue({ 'parentId1': undefined });
                                setRefresh(refresh + 1);
                                setCurrentPage(1);
                                form.setFieldsValue({ stateId: undefined });
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
                    <Typography.Title level={4}>{'Masters >> Districts'}</Typography.Title>
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
                    <Typography.Title level={4}>Add / Edit District</Typography.Title>
                    <Card>
                        <Form
                            form={form}
                            name="basic"
                            size="middle"
                            initialValues={{ status: 1 }}
                            onFinish={onFinish}
                            layout="vertical"
                        >
                            <Form.Item
                                label="Name"
                                name="name"
                                colon={false}
                                rules={[{ required: true, message: 'Please enter District Name' }]}
                            >
                                <Input maxLength={70} placeholder="Enter District Name" />
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

export default District;