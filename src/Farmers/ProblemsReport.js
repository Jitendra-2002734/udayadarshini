import React, { useState, useEffect } from 'react';
import {
  Table, Card, Typography, Spin, Button, Form, Select, Image,
  Row, Col, DatePicker, message, Space, Tag, Tooltip, Modal,Carousel,
} from 'antd';
import dayjs from 'dayjs';

import {  PlayCircleOutlined, FileOutlined } from '@ant-design/icons';
import { API_URLS, PESTS_LIST, INTENSITY_SELECT_TYPE ,PEST_TYPE,INTENSITY_TYPES,PROBLEM_TYPE,PROBLEM_LIST,LOCAL_STORAGE_CONSTANTS, } from '../configure/MyUtilsConfig';
import axios from 'axios';
import { useOutletContext } from 'react-router-dom';
import LogoutComponent from '../logout/LogoutComponent';
import FarmerProblemsModal from './FarmerProblemsModal';
const { Title } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;

const ProblemReport = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [reportData, setReportData] = useState([]);
  const [isSessionExpiredVisible, setIsSessionExpiredVisible] = useState(false);
  const { apiHeader } = useOutletContext();
  const [form] = Form.useForm();
    const [totalRecords, setTotalRecords] = useState(0);
  const [farmers, setFarmers] = useState([]);
  const [crops, setCrops] = useState([]);
  const [selectedIntensity, setSelectedIntensity] = useState(null);
  const [selectedCpnType, setSelectedCpnType] = useState(null);
  const [imageLoading, setImageLoading] = useState(true);
  const [selectedReadType, setSelectedReadType] = useState(null);
  const [selectedProblemType, setSelectedProblemType] = useState(null);
  const [selectedFarmer, setSelectedFarmer] = useState(null);
  const [selectedCrop, setSelectedCrop] = useState(null);
  const [month, setMonth] = useState(dayjs().format('YYYY-MM'));
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [filterType, setFilterType] = useState('yearMonth');

  const [selectedDates, setSelectedDates] = useState(dayjs().startOf('month'));
const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedFarmerId, setSelectedFarmerId] = useState(null);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImages, setPreviewImages] = useState([]);

  const defaultFromDate = dayjs().subtract(30, 'day').startOf('day');
  const defaultToDate = dayjs().endOf('day');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const formLabelStyle = { fontSize: 14, fontWeight: 500, width: '100%' };
  const formBoxStyle = { fontSize: 12, fontWeight: 500, width: '200px' };
  const formItemStyle = { marginBottom: 21 };

 useEffect(() => {
    fetchReportData();
      fetchFarmers();
    fetchCrops();
  }, [currentPage, pageSize,]);

  const fetchFarmers = async () => {
    try {
      const response = await axios.post(API_URLS.GET_ALL_FARMER, { headers: apiHeader });
      if (response.data.status === 1) {
        setFarmers(response.data.content.map(f => ({
          label: f.name,
          value: f.uuid
        })));
      }
    } catch (error) {
      message.error('Failed to fetch farmers');
    }
  };


  const fetchCrops = async () => {
  try {
    setIsLoading(true); 
    const response = await axios.get(API_URLS.GET_ALL_CROP, { headers: apiHeader });

    if (response.data.status === 1) {
      const activeCrops = response.data.content
        .filter(crop => crop.status === 1)
        .map(crop => ({
          label: crop.name,
          value: crop.uuid,
          key: crop.uuid
        }));

      setCrops(activeCrops);
    }
  } catch (error) {
    message.error('Failed to fetch crops');
  } finally {
    setIsLoading(false); 
  }
};

  const handleMarkAsRead = async (problemId) => {
  const info = JSON.parse(localStorage.getItem(LOCAL_STORAGE_CONSTANTS.USER_INFO));
  setIsLoading(true);
   let input = {
           id: problemId,  
        readStatus: "1", 
        createdBy: info.uuid
        }
  try {
    const response = await axios.post(
      API_URLS.UPDATE_PROBLEM_READ_STATUS,input,
      { headers: apiHeader }
    );

    if (response.data.status === 1) {
      message.success(response.data.mssg);
      await fetchReportData();
      setReportData(prevData => 
        prevData.map(item => 
          item.id === problemId ? { ...item, read: true } : item
        )
      );
    } else {
      message.error(response.data.mssg );
    }
  } catch (error) {
    console.error("Error updating read status:", error);
    message.error('Error updating status');
  } finally {
    setIsLoading(false);
  }
};

