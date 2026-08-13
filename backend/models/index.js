const sequelize = require('../config/db');
const User = require('./User');
const Follower = require('./Follower');
const Post = require('./Post');
const Like = require('./Like');
const Comment = require('./Comment');
const Group = require('./Group');
const GroupMember = require('./GroupMember');
const ActivityLog = require('./ActivityLog');
const Notification = require('./Notification');
const FitnessProfile = require('./FitnessProfile');
const ProgressLog = require('./ProgressLog');
const { Challenge, UserChallenge } = require('./Challenge');
const { Achievement, UserAchievement } = require('./Achievement');
const TrainingSession = require('./TrainingSession');

// Relations: Users & Followers
User.belongsToMany(User, { 
  as: 'Followers', 
  through: Follower, 
  foreignKey: 'following_id', 
  otherKey: 'follower_id' 
});
User.belongsToMany(User, { 
  as: 'Following', 
  through: Follower, 
  foreignKey: 'follower_id', 
  otherKey: 'following_id' 
});

// Relations: Users & Posts
User.hasMany(Post, { foreignKey: 'user_id', onDelete: 'CASCADE' });
Post.belongsTo(User, { foreignKey: 'user_id' });

// Relations: Posts & Likes
Post.hasMany(Like, { foreignKey: 'post_id', onDelete: 'CASCADE' });
Like.belongsTo(Post, { foreignKey: 'post_id' });
User.hasMany(Like, { foreignKey: 'user_id', onDelete: 'CASCADE' });
Like.belongsTo(User, { foreignKey: 'user_id' });

// Relations: Posts & Comments
Post.hasMany(Comment, { foreignKey: 'post_id', onDelete: 'CASCADE' });
Comment.belongsTo(Post, { foreignKey: 'post_id' });
User.hasMany(Comment, { foreignKey: 'user_id', onDelete: 'CASCADE' });
Comment.belongsTo(User, { foreignKey: 'user_id' });

// Relations: Groups & Creator
User.hasMany(Group, { foreignKey: 'creator_id', as: 'CreatedGroups', onDelete: 'CASCADE' });
Group.belongsTo(User, { foreignKey: 'creator_id', as: 'Creator' });

// Relations: Groups & Members
Group.belongsToMany(User, { 
  through: GroupMember, 
  foreignKey: 'group_id', 
  otherKey: 'user_id', 
  as: 'Members' 
});
User.belongsToMany(Group, { 
  through: GroupMember, 
  foreignKey: 'user_id', 
  otherKey: 'group_id', 
  as: 'JoinedGroups' 
});

Group.hasMany(GroupMember, { foreignKey: 'group_id', onDelete: 'CASCADE' });
GroupMember.belongsTo(Group, { foreignKey: 'group_id' });

User.hasMany(GroupMember, { foreignKey: 'user_id', onDelete: 'CASCADE' });
GroupMember.belongsTo(User, { foreignKey: 'user_id' });

// Relations: Activity Logs
User.hasMany(ActivityLog, { foreignKey: 'user_id', onDelete: 'SET NULL' });
ActivityLog.belongsTo(User, { foreignKey: 'user_id' });

// Relations: Notifications
User.hasMany(Notification, { foreignKey: 'user_id', onDelete: 'CASCADE' });
Notification.belongsTo(User, { foreignKey: 'user_id' });

Notification.belongsTo(User, { foreignKey: 'sender_id', as: 'Sender' });
Notification.belongsTo(Post, { foreignKey: 'post_id', onDelete: 'CASCADE' });
Notification.belongsTo(Group, { foreignKey: 'group_id', onDelete: 'CASCADE' });

// Relations: User & FitnessProfile
User.hasOne(FitnessProfile, { foreignKey: 'user_id', onDelete: 'CASCADE', as: 'FitnessProfile' });
FitnessProfile.belongsTo(User, { foreignKey: 'user_id' });

// Relations: User & ProgressLog
User.hasMany(ProgressLog, { foreignKey: 'user_id', onDelete: 'CASCADE' });
ProgressLog.belongsTo(User, { foreignKey: 'user_id' });

// Relations: User & TrainingSession
User.hasMany(TrainingSession, { foreignKey: 'user_id', onDelete: 'CASCADE' });
TrainingSession.belongsTo(User, { foreignKey: 'user_id' });

// Relations: User & Challenges
User.belongsToMany(Challenge, { through: UserChallenge, foreignKey: 'user_id', otherKey: 'challenge_id' });
Challenge.belongsToMany(User, { through: UserChallenge, foreignKey: 'challenge_id', otherKey: 'user_id' });
User.hasMany(UserChallenge, { foreignKey: 'user_id' });
UserChallenge.belongsTo(User, { foreignKey: 'user_id' });
Challenge.hasMany(UserChallenge, { foreignKey: 'challenge_id' });
UserChallenge.belongsTo(Challenge, { foreignKey: 'challenge_id' });

// Relations: User & Achievements
User.belongsToMany(Achievement, { through: UserAchievement, foreignKey: 'user_id', otherKey: 'achievement_id' });
Achievement.belongsToMany(User, { through: UserAchievement, foreignKey: 'achievement_id', otherKey: 'user_id' });
User.hasMany(UserAchievement, { foreignKey: 'user_id' });
UserAchievement.belongsTo(User, { foreignKey: 'user_id' });
Achievement.hasMany(UserAchievement, { foreignKey: 'achievement_id' });
UserAchievement.belongsTo(Achievement, { foreignKey: 'achievement_id' });

const CalendarEvent = require('./CalendarEvent');

// Relations: User & CalendarEvents
User.hasMany(CalendarEvent, { foreignKey: 'user_id', onDelete: 'CASCADE' });
CalendarEvent.belongsTo(User, { foreignKey: 'user_id' });

const PasswordReset = require('./PasswordReset');
const SurveyResponse = require('./SurveyResponse');

// Relations: User & SurveyResponse
User.hasOne(SurveyResponse, { foreignKey: 'user_id', onDelete: 'CASCADE', as: 'SurveyResponse' });
SurveyResponse.belongsTo(User, { foreignKey: 'user_id' });

module.exports = {
  sequelize,
  User,
  Follower,
  Post,
  Like,
  Comment,
  Group,
  GroupMember,
  ActivityLog,
  Notification,
  FitnessProfile,
  ProgressLog,
  Challenge,
  UserChallenge,
  Achievement,
  UserAchievement,
  TrainingSession,
  CalendarEvent,
  PasswordReset,
  SurveyResponse
};
