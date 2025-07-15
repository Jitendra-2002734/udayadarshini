import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Typography, Form, Input, Button, Select, Table, message, Space, Modal, Spin, Tag, Empty, Radio } from 'antd';
import axios from 'axios';
import { ReloadOutlined, EditOutlined } from '@ant-design/icons';
import { API_URLS, LOCAL_STORAGE_CONSTANTS } from '../configure/MyUtilsConfig';
import { useOutletContext } from 'react-router-dom';
import LogoutComponent from '../logout/LogoutComponent';

let localDataList = [];
const { TextArea } = Input;
const Village = () => {
    const [form] = Form.useForm();
    const [selectedVillagesVariety, setSelectedVillagesVariety] = useState(null);
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
    const [allMandals, setAllMandals] = useState([]);
    const [filteredList, setFilteredList] = useState([]);
    const [isLoadingDistricts, setIsLoadingDistricts] = useState(false);
    const [isLoadingMandals, setIsLoadingMandals] = useState(false);
    const [dataMap, setDataMap] = useState({});
    const formBoxStyle = { fontSize: 12, fontWeight: 500, width: '180px' };

    useEffect(() => {
        fetchAllVillagesDetails();
        fetchMastersData();
    }, [refresh]);

    const fetchMastersData = async () => {
        try {
            setIsLoadingDistricts(true);
            const response = await axios.get(API_URLS.GET_DISTRICTS, { headers: apiHeader });
             const tempDistrictList= response.data.content.map(obj => ({
                    key: obj.uuid,
                    label: obj.name,
                    value: obj.uuid,
                }));
                setAllDistricts(tempDistrictList);
            const mandalResponse = await axios.get(API_URLS.GET_MANDAL, { headers: apiHeader });
               const tempMandalsList= mandalResponse.data.content.map(obj => ({
                    key: obj.uuid,
                    label: obj.name,
                    value: obj.uuid,
                }));
            let tempMap = new Map();
            addKeyValuePair(tempMap, tempDistrictList);
            addKeyValuePair(tempMap, tempMandalsList);
            setDataMap(tempMap);
        
        } catch (error) {
            message.error('Failed to fetch data.');
            console.error(error);
        } finally {
            setIsLoadingDistricts(false);
        }
    };

    const addKeyValuePair = (map, list) => {
        list.forEach(obj => {
          map[obj.key] = obj.label;
        });
      };

      
    const fetchMandalsData = async (districtId) => {
        try {
            setIsLoadingMandals(true);
            const response = await axios.get(`${API_URLS.GET_MANDAL}?districtId=${districtId}`, {
                headers: apiHeader
            });
            if (response.data.status === 1) {
                setAllMandals(response.data.content.map(obj => ({
                    key: obj.uuid,
                    label: obj.name,
                    value: obj.uuid,
                })));
            }
        } catch (error) {
            message.error('Failed to fetch Mandal data.');
        } finally {
            setIsLoadingMandals(false);
        }
    };

    const fetchAllVillagesDetails = async () => {
        setIsLoading(true);
        try {
            const res = await axios.get(API_URLS.GET_VILLAGES, { headers: apiHeader });
            if (res?.data?.status === 1) {
                localDataList = res.data.content;
                setDataList(res.data.content);
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
        const info = JSON.parse(localStorage.getItem(LOCAL_STORAGE_CONSTANTS.USER_INFO));
        const VillagesVarietyObj = isNew
            ? { ...values, createdBy: info?.uuid, }
            : { ...selectedVillagesVariety, ...values, createdBy: info?.uuid,};

        setIsLoading(true);
        try {
            const res = await axios.post(API_URLS.ADD_UPDATE_VILLAGES, VillagesVarietyObj, { headers: apiHeader });
            if (res.data.status === 1) {
                fetchAllVillagesDetails();
                message.success(res.data.mssg);
                form.resetFields(['name']);
                setSelectedVillagesVariety(null);
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
        setSelectedVillagesVariety(record);
        setIsNew(false);
        form.setFieldsValue({
            name: record.name,
            districtId: record.districtId,
            mandalId: record.mandalId,
            status: record.status,
        });
        fetchMandalsData(record.districtId);
    };

    const confirmReset = () => {
        Modal.confirm({
            title: 'Are you sure you want to reset the form?',
            onOk() {
                        form.setFieldsValue({name:undefined, mandalId: undefined, districtId: undefined ,status:undefined });
                setSelectedVillagesVariety(null);
                setIsNew(true);
                setAllMandals([]);
            },
        });
    };

    const columns = [
        {
            title: 'Name',
            dataIndex: 'name',
            key: 'name',
            render: (text) => text || "---"
        },
        {
            title: 'District',
            dataIndex: 'districtName',
            key: 'districtId',
              render: (text) => text || "---"
        },
        {
            title: 'Mandal',
            dataIndex: 'mandalName',
            key: 'mandalName',
             render: (text) => text || "---"
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status) => (
                status === 1 ? (
                    <Tag color="success">Active</Tag>
                ) : (
                    <Tag color="error">Deactive</Tag>
                )
            ),
        },
        {
            title: 'Action',
            key: 'action',
            render: (_, record) => (
                <Space size="middle">
                    <Button
                        type="link"
                        icon={<EditOutlined />}
                        onClick={() => handleEdit(record)}
                    />
                </Space>
            ),
        },
    ];

    
    const handleSearchDistrictChange = async (districtId) => {
        form.setFieldsValue({searchMandalId:undefined});
        if (districtId) {
            const filteredMandals = localDataList.filter(item => item.districtId === districtId);
            setDataList(filteredMandals);
            setFilteredList(filteredMandals);

        try {
            setIsLoadingMandals(true);
            const res = await axios.get(API_URLS.GET_MANDALS_BY_DISTRICTID + districtId);
            if (res.data.status === 1) {
                setAllMandals(res.data.content.map(obj => ({
                    key: obj.uuid,
                    label: obj.name,
                    value: obj.uuid,
                })));
            } else {
                message.error("" + res.data.mssg);
            }
        } catch (error) {
            message.error('Failed to fetch Mandal data.');
            console.error(error);
        } finally {
            setIsLoadingMandals(false);
        }
    }
        else {
            setDataList(localDataList);
            setFilteredList(localDataList);
        }
    };

    const handleDistrictChange = async (districtId) => {
        form.setFieldsValue({mandalId:undefined});
        if (districtId) {
           
        try {
            setIsLoadingMandals(true);
            const res = await axios.get(API_URLS.GET_MANDALS_BY_DISTRICTID + districtId);
            if (res.data.status === 1) {
                setAllMandals(res.data.content.map(obj => ({
                    key: obj.uuid,
                    label: obj.name,
                    value: obj.uuid,
                })));
            } else {
                message.error("" + res.data.mssg);
            }
        } catch (error) {
            message.error('Failed to fetch Mandal data.');
            console.error(error);
        } finally {
            setIsLoadingMandals(false);
        }
    }
        else {
            setDataList(localDataList);
            setFilteredList(localDataList);
        }
    };

    const handleMandalChange = (selecteddistrictId) => {
        setSearchInput('');

        if (selecteddistrictId) {
            const filteredMandals = localDataList.filter(item => item.mandalId === selecteddistrictId);
            setDataList(filteredMandals);
            setFilteredList(filteredMandals);

        } 
    };
    const changeEdtSearchRaw = (evt) => {
        let searchWord = evt.target.value;
        setSearchInput(searchWord);
        changeEdtSearch(searchWord);
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
    const listHeaderSearchUI = () => {
        return (
                <Row gutter={[10, 16]}>
                    <Col >
                    <Form form={form} colon={false}>
                            <Form.Item name="searchDistrictId">
                                <Select
                                 filterOption={(input, option) =>
                                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                                }
                                    placeholder="Select district"
                                    allowClear
                                    showSearch
                                    style={formBoxStyle}
                                    options={allDistricts}
                                    loading={isLoadingDistricts}
                                    onChange={handleSearchDistrictChange}
                                />
                            </Form.Item>
                            </Form>
                            </Col>
                            <Col>
                            <Form form={form} colon={false}>
                            <Form.Item name="searchMandalId">
                                <Select
                                 filterOption={(input, option) =>
                                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                                }
                                    placeholder="Select mandal"
                                    allowClear
                                    style={formBoxStyle}
                                    showSearch
                                    options={allMandals}
                                    loading={isLoadingMandals}
                                    disabled={!form.getFieldValue('searchDistrictId')}
                                    onChange={handleMandalChange}
                                />
                            </Form.Item>
                        </Form>
                    </Col>
                    <Col >
                        <Input.Search
                            placeholder="Search villages"
                            allowClear
                            value={searchInput}
                            onChange={(evt) => {
                                setSearchInput(evt.target.value);
                                changeEdtSearchRaw(evt);
                            }}
                            onSearch={() => {
                                const filtered = localDataList.filter(item =>
                                    item.name.toLowerCase().includes(searchInput.toLowerCase())
                                );
                                setDataList(filtered);
                            }}
                        />
                    </Col>
                    <Col flex={1}>
                        <Button
                            icon={<ReloadOutlined />}
                            onClick={() => {
                                setSearchInput('');
                                form.resetFields(['searchDistrictId', 'searchMandalId']);
                                
                                form.resetFields(['mandalId', 'districtId']);
                                setRefresh(refresh + 1);
                            }}
                        />
                    </Col>
                </Row>
        );
    };

    return (
        <>
            <Row gutter={[16, 16]}>
                <Col xs={24} sm={24} md={24} lg={16} xl={16}>
                    <Typography.Title level={4}>Masters &gt;&gt; Villages</Typography.Title>
                    <Card>
                        <div  style={{marginBottom:"5px"}}>{listHeaderSearchUI()}</div>
                        {isLoading ? (
                            <Spin tip="Loading...">
                                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                            </Spin>
                        ) : (
                            <Table
                                dataSource={dataList}
                                columns={columns}
                                rowKey="uuid"
                                pagination={{
                                    current: currentPage,
                                    pageSize: pageSize,
                                    total: dataList.length,
                                    showSizeChanger: true,
                                    pageSizeOptions: ['5', '10', '15', '20'],
                                    onChange: (page, size) => {
                                        setCurrentPage(page);
                                        setPageSize(size);
                                    }
                                }}
                            />
                        )}
                    </Card>
                </Col>
                <Col xs={24} sm={24} md={24} lg={8} xl={8}>
                    <Typography.Title level={4}>Add / Edit Village</Typography.Title>
                    <Card>
                        <Form
                            form={form}
                            name="basic"
                            initialValues={{ status: 1 }}

                            onFinish={onFinish}
                            layout="vertical" 
                        >
                            <Form.Item
                                label="Name"
                                name="name"
                                rules={[{ required: true, message: 'Please enter village name' }]}
                            >
                                <Input maxLength={70} placeholder="Enter village name" />
                            </Form.Item>
                            <Form.Item
                                label="District"
                                name="districtId"
                                rules={[{ required: true, message: 'Please select district' }]}
                            >
                                <Select
                                 filterOption={(input, option) =>
                                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                                }
                                showSearch
                                    placeholder="Select district"
                                    options={allDistricts}
                                    loading={isLoadingDistricts}
                                    onChange={handleDistrictChange}
                                />
                            </Form.Item>
                            <Form.Item
                                label="Mandal"
                                name="mandalId"
                                rules={[{ required: true, message: 'Please select mandal' }]}
                            >
                                <Select
                                 filterOption={(input, option) =>
                                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                                }
                                showSearch
                                    placeholder="Select mandal"
                                    options={allMandals}
                                    loading={isLoadingMandals}
                                    disabled={!form.getFieldValue('districtId')}
                                />
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

export default Village;