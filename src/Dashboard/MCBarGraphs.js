import React from 'react';
import ReactECharts from 'echarts-for-react';
import { Card } from 'antd';

const MCBarGraphs = ({ id, data, title, type, onClickGraphs, Access }) => {
    const shouldShowLegend = type !== 'sampleGraph';

    const getBarChartOptions = () => {
        if (!data || data.length === 0) {
            return {};
        }

        let series = [];
        if (type === 'sampleGraph' || type === 'yearWiseGraph') {
            series = {
                type: 'bar',
                data: data.map(item => ({
                    value: item.count,
                    itemStyle: { color: item.color },
                    uuid: item.uuid
                })),
                label: {
                    show: true,
                    position: 'top',
                    fontSize: Access === 'NoOnClickGraph' ? 11 : 13,
                    formatter: '{c}',
                    color: 'black'
                },
            };
        } else {
            const years = Array.from(
                new Set(data.flatMap(item => item.yearlyData?.map(d => d.year) || []))
            );

            series = years.map(year => ({
                name: year,
                type: 'bar',
                data: data.map(item => {
                    const yearData = item.yearlyData.find(d => d.year === year);
                    return {
                        value: yearData ? yearData.count : 0,
                        uuid: item.uuid
                    };
                }),
                label: {
                    show: true,
                    position: 'top',
                    formatter: '{c}',
                    color: 'black'
                },
            }));
        }

        return {
            title: {
                text: title,
                textStyle: {
                color: 'black',
                fontWeight: 500
                }
            },
            tooltip: {
                trigger: 'item'
            },
            legend: shouldShowLegend ? { bottom: '5px' } : undefined,
            xAxis: {
                type: 'category',
                data: data.map(item => item.name),
                axisLabel: {
                    rotate: 45,
                    fontSize: 12,
                    color: 'black',
                    textStyle: 'strong',
                    fontWeight: 500
                }
            },
            toolbox: {
                show: true,
                feature: {
                    saveAsImage: { show: true }
                }
            },
            yAxis: {
                type: 'value'
            },
            grid: {
                top: 60,
                bottom:65,
                right: 20,
                left: Access === 'NoOnClickGraph' ? 75 : 85,
            },
            series: series,
        };
    };

    const handleBarClick = chart => {
        chart.on('click', params => {
            if (params.componentType === 'series') {
                const clickedItemCount = params.data.count;
                if (clickedItemCount === 0) {
                    return;
                }
                onClickGraphs(params);
            }
        });
    };

    return (
        <>
            <Card>
                <ReactECharts
                    option={getBarChartOptions()}
                    style={
                        Access === 'NoOnClickGraph'
                            ? { height: '400px', width: '100%' }
                            : { height: '450px', width: '100%' }
                    }
                    key={JSON.stringify(getBarChartOptions())}
                    onChartReady={Access !== 'NoOnClickGraph' ? handleBarClick : undefined}
                />
            </Card>
        </>
    );
};

export default MCBarGraphs;
