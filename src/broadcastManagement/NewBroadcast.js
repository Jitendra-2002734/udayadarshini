import React, { useState, useEffect } from 'react';
import { Form, Input, Button, Select, Upload, message, Space, Typography, Card, Radio, Modal, Row, Col } from 'antd';
import { InboxOutlined } from '@ant-design/icons';
import { useOutletContext } from 'react-router-dom';
import { API_URLS, LOCAL_STORAGE_CONSTANTS, SPECIFIC_BROADCAST } from '../configure/MyUtilsConfig';
import axios from 'axios';
import LogoutComponent from '../logout/LogoutComponent';

const { Dragger } = Upload;

const NewBroadcast = () => {
  const [form] = Form.useForm();
  const [specific, setSpecific] = useState(1);
  const { apiHeader } = useOutletContext();
  const [isLoading, setIsLoading] = useState(false);
  const [isSessionExpiredVisible, setIsSessionExpiredVisible] = useState(false);
  const [file, setFile] = useState();
  const [fileType, setFileType] = useState(null);
  const [districts, setDistricts] = useState([]);
  const [mandals, setMandals] = useState([]);
  const [villages, setVillages] = useState([]);

  const [isLoadingDistricts, setIsLoadingDistricts] = useState(false);
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [selectedMandal, setSelectedMandal] = useState(null);
  const [selectedVillage, setSelectedVillage] = useState(null);

  const [dataMap, setDataMap] = useState({});

  const formLabelStyle = { fontSize: 14, fontWeight: 500, width: '100%' };
  const formBoxStyle = { fontSize: 12, fontWeight: 500, width: '200px' };
  const formItemStyle = { marginBottom: 21 };

  useEffect(() => {
    fetchLocationsData();
  }, []);



  const fetchLocationsData = async () => {
    try {
      setIsLoadingDistricts(true);

      const newDataMap = {};

      const districtsRes = await axios.get(API_URLS.GET_DISTRICTS, { headers: apiHeader });
      const tempDistricts = districtsRes.data.status === 1
        ? districtsRes.data.content.map(d => ({
          key: d.uuid,
          label: d.name,
          value: d.uuid
        }))
        : [];
      setDistricts(tempDistricts);
      addKeyValuePair(newDataMap, tempDistricts);

      const mandalsRes = await axios.get(API_URLS.GET_MANDAL, { headers: apiHeader });
      const tempMandals = mandalsRes.data.status === 1
        ? mandalsRes.data.content.map(m => ({
          key: m.uuid,
          label: m.name,
          value: m.uuid,
          districtId: m.districtId
        }))
        : [];
      setMandals(tempMandals);
      addKeyValuePair(newDataMap, tempMandals);

      const villagesRes = await axios.get(API_URLS.GET_VILLAGES, { headers: apiHeader });
      const tempVillages = villagesRes.data.status === 1
        ? villagesRes.data.content.map(v => ({
          key: v.uuid,
          label: v.name,
          value: v.uuid,
          mandalId: v.mandalId
        }))
        : [];
      setVillages(tempVillages);
      addKeyValuePair(newDataMap, tempVillages);

      setDataMap(newDataMap);
    } catch (error) {
      message.error('Failed to fetch location data');
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
  const onFinish = (values) => {
    setIsLoading(true);
    const info = JSON.parse(localStorage.getItem(LOCAL_STORAGE_CONSTANTS.USER_INFO));
    let toIds = [];
    let locObj = {
      ...values,
      title: values.title,
      message: values.message,
      createdName: info?.name,
      createdDesignation: info?.designation,
      createdBy: info?.userId,
      fileUrl: file,
      fileType: fileType,
      districtId: values.districtId,
      mandalId: values.mandalId,
      villageId: values.villageId,
      toIds: values.userId,
      sendType: specific,
      divId: info?.divId
    };
    axios.post(API_URLS.ADD_UPDATE_BROADCAST, locObj, { headers: apiHeader })
      .then((res) => {
        if (res.data.status === 1) {
          form.resetFields();
          setSpecific(1);
          setFile();
          message.success(res.data.mssg);
        } else if (res.data.status === 2) {
          setIsSessionExpiredVisible(true);
        } else {
          message.error(res.data.mssg);
        }
      }).catch((error) => {
        message.error('Failed to submit the form');
        console.log("catching", error)
      }).finally(() => {
        setIsLoading(false);
      });
  };

  const onFinishFailed = (errorInfo) => {
    console.error('Validation Failed:', errorInfo);
    message.error('Please correct the errors in the form.');
  };

  const confirmReset = () => {
    Modal.confirm({
      title: 'Are you sure you want to reset the form?',
      onOk() {
        form.resetFields();
      }
    });
  };

  const uploadProps = {
    name: 'file',
    multiple: false,
    action: API_URLS.UPLOAD_FILE,
    headers: apiHeader,
    accept: "image/png, image/jpeg",
    beforeUpload: (file) => {
      return new Promise((resolve, reject) => {
        const MAX_FILE_SIZE = 3 * 1024 * 1024;

        if (file.size > MAX_FILE_SIZE) {
          message.error('File is too large. Maximum size allowed is 5MB.');
          return Upload.LIST_IGNORE;
          return;
        }
        const isImage = file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/gif';
        if (!isImage) {
          message.error('Only images are allowed (JPEG, PNG)');
          return Upload.LIST_IGNORE;
        }
        Modal.confirm({
          title: "Confirm File Upload",
          content: "Are you sure you want to upload this file?",
          okText: "Yes",
          cancelText: "No",
          onOk: () => {
            const isImage = file.type === 'image/jpeg' || file.type === 'image/png' || file.type === 'image/gif';
            if (!isImage) {
              message.error('Only images are allowed.');
              reject();
            }
            else {
              resolve(file);
            }
          },
          onCancel: () => {

            reject();
          },
        });
      });
    },
    onChange(info) {
      const { status, response, originFileObj } = info.file;
      if (status === 'done') {
        console.log("response", response, originFileObj)
        let url = response.content.url;
        setFile(url);
        let type = originFileObj.type;

        if (type.startsWith('image/')) {
          setFileType(1);
        } else if (type.startsWith('video/')) {
          setFileType(2);
        } else if (type.startsWith('audio/')) {
          setFileType(3);
        } else if (type.startsWith('application/')) {
          setFileType(4);
        } else {
          message.error('Unsupported file type.');
          return;
        }
      } else if (status === 'error') {
        message.error(`${info.file.name} file upload failed.`);
      }
    },
    onRemove(file) {

    },
  };

  const handleRadioChange = (e) => {
    setSpecific(e.target.value)
  }
  const handleDistrictChange = (value) => {
    setSelectedDistrict(value);
    setSelectedMandal(null);
    setSelectedVillage(null);
    form.setFieldsValue({ mandalId: undefined, villageId: undefined });
  };

  const handleMandalChange = (value) => {
    setSelectedMandal(value);
    setSelectedVillage(null);
    form.setFieldsValue({ villageId: undefined });
  };

  const handleVillageChange = (value) => {
    setSelectedVillage(value);

  };
  const filteredMandals = mandals.filter(m =>
    m.districtId === form.getFieldValue('districtId')
  );

  const filteredVillages = villages.filter(v =>
    v.mandalId === form.getFieldValue('mandalId')
  );

  
  return (<>
    <Row>
      <Col xs={24} sm={24} md={20} lg={16} xl={15}>
        <div >
          <Typography.Title level={4}  >{'Broadcast Management >> New Broadcast'}</Typography.Title>
        </div>
        <Card >
          <Form form={form}
            colon={false}
            initialValues={{ sendType: 1 }}
            labelCol={{ span: '8' }}
            onFinish={onFinish}
            onFinishFailed={onFinishFailed}
            style={{ marginTop: '30px' }}
          >
            <Form.Item
              label="Title"
              name="title"
              rules={[{ required: true, message: 'Please enter the broadcast title!' }]}
            >
              <Input maxLength={45} placeholder="Enter broadcast title" />
            </Form.Item>
            <Form.Item
              label="Message"
              name="message"
              rules={[{ required: true, message: 'Please enter the message!' }]}
            >
              <Input.TextArea placeholder="Enter Message" />
            </Form.Item>
            <Form.Item
              label="Send To"
              name="sendType"
              rules={[{ required: true, message: 'Please select recipient type!' }]}
            >
              <Radio.Group value={specific} onChange={handleRadioChange} >
                <Radio value={1}>All Farmers</Radio>
                <Radio value={2}>Specific</Radio>
              </Radio.Group>
            </Form.Item>

            {specific === 2 && (
              <>
                <Form.Item
                  label="District"
                  name="districtId"
                  rules={[{ required: specific === 2, message: 'Please select district!' }]}
                >
                  <Select
                    placeholder="Select District"
                    style={formBoxStyle}
                    allowClear
                    options={districts}
                    onChange={handleDistrictChange}
                    showSearch
                    filterOption={(input, option) =>
                      (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                    }
                  />
                </Form.Item>

                <Form.Item
                  label="Mandal"
                  name="mandalId"
                >
                  <Select
                    placeholder="Select Mandal"
                    style={formBoxStyle}
                    allowClear
                    options={filteredMandals}
                    onChange={handleMandalChange}
                    disabled={!form.getFieldValue('districtId')}
                    showSearch
                    filterOption={(input, option) =>
                      (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                    }
                  />
                </Form.Item>

                <Form.Item
                  label="Village"
                  name="villageId"
                >
                  <Select
                    placeholder="Select Village"
                    style={formBoxStyle}
                    allowClear
                    options={filteredVillages}
                    onChange={handleVillageChange}
                    disabled={!form.getFieldValue('mandalId')}
                    showSearch
                    filterOption={(input, option) =>
                      (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                    }
                  />
                </Form.Item>
              </>
            )}

            <Form.Item
              label="Upload Image"
              name="fileUrl"
              valuePropName="fileList"
              getValueFromEvent={(e) => (Array.isArray(e) ? e : e?.fileList)}
            >
              <Dragger {...uploadProps}>
                <p className="ant-upload-drag-icon">
                  <InboxOutlined />
                </p>
                <p className="ant-upload-text">Click or drag image to this area to upload</p>
                <p className="ant-upload-hint">Only image files are supported.</p>
              </Dragger>
            </Form.Item>
            <Form.Item label=" " labelCol={{ span: 18 }}>
              <Space>
                <Button onClick={confirmReset}>Reset</Button>
                <Button type="primary" htmlType="submit" loading={isLoading}>
                  Send
                </Button>
              </Space>
            </Form.Item>
          </Form>
        </Card>
      </Col>
    </Row>
    <LogoutComponent open={isSessionExpiredVisible} />
  </>);
};

export default NewBroadcast;
