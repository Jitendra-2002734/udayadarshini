import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Input, Button, Tag, Table, message, Modal, Spin, Empty, Tooltip } from 'antd';
import { ReloadOutlined, EyeOutlined } from '@ant-design/icons';
import { API_URLS } from '../configure/MyUtilsConfig';
import { useOutletContext } from 'react-router-dom';
import LogoutComponent from '../logout/LogoutComponent';

let localDataList = [];

const dummyMandals = [
  {
    mandalId: '1',
    mandalName: 'Anantapur Mandal',
    villagesCount: 25,
    farmersCount: 950,
    districtId: '1'
  },
  {
    mandalId: '2',
    mandalName: 'Dharmavaram Mandal',
    villagesCount: 30,
    farmersCount: 1200,
    districtId: '1'
  },
  {
    mandalId: '3',
    mandalName: 'Tirupati Mandal',
    villagesCount: 35,
    farmersCount: 1500,
    districtId: '2'
  }
];

const dummyVillages = [
  {
    villageId: '1',
    villageName: 'Village 1',
    farmersCount: 150,
    mandalId: '1'
  },
  {
    villageId: '2',
    villageName: 'Village 2',
    farmersCount: 200,
    mandalId: '1'
  },
  {
    villageId: '3',
    villageName: 'Village 3',
    farmersCount: 180,
    mandalId: '2'
  },
  {
    villageId: '4',
    villageName: 'Village 4',
    farmersCount: 220,
    mandalId: '2'
  },
  {
    villageId: '5',
    villageName: 'Village 5',
    farmersCount: 190,
    mandalId: '3'
  }
];

const dummyFarmers = [
  {
    farmerId: '1',
    farmerName: 'Farmer 1',
    mobile: '9876543210',
    villageId: '1'
  },
  {
    farmerId: '2',
    farmerName: 'Farmer 2',
    mobile: '9876543211',
    villageId: '1'
  },
  {
    farmerId: '3',
    farmerName: 'Farmer 3',
    mobile: '9876543212',
    villageId: '2'
  },
  {
    farmerId: '4',
    farmerName: 'Farmer 4',
    mobile: '9876543213',
    villageId: '2'
  },
  {
    farmerId: '5',
    farmerName: 'Farmer 5',
    mobile: '9876543214',
    villageId: '3'
  },
  {
    farmerId: '6',
    farmerName: 'Farmer 6',
    mobile: '9876543215',
    villageId: '3'
  },
  {
    farmerId: '7',
    farmerName: 'Farmer 7',
    mobile: '9876543216',
    villageId: '4'
  },
  {
    farmerId: '8',
    farmerName: 'Farmer 8',
    mobile: '9876543217',
    villageId: '5'
  }
];

