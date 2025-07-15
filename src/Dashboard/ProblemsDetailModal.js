import React, { useState, useEffect } from 'react';
import { Modal, Table,Space, Tag,Carousel, Radio, Tooltip, message,Button, Spin, Empty, Image } from 'antd';
import {  FileOutlined, PlayCircleOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';
import axios from 'axios';
import { API_URLS, PEST_TYPE, INTENSITY_TYPES,LOCAL_STORAGE_CONSTANTS } from '../configure/MyUtilsConfig';
import { useOutletContext } from 'react-router-dom';
import LogoutComponent from '../logout/LogoutComponent';

const ProblemsDetailModal = (props) => {
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
    const [problemTypeFilter, setProblemTypeFilter] = useState(null);
const [currentImageIndex, setCurrentImageIndex] = useState(0);
const getCpnTypeId = (name) => {
  const entry = Object.entries(PEST_TYPE).find(([key, value]) => value === name);
  return entry ? parseInt(entry[0]) : null;
};

    useEffect(() => {
        if (props.open && props.inputId && props.handleModalStausType) {
            fetchProblemDetails();
        }
    }, [props.open, props.inputId, props.handleModalStausType, props.filterType,
    props.month, props.fromDate, props.toDate, currentPage, pageSize, problemTypeFilter]);
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
            if (!props.inputId || !props.handleModalStausType) {
                message.error('Missing required parameters');
                return;
            }

            const requestData = {
                cropId: props.inputId,
  cpnType: getCpnTypeId(props.handleModalStausType), 

                type: props.filterType,
                yearMonth: props.month,
                fromDate: props.fromDate,
                toDate: props.toDate,
                page: currentPage,
                size: pageSize,
                problemType: problemTypeFilter
            };

            const response = await axios.post(
                API_URLS.PROBLEMS_REPORT_GET_ALL,
                requestData,
                { headers: apiHeader }
            );

            console.log('API Response:', response.data); 

            if (response.data.status === 1) {
                const content = response.data.content;

                if (content && content.data) {
                    setProblemData(content.data);
                    setTotalRecords(content.totalRecords || 0);
                } else {
                    setProblemData([]);
                    setTotalRecords(0);
                }
            } else if (response.data.status === 2) {
                setIsSessionExpiredVisible(true);
            } else {
                message.error(response.data.mssg || 'Failed to fetch problem details');
            }
        } catch (error) {
            console.error('API Error:', error);
            message.error(error.response?.data?.mssg || 'Failed to fetch problem details');
        } finally {
            setIsLoading(false);
        }
    };
    const handlePreviewImages = (images) => {
        try {
            const parsedImages = typeof images === 'string' ? JSON.parse(images) : images;
            if (Array.isArray(parsedImages)) {
                  setImageLoading(true); 
                setPreviewImages(parsedImages);
                setPreviewVisible(true);
            }
        } catch (error) {
            console.error('Error parsing images:', error);
            message.error('Failed to load images');
        }
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
                    case 2: return <Tag color="green">UnKnown</Tag>;
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
          dataIndex: 'images',
          key: 'images',
          width: 60,
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
          width: 130,
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
                    <div style={{ display: 'flex', justifyContent: 'flex-start', alignItems: 'center', gap: '16px' }}>
                        <span>{props.title}</span>
                        <Radio.Group
                            onChange={(e) => {
                                setProblemTypeFilter(e.target.value);
                                setCurrentPage(1); 
                            }}
                            value={problemTypeFilter}
                        >
                            <Radio.Button value={null}>All</Radio.Button>
                            <Radio.Button value={1}>Known</Radio.Button>
                            <Radio.Button value={2}>Unknown</Radio.Button>
                        </Radio.Group>
                    </div>
                }
                open={props.open}
                onCancel={() => props.onClose()}
                footer={null}
                width="90%"
                style={{ top: 20 }}
            >
                {isLoading ? (
                    <Spin tip="Loading...">
                        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                    </Spin>
                ) : (
                    <Table
                        dataSource={problemData}
                        columns={columns}
                        size="small"
                        rowKey="id"
                             rowClassName={(record) => {
            if (record.readStatus === 2) {
              return 'ant-table-row-green'
            }
    }} 
                        scroll={{ x: 'max-content' }}
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

export default ProblemsDetailModal;