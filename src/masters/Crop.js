import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Typography, Form, Select, Input, Button, Upload, Table, message, Space, Modal, Spin, Tag, Empty, Radio, Tooltip, Image } from 'antd';
import axios from 'axios';
import { ReloadOutlined, EditOutlined, FileOutlined, DownloadOutlined, DeleteOutlined } from '@ant-design/icons';
import { API_URLS, CROP_TYPE, CROPS_LIST, LOCAL_STORAGE_CONSTANTS } from '../configure/MyUtilsConfig';
import { useOutletContext } from 'react-router-dom';
import LogoutComponent from '../logout/LogoutComponent';

let localDataList = [];


const Crop = () => {
  const [form] = Form.useForm();
  const statusValue = Form.useWatch('status', form);
  const [selectedCrops, setSelectedCrops] = useState(null);
  const [isSessionExpiredVisible, setIsSessionExpiredVisible] = useState(false);
  const [isNew, setIsNew] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [dataList, setDataList] = useState([]);
  const [refresh, setRefresh] = useState(0);
  const { apiHeader } = useOutletContext();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [searchInput, setSearchInput] = useState('');
  const [fileList, setFileList] = useState([]);
  const [previewImage, setPreviewImage] = useState('');
  const [previewVisible, setPreviewVisible] = useState(false);
  const [uploadImageFiles, setUploadImageFile] = useState(null);
  const [openUploadImageView, setOpenUploadImageView] = useState(false);
  const [storeImageUrl, setStoreImageUrl] = useState(null);
  const [storeRecordUuid, setStoreRecordUuid] = useState(null);
  const [isLoadingMandals, setIsLoadingMandals] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [storeUserInfo, setStoreUserInfo] = useState();
  const [filteredList, setFilteredList] = useState([]);

  const formBoxStyle = { fontSize: 12, fontWeight: 500, width: '180px' };
  useEffect(() => {
    fetchAllCropsDetails();
    const userInfo = JSON.parse(localStorage.getItem(LOCAL_STORAGE_CONSTANTS.USER_INFO));
    if (userInfo) {
      setStoreUserInfo(userInfo.mobileNumber);
      console.log('phonenumbers', userInfo.mobileNumber)
    }
  }, [refresh]);


  const fetchAllCropsDetails = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(API_URLS.GET_ALL_CROP, { headers: apiHeader });
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
    const info = JSON.parse(localStorage.getItem('userInfo'));

    const CropsObj = isNew
      ? { ...values, createdBy: info?.uuid, imgUrl: uploadImageFiles, imageUrl: uploadImageFiles }
      : { ...selectedCrops, ...values, createdBy: info?.uuid, imgUrl: uploadImageFiles, imageUrl: uploadImageFiles };

    setIsLoading(true);
    try {
      const res = await axios.post(API_URLS.ADD_UPDATE_CROP, CropsObj, { headers: apiHeader });
      if (res.data.status === 1) {
        fetchAllCropsDetails();
        message.success(res.data.mssg);
        form.resetFields();
        setSelectedCrops(null);
        setIsNew(true);
        setSearchInput("");
        setFileList([]);
        setOpenUploadImageView(false);
        setUploadImageFile(null);
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
    setSelectedCrops(record);
    setIsNew(false);
    setUploadImageFile(record.imgUrl);
    if (record.imgUrl) {
      setOpenUploadImageView(true);
    } else {
      setOpenUploadImageView(false);
    }
    setStoreImageUrl(record.imgUrl);
    setStoreRecordUuid(record.uuid);
    form.setFieldsValue({
      name: record.name,
      type: record.type,
      status: record.status,
      imageUrl: record.imgUrl
    });
    if (record.imgUrl) {
      setFileList([{
        uid: '-1',
        name: 'current-image',
        status: 'done',
        url: record.imgUrl
      }]);
    } else {
      setFileList([]);
    }
  };


  const confirmReset = () => {
    Modal.confirm({
      title: 'Are you sure you want to reset the form?',
      onOk() {
        form.resetFields();
        setSelectedCrops(null);
        setIsNew(true);
        setFileList([]);
        setOpenUploadImageView(false);
        setUploadImageFile(null);

      },
    });
  };

  const uploadProps = {
    action: API_URLS.UPLOAD_FILE_TROUGH_FOLDER_NAME,
    data: { folderName: 'Crops_Thumbnail' },
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
      // handleDeleteFile();
    },
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type) => (
        <Tag color="orange">{CROP_TYPE[type] || 'N/A'}</Tag>
      ),
    },
    {
      title: 'Image',
      dataIndex: 'imgUrl',
      key: 'imgUrl',
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
      render: (status) => {
        switch (status) {
          case 0:
            return <Tag color="error">Deactive</Tag>;
          case 1:
            return <Tag color="success">Active</Tag>;
          case 2:
            return <Tag color="blue">Lock</Tag>;
          default:
            return 'N/A';
        }
      },
    },
    {
      title: 'Action',
      key: 'action',
      render: (_, record) => (
        <Space size="middle">
          <Tooltip title="Edit Crop">
            <Button
              type="link"
              icon={<EditOutlined />}
              onClick={() => handleEdit(record)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];


  const handleStatusChange = (value) => {
    setSelectedStatus(value);
    setSearchInput('');

    if (!value) {
      setDataList(localDataList);
      setFilteredList([]);
    } else {
      const filteredData = localDataList.filter(item => item.type == value);
      setDataList(filteredData);
      setFilteredList(filteredData);
    }
  };
  const changeEdtSearch = (searchWord) => {
    setSearchInput(searchWord);

    if (!searchWord) {
      if (selectedStatus) {
        const filteredData = localDataList.filter(item => item.type == selectedStatus);
        setDataList(filteredData);
        setFilteredList(filteredData);
      } else {
        setDataList(localDataList);
        setFilteredList([]);
      }
    } else {
      const baseData = filteredList.length > 0 ? filteredList : localDataList;
      const searchResults = baseData.filter(item =>
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
          <Col >
            <Form form={form} colon={false}>
              <Form.Item style={{ fontWeight: 400 }} name='type1'>
                <Select
                  showSearch
                  placeholder="Select Type"
                  onChange={handleStatusChange}
                  allowClear
                  style={formBoxStyle}
                  filterOption={(input, option) =>
                    option.label && option.label.toLowerCase().includes(input.toLowerCase())
                  }
                  options={CROPS_LIST}
                  loading={isLoadingMandals}
                  value={selectedStatus}
                />
              </Form.Item>
            </Form>
          </Col>
          <Col flex={2}>
            <Input.Search
              placeholder="Search crops"
              allowClear
              value={searchInput}
              onSearch={changeEdtSearch}
              onChange={(evt) => {
                setSearchInput(evt.target.value);
                changeEdtSearchRaw(evt);
              }}
            />
          </Col>
          <Col flex={1}>
            <Button
              icon={<ReloadOutlined />}
              onClick={() => {
                setSearchInput('');
                form.resetFields(['type1']);
                setSelectedStatus(null);
                setFilteredList([]);
                setCurrentPage(1);
                setRefresh(refresh + 1);
              }}
            />

          </Col>
        </Row>
      </div>
    );
  };

  const deleteImageUrl = () => {
    Modal.confirm({
      title: "Are you sure?",
      content: "Do you really want to delete this file?",
      okText: "Delete",
      cancelText: "Cancel",
      onOk: () => {
        axios.post(API_URLS.CROP_DELETING_URL, { uuid: storeRecordUuid, imgUrl: storeImageUrl }, { headers: apiHeader })
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

  return (
    <>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={24} md={24} lg={16} xl={16}>
          <Typography.Title level={4}>Masters &gt;&gt; Crops List</Typography.Title>
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
                rowKey="uuid"
                pagination={{
                  current: currentPage,
                  pageSize,
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
          <Typography.Title level={4}>Add / Edit Crop</Typography.Title>
          <Card>
            <Form
              form={form}
              name="basic"
              initialValues={{ status: 1, type: 1 }}
              onFinish={onFinish}
              layout="vertical"
            >
              <Form.Item
                label="Type"
                name="type"
                rules={[{ required: true, message: 'Please select type' }]}
              >
                <Radio.Group>
                  <Radio value={1}>Flower</Radio>
                  <Radio value={2}>Vegetable</Radio>
                  <Radio value={3}>Fruit</Radio>
                  <Radio value={4}>Spices</Radio>
                </Radio.Group>
              </Form.Item>
              <Form.Item
                label="Name"
                name="name"
                rules={[{ required: true, message: 'Please enter crop name' }]}
              >
                <Input placeholder="Enter crop name" />
              </Form.Item>

              <Form.Item
                label="Image"
                name="imageUrl"
                rules={[{ required: true, message: 'Please Upload Image File' }]}
              >
                {openUploadImageView ?
                  <div style={{ display: 'flex', paddingBottom: '5px', paddingTop: "5px" }}>
                    <div>
                      <Tag color='orange' onClick={() => window.open(uploadImageFiles, '_blank')} style={{ fontSize: "14px", cursor: "pointer" }}>
                        {`View Image`}
                      </Tag>
                    </div>
                    <div>
                      <Tag color='red' onClick={() => deleteImageUrl()} style={{ fontSize: "14px", cursor: "pointer" }} icon={<DeleteOutlined />} />
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


              {(isNew === true || selectedCrops.status === 1) ? (
                <Form.Item
                  label="Status"
                  name="status"
                  rules={[{ required: true, message: 'Please select status' }]}
                >
                  <Radio.Group>
                    <Radio value={1}>Active</Radio>
                    <Radio value={0}>Deactive</Radio>
                    <Radio value={2}>Lock</Radio>
                  </Radio.Group>
                </Form.Item>
              ) : (isNew === false && storeUserInfo === '9705589009') ? (
                <Form.Item
                  label="Status"
                  name="status"
                  rules={[{ required: true, message: 'Please select status' }]}
                >
                  <Radio.Group>
                    <Radio value={1}>Active</Radio>
                    <Radio value={0}>Deactive</Radio>
                    <Radio value={2}>Lock</Radio>
                  </Radio.Group>
                </Form.Item>
              ) : (
                <Form.Item
                >
                </Form.Item>
              )}
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

      <Modal
        visible={previewVisible}
        footer={null}
        onCancel={() => setPreviewVisible(false)}
      >
        <img alt="Preview" style={{ width: '100%' }} src={previewImage} />
      </Modal>

      <LogoutComponent open={isSessionExpiredVisible} />
    </>
  );
};



export default Crop;