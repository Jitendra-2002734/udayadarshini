
import React, { useState, useEffect } from 'react';
import {
  Table, Card, Typography, Spin, Button, Form, Select, Image,
  Row, Col, DatePicker, message, Tag, Modal,
} from 'antd';
import dayjs from 'dayjs';

import { FileOutlined, PieChartOutlined } from '@ant-design/icons';
import { API_URLS, PEST_TYPE, } from '../configure/MyUtilsConfig';
import axios from 'axios';
import { useOutletContext } from 'react-router-dom';
import PestcountModal from './PestCountModal';
import LogoutComponent from '../logout/LogoutComponent';
import PieChartModal from './PieChartModal';
const { Title } = Typography;
const { Option } = Select;
const { RangePicker } = DatePicker;
const PestNutitionDiseaseSummaryReport = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [reportData, setReportData] = useState([]);
  const [isSessionExpiredVisible, setIsSessionExpiredVisible] = useState(false);
  const { apiHeader } = useOutletContext();
  const [form] = Form.useForm();
  const [totalRecords, setTotalRecords] = useState(0);

  const [selectedCropId, setSelectedCropId] = useState(null);
  const [selectedCropName, setSelectedCropName] = useState('');

  const [dataMap, setDataMap] = useState({});

  const [pestMap, setPestMap] = useState({});
  const [selectedCpnType, setSelectedCpnType] = useState(null);
  const [isLoadingPests, setIsLoadingPests] = useState(false);
  const [isPestsLoaded, setIsPestsLoaded] = useState(false);
  const [allPests, setAllPests] = useState([]);

  const [selectedCrop, setSelectedCrop] = useState(null);
  const [month, setMonth] = useState(dayjs().format('YYYY-MM'));
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const [selectedDates, setSelectedDates] = useState(dayjs().startOf('month'));
  const [modalVisible, setModalVisible] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewImages, setPreviewImages] = useState([]);
  const [filterType, setFilterType] = useState('all');
  const defaultFromDate = dayjs().subtract(30, 'day').startOf('day');
  const defaultToDate = dayjs().endOf('day');
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalInputId, setModalInputId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isPieChartModalVisible, setIsPieChartModalVisible] = useState(false);
  const [pieChartData, setPieChartData] = useState([]);
  const [pieChartTitle, setPieChartTitle] = useState('');
  const formLabelStyle = { fontSize: 14, fontWeight: 500, width: '100%' };
  const formBoxStyle = { fontSize: 12, fontWeight: 500, width: '200px' };
  const formItemStyle = { marginBottom: 21 };



  useEffect(() => {
    
    fetchMasterdata();
    fetchReportData();
  }, []);


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
        const PestsLists = response.data.content.filter(item => item.status === 1).map(obj => ({
          key: obj.uuid,
          label: obj.name,
          value: obj.uuid,
        }));
        setAllPests(PestsLists);
        setIsPestsLoaded(true);
        let tempMap = new Map();
        addKeyValuePair(tempMap, tempPestsList);
        setDataMap(tempMap);
        const pestsResponse = await axios.get(API_URLS.GET_ALL_CROP_PEST_NUTRITION_DISEASE, { headers: apiHeader });
        if (pestsResponse.data.status === 1) {
          const newPestMap = {};
          pestsResponse.data.content.forEach(item => {
            newPestMap[item.uuid] = item.title;
          });
          setPestMap(newPestMap);
        }
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

  const fetchReportData = async () => {
    setIsLoading(true);
    try {
      const requestData = {
        type: filterType,
        page: currentPage,
        size: pageSize,
        cropId: selectedCrop,

      };
      if (filterType !== 'all') {
        if (filterType === 'yearMonth') {
          requestData.yearMonth = month;
        } else if (filterType === 'dateRange') {
          requestData.fromDate = fromDate;
          requestData.toDate = toDate;
        }
      }

      const response = await axios.post(
        API_URLS.PEST_NUTRITION_DISEASE_Count_report,
        requestData,
        { headers: apiHeader }
      );

      if (response.data.status === 1) {
        const content = response.data.content;
        if (content && content.length > 0) {
          const parsedData = content.map(item => ({
            ...item,
            problemImgs: item.problemImgs ? JSON.parse(item.problemImgs) : []
          }));
          setReportData(parsedData);
          setTotalRecords(parsedData.length);
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

  const handleViewClick = async (record) => {
    setIsLoading(true);
    try {
      const requestData = {
        cropPestNutritionDiseaseId: record.cropPestNutritionDiseaseId,
        cropId: record.cropId,
        type: filterType,
      };
      if (filterType === 'yearMonth') {
        requestData.month = month;
      } else if (filterType === 'dateRange') {
        requestData.fromDate = fromDate;
        requestData.toDate = toDate;
      }

      const response = await axios.post(
        API_URLS.GET_PEST_INTENSITY_DATA,
        requestData,
        { headers: apiHeader }
      );

      if (response.data.status === 1) {
        const intensityData = response.data.content[0];
        const transformedData = [
          { name: 'Very Low', value: intensityData.veryLowCount || 0 },
          { name: 'Low', value: intensityData.lowCount || 0 },
          { name: 'Moderate', value: intensityData.moderateCount || 0 },
          { name: 'High', value: intensityData.highCount || 0 },
          { name: 'Very High', value: intensityData.veryHighCount || 0 }
        ];
        setPieChartData(transformedData);
      } else {
        message.error(response.data.mssg);
        setPieChartData([]);
      }

      setPieChartTitle(`${dataMap[record.cropId] || 'Crop'} - ${pestMap[record.cropPestNutritionDiseaseId] || 'Problem'}`);
      setIsPieChartModalVisible(true);
    } catch (error) {
      console.error("Error fetching intensity data:", error);
      message.error('Failed to load intensity data');
      setPieChartData([]);
      setIsPieChartModalVisible(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCountClick = (record) => {
    setSelectedCropId(record.cropId);
    setSelectedCropName(dataMap[record.cropId] || 'Unknown Crop');
    setModalTitle(`${dataMap[record.cropId] || 'Unknown Crop'} >> ${pestMap[record.cropPestNutritionDiseaseId] || 'All Problems'}`);
    setIsDetailModalVisible(true);
    setModalInputId(record.cropPestNutritionDiseaseId);

    setSelectedCpnType(record.type); 
  };


  const columns = [

    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      render: (text) => text || "---"
    },

    {
      title: 'Crop',
      dataIndex: 'cropId',
      key: 'cropId',
      render: (text) => text ? dataMap[text] : "---"

    },

    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      render: (type) => (
        <Tag color="blue">{PEST_TYPE[type] || 'N/A'}</Tag>
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
      title: 'Intensity Graph',
      key: 'action',
      align: 'center',
      render: (_, record) => (
        <Button
          type="link"
          icon={<PieChartOutlined />}
          onClick={() => handleViewClick(record)}
        >

        </Button>
      ),
    },

    {
      title: 'Total',
      dataIndex: 'problemsCount',
      key: 'problemsCount',
      align: 'center',
      sorter: (a, b) => (a.problemsCount || 0) - (b.problemsCount || 0),
      defaultSortOrder: 'descend',
      render: (text, record) => {
        const displayText = text || text === 0 ? text : '0';
        return (
          <Button
            type="link"
            disabled={!displayText || displayText === '0'}
            onClick={() => handleCountClick(record)}
          >
            <Tag color={text ? "blue" : "red"} style={{ fontSize: "12px" }}>
              {text || "0"}
            </Tag>
          </Button>
        );
      },
    }

  ];

const calculateTotals = () => {
  const totals = {
    problemsCount: 0,
    cropCount: 0,
    typeCount: 0
  };

  if (reportData.length === 0) return totals;

  // Count unique crops and types
  const uniqueCrops = new Set();
  const uniqueTypes = new Set();

  reportData.forEach((record) => {
    totals.problemsCount += record.problemsCount || 0;
    if (record.cropId) uniqueCrops.add(record.cropId);
    if (record.type) uniqueTypes.add(record.type);
  });

  totals.cropCount = uniqueCrops.size;
  totals.typeCount = uniqueTypes.size;

  return totals;
};
  return (
    <div>
      <>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Title level={4}>{"Dashboard >> Pest/Nutrition/Disease Summary Report "}</Title>
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

          <Form form={form} layout="vertical"   onFinish={fetchReportData}>
            <Row gutter={8} align="middle">
              <Col>
                <Form.Item label={<label style={formLabelStyle}>Type</label>} style={formItemStyle}>
                  <Select
                    value={filterType}
                    style={{ width: 150 }}
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
                      } else if (value === 'all') {

                        setMonth(null);
                        setFromDate(null);
                        setToDate(null);
                        setSelectedDates(null);
                      }
                    }}
                  >
                    <Option value="all">All</Option>
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

                      disabled={filterType === 'all'}
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

                      disabled={filterType === 'all'}
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
                    options={allPests}
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
                <Form.Item style={{ marginBottom: -7 }}>
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

            scroll={{ x: 900 }}
            summary={() => {
  const totals = calculateTotals();
  return (
    <Table.Summary fixed>
      <Table.Summary.Row style={{ backgroundColor: '#fafafa', fontWeight: 'bold' }}>
        <Table.Summary.Cell index={0}>Total </Table.Summary.Cell>
        
        <Table.Summary.Cell index={1}> Crops: {totals.cropCount}</Table.Summary.Cell>
        <Table.Summary.Cell index={2}>Types: {totals.typeCount}</Table.Summary.Cell>
        <Table.Summary.Cell index={3}>
          <Tag color="default">---</Tag>
        </Table.Summary.Cell>
        <Table.Summary.Cell index={4}>
          <Tag color="default">---</Tag>
        </Table.Summary.Cell>
     
        <Table.Summary.Cell index={5} align="center">
          <Tag color="blue" style={{ fontSize: "12px" }}>
            {totals.problemsCount}
          </Tag>
        </Table.Summary.Cell>
      </Table.Summary.Row>
    </Table.Summary>
  );
}}
          />
        )}

    
        {isDetailModalVisible && (
          <PestcountModal
            open={isDetailModalVisible}

            onClose={() => setIsDetailModalVisible(false)}
            inputId={selectedCropId}
            handleModalStausType={modalInputId}
            title={modalTitle}
            filterType={filterType}
            month={month}
            fromDate={fromDate}
            toDate={toDate}
            cpnType={selectedCpnType}
          />
        )}
        {isPieChartModalVisible && (
          <PieChartModal
            open={isPieChartModalVisible}
            onClose={() => setIsPieChartModalVisible(false)}

            title={pieChartTitle}
            data={pieChartData}
          />
        )}

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
                <Image.PreviewGroup>
                  <Row gutter={[16, 16]}>
                    {previewImages.map((img, index) => (
                      <Col span={8} key={index}>
                        <div style={{
                          height: '150px',
                          display: 'flex',
                          justifyContent: 'center',
                          alignItems: 'center',
                          border: '1px solid #f0f0f0',
                          borderRadius: '4px',
                          overflow: 'hidden'
                        }}>
                          <Image
                            src={img}
                            style={{
                              maxWidth: '100%',
                              maxHeight: '100%',
                              objectFit: 'contain'
                            }}
                            preview={{
                              mask: (
                                <div style={{
                                  display: 'flex',
                                  flexDirection: 'column',
                                  alignItems: 'center'
                                }}>
                                  <FileOutlined />
                                  <span>Preview</span>
                                </div>
                              )
                            }}
                          />
                        </div>
                      </Col>
                    ))}
                  </Row>
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
    </div>
  )
}

export default PestNutitionDiseaseSummaryReport
