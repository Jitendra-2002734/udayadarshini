import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Typography, Statistic, Spin, message } from 'antd';
import axios from 'axios';
import { API_URLS } from '../configure/MyUtilsConfig';
import { useOutletContext } from 'react-router-dom';
import LogoutComponent from '../logout/LogoutComponent';

import MCBarGraphs from './MCBarGraphs';


const DashboardReport = () => {
    const { apiHeader } = useOutletContext();
    const [isLoading, setIsLoading] = useState(false);
    const [overallData, setOverallData] = useState({});
    const [isSessionExpiredVisible, setIsSessionExpiredVisible] = useState(false);

    const [countData, setCountData] = useState({
        thisWeekCount: 0,
        todayCount: 0,
        yesterdayCount: 0,
        thisMonthCount: 0,
        lastMonthCount: 0
    });
    const [problemsCount, setProblemsCount] = useState({
        thisWeekCount: 0,
        todayCount: 0,
        yesterdayCount: 0,
        thisMonthCount: 0,
        lastMonthCount: 0,
        totalCount:0
    });

    useEffect(() => {
        fetchOverallData();
        fetchOverallTrends();
        fetchOverallProblesTrends();
    }, []);



    const fetchOverallTrends = () => {
        setIsLoading(true);
        axios.get(API_URLS.OVER_ALL_DASHBOARD_GRAPH_COUNT, { headers: apiHeader })

            .then((res) => {
                
                setIsLoading(false);
                if (res.data.status === 1) {
                    setCountData(res.data.content[0]);
                } else if (res.data.status === 2) {
                    setIsSessionExpiredVisible(true);
                } else {
                    message.error(res.data.mssg);
                }
            })
            .catch((error) => {
                message.error("Failed to fetch details: " + error.message);
            })
            .finally(() => {
                setIsLoading(false);
            });
    };
    const fetchOverallProblesTrends = () => {
        setIsLoading(true);
        axios.get(API_URLS.COMMON_PROBLEMS_SUMMERY_REPORT, { headers: apiHeader })
            .then((res) => {
                setIsLoading(false);
                if (res.data.status === 1) {
                    setProblemsCount(res.data.content[0]);
                } else if (res.data.status === 2) {
                    setIsSessionExpiredVisible(true);
                } else {
                    message.error(res.data.mssg);
                }
            })
            .catch((error) => {
                message.error("Failed to fetch details: " + error.message);
            })
            .finally(() => {
                setIsLoading(false);
            });
    };

    const fetchOverallData = async () => {
        setIsLoading(true);
        try {
            const res = await axios.get(API_URLS.OVER_ALL_DASHBOARD_COUNT, { headers: apiHeader });
            if (res.data.status === 1) {
                setOverallData(res.data.content);
            } else if (res.data.status === 2) {
                setIsSessionExpiredVisible(true);
            } else {
                message.error(res.data.mssg);
            }
        } catch (error) {
            message.error("Failed to fetch details: " + error.message);
        } finally {
            setIsLoading(false);
        }
    };
    



    return (
        <>
            <div>
                <Typography.Title level={4}>{"Dashboard >> Overall"}</Typography.Title>
                <Row gutter={[16, 16]}>
                   
                    <Col span={4}>
                        <Card style={{ backgroundColor: "#6A9AB0" }}>
                            <Statistic
                                title={<span style={{ color: '#000000', fontSize: '14px', fontWeight: '500' }}>Farmers</span>}
                                value={overallData.farmersCount}
                                valueStyle={{ color: '#000000', fontSize: '30px', fontWeight: '500' }}
                            />
                        </Card>
                    </Col>
                    <Col span={4}>
                        <Card style={{ backgroundColor: " 	 #cc9966" }}>
                            <Statistic
                                title={<span style={{ color: '#000000', fontSize: '14px', fontWeight: '500' }}>Crops</span>}
                                value={overallData.cropsCount}
                                valueStyle={{ color: '#000000', fontSize: '30px', fontWeight: '500' }}
                            />
                        </Card>
                    </Col>
                    <Col span={4}>
                        <Card style={{ backgroundColor: "#C1E2A4" }}>
                            <Statistic
                                title={<span style={{ color: '#000000', fontSize: '14px', fontWeight: '500' }}>Districts</span>}
                                value={overallData.districtsCount}
                                valueStyle={{ color: '#000000', fontSize: '30px', fontWeight: '500' }}
                            />
                        </Card>
                    </Col>
                    <Col span={4}>
                        <Card style={{ backgroundColor: "#C8ACD6" }}>
                            <Statistic
                                title={<span style={{ color: '#000000', fontSize: '14px', fontWeight: '500' }}>Mandals </span>}
                                value={overallData.mandalsCount}
                                valueStyle={{ color: '#000000', fontSize: '30px', fontWeight: '500' }}
                            />
                        </Card>
                    </Col>
                    <Col span={4}>
                        <Card style={{ backgroundColor: "#50bfa9" }}>
                            <Statistic
                                title={<span style={{ color: '#000000', fontSize: '14px', fontWeight: '500' }}>Villages</span>}
                                value={overallData.villagesCount}
                                valueStyle={{ color: '#000000', fontSize: '30px', fontWeight: '500' }}
                            />
                        </Card>
                    </Col>
                    <Col span={4}>
                        <Card style={{ backgroundColor: "#FFB4C2" }}>
                            <Statistic
                                title={<span style={{ color: '#000000', fontSize: '14px', fontWeight: '500' }}>Users</span>}
                                value={overallData.employeesCount}
                                valueStyle={{ color: '#000000', fontSize: '30px', fontWeight: '500' }}
                            />
                        </Card>
                    </Col>
                </Row>
            </div>
            <div style={{ marginTop: '25px' }}>
                <Row gutter={[16, 16]}>
                    <Col span={12}>
                        {isLoading ?
                            <Col span={12}>
                                <Spin spinning={isLoading} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }} size='large' />
                            </Col>
                            :
                            <MCBarGraphs
                                title="Farmers enrollment"
                                id="activity"
                                data={[
                                    { name: "Today", count: countData.todayCount || 0, },
                                    { name: "Yesterday", count: countData.yesterdayCount || 0, },
                                    { name: "This Week", count: countData.thisWeekCount || 0, },
                                    { name: "This Month", count: countData.thisMonthCount || 0, },
                                    { name: "Last Month", count: countData.lastMonthCount || 0, },
                                ]}
                                type='sampleGraph'
                                Access='NoOnClickGraph'
                            />
                        }
                    </Col>
                    <Col span={12}>
                        {isLoading ? (
                            <Col span={12}>
                                <Spin spinning={isLoading} style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }} size='large' />
                            </Col>
                        ) :
                            <MCBarGraphs
                                title="Problems Raised"
                                id="activity"
                                data={[
                                    { name: "Today", count: problemsCount.todayCount || 0, },
                                    { name: "Yesterday", count: problemsCount.yesterdayCount || 0, },
                                    { name: "This Week", count: problemsCount.thisWeekCount || 0, },
                                    { name: "This Month", count: problemsCount.thisMonthCount || 0, },
                                    { name: "Last Month", count: problemsCount.lastMonthCount || 0, },
                                    { name: "Total", count: problemsCount.totalCount || 0, }

                                ]}
                                type='sampleGraph'
                                Access='NoOnClickGraph'
                            />
                        }
                    </Col>
                </Row>
            </div>
            <LogoutComponent open={isSessionExpiredVisible} />
        </>
    );
};

export default DashboardReport;