import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Typography, Form, Radio, Input, Button, Table, message, Space, Spin, Tag, Empty, Upload, Tooltip, Select, Modal, FloatButton } from 'antd';
import axios from 'axios';
import { API_URLS, LOCAL_STORAGE_CONSTANTS } from '../configure/MyUtilsConfig';
import { ReloadOutlined, EditOutlined, DownloadOutlined, ArrowUpOutlined, FileOutlined, DeleteOutlined } from '@ant-design/icons';
import { useOutletContext } from 'react-router-dom';
import LogoutComponent from '../logout/LogoutComponent';
import dayjs from 'dayjs';

let localDataList = [];
const CropAdvisory = () => {

    const { apiHeader } = useOutletContext();
    const [form] = Form.useForm();
    const [isLoading, setIsLoading] = useState(false);
    const [profileData, setProfileData] = useState(null);
    const [isExistingUser, setIsExistingUser] = useState(false);
    const [isSessionExpiredVisible, setIsSessionExpiredVisible] = useState(false);
    const [refresh, setRefresh] = useState(0);
    const [dataList, setDataList] = useState([]);
    const [assignLobby, setAssignLobby] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const [viewInfo, setViewInfo] = useState({});
    const [openViewModel, setOpenViewModel] = useState(false);
    const [openUploadImageView, setOpenUploadImageView] = useState(false);
    const [storeImageUrl, setStoreImageUrl] = useState(null);
    const [storeRecordUuid, setStoreRecordUuid] = useState(null);
    const [uploadImageFiles, setUploadImageFile] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(5);

    useEffect(() => {
        fetchAllUsers();
    }, [refresh]);

    useEffect(() => {
        if (profileData) {
            form.setFieldsValue(profileData);
        }
    }, [profileData, form]);

    const fetchAllUsers = async () => {
        setIsLoading(true);
        try {
            const res = await axios.get(API_URLS.CROP_ADVISORY_GET_ALL, { headers: apiHeader });
            if (res?.data?.status === 1) {
                const content = res.data.content;
                localDataList = content;
                setDataList(content);
            }
            else if (res.data.status === 2) {
                setIsSessionExpiredVisible(true)
            } else {
                message.error(res?.data?.mssg);
            }
        } catch (error) {
            message.error('Failed to fetch details.');
        } finally {
            setIsLoading(false);
        }
    };

    const onFinish = async (values) => {

        const info = JSON.parse(localStorage.getItem(LOCAL_STORAGE_CONSTANTS.USER_INFO));
        const userObject = isExistingUser
            ? {
                ...profileData, ...values, createdBy: info?.uuid, divId: info?.divId, thumbNail: uploadImageFiles
            }
            : { ...values, status: values.status ?? 1, thumbNail: uploadImageFiles, createdBy: info?.uuid, divId: info?.divId, depot: values?.depot };
        setIsLoading(true);
        try {
            const res = await axios.post(API_URLS.CROP_ADVISORY_ADD_UPDATE, userObject, { headers: apiHeader });
            if (res.data.status === 200 || res.data.status === 1) {
                fetchAllUsers();
                message.success(res.data.mssg);
                handleReset();
                setSearchInput("")
            } else if (res.data.status === 2) {
                setIsSessionExpiredVisible(true)
            } else {
                message.error("" + res.data.mssg);
            }
        } catch (error) {
            message.error(error.response ? error.response.data.mssg : error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const onFinishFailed = (errorInfo) => {
        console.log('Failed:', errorInfo);
    };


    const handleEdit = (record) => {
        setUploadImageFile(record.thumbNail);
        if (record.thumbNail) {
            setOpenUploadImageView(true);
        } else {
            setOpenUploadImageView(false);
        }
        setStoreImageUrl(record.thumbNail);
        setStoreRecordUuid(record.uuid);
        setIsExistingUser(true);
        form.setFieldsValue(record);
        setAssignLobby(record.roleId);
        setProfileData(record);
    };

    const handleReset = () => {
        form.resetFields();
        setProfileData(null);
        setIsExistingUser(false);
    };

    const confirmReset = () => {
        Modal.confirm({
            title: 'Are you sure you want to reset the form?',
            onOk() {
                handleReset();
            }
        });
    };
    const getYouTubeId = (url) => {
        if (!url) return null;
        if (/^[a-zA-Z0-9_-]{11}$/.test(url)) {
            return url;
        }
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    };
    const columns = [


        {
            title: 'Date',
            dataIndex: 'createdDate',
            key: 'createdDate',
            width: 100,
            sorter: (a, b) => {
                const dateA = a.createdDate ? dayjs(a.createdDate).valueOf() : 0;
                const dateB = b.createdDate ? dayjs(b.createdDate).valueOf() : 0;
                return dateA - dateB;
            },
            defaultSortOrder: 'descend',
            render: (text) => text ? dayjs(text).format('HH:mm DD-MMM-YYYY') : '---'
        },


        {
            title: 'Title',
            dataIndex: 'title',
            key: 'title',
            width: 140,
            render: (text) => text ? text : '---',
        },

        {
            title: 'YouTube Video',
            dataIndex: 'youTubeId',
            key: 'youTubeId',
            width: 100,
            render: (youTubeId, record) => {
                const youtubeId = getYouTubeId(youTubeId);
                return youtubeId ? (
                    <Button
                        type="link"
                        onClick={() => window.open(`https://www.youtube.com/watch?v=${youtubeId}`, '_blank')}
                        style={{ padding: 0 }}
                    >
                        <div style={{ display: 'flex', alignItems: 'center' }}>


                            <Tag color='blue'>
                                <span>View</span>
                            </Tag>
                        </div>

                    </Button>
                ) : '---';
            },
        },
        {
            title: 'Thumbnail Image',
            dataIndex: 'thumbNail',
            key: 'thumbNail',
            width: 100,
            render: (imgUrl) => (
                imgUrl ? (
                    <Button
                        type="link"
                        icon={<FileOutlined />}
                        onClick={() => window.open(imgUrl, '_blank')}
                    />
                ) : '---'
            ),
        },
        {
            title: 'Status',
            dataIndex: 'status',
            key: 'status',
            width: 100,
            sorter: (a, b) => a.status - b.status,
            render: (status) => (status === 1 ? <Tag style={{ fontSize: '16px' }} bordered={false} color="success">
                Active
            </Tag> : <Tag style={{ fontSize: '16px' }} bordered={false} color="error">
                Deactive
            </Tag>),
        },
        {
            title: 'Action',
            key: 'action',
            width: 100,
            fixed: 'right',
            render: (text, record) => (<>
                <Tooltip title='Edit User Details'><Button type='link' onClick={() => handleEdit(record)} icon={<EditOutlined style={{ fontSize: '14px' }} />}></Button></Tooltip>
            </>)
        },
    ];

    const viewInformation = (record) => {
        setViewInfo(record)
        setOpenViewModel(true)
    }
    const uploadProps = {
        action: API_URLS.UPLOAD_FILE_TROUGH_FOLDER_NAME,
        data: { folderName: 'CropAdvisory_Images' },
        headers: apiHeader,
        accept: "image/png, image/jpeg",
        beforeUpload: (file) => {

            const isImage = file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/gif';
            const isFileSizeValid = file.size / 1024 / 1024 <= 1;

            if (!isImage) {
                message.error('Only images are allowed.');
                return Upload.LIST_IGNORE;
            }
            else if (!isFileSizeValid) {
                message.error('File size must be less than or equal to 5 MB.');
                return Upload.LIST_IGNORE;
            }
        },
        onChange(info) {
            const { status, response } = info.file;
            if (status !== 'uploading') {
            }
            if (status === 'done') {
                let uploadedUrl = info?.file?.response?.content?.url;
                setUploadImageFile(uploadedUrl);
            } else if (status === 'error') {
                message.error(`file upload failed.`);
            }
        },
        onDrop(e) {
            console.log('Dropped files', e.dataTransfer.files);
        },
        onRemove() {
            console.log(file)
        },
    };

    const deleteImageUrl = () => {
        Modal.confirm({
            title: "Are you sure?",
            content: "Do you really want to delete this file?",
            okText: "Delete",
            cancelText: "Cancel",
            onOk: () => {
                axios.post(API_URLS.CROP_ADVISORY_DELETE_URL, { uuid: storeRecordUuid, thumbNail: storeImageUrl }, { headers: apiHeader })
                    .then((res) => {
                        if (res.data.status === 1) {
                            message.success(res.data.mssg);
                            setOpenUploadImageView(false);
                            setUploadImageFile(null);
                        } else {
                            message.error('Failed to delete file');
                        }
                    }).catch((error) => {
                        message.error('Error in deleting the file:', error);
                    });
            },
        });
    }
    const changeEdtSearch = (searchWord) => {
        if (searchWord === null || searchWord === '') {
            setDataList(localDataList);
        } else {
            let searchResults = localDataList.filter(item => {
                return (item.title?.toLowerCase().includes(searchWord.toLowerCase()) ||
                    item?.mobileNumber?.toLowerCase()?.includes(searchWord.toLowerCase()) ||
                    item?.crisId?.toLowerCase()?.includes(searchWord.toLowerCase()))
            });
            setDataList(searchResults);
        }
    };

    const changeEdtSearchRaw = (evt) => {
        let searchWord = evt.target.value;
        if (searchWord === null || searchWord === '') {
            setDataList(localDataList);
        } else {
            let searchResults = localDataList.filter(item => {
                return (item?.title?.toLowerCase().includes(searchWord.toLowerCase()) ||
                    item?.mobileNumber?.toLowerCase()?.includes(searchWord.toLowerCase()) ||
                    item?.crisId?.toLowerCase()?.includes(searchWord.toLowerCase()))
            });
            setDataList(searchResults);
        }
    };

    const listHeaderSearchUI = () => {
        return (
            <div >
                <Row gutter={[10, 3]}>
                    <Col flex={2}>
                        <Input.Search size='middle' placeholder="Search Title" allowClear
                            value={searchInput}
                            onSearch={changeEdtSearch}
                            onChange={(evt) => {
                                setSearchInput(evt.target.value);
                                changeEdtSearchRaw(evt);
                            }} />
                    </Col>
                    <Col flex={1} >
                        <Button size='middle' onClick={() => {
                            setRefresh(refresh + 1);
                            setSearchInput('');
                            setCurrentPage(1)
                        }} icon={<ReloadOutlined />}></Button>
                    </Col>
                    <Col flex={2}></Col>
                </Row>
            </div>);
    }


    return (<>
        <Row gutter={[16, 16]}>
            <Col xs={24} sm={24} md={24} lg={15} xl={15}>
                <Typography.Title level={4} >{'Masters >> Crop Advisory'}</Typography.Title>
                <Card >
                    <div style={{ marginBottom: '20px' }}>
                        {listHeaderSearchUI()}
                    </div>
                    {isLoading ? (
                        <Spin tip="Loading...">
                            <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                        </Spin>
                    ) : (
                        <Table dataSource={dataList}
                            columns={columns}
                            rowKey="uuid"
                            scroll={{ x: 600 }}
                            tableLayout='fixed'
                            pagination={{
                                current: currentPage,
                                total: dataList.length,
                                pageSize: pageSize,
                                pageSizeOptions: ['5', '10', '15', '20'],
                                showSizeChanger: 'true',
                                onChange: (page, newPageSize) => {
                                    if (pageSize != newPageSize) {
                                        setCurrentPage(1)
                                    }
                                    else {
                                        setCurrentPage(page)
                                    }
                                    setPageSize(newPageSize)
                                }
                            }} />
                    )}
                </Card>
            </Col>
            <Col xs={24} sm={24} md={24} lg={9} xl={9}>
                <Typography.Title level={4} > Add / Edit Crop Advisory</Typography.Title>
                <Card >
                    <Form
                        form={form}
                        name="profile"
                        width="100%"
                        layout="vertical"
                        colon={false}
                        initialValues={{ status: 1, actionId: 1 }}
                        onFinish={onFinish}
                        onFinishFailed={onFinishFailed}
                        autoComplete="off"
                    >

                        <Form.Item
                            label="Title"
                            name="title"
                            rules={[{ required: true, message: 'Please enter title' }]}
                        >
                            <Input placeholder="Enter title" />
                        </Form.Item>


                        <Form.Item
                            label="YouTube Id"
                            name="youTubeId"
                            rules={[
                                {
                                    required: true,
                                    message: 'Please enter YouTube ID'
                                },
                                {
                                    validator: (_, value) => {
                                        if (!value) return Promise.resolve();
                                        if (/^[a-zA-Z0-9_-]{11}$/.test(value)) {
                                            return Promise.resolve();
                                        }
                                        const youtubeRegex = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
                                        const match = value.match(youtubeRegex);
                                        if (match && match[2].length === 11) {
                                            return Promise.resolve();
                                        }
                                        return Promise.reject(new Error('Please enter a valid YouTube ID (11 characters)'));
                                    }
                                }
                            ]}
                        >
                            <Input
                                placeholder="Enter YouTube Id (e.g., dQw4w9WgXcQ)"
                                onChange={(e) => {
                                    const value = e.target.value;
                                    const youtubeRegex = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
                                    const match = value.match(youtubeRegex);
                                    if (match && match[2].length === 11) {
                                        form.setFieldsValue({ youTubeId: match[2] });
                                    }
                                }}
                            />
                        </Form.Item>
                        <Form.Item
                            label="Thumbnail Image"
                            name="thumbNail"
                        >
                            {openUploadImageView ?
                                <div style={{ display: 'flex', paddingBottom: '5px', paddingTop: "5px" }}>
                                    <div>
                                        <Tag color='orange' onClick={() => window.open(uploadImageFiles, '_blank')} style={{ fontSize: "14px", cursor: "pointer" }}>
                                            {`View Image`}
                                        </Tag>
                                    </div>
                                    <div>
                                        <Tag color='orange' onClick={() => deleteImageUrl()} style={{ fontSize: "14px", cursor: "pointer" }} icon={<DeleteOutlined />} />
                                    </div>
                                </div>
                                :
                                <Upload
                                    {...uploadProps}
                                    accept="image/png, image/jpeg">
                                    <Button icon={<DownloadOutlined />}>Upload Images</Button>
                                </Upload>
                            }
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
                        <Form.Item wrapperCol={{ offset: 8, span: 16 }}>
                            <Space>
                                <Button type="default" onClick={confirmReset}>
                                    Reset
                                </Button>
                                <Button type="primary" htmlType="submit" loading={isLoading}>
                                    {isExistingUser ? 'Update' : 'Add'}
                                </Button>
                            </Space>
                        </Form.Item>
                    </Form>
                </Card>

            </Col>
        </Row>

        

        <FloatButton.BackTop type='primary' icon={<ArrowUpOutlined />} />
        <LogoutComponent open={isSessionExpiredVisible} />
    </>);
};

export default CropAdvisory;