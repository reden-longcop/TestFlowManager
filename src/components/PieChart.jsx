// PieChart.jsx
import React from 'react';
import "../styles/Modal.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleRight } from "@fortawesome/free-solid-svg-icons";
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
                    'rgba(151, 189, 97, 0.6)',    // Passed - Green
                    'rgba(253, 164, 175, 0.6)',    // Failed - Red
                    'rgba(199, 210, 254, 0.6)',    // Blocked - Orange
                    'rgba(209, 213, 219, 0.6)',   // Not Applicable - Grey
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

    // Optional: Customize chart options
    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'bottom',
                labels: {
                    boxWidth: 20,
                    padding: 15,
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
                onClick={(e) => e.stopPropagation()} // Prevent modal from closing when clicking inside
            >
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-white">Test Cases Status</h2>
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