import React, { useState } from 'react';
import { InboxOutlined, ReloadOutlined } from '@ant-design/icons';
import { message, Upload, Button, Row, Modal, Table, Typography, Tag, Input, Space, Col } from 'antd';
import { saveAs } from 'file-saver';
import { API_URLS, APP_COLOR_CODES, LOCAL_STORAGE_CONSTANTS } from '../configure/MyUtilsConfig';
import { useOutletContext } from 'react-router-dom';
import axios from 'axios';
import LogoutComponent from '../logout/LogoutComponent';

const { Text } = Typography;
const { Dragger } = Upload;
let localDataList = [];
const ExcelUpload2 = (props) => {
    const { apiHeader } = useOutletContext();
    const [isSessionExpiredVisible, setIsSessionExpiredVisible] = useState(false);
    const [modelOpen, setModelOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [storeExcelData, setStoreExcelData] = useState([]);
    const [typeFormat, setStoreTypeFormat] = useState('');
    const [file, setFile] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(5);

    const [searchInput, setSearchInput] = useState('');
    const [refresh, setRefresh] = useState(0);

    const cliUserInfo = JSON.parse(localStorage.getItem(LOCAL_STORAGE_CONSTANTS.USER_INFO));

    const uploadProps = {
        name: 'file',
        data: { Id: cliUserInfo.uuid },
        multiple: false,
        action: props.uploadExcel,
        headers: apiHeader,
        accept: '.xlsx',
        beforeUpload: (file) => {
            const isXlsx = file.type === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
            if (!isXlsx) {
                message.error('You can only upload XLSX file!');
            }
            // if (typeFormat === 'cancel') {
            //     return Upload.LIST_IGNORE;
            // }
            return isXlsx || Upload.LIST_IGNORE;
        },
        onChange(info) {
            const { status, response } = info.file;
            if (status === 'done') {
                if (response.status === 1) {

                    setModelOpen(true);
                    // message.warning(response.mssg);
                    setStoreExcelData(response.content);
                    localDataList = response.content;
                } else if (response.status === 1) {
                    setIsSessionExpiredVisible(true);
                } else {
                    Modal.error({
                        title: "Excel Upload Failed (Please check the below Fields) ",
                        width: '50%',
                        content: (
                            <Table
                                style={{ overflow: "auto", height: '400px' }}
                                dataSource={response.content}
                                columns={[
                                    {
                                        title: 'Row Number',
                                        dataIndex: 'rowNo',
                                        key: 'rowNo',
                                        render: (text) => <strong>{text}</strong>,
                                    },
                                    {
                                        title: 'Description',
                                        dataIndex: 'des',
                                        key: 'des',
                                        render: (descriptions) => (
                                            <ul>
                                                {descriptions.map((item, index) => (
                                                    <li key={index}>{item}</li>
                                                ))}
                                            </ul>
                                        ),
                                    },
                                ]}
                                pagination={false}
                                rowKey="rowNo"
                            />
                        ),
                    });
                }
            }
            if (status === 'error') {
                message.error(`${info.file.name} file upload failed.`);
            }
        },
        onRemove() {
            // handleDeleteFile(file);
        },
    };

    const handleDeleteFile = (file) => {
        axios.delete(API_URLS.DELETE_UPLOAD_FILE + `${file}`, { headers: apiHeader }).then((res) => {
            if (res.data.status === 1) {
                // message.success(res.data.content.fileSelStatus);
                setFile(null);
            } else if (res.data.content === 2) {
                setIsSessionExpiredVisible(true);
            }
        }).catch((error) => {
            // message.error('Error in deleting the file:', error);
        });
    };

    const downloadSample = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(props.downloadExcel, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
                },
            });
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
            setIsLoading(false);
            const blob = await response.blob();
            saveAs(blob, `${props.name}.xlsx`);
        } catch (error) {
            message.error('Failed to download the sample file.');
            setIsLoading(false);
        }
    };

    const uploadDataExcel = async (value) => {
        setStoreTypeFormat(value)
        setIsLoading(true);
        let input = {};
        input = { type: value, excelId: storeExcelData[0].excelId };
        try {
            const res = await axios.post(API_URLS.GET_EXCEL_PROCEED_CANCEL, input, { headers: apiHeader });
            if (res?.data?.status === 1) {
                const content = res.data.content;
                message.success(res?.data?.mssg);
                setModelOpen(false);
                props.fetchAllUsers();
            } else if (res.data.status === 2) {
                setIsSessionExpiredVisible(true);
            } else {
                message.error(res?.data?.mssg);
            }
        } catch (error) {
            message.error('Failed to fetch details.');
        } finally {
            setIsLoading(false);
        }
    };

    const Columns = [
        {
            title: "Name",
            dataIndex: 'name',
            key: 'name',
            width: 120,
            align: 'center',
            render: (text) => text ? <strong>{text}</strong> : '---',
        },
        {
            title: 'ID',
            dataIndex: 'ID',
            key: 'ID',
            width: 100,
            align: 'center',
            render: (text) => text ? text : '---',
        },
        // {
        //     title: 'Total Count',
        //     dataIndex: 'TotalCounts',
        //     key: 'TotalCounts',
        //     align: 'center',
        //     render: (text) => text ? text : '---',
        // },
        {
            title: 'Success Count',
            dataIndex: 'successCount',
            key: 'successCount',
            width: 100,
            align: 'center',
            // render: (text) => text ? text : '---',
        },
        ...(props.Type === 'PFNOBased' ? [
            {
                title: 'Failure Count',
                dataIndex: 'failureCount',
                key: 'failureCount',
                width: 260,
                align: 'center',
                render: (text, record) => {
                    const failureCRISIds = record.failureCrewPfno || [];
                    const failureList = failureCRISIds.join(", ");
                    return text === 0
                        ? text
                        : <div><strong style={{ color: 'red' }}>{text}</strong> ({failureList})</div>;
                },
            },
        ] : [
            {
                title: 'Failure Count (Crew CRIS ID)',
                dataIndex: 'failureCount',
                key: 'failureCount',
                width: 260,
                align: 'center',
                sorter: (a, b) => a.failureCount - b.failureCount,
                defaultSortOrder: 'descend',
                render: (text, record) => {
                    const failureCRISIds = record.failureCrewCrisId || [];
                    const failureList = failureCRISIds.join(", ");
                    return text === 0
                        ? text
                        : <div><strong style={{ color: 'red' }}>{text}</strong> ({failureList})</div>;
                },
            },
        ])
    ];

    const changeEdtSearch = (searchWord) => {
        if (searchWord === null || searchWord === '') {
            setStoreExcelData(localDataList);
        } else {
            let searchResults = localDataList.filter((item) => {
                return item.name?.toLowerCase().includes(searchWord.toLowerCase()) ||
                    item.crisID?.toLowerCase().includes(searchWord.toLowerCase());
            });
            setStoreExcelData(searchResults);
        }
    };

    const changeEdtSearchRaw = (evt) => {
        let searchWord = evt.target.value;
        if (searchWord === null || searchWord === '') {
            setStoreExcelData(localDataList);
        } else {
            let searchResults = localDataList.filter((item) => {
                return item.name?.toLowerCase().includes(searchWord.toLowerCase()) ||
                    item.crisID?.toLowerCase().includes(searchWord.toLowerCase());
            });
            setStoreExcelData(searchResults);
        }
    };

    const listHeaderSearchUI = () => {
        return (
            <div>
                <Row gutter={[10, 3]}>
                    <Col flex={2}>
                        <Input.Search
                            size='middle'
                            placeholder="Search"
                            allowClear
                            value={searchInput}
                            onChange={(evt) => {
                                setSearchInput(evt.target.value);
                                changeEdtSearchRaw(evt);
                            }}
                            onSearch={changeEdtSearch}
                        />
                    </Col>
                    <Col flex={1}>
                        <Button
                            size='middle'
                            onClick={() => {
                                setSearchInput(''); // Clear search input
                                // setRefresh(refresh + 1);
                                setCurrentPage(1);
                                setStoreExcelData(localDataList);
                            }}
                            icon={<ReloadOutlined />}
                        ></Button>
                    </Col>
                    <Col flex={2}></Col>
                </Row>
            </div>
        );
    };


    return (
        <>
            <div style={{ backgroundColor: '#ffffff' }}>
                <div>
                    <Dragger {...uploadProps}>
                        <p className="ant-upload-drag-icon">
                            <InboxOutlined />
                        </p>
                        <p className="ant-upload-text">Click or drag file to this area to upload</p>
                        <p className="ant-upload-hint">Please upload your file in XLSX format.</p>
                    </Dragger>
                </div>
                <Row justify="center" style={{ marginTop: '20px', }}>
                    <Button type="primary" loading={isLoading} onClick={downloadSample} style={{ marginRight: '16px' }}>
                        Download Sample Excel File
                    </Button>
                </Row>
            </div>

            <Modal
                title='Preview'
                open={modelOpen}
                onCancel={() => setModelOpen(false)}
                footer={null}
                //  style={{overflow:'hidden'}}
                width='50%'
            >
                <div >
                    <Row gutter={16}>
                        <div style={{ marginBottom: '20px', marginLeft: "8px" }}>
                            {listHeaderSearchUI()}
                        </div>
                        <Col span={24}>
                            <Table
                                dataSource={storeExcelData}
                                columns={Columns}
                                rowKey="key"
                                size='small'
                                pagination={{
                                    current: currentPage,
                                    total: storeExcelData.length,
                                    pageSize: pageSize,
                                    pageSizeOptions: ['5', '10', '15', '20'],
                                    showSizeChanger: true,
                                    onChange: (page, newPageSize) => {
                                        if (pageSize != newPageSize) {
                                            setCurrentPage(1)
                                        } else {
                                            setCurrentPage(page)
                                        }
                                        setPageSize(newPageSize)
                                    }
                                }}
                                scroll={{ y: '300px' }}
                                tableLayout='fixed'
                                style={{ overflow: "auto", }}
                            />
                        </Col>
                        <Space style={{
                            display: "flex",
                            justifyContent: "flex-end", width: "100%", textAlign: "right"
                        }}>
                            <Button loading={isLoading}
                                onClick={() => uploadDataExcel('cancel')}
                                style={{ color: APP_COLOR_CODES.PRIMARY_COLOR_CODE, borderColor: APP_COLOR_CODES.PRIMARY_COLOR_CODE }}
                            >
                                Cancel
                            </Button>
                            <Button type="primary" loading={isLoading} onClick={() => uploadDataExcel('proceed')}>
                                Proceed
                            </Button>
                        </Space>
                    </Row>

                </div>
            </Modal>

            <LogoutComponent open={isSessionExpiredVisible} />
        </>
    );
};

export default ExcelUpload2;
