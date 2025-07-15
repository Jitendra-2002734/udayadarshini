import React, { useRef, } from 'react';
import { Modal, Spin } from 'antd';
import { ResponsiveContainer, } from 'recharts';

import ReactECharts from 'echarts-for-react';


const PieChartModal = ({ 
  open, 
  onClose, 
  title, 
  data = [],
  isLoading = false
}) => {
  const chartRef = useRef(null);

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: '{b} - {c}',
      textStyle: {
        fontSize: 13
      }
    },
    legend: {
      orient: 'horizontal',
      bottom: 0,
      left: 'center',
      textStyle: {
        color: 'black',
        fontWeight: 500
      }
    },
    series: [
      {
        type: 'pie',
        radius: '55%',
        center: ['50%', '40%'],
        data: data,
        label: {
          show: true,
          formatter: '{b} - {c}',
          color: 'black',
          fontSize: 12,
          fontWeight: 500,
        },
        labelLine: {
          length: 12,
          length2: 10
        },
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  };

  return (
    <Modal
      open={open}
      onCancel={onClose}
      title={`Intensity Distribution - ${title}`}
      footer={null}
      width={800}
      centered
    >
      {isLoading ? (
        <div style={{ height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
          <Spin size="large" />
        </div>
      ) : data.length > 0 ? (
        
          <ResponsiveContainer width="100%" height="100%">
        <ReactECharts
          ref={chartRef}
          option={option}
     style={{ height: '50vh', width: '100%' }}
        />
        </ResponsiveContainer>
      ) : (
        <div style={{ textAlign: 'center', marginTop: 100, color: '#888' }}>
          No intensity data available
        </div>
      )}
    </Modal>
  );
};

export default PieChartModal;
