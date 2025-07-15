import React, { useEffect, useState } from 'react';
import {
  Row, Col, Card, Typography, Form, Input, Button, Select, Table,
  message, Space, Modal, Spin, Tag, Empty, Radio, Tooltip, Carousel,Upload, Image, Alert, List
} from 'antd';
import axios from 'axios';
import { ReloadOutlined, EditOutlined, PlayCircleOutlined, FileOutlined, InboxOutlined, DeleteOutlined, UploadOutlined } from '@ant-design/icons';
import { API_URLS, LOCAL_STORAGE_CONSTANTS, PEST_TYPE, PESTS_LIST } from '../configure/MyUtilsConfig';
import { useOutletContext } from 'react-router-dom';

let localDataList = [];
const { TextArea } = Input;
const { Dragger } = Upload;

const Pests = () => {
  const [form] = Form.useForm();
  const [selectedPestsVariety, setSelectedPestsVariety] = useState(null);
  const [isSessionExpiredVisible, setIsSessionExpiredVisible] = useState(false);
  const [isNew, setIsNew] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [dataList, setDataList] = useState([]);
  const [refresh, setRefresh] = useState(0);
  const { apiHeader } = useOutletContext();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [searchInput, setSearchInput] = useState('');
  const [allPests, setAllPests] = useState([]);
  const [filteredList, setFilteredList] = useState([]);
  const [isLoadingPests, setIsLoadingPests] = useState(false);
  const [isPestsLoaded, setIsPestsLoaded] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [file, setFile] = useState([]);
  const [audioFileList, setAudioFileList] = useState([]);
  const [previewImage, setPreviewImage] = useState('');
  const [previewVisible, setPreviewVisible] = useState(false);
  const [allCrops, setAllCrops] = useState([]);
  const [dataMap, setDataMap] = useState({});
  const [isDeleting, setIsDeleting] = useState(false);
  const formBoxStyle = { fontSize: 12, fontWeight: 500, width: '180px' };
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploadVideoFiles, setUploadVideoFiles] = useState(null);
  const [uploadSolutionVideoFiles, setUploadVideoSolutionFiles] = useState(null);

  const [imageLoading, setImageLoading] = useState(true);
  const [openUploadView, setOpenUploadView] = useState(false);
  const [openUploadAudioView, setOpenUploadAudioView] = useState(false);
  const [openUploadSolutionAudioView, setOpenUploadSolutionAudioView] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [hasUploaded, setHasUploaded] = useState(false);
  const [isLoadingMandals, setIsLoadingMandals] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState(null);
  const [storeRecordUuid, setStoreRecordUuid] = useState(null);
  const [storeAudioUrl, setStoreAudioUrl] = useState(null);
  const [previewImages, setPreviewImages] = useState([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [problemAudioFileList, setProblemAudioFileList] = useState([]);
  const [solutionAudioFileList, setSolutionAudioFileList] = useState([]);
  const [isImageUploading, setIsImageUploading] = useState(false);

  const cropMap = new Map(allCrops.map(crop => [crop.value, crop.label]));
  useEffect(() => {
    fetchAllPestsDetails();
    fetchMasterdata();
  }, [refresh]);

  const fetchMasterdata = async () => {
    try {
      setIsLoadingPests(true);
      const response = await axios.get(API_URLS.GET_ALL_CROP, { headers: apiHeader });

      if (response.data.status === 1) {
      
        const tempPestsList = response.data.content.map(obj => ({
          key: obj.uuid,
          label: obj.name,
          value: obj.uuid,
        }));
        const PestsLists = response.data.content.filter(item=>item.status===1).map(obj => ({
          key: obj.uuid,
          label: obj.name,
          value: obj.uuid,
        }));
        setAllPests(PestsLists);
        setIsPestsLoaded(true);
        let tempMap = new Map();
        addKeyValuePair(tempMap, tempPestsList);
        setDataMap(tempMap);

      } else {
        message.error("No valid Crops data found.");
      }
    } catch (error) {
      message.error('Failed to fetch Crops data.');
      console.error('Fetch Crops data error:', error);
    } finally {
      setIsLoadingPests(false);
    }
  };

  const addKeyValuePair = (map, list) => {
    list.forEach(obj => {
      map[obj.key] = obj.label;
    });
  };

  const fetchAllPestsDetails = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(API_URLS.GET_ALL_CROP_PEST_NUTRITION_DISEASE, { headers: apiHeader });
      if (res?.data?.status === 1) {
      const content = res.data.content.map(item => ({
        ...item,
        problemImgs: item.problemImgs ? JSON.parse(item.problemImgs) : []
      }));
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
    const info = JSON.parse(localStorage.getItem(LOCAL_STORAGE_CONSTANTS.USER_INFO));

    const PestsVarietyObj = {
      ...values,
      createdBy: info?.uuid,
       problemImgs: Array.isArray(uploadedFiles) ? uploadedFiles : 
                  (uploadedFiles ? [uploadedFiles] : []),
      solutionAudioUrl: uploadSolutionVideoFiles,
      problemAudioUrl: uploadVideoFiles
    };

    if (!isNew) {
      PestsVarietyObj.uuid = selectedPestsVariety.uuid;
    }

    setIsLoading(true);
    try {
      const res = await axios.post(
        API_URLS.ADD_UPDATE_CROP_PEST_NUTRITION_DISEASE,
        PestsVarietyObj,
        { headers: apiHeader }
      );

      if (res.data.status === 1) {
        fetchAllPestsDetails();
        message.success(res.data.mssg);
        form.resetFields();
        setSelectedPestsVariety(null);
        setIsNew(true);
        setSearchInput("");
        setFileList([]);
        setProblemAudioFileList([]);
        setSolutionAudioFileList([]);
        setHasUploaded(false);
        setOpenUploadView(false);
        setUploadedFiles([]);
        setUploadVideoFiles(null);
        setUploadVideoSolutionFiles(null);
        setOpenUploadAudioView(false);
        setOpenUploadSolutionAudioView(false);
      } else if (res.data.status === 2) {
        setIsSessionExpiredVisible(true);
      } else {
        message.error(res.data.mssg || "Operation failed");
      }
    } catch (error) {
      message.error(error.response?.data?.mssg || error.message);
    } finally {
      setIsLoading(false);
    }
  };

const handleEdit = (record) => {
  setSelectedPestsVariety(record);
  setIsNew(false);
  
  const problemImgs = record.problemImgs || [];
  
  setUploadedFiles(problemImgs);
  setUploadVideoFiles(record.problemAudioUrl ? record.problemAudioUrl : null);
  setUploadVideoSolutionFiles(record.solutionAudioUrl ? record.solutionAudioUrl : null);
  setStoreRecordUuid(record.uuid);
  setStoreAudioUrl(record.problemAudioUrl);
  
  if (record.problemAudioUrl) {
    setOpenUploadAudioView(true);
  }
  if (record.solutionAudioUrl) {
    setOpenUploadSolutionAudioView(true);
  }

  const preparedFiles = problemImgs.map((url, index) => ({
    uid: `${Date.now()}-${index}`,
    name: url.split("/").pop(),
    status: "done",
    url,
  }));

  if (preparedFiles.length > 0) {
    setOpenUploadView(true);
    setFileList(preparedFiles);
  }

  form.setFieldsValue({
    title: record.title,
    cropId: record.cropId,
    type: record.type,
    status: record.status,
    problemDes: record.problemDes,
    solutionDes: record.solutionDes,
    problemImgs: problemImgs,
    problemAudioUrl: record.problemAudioUrl,
    solutionAudioUrl: record.solutionAudioUrl
  });

  if (record.problemAudioUrl) {
    setProblemAudioFileList([{
      uid: '-2',
      name: 'current-problem-audio',
      status: 'done',
      url: record.problemAudioUrl
    }]);
  } else {
    setProblemAudioFileList([]);
  }

  if (record.solutionAudioUrl) {
    setSolutionAudioFileList([{
      uid: '-3',
      name: 'current-solution-audio',
      status: 'done',
      url: record.solutionAudioUrl
    }]);
  } else {
    setSolutionAudioFileList([]);
  }
};
  const confirmReset = () => {
    Modal.confirm({
      title: 'Are you sure you want to reset the form?',
      onOk() {
        form.resetFields();
        setSelectedPestsVariety(null);
        setIsNew(true);
        setFileList([]);
        setAudioFileList([]);
        setHasUploaded(false);
        setOpenUploadView(false);
        setUploadedFiles([]);
        setOpenUploadAudioView(false);
        setOpenUploadSolutionAudioView(false);
      },
    });
  };

  const handleDeleteFile = (fileUrl) => {
    if (!fileUrl) {
      message.error("No file URL found.");
      return;
    }

    Modal.confirm({
      title: "Are you sure?",
      content: "Do you really want to delete this file?",
      okText: "Delete",
      cancelText: "Cancel",
      onOk: () => {
        setIsDeleting(true);
        const urls = axios.post(API_URLS.CROP_PEST_NUTRITION_DELETE_IMAGE_URL, { uuid: storeRecordUuid, imgUrl: fileUrl }, { headers: apiHeader })

        urls.then((res) => {
          if (res.data.status === 1) {
            const updatedFiles = uploadedFiles.filter((file) => file !== fileUrl);

            setFileList((prevList) =>
              prevList.filter((item) => {
                const fileName = item.name;
                return !fileUrl.endsWith(fileName); 
              })
            );


            setUploadedFiles(updatedFiles);

            const finalValue = updatedFiles.length ? updatedFiles : null;

            form.setFieldsValue({ gwrDocumentUrls: finalValue });


            message.success("File deleted successfully");
          } else {
            message.error("Failed to delete file");
          }
        })
          .catch((error) => {
            message.error("Error in deleting the file: " + error.message);
          })
          .finally(() => {
            setIsDeleting(false);
          });
      },
    });
  };



  const columns = [

    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      width: 120,
      render: (text) => text || "---"
    },
    
    {
      title: 'Crop',
      dataIndex: 'cropName',
      key: 'cropName',
        width: 120,
      render: (text) => text || '---'
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      width: 80,
      render: (type) => (
        <Tag color="blue">{PEST_TYPE[type] || 'N/A'}</Tag>
      ),
    },
    {
      title: ' Problem Description',
      dataIndex: 'problemDes',
      key: 'problemDes',
      width: 160,
      render: (text) => {
        const maxLength = 50;
        const truncatedText = text ? `${text.slice(0, maxLength)}${text.length > maxLength ? '...' : ''}` : '---';
        return (
          <Tooltip title={text}>
            <span>{truncatedText}</span>
          </Tooltip>
        );
      }
    },
    
    
{
  title: 'Image',
  dataIndex: 'problemImgs',
  key: 'problemImgs',
  width: 80,
  render: (problemImgs, record) => {
    return problemImgs && problemImgs.length > 0 ? (
      <>
        <Button
          type="link"
          icon={<FileOutlined />}
          onClick={() => {
            setPreviewImages(problemImgs);
            setPreviewVisible(true);
            setCurrentImageIndex(0);
          }}
        />
      </>
    ) : '---'
  },
},
    {
      title: 'Problem Audio',
      dataIndex: 'problemAudioUrl',
      key: 'problemAudioUrl',
      width: 100,
      render: (audioFile) => (
        audioFile ? (
          <Button
            type="link"
            icon={<PlayCircleOutlined />}
            onClick={() => window.open(audioFile, '_blank')}
          />
        ) : '---'
      ),
    },
    {
      title: 'Solution Description',
      dataIndex: 'solutionDes',
      key: 'solutionDes',
      width: 160,
      render: (text) => {
        const maxLength = 50;
        const truncatedText = text ? `${text.slice(0, maxLength)}${text.length > maxLength ? '...' : ''}` : '---';
        return (
          <Tooltip title={text}>
            <span>{truncatedText}</span>
          </Tooltip>
        );
      }
    },
    {
      title: 'Solution Audio',
      dataIndex: 'solutionAudioUrl',
      key: 'solutionAudioUrl',
      width: 100,
      render: (audioFile) => (
        audioFile ? (
          <Button
            type="link"
            icon={<PlayCircleOutlined />}
            onClick={() => window.open(audioFile, '_blank')}
          />
        ) : '---'
      ),
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      width: 80,
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
      width: 80,
      fixed: 'right',
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

  const handlePestsChange = (selectedcropId) => {
    setSearchInput('');

    if (selectedcropId) {
      let filteredData = localDataList.filter(item => item.cropId === selectedcropId);

      if (selectedStatus) {
        filteredData = filteredData.filter(item => item.type == selectedStatus);
      }

      setDataList(filteredData);
      setFilteredList(filteredData);
    } else {
      if (selectedStatus) {
        const filteredData = localDataList.filter(item => item.type == selectedStatus);
        setDataList(filteredData);
        setFilteredList(filteredData);
      } else {
        setDataList(localDataList);
        setFilteredList([]);
      }
    }
  };

  const handleStatusChange = (value) => {
    setSelectedStatus(value);
    setSearchInput('');

    if (!value) {
      if (form.getFieldValue('searchCropId')) {
        const filteredData = localDataList.filter(item => item.cropId === form.getFieldValue('searchCropId'));
        setDataList(filteredData);
        setFilteredList(filteredData);
      } else {
        setDataList(localDataList);
        setFilteredList([]);
      }
    } else {
      if (form.getFieldValue('searchCropId')) {
        const filteredData = localDataList.filter(item =>
          item.cropId === form.getFieldValue('searchCropId') && item.type == value
        );
        setDataList(filteredData);
        setFilteredList(filteredData);
      } else {
        const filteredData = localDataList.filter(item => item.type == value);
        setDataList(filteredData);
        setFilteredList(filteredData);
      }
    }
  };

  const changeEdtSearch = (searchWord) => {
    setSearchInput(searchWord);

    if (!searchWord) {
      if (filteredList.length > 0) {
        setDataList(filteredList);
      } else {
        setDataList(localDataList);
      }
    } else {
      const baseData = filteredList.length > 0 ? filteredList : localDataList;
      const searchResults = baseData.filter(item =>
        item.title.toLowerCase().includes(searchWord.toLowerCase())
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
              <Form.Item name="searchCropId">
                <Select
                  placeholder="Select Crop"
                  allowClear
                  filterOption={(input, option) =>
                    option.label && option.label.toLowerCase().includes(input.toLowerCase())
                  }
                  showSearch
                  style={formBoxStyle}
                  options={allPests}
                  loading={isLoadingPests}
                  onChange={handlePestsChange}
                />
              </Form.Item>
            </Form>
          </Col>
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
                  options={PESTS_LIST}
                  loading={isLoadingMandals}
                  value={selectedStatus} 
                />
              </Form.Item>
            </Form>
          </Col>
          <Col >
            <Input.Search
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
          <Col >
            <Button
              icon={<ReloadOutlined />}
              onClick={() => {
                setSearchInput('');
                setSelectedStatus(null);
                setFilteredList([]);
                form.resetFields(['searchCropId', 'type1']);
                setRefresh(refresh + 1);
                setCurrentPage(1);
              }}
            />
          </Col>
        </Row>
      </div>
    );
  };

  const handleOpenModal = () => setIsModalOpen(true);
  const handleCloseModal = () => {
    setIsModalOpen(false);
    if (uploadedFiles.length > 0) {
      setHasUploaded(true);
    }
  };


  const uploadProps = {
    //name: 'file',
    action: API_URLS.UPLOAD_FILE_TROUGH_FOLDER_NAME,
    data:{folderName:'Pest/Nutrition/Disease_Images'},
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
      setIsImageUploading(true); 
      return true;
  
    },
    onChange: (info) => {



    },
    onChange(info) {
      let newFileList = [...info.fileList];

      const { status, response } = info.file;
      if (status !== 'uploading') {
      }
      if (status === 'done') {
        let uploadedUrl = info?.file?.response?.content?.url;
        console.log(info?.file?.response?.content?.url);
        setUploadedFiles((prevList) => {
          if (prevList.length >= 6) {
            message.warning(`Only 6 Images files are allowed.`);
            return prevList;
          }

          if (!prevList.includes(uploadedUrl)) {
            return [...prevList, uploadedUrl];
          }

          return prevList;
        });
      
      } else if (status === 'error') {
        message.error(`file upload failed.`);
      }
      setFileList(newFileList);
      if (status !== 'uploading') {
        setIsImageUploading(false);
      }
    },
    onRemove() {
      setFileList((prevList) => prevList.filter((item) => item.uid !== file.uid));

      console.log(file)
    },
  };

  const uploadVideosProps = {
    multiple: false,
    action: API_URLS.UPLOAD_FILE_TROUGH_FOLDER_NAME,
    data:{folderName:'Pest/Nutrition/Disease_Problem_AudioFile'},
        headers: apiHeader,
    accept: "audio/mpeg, audio/wav, audio/mp3",
    beforeUpload: (file) => {
      const isAudio =
        file.type === 'audio/mpeg' ||
        file.type === 'audio/wav' ||
        file.type === 'audio/mp3';
      const isFileSizeValid = file.size / 1024 / 1024 <= 50; // 50 MB

      if (!isAudio) {
        message.error('Only audio files are allowed.');
        return Upload.LIST_IGNORE;
      } else if (!isFileSizeValid) {
        message.error('File size must be less than or equal to 50 MB.');
        return Upload.LIST_IGNORE;
      }
    },
    onChange(info) {
      const { status } = info.file;
      if (status === 'done') {
        const uploadedUrl = info?.file?.response?.content?.url;
        console.log('Uploaded URL:', uploadedUrl);
        setUploadVideoFiles(uploadedUrl);
      } else if (status === 'error') {
        message.error('File upload failed.');
      }
    },
    onDrop(e) {
      console.log('Dropped files', e.dataTransfer.files);
    },
    onRemove(file) {
      console.log('Removed file', file);
    },
  };

  const uploadSolutiosVideosProps = {
    multiple: false,
    action: API_URLS.UPLOAD_FILE_TROUGH_FOLDER_NAME,
    data:{folderName:'Pest/Nutrition/Disease_Solution_AudioFile'},
        headers: apiHeader,
    accept: "audio/mpeg, audio/wav, audio/mp3",
    beforeUpload: (file) => {
      const isAudio =
        file.type === 'audio/mpeg' ||
        file.type === 'audio/wav' ||
        file.type === 'audio/mp3';
      const isFileSizeValid = file.size / 1024 / 1024 <= 50; // 50 MB

      if (!isAudio) {
        message.error('Only audio files are allowed.');
        return Upload.LIST_IGNORE;
      } else if (!isFileSizeValid) {
        message.error('File size must be less than or equal to 50 MB.');
        return Upload.LIST_IGNORE;
      }
    },
    onChange(info) {
      const { status } = info.file;
      if (status === 'done') {
        const uploadedUrl = info?.file?.response?.content?.url;
        console.log('Uploaded URL:', uploadedUrl);
        setUploadVideoSolutionFiles(uploadedUrl);
      } else if (status === 'error') {
        message.error('File upload failed.');
      }
    },
    onDrop(e) {
      console.log('Dropped files', e.dataTransfer.files);
    },
    onRemove(file) {
      console.log('Removed file', file);
    },
  };

  const deleteAudioUrl = () => {
    Modal.confirm({
      title: "Are you sure?",
      content: "Do you really want to delete this file?",
      okText: "Delete",
      cancelText: "Cancel",
      onOk: () => {
        axios.post(API_URLS.CROP_PEST_NUTRITION_DELETE_AUDIO_URL, { uuid: storeRecordUuid, audioFile: storeAudioUrl }, { headers: apiHeader })
          .then((res) => {
            if (res.data.status === 1) {
              message.success(res.data.mssg);
              setOpenUploadAudioView(false);
              setOpenUploadSolutionAudioView(false);
              setAudioFileList(null);
              setUploadVideoFiles(null);
            } else {
              message.error('Failed to delete file');
            }
          }).catch((error) => {
            message.error('Error in deleting the file:', error);
          });
      },
    });
  }

  const deleteSolutionAudioUrl = () => {
    Modal.confirm({
      title: "Are you sure?",
      content: "Do you really want to delete this file?",
      okText: "Delete",
      cancelText: "Cancel",
      onOk: () => {
        axios.post(API_URLS.CROP_PEST_NUTRITION_DELETE_SOLUTION_AUDIO_URL, { uuid: storeRecordUuid, audioFile: storeAudioUrl }, { headers: apiHeader })
          .then((res) => {
            if (res.data.status === 1) {
              message.success(res.data.mssg);
              setOpenUploadSolutionAudioView(false);
               setAudioFileList(null);
              setUploadVideoSolutionFiles(null);
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
          <Typography.Title level={4}>Masters &gt;&gt; Pests/Nutrition/Disease</Typography.Title>
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
                tableLayout='fixed'
                scroll={{ x: 820 }}
                pagination={{
                  current: currentPage,
                  pageSize,
                  total: dataList.length,
                  showSizeChanger: true,
                  pageSizeOptions: ['5', '10', '20', '50'],
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
          <Typography.Title level={4}>Add / Edit Pests/Nutrition/Disease</Typography.Title>
          <Card >
            <Form
              form={form}
              name="basic"
              initialValues={{ status: 1, type: 1 }}
              onFinish={onFinish}
            labelCol={{ span: 9 ,style: { whiteSpace: "normal" } }}
            colon={false}
            >
              <Form.Item
                label="Crop"
                name="cropId"
                rules={[{ required: true, message: 'Please select crop' }]}
              >
                <Select
                  placeholder="Select Crop"
                  filterOption={(input, option) =>
                    option.label && option.label.toLowerCase().includes(input.toLowerCase())
                  }
                  showSearch

                  options={allPests}
                  loading={isLoadingPests}
                />
              </Form.Item>
              <Form.Item
                label="Type"
                name="type"
                rules={[{ required: true, message: 'Please select type' }]}
              >
                <Radio.Group>
                  <Radio value={1}>Pest</Radio>
                  <Radio value={2}>Nutrition</Radio>
                  <Radio value={3}>Disease</Radio>
                </Radio.Group>
              </Form.Item>

              <Form.Item
                label="Title"
                name="title"
                rules={[{ required: true, message: 'Please enter title' }]}
              >
                <Input placeholder="Enter title" />
              </Form.Item>

              <Form.Item
                label=" Problem Description"
                name="problemDes"
              >
                <TextArea placeholder="Enter description" />
              </Form.Item>

              {openUploadView ?
                <Form.Item label="Upload Images" name="fileUrl">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div>
                      <Button icon={<UploadOutlined />} onClick={handleOpenModal}>
                        Upload
                      </Button>
                    </div>
                    <div>
                      {openUploadView && (
                        <Tag color='orange' onClick={handleOpenModal} style={{ fontSize: "14px", cursor: "pointer" }}>
                          {` View Files`}
                        </Tag>
                      )}
                    </div>
                  </div>
                  {hasUploaded && (
                    <p style={{ fontSize: "13px", color: "green", marginTop: 4 }}>
                      ✅ {uploadedFiles.length} document{uploadedFiles.length > 1 ? "s" : ""} uploaded
                    </p>
                  )}
                </Form.Item>
                :
                <Form.Item name='fileUrl' label='Upload Images'
                >
                  <Upload
                   multiple
                   {...uploadProps}
                   accept="image/png, image/jpeg"  >

                    <Button icon={isImageUploading ? <Spin /> : <UploadOutlined />}>
      {isImageUploading ? 'Uploading...' : 'Upload Images'}
    </Button>
                  </Upload>
                </Form.Item>
              }
              <Form.Item
                label=" Problem Audio"
                name="problemAudioUrl"
              >
                {openUploadAudioView ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingBottom: '5px', paddingTop: '5px' }}>

                    <Tag color='orange' onClick={() => window.open(uploadVideoFiles, '_blank')} style={{ fontSize: "14px", cursor: "pointer" }}>
                      {` View Audio File`}
                    </Tag>
                    <div>
                      <Tag color='red' onClick={() => deleteAudioUrl()} style={{ fontSize: "14px", cursor: "pointer" }} icon={<DeleteOutlined />} />
                    </div>
                  </div>
                ) :
                  <Upload
                    {...uploadVideosProps}
                    accept="audio/mpeg, audio/wav, audio/mp3">
                    <Button >Upload Audio</Button>
                  </Upload>
                }
              </Form.Item>

              <Form.Item
                label=" Solution Description"
                name="solutionDes"
              >
                <TextArea placeholder="Enter description" />
              </Form.Item>

              <Form.Item
                label=" Solution Audio"
                name="solutionAudioUrl"
              >
                {openUploadSolutionAudioView ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingBottom: '5px', paddingTop: '5px' }}>

                    <Tag color='orange' onClick={() => window.open(uploadSolutionVideoFiles, '_blank')} style={{ fontSize: "14px", cursor: "pointer" }}>
                      {` View Audio File`}
                    </Tag>
                    <div>
                      <Tag color='red' onClick={() => deleteSolutionAudioUrl()} style={{ fontSize: "14px", cursor: "pointer" }} icon={<DeleteOutlined />} />
                    </div>
                  </div>
                ) :
                  <Upload
                    {...uploadSolutiosVideosProps}
                    accept="audio/mpeg, audio/wav, audio/mp3">
                    <Button >Upload Audio</Button>
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
  open ={previewVisible}
  footer={null}
  onCancel={() => setPreviewVisible(false)}
  width={800}
  bodyStyle={{ padding: '20px' }}
>
      <Spin spinning={imageLoading} tip="Loading images...">
  {previewImages && previewImages.length > 0 ? (

    <Carousel 
      arrows 
      infinite={false}
      afterChange={(current) => setCurrentImageIndex(current)}
    >
      {previewImages.map((img, index) => (
        <div key={index}>
          <div style={{
            height: '400px',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: '#f0f0f0'
          }}>
            <Image
              src={img}
              style={{
                maxWidth: '100%',
                maxHeight: '100%',
                objectFit: 'contain'
              }}
              onLoad={() => setImageLoading(false)}
                                    onError={() => {
                                      setImageLoading(false);
                                      message.error('Failed to load image');
                                    }}
              preview={false}
            />
          </div>
        </div>
      ))}
    </Carousel>

  ) : (

    <div style={{ textAlign: 'center', padding: '20px' }}>
      No images available
    </div>
  )}
  </Spin>
</Modal>
    

      <Modal
        title="Upload Images"
        open={isModalOpen}
        onCancel={handleCloseModal}
        onOk={handleCloseModal}
        centered
        width={530}
      >
        <Alert
          message={
            <>
              You can upload up to <b>6</b> Images. Each file must be under{" "}
              <b>5 MB</b>.
            </>
          }
          type="info"
          showIcon
          style={{ marginBottom: 12, padding: '8px 8px', }}
        />
        <Dragger
          {...uploadProps}
          accept="image/png, image/jpeg"
          multiple
          fileList={fileList}
          showUploadList={false}
           disabled={uploadedFiles.length >= 6|| isImageUploading}
          style={{
            height: 35,
            padding: 0,
            background: "#fafafa",
            border: "1px dashed #d9d9d9",
            borderRadius: 8,
            overflow: "hidden",
          }}
        >
           
          <div style={{ height: "99%", margin: "-13px" }}>
            <p style={{ fontSize: 30, margin: "-2px" }}>
              <InboxOutlined />
            </p>
            <p className="ant-upload-text" style={{ fontSize: 16, margin: 0 }}>
              Click or drag Images to this area to upload
            </p>
            <p className="ant-upload-hint" style={{ fontSize: 14, marginTop: 4 }}>
              Only Images  allowed.
            </p>
          </div>
        </Dragger>

        <Spin spinning={isUploading || isDeleting || isImageUploading} >
          <div>
            <Typography.Title level={5} style={{ color: 'green', marginTop: "15px" }}>Uploaded Files</Typography.Title>
            <List
              bordered
              dataSource={uploadedFiles.slice(0, 6)}
              style={{
                maxHeight: 200,
                overflowY: "auto",
                background: "#fff",
                marginTop: '3px'
              }}
              locale={{ emptyText: "No documents uploaded yet" }}
              renderItem={(fileUrl, index) => (
                <List.Item
                  actions={[
                    <div style={{ display: "flex", alignItems: "center", gap: 35 }} key={`actions-${index}`}>
                      <a
                        href={fileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ color: "#1890ff" }}
                      >
                        <FileOutlined style={{ fontSize: 15, }} />
                      </a>
                      <a key="remove" onClick={() => handleDeleteFile(fileUrl)}>
                        <DeleteOutlined style={{ color: "red" }} />
                      </a>
                    </div>
                  ]}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span
                      style={{
                        maxWidth: "300px",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        whiteSpace: "nowrap",
                        display: "inline-block",
                        verticalAlign: "middle",
                      }}
                      title={fileUrl.split("").slice(1).join("") || "No File Name"}
                    >
                      {`${index + 1}. ${fileUrl.split("_").slice(1).join("_") || "No File Name"}`}
                    </span>

                  </div>
                </List.Item>
              )}
            />
          </div>
        </Spin>
      
      </Modal>
    </>
  );
};




export default Pests;