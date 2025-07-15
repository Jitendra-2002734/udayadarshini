import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Typography, Form, Input} from 'antd';

import { API_URLS, LOCAL_STORAGE_CONSTANTS} from '../configure/MyUtilsConfig';
import { useOutletContext } from 'react-router-dom';


import ExcelUpload from "./ExcelUpload";
import LogoutComponent from '../logout/LogoutComponent';


let localDataList = [];
const { TextArea } = Input;
const DistrictMandalvillageEXcel = () => {
    const [form] = Form.useForm();
  
    const [isSessionExpiredVisible, setIsSessionExpiredVisible] = useState(false);
   
    const { apiHeader } = useOutletContext();
 

  

    return (
        <>
        <Row gutter={[16, 6]}>
  <Col span={24}>
    <Typography.Title level={4}>
      Masters &gt;&gt; District Mandal Village Excel Upload
    </Typography.Title>
  </Col>

  <Col span={24}>
    {/* <Typography.Title level={5}>Upload Excel</Typography.Title> */}
    <Card style={{ maxWidth: '400px',marginBottom:'0px', margintop:'0px' }}>
      <ExcelUpload
        name="Sample_Cities_List"
        uploadExcel={API_URLS.VILLAGE_UPLOAD_EXCEL}
        downloadExcel={API_URLS.VILLAGE_DOWNLOAD_EXCEL}
       // deleteExcel="https://api.mindcoinapps.com/pmsapi/masterCities/deleteByIds"
      />
    </Card>
  </Col>
</Row>

            
            <LogoutComponent open={isSessionExpiredVisible} />
        </>
    );
};

export default DistrictMandalvillageEXcel;