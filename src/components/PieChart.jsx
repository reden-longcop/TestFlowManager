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
import { Pie } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

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
                    padding: 10,
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
            }
        },
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
                    <Pie data={data} options={options} />
                </div>
                <div className="mt-4 text-center text-slate-200">
                    <p>Total Test Cases: {testCaseData.total}</p>
                </div>
            </div>
        </div>
    );
};

export default PieChartModal;