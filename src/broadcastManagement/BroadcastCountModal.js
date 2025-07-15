import React, { useState, useEffect } from 'react';
import { Row, Col, Card, Empty, Form, Table, Button, Input, message, Spin, Tooltip, Tag, Radio } from 'antd';
import axios from 'axios';
import { API_URLS } from '../configure/MyUtilsConfig';
import { ReloadOutlined } from '@ant-design/icons';
import { useOutletContext } from 'react-router-dom';
import dayjs from 'dayjs';
import LogoutComponent from '../logout/LogoutComponent';

let localDataList = [];

const BroadcastCountModal = (props) => {

  const { apiHeader } = useOutletContext();

  const [gradeWiseCrewList, setGradeWiseCrewList] = useState([]);
  const [isSessionExpiredVisible, setIsSessionExpiredVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [refresh, setRefresh] = useState(0);
  const [searchInput, setSearchInput] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [filterStatus, setFilterStatus] = useState(null);

  useEffect(() => {
    if (props.broadcastInfo) {
      GradeWiseCrewList();
    }
    setFilterStatus(null)
    setSearchInput("")
  }, [props.broadcastInfo, props.onOpen]);

  const GradeWiseCrewList = async () => {

    setIsLoading(true);
    try {
      const res = await axios.get(API_URLS.GET_MEMBER_BY_BROADCAST_ID + props.broadcastInfo.uuid, { headers: apiHeader });
      if (res.data.status === 200 || res.data.status === 1) {

        const content = res.data.content
        localDataList = content;
        setGradeWiseCrewList(content);
        setCurrentPage(1)
        // message.success(res.data.mssg);
      } else if (res.data.status === 2) {
        setIsSessionExpiredVisible(true)
      } else {
        message.error("" + res.data.mssg);
      }
    } catch (error) {
      message.error(error.response ? error.response.data.mssg : error.message);
    } finally {
      setIsLoading(false);
    }
  };


  const columns = [
    { title: 'Name', dataIndex: 'name', },
    { title: 'Mobile Number', dataIndex: 'mobileNumber', },
    {
      title: 'Status',
      dataIndex: 'readStatus',
      render: (text) => {
        const status = text === 1 ? 'Read' : 'Unread';
        const color = text === 1 ? '#87d068' : '#B7B7B7'; 
        return (
          <Tooltip title={status}>
            <Tag color={color}>{status}</Tag>
          </Tooltip>
        );
      },
    },
    {
      title: 'Read Date',
      dataIndex: 'readDate',
      render: (text) => text ? dayjs(text).format('HH:mm,DD-MM-YYYY') : '---'
    },
  ];

  const filteredCrewList = () => {
    return gradeWiseCrewList.filter(item => {
      if (filterStatus === null) return true;
      return item.readStatus === filterStatus;
    });
  };

  const changeEdtSearch = (searchWord) => {

    if (searchWord === null || searchWord === '') {
      setGradeWiseCrewList(localDataList);
    } else {
      let searchResults = localDataList.filter(item => {
        return item.name?.toLowerCase().includes(searchWord.toLowerCase())
      });
      setGradeWiseCrewList(searchResults);
    }
  };

  const changeEdtSearchRaw = (evt) => {

    let searchWord = evt.target.value;
    if (searchWord === null || searchWord === '') {
      setGradeWiseCrewList(localDataList);
    } else {
      let searchResults = localDataList.filter(item => {
        return (item?.name?.toLowerCase().includes(searchWord.toLowerCase()) || item?.mobileNumber?.toLowerCase()?.includes(searchWord.toLowerCase()))
      });
      setGradeWiseCrewList(searchResults);
    }
  };

  const listHeaderSearchUI = () => {
    return (
      <div >
        <Row gutter={[16, 16]}>
          <Col >
            <Radio.Group buttonStyle='solid' onChange={(e) => setFilterStatus(e.target.value)} value={filterStatus}>
              <Radio.Button value={null}>All</Radio.Button>
              <Radio.Button value={1}>Read</Radio.Button>
              <Radio.Button value={0}>Unread</Radio.Button>
            </Radio.Group>
          </Col>
          <Col >
            <Input.Search size='middle' placeholder="Search" allowClear
              value={searchInput}
              onSearch={changeEdtSearch}
              onChange={(evt) => {
                setSearchInput(evt.target.value);
                changeEdtSearchRaw(evt);
              }} />
          </Col>
          <Col flex={1} >
            <Button size='middle' onClick={() => {
              GradeWiseCrewList();
              setRefresh(refresh + 1);
              setSearchInput('');
              setFilterStatus(null)
              setCurrentPage(1)
            }} icon={<ReloadOutlined />}></Button>
          </Col>
        </Row>
      </div>);
  }


  return (
    <div>
      <Row >
        <Col span={24}>
          <Card>
            <div style={{ marginBottom: '5px' }}>
              {listHeaderSearchUI()}
            </div>
            {isLoading ? (
              <Spin tip="Loading...">
                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
              </Spin>
            ) : (<Table
              dataSource={filteredCrewList()}
              columns={columns}
              rowKey="userId"
              style={{ overflow: 'auto' }}
              pagination={{
                current: currentPage,
                total: filteredCrewList().length,
                pageSize: pageSize,
                pageSizeOptions: ['5', '10', '15', '20'],
                showSizeChanger: 'true',
                onChange: (page, newPageSize) => {
                  if (pageSize != newPageSize) {
                    setCurrentPage(1)
                  }
                  else {
                    setCurrentPage(page)
                  }
                  setPageSize(newPageSize)
                }
              }} />
            )}
          </Card>
        </Col>
      </Row>
      <LogoutComponent open={isSessionExpiredVisible} />
    </div>
  );
};

export default BroadcastCountModal;



