import React, { useState } from "react";
import { Form, Row, Col, Spin, Card, message,Carousel, Tooltip, Table, Empty, Tag, Button, Typography, Input, Modal, Image } from 'antd';
import { FileOutlined, PlayCircleOutlined,} from '@ant-design/icons';
import { useOutletContext } from "react-router-dom";
import { API_URLS, INTENSITY_TYPES, INTENSITY_TYPES_COLORS, PEST_TYPE, PROBLEM_TYPE } from "../configure/MyUtilsConfig";
import dayjs from 'dayjs';
import axios from "axios";
import LogoutComponent from "../logout/LogoutComponent";

const FarmersOverviewReport = () => {
  const [form] = Form.useForm();
  const { apiHeader } = useOutletContext();
  const [isLoading, setIsLoading] = useState(false);
  const [problemsData, setProblemsData] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);

  const [selectedFarmer, setSelectedFarmer] = useState({});
  const [isSessionExpiredVisible, setIsSessionExpiredVisible] = useState(false);
  const [previewImages, setPreviewImages] = useState([]);
  const [previewVisible, setPreviewVisible] = useState(false);
const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
const [imageLoading, setImageLoading] = useState(true);


  const fetchFarmerData = async (phoneNumber) => {
    if (!phoneNumber) {
      message.warning('Please enter a phone number');
      return;
    }

    try {
      setIsLoading(true);
      setSelectedFarmer(null);
      setProblemsData([]);
      setHasSearched(false);
      const response = await axios.get(
        API_URLS.FARMERS_OVERVIEW_REPORT + phoneNumber,
        { headers: apiHeader }
      );

      if (response.data.status === 1) {
        if (response.data.content[0]) {
          const farmer = response.data.content[0].farmersList;
          setSelectedFarmer(response.data.content[0].farmersList);
          setProblemsData(response.data.content[0].problemsList);
          setHasSearched(true);
        } else {
          message.warning(response.data.mssg);
        }
      } else if (response.data.status === 2) {
        setIsSessionExpiredVisible(true);
      } else {
        message.error(response.data.mssg );
      }
    } catch (error) {
      console.error('Error fetching farmer data:', error);
      message.error('Failed to fetch farmer data');
    } finally {
      setIsLoading(false);
    }
  };

  const onFinish = (values) => {
    fetchFarmerData(values.phoneNumber);
  };

  const handlePreviewImages = (images) => {
    if (Array.isArray(images) && images.length > 0) {
        setImageLoading(true);
      setPreviewImages(images);
      setPreviewVisible(true);
        setCurrentImageIndex(0);
    }
  };



  const problemColumns = [
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
      title: 'Crop',
      dataIndex: 'cropName',
      key: 'cropName',
      render: (text) => text || '---'
    },
    {
      title: 'Problem Type',
      dataIndex: 'problemType',
      key: 'problemType',
      render: (type) => type ? <Tag color={type === 1 ? "orange" : "green"}>{PROBLEM_TYPE[type]}</Tag> : '---'
    },
    {
      title: 'Type',
      dataIndex: 'cpnType',
      key: 'cpnType',
      render: (cpnType) => (
        <Tag color="blue">{PEST_TYPE[cpnType] || '---'}</Tag>
      )
    },
    {
      title: 'Intensity',
      dataIndex: 'intensityType',
      key: 'intensityType',
      render: (intensity) => (
        <Tag color={INTENSITY_TYPES_COLORS[intensity] || 'default'}>
          {INTENSITY_TYPES[intensity] || '---'}
        </Tag>
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
        const imageArray = Array.isArray(images) ? images : (typeof images === 'string' ? JSON.parse(images) : []);
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
  ];

  return (
    <>
      <Typography.Title level={4}>{'Dashboard >> Farmers Overview Report'}</Typography.Title>

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
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Row align="middle" gutter={[16, 16]}>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Form.Item
                label="Mobile Number"
                name="phoneNumber"
                rules={[
                  { required: true, message: 'Please enter Mobile number' },
                  { pattern: /^[0-9]{10}$/, message: 'Please enter a valid 10-digit Mobile number' }
                ]}
              >
                <Input
                  placeholder="Enter 10-digit Mobile number"
                  maxLength={10}
                  allowClear
                />
              </Form.Item>
            </Col>
            <Col xs={24} sm={12} md={6} lg={4}>
              <Form.Item >
                <Button
                  type="primary"
                  htmlType="submit"
                  loading={isLoading}
                  style={{ marginTop: '30px' }}
                >
                  Apply
                </Button>
              </Form.Item>
            </Col>
          </Row>
        </Form>
      </Card>


        <Typography.Title level={5} style={{ marginTop: "20px", fontSize: '15px', marginBottom: '3px' }}>
          {selectedFarmer ? `Farmer Details` : 'Farmer Details'}
        </Typography.Title>

        <Card size="small" style={{
          backgroundColor: '#ffffff',
          border: '1px solid #d3d3d3',
          width: '100%',
            padding: '10px',
          boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
          marginBottom: '16px',
          borderRadius: "8px",

        }}
        >
          {isLoading ? (
            <Spin><Empty image={Empty.PRESENTED_IMAGE_SIMPLE} /></Spin>
          ) : hasSearched ? (
            selectedFarmer ? (
              <Row gutter={16}>

                <Col span={8}>
                  <div style={{ padding: '10px' }}>

                    <div style={{ marginBottom: '15px' }}>
                      <Typography.Text strong style={{ fontSize: '16px' }}>Date: </Typography.Text>
                      <Typography.Text>
                        {selectedFarmer.createdDate ? dayjs(selectedFarmer.createdDate).format('DD-MMM-YYYY ') : 'N/A'}
                      </Typography.Text>
                    </div>
                    <div style={{ marginBottom: '15px' }}>
                      <Typography.Text strong style={{ fontSize: '16px' }}>Name: </Typography.Text>
                      <Typography.Text>{selectedFarmer.name || '---'}</Typography.Text>
                    </div>
                    <div style={{ marginBottom: '15px' }}>
                      <Typography.Text strong style={{ fontSize: '16px' }}>Mobile: </Typography.Text>
                      <Typography.Text>{selectedFarmer.mobileNumber || '---'}</Typography.Text>
                    </div>


                  </div>
                </Col>

                <Col span={8}>
                  <div style={{ padding: '10px' }}>
                    <div style={{ marginBottom: '15px' }}>
                      <Typography.Text strong style={{ fontSize: '16px' }}>Email: </Typography.Text>
                      <Typography.Text>{selectedFarmer.email || '---'}</Typography.Text>
                    </div>
                    {/* <div style={{ marginBottom: '15px' }}>
                      <Typography.Text strong style={{ fontSize: '16px' }}>Address: </Typography.Text>
                      <Typography.Text>{selectedFarmer.address || '---'}</Typography.Text>
                    </div> */}

                    <div style={{ marginBottom: '15px' }}>
                      <Typography.Text strong style={{ fontSize: '16px' }}>Status: </Typography.Text>
                      {selectedFarmer.status === 1 ? (
                        <Tag color="success">Active</Tag>
                      ) : (
                        <Tag color="error">Deactive</Tag>
                      )}
                    </div>
                  </div>
                </Col>

                <Col span={8}>
                  <div style={{ padding: '10px' }}>
                    <div style={{ marginBottom: '15px' }}>
                      <Typography.Text strong style={{ fontSize: '16px' }}>District: </Typography.Text>
                      <Typography.Text>{selectedFarmer.districtName || '---'}</Typography.Text>
                    </div>
                    <div style={{ marginBottom: '15px' }}>
                      <Typography.Text strong style={{ fontSize: '16px' }}>Mandal: </Typography.Text>
                      <Typography.Text>{selectedFarmer.mandalName || '---'}</Typography.Text>
                    </div>
                    <div style={{ marginBottom: '15px' }}>
                      <Typography.Text strong style={{ fontSize: '16px' }}>Village: </Typography.Text>
                      <Typography.Text>{selectedFarmer.villageName || '---'}</Typography.Text>
                    </div>

                  </div>
                </Col>
              </Row>
            ) : (
              <Empty description="No farmer data found" />
            )
          ) : (
            <Empty description="Farmers Data" />
          )}
        </Card>

        <Typography.Title level={5} style={{ marginTop: "20px", fontSize: '15px', marginBottom: '3px' }}>
          {selectedFarmer ? `Problems Details (${problemsData.length})` : 'Problems Details'}
        </Typography.Title>

        <Card
          size="small"
          style={{
            backgroundColor: '#ffffff',
            border: '1px solid #d3d3d3',
            width: '100%',
            padding: '10px',
            boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
            marginBottom: '16px'
          }}
        >
          {isLoading ? (
            <Spin><Empty image={Empty.PRESENTED_IMAGE_SIMPLE} /></Spin>
          ) : selectedFarmer ? (
            problemsData.length > 0 ? (
              <Table
                columns={problemColumns}
                dataSource={problemsData}
                rowKey="id"
                 pagination={{
                                    current: currentPage,
                                    total: problemsData.length,
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
                
                scroll={{ x: true }}
                size="small"
              />
            ) : (
              <Empty description="problems Data" />
            )
          ) : (
            <Empty description="Problems Data" />
          )}
        </Card>
     
{previewVisible && (
  <Modal
    open={previewVisible}
    footer={null}
    onCancel={() => setPreviewVisible(false)}
    width={800}
    bodyStyle={{ padding: '20px' }}
  >
    <Spin
      spinning={imageLoading}
      tip="Loading images..."
      size="large"
    >
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
                    preview={{
                      visible: false,
                    }}
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

export default FarmersOverviewReport;