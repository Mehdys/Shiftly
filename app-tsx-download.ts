import React, { useState, useEffect, useMemo } from 'react';
import { Calendar, Users, Clock, Plus, Check, X, Bell, Settings, ChevronRight, Search, Filter } from 'lucide-react';

// ============================================================================
// DATA MODELS & TYPES
// ============================================================================

const generateId = () => Math.random().toString(36).substr(2, 9);

const generateJoinCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
};

// ============================================================================
// MOCK DATA & STATE MANAGEMENT
// ============================================================================

const EMOJIS = ['🚀', '⚡', '🌟', '🔥', '💎', '🎯', '🌈', '⭐', '💫', '🎨', '🎪', '🎭'];

const initialServices = [];
const initialInterns = [];
const initialGroups = [];
const initialRequests = [];
const initialAssignments = [];
const initialNotifications = [];

// ============================================================================
// MAIN APP COMPONENT
// ============================================================================

export default function OnCallScheduler() {
  // State
  const [services, setServices] = useState(initialServices);
  const [interns, setInterns] = useState(initialInterns);
  const [groups, setGroups] = useState(initialGroups);
  const [joinRequests, setJoinRequests] = useState(initialRequests);
  const [assignments, setAssignments] = useState(initialAssignments);
  const [notifications, setNotifications] = useState(initialNotifications);
  
  const [currentUser, setCurrentUser] = useState(null);
  const [currentService, setCurrentService] = useState(null);
  const [screen, setScreen] = useState('welcome');
  const [modalOpen, setModalOpen] = useState(null);

  // Derived state
  const currentUserData = useMemo(() => 
    interns.find(i => i.id === currentUser), 
    [interns, currentUser]
  );

  const currentUserGroup = useMemo(() => 
    groups.find(g => g.serviceId === currentService && 
      interns.some(i => i.id === currentUser && i.groupId === g.id)),
    [groups, interns, currentUser, currentService]
  );

  const serviceGroups = useMemo(() => 
    groups.filter(g => g.serviceId === currentService),
    [groups, currentService]
  );

  const serviceInterns = useMemo(() => 
    interns.filter(i => i.serviceId === currentService),
    [interns, currentService]
  );

  const ungroupedCount = useMemo(() => 
    serviceInterns.filter(i => !i.groupId).length,
    [serviceInterns]
  );

  const userNotifications = useMemo(() => 
    notifications.filter(n => n.recipientId === currentUser && !n.read),
    [notifications, currentUser]
  );

  const myPendingRequests = useMemo(() => 
    joinRequests.filter(r => r.internId === currentUser && r.status === 'pending'),
    [joinRequests, currentUser]
  );

  // ============================================================================
  // ACTIONS
  // ============================================================================

  const createService = (name, startDate, endDate) => {
    const service = {
      id: generateId(),
      name,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      joinCode: generateJoinCode(),
      createdBy: currentUser,
      locked: false,
      createdAt: new Date()
    };
    setServices([...services, service]);
    setCurrentService(service.id);
    
    // Auto-add creator as first intern
    const intern = {
      id: currentUser || generateId(),
      serviceId: service.id,
      name: 'You',
      groupId: null,
      joinedAt: new Date()
    };
    if (!currentUser) {
      setCurrentUser(intern.id);
    }
    setInterns([...interns, intern]);
    
    setScreen('service-created');
    return service;
  };

  const joinService = (code, name) => {
    const service = services.find(s => s.joinCode === code);
    if (!service) {
      alert('Invalid join code');
      return;
    }

    const internId = generateId();
    const intern = {
      id: internId,
      serviceId: service.id,
      name,
      groupId: null,
      joinedAt: new Date()
    };
    
    setInterns([...interns, intern]);
    setCurrentUser(internId);
    setCurrentService(service.id);
    setScreen('group-selection');
  };

  const createGroup = (name, emoji, maxSize) => {
    const group = {
      id: generateId(),
      serviceId: currentService,
      name,
      emoji: emoji || EMOJIS[groups.length % EMOJIS.length],
      createdBy: currentUser,
      isOpen: true,
      maxSize: maxSize || null,
      createdAt: new Date()
    };
    
    setGroups([...groups, group]);
    
    // Auto-add creator to group
    setInterns(interns.map(i => 
      i.id === currentUser ? { ...i, groupId: group.id } : i
    ));

    addNotification({
      recipientId: 'all',
      type: 'group_created',
      groupId: group.id,
      senderId: currentUser,
      message: `${currentUserData?.name} created ${emoji} ${name}`
    });

    setModalOpen(null);
    setScreen('dashboard');
  };

  const requestToJoinGroup = (groupId) => {
    const existing = joinRequests.find(r => 
      r.groupId === groupId && r.internId === currentUser && r.status === 'pending'
    );
    
    if (existing) return;

    const request = {
      id: generateId(),
      groupId,
      internId: currentUser,
      status: 'pending',
      requestedAt: new Date()
    };
    
    setJoinRequests([...joinRequests, request]);

    const group = groups.find(g => g.id === groupId);
    addNotification({
      recipientId: group.createdBy,
      type: 'join_request',
      groupId,
      senderId: currentUser,
      message: `${currentUserData?.name} wants to join your group`
    });
  };

  const respondToRequest = (requestId, approved) => {
    const request = joinRequests.find(r => r.id === requestId);
    if (!request) return;

    const group = groups.find(g => g.id === request.groupId);
    const groupMembers = interns.filter(i => i.groupId === group.id);

    if (approved) {
      // Check if group is full
      if (group.maxSize && groupMembers.length >= group.maxSize) {
        alert('Group is now full');
        return;
      }

      // Check if intern already joined another group
      const intern = interns.find(i => i.id === request.internId);
      if (intern.groupId) {
        alert('This person already joined another group');
        setJoinRequests(joinRequests.filter(r => r.id !== requestId));
        return;
      }

      // Approve and add to group
      setInterns(interns.map(i => 
        i.id === request.internId ? { ...i, groupId: group.id } : i
      ));

      // Cancel other pending requests from this intern
      setJoinRequests(joinRequests.map(r => 
        r.internId === request.internId && r.id !== requestId && r.status === 'pending'
          ? { ...r, status: 'rejected' }
          : r.id === requestId
          ? { ...r, status: 'approved', respondedAt: new Date(), respondedBy: currentUser }
          : r
      ));

      addNotification({
        recipientId: request.internId,
        type: 'request_approved',
        groupId: group.id,
        senderId: currentUser,
        message: `You've been accepted to ${group.emoji} ${group.name}!`
      });
    } else {
      setJoinRequests(joinRequests.map(r => 
        r.id === requestId 
          ? { ...r, status: 'rejected', respondedAt: new Date(), respondedBy: currentUser }
          : r
      ));

      addNotification({
        recipientId: request.internId,
        type: 'request_rejected',
        groupId: group.id,
        senderId: currentUser,
        message: `Your request to join ${group.emoji} ${group.name} was declined`
      });
    }
  };

  const generateSchedule = () => {
    const service = services.find(s => s.id === currentService);
    const serviceGroups = groups.filter(g => g.serviceId === currentService);
    
    if (ungroupedCount > 0) {
      alert(`${ungroupedCount} interns still need to join a group`);
      return;
    }

    if (serviceGroups.length === 0) {
      alert('No groups created yet');
      return;
    }

    const startDate = new Date(service.startDate);
    const endDate = new Date(service.endDate);
    const totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24)) + 1;
    
    const newAssignments = [];
    let groupIndex = 0;

    for (let i = 0; i < totalDays; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      
      newAssignments.push({
        id: generateId(),
        serviceId: currentService,
        groupId: serviceGroups[groupIndex].id,
        date,
        createdAt: new Date()
      });

      groupIndex = (groupIndex + 1) % serviceGroups.length;
    }

    setAssignments([...assignments, ...newAssignments]);
    setServices(services.map(s => 
      s.id === currentService 
        ? { ...s, scheduleGeneratedAt: new Date() }
        : s
    ));

    setScreen('schedule-generated');
  };

  const addNotification = (notif) => {
    const notification = {
      id: generateId(),
      ...notif,
      read: false,
      createdAt: new Date()
    };
    
    if (notif.recipientId === 'all') {
      // Broadcast to all service members
      serviceInterns.forEach(intern => {
        setNotifications(prev => [...prev, { ...notification, recipientId: intern.id }]);
      });
    } else {
      setNotifications([...notifications, notification]);
    }
  };

  const markNotificationRead = (notifId) => {
    setNotifications(notifications.map(n => 
      n.id === notifId ? { ...n, read: true } : n
    ));
  };

  // ============================================================================
  // SCREEN COMPONENTS
  // ============================================================================

  const WelcomeScreen = () => (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-3xl shadow-2xl p-8 text-center">
          <div className="w-20 h-20 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-10 h-10 text-indigo-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">On-Call Scheduler</h1>
          <p className="text-gray-600 mb-8">Fair scheduling for hospital interns</p>
          
          <button
            onClick={() => setScreen('create-service')}
            className="w-full bg-indigo-600 text-white py-4 rounded-xl font-semibold mb-3 hover:bg-indigo-700 transition"
          >
            Create New Service
          </button>
          
          <button
            onClick={() => setScreen('join-service')}
            className="w-full bg-white text-indigo-600 py-4 rounded-xl font-semibold border-2 border-indigo-600 hover:bg-indigo-50 transition"
          >
            Join Existing Service
          </button>
        </div>
      </div>
    </div>
  );

  const CreateServiceScreen = () => {
    const [name, setName] = useState('');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');

    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-md mx-auto pt-8">
          <button onClick={() => setScreen('welcome')} className="text-indigo-600 mb-4">
            ← Back
          </button>
          
          <div className="bg-white rounded-2xl shadow-lg p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Create Service</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Service Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., Cardiology Feb-Apr 2024"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              {startDate && endDate && (
                <div className="bg-indigo-50 p-3 rounded-lg">
                  <p className="text-sm text-indigo-700">
                    Total: {Math.ceil((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)) + 1} days
                  </p>
                </div>
              )}
            </div>

            <button
              onClick={() => {
                if (name && startDate && endDate) {
                  createService(name, startDate, endDate);
                }
              }}
              disabled={!name || !startDate || !endDate}
              className="w-full mt-6 bg-indigo-600 text-white py-4 rounded-xl font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-indigo-700 transition"
            >
              Create Service
            </button>
          </div>
        </div>
      </div>
    );
  };

  const ServiceCreatedScreen = () => {
    const service = services.find(s => s.id === currentService);
    
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-md mx-auto pt-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Check className="w-8 h-8 text-green-600" />
            </div>
            
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Service Created!</h2>
            <p className="text-gray-600 mb-6">Share this code with your team</p>
            
            <div className="bg-indigo-50 rounded-xl p-6 mb-6">
              <div className="text-4xl font-bold text-indigo-600 tracking-widest mb-2">
                {service?.joinCode}
              </div>
              <p className="text-sm text-gray-600">Join Code</p>
            </div>

            <div className="space-y-3">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(`Join my on-call service! Code: ${service?.joinCode}`);
                  alert('Copied to clipboard!');
                }}
                className="w-full bg-green-500 text-white py-3 rounded-lg font-medium hover:bg-green-600 transition"
              >
                Share via WhatsApp
              </button>
              
              <button
                onClick={() => setScreen('dashboard')}
                className="w-full bg-indigo-600 text-white py-3 rounded-lg font-medium hover:bg-indigo-700 transition"
              >
                Go to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const JoinServiceScreen = () => {
    const [code, setCode] = useState('');
    const [name, setName] = useState('');
    const [step, setStep] = useState(1);

    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-md mx-auto pt-8">
          <button onClick={() => setScreen('welcome')} className="text-indigo-600 mb-4">
            ← Back
          </button>
          
          <div className="bg-white rounded-2xl shadow-lg p-6">
            {step === 1 && (
              <>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Join Service</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Enter Join Code
                    </label>
                    <input
                      type="text"
                      value={code}
                      onChange={(e) => setCode(e.target.value.toUpperCase())}
                      placeholder="ABC123"
                      maxLength={6}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-center text-2xl font-bold tracking-widest"
                    />
                  </div>
                </div>

                <button
                  onClick={() => setStep(2)}
                  disabled={code.length !== 6}
                  className="w-full mt-6 bg-indigo-600 text-white py-4 rounded-xl font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-indigo-700 transition"
                >
                  Continue
                </button>
              </>
            )}

            {step === 2 && (
              <>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Enter Your Name</h2>
                
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="John Doe"
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <button
                  onClick={() => {
                    if (name) {
                      joinService(code, name);
                    }
                  }}
                  disabled={!name}
                  className="w-full mt-6 bg-indigo-600 text-white py-4 rounded-xl font-semibold disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-indigo-700 transition"
                >
                  Join Service
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  };

  const GroupSelectionScreen = () => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredGroups = serviceGroups.filter(g => 
      g.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        <div className="bg-white border-b sticky top-0 z-10">
          <div className="max-w-2xl mx-auto p-4">
            <h1 className="text-2xl font-bold text-gray-900 mb-4">Form Your Group</h1>
            
            <div className="relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search groups..."
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              />
            </div>

            {ungroupedCount > 0 && (
              <div className="mt-3 bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                <p className="text-sm text-yellow-800">
                  <strong>{ungroupedCount}</strong> interns still need groups
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="max-w-2xl mx-auto p-4">
          {currentUserGroup && (
            <div className="mb-6 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl p-6 text-white shadow-lg">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center">
                  <span className="text-4xl mr-3">{currentUserGroup.emoji}</span>
                  <div>
                    <h3 className="text-xl font-bold">{currentUserGroup.name}</h3>
                    <p className="text-indigo-100 text-sm">You're in this group!</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-4 space-y-2">
                {interns.filter(i => i.groupId === currentUserGroup.id).map(member => (
                  <div key={member.id} className="flex items-center text-white">
                    <div className="w-8 h-8 bg-white bg-opacity-30 rounded-full flex items-center justify-center mr-2">
                      <Users className="w-4 h-4" />
                    </div>
                    <span>{member.name} {member.id === currentUser ? '(You)' : ''}</span>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setScreen('dashboard')}
                className="mt-4 w-full bg-white text-indigo-600 py-3 rounded-lg font-semibold hover:bg-indigo-50 transition"
              >
                View Dashboard
              </button>
            </div>
          )}

          {!currentUserGroup && (
            <div className="grid gap-4 mb-4">
              {filteredGroups.map(group => {
                const members = interns.filter(i => i.groupId === group.id);
                const isFull = group.maxSize && members.length >= group.maxSize;
                const hasPendingRequest = myPendingRequests.some(r => r.groupId === group.id);

                return (
                  <div key={group.id} className="bg-white rounded-xl shadow-md p-5 border-2 border-gray-100 hover:border-indigo-300 transition">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center">
                        <span className="text-3xl mr-3">{group.emoji}</span>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">{group.name}</h3>
                          <p className="text-sm text-gray-600">
                            {isFull ? (
                              <span className="text-red-600">🔴 Full</span>
                            ) : (
                              <span className="text-green-600">🟢 Open</span>
                            )}
                            {' · '}
                            {members.length} {group.maxSize ? `/ ${group.maxSize}` : ''} members
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 mb-3">
                      {members.slice(0, 3).map(member => (
                        <div key={member.id} className="flex items-center bg-gray-100 rounded-full px-3 py-1">
                          <Users className="w-3 h-3 mr-1 text-gray-600" />
                          <span className="text-sm text-gray-700">{member.name}</span>
                        </div>
                      ))}
                      {members.length > 3 && (
                        <div className="flex items-center bg-gray-100 rounded-full px-3 py-1">
                          <span className="text-sm text-gray-700">+{members.length - 3} more</span>
                        </div>
                      )}
                    </div>

                    <button
                      onClick={() => !isFull && !hasPendingRequest && requestToJoinGroup(group.id)}
                      disabled={isFull || hasPendingRequest}
                      className={`w-full py-3 rounded-lg font-semibold transition ${
                        isFull
                          ? 'bg-gray-200 text-gray-500 cursor-not-allowed'
                          : hasPendingRequest
                          ? 'bg-yellow-100 text-yellow-700 cursor-default'
                          : 'bg-indigo-600 text-white hover:bg-indigo-700'
                      }`}
                    >
                      {isFull ? 'Full' : hasPendingRequest ? '⏳ Pending' : 'Request to Join'}
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {!currentUserGroup && filteredGroups.length === 0 && (
            <div className="text-center py-12">
              <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">No groups found</p>
            </div>
          )}
        </div>

        {!currentUserGroup && (
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t p-4">
            <div className="max-w-2xl mx-auto">
              <button
                onClick={() => setModalOpen('create-group')}
                className="w-full bg-indigo-600 text-white py-4 rounded-xl font-semibold hover:bg-indigo-700 transition flex items-center justify-center"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create New Group
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  const DashboardScreen = () => {
    const service = services.find(s => s.id === currentService);
    const scheduleGenerated = !!service?.scheduleGeneratedAt;
    
    const founderGroups = groups.filter(g => 
      g.serviceId === currentService && g.createdBy === currentUser
    );

    const pendingRequestsForMyGroups = joinRequests.filter(r => 
      founderGroups.some(g => g.id === r.groupId) && r.status === 'pending'
    );

    const todayAssignment = assignments.find(a => {
      const today = new Date();
      const assignDate = new Date(a.date);
      return a.serviceId === currentService &&
        assignDate.toDateString() === today.toDateString();
    });

    const todayGroup = todayAssignment ? groups.find(g => g.id === todayAssignment.groupId) : null;

    return (
      <div className="min-h-screen bg-gray-50 pb-20">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white p-6">
          <div className="max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-2xl font-bold">{service?.name}</h1>
              <button onClick={() => setModalOpen('notifications')} className="relative">
                <Bell className="w-6 h-6" />
                {userNotifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center">
                    {userNotifications.length}
                  </span>
                )}
              </button>
            </div>
            <p className="text-indigo-100 text-sm">
              {new Date(service?.startDate).toLocaleDateString()} - {new Date(service?.endDate).toLocaleDateString()}
            </p>
          </div>
        </div>

        <div className="max-w-2xl mx-auto p-4 space-y-4">
          {todayGroup && (
            <div className