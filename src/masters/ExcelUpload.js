import React, { useState } from 'react';
import { InboxOutlined } from '@ant-design/icons';
import { message, Upload, Button, Row, Modal, Table, Typography, Card } from 'antd';
import { saveAs } from 'file-saver';
import { API_URLS, LOCAL_STORAGE_CONSTANTS } from '../configure/MyUtilsConfig';
import { useOutletContext } from 'react-router-dom';
import axios from 'axios';
import LogoutComponent from '../logout/LogoutComponent';
const { Text } = Typography;
const { Dragger } = Upload;

const ExcelUpload = (props) => {
  const { apiHeader } = useOutletContext();
  const [isSessionExpiredVisible, setIsSessionExpiredVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [file, setFile] = useState('');


  const cliUserInfo = JSON.parse(localStorage.getItem(LOCAL_STORAGE_CONSTANTS.USER_INFO));

  const uploadProps = {
    name: 'file',
    data: { Id: cliUserInfo.uuid },
    multiple: false,
    action: props.uploadExcel,
    headers: apiHeader,
    accept: '.xlsx',
    beforeUpload: (file) => {
      return new Promise((resolve, reject) => {
        Modal.confirm({
          title: "Confirm File Upload",
          content: "Are you sure you want to upload this file?",
          okText: "Yes",
          cancelText: "No",
          onOk: () => {
            const isXlsx =
              file.type ===
              "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
            if (!isXlsx) {
              message.error("You can only upload XLSX files!");
              reject(Upload.LIST_IGNORE);
            } else {
              resolve(file);
            }
          },
          onCancel: () => {
            Upload.LIST_IGNORE;
          },
        });
      });
    },
    onChange(info) {
      const { status, response } = info.file;
      if (status !== 'uploading') {
        console.log(info.file, info.fileList);
      }
      if (status === 'done') {

        if (response.status === 1) {
          message.success(response.mssg);
        } else if (response.status === 2) {
          setIsSessionExpiredVisible(true)
        } else {
          Modal.error({
            title: "Excel Upload Failed (Please check the below Fields) ", width: '50%',
            content: (
              <Table style={{ overflow: "auto", height: '400px' }}
                dataSource={response.content}
                columns={[
                  {
                    title: 'Row Number',
                    dataIndex: 'rowNo',
                    key: 'rowNo',
                    render: (text) => <strong>{text}</strong>
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
          return Upload.LIST_IGNORE;
        }
      }
      else if (status === 'error') {
        message.error(`${info.file.name} file upload failed.`);
      } else if (status === 'removed') {
        console.log(`${info.file.name} removed from upload list.`);
      }
    },
    onRemove() {
      handleDeleteFile();
    },
  };

  const handleDeleteFile = () => {
    axios.delete(API_URLS.DELETE_UPLOAD_FILE + `${file}`, { headers: apiHeader }).then((res) => {
      if (res.data.status === 1) {
        message.success(res.data.content.fileSelStatus)
        setFile(null)
      }
      else if (res.data.content === 2) {
        setIsSessionExpiredVisible(true)
      }
      else {
        // message.error(res.data.mssg)
      }
    }).catch((error) => {
      message.error('Error in deleting the file:', error)
    })
  }


  const downloadSample = async () => {
    setIsLoading(true)
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
      setIsLoading(false)
      const blob = await response.blob();
      saveAs(blob, `${props.name}.xlsx`);
    } catch (error) {
      message.error('Failed to download the sample file.');
      setIsLoading(false)
    }
  };

  return (
    <>
      <div style={{ backgroundColor: '#ffffff', }}>
        <div >
          <Dragger {...uploadProps}>
            <p className="ant-upload-drag-icon">
              <InboxOutlined />
            </p>
            <p className="ant-upload-text">Click or drag file to this area to upload</p>
            <p className="ant-upload-hint">
              Please upload your file in XLSX format.
            </p>
          </Dragger>
        </div>
        <Row justify="center" style={{ marginTop: '8px', marginBottom: '8px' }}>
          {props.content1 &&
            <Text type='danger' >
              <strong>NOTE: {props.content1}</strong>
            </Text>
          }
        </Row>
        <Row justify="center" style={{ marginTop: '8px', marginBottom: '14px' }}>
          <Button type="primary" loading={isLoading} onClick={downloadSample} style={{ marginRight: '16px' }}>
            Download Sample Excel File
          </Button>
        </Row>
      </div>
      <LogoutComponent open={isSessionExpiredVisible} />
    </>
  );
};

export default ExcelUpload;
