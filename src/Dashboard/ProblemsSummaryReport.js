import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
    Button, Breadcrumb, Select, DatePicker, Input, Form,
    Card, Typography, Row, Col, Empty, message, Spin,Space,
    Table, Tag
} from 'antd';
import { ArrowLeftOutlined, ReloadOutlined } from '@ant-design/icons';
import { API_URLS } from '../configure/MyUtilsConfig';
import { useOutletContext } from 'react-router-dom';
import dayjs from 'dayjs';
import LogoutComponent from '../logout/LogoutComponent';
import ProblemsDetailModal from './ProblemsDetailModal';

const { RangePicker } = DatePicker;
const { Option } = Select;
const { Title } = Typography;

const ProblemsSummaryReport = () => {
    const [form] = Form.useForm();
    const { apiHeader } = useOutletContext();

    const [pageNo, setPageNo] = useState(1);
    const [searchInput, setSearchInput] = useState('');
    const [refresh, setRefresh] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    const [currentPage, setCurrentPage] = useState(1);
    const [dataList, setDataList] = useState([]);
    const [dataList1, setDataList1] = useState([]);
    const [storeInputData, setStoreInputData] = useState(null);
    const [title, setTitle] = useState("");
    const [handleModalVisible, setHandleModalVisible] = useState(false);
    const [handleModalRecord, setHandleModalRecord] = useState({});
    const [handleModalType, setHandleModalType] = useState("");
    const [handleModalStausType, setHandleModalStausType] = useState("");
    const [inputId, setInputId] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isSessionExpiredVisible, setIsSessionExpiredVisible] = useState(false);
    const [breadcrumbItems, setBreadcrumbItems] = useState([{ title: 'Dashboard' }]);
    const [totalRecords, setTotalRecords] = useState(0);
    const [selectedDates, setSelectedDates] = useState(dayjs().startOf('month'));
    const [month, setMonth] = useState(dayjs().format('YYYY-MM'));
    const [fromDate, setFromDate] = useState('');
    const [toDate, setToDate] = useState('');
    const [filterType, setFilterType] = useState('yearMonth');
    const defaultFromDate = dayjs().subtract(30, 'day').startOf('day');
    const defaultToDate = dayjs().endOf('day');

    const formLabelStyle = { fontSize: 14, fontWeight: 500 };
    const formBoxStyle = { fontSize: 12, fontWeight: 500, width: '220px' };
    const formItemStyle = { marginBottom: 10 };


    useEffect(() => {
        fetchAllCropsDetails();
    }, [refresh, currentPage, pageSize]);

    useEffect(() => {
        if (storeInputData) {
            fetchProblemsByCropId();
        }
    }, [storeInputData, refresh, currentPage, pageSize]);

    const fetchAllCropsDetails = async () => {
        setIsLoading(true);
        try {
            const requestData = {
                type: filterType,
                yearMonth: month, fromDate: fromDate,
                toDate: toDate,
                page: currentPage,
                size: pageSize
            };

            const response = await axios.post(
                API_URLS.PROBLEMS_SUMMARY_REPORT,
                requestData,
                { headers: apiHeader }
            );

            if (response?.data?.status === 1) {
                const content = response.data.content;
                if (content && content.data) {
                    setDataList(content.data);
                    setTotalRecords(content.totalRecords || 0);
                } else {
                    setDataList([]);
                    setTotalRecords(0);
                }
            } else if (response.data.status === 2) {
                setIsSessionExpiredVisible(true);
            } else {
                message.error(response?.data?.mssg || 'Failed to fetch crops summary.');
            }
        } catch (error) {
            message.error('Failed to fetch crops summary.');
        } finally {
            setIsLoading(false);
        }
    };

    const fetchProblemsByCropId = async () => {
        setIsLoading(true);
        try {
            const requestData = {
                cropId: storeInputData,
                type: filterType,
                yearMonth: month,
                fromDate: fromDate,
                toDate: toDate,
                page: currentPage,
                size: pageSize
            };

            const response = await axios.post(
                API_URLS.PROBLEMS_SUMMARY_REPORT,
                requestData,
                { headers: apiHeader }
            );

            if (response?.data?.status === 1) {
                const content = response.data.content;
                if (content && content.data) {
                    setDataList1(content.data);
                    setTotalRecords(content.totalRecords || 0);
                } else {
                    setDataList1([]);
                    setTotalRecords(0);
                }
            } else if (response.data.status === 2) {
                setIsSessionExpiredVisible(true);
            } else {
                message.error(response?.data?.mssg || 'Failed to fetch problems by crop.');
            }
        } catch (error) {
            message.error('Failed to fetch problems by crop.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleFilterApply = async () => {
        setCurrentPage(1);
        setRefresh(refresh + 1);
    };

    const columnsPage1 = [
        {
            title: 'Crop Name',
            dataIndex: 'cropName',
            width: 150,
            fixed: 'left',
            render: (text, record) => {
                const truncatedText = text && text.length > 35 ? `${text.substring(0, 35)}...` : text;
                return (
                    <Button
                        type="link"
                      
                        style={{
                            padding: 0,
                            height: 'auto',
                            lineHeight: 'normal',
                        }}
                    >
                        <Tag
                            color="green"
                            style={{
                                color: 'green',
                                padding: '5px',
                                fontSize: '14px'
                            }}
                        >
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
                    title: 'Pest ',
                    dataIndex: 'cropPestCount',
                    key: 'cropPestCount',
                    width: 125,
                    align: 'center',
                    sorter: (a, b) => (a.cropPestCount || 0) - (b.cropPestCount || 0),
                    render: (text, record) => {
                        const displayText = text || text === 0 ? text : '0';
                        return (
                            <Button
                                type="link"
                                disabled={!displayText || displayText === '0'}
                                onClick={() => {
                                    setInputId(record.cropId);
                                    setHandleModalVisible(true);
                                    setHandleModalRecord(record);
                                    setHandleModalType('C');
                                    setHandleModalStausType('Pest');
                                    setTitle(record.cropName + " >> " + "Pest Problems");
                                }}
                            >
                                <Tag color={text ? "blue" : "red"} style={{ fontSize: "12px" }}>
                                    {text || "0"}
                                </Tag>
                            </Button>
                        );
                    },
                },
                {
                    title: 'Disease ',
                    dataIndex: 'cropDiseaseCount',
                    key: 'cropDiseaseCount',
                    width: 125,
                    align: 'center',
                    sorter: (a, b) => (a.cropDiseaseCount || 0) - (b.cropDiseaseCount || 0),
                    render: (text, record) => {
                        const displayText = text || text === 0 ? text : '0';
                        return (
                            <Button
                                type="link"
                                disabled={!displayText || displayText === '0'}
                                onClick={() => {
                                    setInputId(record.cropId);
                                    setHandleModalVisible(true);
                                    setHandleModalRecord(record);
                                    setHandleModalType('C');
                                    setHandleModalStausType('Disease');
                                    setTitle(record.cropName + " >> " + "Disease Problems");
                                }}
                            >

                                <Tag color={text ? "blue" : "red"} style={{ fontSize: "12px" }}>
                                    {text || "0"}
                                </Tag>
                               
                            </Button>
                        );
                    },
                },
                {
                    title: 'Nutrition ',
                    dataIndex: 'cropNutritionCount',
                    key: 'cropNutritionCount',
                    width: 125,
                    align: 'center',
                    sorter: (a, b) => (a.cropNutritionCount || 0) - (b.cropNutritionCount || 0),
                    render: (text, record) => {
                        const displayText = text || text === 0 ? text : '0';
                        return (
                            <Button
                                type="link"
                                disabled={!displayText || displayText === '0'}
                                onClick={() => {
                                    setInputId(record.cropId);
                                    setHandleModalVisible(true);
                                    setHandleModalRecord(record);
                                    setHandleModalType('C');
                                    setHandleModalStausType('Nutrition');
                                    setTitle(record.cropName + " >> " + "Nutrition Problems");
                                }}
                            >
                                
                                <Tag color={text ? "blue" : "red"} style={{ fontSize: "12px" }}>
                                    {text || "0"}
                                </Tag>
                            </Button>
                        );
                    },
                },
                {
                    title: 'Total',
                    dataIndex: 'totalCount',
                    key: 'totalCount',
                    width: 125,
                    align: 'center',
                    sorter: (a, b) => (a.totalCount || 0) - (b.totalCount || 0),
                    render: (text, record) => {
                        const displayText = text || text === 0 ? text : '0';
                        return (
                            <Button
                                type="link"
                                disabled={!displayText || displayText === '0'}
                                onClick={() => {
                                    setInputId(record.cropId);
                                    setHandleModalVisible(true);
                                    setHandleModalRecord(record);
                                    setHandleModalType('C');
                                    setHandleModalStausType('all');
                                    setTitle(record.cropName + " >> " + "All Problems");
                                }}
                            >
                                <Tag color={text ? "blue" : "red"} style={{ fontSize: "12px" }}>
                                    {text || "0"}
                                </Tag>
                            </Button>
                        );
                    },
                },
             
            ],
        },
    ];
const calculateTotals = () => {
    let pestTotal = 0;
    let diseaseTotal = 0;
    let nutritionTotal = 0;
    let allTotal = 0;

    dataList.forEach(item => {
        pestTotal += item.cropPestCount || 0;
        diseaseTotal += item.cropDiseaseCount || 0;
        nutritionTotal += item.cropNutritionCount || 0;
        allTotal += item.totalCount || 0;
    });

    return {
        pestTotal,
        diseaseTotal,
        nutritionTotal,
        allTotal
    };
};
    const changeEdtSearch = (searchWord) => {
        if (!searchWord) {
            fetchAllCropsDetails();
        } else {
            const searchResults = dataList.filter((item) => {
                const cropName = item.cropName ? item.cropName.toLowerCase() : '';
                return cropName.includes(searchWord.toLowerCase());
            });
            setDataList(searchResults);
        }
    };

    const listHeaderSearchUI = () => {
        return (
            <div>
                <Row gutter={[15, 3]}>
                    <Col span={8}>
                        <Input.Search
                            size="middle"
                            placeholder={pageNo === 1 ? "Search Crop" : "Search Problem"}
                            allowClear
                            value={searchInput}
                            onSearch={changeEdtSearch}
                            onChange={(e) => setSearchInput(e.target.value)}
                        />
                    </Col>
                    <Col flex={1}>
                        <Button
                            size="middle"
                            onClick={() => {
                                setSearchInput('');
                                setRefresh(refresh + 1);
                            }}
                            icon={<ReloadOutlined />}
                        />
                    </Col>
                </Row>
            </div>
        );
    };

    const handleBackClick = () => {
        if (pageNo === 2) {
            setPageNo(1);
            setBreadcrumbItems([{ title: 'Dashboard' }]);
        }
    };

    const handleBreadcrumbClick = (index, inputData) => {
        if (index === 0) {
            setPageNo(1);
            setBreadcrumbItems([{ title: 'Dashboard' }]);
            setStoreInputData(null);
        } else if (index === 1 && inputData) {
            setPageNo(2);
            setStoreInputData(inputData.cropId);
            setBreadcrumbItems([{ title: 'Dashboard' }, { title: inputData.cropName, record: inputData }]);
        }
    };

    const pageUI1 = () => {
        return (
            <div>
                <Typography.Title level={4}>
                    {' Dashboard >> Problems Summary Report'}
                </Typography.Title>
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
                    <Form form={form} layout="vertical" onFinish={handleFilterApply}>
                        <Row align="middle" gutter={12}>
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
                                                setFromDate(defaultFromDate.format('YYYY-MM-DD'));
                                                setToDate(defaultToDate.format('YYYY-MM-DD'));
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
                                    <Form.Item label={<label style={formLabelStyle}>Month</label>} style={formItemStyle}>
                                        <DatePicker
                                            style={formBoxStyle}
                                            picker="month"
                                            value={selectedDates}
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
                                            style={{ ...formBoxStyle, width: '230px' }}
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
                                    <Button type="primary" htmlType="submit" loading={isLoading}>Apply</Button>
                                </Form.Item>
                            </Col>
                        </Row>
                    </Form>
                </Card>
                <Row gutter={[16, 16]}>
                    <Col span={24}>
                        {isLoading ? (
                            <Spin tip="Loading...">
                                <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                            </Spin>
                        ) : (
                            <Table
                                dataSource={dataList}
                                columns={columnsPage1}
                                size="small"
                                rowKey="cropId"
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
                                scroll={{ x: 'max-content' }}
                                 summary={() => {
        const totals = calculateTotals();
        return (
            <Table.Summary fixed>
                <Table.Summary.Row style={{ backgroundColor: '#fafafa', fontWeight: 'bold' }}>
                    <Table.Summary.Cell>Total</Table.Summary.Cell>
                    <Table.Summary.Cell align="center">
                        <Tag color="blue" style={{ fontSize: "12px" }}>
                            {totals.pestTotal}
                        </Tag>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell align="center">
                        <Tag color="blue" style={{ fontSize: "12px" }}>
                            {totals.diseaseTotal}
                        </Tag>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell align="center">
                        <Tag color="blue" style={{ fontSize: "12px" }}>
                            {totals.nutritionTotal}
                        </Tag>
                    </Table.Summary.Cell>
                    <Table.Summary.Cell align="center">
                        <Tag color="blue" style={{ fontSize: "12px" }}>
                            {totals.allTotal}
                        </Tag>
                    </Table.Summary.Cell>
                </Table.Summary.Row>
            </Table.Summary>
        );
    }}
                            />
                        )}
                    </Col>
                </Row>
                <LogoutComponent open={isSessionExpiredVisible} />
            </div>
        );
    };

    const pageUI2 = () => {
        return (
            <>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '25px' }}>
                    <Button
                        type="link"
                        icon={<ArrowLeftOutlined />}
                        onClick={handleBackClick}
                        style={{ fontSize: '17px' }}>
                        Back
                    </Button>
                </div>

                {isLoading ? (
                    <Spin tip="Loading...">
                        <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} />
                    </Spin>
                ) : (
                    <>
                        <div>
                            <div style={{ marginBottom: '10px', marginTop: '10px' }}>
                                <Breadcrumb separator={false}>
                                    {breadcrumbItems.map((item, index) => (
                                        <Breadcrumb.Item key={index} onClick={() => handleBreadcrumbClick(index, item.record)}>
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
                                        <div style={{ marginBottom: '10px' }}>
                                            {listHeaderSearchUI()}
                                        </div>
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
                                                rowKey="problemType"
                                                pagination={{
                                                    current: currentPage,
                                                    total: totalRecords,
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
                        </div>
                    </>
                )}
                <LogoutComponent open={isSessionExpiredVisible} />
            </>
        );
    };

    return (
        <>
            {pageNo === 1 ? pageUI1() : pageNo === 2 ? pageUI2() : '<div>No Data</div>'}

            {handleModalVisible === true &&
                <ProblemsDetailModal
                    open={handleModalVisible}
                    onClose={() => setHandleModalVisible(false)}
                    inputId={inputId}
                    handleModalType={handleModalType}
                    handleModalStausType={handleModalStausType}
                    title={title}
                    filterType={filterType}
                    month={month}
                    fromDate={fromDate}
                    toDate={toDate}
                    currentPage={currentPage}
                    pageSize={pageSize}
                />
            }
        </>
    );
};

export default ProblemsSummaryReport;