const fetchReportData = async () => {
    setIsLoading(true);
    try {
        const requestData = {
            type: filterType,
            yearMonth: month,
            fromDate: fromDate,
            toDate: toDate,
            intensityType: selectedIntensity,
            readStatus:selectedReadType,
            cpnType: selectedCpnType,
             problemType: selectedProblemType,
            farmerId: selectedFarmer,
            cropId: selectedCrop,
            page: currentPage,
            size: pageSize
        };

        const response = await axios.post(
            API_URLS.PROBLEMS_REPORT_GET_ALL,
            requestData,
            { headers: apiHeader }
        );

        if (response.data.status === 1) {
            const content = response.data.content;
            if (content && content.data) {
                setReportData(content.data);
                setTotalRecords(content.totalRecords || 0);
            } else {
                setReportData([]);
                setTotalRecords(0);
                 setCurrentPage(1);
            }
        } else if (response.data.status === 2) {
            setIsSessionExpiredVisible(true);
        } else {
            message.error(response.data.mssg || 'Failed to fetch report data');
        }
    } catch (error) {
        message.error('Failed to fetch report data');
    } finally {
        setIsLoading(false);
    }
};




const handlePreviewImages = (images) => {
  if (Array.isArray(images) && images.length > 0) {
     setImageLoading(true); 
    setPreviewImages(images);
    setPreviewVisible(true);
  }
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
      title: 'Farmer',
      dataIndex: 'farmerName',
      key: 'farmerName',  align: 'left',
  width: 150,
        width: 150,
          ellipsis: true,
      render: (text, record) =>
        text ? (
          <Button
            type="link"
            onClick={() => handleViewProblems(record.farmerId)}
             style={{
          padding: 0,
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          maxWidth: '100%',
          display: 'inline-block',
          textAlign: 'left'
        }}
        title={text}
          >
            {text}
          </Button>
        ) : '---'
    },

    {
      title: 'Crop',
      dataIndex: 'cropName',
      key: 'cropName',
      width:150,
      render: (text) => text || '---'
    },
       {
      title: 'Pest/Nutrition/Disease',
      dataIndex: 'cropPestNutritionDiseaseName',
      width:150,
      render: (text) => text ? text : '---',
    },
    {
      title: 'Problem Type',
      dataIndex: 'problemType',
      key: 'problemType',
       width:90,
      render: (type) => {
        switch (type) {
          case 1: return <Tag color="orange">Known</Tag>;
          case 2: return <Tag color="green">UnKnown</Tag>;
          default: return '---';
        }
      }
    },
        {
  title: 'Type',
  dataIndex: 'cpnType',
  key: 'cpnType',
   width:90,
  render: (cpnType) => (
    <Tag color="blue">{PEST_TYPE[cpnType] || 'N/A'}</Tag>
  )
},
    {
      title: 'Intensity',
      dataIndex: 'intensityType',
      key: 'intensityType',
      width:90,
      render: (intensity) => (
       
           <Tag color="orange">{INTENSITY_TYPES[intensity] || 'N/A'}</Tag>
      )
        
      
    },
  
    {
      title: 'Description',
      dataIndex: 'des',
      key: 'des',

      width:200,
      
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
  dataIndex: 'images',
  key: 'images',
  width: 90,
  render: (images) => {
    const imageArray = parseImages(images);
    return imageArray.length > 0 ? (
      <Button
        type="link"
        icon={<FileOutlined />}
        onClick={() => handlePreviewImages(imageArray)}
      />
    ) : '---';
  }
},

    {
  title: 'Audio',
  dataIndex: 'audioFileUrl',
  key: 'audioFileUrl',
   width: 80,
  render: (url) => (
    url ? (
      <Button 
        type="link" 
             icon={<PlayCircleOutlined />}
        onClick={() => window.open(url, '_blank')}
      >
      </Button>
    ) : '---'
  )
},
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
       width: 90,
      render: (status) => (
        status === 1 ? (
          <Tag color="success">Active</Tag>
        ) : (
          <Tag color="error">Deactive</Tag>
        )
      )
    },
 
