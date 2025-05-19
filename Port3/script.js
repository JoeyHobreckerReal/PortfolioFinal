// FinaPulse - Main Application Script

// ===== Data Models and State =====
const FinaPulse = {
    // Application state
    state: {
        currentDate: new Date(),
        viewMode: 'day', // 'day' or 'week'
        editingEventId: null
    },

    // Data storage
    data: {
        events: [],
        tags: [],
        tasks: [],
        breakSettings: []
    },

    // Initialize the application
    init() {
        // Load data from local storage first
        this.loadData();
        
        // Set up default tags if none exist
        if (this.data.tags.length === 0) {
            this.data.tags = [
                { id: this.generateId(), name: 'Work', color: '#4F7FFF' },
                { id: this.generateId(), name: 'Personal', color: '#9E7BFF' },
                { id: this.generateId(), name: 'Health', color: '#5FF1C6' },
                { id: this.generateId(), name: 'Meeting', color: '#FF6B6B' }
            ];
            this.saveData();
        }
        
        // Setup default break settings if none exist
        if (this.data.breakSettings.length === 0) {
            for (const tag of this.data.tags) {
                this.data.breakSettings.push({
                    id: this.generateId(),
                    tagId: tag.id,
                    mode: 'none',
                    interval: 60,
                    duration: 15,
                    fixedTimes: ['10:00', '15:00']
                });
            }
            this.saveData();
        }
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Initialize UI components
        UI.init();
    },

    // Generate a unique ID
    generateId() {
        return Date.now().toString(36) + Math.random().toString(36).substring(2);
    },

    // Load data from storage
    loadData() {
        const storedData = localStorage.getItem('finaPulseData');
        if (storedData) {
            const parsedData = JSON.parse(storedData);
            
            // Convert date strings back to Date objects for events
            if (parsedData.events) {
                parsedData.events.forEach(event => {
                    event.date = new Date(event.date);
                    if (event.startTime) {
                        const [hours, minutes] = event.startTime.split(':');
                        const startDate = new Date(event.date);
                        startDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
                        event.startDate = startDate;
                    }
                    if (event.endTime) {
                        const [hours, minutes] = event.endTime.split(':');
                        const endDate = new Date(event.date);
                        endDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
                        event.endDate = endDate;
                    }
                });
            }
            
            // Merge with default state
            this.data = { ...this.data, ...parsedData };
        }
    },

    // Save data to storage
    saveData() {
        localStorage.setItem('finaPulseData', JSON.stringify(this.data));
    },

    // Date utilities
    dateUtils: {
        // Format date as YYYY-MM-DD
        formatDateForInput(date) {
            const d = new Date(date);
            let month = '' + (d.getMonth() + 1);
            let day = '' + d.getDate();
            const year = d.getFullYear();
            
            if (month.length < 2) month = '0' + month;
            if (day.length < 2) day = '0' + day;
            
            return [year, month, day].join('-');
        },
        
        // Format time as HH:MM
        formatTimeForInput(date) {
            const d = new Date(date);
            let hours = '' + d.getHours();
            let minutes = '' + d.getMinutes();
            
            if (hours.length < 2) hours = '0' + hours;
            if (minutes.length < 2) minutes = '0' + minutes;
            
            return [hours, minutes].join(':');
        },
        
        // Format date for display (e.g., "Sunday, April 27, 2025")
        formatDateForDisplay(date) {
            return date.toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
            });
        },
        
        // Format time for display (e.g., "14:30")
        formatTimeForDisplay(date) {
            return date.toLocaleTimeString('en-US', { 
                hour: '2-digit', 
                minute: '2-digit', 
                hour12: false 
            });
        },
        
        // Get start of the week (Monday)
        getStartOfWeek(date) {
    // Get Monday of the week at **local** midnight
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust when day is Sunday
    const start = new Date(d.setDate(diff));
    // Reset to 00:00:00.000 to make sure all events of Monday are counted
    start.setHours(0, 0, 0, 0);
    return start;
},
        
        // Get end of the week (Sunday)
        getEndOfWeek(date) {
    // Get Sunday of the same week at 23:59:59.999 local time
    const start = this.getStartOfWeek(date);
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    // Set to last millisecond of the day
    end.setHours(23, 59, 59, 999);
    return end;
},
        
        // Check if two dates are the same day
        isSameDay(date1, date2) {
            return date1.getFullYear() === date2.getFullYear() &&
                   date1.getMonth() === date2.getMonth() &&
                   date1.getDate() === date2.getDate();
        },
        
        // Get array of dates in the current week
        getDaysInWeek(date) {
            const start = this.getStartOfWeek(date);
            const days = [];
            
            for (let i = 0; i < 7; i++) {
                const day = new Date(start);
                day.setDate(day.getDate() + i);
                days.push(day);
            }
            
            return days;
        },
        
        // Get array of dates in the current month
        getDaysInMonth(date) {
            const year = date.getFullYear();
            const month = date.getMonth();
            const firstDay = new Date(year, month, 1);
            const lastDay = new Date(year, month + 1, 0);
            
            const days = [];
            const firstDayOfWeek = firstDay.getDay();
            
            // Add days from previous month
            const prevMonth = new Date(year, month, 0);
            const prevMonthDays = prevMonth.getDate();
            
            for (let i = firstDayOfWeek - 1; i >= 0; i--) {
                const day = new Date(year, month - 1, prevMonthDays - i);
                days.push({ date: day, currentMonth: false });
            }
            
            // Add days from current month
            for (let i = 1; i <= lastDay.getDate(); i++) {
                const day = new Date(year, month, i);
                days.push({ date: day, currentMonth: true });
            }
            
            // Add days from next month
            const remainingDays = 7 - (days.length % 7);
            if (remainingDays < 7) {
                for (let i = 1; i <= remainingDays; i++) {
                    const day = new Date(year, month + 1, i);
                    days.push({ date: day, currentMonth: false });
                }
            }
            
            return days;
        }
    },

    // Event management
    events: {
        // Get events for a specific date
        getEventsForDate(date) {
            return FinaPulse.data.events.filter(event => 
                FinaPulse.dateUtils.isSameDay(new Date(event.date), date)
            );
        },
        
        // Get events for a date range
        getEventsForDateRange(startDate, endDate) {
            return FinaPulse.data.events.filter(event => {
                const eventDate = new Date(event.date);
                return eventDate >= startDate && eventDate <= endDate;
            });
        },
        
        // Add a new event
        addEvent(eventData) {
            const newEvent = {
                id: FinaPulse.generateId(),
                ...eventData,
                date: new Date(eventData.date)
            };
            
            // Calculate start and end times as Date objects
            if (eventData.startTime && eventData.endTime) {
                const [startHours, startMinutes] = eventData.startTime.split(':');
                const [endHours, endMinutes] = eventData.endTime.split(':');
                
                const startDate = new Date(eventData.date);
                startDate.setHours(parseInt(startHours), parseInt(startMinutes), 0, 0);
                newEvent.startDate = startDate;
                
                const endDate = new Date(eventData.date);
                endDate.setHours(parseInt(endHours), parseInt(endMinutes), 0, 0);
                newEvent.endDate = endDate;
            }
            
            FinaPulse.data.events.push(newEvent);
            FinaPulse.saveData();
            
            // Make sure to refresh the tasks list after adding an event
            UI.renderTasksList();
            
            return newEvent;
        },
        
        // Update an existing event
        updateEvent(eventId, updatedData) {
            const eventIndex = FinaPulse.data.events.findIndex(e => e.id === eventId);
            if (eventIndex === -1) return false;
            
            const event = FinaPulse.data.events[eventIndex];
            const updatedEvent = { ...event, ...updatedData };
            
            // Update date if changed
            if (updatedData.date) {
                updatedEvent.date = new Date(updatedData.date);
            }
            
            // Recalculate start and end times if changed
            if (updatedData.startTime || updatedData.endTime) {
                if (updatedData.startTime) {
                    const [hours, minutes] = updatedData.startTime.split(':');
                    const startDate = new Date(updatedEvent.date);
                    startDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
                    updatedEvent.startDate = startDate;
                }
                
                if (updatedData.endTime) {
                    const [hours, minutes] = updatedData.endTime.split(':');
                    const endDate = new Date(updatedEvent.date);
                    endDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
                    updatedEvent.endDate = endDate;
                }
            }
            
            FinaPulse.data.events[eventIndex] = updatedEvent;
            FinaPulse.saveData();
            
            // Also refresh task list after update
            UI.renderTasksList();
            
            return updatedEvent;
        },
        
        // Delete an event
        deleteEvent(eventId) {
            const eventIndex = FinaPulse.data.events.findIndex(e => e.id === eventId);
            if (eventIndex === -1) return false;
            
            FinaPulse.data.events.splice(eventIndex, 1);
            FinaPulse.saveData();
            
            // Also refresh task list after deletion
            UI.renderTasksList();
            
            return true;
        },
        
        // Calculate breaks for an event
        calculateBreaks(event) {
            // Find break settings for the event's tag
            const tagId = event.tagId;
            const breakSetting = FinaPulse.data.breakSettings.find(bs => bs.tagId === tagId);
            
            if (!breakSetting || breakSetting.mode === 'none' || event.allDay) {
                return [];
            }
            
            const breaks = [];
            
            if (breakSetting.mode === 'fixed') {
                // Fixed time breaks
                const fixedTimes = breakSetting.fixedTimes || [];
                
                for (const time of fixedTimes) {
                    if (!time) continue; // Skip empty time slots
                    
                    const [hours, minutes] = time.split(':');
                    const breakDate = new Date(event.date);
                    breakDate.setHours(parseInt(hours), parseInt(minutes), 0, 0);
                    
                    // Check if break is within event time
                    if (event.startDate && event.endDate && 
                        breakDate >= event.startDate && breakDate < event.endDate) {
                        
                        const breakEndDate = new Date(breakDate);
                        breakEndDate.setMinutes(breakEndDate.getMinutes() + (breakSetting.duration || 15));
                        
                        // Ensure break doesn't extend past event end
                        if (breakEndDate > event.endDate) {
                            breakEndDate.setTime(event.endDate.getTime());
                        }
                        
                        breaks.push({
                            startDate: breakDate,
                            endDate: breakEndDate,
                            isBreak: true,
                            eventId: event.id,
                            tagId: event.tagId
                        });
                    }
                }
            } else if (breakSetting.mode === 'interval') {
                // Interval breaks
                if (!event.startDate || !event.endDate || !breakSetting.interval) {
                    return breaks;
                }
                
                const interval = breakSetting.interval; // In minutes
                const duration = breakSetting.duration || 15; // In minutes
                
                let currentTime = new Date(event.startDate);
                currentTime.setMinutes(currentTime.getMinutes() + interval);
                
                while (currentTime < event.endDate) {
                    const breakEndDate = new Date(currentTime);
                    breakEndDate.setMinutes(breakEndDate.getMinutes() + duration);
                    
                    // Ensure break doesn't extend past event end
                    if (breakEndDate > event.endDate) {
                        breakEndDate.setTime(event.endDate.getTime());
                    }
                    
                    breaks.push({
                        startDate: currentTime,
                        endDate: breakEndDate,
                        isBreak: true,
                        eventId: event.id,
                        tagId: event.tagId
                    });
                    
                    currentTime = new Date(breakEndDate);
                    currentTime.setMinutes(currentTime.getMinutes() + interval);
                }
            }
            
            return breaks;
        },
        
        // Calculate event segments (splitting the event by breaks)
        calculateEventSegments(event) {
            const breaks = this.calculateBreaks(event);
            
            if (breaks.length === 0) {
                // If no breaks, the entire event is one segment
                return [{
                    startDate: event.startDate,
                    endDate: event.endDate,
                    isBreak: false,
                    eventId: event.id,
                    title: event.title
                }];
            }
            
            // Sort breaks chronologically
            breaks.sort((a, b) => a.startDate - b.startDate);
            
            const segments = [];
            let currentStart = new Date(event.startDate);
            
            // Add work segments between breaks
            for (const breakEvent of breaks) {
                // Add work segment before break if needed
                if (breakEvent.startDate > currentStart) {
                    segments.push({
                        startDate: currentStart,
                        endDate: breakEvent.startDate,
                        isBreak: false,
                        eventId: event.id,
                        title: event.title
                    });
                }
                
                // Add the break segment
                segments.push({
                    startDate: breakEvent.startDate,
                    endDate: breakEvent.endDate,
                    isBreak: true,
                    eventId: event.id,
                    title: 'Break'
                });
                
                currentStart = new Date(breakEvent.endDate);
            }
            
            // Add final work segment if needed
            if (currentStart < event.endDate) {
                segments.push({
                    startDate: currentStart,
                    endDate: event.endDate,
                    isBreak: false,
                    eventId: event.id,
                    title: event.title
                });
            }
            
            return segments;
        }
    },

    // Tag management
    tags: {
        // Add a new tag
        addTag(name, color) {
            const newTag = {
                id: FinaPulse.generateId(),
                name,
                color
            };
            
            FinaPulse.data.tags.push(newTag);
            
            // Create default break settings for the new tag
            FinaPulse.data.breakSettings.push({
                id: FinaPulse.generateId(),
                tagId: newTag.id,
                mode: 'none',
                interval: 60,
                duration: 15,
                fixedTimes: ['10:00', '15:00']
            });
            
            FinaPulse.saveData();
            
            return newTag;
        },
        
        // Update a tag
        updateTag(tagId, updatedData) {
            const tagIndex = FinaPulse.data.tags.findIndex(t => t.id === tagId);
            if (tagIndex === -1) return false;
            
            FinaPulse.data.tags[tagIndex] = { 
                ...FinaPulse.data.tags[tagIndex], 
                ...updatedData 
            };
            
            FinaPulse.saveData();
            
            return FinaPulse.data.tags[tagIndex];
        },
        
        // Delete a tag
        deleteTag(tagId) {
            const tagIndex = FinaPulse.data.tags.findIndex(t => t.id === tagId);
            if (tagIndex === -1) return false;
            
            // Check if tag is in use
            const tagInUse = FinaPulse.data.events.some(e => e.tagId === tagId) ||
                             FinaPulse.data.tasks.some(t => t.tagId === tagId);
            
            if (tagInUse) {
                return 'Tag is in use and cannot be deleted';
            }
            
            // Remove the tag
            FinaPulse.data.tags.splice(tagIndex, 1);
            
            // Remove associated break settings
            const breakSettingIndex = FinaPulse.data.breakSettings.findIndex(bs => bs.tagId === tagId);
            if (breakSettingIndex !== -1) {
                FinaPulse.data.breakSettings.splice(breakSettingIndex, 1);
            }
            
            FinaPulse.saveData();
            
            return true;
        },
        
        // Get a tag by ID
        getTag(tagId) {
            return FinaPulse.data.tags.find(t => t.id === tagId);
        }
    },

    // Task management
    tasks: {
        // Add a new task
        addTask(name, tagId, duration) {
            const newTask = {
                id: FinaPulse.generateId(),
                name,
                tagId,
                duration: parseInt(duration),
                completed: false
            };
            
            FinaPulse.data.tasks.push(newTask);
            FinaPulse.saveData();
            
            return newTask;
        },
        
        // Update a task
        updateTask(taskId, updatedData) {
            const taskIndex = FinaPulse.data.tasks.findIndex(t => t.id === taskId);
            if (taskIndex === -1) return false;
            
            FinaPulse.data.tasks[taskIndex] = { 
                ...FinaPulse.data.tasks[taskIndex], 
                ...updatedData 
            };
            
            FinaPulse.saveData();
            
            return FinaPulse.data.tasks[taskIndex];
        },
        
        // Delete a task
        deleteTask(taskId) {
            const taskIndex = FinaPulse.data.tasks.findIndex(t => t.id === taskId);
            if (taskIndex === -1) return false;
            
            FinaPulse.data.tasks.splice(taskIndex, 1);
            FinaPulse.saveData();
            
            return true;
        },
        
        // Calculate task completion progress for current week
        calculateTaskProgress() {
            const today = new Date();
            // Get start of the week (Monday)
            const startOfWeek = FinaPulse.dateUtils.getStartOfWeek(today);
            // Get end of the week (Sunday)
            const endOfWeek = FinaPulse.dateUtils.getEndOfWeek(today);
            
            console.log("Current week range:", startOfWeek.toDateString(), "to", endOfWeek.toDateString());
            
            // Get events for the current week (Monday-Sunday)
            const weekEvents = FinaPulse.events.getEventsForDateRange(startOfWeek, endOfWeek);
            
            // Log data to help with debugging
            console.log("Weekly tasks:", FinaPulse.data.tasks);
            console.log("Weekly events:", weekEvents);
            
            // Calculate progress for each task
            return FinaPulse.data.tasks.map(task => {
                // Find events with this task's tag
                const tagEvents = weekEvents.filter(event => {
                    console.log(`Comparing event tag ${event.tagId} with task tag ${task.tagId}`);
                    return event.tagId === task.tagId;
                });
                
                console.log(`Found ${tagEvents.length} events for task ${task.name}`);
                
                // Calculate total duration in minutes
                let totalMinutes = 0;
                
                for (const event of tagEvents) {
                    if (event.allDay) {
                        // Assuming 8-hour workday for all-day events
                        totalMinutes += 8 * 60;
                    } else if (event.startDate && event.endDate) {
                        // Calculate segments (accounting for breaks)
                        const segments = FinaPulse.events.calculateEventSegments(event);
                        
                        // Only count non-break segments
                        for (const segment of segments) {
                            if (!segment.isBreak) {
                                const durationMs = segment.endDate - segment.startDate;
                                const segmentMinutes = durationMs / (1000 * 60);
                                totalMinutes += segmentMinutes;
                            }
                        }
                    }
                }
                
                console.log(`Total minutes for ${task.name}: ${totalMinutes}`);
                
                // Calculate completion percentage
                const taskDuration = task.duration || 60; // Default to 60 minutes
                const completionPercentage = Math.min(100, Math.round((totalMinutes / taskDuration) * 100));
                const completed = completionPercentage >= 100;
                
                console.log(`Progress for ${task.name}: ${completionPercentage}%`);
                
                return {
                    ...task,
                    progress: completionPercentage,
                    completed
                };
            });
        }
    },

    // Break settings management
    breakSettings: {
        // Update or create break settings for a tag
        updateBreakSettings(tagId, settings) {
            const existingIndex = FinaPulse.data.breakSettings.findIndex(bs => bs.tagId === tagId);
            
            if (existingIndex !== -1) {
                FinaPulse.data.breakSettings[existingIndex] = {
                    ...FinaPulse.data.breakSettings[existingIndex],
                    ...settings
                };
            } else {
                FinaPulse.data.breakSettings.push({
                    id: FinaPulse.generateId(),
                    tagId,
                    ...settings
                });
            }
            
            FinaPulse.saveData();
            
            return settings;
        },
        
        // Get break settings for a tag
        getBreakSettings(tagId) {
            return FinaPulse.data.breakSettings.find(bs => bs.tagId === tagId) || {
                tagId,
                mode: 'none'
            };
        }
    },

    // Set up event listeners
    setupEventListeners() {
        // Navigation Buttons
        document.getElementById('prevBtn').addEventListener('click', () => {
            if (this.state.viewMode === 'day') {
                const newDate = new Date(this.state.currentDate);
                newDate.setDate(newDate.getDate() - 1);
                this.state.currentDate = newDate;
            } else {
                const newDate = new Date(this.state.currentDate);
                newDate.setDate(newDate.getDate() - 7);
                this.state.currentDate = newDate;
            }
            UI.refresh();
        });
        
        document.getElementById('nextBtn').addEventListener('click', () => {
            if (this.state.viewMode === 'day') {
                const newDate = new Date(this.state.currentDate);
                newDate.setDate(newDate.getDate() + 1);
                this.state.currentDate = newDate;
            } else {
                const newDate = new Date(this.state.currentDate);
                newDate.setDate(newDate.getDate() + 7);
                this.state.currentDate = newDate;
            }
            UI.refresh();
        });
        
        document.getElementById('todayBtn').addEventListener('click', () => {
            this.state.currentDate = new Date();
            UI.refresh();
        });
        
        // Mini Calendar Navigation
        document.getElementById('prevMonth').addEventListener('click', () => {
            const currentMonth = this.state.currentDate.getMonth();
            const currentYear = this.state.currentDate.getFullYear();
            this.state.currentDate = new Date(currentYear, currentMonth - 1, 1);
            UI.renderMiniCalendar();
        });
        
        document.getElementById('nextMonth').addEventListener('click', () => {
            const currentMonth = this.state.currentDate.getMonth();
            const currentYear = this.state.currentDate.getFullYear();
            this.state.currentDate = new Date(currentYear, currentMonth + 1, 1);
            UI.renderMiniCalendar();
        });
        
        // View Controls
        document.getElementById('dayViewBtn').addEventListener('click', () => {
            this.state.viewMode = 'day';
            document.getElementById('dayViewBtn').classList.add('active');
            document.getElementById('weekViewBtn').classList.remove('active');
            UI.renderCalendar();
        });
        
        document.getElementById('weekViewBtn').addEventListener('click', () => {
            this.state.viewMode = 'week';
            document.getElementById('weekViewBtn').classList.add('active');
            document.getElementById('dayViewBtn').classList.remove('active');
            UI.renderCalendar();
        });
        
        // Add Event Button
        document.getElementById('addEventBtn').addEventListener('click', () => {
            UI.openEventModal();
        });
        
        // Settings Button
        document.getElementById('settingsBtn').addEventListener('click', () => {
            UI.openSettingsModal();
        });
        
        // Close Modal Buttons
        const closeButtons = document.querySelectorAll('.close-modal');
        closeButtons.forEach(button => {
            button.addEventListener('click', function() {
                const modal = this.closest('.modal');
                UI.closeModal(modal);
            });
        });
        
        // Settings Tab Navigation
        const tabButtons = document.querySelectorAll('.tab-btn');
        tabButtons.forEach(button => {
            button.addEventListener('click', function() {
                const tab = this.getAttribute('data-tab');
                
                // Update active tab button
                document.querySelectorAll('.tab-btn').forEach(btn => {
                    btn.classList.remove('active');
                });
                this.classList.add('active');
                
                // Show the selected tab content
                document.querySelectorAll('.tab-content').forEach(content => {
                    content.classList.add('hidden');
                });
                document.getElementById(`${tab}Tab`).classList.remove('hidden');
            });
        });
        
        // Add Tag Form
        document.getElementById('addTagForm').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const name = document.getElementById('tagName').value;
            const color = document.getElementById('tagColor').value;
            
            if (name && color) {
                FinaPulse.tags.addTag(name, color);
                UI.renderTagsList();
                UI.populateTagSelects();
                UI.renderBreakSettingsList();
                
                // Reset form
                document.getElementById('tagName').value = '';
                document.getElementById('tagColor').value = '#9E7BFF';
            }
        });
        
        // Add Task Form
        document.getElementById('addTaskForm').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const name = document.getElementById('taskName').value;
            const tagId = document.getElementById('taskTag').value;
            const duration = document.getElementById('taskDuration').value;
            
            if (name && tagId && duration) {
                FinaPulse.tasks.addTask(name, tagId, duration);
                UI.renderTasksList();
                UI.renderSettingsTasksList();
                
                // Reset form
                document.getElementById('taskName').value = '';
                document.getElementById('taskDuration').value = '60';
            }
        });
        
        // Event Form Submission
        document.getElementById('eventForm').addEventListener('submit', function(e) {
            e.preventDefault();
            
            const title = document.getElementById('eventTitle').value;
            const tagId = document.getElementById('eventTag').value;
            const date = document.getElementById('eventDate').value;
            const allDay = document.getElementById('allDayEvent').checked;
            let startTime = document.getElementById('eventStartTime').value;
            let endTime = document.getElementById('eventEndTime').value;
            const description = document.getElementById('eventDescription').value;
            
            // For all-day events, set start and end times to cover the whole day
            if (allDay) {
                startTime = '00:00';
                endTime = '23:59';
            }
            
            const eventData = {
                title,
                tagId,
                date,
                allDay,
                startTime,
                endTime,
                description
            };
            
            if (FinaPulse.state.editingEventId) {
                // Update existing event
                FinaPulse.events.updateEvent(FinaPulse.state.editingEventId, eventData);
                UI.showMessage('Event updated successfully', 'success');
            } else {
                // Add new event
                FinaPulse.events.addEvent(eventData);
                UI.showMessage('Event added successfully', 'success');
            }
            
            // Make sure we fully refresh the UI
            UI.refresh();
            UI.renderTasksList(); // Explicit task refresh
            UI.closeModal(document.getElementById('eventModal'));
        });
        
        // Delete Event Button
        document.getElementById('deleteEventBtn').addEventListener('click', () => {
            if (FinaPulse.state.editingEventId) {
                FinaPulse.events.deleteEvent(FinaPulse.state.editingEventId);
                UI.showMessage('Event deleted successfully', 'success');
                UI.refresh();
                UI.closeModal(document.getElementById('eventModal'));
            }
        });
        
        // All Day Event Checkbox
        document.getElementById('allDayEvent').addEventListener('change', function() {
            const timeInputs = document.querySelector('.time-inputs');
            timeInputs.style.display = this.checked ? 'none' : 'flex';
        });
        
        // Edit Event Button in View Modal
        document.getElementById('editEventBtn').addEventListener('click', () => {
            const eventId = document.getElementById('editEventBtn').getAttribute('data-event-id');
            UI.closeModal(document.getElementById('viewEventModal'));
            UI.openEventModal(eventId);
        });
    }
};

