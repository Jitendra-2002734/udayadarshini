import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Form, Select, DatePicker, Typography, Button, Table, Tooltip, Spin, message, Card, Row, Col, Modal, Tag, Radio,FloatButton } from 'antd';
import { API_URLS ,LOCAL_STORAGE_CONSTANTS,SPECIFIC_BROADCAST} from '../configure/MyUtilsConfig';
import { useOutletContext } from 'react-router-dom';
import LogoutComponent from '../logout/LogoutComponent';
import {  EditOutlined, FileOutlined,ArrowUpOutlined } from '@ant-design/icons';
import BroadcastModal from './BroadcastModal';
import dayjs from 'dayjs';
import BroadcastCountModal from './BroadcastCountModal';

const { Option } = Select;
const { RangePicker } = DatePicker;
const BroadcastReport = (props) => {

  const { apiHeader } = useOutletContext();

  const [isLoading, setIsLoading] = useState(false);
  const [filterType, setFilterType] = useState('yearMonth');
  const [isSessionExpiredVisible, setIsSessionExpiredVisible] = useState(false);
  const [month, setMonth] = useState(dayjs().format('YYYY-MM'));
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');
  const [form] = Form.useForm();
  const [selectedDates, setSelectedDates] = useState(null);
  const [allData, setAllData] = useState([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalInfo, setModalInfo] = useState({})

  const [broadcastCountModal, setBroadcastCountModal] = useState(false);
  const [broadcastInfo, setBroadcastInfo] = useState({})

  const formLabelStyle = { fontSize: 14, fontWeight: 500, width: '100%' };
  const formBoxStyle = { fontSize: 12, fontWeight: 500, width: '200px' };
  const formItemStyle = { marginBottom: 10 };

  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount,setTotalCount]=useState('');

  useEffect(() => {

    form.resetFields();
    form.setFieldValue('yearMonth', '');
  }, [apiHeader]);



  const handleFilterApply = async (values) => {
    const info = JSON.parse(localStorage.getItem(LOCAL_STORAGE_CONSTANTS.USER_INFO));

     
    setIsLoading(true);
    let input;
    input = {
      type: filterType,
      yearMonth: month,
      fromDate: fromDate,
      toDate: toDate,
      userIds: values.userIds,
      divId: info?.divId,
      
    }
    { console.log("payload", input) }
    try {
      const response = await axios.post(API_URLS.GET_BROADCAST_REPORT, input, { headers: apiHeader });
      if (response.data.status === 1) {
        const dataSource = response.data.content.map((item, index) => ({ ...item, key: index }));
        setAllData(dataSource);
        setCurrentPage(1);
        setTotalCount(dataSource.length);
      } else if (response.data.status === 2) {
        setIsSessionExpiredVisible(true)
      } else {
        setAllData([]);
        message.error(response.data.mssg || 'No data available for the selected filters');
      }
    } catch (error) {
      setAllData([]);
      message.error('An error occurred while fetching data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };


  const sendAgainBroadcast = (record) => {
    setModalInfo(record);
    setIsModalVisible(true);
  }

  const columns = [
    {
      title: () => <span style={{ fontSize: '13px' }}>Date</span>,
      dataIndex: 'createdDate',
      ellipsis: false,
      width: 140,
      sorter: (a, b) => {
        const dateA = a.createdDate ? dayjs(a.createdDate).valueOf() : 0;
        const dateB = b.createdDate ? dayjs(b.createdDate).valueOf() : 0;
        return dateA - dateB;
      },
      render: (text, record) => {
        const date = text ? dayjs(text).format('HH:mm DD-MM-YYYY ') : '---';
        return (
          <Tooltip title={`Date: ${text}`}>
            <span style={{ fontSize: '13px' }}>
              {date}
            </span>
          </Tooltip>
        );
      },
    },

    {
      key: 'title',
      title: () => <span style={{ fontSize: '13px' }}>Title</span>,
      dataIndex: 'title',
      ellipsis: false,
      render: (text) => (

        <Tooltip title={text}>
          <span style={{ fontSize: '13px' }}>{text}</span>
        </Tooltip>
      )
    },
    {
      key: 'message',
      title: () => <span style={{ fontSize: '13px' }}>Message</span>,
      dataIndex: 'message',
      ellipsis: false,
      render: (text) => {
        const maxLength = 100; 
        const truncatedText = text ? `${text.slice(0, maxLength)}${text.length > maxLength ? '...' : ''}` : '---';
        return (
            <Tooltip title={text}>
                <span>{truncatedText}</span>
            </Tooltip>
        );
    }, 
    },
    {
      key: 'sendTo',
      title: () => <span style={{ fontSize: '13px' }}>Send To</span>,
      dataIndex: 'sendToCount',
      ellipsis: false,
      width: '100px',
      align: "center",
      render: (text, item) => {
        const tagColor = text === 0 ? 'red' : 'blue';
        return (
          <Tooltip title="Send To">
            <Button type="link" onClick={() => BroadcasInfo(item)}>
              <Tag style={{ fontSize: '13px' }} color={tagColor}>{text}</Tag>
            </Button>
          </Tooltip>
        );
      },
    },
    {
      title: () => <span style={{ fontSize: '13px' }}>Send By</span>,
      dataIndex: 'createdName',
      key:'createdName',
      ellipsis: false,
      width: '100px',
      fixed: "left",
      render: (text) => (
            text ?
        <Tooltip title={text||'No Data '}>
          <span style={{ fontSize: '13px' }}>{text|| '---'}</span>
        </Tooltip>  : 'Udyana Darshini'
      )
    },
    {
      key: 'fileUrl',
      title: () => <span style={{ fontSize: '13px' }}>Attachment</span>,
      dataIndex: 'fileUrl',
      key: 'fileUrl',
      align: 'center',
      render: (fileUrl, record) => (
        fileUrl ? (
          <Tooltip title="View attachment">
          <Button type='link'>
            <a href={fileUrl} target='_blank' style={{ fontSize: '20px' }}>
              <FileOutlined />
            </a>
          </Button>
          </Tooltip>
        ) : "---"
      )
    },
    {
      key: 'actions',
      title: () => <span style={{ fontSize: '13px' }}>Recreate</span>,
      dataIndex: 'attachment',
      ellipsis: false,
      align: 'center',
      render: (text, record) => (
        <Tooltip title="Send again">
          <Button type="link" icon={<EditOutlined style={{ fontSize: '14px' }} />} onClick={() => sendAgainBroadcast(record)} />
        </Tooltip>
      )
    },
  ];


  const BroadcasInfo = (item) => {
    setBroadcastCountModal(true);
    setBroadcastInfo(item);
  };



  const handleModalOpen=()=>{
    setBroadcastCountModal(true)
  }
  
  const handleBroadcastModalOpen=()=>{
    setIsModalVisible(true)
  }
  
  return (
    <>
      <Typography.Title level={4} >{'Broadcast Management >> Broadcast Report'}</Typography.Title>
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
        <Form form={form} layout="vertical" onFinish={handleFilterApply} >
          <Row align="middle" gutter={12}>
            <Col>
              <Form.Item label={<label style={formLabelStyle}>Type</label>} initialValue="yearMonth" style={formItemStyle}>
                <Select
                  value={filterType}
                  onChange={(value) => {
                    setFilterType(value);
                    setSelectedDates(null);
                    setCurrentPage(1);
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
                    onChange={(date, dateString) => {
                      setMonth(dateString);
                      setSelectedDates(date);
                    }}
                    required
                  />
                </Form.Item>
              )}
              {filterType === 'dateRange' && (
                <Form.Item label={<label style={formLabelStyle}>Date Range</label>} style={formItemStyle}>
                  <RangePicker
                    style={{...formBoxStyle,width:'230px'}}
                    value={selectedDates}
                    onChange={(dates, dateStrings) => {
                      setFromDate(dateStrings[0]);
                      setToDate(dateStrings[1]);
                      setSelectedDates(dates);
                    }}
                    required
                  />
                </Form.Item>
              )}
            </Col>
          
            <Col>
              <Form.Item style={{ marginBottom: -15 }}>
                <Button type="primary" htmlType="submit" loading={isLoading}>
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
            allData.length > 0
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
            size="small"
            columns={columns}
            dataSource={allData}
            pagination={{
              current: currentPage,
              total: allData.length,
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
            style={{ width: '100%' }}
          />
        )}
      <Modal
        title="New broadcast"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={false}
      >
        <div >
          <BroadcastModal
            modalInfo={modalInfo}
            onOpen={handleBroadcastModalOpen}
          />
        </div>
      </Modal>
      <Modal
        width="650px"
        open={broadcastCountModal}
        onCancel={() => setBroadcastCountModal(false)}
        footer={false}
      >
        <div >
          <BroadcastCountModal
            broadcastInfo={broadcastInfo}
            onOpen={handleModalOpen}
          />
        </div>
      </Modal>
      <FloatButton.BackTop   icon={<ArrowUpOutlined />}  type='primary'/>
      <LogoutComponent open={isSessionExpiredVisible} />
    </>
  );
};

export default BroadcastReport;

