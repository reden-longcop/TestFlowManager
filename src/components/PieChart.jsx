/*
 * This file is part of Test Flow Manager.
 *
 * Test Flow Manager is free software: you can redistribute it and/or modify
 * it under the terms of the GNU Lesser General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * Test Flow Manager is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 * GNU Lesser General Public License for more details.
 *
 * You should have received a copy of the GNU Lesser General Public License
 * along with Test Flow Manager. If not, see <http://www.gnu.org/licenses/>.
*/

import React from 'react';
import "../styles/Modal.css";
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import ChartDataLabels from 'chartjs-plugin-datalabels';

ChartJS.register(ArcElement, Tooltip, Legend, ChartDataLabels);

const centerTextPlugin = {
    id: 'centerText',
    beforeDraw: (chart) => {
        const { width, height, ctx } = chart;
        ctx.save();

        const totalFontSize = (height / 160).toFixed(2);
        ctx.font = `${totalFontSize}em sans-serif`;
        ctx.textBaseline = "middle";
        ctx.textAlign = 'center';

        const total = chart.config.data.datasets[0].data.reduce((a, b) => a + b, 0);
        const totalText = `${total}`;
        const subText = "Test Cases";

        const textX = width / 2;
        const textY = height / 2;

        ctx.fillStyle = '#fff';
        ctx.fillText(totalText, textX, textY -30);

        ctx.font = `2em sans-serif`;
        ctx.fillText(subText, textX, textY + 20);

        ctx.restore();
    }
};

ChartJS.register(centerTextPlugin);

const PieChartModal = ({ isOpen, onClose, testCaseData }) => {
    if (!isOpen) return null;

    const { notstarted, passed, failed, blocked, notapplicable } = testCaseData;

    const data = {
        labels: ['Not Started', 'Passed', 'Failed', 'Blocked', 'Not Applicable'],
        datasets: [
            {
                label: 'Test Case Status',
                data: [notstarted, passed, failed, blocked, notapplicable],
                backgroundColor: [
                    'rgba(254, 240, 138, 0.6)',    // Not Started - Yellow
                    'rgba(151, 189, 97, 0.6)',     // Passed - Green
                    'rgba(253, 164, 175, 0.6)',    // Failed - Red
                    'rgba(199, 210, 254, 0.6)',    // Blocked - Indigo
                    'rgba(209, 213, 219, 0.6)',    // Not Applicable - Grey
                ],
                borderColor: [
                    'rgba(254, 240, 138, 1)',
                    'rgba(151, 189, 97, 1)',
                    'rgba(253, 164, 175, 1)',
                    'rgba(199, 210, 254, 1)',
                    'rgba(209, 213, 219, 1)',
                ],
                borderWidth: 1,
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    boxHeight: 10,
                    boxWidth: 20,
                    padding: 10
                },
            },
            tooltip: {
                callbacks: {
                    label: function(context) {
                        const label = context.label || '';
                        const value = context.raw || 0;
                        return `${label}: ${value}`;
                    }
                }
            },
            datalabels: {
                color: '#fff',
                formatter: (value, context) => {
                    const total = context.chart._metasets[0].total;
                    const percentage = (value / total * 100);
                    if (percentage > 0) {
                        if (percentage % 1 === 0) {
                            return `${percentage.toFixed(0)}%`;
                        } else {
                            return `${percentage.toFixed(2)}%`;
                        }
                    } else {
                        return '';
                    }
                },
                align: 'center',
                offset: -10,
                borderRadius: 3,
                font: { 
                    weight: 'bold',
                    size: 20,
                    family: 'Space Mono',
                }
            }
        },
        layout: {
            padding: {
                top: 10,
            }
        }
    };

    return (
        <div className="modal-overlay z-50 select-none" onClick={onClose}>
            <div 
                className="modal-content bg-[#1C1C1E] flex flex-col p-6 max-h-[90vh] min-w-[500px] relative"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center mb-5">
                    <h2 className="text-xl font-semibold text-white">Test Status Chart</h2>
                    <span
                        className="close bg-inherit text-white text-5xl hover:bg-rose-500"
                        onClick={onClose}
                    >
                        &times;
                    </span>
                </div>
                <div className="flex justify-center items-center flex-1">
                    <Doughnut data={data} options={options} />
                </div>
            </div>
        </div>
    );
};

export default PieChartModal;