// UI Management
const UI = {
    init() {
        this.renderTimeLabels();
        this.renderMiniCalendar();
        this.renderCalendar();
        this.renderTagsList();
        this.renderTasksList();
        this.renderSettingsTasksList();
        this.renderBreakSettingsList();
        this.populateTagSelects();
    },

    refresh() {
        this.renderMiniCalendar();
        this.renderCalendar();
        this.renderTasksList();
        this.populateTagSelects();
    },

    renderTimeLabels() {
        const timeLabelsContainer = document.querySelector('.time-labels');
        timeLabelsContainer.innerHTML = '';
        
        for (let hour = 0; hour < 24; hour++) {
            const timeLabel = document.createElement('div');
            timeLabel.className = 'time-label';
            
            const formattedHour = hour.toString().padStart(2, '0');
            timeLabel.textContent = `${formattedHour}:00`;
            
            timeLabelsContainer.appendChild(timeLabel);
        }
    },

    renderMiniCalendar() {
        const currentDate = FinaPulse.state.currentDate;
        const today = new Date();
        
        // Update mini calendar month header
        const monthYear = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
        document.getElementById('miniCalendarMonth').textContent = monthYear;
        
        // Generate mini calendar days
        const miniCalendarGrid = document.getElementById('miniCalendarGrid');
        miniCalendarGrid.innerHTML = '';
        
        // Add day labels (Sun-Sat)
        const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
        for (const label of dayLabels) {
            const dayLabel = document.createElement('div');
            dayLabel.className = 'mini-calendar-day-label';
            dayLabel.textContent = label;
            miniCalendarGrid.appendChild(dayLabel);
        }
        
        // Get days for the current month
        const daysInMonth = FinaPulse.dateUtils.getDaysInMonth(currentDate);
        
        for (const day of daysInMonth) {
            const dayElement = document.createElement('div');
            dayElement.className = 'mini-calendar-day';
            
            if (!day.currentMonth) {
                dayElement.style.opacity = '0.3';
            }
            
            const dayDate = day.date;
            dayElement.textContent = dayDate.getDate();
            
            // Highlight today
            if (FinaPulse.dateUtils.isSameDay(dayDate, today)) {
                dayElement.classList.add('today');
            }
            
            // Highlight selected day
            if (FinaPulse.dateUtils.isSameDay(dayDate, currentDate)) {
                dayElement.classList.add('selected');
            }
            
            // Check if day has events
            const hasEvents = FinaPulse.events.getEventsForDate(dayDate).length > 0;
            if (hasEvents) {
                dayElement.classList.add('has-events');
            }
            
            // Add click event
            dayElement.addEventListener('click', () => {
                FinaPulse.state.currentDate = new Date(dayDate);
                UI.refresh();
            });
            
            miniCalendarGrid.appendChild(dayElement);
        }
    },

    renderCalendar() {
        const currentDate = FinaPulse.state.currentDate;
        const viewMode = FinaPulse.state.viewMode;
        
        // Update header date display
        document.getElementById('currentDateDisplay').textContent = FinaPulse.dateUtils.formatDateForDisplay(currentDate);
        
        // Render day labels
        this.renderDayLabels();
        
        // Render events grid
        this.renderEventsGrid();
    },

    renderDayLabels() {
        const dayLabelsContainer = document.getElementById('dayLabels');
        dayLabelsContainer.innerHTML = '';
        
        const viewMode = FinaPulse.state.viewMode;
        const currentDate = FinaPulse.state.currentDate;
        const today = new Date();
        
        if (viewMode === 'day') {
            // Single day view
            const dayLabel = document.createElement('div');
            dayLabel.className = 'day-label';
            
            if (FinaPulse.dateUtils.isSameDay(currentDate, today)) {
                dayLabel.classList.add('today');
            }
            
            dayLabel.textContent = currentDate.toLocaleDateString('en-US', { weekday: 'short' });
            dayLabelsContainer.appendChild(dayLabel);
        } else {
            // Week view
            const weekDays = FinaPulse.dateUtils.getDaysInWeek(currentDate);
            
            for (const day of weekDays) {
                const dayLabel = document.createElement('div');
                dayLabel.className = 'day-label';
                
                if (FinaPulse.dateUtils.isSameDay(day, today)) {
                    dayLabel.classList.add('today');
                }
                
                const dayName = day.toLocaleDateString('en-US', { weekday: 'short' });
                const dayDate = day.getDate();
                dayLabel.textContent = `${dayName} ${dayDate}`;
                
                dayLabelsContainer.appendChild(dayLabel);
            }
        }
    },

    renderEventsGrid() {
        const eventsGrid = document.getElementById('eventsGrid');
        eventsGrid.innerHTML = '';
        
        const viewMode = FinaPulse.state.viewMode;
        const currentDate = FinaPulse.state.currentDate;
        
        let daysToRender = [];
        if (viewMode === 'day') {
            daysToRender = [currentDate];
        } else {
            daysToRender = FinaPulse.dateUtils.getDaysInWeek(currentDate);
        }
        
        // Create all-day events container
        const allDayEventsContainer = document.createElement('div');
        allDayEventsContainer.className = 'all-day-events';
        eventsGrid.appendChild(allDayEventsContainer);
        
        // Render time grid
        const timeGrid = document.createElement('div');
        timeGrid.className = 'time-grid';
        eventsGrid.appendChild(timeGrid);
        
        // Create time rows
        for (let hour = 0; hour < 24; hour++) {
            const timeRow = document.createElement('div');
            timeRow.className = 'time-row';
            
            // Create time cells for each day
            for (let dayIndex = 0; dayIndex < daysToRender.length; dayIndex++) {
                const timeCell = document.createElement('div');
                timeCell.className = 'time-cell';
                timeRow.appendChild(timeCell);
            }
            
            timeGrid.appendChild(timeRow);
        }
        
        // Helper to lighten a color
        const lightenColor = (color, percent) => {
            const num = parseInt(color.replace('#', ''), 16),
                  amt = Math.round(2.55 * percent),
                  R = (num >> 16) + amt,
                  G = (num >> 8 & 0x00FF) + amt,
                  B = (num & 0x0000FF) + amt;
            return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 + 
                    (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 + 
                    (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
        };
        
        // Render all-day events
        for (let dayIndex = 0; dayIndex < daysToRender.length; dayIndex++) {
            const day = daysToRender[dayIndex];
            const events = FinaPulse.events.getEventsForDate(day);
            
            // Filter all-day events
            const allDayEvents = events.filter(event => event.allDay);
            
            for (const event of allDayEvents) {
                const tag = FinaPulse.tags.getTag(event.tagId);
                if (!tag) continue;
                
                const allDayEvent = document.createElement('div');
                allDayEvent.className = 'all-day-event';
                allDayEvent.style.backgroundColor = tag.color;
                allDayEvent.textContent = event.title;
                
                // Add click event
                allDayEvent.addEventListener('click', () => {
                    this.openViewEventModal(event.id);
                });
                
                allDayEventsContainer.appendChild(allDayEvent);
            }
            
            // Filter and render timed events
            const timedEvents = events.filter(event => !event.allDay && event.startDate && event.endDate);
            
            for (const event of timedEvents) {
                const tag = FinaPulse.tags.getTag(event.tagId);
                if (!tag) continue;
                
                // Calculate segments (event pieces split by breaks)
                const segments = FinaPulse.events.calculateEventSegments(event);
                
                for (const segment of segments) {
                    // Calculate position and height
                    const startHour = segment.startDate.getHours();
                    const startMinute = segment.startDate.getMinutes();
                    const endHour = segment.endDate.getHours();
                    const endMinute = segment.endDate.getMinutes();
                    
                    const top = (startHour * 60 + startMinute) * (60 / 60); // 60px per hour
                    const height = ((endHour * 60 + endMinute) - (startHour * 60 + startMinute)) * (60 / 60);
                    
                    const eventElement = document.createElement('div');
                    eventElement.className = 'event';
                    
                    // Apply different styling for breaks vs regular segments
                    if (segment.isBreak) {
                        eventElement.classList.add('break-indicator');
                        eventElement.style.backgroundColor = lightenColor(tag.color, 30); // Lighter color for break
                    } else {
                        eventElement.style.backgroundColor = tag.color;
                    }
                    
                    eventElement.style.top = `${top}px`;
                    eventElement.style.height = `${height}px`;
                    
                    if (daysToRender.length > 1) {
                        // For week view, calculate left position
                        const columnWidth = 100 / daysToRender.length;
                        eventElement.style.left = `${dayIndex * columnWidth}%`;
                        eventElement.style.width = `${columnWidth}%`;
                    }
                    
                    const eventTitle = document.createElement('div');
                    eventTitle.className = 'event-title';
                    eventTitle.textContent = segment.isBreak ? 'Break' : segment.title;
                    eventElement.appendChild(eventTitle);
                    
                    if (!segment.isBreak || height > 30) {
                        const eventTime = document.createElement('div');
                        eventTime.className = 'event-time';
                        eventTime.textContent = `${FinaPulse.dateUtils.formatTimeForDisplay(segment.startDate)} - ${FinaPulse.dateUtils.formatTimeForDisplay(segment.endDate)}`;
                        eventElement.appendChild(eventTime);
                    }
                    
                    // Add click event only for non-break segments
                    if (!segment.isBreak) {
                        eventElement.addEventListener('click', () => {
                            this.openViewEventModal(event.id);
                        });
                    }
                    
                    eventsGrid.appendChild(eventElement);
                }
            }
        }
    },

    renderTagsList() {
        const tagsListContainer = document.getElementById('tagsList');
        tagsListContainer.innerHTML = '';
        
        for (const tag of FinaPulse.data.tags) {
            const tagItem = document.createElement('div');
            tagItem.className = 'tag-item';
            
            const tagColor = document.createElement('div');
            tagColor.className = 'tag-color';
            tagColor.style.backgroundColor = tag.color;
            
            const tagName = document.createElement('div');
            tagName.className = 'tag-name';
            tagName.textContent = tag.name;
            
            const tagActions = document.createElement('div');
            tagActions.className = 'tag-actions';
            
            const editBtn = document.createElement('button');
            editBtn.className = 'action-btn';
            editBtn.innerHTML = '<i class="fas fa-edit"></i>';
            editBtn.addEventListener('click', () => {
                this.editTag(tag.id);
            });
            
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'action-btn';
            deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
            deleteBtn.addEventListener('click', () => {
                this.deleteTag(tag.id);
            });
            
            tagActions.appendChild(editBtn);
            tagActions.appendChild(deleteBtn);
            
            tagItem.appendChild(tagColor);
            tagItem.appendChild(tagName);
            tagItem.appendChild(tagActions);
            
            tagsListContainer.appendChild(tagItem);
        }
    },

    renderTasksList() {
        const tasksListContainer = document.getElementById('tasksList');
        tasksListContainer.innerHTML = '';
        
        // Get tasks with progress
        const tasksWithProgress = FinaPulse.tasks.calculateTaskProgress();
        
        for (const task of tasksWithProgress) {
            const tag = FinaPulse.tags.getTag(task.tagId);
            if (!tag) continue;
            
            const taskItem = document.createElement('div');
            taskItem.className = 'task-item';
            if (task.completed) {
                taskItem.classList.add('task-complete');
            }
            
            const taskTag = document.createElement('div');
            taskTag.className = 'task-tag';
            taskTag.style.backgroundColor = tag.color;
            
            const taskInfo = document.createElement('div');
            taskInfo.className = 'task-info';
            
            const taskName = document.createElement('div');
            taskName.className = 'task-name';
            taskName.textContent = task.name;
            
            const taskProgress = document.createElement('div');
            taskProgress.className = 'task-progress';
            taskProgress.textContent = `${task.progress}% of ${task.duration} minutes`;
            
            taskInfo.appendChild(taskName);
            taskInfo.appendChild(taskProgress);
            
            taskItem.appendChild(taskTag);
            taskItem.appendChild(taskInfo);
            
            tasksListContainer.appendChild(taskItem);
        }
    },

    renderSettingsTasksList() {
        const settingsTasksListContainer = document.getElementById('settingsTasksList');
        settingsTasksListContainer.innerHTML = '';
        
        for (const task of FinaPulse.data.tasks) {
            const tag = FinaPulse.tags.getTag(task.tagId);
            if (!tag) continue;
            
            const taskItem = document.createElement('div');
            taskItem.className = 'settings-task-item';
            
            const taskTag = document.createElement('div');
            taskTag.className = 'tag-color';
            taskTag.style.backgroundColor = tag.color;
            
            const taskName = document.createElement('div');
            taskName.className = 'settings-task-name';
            taskName.textContent = `${task.name} (${task.duration} min - ${tag.name})`;
            
            const taskActions = document.createElement('div');
            taskActions.className = 'settings-task-actions';
            
            const editBtn = document.createElement('button');
            editBtn.className = 'action-btn';
            editBtn.innerHTML = '<i class="fas fa-edit"></i>';
            editBtn.addEventListener('click', () => {
                this.editTask(task.id);
            });
            
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'action-btn';
            deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
            deleteBtn.addEventListener('click', () => {
                this.deleteTask(task.id);
            });
            
            taskActions.appendChild(editBtn);
            taskActions.appendChild(deleteBtn);
            
            taskItem.appendChild(taskTag);
            taskItem.appendChild(taskName);
            taskItem.appendChild(taskActions);
            
            settingsTasksListContainer.appendChild(taskItem);
        }
    },

    renderBreakSettingsList() {
        const breakSettingsListContainer = document.getElementById('breakSettingsList');
        breakSettingsListContainer.innerHTML = '';
        
        for (const tag of FinaPulse.data.tags) {
            const breakSetting = FinaPulse.breakSettings.getBreakSettings(tag.id);
            
            const breakSettingItem = document.createElement('div');
            breakSettingItem.className = 'break-setting-item';
            
            const tagColor = document.createElement('div');
            tagColor.className = 'tag-color';
            tagColor.style.backgroundColor = tag.color;
            
            const breakSettingDetails = document.createElement('div');
            breakSettingDetails.className = 'break-setting-details';
            
            const tagName = document.createElement('div');
            tagName.className = 'tag-name';
            tagName.textContent = tag.name;
            
            const breakSettingType = document.createElement('div');
            breakSettingType.className = 'break-setting-type';
            
            if (breakSetting.mode === 'fixed') {
                breakSettingType.textContent = 'Breaks at fixed times';
            } else if (breakSetting.mode === 'interval') {
                breakSettingType.textContent = `Breaks every ${breakSetting.interval || 60} minutes (${breakSetting.duration || 15} min duration)`;
            } else {
                breakSettingType.textContent = 'No breaks';
            }
            
            breakSettingDetails.appendChild(tagName);
            breakSettingDetails.appendChild(breakSettingType);
            
            const breakSettingMode = document.createElement('div');
            breakSettingMode.className = 'break-setting-mode';
            
            // Create radio buttons for break modes
            const modeOptions = [
                { value: 'none', label: 'No breaks' },
                { value: 'fixed', label: 'Fixed times' },
                { value: 'interval', label: 'Time intervals' }
            ];
            
            for (const option of modeOptions) {
                const radioContainer = document.createElement('div');
                radioContainer.className = 'radio-container';
                
                const radioInput = document.createElement('input');
                radioInput.type = 'radio';
                radioInput.name = `break-mode-${tag.id}`;
                radioInput.value = option.value;
                radioInput.id = `break-mode-${tag.id}-${option.value}`;
                radioInput.checked = breakSetting.mode === option.value;
                
                radioInput.addEventListener('change', () => {
                    if (radioInput.checked) {
                        FinaPulse.breakSettings.updateBreakSettings(tag.id, {
                            mode: option.value
                        });
                        
                        // Show/hide appropriate inputs
                        if (option.value === 'fixed') {
                            fixedInputs.style.display = 'flex';
                            intervalInputs.style.display = 'none';
                        } else if (option.value === 'interval') {
                            fixedInputs.style.display = 'none';
                            intervalInputs.style.display = 'flex';
                        } else {
                            fixedInputs.style.display = 'none';
                            intervalInputs.style.display = 'none';
                        }
                        
                        // Refresh UI to show updated breaks
                        UI.refresh();
                    }
                });
                
                const radioLabel = document.createElement('label');
                radioLabel.htmlFor = `break-mode-${tag.id}-${option.value}`;
                radioLabel.textContent = option.label;
                
                radioContainer.appendChild(radioInput);
                radioContainer.appendChild(radioLabel);
                
                breakSettingMode.appendChild(radioContainer);
            }
            
            // Fixed time inputs
            const fixedInputs = document.createElement('div');
            fixedInputs.className = 'break-inputs';
            fixedInputs.style.display = breakSetting.mode === 'fixed' ? 'flex' : 'none';
            
            // Create inputs for fixed break times
            const fixedTimes = breakSetting.fixedTimes || ['10:00', '15:00'];
            
            for (let i = 0; i < 3; i++) {
                const timeInputGroup = document.createElement('div');
                timeInputGroup.className = 'break-input-group';
                
                const timeLabel = document.createElement('label');
                timeLabel.textContent = `Break ${i + 1} Time`;
                
                const timeInput = document.createElement('input');
                timeInput.type = 'time';
                timeInput.value = fixedTimes[i] || '';
                
                timeInput.addEventListener('change', () => {
                    const newFixedTimes = [...(breakSetting.fixedTimes || [])];
                    newFixedTimes[i] = timeInput.value;
                    
                    // Filter out empty values
                    const filteredTimes = newFixedTimes.filter(time => time);
                    
                    FinaPulse.breakSettings.updateBreakSettings(tag.id, {
                        fixedTimes: filteredTimes
                    });
                    
                    // Refresh UI to show updated breaks
                    UI.refresh();
                });
                
                timeInputGroup.appendChild(timeLabel);
                timeInputGroup.appendChild(timeInput);
                
                fixedInputs.appendChild(timeInputGroup);
            }
            
            const fixedDurationGroup = document.createElement('div');
            fixedDurationGroup.className = 'break-input-group';
            
            const fixedDurationLabel = document.createElement('label');
            fixedDurationLabel.textContent = 'Duration (min)';
            
            const fixedDurationInput = document.createElement('input');
            fixedDurationInput.type = 'number';
            fixedDurationInput.min = '5';
            fixedDurationInput.max = '60';
            fixedDurationInput.step = '5';
            fixedDurationInput.value = breakSetting.duration || '15';
            
            fixedDurationInput.addEventListener('change', () => {
                FinaPulse.breakSettings.updateBreakSettings(tag.id, {
                    duration: parseInt(fixedDurationInput.value)
                });
                
                // Refresh UI to show updated breaks
                UI.refresh();
            });
            
            fixedDurationGroup.appendChild(fixedDurationLabel);
            fixedDurationGroup.appendChild(fixedDurationInput);
            
            fixedInputs.appendChild(fixedDurationGroup);
            
            // Interval inputs
            const intervalInputs = document.createElement('div');
            intervalInputs.className = 'break-inputs';
            intervalInputs.style.display = breakSetting.mode === 'interval' ? 'flex' : 'none';
            
            const intervalGroup = document.createElement('div');
            intervalGroup.className = 'break-input-group';
            
            const intervalLabel = document.createElement('label');
            intervalLabel.textContent = 'Work Interval (min)';
            
            const intervalInput = document.createElement('input');
            intervalInput.type = 'number';
            intervalInput.min = '15';
            intervalInput.max = '180';
            intervalInput.step = '15';
            intervalInput.value = breakSetting.interval || '60';
            
            intervalInput.addEventListener('change', () => {
                FinaPulse.breakSettings.updateBreakSettings(tag.id, {
                    interval: parseInt(intervalInput.value)
                });
                
                // Refresh UI to show updated breaks
                UI.refresh();
            });
            
            intervalGroup.appendChild(intervalLabel);
            intervalGroup.appendChild(intervalInput);
            
            intervalInputs.appendChild(intervalGroup);
            
            const durationGroup = document.createElement('div');
            durationGroup.className = 'break-input-group';
            
            const durationLabel = document.createElement('label');
            durationLabel.textContent = 'Break Duration (min)';
            
            const durationInput = document.createElement('input');
            durationInput.type = 'number';
            durationInput.min = '5';
            durationInput.max = '60';
            durationInput.step = '5';
            durationInput.value = breakSetting.duration || '15';
            
            durationInput.addEventListener('change', () => {
                FinaPulse.breakSettings.updateBreakSettings(tag.id, {
                    duration: parseInt(durationInput.value)
                });
                
                // Refresh UI to show updated breaks
                UI.refresh();
            });
            
            durationGroup.appendChild(durationLabel);
            durationGroup.appendChild(durationInput);
            
            intervalInputs.appendChild(durationGroup);
            
            breakSettingMode.appendChild(fixedInputs);
            breakSettingMode.appendChild(intervalInputs);
            
            breakSettingItem.appendChild(tagColor);
            breakSettingItem.appendChild(breakSettingDetails);
            breakSettingItem.appendChild(breakSettingMode);
            
            breakSettingsListContainer.appendChild(breakSettingItem);
        }
    },

    populateTagSelects() {
        const tagSelects = document.querySelectorAll('#eventTag, #taskTag');
        
        for (const select of tagSelects) {
            select.innerHTML = '';
            
            // Add default option
            const defaultOption = document.createElement('option');
            defaultOption.value = '';
            defaultOption.textContent = 'Select a tag';
            select.appendChild(defaultOption);
            
            // Add tag options
            for (const tag of FinaPulse.data.tags) {
                const option = document.createElement('option');
                option.value = tag.id;
                option.textContent = tag.name;
                option.style.backgroundColor = tag.color;
                select.appendChild(option);
            }
        }
    },

    openEventModal(eventId = null) {
        const modal = document.getElementById('eventModal');
        const form = document.getElementById('eventForm');
        const deleteBtn = document.getElementById('deleteEventBtn');
        
        // Reset form
        form.reset();
        
        // Update modal title
        const modalTitle = document.getElementById('modalTitle');
        
        if (eventId) {
            // Editing existing event
            const event = FinaPulse.data.events.find(e => e.id === eventId);
            if (!event) return;
            
            modalTitle.textContent = 'Edit Event';
            deleteBtn.style.display = 'block';
            
            // Populate form
            document.getElementById('eventTitle').value = event.title;
            document.getElementById('eventTag').value = event.tagId;
            document.getElementById('eventDate').value = FinaPulse.dateUtils.formatDateForInput(event.date);
            document.getElementById('allDayEvent').checked = event.allDay;
            
            const timeInputs = document.querySelector('.time-inputs');
            timeInputs.style.display = event.allDay ? 'none' : 'flex';
            
            if (!event.allDay) {
                document.getElementById('eventStartTime').value = event.startTime;
                document.getElementById('eventEndTime').value = event.endTime;
            }
            
            document.getElementById('eventDescription').value = event.description || '';
            
            // Store editing event ID
            FinaPulse.state.editingEventId = eventId;
        } else {
            // Adding new event
            modalTitle.textContent = 'Add Event';
            deleteBtn.style.display = 'none';
            
            // Set default date to current date
            document.getElementById('eventDate').value = FinaPulse.dateUtils.formatDateForInput(FinaPulse.state.currentDate);
            
            // Clear editing event ID
            FinaPulse.state.editingEventId = null;
        }
        
        // Show modal
        modal.style.display = 'block';
    },

    openViewEventModal(eventId) {
        const modal = document.getElementById('viewEventModal');
        const event = FinaPulse.data.events.find(e => e.id === eventId);
        if (!event) return;
        
        const tag = FinaPulse.tags.getTag(event.tagId);
        if (!tag) return;
        
        // Populate modal
        document.getElementById('viewEventTitle').textContent = event.title;
        
        // Set tag info
        const viewEventTag = document.getElementById('viewEventTag');
        viewEventTag.querySelector('.tag-color').style.backgroundColor = tag.color;
        viewEventTag.querySelector('.tag-name').textContent = tag.name;
        
        // Set time info
        const viewEventTime = document.getElementById('viewEventTime');
        if (event.allDay) {
            viewEventTime.querySelector('span').textContent = 'All Day';
        } else {
            viewEventTime.querySelector('span').textContent = `${event.startTime} - ${event.endTime}`;
        }
        
        // Set description
        const viewEventDescription = document.getElementById('viewEventDescription');
        viewEventDescription.innerHTML = event.description ? `<p>${event.description}</p>` : '<p>No description available.</p>';
        
        // Set edit button data
        document.getElementById('editEventBtn').setAttribute('data-event-id', eventId);
        
        // Show modal
        modal.style.display = 'block';
    },

    openSettingsModal() {
        const modal = document.getElementById('settingsModal');
        modal.style.display = 'block';
        
        // Reset active tab
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector('.tab-btn[data-tab="tags"]').classList.add('active');
        
        document.querySelectorAll('.tab-content').forEach(content => {
            content.classList.add('hidden');
        });
        document.getElementById('tagsTab').classList.remove('hidden');
    },

    closeModal(modal) {
        modal.style.display = 'none';
    },

    editTag(tagId) {
        const tag = FinaPulse.data.tags.find(t => t.id === tagId);
        if (!tag) return;
        
        const newName = prompt('Enter new tag name:', tag.name);
        if (!newName) return;
        
        const newColor = prompt('Enter new tag color (hex code):', tag.color);
        if (!newColor) return;
        
        FinaPulse.tags.updateTag(tagId, { name: newName, color: newColor });
        this.renderTagsList();
        this.populateTagSelects();
        this.refresh();
    },

    deleteTag(tagId) {
        if (confirm('Are you sure you want to delete this tag? All associated events and tasks will lose their tag.')) {
            const result = FinaPulse.tags.deleteTag(tagId);
            
            if (result === true) {
                this.renderTagsList();
                this.populateTagSelects();
                this.refresh();
            } else if (typeof result === 'string') {
                alert(result);
            }
        }
    },

    editTask(taskId) {
        const task = FinaPulse.data.tasks.find(t => t.id === taskId);
        if (!task) return;
        
        const newName = prompt('Enter new task name:', task.name);
        if (!newName) return;
        
        const newDuration = prompt('Enter new task duration (minutes):', task.duration);
        if (!newDuration) return;
        
        FinaPulse.tasks.updateTask(taskId, { 
            name: newName, 
            duration: parseInt(newDuration) 
        });
        
        this.renderTasksList();
        this.renderSettingsTasksList();
    },

    deleteTask(taskId) {
        if (confirm('Are you sure you want to delete this task?')) {
            FinaPulse.tasks.deleteTask(taskId);
            this.renderTasksList();
            this.renderSettingsTasksList();
        }
    },

    showMessage(text, type = 'info') {
        // Create message element
        const message = document.createElement('div');
        message.className = `message ${type}`;
        message.textContent = text;
        
        // Append to body
        document.body.appendChild(message);
        
        // Remove after 3 seconds
        setTimeout(() => {
            message.classList.add('fade-out');
            setTimeout(() => {
                document.body.removeChild(message);
            }, 500);
        }, 3000);
    }
};

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    FinaPulse.init();
});