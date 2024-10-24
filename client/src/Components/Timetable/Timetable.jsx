import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { jwtDecode } from 'jwt-decode';
import Navbar from "../Navbar/Navbar";
import TimetableChat from '../TimetableChat/TimetableChat';
import ChatBot from '../ChatBot/ChatBot';
import bgimg from '../../assets/bg.jpg';
import styles from './Timetable.module.css';
import { base_url } from '../../assets/help';

const Timetable = () => {
    const [schedule, setSchedule] = useState(null);
    const [preferences, setPreferences] = useState([]);
    const [tasks, setTasks] = useState([]);
    const [timetableId, setTimetableId] = useState(null);
    const [filter, setFilter] = useState('pending'); // Default filter is 'pending'
    const navigate = useNavigate();
    const [settings, setSettings] = useState({
        userId: '',
        fontstyle:'',
        fontsize:'',
        notiftime:15,
    });

    const fetchSettings = async (userId) => {
        try {
            const response = await fetch(`${base_url}/settings/${userId}`);
            const data = await response.json();
            if (response.ok) {
                setSettings(data);
            } 
            else {
                console.log("error")
            }
        } catch (error) {
            console.log("error")
        }
    };

    const fetchTasks = async (userId) => {
        try {
            const response = await fetch(`${base_url}/tasks/${userId}`);
            const data = await response.json();
            if (response.ok) {
                setTasks(data);
            } else {
                setTasks([]);
            }
        } catch (error) {
            console.error('Error fetching tasks:', error);
            setTasks([]);
        }
    };

    const fetchpreferences = async (userId) => {
        try {
            const response = await fetch(`${base_url}/preferences/${userId}`);
            const data = await response.json();
            if (response.ok) {
                setPreferences(data);
            } else {
                setPreferences([]);
            }
        } catch (error) {
            console.error('Error fetching preferences:', error);
            setPreferences([]);
        }
    };

    const sendEmailNotification = async (task, userEmail) => {
        try {
            const response = await fetch(`${base_url}/send-notif`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    to: userEmail,
                    subject: `Upcoming Task: ${task.activity}`,
                    text: `Your task "${task.activity}" is due in 15 minutes at ${task.time} on ${task.date}.`
                }),
            });

            if (response.ok) {
                console.log(`Email notification sent for task: ${task.activity}`);
            } else {
                console.error('Failed to send email notification');
            }
        } catch (error) {
            console.error('Error sending email notification:', error);
        }
    };

    const checkUpcomingTasks = () => {
        if (!schedule) {
            console.log('Schedule is not loaded yet');
            return;
        }
    
        const now = new Date();
        const userEmail = jwtDecode(localStorage.getItem('access_token')).user.email;
        console.log(userEmail);

        schedule.forEach(task => {
            if (task.status === 'pending') {
                // Assuming task.date is in 'YYYY-MM-DD' format and task.time is in 'HH:MM' format
                const [day, month, year] = task.date.split('/');
                const [hours, minutes] = task.time.split(':');
                
                // Create taskDateTime with the correct year, month, day, hours, and minutes
                const taskDateTime = new Date(year, month - 1, day, hours, minutes);

                // Calculate the difference in minutes
                const timeDiff = taskDateTime.getTime() - now.getTime();
                const minutesDiff = Math.floor(timeDiff / 60000);
                console.log(minutesDiff);
                console.log(settings.notiftime);

                // Check if the task is {notiftime} minutes away
                if (minutesDiff === parseInt(settings.notiftime,10)) {
                    console.log("hii");
                    sendEmailNotification(task, userEmail);
                }
            }
        });

    };

    useEffect(() => {
        if (schedule) {
            const intervalId = setInterval(checkUpcomingTasks, 60000);
            return () => clearInterval(intervalId);
        }
    }, [schedule]);

    useEffect(() => {
        const token = localStorage.getItem('access_token');
        const decodedToken = jwtDecode(token);
        const userId = decodedToken.user.id;
        fetchTasks(userId);
        fetchpreferences(userId);
        fetchSettings(userId);
    }, []);

    useEffect(() => {

        document.body.style.backgroundImage = `url(${bgimg})`;
        document.body.style.backgroundSize = 'cover';
        document.body.style.backgroundRepeat = 'no-repeat';

        const fetchTimetable = async () => {
            const token = localStorage.getItem('access_token');
            const decodedToken = jwtDecode(token);
            const userId = decodedToken.user.id;

            try {
                // Fetch latest timetable
                const response = await fetch(`${base_url}/timetable/${userId}`);
                if (response.ok) {
                    const data = await response.json();
                    if (data) {
                        setSchedule(data.schedule);
                        setTimetableId(data._id);
                    }
                }
            } catch (error) {
                console.error('Error fetching timetable:', error);
            }
        };

        fetchTimetable();

        return () => {
            document.body.style.backgroundImage = '';
            document.body.style.backgroundSize = '';
            document.body.style.backgroundRepeat = '';
        };
    }, []);

    const handleTaskStatus = async (task, status) => {
        try {
            const taskId = task._id;  
            const task_id = task.task_id;

            const timetableResponse = await fetch(`${base_url}/timetable/${timetableId}/task/${taskId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ status }), 
            });
    
            if (timetableResponse.ok) {
                const updatedTimetable = await timetableResponse.json();
                setSchedule(updatedTimetable.schedule); 
    
                // Check if the same task exists with pending status in current schedule
                const hasPendingTask = updatedTimetable.schedule.some(
                    scheduleItem => scheduleItem.task_id === task_id && 
                                  scheduleItem.status === 'pending' &&
                                  scheduleItem._id !== taskId  
                );
    
                // Only update the tasks database if there are no pending instances
                if (!hasPendingTask) {
                    const tasksResponse = await fetch(`${base_url}/tasks/${task_id}`, {
                        method: 'PUT',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ status }), 
                    });
    
                    if (tasksResponse.ok) {
                        console.log('Task status updated in tasks database successfully.');
                    } else {
                        console.error('Failed to update task status in tasks database');
                    }
                } else {
                    console.log('Task not updated in tasks database as pending instances exist');
                }
            } else {
                console.error('Failed to update task status in timetable');
            }
        } catch (error) {
            console.error('Error updating task status:', error);
        }
    };
    
    const filteredSchedule = schedule ? schedule.filter(item => item.status === filter) : [];

    if (!schedule) {
        return (
            <>
                <Navbar />
                <div className={styles.container}>
                    <div className={styles.noSchedule}>
                        <h2>No Timetable Generated</h2>
                        <p>Please go back to the tasks page and generate a timetable first.</p>
                        <button onClick={() => navigate('/tasks')} className={styles.backButton}>
                            Back to Tasks
                        </button>
                    </div>
                </div>
            </>
        );
    }

    const handleScheduleUpdate = (newSchedule) => {
        setSchedule(newSchedule);
        window.location.reload();
    };

    return (
        <>
            <Navbar />
            <div className={styles.container}>
                <h1>Your Schedule</h1>

                {/* Filter Dropdown */}
                <div className={styles.filterContainer}>
                    <label>Status: </label>
                    <select 
                        id="statusFilter" 
                        value={filter} 
                        onChange={(e) => setFilter(e.target.value)}
                        className={styles.filterDropdown}
                    >
                        <option value="pending">Pending</option>
                        <option value="completed">Completed</option>
                        <option value="missed">Missed</option>
                    </select>
                </div>

                <div className={styles.timetableContainer}>
                    <table className={styles.timetable}>
                        <thead>
                            <tr>
                                <th>Date</th>
                                <th>Time</th>
                                <th>Activity</th>
                                <th>Category</th>
                                <th>Priority</th>
                                <th>Status</th>
                                {filter === 'pending' && <th>Actions</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {filteredSchedule.map((item, index) => (
                                <tr key={index}>
                                    <td>{item.date}</td>
                                    <td>{item.time}</td>
                                    <td>{item.activity}</td>
                                    <td>{item.category}</td>
                                    <td>{item.priority || 'N/A'}</td>
                                    <td>{item.status.toUpperCase()}</td>
                                    {filter === 'pending' && <td>
                                        {item._id && item.status === 'pending' && (
                                            <div className={styles.actionButtons}>
                                                <button 
                                                    onClick={() => handleTaskStatus(item, 'completed')}
                                                    className={styles.completeButton}
                                                >
                                                    Completed
                                                </button>
                                                <button 
                                                    onClick={() => handleTaskStatus(item, 'missed')}
                                                    className={styles.missedButton}
                                                >
                                                    Missed
                                                </button>
                                            </div>
                                        )}
                                    </td>}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            <TimetableChat
                preferences={preferences}
                tasks={tasks}
                schedule={schedule}
                onScheduleUpdate={handleScheduleUpdate}
            />
            <ChatBot
                preferences={preferences}
                tasks={tasks}
                schedule={schedule}
            />
        </>
    );
};

export default Timetable;