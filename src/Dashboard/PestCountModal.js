import React, { useState, useEffect } from 'react';
import {
      open, 
  Modal, 
  Table, 
  Tag,  
  Tooltip, 
  message, 
  Button, 
  Spin, 
  Empty, 
  Image,Space,
  
} from 'antd';
import { FileOutlined, PlayCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import axios from 'axios';
import { API_URLS, PEST_TYPE, INTENSITY_TYPES,LOCAL_STORAGE_CONSTANTS } from '../configure/MyUtilsConfig';
import { useOutletContext } from 'react-router-dom';
import LogoutComponent from '../logout/LogoutComponent';

const PestcountModal = ({
    open,
  onClose,
  inputId,
  handleModalStausType,
  title,
  filterType,
  month,
  fromDate,
  toDate,cpnType,
}) => {
  const { apiHeader } = useOutletContext();
  const [isLoading, setIsLoading] = useState(false);
  const [problemData, setProblemData] = useState([]);
  const [isSessionExpiredVisible, setIsSessionExpiredVisible] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalRecords, setTotalRecords] = useState(0);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImages, setPreviewImages] = useState([]);
  const [imageLoading, setImageLoading] = useState(true);
const [currentImageIndex, setCurrentImageIndex] = useState(0);



  useEffect(() => {
    console.log('Fetching problems for:', {
      cropId: inputId,
      pestId: handleModalStausType
    });
    if (open && inputId) { 
      fetchProblemDetails();
    }
  }, [open, inputId, handleModalStausType, currentPage, pageSize]);

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
      await fetchProblemDetails();
      setProblemData(prevData => 
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

 const fetchProblemDetails = async () => {
    setIsLoading(true);
    try {
      const requestData = {
        cropId: inputId,
      cropPestNutritionDiseaseId: handleModalStausType === "all" ? null : handleModalStausType,  
        type: filterType,
        yearMonth: month,
        fromDate: fromDate,
        toDate: toDate,
        page: currentPage,
        size: pageSize,
          problemType: 1,
          cpnType:cpnType,

      };
      const response = await axios.post(
        API_URLS.PROBLEMS_REPORT_GET_ALL,
        requestData,
        { headers: apiHeader }
      );

      if (response.data.status === 1) {
        const content = response.data.content;
        if (content && content.data) {
          const parsedData = content.data.map(item => ({
            ...item,
               problemImgs: item.problemImgs ? parseImages(item.problemImgs) : [],
          problemAudioUrl: item.problemAudioUrl 
            ? item.problemAudioUrl.startsWith('http') 
              ? item.problemAudioUrl 
              : `${API_URLS.BASE_URL}${item.problemAudioUrl}`
            : null,
                cpnType: item.cpnType
            
        }));
          setProblemData(parsedData);
          setTotalRecords(content.totalRecords || 0);
        } else {
          setProblemData([]);
          setTotalRecords(0);
        }
      } else if (response.data.status === 2) {
        setIsSessionExpiredVisible(true);
      } else {
        message.error(response.data.mssg );
      }
    } catch (error) {
      message.error(error.response?.data?.mssg );
    } finally {
      setIsLoading(false);
    }
  };


const parseImages = (images) => {
  try {
    if (!images) return [];
    if (typeof images === 'string') {
      try {
        const parsed = JSON.parse(images);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        return images.split(',').map(img => img.trim());
      }
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

  

  const columns = [
    {
      title: 'Date',
      dataIndex: 'createdDate',
      key: 'createdDate',
      width: 150,
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
      key: 'farmerName',
      render: (text) => text || '---'
    },
    {
      title: 'Crop',
      dataIndex: 'cropName',
      key: 'cropName',
      render: (text) => text || '---'
    },
    {
      title: 'Problem Type',
      dataIndex: 'problemType',
      key: 'problemType',
      render: (type) => {
        switch (type) {
          case 1: return <Tag color="orange">Known</Tag>;
          case 2: return <Tag color="green">Unknown</Tag>;
          default: return '---';
        }
      }
    },
    {
      title: 'Type',
      dataIndex: 'cpnType',
      key: 'cpnType',
      render: (cpnType) => (
        <Tag color="blue">{PEST_TYPE[cpnType] || 'N/A'}</Tag>
      )
    },
    {
      title: 'Intensity',
      dataIndex: 'intensityType',
      key: 'intensityType',
      render: (intensity) => (
        <Tag color="orange">{INTENSITY_TYPES[intensity] || 'N/A'}</Tag>
      )
    },
    {
      title: 'Description',
      dataIndex: 'des',
      key: 'des',
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
      render: (images) => {
        const imageArray = parseImages(images);
        return imageArray.length > 0 ? (
          <Button
            type="link"
            icon={<FileOutlined />}
        onClick={() => {
          setImageLoading(true);
          setPreviewImages(imageArray);
          setPreviewVisible(true);
          setCurrentImageIndex(0);
        }}
           
          />
        ) : '---';
      }
    },
    {
      title: 'Audio',
      dataIndex: 'problemAudioUrl',
      key: 'problemAudioUrl',
      render: (url) => (
        url ? (
          <Button 
            type="link" 
            icon={<PlayCircleOutlined />}
            onClick={() => window.open(url, '_blank')}
          />
        ) : '---'
      )
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
      )
    },
    {
  title: 'Action',
  key: 'action',
  fixed: 'right',
  width: 150,

   filters: [
            { text: 'Read', value: 1 },
            { text: 'Mark as Read', value: 2 },
          ],
        
          
          onFilter: (value, record) => record.readStatus === value,
            
          sorter: (a, b) => a.readStatus - b.readStatus,  
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

  return (
    <>
      <Modal
        title={
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>{title}</span>
          
          </div>
        }
       open={open} 
       onCancel={onClose}
        footer={null}
        width="90%"
        style={{ top: 20 }}
        destroyOnClose
      >
        {isLoading ? (
          <Spin tip="Loading..." size="large">
            <div style={{ minHeight: '200px' }} />
          </Spin>
        ) : (
          <Table
            dataSource={problemData}
            columns={columns}
            size="small"
            rowKey="uuid"
            scroll={{ x: 'max-content' }}
               rowClassName={(record) => {
            if (record.readStatus === 2) {
              return 'ant-table-row-green'
            }
    }}
            pagination={{
              current: currentPage,
              pageSize,
              total: totalRecords,
              showSizeChanger: true,
              pageSizeOptions: ['10', '20', '50', '100'],
              onChange: (page, size) => {
                setCurrentPage(page);
                setPageSize(size);
              },
            }}
            locale={{
              emptyText: <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description="No data found" />
            }}
          />
        )}
      </Modal>

   {previewVisible && (
  <Modal
    open={previewVisible}
    footer={null}
    onCancel={() => setPreviewVisible(false)}
    width={800}
    bodyStyle={{ padding: '20px' }}
  >
    <Spin spinning={imageLoading} tip="Loading images...">
      {previewImages.length > 0 ? (
        <div>
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
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          No images available
        </div>
      )}
    </Spin>
  </Modal>
)}

      <LogoutComponent open={isSessionExpiredVisible} />
    </>
  );
};

export default PestcountModal;