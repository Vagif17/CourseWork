import React, { useState, useEffect } from 'react';
import './CreateGroupModal.css';
import { chatService } from '../../../../../services/chatService';
import { api } from '../../../../../services/API';
import { getUserId } from '../../../../../utils/getUserIdUtil';
import type { ParticipantDTO } from '../../../../../types/chats';

interface CreateGroupModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const CreateGroupModal: React.FC<CreateGroupModalProps> = ({ isOpen, onClose }) => {
    const [groupName, setGroupName] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState<ParticipantDTO[]>([]);
    const [selectedUsers, setSelectedUsers] = useState<ParticipantDTO[]>([]);
    const [loading, setLoading] = useState(false);
    const [avatarFile, setAvatarFile] = useState<File | null>(null);
    const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

    const currentUserId = getUserId();

    useEffect(() => {
        if (!isOpen) {
            setGroupName('');
            setSearchQuery('');
            setSearchResults([]);
            setSelectedUsers([]);
            setAvatarFile(null);
            setAvatarPreview(null);
        }
    }, [isOpen]);

    useEffect(() => {
        const timer = setTimeout(async () => {
            if (searchQuery.length >= 2) {
                try {
                    const { data } = await api.get<ParticipantDTO[]>('/User/search', {
                        params: { query: searchQuery }
                    });
                    // Filter out already selected users AND the current user
                    setSearchResults(data.filter(u => 
                        u.userId !== currentUserId && 
                        !selectedUsers.find(s => s.userId === u.userId)
                    ));
                } catch (err) {
                    console.error('Search error', err);
                }
            } else {
                setSearchResults([]);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [searchQuery, selectedUsers, currentUserId]);

    const handleSelectUser = (user: ParticipantDTO) => {
        setSelectedUsers([...selectedUsers, user]);
        setSearchQuery('');
        setSearchResults([]);
    };

    const handleRemoveUser = (userId: string) => {
        setSelectedUsers(selectedUsers.filter(u => u.userId !== userId));
    };

    const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setAvatarFile(file);
            setAvatarPreview(URL.createObjectURL(file));
        }
    };

    const handleCreate = async () => {
        if (!groupName.trim() || selectedUsers.length === 0) return;

        setLoading(true);
        try {
            await chatService.createGroupChat(
                groupName, 
                selectedUsers.map(u => u.userId),
                avatarFile || undefined
            );
            onClose();
        } catch (err) {
            console.error('Failed to create group', err);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="create-group-modal" onClick={e => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>New Group</h2>
                    <button className="close-btn" onClick={onClose}>&times;</button>
                 </div>

                <div className="modal-body">
                    <div className="avatar-section">
                        <label className="avatar-upload">
                            <input type="file" accept="image/*" onChange={handleAvatarChange} hidden />
                            <div className="avatar-circle">
                                {avatarPreview ? (
                                    <img src={avatarPreview} alt="Group" />
                                ) : (
                                    <div className="avatar-placeholder">
                                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"></path>
                                            <circle cx="12" cy="13" r="4"></circle>
                                        </svg>
                                    </div>
                                )}
                            </div>
                            <span>Set Group Icon</span>
                        </label>
                    </div>

                    <div className="input-group">
                        <input
                            type="text"
                            placeholder="Group Name"
                            value={groupName}
                            onChange={e => setGroupName(e.target.value)}
                            className="premium-input"
                        />
                    </div>

                    <div className="participant-section">
                        <h3>Add Participants</h3>
                        <div className="selected-users">
                            {selectedUsers.map(user => (
                                <div key={user.userId} className="user-tag">
                                    <img src={user.avatarUrl || '/default-avatar.png'} alt={user.userName} />
                                    <span>{user.userName}</span>
                                    <button onClick={() => handleRemoveUser(user.userId)}>&times;</button>
                                </div>
                            ))}
                        </div>

                        <div className="search-box">
                            <input
                                type="text"
                                placeholder="Search by name or email..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="premium-input"
                            />
                            {searchResults.length > 0 && (
                                <div className="search-results">
                                    {searchResults.map(user => (
                                        <div key={user.userId} className="search-item" onClick={() => handleSelectUser(user)}>
                                            <img src={user.avatarUrl || '/default-avatar.png'} alt={user.userName} />
                                            <div className="user-info">
                                                <div className="name">{user.userName}</div>
                                                <div className="email">{user.email}</div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                <div className="modal-footer">
                    <button 
                         className="create-btn" 
                        disabled={!groupName.trim() || selectedUsers.length === 0 || loading}
                        onClick={handleCreate}
                    >
                        {loading ? 'Creating...' : 'Create Group'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CreateGroupModal;
