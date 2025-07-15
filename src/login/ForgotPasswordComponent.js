import React, { useState } from 'react';
import { Button, message, Modal, Input, Form } from 'antd'
import axios from 'axios';
import { API_URLS, SuccessToast, ErrorToast } from '../configure/MyUtilsConfig'

const ForgotPasswordComponent = () => {

    const [data, setData] = useState({ frgPassDialogStatus: false, loadingForgot: false, forgotPassword: '' });
    const [showSuccessMessage, setShowSuccessMessage] = useState(false);
    const [showErrorMessage, setShowErrorMessage] = useState(false);
    const [messageApi, contextHolder] = message.useMessage();


    const showFrgDialog = () => {
        setData({ ...data, frgPassDialogStatus: true });
    };

    const handleFrgSubmit = () => {

        let password = data.forgotPassword;

        if (!(password === null || password.trim() === '')) {
            setData({ ...data, loadingForgot: true });
            axios.get(API_URLS.URL_AUTH_FORGOT_PASS + `${password}`).then(
                (res) => {
                    localStorage.setItem('forgotMobileInfo', JSON.stringify(res.data.content[0]));
                    if (res.data.status == 200 || res.data.status == 1) {
                        setShowSuccessMessage(true);
                        setShowErrorMessage(false);
                        setData({ ...data, frgPassDialogStatus: true, loadingForgot: false, forgotPassword: '' });
                        SuccessToast(messageApi, res.data.mssg)
                        hideFrgDialog();
                        message.success("Password has been send to your registred MobileNumber.")
                    } else {
                        setShowSuccessMessage(false);
                        setShowErrorMessage(true);
                        setData({ ...data, loadingForgot: false })
                        ErrorToast(messageApi, res.data.mssg)
                    }
                }
            ).catch((error) => {
                setShowSuccessMessage(false);
                setShowErrorMessage(true);
                ErrorToast(messageApi, res.data.mssg)
            });
        }
    };

    const hideFrgDialog = () => {
        setShowSuccessMessage(false);
        setShowErrorMessage(false);
        setData({ ...data, frgPassDialogStatus: false, loadingForgot: false, forgotPassword: '' });
    };

    const changeForgotPassword = (e) => {
        setData({ ...data, forgotPassword: e.target.value })
    };

    return (
        <div>
            <Button type="link" style={{ fontSize: '15px', color: 'Black', marginTop: '2px' }} onClick={showFrgDialog}>Forgot Password?</Button>
            <Modal title="Forgot Password" width={400}
                open={data.frgPassDialogStatus}
                onOk={handleFrgSubmit}
                onCancel={hideFrgDialog}
                styles={{ textAlign: 'center' }}
                footer={[
                ]} >
                <Form onFinish={handleFrgSubmit}>
                    <Form.Item
                        rules={[
                            {
                                required: true,
                                message: 'Enter MobileNumber'
                            },
                            { pattern: /^[0-9]{10}$/, message: 'Mobile number must be exactly 10 digits with only numbers' }
                        ]}
                        name="phone">
                        <Input
                            style={{ height: '45px', width: '320px', marginTop: '10px' }}
                            placeholder="MobileNumber"
                            value={data.forgotPassword}
                            onChange={changeForgotPassword} maxLength={10} />
                    </Form.Item>

                    {showSuccessMessage && <span style={{ color: 'green' }}>Password has been send to your registred MobileNumber.</span>}
                    {showErrorMessage && <span style={{ color: 'red' }}>Something went wrong...please try again</span>}
                    <Form.Item style={{ display: 'flex', justifyContent: 'center' }}>
                        <Button loading={data.loadingForgot} type='primary' htmlType='submit'>
                            Submit
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
}

export default ForgotPasswordComponent;