{
  title: 'Action',
  key: 'action',
    dataIndex: 'readStatus', 
  fixed: 'right',
  width: 130,
  filters: [
    { text: 'Read', value: 1 },
    { text: 'Mark as Read', value: 2 },
  ],

  
  onFilter: (value, record) => record.readStatus === value,
    
  sorter: (a, b) => a.readStatus - b.readStatus,  
    defaultSortOrder: 'descend', 
  sortDirections: ['ascend', 'descend'],    
  render: (text, record) => {
    const isRead = record.readStatus === 1;

    return (
      <Space size="middle">
        <Tooltip title={isRead ? "Already Read" : "Click to mark as read"}>
          <Button
            size="small"
            onClick={() => handleMarkAsRead(record.uuid)}
            disabled={isRead}
            style={{
             backgroundColor: isRead ? '#d9f7be' : '#f76a6a',  
              borderColor: isRead ? '#d9f7be' : 'rgb(233, 147, 147)',
              color: isRead ? 'green' : 'white',
              cursor: isRead ? 'not-allowed' : 'pointer',
            }}
          >
            {isRead ? 'Read' : 'Mark as Read'}
          </Button>
        </Tooltip>
      </Space>
    );
  },
}



  ];

  const handleViewProblems = (farmerId) => {
    setSelectedFarmerId(farmerId);
    setModalVisible(true);
  };

  const parseImages = (images) => {
    try {
      if (!images) return [];
      if (typeof images === 'string') {
        return JSON.parse(images);
      }
      if (Array.isArray(images)) {
        return images;
      }
      return [];
    } catch (e) {
      console.error('Error parsing images:', e);
      return [];
    }
  };
  return (
    <>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={4}>{"Farmers Management >> Problems Data Report "}</Title>
      </div>

      <Card
        size="small"
        style={{
          backgroundColor: '#ffffff',
          border: '1px solid #d3d3d3',
          width: '100%',
          padding: '10px',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
          marginBottom: '16px',
        }}
      >

        <Form form={form} layout="vertical"  
                            onFinish={fetchReportData}>
          <Row gutter={12} align="middle">
            <Col>
              <Form.Item label={<label style={formLabelStyle}>Type</label>} style={formItemStyle}>
                <Select
                  value={filterType}
                  onChange={(value) => {
                    setFilterType(value);
                    setSelectedDates(null);
                    setCurrentPage(1);

                    if (value === 'yearMonth') {
                      setMonth(dayjs().format('YYYY-MM'));
                      setSelectedDates(dayjs());
                    } else if (value === 'dateRange') {
                      setSelectedDates([defaultFromDate, defaultToDate]);
                      setFromDate(defaultFromDate.format('DD-MMM-YYYY'));
                      setToDate(defaultToDate.format('DD-MMM-YYYY'));
                    }
                  }}
                >
                  <Option value="yearMonth">Month Wise</Option>
                  <Option value="dateRange">Date Range</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col>
              {filterType === 'yearMonth' && (
                <Form.Item label={<label style={formLabelStyle}>Month</label>}
            
                  style={formItemStyle}>
                  <DatePicker
                    style={formBoxStyle}
                    picker="month"
                    defaultValue={dayjs()}
                    value={selectedDates}
                    onChange={(date, dateString) => {
                      setMonth(dateString);
                      setSelectedDates(date);
                      setCurrentPage(1)
                    }}
                    required
                  />
                </Form.Item>
              )}
              {filterType === 'dateRange' && (
                <Form.Item label={<label style={formLabelStyle}>Date Range</label>} style={formItemStyle}>
                  <RangePicker
                    style={{ ...formBoxStyle, width: '230px' }}
                    value={selectedDates}
                    onChange={(dates, dateStrings) => {
                      setFromDate(dateStrings[0]);
                      setToDate(dateStrings[1]);
                      setSelectedDates(dates);
                      setCurrentPage(1)
                    }}
                    required
                  />
                </Form.Item>
              )}
            </Col>
            <Col>
              <Form.Item label={<label style={formLabelStyle}>Crop</label>}>
                <Select
                  style={formBoxStyle}
                  placeholder="Select Crop"
                  allowClear
                  options={crops}
                  value={selectedCrop}
                  onChange={setSelectedCrop}
                  
                  showSearch
                  filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                />
              </Form.Item>
            </Col>
            <Col>
              <Form.Item label={<label style={formLabelStyle}> Type</label>}>
                <Select
                  style={formBoxStyle}
                  placeholder="Select Type"
                  allowClear
                  value={selectedCpnType}
                  onChange={setSelectedCpnType}
                  options={PESTS_LIST}
                />

              </Form.Item>
            </Col>
               <Col>
              <Form.Item label={<label style={formLabelStyle}> Problem Type</label>}>
                <Select
                  style={formBoxStyle}
                  placeholder="Select Type"
                  allowClear
                 // value={selectedProblemType}
                  onChange={setSelectedProblemType}
                  options={PROBLEM_LIST}
                />
              </Form.Item>
            </Col>
            <Col>
              <Form.Item label={<label style={formLabelStyle}> Intensity</label>}>
                <Select
                  style={formBoxStyle}
                  placeholder="Select Intensity"
                  allowClear
                  options={INTENSITY_SELECT_TYPE}
                 // value={selectedIntensity}
                  onChange={setSelectedIntensity}
                />
              </Form.Item>
            </Col>
            
            <Col>
              <Form.Item style={{ marginBottom: -8 }}>
                <Button type="primary" htmlType="submit"
                  loading={isLoading} >
                  Apply
                </Button>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Card>

      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <Spin size="large" />
        </div>
      ) : (
    
        
      <Table
          title={
            reportData.length > 0
              ? () => (
                <div style={{ fontWeight: 'bold', fontSize: '16px', color: '#1a1a1a' }}>
                  Total Records: {totalRecords}
                </div>
              )
              : undefined
          }
          columns={columns}
          dataSource={reportData}
          rowKey="uuid"

        rowClassName={(record) => {
            if (record.readStatus === 2) {
              return 'ant-table-row-green'
            }
    }}  
          pagination={{
            current: currentPage,
            pageSize: pageSize,
            total: totalRecords,
            showSizeChanger: true,
            pageSizeOptions: ['10', '20', '50', '100'],
            onChange: (page, size) => {
              setCurrentPage(page);
              setPageSize(size);
            },
            onShowSizeChange: (current, size) => {
              setPageSize(size);
              setCurrentPage(1);
            }
          }}
          scroll={{ x: 1400 }}
        />
       )}

      {modalVisible &&
        <FarmerProblemsModal
          farmerId={selectedFarmerId}
          modalVisible={modalVisible}
          setModalVisible={setModalVisible}
          apiHeader={apiHeader}
        />
      }

   {previewVisible && (
  <Modal
    open={previewVisible}
    footer={null}
    onCancel={() => setPreviewVisible(false)}
    width={800}
    bodyStyle={{ padding: '20px' }}
  >
    {Array.isArray(previewImages) && previewImages.length > 0 ? (
      <div>
        <Image.PreviewGroup
          preview={{
            current: 0, 
            onChange: (current) => console.log('Current image:', current),
          }}
        >
          <Spin spinning={imageLoading} tip="Loading images...">
            <Carousel
              arrows 
               infinite={false}
               
      afterChange={(current) => setCurrentImageIndex(current)}
            >
              {previewImages.map((img, index) => (
                <div key={index}>
                  <div style={{
                    height: '450px',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
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
                  <div style={{ textAlign: 'center', marginTop: '10px' }}>
                    Image {index + 1} of {previewImages.length}
                  </div>
                </div>
              ))}
            </Carousel>
          </Spin>
        </Image.PreviewGroup>
      </div>
    ) : (
      <div style={{ textAlign: 'center', padding: '20px' }}>
        No images available
      </div>
    )}
  </Modal>
)}

      <LogoutComponent open={isSessionExpiredVisible} />
    </>
  );
};

export default ProblemReport;