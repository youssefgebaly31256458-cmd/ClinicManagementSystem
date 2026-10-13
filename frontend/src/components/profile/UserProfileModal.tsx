import React, { useState } from 'react';
import { useShell } from '../../context/ShellContext';
import { authApi, usersApi } from '../../api';
import { CloseIcon } from '../common/Icons';
import { PersonAvatar } from '../common/PersonAvatar';

export const UserProfileModal: React.FC = () => {
  const {
    activeRole,
    currentUser,
    myProfile,
    refreshProfile,
    isProfileOpen,
    setIsProfileOpen,
    logout,
    userAvatar,
    setUserAvatar,
  } = useShell();

  // Password fields state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'error' | 'success'; message: string } | null>(null);

  // Edit profile state
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editAddress, setEditAddress] = useState('');
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);

  if (!isProfileOpen) return null;

  // Real account info from authenticated session / profile
  const displayName = myProfile?.name || currentUser?.name || 'Clinic User';
  const displayEmail = myProfile?.email || currentUser?.email || 'N/A';
  const displayUsername = myProfile?.username || currentUser?.name || 'user';
  const displayRole = myProfile?.roleName || currentUser?.roleName || activeRole;
  const displayPhone = myProfile?.phone || 'Not configured';
  const displayAddress = myProfile?.address || 'Not configured';

  const handleStartEditProfile = () => {
    setEditName(displayName);
    setEditPhone(myProfile?.phone || '');
    setEditEmail(myProfile?.email || currentUser?.email || '');
    setEditAddress(myProfile?.address || '');
    setIsEditingProfile(true);
    setFeedback(null);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editName.trim() || !editPhone.trim()) {
      setFeedback({ type: 'error', message: 'Name and Phone are required.' });
      return;
    }
    setIsSavingProfile(true);
    setFeedback(null);
    try {
      await usersApi.updateMyProfile({
        name: editName.trim(),
        phone: editPhone.trim(),
        email: editEmail.trim() || null,
        address: editAddress.trim() || null,
        photoUrl: myProfile?.photoUrl || userAvatar || null,
      });
      await refreshProfile();
      setIsEditingProfile(false);
      setFeedback({ type: 'success', message: 'Profile updated successfully.' });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update profile.';
      setFeedback({ type: 'error', message: msg });
    } finally {
      setIsSavingProfile(false);
    }
  };

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Reset input so selecting the same file again triggers change event
    e.target.value = '';

    // Client-side validations
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type.toLowerCase()) && !/\.(jpe?g|png|webp)$/i.test(file.name)) {
      setFeedback({ type: 'error', message: 'Only JPG, JPEG, PNG, and WEBP image files are allowed.' });
      return;
    }

    const maxSizeBytes = 5 * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      setFeedback({ type: 'error', message: 'Image file size must be less than 5 MB.' });
      return;
    }

    setIsUploadingPhoto(true);
    setFeedback(null);

    try {
      const result = await usersApi.uploadProfilePhoto(file);
      if (result.photoUrl) {
        setUserAvatar(result.photoUrl);
        await refreshProfile();
        setFeedback({ type: 'success', message: 'Profile photo updated and saved successfully.' });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to upload profile photo.';
      setFeedback({ type: 'error', message: msg });
    } finally {
      setIsUploadingPhoto(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setFeedback(null);

    if (!currentPassword) {
      setFeedback({ type: 'error', message: 'Please enter your current password.' });
      return;
    }
    if (newPassword.length < 6) {
      setFeedback({ type: 'error', message: 'New password must be at least 6 characters long.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setFeedback({ type: 'error', message: 'New passwords do not match.' });
      return;
    }

    setIsSubmittingPassword(true);
    try {
      await authApi.changePassword({ currentPassword, newPassword });
      setFeedback({ type: 'success', message: 'Password changed successfully.' });
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Password change failed.';
      setFeedback({ type: 'error', message: msg });
    } finally {
      setIsSubmittingPassword(false);
    }
  };

  return (
    <div
      className="modal-overlay"
      onClick={() => setIsProfileOpen(false)}
      role="dialog"
      aria-modal="true"
      aria-labelledby="profile-modal-title"
    >
      <div className="modal-container" onClick={e => e.stopPropagation()} style={{ maxWidth: '480px' }}>
        <div className="modal-header">
          <h2 id="profile-modal-title" className="modal-title">Staff Account Profile</h2>
          <button
            type="button"
            className="modal-close-btn"
            onClick={() => setIsProfileOpen(false)}
            aria-label="Close modal"
          >
            <CloseIcon size={18} />
          </button>
        </div>

        <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {feedback && (
            <div
              className={feedback.type === 'error' ? 'form-error-banner' : 'form-success-banner'}
              role="alert"
            >
              <span>{feedback.message}</span>
            </div>
          )}

          {/* Account Overview & Avatar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div
              style={{
                position: 'relative',
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                overflow: 'hidden',
                flexShrink: 0,
              }}
            >
              <PersonAvatar name={displayName} photoUrl={userAvatar} size="lg" />
              <label
                htmlFor="avatar-upload"
                style={{
                  position: 'absolute',
                  inset: 0,
                  backgroundColor: 'rgba(15, 23, 42, 0.65)',
                  opacity: isUploadingPhoto ? 1 : 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: isUploadingPhoto ? 'wait' : 'pointer',
                  color: '#ffffff',
                  fontSize: '10px',
                  fontWeight: 600,
                  transition: 'opacity 0.15s ease',
                  pointerEvents: isUploadingPhoto ? 'none' : 'auto',
                }}
                onMouseEnter={e => { if (!isUploadingPhoto) e.currentTarget.style.opacity = '1'; }}
                onMouseLeave={e => { if (!isUploadingPhoto) e.currentTarget.style.opacity = '0'; }}
              >
                {isUploadingPhoto ? 'Saving...' : 'Upload'}
              </label>
              <input
                id="avatar-upload"
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleAvatarChange}
                disabled={isUploadingPhoto}
                style={{ display: 'none' }}
              />
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 700, margin: 0, color: 'var(--color-text)' }}>
                  {displayName}
                </h3>
                <span className="status-chip status-chip--blue">
                  {displayRole}
                </span>
              </div>
              <p style={{ margin: '2px 0 0 0', fontSize: '12px', color: 'var(--color-text-muted)' }}>
                {displayEmail} • @{displayUsername}
              </p>
              <p style={{ margin: '2px 0 0 0', fontSize: '11px', color: 'var(--color-text-muted)' }}>
                Phone: {displayPhone} | Address: {displayAddress}
              </p>
            </div>
          </div>

          {/* Edit Profile Section */}
          {!isEditingProfile ? (
            <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
              <button
                type="button"
                className="btn btn--secondary btn--sm"
                onClick={handleStartEditProfile}
              >
                Edit Profile Details
              </button>
            </div>
          ) : (
            <form onSubmit={handleSaveProfile} style={{ border: '1px solid #cbd5e1', borderRadius: '8px', padding: '14px', backgroundColor: '#f8fafc' }}>
              <h4 style={{ fontSize: '12px', fontWeight: 700, margin: '0 0 10px 0', color: 'var(--color-text)' }}>Edit Profile Information</h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div className="form-group">
                  <label className="form-label">Full Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editName}
                    onChange={e => setEditName(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editPhone}
                    onChange={e => setEditPhone(e.target.value)}
                    required
                  />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '8px' }}>
                <div className="form-group">
                  <label className="form-label">Email</label>
                  <input
                    type="email"
                    className="form-input"
                    value={editEmail}
                    onChange={e => setEditEmail(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Address</label>
                  <input
                    type="text"
                    className="form-input"
                    value={editAddress}
                    onChange={e => setEditAddress(e.target.value)}
                  />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '10px' }}>
                <button
                  type="button"
                  className="btn btn--secondary btn--sm"
                  onClick={() => setIsEditingProfile(false)}
                  disabled={isSavingProfile}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn--primary btn--sm"
                  disabled={isSavingProfile}
                >
                  {isSavingProfile ? 'Saving...' : 'Save Profile'}
                </button>
              </div>
            </form>
          )}

          <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '4px 0' }} />

          {/* Change Password Form */}
          <form onSubmit={handlePasswordChange} style={{ border: '1px solid #cbd5e1', borderRadius: '8px', padding: '14px', backgroundColor: '#f8fafc' }}>
            <h4 style={{ fontSize: '13px', fontWeight: 600, margin: '0 0 10px 0', color: 'var(--color-text)' }}>
              Change Account Password
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div className="form-group">
                <label className="form-label">Current Password</label>
                <input
                  type="password"
                  className="form-input"
                  value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  disabled={isSubmittingPassword}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">New Password</label>
                <input
                  type="password"
                  className="form-input"
                  value={newPassword}
                  onChange={e => setNewPassword(e.target.value)}
                  placeholder="Enter new password (min. 6 characters)"
                  disabled={isSubmittingPassword}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Confirm New Password</label>
                <input
                  type="password"
                  className="form-input"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Re-type new password"
                  disabled={isSubmittingPassword}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
                <button
                  type="submit"
                  className="btn btn--secondary btn--sm"
                  disabled={isSubmittingPassword}
                >
                  {isSubmittingPassword ? 'Updating...' : 'Update Password'}
                </button>
              </div>
            </div>
          </form>
        </div>

        <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
          <button
            type="button"
            className="btn btn--danger btn--sm"
            onClick={logout}
          >
            Sign Out
          </button>
          <button
            type="button"
            className="btn btn--secondary btn--sm"
            onClick={() => setIsProfileOpen(false)}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
