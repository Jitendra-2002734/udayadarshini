import React, { useState, useEffect } from 'react';
import { Spin, Table } from 'antd';
import { useNavigate } from 'react-router-dom';
import { API_URLS, LOCAL_STORAGE_CONSTANTS } from '../configure/MyUtilsConfig';
import axios from 'axios';
import dayjs from 'dayjs';
import LogoutComponent from '../logout/LogoutComponent';

const ActivityLog = ({apiHeader,onOpen}) => {
  const navigate = useNavigate();
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isLoadingHistory,setIsLoadingHistory]=useState(false)
  const [isSessionExpiredVisible,setIsSessionExpiredVisible]=useState(false)
  
  const[userHistory,setUserHistory]=useState([])

  const formLabelStyle = { fontSize: 14, color: 'white' };
  useEffect(() => {
    fetchAllHistory()
  }, [onOpen]);



  const fetchAllHistory = async () => {
    setIsLoadingHistory(true); // Start loading
    const info = JSON.parse(localStorage.getItem(LOCAL_STORAGE_CONSTANTS.USER_INFO));
    try {
      const res = await axios.get(`${API_URLS.GET_USER_HISTORY_BY_ID}${info.uuid}`, { headers: apiHeader });      if (res?.data?.status === 1) {
        const content = res.data.content
        setUserHistory(content);
      } else if (res.data.status === 2) {
        // setIsSessionExpiredVisible(true);
      } else {
        // message.error(res?.data?.mssg);
      }
    } catch (error) {
      // message.error('Failed to fetch details.');
    } finally {
      setIsLoadingHistory(false);
    }
  };

  const columns = [
    {
      title: 'Date',
      dataIndex: 'activityTime',
      key: 'activityTime',
      sorter: (a, b) => {
        const dateA = a.activityTime ? dayjs(a.activityTime).valueOf() : 0;
        const dateB = b.activityTime ? dayjs(b.activityTime).valueOf() : 0;
        return dateA - dateB;
      },
      defaultSortOrder: 'descend',
      render: (text) => (text ? dayjs(text).format('HH:mm DD-MMM-YYYY') : '---'),
    },
    {
      title: 'Activity Type',
      dataIndex: 'activityType',
      key: 'activityType',
      align:'center',
      filters: [...new Set(userHistory.map(item => item.activityType))].map(version => ({
        text: version === 1 ? 'Login' : version === 2 ? 'Logout' : 'Unknown',
        value: version,
      })),
      onFilter: (value, record) => record.activityType === value,
      render: (text) => {
        if (text === 1) return 'Login';
        if (text === 2) return 'Logout';
        return 'Unknown';
      },
    },
    
    {
      title: 'Os Type',
      dataIndex: 'osType',
      key: 'osType',
      align:'center',
      filters: [...new Set(userHistory.map(item => item.osType))].map(version => ({
        text: version === 1 ? 'Android' : version === 2 ? 'iOS' : version === 3 ? 'Web': 'Unknown',
        value: version,
      })),
      onFilter: (value, record) => record.osType === value,
      render: (text) => {
        if (text === 1) return 'Android';
        if (text === 2) return 'iOS';
        if (text === 3) return 'Web';
        return 'Unknown';
      },
    },
    
  ];
  

  return (<>
          
     {isLoadingHistory ? (
        <div style={{ textAlign: 'center', padding: '20px' }}>
          <Spin tip='Loading...' />
        </div>
      ) : (
        <Table
        size='small'
        columns={columns}
        dataSource={userHistory}
        rowKey='uuid'
        pagination={{
          current: currentPage,
          total: userHistory.length,
          pageSize: pageSize,
          pageSizeOptions: ['10', '15', '20','30','40','50'],
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
        style={{ width: '100%' , padding:'20px' }}
      />
      )}
      

      
      <LogoutComponent open={isSessionExpiredVisible} />
    </>);
};

export default ActivityLog;
