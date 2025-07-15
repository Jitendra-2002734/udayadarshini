import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Button, Breadcrumb, Input, Card, Typography, Row, Col, Empty, message, Spin, Table, Tag } from 'antd';

import { ArrowLeftOutlined, ReloadOutlined } from '@ant-design/icons';
import { API_URLS } from '../configure/MyUtilsConfig';
import { useOutletContext } from 'react-router-dom';
import LogoutComponent from '../logout/LogoutComponent';

let localDataList = [];
let localDataList1 = [];
let localDataList2 = [];

const FarmersDrillDownReport = (props) => {
  const { apiHeader } = useOutletContext();

  const [pageNo, setPageNo] = useState(1);
  const [searchInput, setSearchInput] = useState('');
  const [refresh, setRefresh] = useState(0);
  const [update, setUpdate] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [dataList, setDataList] = useState([]);
  const [dataList1, setDataList1] = useState([]);
  const [dataList2, setDataList2] = useState([]);
  const [storeInputData, setStoreInputData] = useState(null);
  const [storeMandalData, setStoreMandalData] = useState(null);
  const [title, setTitle] = useState("");
  const [handleModalRecord, setHandleModalRecord] = useState({});
  const [handleModalType, setHandleModalType] = useState("");
  const [handleModalStausType, setHandleModalStausType] = useState("");
  const [inputId, setInputId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSessionExpiredVisible, setIsSessionExpiredVisible] = useState(false);
  const [breadcrumbItems, setBreadcrumbItems] = useState([{ title: 'Dashboard' }]);

  useEffect(() => {
    fetchAllDistricts();
  }, [refresh]);

  useEffect(() => {
    if (storeInputData && pageNo === 2) {
      fetchAllMandalsByDistrict();
    }
  }, [storeInputData, update, pageNo]);

  useEffect(() => {
    if (storeMandalData && pageNo === 3) {
      fetchAllVillagesByMandal();
    }
  }, [storeMandalData, pageNo]);

  

  const fetchAllDistricts = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(
        API_URLS.GET_DISTRICTSDRILLDOWN_COUNT,
        { headers: apiHeader }
      );

      if (res?.data?.status === 1) {
        const content = res?.data?.content;
        localDataList = content;
        setDataList(content);
      } else if (res.data.status === 2) {
        setIsSessionExpiredVisible(true);
      } else {
        message.warning(res?.data?.mssg || 'No districts found.');
      }
    } catch (error) {
      console.error("Error fetching districts:", error);
      message.error('Failed to fetch districts.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAllMandalsByDistrict = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(
        `${API_URLS.GET_DISTRICT_DRILLDOWN_BY_DISTRICT_ID}${storeInputData}`,
        { headers: apiHeader }
      );

      if (res?.data?.status === 1) {
        const content = res?.data?.content;
        localDataList1 = content;
        setDataList1(content);
      } else if (res.data.status === 2) {
        setIsSessionExpiredVisible(true);
      } else {
        message.warning(res?.data?.mssg || 'No mandals found for this district.');
      }
    } catch (error) {
      console.error("Error fetching mandals:", error);
      message.error('Failed to fetch mandals.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchAllVillagesByMandal = async () => {
    setIsLoading(true);
    try {
      const res = await axios.get(
        `${API_URLS.COMMON_GET_ALL_MANDAL_DRILLDOWN_REPORT}${storeMandalData}`,
        { headers: apiHeader }
      );

      if (res?.data?.status === 1) {
        const content = res?.data?.content;
        localDataList2 = content;
        setDataList2(content);
      } else if (res.data.status === 2) {
        setIsSessionExpiredVisible(true);
      } else {
        message.warning(res?.data?.mssg || 'No villages found for this mandal.');
      }
    } catch (error) {
      console.error("Error fetching villages:", error);
      message.error('Failed to fetch villages.');
    } finally {
      setIsLoading(false);
    }
  };

  const columnsPage1 = [
    {
      title: 'District Name',
      dataIndex: 'districtName', 
      width: 150,
      fixed: 'left',
      render: (text, record) => {
        const isClickable = true;
        const truncatedText = text && text.length > 25 ? `${text.substring(0, 25)}...` : text;

        return (
          <Button
            type="link"
            disabled={!isClickable}
            onClick={
              isClickable
                ? () => {
                  setStoreInputData(record.districtId); 
                  setPageNo(2);
                  setSearchInput('');
                  setBreadcrumbItems([
                    { title: 'Dashboard' },
                    { title: record.districtName, record: record }
                  ]);
                }
                : null
            }
            style={{ padding: 0, height: 'auto', lineHeight: 'normal' }}
          >
            <Tag color = 'green' style={{ color: 'green', padding: '5px', fontSize: '14px' }}>
              {truncatedText || '---'}
            </Tag>
          </Button>
        );
      },
    },
    {
      align: 'center',
      width: 250,
      children: [
        {
          title: 'Mandals',
          dataIndex: 'mandalsCount',
          key: 'mandalsCount',
          width: 125,
          align: 'center',
          render: (text, record) => {
            const displayText = text || text === 0 ? text : '0';
            const isClickable = displayText !== '0';

            return (
              <Button
                type="link"
                disabled={!isClickable}
                onClick={
                  isClickable
                    ? () => {
                      setInputId(record.districtId);
                      setHandleModalRecord(record);
                      setHandleModalType('D');
                      setHandleModalStausType('m');
                      setTitle(`${record.districtName} >> Mandals`);
                    }
                    : null
                }
              >
                
                <Tag color={text ? "blue" : "red"} style={{ fontSize: "12px" }}>
          {text || "0"}
        </Tag>
              </Button>
            );
          },
        },
        {
          title: 'Villages',
          dataIndex: 'villagesCount',  
          key: 'villagesCount',
          width: 125,
          align: 'center',
          render: (text, record) => {
            const displayText = text || text === 0 ? text : '0';
            const isClickable = displayText !== '0';

            return (
              <Button
                type="link"
                disabled={!isClickable}
                onClick={
                  isClickable
                    ? () => {
                      setInputId(record.districtId);
                      setHandleModalRecord(record);
                      setHandleModalType('D');
                      setHandleModalStausType('v');
                      setTitle(`${record.districtName} >> Villages`);
                    }
                    : null
                }
              >
                <Tag color={text ? "blue" : "red"} style={{ fontSize: "12px" }}>
          {text || "0"}
        </Tag>
               
              </Button>
            );
          },
        },
        {
          title: 'Farmers',
          dataIndex: 'farmersCount', 
          key: 'farmersCount',
          width: 125,
          align: 'center',
          render: (text, record) => {
            const displayText = text || text === 0 ? text : '0';
            const isClickable = displayText !== '0';

            return (
              <Button
                type="link"
                disabled={!isClickable}
                onClick={
                  isClickable
                    ? () => {
                      setInputId(record.districtId);
                      setHandleModalRecord(record);
                      setHandleModalType('D');
                      setHandleModalStausType('f');
                      setTitle(`${record.districtName} >> Farmers`);
                    }
                    : null
                }
              >
                <Tag color={text ? "blue" : "red"} style={{ fontSize: "12px" }}>
          {text || "0"}
        </Tag>
               
              </Button>
            );
          },
        }
      ],
    },
  ];

  const columnsPage2 = [
    {
      title: 'Mandal Name',
      dataIndex: 'mandalName',
      width: 150,
      fixed: 'left',
      render: (text, record) => {
        const truncatedText = text && text.length > 45 ? `${text.substring(0, 45)}...` : text;

        return (
          <Button
            type="link"
            onClick={() => {
              setStoreMandalData(record.mandalId);
              setPageNo(3);
              setBreadcrumbItems([
                { title: 'Dashboard' },
                { title: breadcrumbItems[1].title, record: breadcrumbItems[1].record },
                { title: record.mandalName, record: record }
              ]);
            }}
            style={{ padding: 0, height: 'auto', lineHeight: 'normal' }}
          >
            <Tag  color = 'green'style={{ color: 'green', padding: '5px', fontSize: '14px' }}>
              {truncatedText || '---'}
            </Tag>
          </Button>
        );
      },
    },
    {
      align: 'center',
      width: 150,
      children: [
        {
          title: 'Villages',
          dataIndex: 'villagesCount',
          key: 'villagesCount',
          width: 125,
          align: 'center',
          render: (text, record) => {
            const displayText = text || text === 0 ? text : '0';
            const isClickable = displayText !== '0';

            return (
              <Button
                type="link"
                disabled={!isClickable}
                onClick={
                  isClickable
                    ? () => {
                      setInputId(record.mandalId);
                      setHandleModalRecord(record);
                      setHandleModalType('M');
                      setHandleModalStausType('v');
                      setTitle(`${record.mandalName} >> Villages`);
                    }
                    : null
                }
              >
                <Tag color={text ? "blue" : "red"} style={{ fontSize: "12px" }}>
          {text || "0"}
        </Tag>
              </Button>
            );
          },
        },
        {
          title: 'Farmers',
          dataIndex: 'farmersCount',
          key: 'farmersCount',
          width: 125,
          align: 'center',
          render: (text, record) => {
            const displayText = text || text === 0 ? text : '0';
            const isClickable = displayText !== '0';

            return (
              <Button
                type="link"
                disabled={!isClickable}
                onClick={
                  isClickable
                    ? () => {
                      setInputId(record.mandalId);
                      setHandleModalRecord(record);
                      setHandleModalType('M');
                      setHandleModalStausType('f');
                      setTitle(`${record.mandalName} >> Farmers`);
                    }
                    : null
                }
              >
                <Tag color={text ? "blue" : "red"} style={{ fontSize: "12px" }}>
          {text || "0"}
        </Tag>
                
              </Button>
            );
          },
        }
      ],
    },
  ];

  const columnsPage3 = [
    {
      title: 'Village Name',
      dataIndex: 'villageName',
      key: 'villageName',
      width: 150,
      fixed: 'left',
      render: (text) => <span style={{ fontSize: "13px" }}>{text || "---"}</span>
    },
    {
      title: 'Farmers Count',
      dataIndex: 'farmersCount',
      key: 'farmersCount',
      width: 100,
      align: 'center',
      render: (text) => (
        <Tag color={text ? "blue" : "red"} style={{ fontSize: "12px" }}>
          {text || "0"}
        </Tag>
      )
    }
  ];

  const changeEdtSearch = (searchWord) => {
    if (!searchWord) {
      if (pageNo === 1) {
        setDataList(localDataList);
      } else if (pageNo === 2) {
        setDataList1(localDataList1);
      } else if (pageNo === 3) {
        setDataList2(localDataList2);
      }
    } else {
      let searchResults;
      const searchTerm = searchWord.toLowerCase();

      if (pageNo === 1) {
        searchResults = localDataList.filter(item => 
          item.districtName?.toLowerCase().includes(searchTerm)
        );
        setDataList(searchResults);
      } else if (pageNo === 2) {
        searchResults = localDataList1.filter(item => 
          item.mandalName?.toLowerCase().includes(searchTerm)
        );
        setDataList1(searchResults);
      } else if (pageNo === 3) {
        searchResults = localDataList2.filter(item => 
          item.villageName?.toLowerCase().includes(searchTerm)
        );
        setDataList2(searchResults);
      }
    }
  };

  const changeEdtSearchRaw = (evt) => {
    setSearchInput(evt.target.value);
    changeEdtSearch(evt.target.value);
  };

  const listHeaderSearchUI = () => {
    let placeholder = "Search ";
    if (pageNo === 1) placeholder += "District";
    else if (pageNo === 2) placeholder += "Mandal";
    else if (pageNo === 3) placeholder += "Village";

    return (
      <div>
        <Row gutter={[15, 3]}>
          <Col span={8}>
            <Input.Search
              size="middle"
              placeholder={placeholder}
              allowClear
              value={searchInput}
              onSearch={changeEdtSearch}
              onChange={changeEdtSearchRaw}
            />
          </Col>
          <Col flex={1}>
            <Button
              size="middle"
              onClick={() => {
                setSearchInput('');
                if (pageNo === 1) {
                  setRefresh(refresh + 1);
                } else if (pageNo === 2) {
                  setUpdate(update + 1);
                } else if (pageNo === 3) {
                  setDataList2(localDataList2);
                }
              }}
              icon={<ReloadOutlined />}
            />
          </Col>
        </Row>
      </div>
    );
  };

  const handleBackClick = () => {
    if (pageNo === 3) {
      setPageNo(2);
      setBreadcrumbItems(breadcrumbItems.slice(0, 2));
    } else if (pageNo === 2) {
      setPageNo(1);
      setBreadcrumbItems([{ title: 'Dashboard' }]);
      setStoreInputData(null);
    }
  };

  const handleBreadcrumbClick = (index) => {
    if (index === 0) {
      setPageNo(1);
      setBreadcrumbItems([{ title: 'Dashboard' }]);
      setStoreInputData(null);
      setStoreMandalData(null);
    } else if (index === 1) {
      setPageNo(2);
      setStoreMandalData(null);
      setBreadcrumbItems(breadcrumbItems.slice(0, 2));
    }
  };

  const pageUI1 = () => (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography.Title level={4}>{'Dashboard >> Farmers Drilldown'}</Typography.Title>
      </div>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Card style={{ marginTop: '10px' }}>
            <div style={{ marginBottom: '20px' }}>{listHeaderSearchUI()}</div>
            {isLoading ? (
              <Spin tip="Loading...">
                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
              </Spin>
            ) : (
              <Table
                dataSource={dataList}
                columns={columnsPage1}
                size="small"
                rowKey="districtId"
                scroll={{ x: 'max-content' }}
                pagination={{
                  current: currentPage,
                  total: dataList.length,
                  pageSize: pageSize,
                  pageSizeOptions: ['5', '10', '20', '30'],
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
    </div>
  );

  const pageUI2 = () => (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '25px' }}>
        <Button type="link" icon={<ArrowLeftOutlined />} onClick={handleBackClick} style={{ fontSize: '17px' }}>
          Back
        </Button>
      </div>
      <div style={{ marginBottom: '10px', marginTop: '10px' }}>
        <Breadcrumb separator={false}>
          {breadcrumbItems.map((item, index) => (
            <Breadcrumb.Item key={index} onClick={() => handleBreadcrumbClick(index)}>
              <div
                style={{
                  backgroundColor: '#77BC40',
                  color: 'white',
                  padding: '2px 15px',
                  clipPath: 'polygon(7% 50%, 0 0, 90% 0, 100% 50%, 90% 100%, 0 100%)',
                  display: 'inline-block',
                  marginRight: '2px',
                  cursor: "pointer"
                }}
              >
                {item.title}
              </div>
            </Breadcrumb.Item>
          ))}
        </Breadcrumb>
      </div>
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
                dataSource={dataList1}
                columns={columnsPage2}
                scroll={{ x: 'max-content' }}
                size="small"
                rowKey="mandalId"
                pagination={{
                  current: currentPage,
                  total: dataList1.length,
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
          </Card>
        </Col>
      </Row>
    </>
  );

  const pageUI3 = () => (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '25px' }}>
        <Button type="link" icon={<ArrowLeftOutlined />} onClick={handleBackClick} style={{ fontSize: '17px' }}>
          Back
        </Button>
      </div>
      <div style={{ marginBottom: '10px', marginTop: '10px' }}>
        <Breadcrumb separator={false}>
          {breadcrumbItems.map((item, index) => (
            <Breadcrumb.Item key={index} onClick={() => handleBreadcrumbClick(index)}>
              <div
                style={{
                  backgroundColor: '#77BC40',
                  color: 'white',
                  padding: '2px 15px',
                  clipPath: 'polygon(7% 50%, 0 0, 90% 0, 100% 50%, 90% 100%, 0 100%)',
                  display: 'inline-block',
                  marginRight: '2px',
                  cursor: "pointer"
                }}
              >
                {item.title}
              </div>
            </Breadcrumb.Item>
          ))}
        </Breadcrumb>
      </div>
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
                dataSource={dataList2}
                columns={columnsPage3}
                scroll={{ x: 'max-content' }}
                size="small"
                rowKey="villageId"
                pagination={{
                  current: currentPage,
                  total: dataList2.length,
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
          </Card>
        </Col>
      </Row>
    </>
  );

  return (
    <>
      {pageNo === 1 ? pageUI1() : 
       pageNo === 2 ? pageUI2() : 
       pageNo === 3 ? pageUI3() : 
       <div>No Data</div>}
      <LogoutComponent open={isSessionExpiredVisible} />
    </>
  );
};

export default FarmersDrillDownReport;