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

import React, { useEffect, useState } from 'react';
import "../components/Modal.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleRight } from "@fortawesome/free-solid-svg-icons";
import { format } from 'date-fns';

const VersionHistoryModal = ({ isOpen, onClose, onSelectVersion }) => {
    const [versions, setVersions] = useState([]);

    useEffect(() => {
        if (isOpen) {
            fetch("http://localhost:3000/versions.json")
                .then((response) => {
                    if (!response.ok) {
                        throw new Error("Failed to fetch flow data");
                    }
                    return response.json();
                })
                .then((data) => {
                    if (data.versions) {
                        const versionsArray = data.versions;
                        const sortedVersions = versionsArray.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
                        setVersions(sortedVersions);
                    } else {
                        console.error("Invalid data structure:", data);
                    }
                })
                .catch((error) => {
                    console.error("Failed to fetch versions:", error);
                });
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (
        <div className="modal-overlay z-0 select-none text-slate-200" onClick={onClose}>
            <div className="modal-content bg-[#1C1C1E] flex flex-col max-h-[90vh] min-w-[500px]" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2 className='font-bold text-xl'>Version History</h2>
                    <span
                        className="close bg-inherit text-white text-5xl hover:bg-rose-500"
                        onClick={onClose}
                    >
                        &times;
                    </span>
                    <hr className="mb-4 mt-2 border-gray-600 border-1" />
                </div>
                <div className="modal-body divide-y divide-dashed ">
                    {versions.length === 0 ? (
                        <p>No versions available.</p>
                    ) : (
                        <ul className='space-y-3 peer'>
                            {versions.map((version, index) => (
                                <li key={index}>
                                    <button
                                        className="link-button border border-gray-600 w-full px-2 text-right pr-7 py-2 rounded hover:bg-gray-800 hover:border-white"
                                        onClick={() => onSelectVersion(version.flowData)}
                                    >
                                        <FontAwesomeIcon
                                            icon={faAngleRight}
                                            className='float-left peer-hover:pl-10'
                                            size="lg"
                                            color="white"
                                        />
                                        {format(new Date(version.timestamp), "MMMM dd, h:mm a")}
                                    </button>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VersionHistoryModal;