import React, { useState, useEffect } from 'react';
import { Modal, Table, Tag, Spin } from 'antd';
import dayjs from 'dayjs';
import { API_URLS } from '../configure/MyUtilsConfig';
import axios from 'axios';

const FarmerProblemsModal = ({ farmerId, modalVisible, setModalVisible, apiHeader }) => {
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  useEffect(() => {
    fetchFarmerProblems();

  }, []);



  const fetchFarmerProblems = async () => {
    setLoading(true);
    try {
      const response = await axios.get(API_URLS.GET_FARMERS_BY_ID + farmerId,
        { headers: apiHeader }
      );

      if (response.data.status === 1) {
        setProblems(response.data.content);
      }
    } catch (error) {
      console.error("Error fetching farmer problems:", error);
    } finally {
      setLoading(false);
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
      title: 'Crop',
      dataIndex: 'cropName',
      Widht:150,
      render: (text) => text ? text : '---',
    },
    {
      title: 'Pest/Nutrition/Disease',
      dataIndex: 'cropPestNutritionDiseaseName',
        Widht:150,
      render: (text) => text ? text : '---',
    },
    {
      title: 'Intensity Type',
      dataIndex: 'problemType',
        Widht:50,
      render: (type) => (
        <Tag color={type === 1 ? 'orange' : 'green'}>
          {type === 1 ? 'Known' : 'Unknown'}
        </Tag>
      )
    },

    {
      title: 'Description',
      dataIndex: 'des',
      width:'280',
      render: (text) => text ? text : '---',
    },

    {
      title: 'Status',
      dataIndex: 'status',
        Widht:90,
      render: (status) => (
        <Tag color={status === 1 ? 'green' : 'red'}>
          {status === 1 ? 'Active' : 'Deactive'}
        </Tag>
      )
    }
  ];

  return (
    <Modal
      title={'Farmer Raised Problems'}
      open={modalVisible}
      onCancel={() => setModalVisible(false)}
      footer={null}
      width={1000}
        centered  
  bodyStyle={{
    maxHeight: '600px',      
    overflowY: 'auto',       
    padding: '16px'
  }}
   
    >
      {loading ? (
        <Spin size="large"style={{    display: 'flex',
    justifyContent: 'center',}} />
      ) : (
        <Table
          columns={columns}
          dataSource={problems}
          rowKey="uuid"
               bodyStyle={{
    maxHeight: '500px', 
    overflowY: 'auto',    
    padding: '16px',     
  }}
              scroll={{ y: 400 }}
          pagination={{
            current: currentPage,
            total: problems.length,
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
        />
      )}
    </Modal>
  );
};

export default FarmerProblemsModal;