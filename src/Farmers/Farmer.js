import React, { useState, useEffect } from 'react';
import {
  Table, Card, Typography, Spin, Button, Form, Select,
  Row, Col, Tooltip, message, Tag, DatePicker,
} from 'antd';
import { API_URLS, } from '../configure/MyUtilsConfig';
import axios from 'axios';
import { useOutletContext } from 'react-router-dom';
import { EditOutlined, PlusOutlined, QuestionCircleOutlined } from '@ant-design/icons';
import LogoutComponent from '../logout/LogoutComponent';
import FarmerModal from './FarmerModal';
import dayjs from 'dayjs';
import FarmerProblemsModal from './FarmerProblemsModal';
const { RangePicker } = DatePicker;
const { Title } = Typography;
const { Option } = Select;

const Farmer = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [farmersData, setFarmersData] = useState([]);
  const [isSessionExpiredVisible, setIsSessionExpiredVisible] = useState(false);
  const { apiHeader } = useOutletContext();
  const [form] = Form.useForm();

  const [districts, setDistricts] = useState([]);
  const [mandals, setMandals] = useState([]);
  const [villages, setVillages] = useState([]);

  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [selectedMandal, setSelectedMandal] = useState(null);
  const [selectedVillage, setSelectedVillage] = useState(null);

  const [month, setMonth] = useState(dayjs().format('YYYY-MM'));
  const [fromDate, setFromDate] = useState('');
  const defaultFromDate = dayjs().subtract(30, 'day').startOf('day');
  const defaultToDate = dayjs().endOf('day');
  const [toDate, setToDate] = useState('');
  const [filterType, setFilterType] = useState('yearMonth');

  const [selectedDates, setSelectedDates] = useState(dayjs().startOf('month'));
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedFarmerId, setSelectedFarmerId] = useState(null);

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedFarmer, setSelectedFarmer] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
const [isLoadingDistricts, setIsLoadingDistricts] = useState(false); 
  const [totalCount, setTotalCount] = useState('');

  const [dataMap, setDataMap] = useState({});

  const formLabelStyle = { fontSize: 14, fontWeight: 500, width: '100%' };
  const formBoxStyle = { fontSize: 12, fontWeight: 500, width: '200px' };
  const formItemStyle = { marginBottom: 21 };

  useEffect(() => {
  }, []);

  useEffect(() => {
    fetchFarmersData();

    fetchLocationsData();
  }, [currentPage, pageSize,]);

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
    
  const fetchFarmersData = async () => {
    setIsLoading(true);
    try {
      const params = {
        type: filterType,
        yearMonth: month,
        fromDate: fromDate,
        toDate: toDate,
        districtId: selectedDistrict,
        mandalId: selectedMandal,
        villageId: selectedVillage,
        page: currentPage,
        size: pageSize
      };

      const response = await axios.post(API_URLS.GET_ALL_FARMER, params, {
        headers: apiHeader
      });

      if (response.data.status === 1) {
        const content = response.data.content;
        if (content && content.data) {
          setFarmersData(content.data);
          setTotalCount(content.totalRecords || 0);
          setCurrentPage(1);

        } else {
          setFarmersData(content);
          setTotalCount(content.length);
        }
      } else if (response.data.status === 2) {
        setIsSessionExpiredVisible(true);
      } else {
        message.error(response.data.mssg || 'Failed to fetch farmers data');
      }
    } catch (error) {
      message.error('Failed to fetch farmers data: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };
  const handleAddFarmer = () => {
    setIsEditMode(false);
    setSelectedFarmer(null);
    setIsModalVisible(true);
  };

  const handleEditFarmer = (record) => {
    setIsEditMode(true);
    setSelectedFarmer(record);
    setIsModalVisible(true);
  };

  const handleDistrictChange = (value) => {
    setSelectedDistrict(value);
    setSelectedMandal(null);
    setSelectedVillage(null);
    form.setFieldsValue({ mandalId: null, villageId: null });
    setCurrentPage(1);
  };

  const handleMandalChange = (value) => {
    setSelectedMandal(value);
    setSelectedVillage(null);
    form.setFieldsValue({ villageId: null });
    setCurrentPage(1);
  };

  const handleVillageChange = (value) => {
    setSelectedVillage(value);
    setCurrentPage(1);
  };

  const filteredMandals = selectedDistrict
    ? mandals.filter(m => m.districtId === selectedDistrict)
    : [];

  const filteredVillages = selectedMandal
    ? villages.filter(v => v.mandalId === selectedMandal)
    : [];

  const columns = [
    {
      title: 'Date',
      dataIndex: 'createdDate',
      key: 'createdDate',
      width: 160,
      sorter: (a, b) => {
        const dateA = a.createdDate ? dayjs(a.createdDate).valueOf() : 0;
        const dateB = b.createdDate ? dayjs(b.createdDate).valueOf() : 0;
        return dateA - dateB;
      },
      defaultSortOrder: 'descend',
      render: (text) => text ? dayjs(text).format('HH:mm DD-MMM-YYYY') : '---'
    },
    {
      title: 'Name',
      dataIndex: 'farmerName',
      key: 'farmerName',
      render: (text) => text || '---'
    },

    {
      title: 'Mobile Number',
      dataIndex: 'mobileNumber',
      key: 'mobileNumber',
      render: (text) => text || '---'
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
      render: (text) => text || '---'
    },
    {
      title: 'District',
      dataIndex: 'districtName',
      key: 'districtName',
      render: (text) => text || '---'
    },

    {
      title: 'Mandal',
      dataIndex: 'mandalName',
      key: 'mandalName',
      render: (text) => text || '---'
    },
    {
      title: 'Village',
      dataIndex: 'villageName',
      key: 'villageName',
      render: (text) => text || '---'
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
      fixed: 'right',
      render: (text, record) => (<>
        <Tooltip title="View Problems">
          <Button
            type="link"
            icon={<QuestionCircleOutlined />}
            onClick={() => handleViewProblems(record.uuid)}
          />
        </Tooltip>
        <Button
          type="link"
          icon={<EditOutlined />}
          onClick={() => handleEditFarmer(record)}
        />

      </>
      ),
    }
  ];

  const handleViewProblems = (farmerId) => {
    setSelectedFarmerId(farmerId);
    setModalVisible(true);
  };

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title level={4}>{'Farmers Management >> Farmers Data Report'}</Title>
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
       // onFinish={fetchFarmersData} 
        >
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
                      setCurrentPage(1);
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
                      setCurrentPage(1);
                    }}
                    required
                  />
                </Form.Item>
              )}
            </Col>
            <Col >
              <Form.Item label={<label style={formLabelStyle}>District</label>}>
                <Select
                  placeholder="Select District"
                  style={formBoxStyle}
                  allowClear
                  options={districts}
                  value={selectedDistrict}
                  onChange={handleDistrictChange}
                  showSearch
                  filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                />
              </Form.Item>
            </Col>
            <Col >
              <Form.Item label={<label style={formLabelStyle}>Mandal</label>}>
                <Select
                  placeholder="Select Mandal"
                  style={formBoxStyle}
                  allowClear
                  options={filteredMandals}
                  value={selectedMandal}
                  onChange={handleMandalChange}
                  disabled={!selectedDistrict}
                  showSearch
                  filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                />
              </Form.Item>
            </Col>
            <Col >
              <Form.Item label={<label style={formLabelStyle}>Village</label>}>
                <Select
                  placeholder="Select Village"
                  style={formBoxStyle}
                  allowClear
                  options={filteredVillages}
                  value={selectedVillage}
                  onChange={handleVillageChange}
                  disabled={!selectedMandal}
                  showSearch
                  filterOption={(input, option) =>
                    (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                  }
                />
              </Form.Item>
            </Col>
            <Col >
              <Form.Item style={{ marginBottom: -8 }}>
                <Button
                  type="primary"
                  onClick={() => {
                    fetchFarmersData();
                  }}
                  loading={isLoading}
                >
                  Apply
                </Button>
              </Form.Item>
            </Col>
            <Col >
              <Form.Item style={{ marginBottom: -8 }}>
                <Button
                  type="primary"
                  icon={<PlusOutlined />}
                  onClick={handleAddFarmer}
                >
                  Add Farmer
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

            farmersData.length > 0
              ? () => (
                <div
                  style={{
                    fontWeight: 'bold',
                    fontSize: '16px',
                    color: '#1a1a1a',
                  }}
                >
                  Total Records: {totalCount}
                </div>
              )
              : undefined}
          columns={columns}
          dataSource={farmersData}
          rowKey="uuid"
          pagination={{
            current: currentPage,
            pageSize,
            total: totalCount,
            showSizeChanger: true,
            pageSizeOptions: ['5', '10', '15', '20'],
            onChange: (page, size) => {
              setCurrentPage(page);
              setPageSize(size);
            },
            onShowSizeChange: (current, size) => {
              setPageSize(size);
              setCurrentPage(1);
            }
          }}
          scroll={{ x: 1200 }}
        />
      )}
{isModalVisible && (
      <FarmerModal
       open ={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        onSuccess={fetchFarmersData}
        farmer={selectedFarmer}
        isEditMode={isEditMode}
        districts={districts}
        mandals={mandals}
        villages={villages}
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

      <LogoutComponent open={isSessionExpiredVisible} />
    </>
  );
};



export default Farmer;