const FarmersDrilldownDetails = (props) => {
  const [isSessionExpiredVisible, setIsSessionExpiredVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [allData, setAllData] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);
  const [searchInput, setSearchInput] = useState('');
  const { apiHeader } = useOutletContext();
  const [refresh, setRefresh] = useState(0);

  useEffect(() => {
    getFarmersDrilldownDetails();
  }, [refresh]);

  const getFarmersDrilldownDetails = async () => {
    setIsLoading(true);
    try {
      // For demo purposes, using dummy data
      // In production, replace with actual API call:
      // const response = await axios.post(API_URLS.FARMERS_GET_DRILLDOWN_DETAILS, {
      //   type: props.handleModalType,
      //   statusType: props.handleModalStausType,
      //   id: props.inputId
      // }, { headers: apiHeader });
      
      let data = [];
      if (props.handleModalType === 'D') { // District level
        if (props.handleModalStausType === 'm') { // Mandals
          data = dummyMandals.filter(m => m.districtId === props.inputId);
        } else if (props.handleModalStausType === 'v') { // Villages
          data = dummyVillages.filter(v => 
            dummyMandals.some(m => 
              m.districtId === props.inputId && m.mandalId === v.mandalId
            )
          );
        } else if (props.handleModalStausType === 'f') { // Farmers
          data = dummyFarmers.filter(f => 
            dummyVillages.some(v => 
              dummyMandals.some(m => 
                m.districtId === props.inputId && m.mandalId === v.mandalId && v.villageId === f.villageId
              )
            )
          );
        }
      } else if (props.handleModalType === 'M') { // Mandal level
        if (props.handleModalStausType === 'v') { // Villages
          data = dummyVillages.filter(v => v.mandalId === props.inputId);
        } else if (props.handleModalStausType === 'f') { // Farmers
          data = dummyFarmers.filter(f => 
            dummyVillages.some(v => v.mandalId === props.inputId && v.villageId === f.villageId)
          );
        }
      }
      
      localDataList = data;
      setAllData(data);
    } catch (error) {
      console.error("Error fetching details:", error);
      message.error('Failed to fetch details.');
    } finally {
      setIsLoading(false);
    }
  };

  const changeEdtSearch = (searchWord) => {
    if (!searchWord) {
      setAllData(localDataList);
    } else {
      const searchResults = localDataList.filter((item) => {
        const searchFields = [
          item.villageName,
          item.mandalName,
          item.farmerName,
          item.mobile
        ].filter(Boolean);
        
        return searchFields.some(field => 
          field.toLowerCase().includes(searchWord.toLowerCase())
        );
      });
      setAllData(searchResults);
    }
  };

  const changeEdtSearchRaw = (evt) => {
    const searchWord = evt.target.value;
    setSearchInput(searchWord);
    changeEdtSearch(searchWord);
  };

  const listHeaderSearchUI = () => {
    return (
      <div>
        <Row gutter={[16, 3]} justify="start" wrap>
          <Col flex={1}>
            <Input.Search
              size="middle"
              placeholder={`Search ${getSearchPlaceholder()}`}
              allowClear
              value={searchInput}
              onChange={changeEdtSearchRaw}
              onSearch={changeEdtSearch}
            />
          </Col>
          <Col flex={2}>
            <Button
              size="middle"
              onClick={() => {
                setSearchInput('');
                setRefresh(refresh + 1);
                setCurrentPage(1);
                setAllData(localDataList);
              }}
              icon={<ReloadOutlined />}
            />
          </Col>
        </Row>
      </div>
    );
  };

  const getSearchPlaceholder = () => {
    if (props.handleModalStausType === 'm') return 'Mandals';
    if (props.handleModalStausType === 'v') return 'Villages';
    if (props.handleModalStausType === 'f') return 'Farmers';
    return '';
  };

  const getColumns = () => {
    if (props.handleModalStausType === 'm') {
      return [
        {
          title: 'Mandal Name',
          dataIndex: 'mandalName',
          key: 'mandalName',
          fixed: 'left',
          width: 50,
          render: (text) => <span style={{ fontSize: "13px" }}>{text || "---"}</span>
        },
        {
          title: 'Villages',
          dataIndex: 'villagesCount',
          key: 'villagesCount',
          align: 'center',
          width: 30,
          render: (text) => (
            <Tag color={text ? "blue" : "red"} style={{ fontSize: "12px" }}>
              {text || "0"}
            </Tag>
          )
        },
        {
          title: 'Farmers',
          dataIndex: 'farmersCount',
          key: 'farmersCount',
          align: 'center',
          width: 30,
          render: (text) => (
            <Tag color={text ? "blue" : "red"} style={{ fontSize: "12px" }}>
              {text || "0"}
            </Tag>
          )
        }
      ];
    } else if (props.handleModalStausType === 'v') {
      return [
        {
          title: 'Village Name',
          dataIndex: 'villageName',
          key: 'villageName',
          fixed: 'left',
          width: 150,
          render: (text) => <span style={{ fontSize: "13px" }}>{text || "---"}</span>
        },
        {
          title: 'Farmers',
          dataIndex: 'farmersCount',
          key: 'farmersCount',
          align: 'center',
          width: 100,
          render: (text) => (
            <Tag color={text ? "blue" : "red"} style={{ fontSize: "12px" }}>
              {text || "0"}
            </Tag>
          )
        }
      ];
    } else if (props.handleModalStausType === 'f') {
      return [
        {
          title: 'Farmer Name',
          dataIndex: 'farmerName',
          key: 'farmerName',
          fixed: 'left',
          width: 150,
          render: (text) => <span style={{ fontSize: "13px" }}>{text || "---"}</span>
        },
        {
          title: 'Mobile',
          dataIndex: 'mobile',
          key: 'mobile',
          width: 100,
          render: (text) => <span style={{ fontSize: "13px" }}>{text || "---"}</span>
        },
        {
          title: 'View',
          key: 'action',
          width: 80,
          render: (_, record) => (
            <Tooltip title="More Info">
              <Button
                type="link"
                onClick={() => {/* Handle farmer details view */}}
                icon={<EyeOutlined style={{ fontSize: "16px" }} />}
              />
            </Tooltip>
          ),
        }
      ];
    }
    return [];
  };

  return (
    <Modal
      title={props.title}
      open={props.handleModalVisible}
      onCancel={() => props.setHandleModalVisible(false)}
      footer={false}
      style={{ top: '10%' }}
      width="50%"
    >
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card>
            <div style={{ marginBottom: '10px' }}>{listHeaderSearchUI()}</div>
            {isLoading ? (
              <Spin tip="Loading...">
                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
              </Spin>
            ) : (
              <Table
                dataSource={allData}
                columns={getColumns()}
                size="small"
                rowKey={props.handleModalStausType === 'f' ? 'farmerId' : 
                       props.handleModalStausType === 'v' ? 'villageId' : 'mandalId'}
                scroll={{ x: 'max-content' }}
                pagination={{
                  current: currentPage,
                  total: allData.length,
                  pageSize: pageSize,
                  pageSizeOptions: ['5', '10', '20', '30', '40', '50'],
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
          </Card>
        </Col>
      </Row>
      <LogoutComponent open={isSessionExpiredVisible} />
    </Modal>
  );
};

export default FarmersDrilldownDetails;